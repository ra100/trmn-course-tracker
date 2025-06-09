// Enhanced course code regex pattern (same as courseParser but without global flag)
// Supports traditional and new formats: SIA-RMN-0001, LU-XI-CZ01, RMACA-AOPA-E07, etc.
const MEDUSA_COURSE_CODE_REGEX = /([A-Z]{2,5}-[A-Z0-9]{2,5}-(?:[A-Z]*\d+[A-Z]*|\d+[A-Z]*|\d+))/

export interface MedusaCourse {
  courseCode: string
  courseName: string
  grade: string
  completionDate: string
  category: string
}

export interface MedusaParseResult {
  courses: MedusaCourse[]
  parseDate: Date
  errors: string[]
  importStats?: {
    imported: number
    trackable: number
    alreadyCompleted: number
  }
}

/**
 * Parse HTML content from medusa.trmn.org user page to extract completed courses
 */
export function parseMedusaHTML(htmlContent: string): MedusaParseResult {
  const result: MedusaParseResult = {
    courses: [],
    parseDate: new Date(),
    errors: []
  }

  try {
    // Create a temporary DOM parser
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')

    // Find all tab panels that contain course data
    const tabPanels = doc.querySelectorAll('[role="tabpanel"]')

    tabPanels.forEach((panel) => {
      const panelId = panel.getAttribute('id')
      if (!panelId) {
        return
      }

      // Determine the category based on panel ID with enhanced mapping
      const category = getCategoryFromPanelId(panelId)

      // Find all course rows in this panel
      const courseRows = panel.querySelectorAll('.row.zebra-odd, .row.zebra-even')

      courseRows.forEach((row) => {
        try {
          const columns = row.querySelectorAll('.col-sm-6, .col-sm-1, .col-sm-3')

          if (columns.length >= 3) {
            const courseNameElement = columns[0]
            const gradeElement = columns[1]
            const dateElement = columns[2]

            const courseNameText = courseNameElement.textContent?.trim() || ''
            const gradeText = gradeElement.textContent?.trim() || ''
            const dateText = dateElement.textContent?.trim() || ''

            // Extract course code using enhanced pattern
            const courseCode = extractCourseCode(courseNameText)

            if (courseCode && courseNameText && gradeText && dateText) {
              result.courses.push({
                courseCode,
                courseName: courseNameText,
                grade: gradeText,
                completionDate: dateText,
                category
              })
            }
          }
        } catch (error) {
          result.errors.push(
            `Error parsing course row in ${category}: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        }
      })
    })

    // Also search for courses in any elements with course-like patterns
    // This catches courses that might be in unexpected locations
    const allTextElements = doc.querySelectorAll('*')
    const foundCoursesByText = new Set<string>()

    allTextElements.forEach((element) => {
      const text = element.textContent?.trim() || ''
      const match = text.match(MEDUSA_COURSE_CODE_REGEX)
      if (match && match[1]) {
        const courseCode = match[1]
        if (!result.courses.some((course) => course.courseCode === courseCode)) {
          foundCoursesByText.add(courseCode)
        }
      }
    })

    // Add any additional courses found by text pattern (with generic category)
    foundCoursesByText.forEach((courseCode) => {
      result.courses.push({
        courseCode,
        courseName: `Course ${courseCode}`,
        grade: 'Unknown',
        completionDate: 'Unknown',
        category: 'Other/Unknown'
      })
    })

    if (result.courses.length === 0) {
      result.errors.push(
        'No courses found in the provided HTML. Make sure you copied the complete Academic Record tab content.'
      )
    }
  } catch (error) {
    result.errors.push(`Error parsing HTML: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}

/**
 * Map panel IDs to category names, supporting all known and unknown panels
 */
function getCategoryFromPanelId(panelId: string): string {
  const categoryMap: { [key: string]: string } = {
    RMN: 'RMN',
    RMNSpeciality: 'RMN Speciality',
    RMACSSpecialty: 'RMACS Specialty',
    MannheimUniversity: 'Mannheim University',
    LysanderUniversity: 'Lysander University',
    RMACA: 'Royal Manticoran Aerospace Command Academy',
    GPU: 'Grayson Protector University',
    SIA: 'Saganami Island Academy'
    // Add more known mappings as needed
  }

  // Return mapped category or create a human-readable category from panelId
  if (categoryMap[panelId]) {
    return categoryMap[panelId]
  }

  // For unknown panels, create a readable category name
  // Convert camelCase or acronyms to readable format
  const readable = panelId
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim()

  return readable || 'Unknown Category'
}

/**
 * Extract course code from course name text using enhanced patterns
 * Supports all formats: traditional (SIA-RMN-0001), universities (LU-XI-CZ01),
 * RMACA (RMACA-AOPA-E07), and any other matching the pattern
 */
function extractCourseCode(courseName: string): string | null {
  const match = courseName.match(MEDUSA_COURSE_CODE_REGEX)
  return match ? match[1] : null
}

/**
 * Convert MedusaCourse data to course codes for the application
 */
export function extractCompletedCourseCodes(medusaCourses: MedusaCourse[]): string[] {
  return medusaCourses.map((course) => course.courseCode).filter((code) => code !== null && code !== '') as string[]
}

/**
 * Validate that the HTML contains expected medusa.trmn.org structure
 */
export function validateMedusaHTML(htmlContent: string): { valid: boolean; reason?: string } {
  // Check for key indicators of medusa.trmn.org structure
  const indicators = ['medusa.trmn.org', 'Academic Record', 'Service Record', 'col-sm-6', 'zebra-odd']

  const foundIndicators = indicators.filter((indicator) => htmlContent.includes(indicator))

  if (foundIndicators.length < 3) {
    return {
      valid: false,
      reason:
        'The provided HTML does not appear to be from medusa.trmn.org user page. Please make sure you copied the complete page source.'
    }
  }

  return { valid: true }
}
