import { v4 as uuidv4 } from 'uuid'
import {
  Course,
  Category,
  Subsection,
  SpecialRule,
  Prerequisite,
  Requirement,
  CourseData,
  ParsedCourseData,
  CourseLevel,
  SpecialRuleType
} from '../types'
import { getLogger } from './logger'

// Updated regex to handle both traditional and new course formats:
// Traditional: SIA-RMN-0001, GPU-ALC-0010, SIA-SRN-20W
// New formats: LU-XI-CZ01, MU-PLSC-02, RMACA-AOPA-E07, RMACA-RMAIA-07D
export const COURSE_CODE_REGEX = /([A-Z]{2,5}-[A-Z0-9]{2,5}-(?:[A-Z]*\d+[A-Z]*|\d+[A-Z]*|\d+))/g
const LEVEL_REGEX = /-(\d{2,4})([ACDW])/

export interface DepartmentMapping {
  department: string
  schoolNames: string[]
}

enum Section {
  SpaceWarfarePin = 'Space Warfare Pin',
  DepartmentMappings = 'Department Mappings',
  CourseSeriesMappings = 'Course Series Mappings'
}

const getSection = (title: string): Section | null => {
  if (title.toLowerCase().includes(Section.SpaceWarfarePin.toLowerCase())) {
    return Section.SpaceWarfarePin
  }
  if (title.toLowerCase().includes(Section.DepartmentMappings.toLowerCase())) {
    return Section.DepartmentMappings
  }
  if (title.toLowerCase().includes(Section.CourseSeriesMappings.toLowerCase())) {
    return Section.CourseSeriesMappings
  }
  return null
}

export class CourseParser {
  private content: string
  private courses: Map<string, Course>
  private categories: Category[]
  private specialRules: SpecialRule[]
  private departmentMappings: Map<string, string[]>
  private seriesMappings: Map<string, string>

  constructor(markdownContent: string) {
    this.content = markdownContent
    this.courses = new Map()
    this.categories = []
    this.specialRules = []
    this.departmentMappings = new Map()
    this.seriesMappings = new Map()
  }

  public parse(): CourseData {
    const lines = this.content.split('\n')
    let currentSection: Category | null = null
    let currentSubsection: Subsection | null = null
    let inTable = false
    let currentSpecialSection: Section | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Skip empty lines
      if (!line) {
        continue
      }

      // Parse headers
      if (line.startsWith('#')) {
        const level = (line.match(/^#+/) || [''])[0].length
        const title = line.replace(/^#+\s*/, '')

        if (level === 1) {
          // Check for Space Warfare Pin at level 1
          if (getSection(title)) {
            currentSpecialSection = getSection(title)
          }
        } else if (level === 2) {
          currentSection = this.createSection(title)
          currentSubsection = null
          if (getSection(title)) {
            currentSpecialSection = getSection(title)
          } else {
            // Only reset special section if we're not in Space Warfare Pin section
            // Space Warfare Pin is typically a level 1 header and should maintain state
            if (currentSpecialSection !== Section.SpaceWarfarePin) {
              currentSpecialSection = null
            }
          }
        } else if (level === 3) {
          if (currentSection) {
            currentSubsection = this.createSubsection(title, currentSection)
          }
        } else if (level === 4) {
          if (currentSection) {
            currentSubsection = this.createSubsection(title, currentSection)
          }
        }

        inTable = false
        continue
      }

      // Handle table headers
      if (line.includes('Course Name') && line.includes('Course Number')) {
        inTable = true
        continue
      }

      // Handle department mapping table headers
      if (
        currentSpecialSection === Section.DepartmentMappings &&
        line.includes('Department') &&
        line.includes('School Names')
      ) {
        inTable = true
        continue
      }

      // Skip table separator
      if (line.match(/^\|[\s\-:|]+\|$/)) {
        continue
      }

      // Parse table rows
      if (inTable && line.startsWith('|') && line.endsWith('|')) {
        if (currentSpecialSection === Section.DepartmentMappings) {
          this.parseDepartmentMappingRow(line)
        } else if (currentSpecialSection === Section.CourseSeriesMappings) {
          this.parseCourseSeriesMappingRow(line)
        } else {
          this.parseTableRow(line, currentSection, currentSubsection)
        }
        continue
      }

      // Handle Space Warfare Pin special rules
      if (currentSpecialSection === Section.SpaceWarfarePin) {
        if (line.includes('|') && !line.includes('---')) {
          this.parseSpaceWarfarePinTable(line, lines, i)
        }
      }

      // Handle course series mapping table headers
      if (line.includes('Series Prefix') && line.includes('Display Name')) {
        inTable = true
        continue
      }
    }

    return {
      courses: Array.from(this.courses.values()),
      categories: this.categories,
      specialRules: this.specialRules,
      departmentMappings: this.departmentMappings,
      seriesMappings: this.seriesMappings
    }
  }

  /**
   * Helper function to parse table row cells from markdown
   */
  private parseTableCells(line: string): string[] {
    return line
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0)
  }

  private createSection(title: string): Category {
    const section: Category = {
      id: uuidv4(),
      title,
      subsections: []
    }
    this.categories.push(section)
    return section
  }

  private createSubsection(title: string, parentSection: Category): Subsection {
    const subsection: Subsection = {
      id: uuidv4(),
      title,
      parentId: parentSection.id
    }

    parentSection.subsections.push(subsection)
    return subsection
  }

  private parseDepartmentMappingRow(line: string): void {
    const cells = this.parseTableCells(line)

    if (cells.length >= 2) {
      const department = cells[0]
      const schoolNamesText = cells[1]

      // Skip header rows
      if (department === 'Department' || schoolNamesText === 'School Names') {
        return
      }

      // Parse comma-separated school names
      const schoolNames = schoolNamesText
        .split(',')
        .map((name) => name.trim().toLowerCase())
        .filter((name) => name.length > 0)

      this.departmentMappings.set(department.toLowerCase(), schoolNames)
    }
  }

  private parseCourseSeriesMappingRow(line: string): void {
    const cells = this.parseTableCells(line)

    if (cells.length >= 2) {
      const seriesPrefix = cells[0]
      const displayName = cells[1]

      this.seriesMappings.set(seriesPrefix, displayName)
    }
  }

  private parseTableRow(line: string, section: Category | null, subsection: Subsection | null): void {
    const cells = this.parseTableCells(line)

    if (cells.length >= 2) {
      const courseName = cells[0]
      const rawCourseNumber = cells[1]
      const prerequisites = cells[2] || ''

      // Skip header rows
      if (courseName === 'Course Name' || rawCourseNumber === 'Course Number') {
        return
      }

      // Extract clean course code from the raw course number field
      // This handles cases like "SIA-SRN-20W Project" -> "SIA-SRN-20W"
      // Updated to handle new formats: LU-XI-CZ01, MU-PLSC-02, RMACA-AOPA-E07, etc.
      const courseCodeRegex = /([A-Z]{2,5}-[A-Z0-9]{2,5}-(?:[A-Z]*\d+[A-Z]*|\d+[A-Z]*|\d+))/
      const courseCodeMatch = rawCourseNumber.match(courseCodeRegex)
      const courseNumber = courseCodeMatch ? courseCodeMatch[1] : rawCourseNumber.trim()

      // Skip invalid course codes
      if (!courseNumber || courseNumber.length === 0) {
        return
      }

      const course: Course = {
        id: uuidv4(),
        name: courseName,
        code: courseNumber,
        prerequisites: this.parsePrerequisites(prerequisites),
        section: section?.title || '',
        subsection: subsection?.title || '',
        sectionId: section?.id || '',
        subsectionId: subsection?.id || '',
        completed: false,
        available: false,
        level: this.extractCourseLevel(courseNumber)
      }

      this.courses.set(courseNumber, course)
    }
  }

  private parsePrerequisites(prereqString: string): Prerequisite[] {
    if (!prereqString || prereqString.trim() === '') {
      return []
    }

    const prerequisites: Prerequisite[] = []

    // Check for complex requirements first (like Navy Counselor courses)
    if (this.hasComplexRequirements(prereqString)) {
      const complexReqs = this.parseComplexCourseRequirements(prereqString)
      prerequisites.push(...complexReqs)
      return prerequisites
    }

    // Handle OR conditions second
    if (prereqString.toLowerCase().includes(' or ')) {
      const orParts = prereqString.split(/\s+or\s+/i).map((part) => part.trim())

      if (orParts.length > 1) {
        // Create alternative group
        const alternatives: Prerequisite[] = []

        orParts.forEach((part) => {
          let match
          const partMatches = []
          const regex = new RegExp(COURSE_CODE_REGEX.source, 'g')
          while ((match = regex.exec(part)) !== null) {
            partMatches.push(match[1])
          }

          if (partMatches.length > 0) {
            // Handle each course code in this alternative
            partMatches.forEach((code) => {
              alternatives.push({
                type: 'course',
                code: code.trim(),
                required: true,
                level: this.extractCourseLevel(code)
              })
            })
          }
        })

        if (alternatives.length > 1) {
          prerequisites.push({
            type: 'alternative_group',
            description: prereqString,
            required: true,
            alternativePrerequisites: alternatives
          })
          return prerequisites
        }
      }
    }

    // Handle course code prerequisites (no OR condition)
    let match
    const matches = []
    const regex = new RegExp(COURSE_CODE_REGEX.source, 'g')
    while ((match = regex.exec(prereqString)) !== null) {
      matches.push(match[1])
    }

    if (matches.length > 0) {
      matches.forEach((code) => {
        prerequisites.push({
          type: 'course',
          code: code.trim(),
          required: true,
          level: this.extractCourseLevel(code)
        })
      })
    }

    return prerequisites
  }

  private parseSpaceWarfarePinTable(line: string, allLines: string[], currentIndex: number): void {
    // Handle the complex Space Warfare Pin table structure
    if (line.includes('|') && !line.includes('---') && !line.includes('Course')) {
      const cells = line
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0)

      // Skip header rows but process content rows
      if (cells.length >= 2) {
        // Skip pure header rows (that just contain "RMN OSWP", "RMMC OSWP", etc.)
        const isHeaderRow =
          cells[0] === 'RMN OSWP' || cells[0] === 'RMN ESWP' || cells[1] === 'RMMC OSWP' || cells[1] === 'RMMC ESWP'

        if (!isHeaderRow && (cells[0].length > 20 || cells[1].length > 20)) {
          // Determine if this is OSWP or ESWP based on context
          const isOfficer = this.isOfficerSection(allLines, currentIndex)
          const type: SpecialRuleType = isOfficer ? 'OSWP' : 'ESWP'

          // Parse RMN requirements (first column)
          if (cells[0] && cells[0].length > 20) {
            const requirements = this.parseSpaceWarfarePinRequirements(cells[0], type)
            this.specialRules.push({
              id: uuidv4(),
              type,
              name: `RMN ${type}`,
              description: cells[0],
              requirements,
              branch: 'RMN',
              rank: isOfficer ? 'Officer' : 'Enlisted'
            })
          }

          // Parse RMMC requirements (second column)
          if (cells[1] && cells[1].length > 20) {
            const requirements = this.parseSpaceWarfarePinRequirements(cells[1], type)
            this.specialRules.push({
              id: uuidv4(),
              type,
              name: `RMMC ${type}`,
              description: cells[1],
              requirements,
              branch: 'RMMC',
              rank: isOfficer ? 'Officer' : 'Enlisted'
            })
          }
        }
      }
    }
  }

  private isOfficerSection(lines: string[], currentIndex: number): boolean {
    // Look backwards to find the section header
    for (let i = currentIndex; i >= 0; i--) {
      const line = lines[i].toLowerCase().trim()
      if (line.includes('officer') || line.startsWith('## officer') || line.startsWith('### officer')) {
        return true
      }
      if (line.includes('enlisted') || line.startsWith('## enlisted') || line.startsWith('### enlisted')) {
        return false
      }
      // Don't break on section headers, keep looking
      if (line.startsWith('# space warfare pin')) {
        break
      }
    }

    return true // Default to officer if unclear
  }

  private parseSpaceWarfarePinRequirements(requirementText: string, pinType: SpecialRuleType): Requirement[] {
    const requirements: Requirement[] = []

    // Extract specific course codes first
    let match
    const courses = []
    const regex = new RegExp(COURSE_CODE_REGEX.source, 'g')
    while ((match = regex.exec(requirementText)) !== null) {
      courses.push(match[1])
    }

    // Add course requirements
    courses.forEach((code) => {
      requirements.push({
        type: 'course',
        code,
        required: true,
        level: this.extractCourseLevel(code)
      })
    })

    // Parse department choice requirements based on pin type
    if (pinType === 'OSWP') {
      // OSWP: "at least 1 'D' level from four (4) of the five following departments"
      if (requirementText.toLowerCase().includes('at least 1') && requirementText.includes('four')) {
        requirements.push({
          type: 'department_choice',
          minimum: 4,
          totalOptions: 5,
          level: 'D',
          departments: ['Astrogation', 'Flight Operations', 'Tactical', 'Engineering', 'Communications'],
          description: "At least 1 'D' level from 4 of 5 departments",
          required: true
        })
      }
    } else if (pinType === 'ESWP') {
      // ESWP: "at least 1 'C' level from three (3) of the following departments"
      if (requirementText.toLowerCase().includes('at least 1') && requirementText.includes('three')) {
        requirements.push({
          type: 'department_choice',
          minimum: 3,
          totalOptions: 5,
          level: 'C',
          departments: ['Astrogation', 'Flight Operations', 'Tactical', 'Engineering', 'Communications'],
          description: "At least 1 'C' level from 3 of 5 departments",
          required: true
        })
      }
    }

    return requirements
  }

  private parseComplexRequirements(requirementText: string): Requirement[] {
    const requirements: Requirement[] = []

    // Extract course codes
    let match
    const courses = []
    const regex = new RegExp(COURSE_CODE_REGEX.source, 'g')
    while ((match = regex.exec(requirementText)) !== null) {
      courses.push(match[1])
    }

    courses.forEach((code) => {
      requirements.push({
        type: 'course',
        code,
        required: true,
        level: this.extractCourseLevel(code)
      })
    })

    // Parse department choice requirements
    if (requirementText.toLowerCase().includes('at least')) {
      const match = requirementText.match(/at least (\d+).*?(?:from|of).*?(\d+|three|four|five)/i)
      if (match) {
        const minimum = parseInt(match[1]) || this.parseWordNumber(match[1])
        const total = parseInt(match[2]) || this.parseWordNumber(match[2])

        // Extract departments mentioned
        const departments = this.extractDepartments(requirementText)

        requirements.push({
          type: 'department_choice',
          minimum,
          totalOptions: total,
          departments,
          description: requirementText,
          required: true
        })
      }
    }

    // Parse level requirements (e.g., "'C' level", "'D' level")
    const levelMatch = requirementText.match(/'([ACDW])'\s*level/gi)
    if (levelMatch) {
      levelMatch.forEach((match) => {
        const level = match.match(/'([ACDW])'/i)?.[1] as CourseLevel
        if (level) {
          requirements.push({
            type: 'level_requirement',
            level,
            description: `${level} level course required`,
            required: true
          })
        }
      })
    }

    return requirements
  }

  private extractDepartments(text: string): string[] {
    const departments: string[] = []

    // Get unique department names from parsed course sections and subsections
    const departmentKeywords = this.getUniqueDepartments()

    departmentKeywords.forEach((dept) => {
      if (text.toLowerCase().includes(dept.toLowerCase())) {
        departments.push(dept)
      }
    })

    return departments
  }

  private getUniqueDepartments(): string[] {
    const departments = new Set<string>()

    // Extract department names from course sections and subsections
    this.courses.forEach((course) => {
      // Add section name as potential department
      if (course.section) {
        departments.add(course.section)
      }

      // Add subsection name as potential department (common for specialized areas)
      if (course.subsection) {
        departments.add(course.subsection)
      }
    })

    return Array.from(departments).sort()
  }

  private parseComplexCourseRequirements(prereqString: string): Prerequisite[] {
    const prerequisites: Prerequisite[] = []

    // Extract specific course codes first
    let match
    const courses = []
    const regex = new RegExp(COURSE_CODE_REGEX.source, 'g')
    while ((match = regex.exec(prereqString)) !== null) {
      courses.push(match[1])
    }

    // Add course requirements
    courses.forEach((code) => {
      prerequisites.push({
        type: 'course',
        code: code.trim(),
        required: true,
        level: this.extractCourseLevel(code)
      })
    })

    // Parse complex requirements like "5 A courses from any of the following departments"
    const complexMatch = prereqString.match(
      /(\d+)\s+([ACDW])\s+(courses?)\s+from\s+any\s+of\s+the\s+(?:following\s+)?departments?:?\s*(.+)/i
    )
    if (complexMatch) {
      const [, countStr, level, , departmentsText] = complexMatch
      const count = parseInt(countStr)

      // Extract departments from the text
      let departments: string[] = []

      if (departmentsText.toLowerCase().includes('listed above')) {
        // For "departments listed above", we need to look at previous Navy Counselor courses
        // Use the same departments as the first Navy Counselor course
        departments = ['Astrogation', 'Tactical', 'Command', 'Communications', 'Engineering', 'Logistics', 'Medical']
      } else {
        // Parse departments from the text
        departments = this.parseDepartmentList(departmentsText)
      }

      prerequisites.push({
        type: 'department_choice',
        description: prereqString,
        required: true,
        minimum: count,
        level: level as CourseLevel,
        departments
      })
    }

    return prerequisites
  }

  private parseDepartmentList(departmentsText: string): string[] {
    const departments: string[] = []

    // Split by common separators and clean up
    const parts = departmentsText
      .split(/[,\s]+(?:or|and)?\s*|[,\s]+/i)
      .map((part) => part.trim())
      .filter((part) => part.length > 0 && part !== 'or' && part !== 'and')

    // Common department name mappings
    const departmentMap: { [key: string]: string } = {
      astrogation: 'Astrogation',
      tactical: 'Tactical',
      command: 'Command',
      communications: 'Communications',
      engineering: 'Engineering',
      logistics: 'Logistics',
      medical: 'Medical',
      'flight operations': 'Flight Operations'
    }

    parts.forEach((part) => {
      const normalized = part.toLowerCase().replace(/[^a-z\s]/g, '')
      if (departmentMap[normalized]) {
        departments.push(departmentMap[normalized])
      } else {
        // Fallback: capitalize first letter of each word
        const capitalized = part.replace(/\b\w/g, (l) => l.toUpperCase()).replace(/[^a-zA-Z\s]/g, '')
        if (capitalized.length > 2) {
          departments.push(capitalized)
        }
      }
    })

    return Array.from(new Set(departments)) // Remove duplicates
  }

  private extractCourseLevel(courseCode: string | undefined): CourseLevel | undefined {
    if (!courseCode) {
      return undefined
    }

    // First try the traditional format: -(\d{2,4})([ACDW])
    const traditionalMatch = courseCode.match(LEVEL_REGEX)
    if (traditionalMatch) {
      return traditionalMatch[2] as CourseLevel
    }

    // Handle new formats like RMACA-AOPA-E07, RMACA-RMAIA-07D
    // Extract the last part after the final dash
    const parts = courseCode.split('-')
    if (parts.length >= 3) {
      const lastPart = parts[parts.length - 1]

      // Check for letter at the beginning (E07, R09)
      const prefixMatch = lastPart.match(/^([ACDW])\d+$/)
      if (prefixMatch) {
        return prefixMatch[1] as CourseLevel
      }

      // Check for letter at the end (07D)
      const suffixMatch = lastPart.match(/^\d+([ACDW])$/)
      if (suffixMatch) {
        return suffixMatch[1] as CourseLevel
      }
    }

    return undefined
  }

  private parseWordNumber(word: string): number {
    const numberWords: { [key: string]: number } = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10
    }
    return numberWords[word.toLowerCase()] || 0
  }

  private hasComplexRequirements(prereqString: string): boolean {
    const lowerCase = prereqString.toLowerCase()
    // Check for patterns like "5 A courses from any of the following departments"
    // or "2 C courses from any of the departments listed above"
    return (
      (lowerCase.includes('courses from any of') || lowerCase.includes('course from any of')) &&
      (lowerCase.includes('departments') || lowerCase.includes('department')) &&
      /\d+\s+[acdw]\s+(courses?)/i.test(prereqString)
    )
  }
}

export function parseCourseData(markdownContent: string): ParsedCourseData {
  const parser = new CourseParser(markdownContent)
  const data = parser.parse()

  // Debug logging (development only)

  getLogger().group('🔍 Course Data Parser Debug')
  getLogger().log('📄 Markdown length:', markdownContent.length)
  getLogger().log('📚 Total courses parsed:', data.courses.length)
  getLogger().log('📋 Categories parsed:', data.categories.length)
  getLogger().log('⚡ Special rules parsed:', data.specialRules.length)
  getLogger().log('🗂️ Department mappings parsed:', data.departmentMappings?.size || 0)

  // Log Space Warfare Pin related courses
  const swpCourses = data.courses.filter((course) => {
    const code = course.code
    return (
      code === 'SIA-SRN-31C' ||
      code === 'SIA-SRN-01C' ||
      code === 'SIA-SRN-01A' ||
      code === 'SIA-SRN-04A' ||
      code.match(/^SIA-SRN-(05|06|07|35|08|09|10|27|28|29|32|14|15|16|17|18|19|11|12|13)[CD]$/)
    )
  })
  getLogger().log('🏅 Space Warfare Pin related courses found:', swpCourses.length)
  getLogger().table(swpCourses.map((c) => ({ code: c.code, name: c.name })))

  // Log special rules
  if (data.specialRules.length > 0) {
    getLogger().log('📜 Special Rules:')
    data.specialRules.forEach((rule) => {
      getLogger().log(`  - ${rule.name}: ${rule.description}`)
    })
  }

  getLogger().groupEnd()

  // Create additional maps and dependency graph
  const courseMap = new Map<string, Course>()
  const categoryMap = new Map<string, Category>()
  const dependencyGraph = new Map<string, string[]>()

  data.courses.forEach((course) => {
    courseMap.set(course.code, course)

    // Build dependency graph
    const dependencies: string[] = []
    course.prerequisites.forEach((prereq) => {
      if (prereq.type === 'course' && prereq.code) {
        dependencies.push(prereq.code)
      }
    })
    dependencyGraph.set(course.code, dependencies)
  })

  data.categories.forEach((category) => {
    categoryMap.set(category.id, category)
  })

  return {
    ...data,
    courseMap,
    categoryMap,
    dependencyGraph,
    seriesMappings: data.seriesMappings || new Map()
  }
}
