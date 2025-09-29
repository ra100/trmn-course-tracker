import { CourseAlias, ParsedCourseData } from '../types'

/**
 * Utility functions for handling course aliases and mappings
 */
export class CourseAliasManager {
  private aliasMap: Map<string, string> = new Map()
  private reverseAliasMap: Map<string, string[]> = new Map()

  /**
   * Initialize the alias manager with course data
   */
  constructor(courseData?: ParsedCourseData) {
    if (courseData?.courseAliases) {
      this.buildAliasMaps(courseData.courseAliases)
    }
  }

  /**
   * Build alias maps from course alias definitions
   */
  private buildAliasMaps(courseAliases: CourseAlias[]): void {
    courseAliases.forEach((alias) => {
      alias.alternativeCodes.forEach((altCode) => {
        this.aliasMap.set(altCode, alias.primaryCode)
      })
      this.reverseAliasMap.set(alias.primaryCode, alias.alternativeCodes)
    })
  }

  /**
   * Resolve a course code to its primary equivalent
   * @param courseCode The course code to resolve
   * @returns The primary course code if it's an alias, otherwise the original code
   */
  resolveCourseCode(courseCode: string): string {
    return this.aliasMap.get(courseCode) || courseCode
  }

  /**
   * Get all aliases for a primary course code
   * @param primaryCode The primary course code
   * @returns Array of alternative codes, or empty array if none exist
   */
  getAliases(primaryCode: string): string[] {
    return this.reverseAliasMap.get(primaryCode) || []
  }

  /**
   * Check if a course code is an alias
   * @param courseCode The course code to check
   * @returns True if the code is an alias
   */
  isAlias(courseCode: string): boolean {
    return this.aliasMap.has(courseCode)
  }

  /**
   * Check if a course code is a primary course
   * @param courseCode The course code to check
   * @returns True if the code is a primary course
   */
  isPrimary(courseCode: string): boolean {
    return this.reverseAliasMap.has(courseCode)
  }

  /**
   * Get all course codes (primary + aliases) for a course
   * @param courseCode The course code to expand
   * @returns Array of all equivalent course codes
   */
  expandCourseCodes(courseCode: string): string[] {
    const primary = this.resolveCourseCode(courseCode)
    const aliases = this.getAliases(primary)
    return [primary, ...aliases]
  }

  /**
   * Create introductory course aliases for GPU-TRMN courses
   * Maps INTRO-TRMN-0001 ← GPU-TRMN-0001 SIA-RMN-0001, etc.
   * Based on markdown definition where INTRO-TRMN-000x is primary
   */
  static createIntroductoryAliases(): CourseAlias[] {
    return [
      {
        primaryCode: 'INTRO-TRMN-0001',
        alternativeCodes: ['GPU-TRMN-0001', 'SIA-RMN-0001'],
        description: 'Introductory course equivalent - Basic Enlistment',
        active: true
      },
      {
        primaryCode: 'INTRO-TRMN-0002',
        alternativeCodes: ['GPU-TRMN-0002', 'SIA-RMN-0002'],
        description: 'Introductory course equivalent - Basic Non-Commissioned Officer',
        active: true
      },
      {
        primaryCode: 'INTRO-TRMN-0003',
        alternativeCodes: ['GPU-TRMN-0003', 'SIA-RMN-0003'],
        description: 'Introductory course equivalent - Advanced Non-Commissioned Officer',
        active: true
      }
    ]
  }

  /**
   * Add course aliases to parsed course data
   */
  static enhanceCourseDataWithAliases(courseData: ParsedCourseData): ParsedCourseData {
    const introductoryAliases = CourseAliasManager.createIntroductoryAliases()
    const existingAliases = courseData.courseAliases || []

    return {
      ...courseData,
      courseAliases: [...existingAliases, ...introductoryAliases],
      aliasMap: new Map([
        ...introductoryAliases.flatMap((alias) =>
          alias.alternativeCodes.map((alt) => [alt, alias.primaryCode] as [string, string])
        )
      ])
    }
  }

  /**
   * Check if completing one course satisfies another course requirement
   * @param completedCode The course code that was completed
   * @param requiredCode The course code that is required
   * @returns True if the completed course satisfies the requirement
   */
  satisfiesRequirement(completedCode: string, requiredCode: string): boolean {
    const completedPrimary = this.resolveCourseCode(completedCode)
    const requiredPrimary = this.resolveCourseCode(requiredCode)

    // Direct match
    if (completedPrimary === requiredPrimary) {
      return true
    }

    // Check if completed course is an alias of the required course
    if (this.isAlias(completedCode) && this.resolveCourseCode(completedCode) === requiredPrimary) {
      return true
    }

    // Check if required course is an alias of the completed course
    if (this.isAlias(requiredCode) && this.resolveCourseCode(requiredCode) === completedPrimary) {
      return true
    }

    return false
  }

  /**
   * Get all courses that would be satisfied by completing a specific course
   * @param courseCode The course code that would be completed
   * @returns Array of all course codes that would be satisfied
   */
  getSatisfiedCourses(courseCode: string): string[] {
    const primary = this.resolveCourseCode(courseCode)
    const aliases = this.getAliases(primary)
    return [primary, ...aliases]
  }
}

/**
 * Utility functions for course alias operations
 */
export const courseAliasUtils = {
  /**
   * Create a course alias mapping
   */
  createAlias: (primaryCode: string, alternativeCodes: string[], description?: string): CourseAlias => ({
    primaryCode,
    alternativeCodes,
    description,
    active: true
  }),

  /**
   * Check if two course codes are equivalent (including aliases)
   */
  areEquivalent: (code1: string, code2: string, aliasManager?: CourseAliasManager): boolean => {
    if (!aliasManager) {
      return code1 === code2
    }

    return aliasManager.satisfiesRequirement(code1, code2) || aliasManager.satisfiesRequirement(code2, code1)
  },

  /**
   * Get the canonical course code (primary code) for any course code
   */
  getCanonicalCode: (courseCode: string, aliasManager?: CourseAliasManager): string => {
    if (!aliasManager) {
      return courseCode
    }
    return aliasManager.resolveCourseCode(courseCode)
  }
}
