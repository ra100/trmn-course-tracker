/* eslint-disable no-console */
import {
  Course,
  UserProgress,
  ParsedCourseData,
  EligibilityResult,
  MissingPrerequisite,
  SpecialRule,
  Requirement,
  CourseLevel,
  Prerequisite
} from '../types'
import { isDebugEnabled } from '../config'

export class EligibilityEngine {
  private courseData: ParsedCourseData

  constructor(courseData: ParsedCourseData) {
    this.courseData = courseData
  }

  public checkCourseEligibility(courseCode: string, userProgress: UserProgress): EligibilityResult {
    const course = this.courseData.courseMap.get(courseCode)

    if (!course) {
      return {
        courseCode,
        eligible: false,
        missingPrerequisites: [],
        reason: 'Course not found'
      }
    }

    const missingPrerequisites: MissingPrerequisite[] = []

    for (const prerequisite of course.prerequisites) {
      const missing = this.checkPrerequisite(prerequisite, userProgress)
      if (missing) {
        missingPrerequisites.push(missing)
      }
    }

    return {
      courseCode,
      eligible: missingPrerequisites.length === 0,
      missingPrerequisites
    }
  }

  private checkPrerequisite(prerequisite: Prerequisite, userProgress: UserProgress): MissingPrerequisite | null {
    switch (prerequisite.type) {
      case 'course':
        return this.checkCoursePrerequisite(prerequisite, userProgress)
      case 'complex':
        return this.checkComplexPrerequisite(prerequisite, userProgress)
      case 'department_choice':
        return this.checkDepartmentChoicePrerequisite(prerequisite, userProgress)
      case 'alternative_group':
        return this.checkAlternativePrerequisite(prerequisite, userProgress)
      default:
        return null
    }
  }

  private checkCoursePrerequisite(prerequisite: Prerequisite, userProgress: UserProgress): MissingPrerequisite | null {
    if (!prerequisite.code) {
      return null
    }

    if (userProgress.completedCourses.has(prerequisite.code)) {
      return null // Requirement satisfied
    }

    return {
      type: 'course',
      description: `Required course: ${prerequisite.code}`,
      missing: [prerequisite.code],
      satisfied: []
    }
  }

  private checkComplexPrerequisite(prerequisite: Prerequisite): MissingPrerequisite | null {
    // For now, treat complex prerequisites as informational
    // This would need more sophisticated parsing for the complex rules
    return {
      type: 'complex',
      description: prerequisite.description || 'Complex requirement',
      missing: [],
      satisfied: []
    }
  }

  private checkDepartmentChoicePrerequisite(
    prerequisite: Prerequisite,
    userProgress: UserProgress
  ): MissingPrerequisite | null {
    if (!prerequisite.departments || !prerequisite.minimum || !prerequisite.level) {
      return {
        type: 'department_choice',
        description: prerequisite.description || 'Department choice requirement',
        missing: [],
        satisfied: []
      }
    }

    const completedInDepartments = this.getCompletedCoursesByDepartment(
      prerequisite.departments,
      prerequisite.level,
      userProgress
    )

    const satisfied: string[] = []

    // Find completed courses that satisfy this requirement
    for (const courseCode of Array.from(userProgress.completedCourses)) {
      const course = this.courseData.courseMap.get(courseCode)
      if (!course || course.level !== prerequisite.level) {
        continue
      }

      const inTargetDepartment = prerequisite.departments.some(
        (dept: string) =>
          course.section.toLowerCase().includes(dept.toLowerCase()) ||
          course.subsection.toLowerCase().includes(dept.toLowerCase())
      )

      if (inTargetDepartment) {
        satisfied.push(courseCode)
      }
    }

    if (completedInDepartments >= prerequisite.minimum) {
      return null // Requirement satisfied
    }

    // Calculate how many more are needed
    const needed = prerequisite.minimum - completedInDepartments

    return {
      type: 'department_choice',
      description:
        prerequisite.description ||
        `Need ${needed} more ${prerequisite.level} level courses from: ${prerequisite.departments.join(', ')}`,
      missing: [`${needed} more ${prerequisite.level} level courses`],
      satisfied,
      progress: completedInDepartments,
      total: prerequisite.minimum
    }
  }

  private checkAlternativePrerequisite(
    prerequisite: Prerequisite,
    userProgress: UserProgress
  ): MissingPrerequisite | null {
    if (!prerequisite.alternativePrerequisites || prerequisite.alternativePrerequisites.length === 0) {
      return {
        type: 'alternative_group',
        description: prerequisite.description || 'Alternative requirement missing options',
        missing: [],
        satisfied: []
      }
    }

    const satisfied: string[] = []
    const missing: string[] = []

    // Check each alternative - if any is satisfied, the whole group is satisfied
    for (const alternative of prerequisite.alternativePrerequisites) {
      if (alternative.type === 'course' && alternative.code) {
        if (userProgress.completedCourses.has(alternative.code)) {
          satisfied.push(alternative.code)
        } else {
          missing.push(alternative.code)
        }
      }
    }

    // If at least one alternative is satisfied, the requirement is met
    if (satisfied.length > 0) {
      return null // Requirement satisfied
    }

    // None of the alternatives are satisfied
    return {
      type: 'alternative_group',
      description: prerequisite.description || `One of: ${missing.join(' OR ')}`,
      missing,
      satisfied
    }
  }

  public updateCourseAvailability(userProgress: UserProgress): Course[] {
    const updatedCourses: Course[] = []

    for (const course of this.courseData.courses) {
      const eligibility = this.checkCourseEligibility(course.code, userProgress)
      const updatedCourse: Course = {
        ...course,
        completed: userProgress.completedCourses.has(course.code),
        available: eligibility.eligible && !userProgress.completedCourses.has(course.code)
      }
      updatedCourses.push(updatedCourse)
    }

    return updatedCourses
  }

  public checkSpecialRuleEligibility(rule: SpecialRule, userProgress: UserProgress): boolean {
    return rule.requirements.every((requirement) => this.checkRequirement(requirement, userProgress))
  }

  private checkRequirement(requirement: Requirement, userProgress: UserProgress): boolean {
    switch (requirement.type) {
      case 'course':
        return requirement.code ? userProgress.completedCourses.has(requirement.code) : false

      case 'department_choice':
        return this.checkDepartmentChoiceRequirement(requirement, userProgress)

      case 'level_requirement':
        return this.checkLevelRequirement(requirement, userProgress)

      default:
        return false
    }
  }

  private checkDepartmentChoiceRequirement(requirement: Requirement, userProgress: UserProgress): boolean {
    if (!requirement.departments || !requirement.minimum) {
      return false
    }

    const completedInDepartments = this.getCompletedCoursesByDepartment(
      requirement.departments,
      requirement.level,
      userProgress
    )

    return completedInDepartments >= requirement.minimum
  }

  private checkLevelRequirement(requirement: Requirement, userProgress: UserProgress): boolean {
    if (!requirement.level) {
      return false
    }

    // Count completed courses of the specified level
    const completedOfLevel = Array.from(userProgress.completedCourses)
      .map((code) => this.courseData.courseMap.get(code))
      .filter((course) => course && course.level === requirement.level).length

    return completedOfLevel > 0
  }

  private getCompletedCoursesByDepartment(
    departments: string[],
    level: CourseLevel | undefined,
    userProgress: UserProgress
  ): number {
    let count = 0

    if (isDebugEnabled()) {
      console.log('🔍 Checking department requirements:', {
        departments,
        level,
        completedCourses: Array.from(userProgress.completedCourses)
      })
    }

    // Use parsed department mappings from course data, fallback to department name if not found
    const departmentMappings = this.courseData.departmentMappings

    for (const courseCode of Array.from(userProgress.completedCourses)) {
      const course = this.courseData.courseMap.get(courseCode)
      if (!course) {
        continue
      }

      const inTargetDepartment = departments.some((dept) => {
        const deptLower = dept.toLowerCase()
        const mappedDepts = departmentMappings?.get(deptLower) || [deptLower]

        return mappedDepts.some(
          (mappedDept) =>
            course.section.toLowerCase().includes(mappedDept) ||
            course.subsection.toLowerCase().includes(mappedDept) ||
            course.name.toLowerCase().includes(mappedDept)
        )
      })

      const hasCorrectLevel = !level || course.level === level

      if (isDebugEnabled()) {
        console.log(`📚 Course ${courseCode}:`, {
          name: course.name,
          section: course.section,
          subsection: course.subsection,
          level: course.level,
          inTargetDepartment,
          hasCorrectLevel,
          willCount: inTargetDepartment && hasCorrectLevel
        })
      }

      if (inTargetDepartment && hasCorrectLevel) {
        count++
      }
    }

    if (isDebugEnabled()) {
      console.log(`✅ Total count: ${count}`)
    }
    return count
  }

  public getAvailableCourses(userProgress: UserProgress): Course[] {
    return this.updateCourseAvailability(userProgress).filter((course) => course.available)
  }

  public getCompletedCourses(userProgress: UserProgress): Course[] {
    return this.updateCourseAvailability(userProgress).filter((course) => course.completed)
  }

  public getPrerequisitesForCourse(courseCode: string): Course[] {
    const course = this.courseData.courseMap.get(courseCode)
    if (!course) {
      return []
    }

    const prerequisites: Course[] = []

    for (const prereq of course.prerequisites) {
      if (prereq.type === 'course' && prereq.code) {
        const prereqCourse = this.courseData.courseMap.get(prereq.code)
        if (prereqCourse) {
          prerequisites.push(prereqCourse)
        }
      } else if (prereq.type === 'alternative_group' && prereq.alternativePrerequisites) {
        // Add all alternative prerequisites to the list
        for (const alternative of prereq.alternativePrerequisites) {
          if (alternative.type === 'course' && alternative.code) {
            const altCourse = this.courseData.courseMap.get(alternative.code)
            if (altCourse) {
              prerequisites.push(altCourse)
            }
          }
        }
      }
    }

    return prerequisites
  }

  public getCoursesUnlockedBy(courseCode: string): Course[] {
    const unlockedCourses: Course[] = []

    for (const course of this.courseData.courses) {
      const hasAsPrerequisite = course.prerequisites.some((prereq) => {
        if (prereq.type === 'course' && prereq.code === courseCode) {
          return true
        }
        if (prereq.type === 'alternative_group' && prereq.alternativePrerequisites) {
          return prereq.alternativePrerequisites.some((alt) => alt.type === 'course' && alt.code === courseCode)
        }
        return false
      })

      if (hasAsPrerequisite) {
        unlockedCourses.push(course)
      }
    }

    return unlockedCourses
  }

  public getCourseByCode(courseCode: string): Course | undefined {
    return this.courseData.courseMap.get(courseCode)
  }
}
