import type { Course } from '../types'

/**
 * Extracts the course series prefix from a course code.
 * Examples:
 * - "SIA-SRN-30A" -> "SIA-SRN"
 * - "RMACA-RMACS-02A" -> "RMACA-RMACS"
 * - "RMACA-AOPA-R01" -> "RMACA-AOPA"
 * - "MU-ECON-01" -> "MU" (all university courses grouped together)
 * - "SIA-RMN-0101" -> "SIA-RMN"
 */
export function getCourseSeriesPrefix(courseCode: string, seriesCodes?: string[]): string {
  if (seriesCodes) {
    for (const seriesCode of seriesCodes) {
      if (courseCode.startsWith(seriesCode)) {
        return seriesCode
      }
    }
  }

  // Fallback to original logic when no series codes provided
  const parts = courseCode.split('-')

  // Special case: group all MU (Mannheim University) courses together
  if (parts[0] === 'MU') {
    return 'MU'
  }

  if (parts.length >= 3) {
    // For most courses like SIA-SRN-XXX, RMACA-RMACS-XXX, etc.
    return `${parts[0]}-${parts[1]}`
  } else if (parts.length === 2) {
    // For other courses with 2 parts
    return courseCode.substring(0, courseCode.lastIndexOf('-'))
  }

  // Fallback to the full course code if pattern doesn't match
  return courseCode
}

/**
 * Extracts the numeric portion from a course code for sorting.
 * Examples:
 * - "SIA-SRN-30A" -> 30
 * - "SIA-RMN-0101" -> 101
 * - "MU-ECON-01" -> 1
 * - "RMACA-AOPA-R01" -> 1
 */
export function extractCourseNumber(courseCode: string): number {
  // Extract the numeric part after the last dash
  const lastPart = courseCode.split('-').pop() || ''

  // Remove any letter suffixes (A, C, D, W, etc.) and extract the number
  const numericMatch = lastPart.match(/(\d+)/)

  if (numericMatch) {
    return parseInt(numericMatch[1], 10)
  }

  return 0
}

/**
 * Sorts courses by their numeric course number, then by the letter suffix.
 * This provides a logical ordering like: 01A, 01C, 01D, 01W, 02A, 02C, etc.
 */
export function sortCoursesByNumber(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => {
    const aNumber = extractCourseNumber(a.code)
    const bNumber = extractCourseNumber(b.code)

    // First sort by number
    if (aNumber !== bNumber) {
      return aNumber - bNumber
    }

    // If numbers are the same, sort by the full code (handles letter suffixes)
    return a.code.localeCompare(b.code)
  })
}

/**
 * Gets a user-friendly name for a course series prefix.
 */
export function getSeriesDisplayName(seriesPrefix: string, seriesMappings: Map<string, string> | undefined): string {
  return seriesMappings?.get(seriesPrefix) || seriesPrefix
}

export const getCourseSeriesCodes = (seriesMappings: Map<string, string> | undefined): string[] => {
  return seriesMappings ? Array.from(seriesMappings.keys()) : []
}
