import { Course, ParsedCourseData } from '../types'

/**
 * Normalizes a department/section/subsection name to a standard department name
 * using the dynamic departmentMappings from course data
 */
export function normalizeDepartmentName(name: string, departmentMappings: Map<string, string[]>): string | null {
  if (!name) {return null}

  const nameLower = name.toLowerCase()

  // Check each department mapping to see if the name matches any school names
  for (const [department, schoolNames] of Array.from(departmentMappings.entries())) {
    // Check if the name matches any of the school names for this department
    if (schoolNames.some((schoolName: string) => nameLower.includes(schoolName))) {
      // Return the department name with proper capitalization
      return department.charAt(0).toUpperCase() + department.slice(1)
    }
  }

  return null
}

/**
 * Determines the primary department for a course using dynamic mappings
 */
export function getCourseMainDepartment(course: Course, departmentMappings: Map<string, string[]>): string {
  // Try to normalize the subsection name first (more specific)
  if (course.subsection) {
    const normalizedFromSubsection = normalizeDepartmentName(course.subsection, departmentMappings)
    if (normalizedFromSubsection) {
      return normalizedFromSubsection
    }
  }

  // Try to normalize the section name
  if (course.section) {
    const normalizedFromSection = normalizeDepartmentName(course.section, departmentMappings)
    if (normalizedFromSection) {
      return normalizedFromSection
    }
  }

  // Fallback: try to extract department from section name patterns
  if (course.section) {
    const sectionLower = course.section.toLowerCase()

    // Check against known department mappings
    for (const [department] of Array.from(departmentMappings.entries())) {
      if (sectionLower.includes(department)) {
        return department.charAt(0).toUpperCase() + department.slice(1)
      }
    }
  }

  return 'Other'
}

/**
 * Checks if a course belongs to a specific department using dynamic mappings
 */
export function courseMatchesDepartment(
  course: Course,
  targetDepartment: string,
  departmentMappings: Map<string, string[]>
): boolean {
  const courseDepartment = getCourseMainDepartment(course, departmentMappings)
  return courseDepartment === targetDepartment
}

/**
 * Gets all unique departments from courses using dynamic mappings
 */
export function getAllDepartments(courseData: ParsedCourseData): string[] {
  const departments = new Set<string>()

  courseData.courses.forEach((course) => {
    const department = getCourseMainDepartment(course, courseData.departmentMappings || new Map())
    departments.add(department)
  })

  return Array.from(departments).sort()
}

/**
 * Finds courses by department and level using dynamic mappings
 */
export function findCoursesByDepartmentAndLevel(
  courseData: ParsedCourseData,
  targetDepartments: string[],
  level?: string
): Course[] {
  return courseData.courses.filter((course) => {
    const hasCorrectLevel = !level || course.level === level
    const matchesDepartment = targetDepartments.some((dept) =>
      courseMatchesDepartment(course, dept, courseData.departmentMappings || new Map())
    )
    return hasCorrectLevel && matchesDepartment
  })
}
