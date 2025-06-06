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
      if (!panelId) return

      // Determine the category based on panel ID
      let category = ''
      if (panelId === 'RMN') {
        category = 'RMN'
      } else if (panelId === 'RMNSpeciality') {
        category = 'RMN Speciality'
      } else if (panelId === 'RMACSSpecialty') {
        category = 'RMACS Specialty'
      } else if (panelId === 'MannheimUniversity') {
        category = 'Mannheim University'
      } else {
        // Skip unknown panels
        return
      }

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

            // Extract course code from course name
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
          result.errors.push(`Error parsing course row: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
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
 * Extract course code from course name text
 * Examples:
 * - "SIA-RMN-0001 Basic Enlisted Course" -> "SIA-RMN-0001"
 * - "RMACA-AOPA-E01 A Tale of Two ILSs" -> "RMACA-AOPA-E01"
 * - "MU-BEK-01 IS 100 - Introduction to Incident Command System" -> "MU-BEK-01"
 */
function extractCourseCode(courseName: string): string | null {
  // Match various course code patterns
  const patterns = [
    // Standard TRMN format: SIA-RMN-0001, SIA-SRN-20W, etc.
    /^([A-Z]{2,4}-[A-Z]{2,4}-\d{2,4}[ACDW]?)/,
    // RMACA format: RMACA-AOPA-E01, RMACA-AOPA-R01, etc.
    /^(RMACA-[A-Z]{4}-[ER]\d{2})/,
    // MU format: MU-BEK-01, etc.
    /^(MU-[A-Z]{3}-\d{2})/
  ]

  for (const pattern of patterns) {
    const match = courseName.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
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
