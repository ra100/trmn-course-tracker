import { useEffect } from 'react'
import { Course, UserProgress } from '../../types'
import { EligibilityEngine } from '../../utils/eligibilityEngine'
import { useT } from '../../i18n'
import { trackCourseDetailsView } from '../../utils/analytics'
import { CourseStatus, PrerequisiteInfo, UseCourseDetailsReturn } from './types'

interface UseCourseDetailsProps {
  course: Course
  userProgress: UserProgress
  eligibilityEngine: EligibilityEngine
  onCourseToggle: (courseCode: string) => void
  onCourseSelect?: (course: Course) => void
}

export const useCourseDetails = ({
  course,
  userProgress,
  eligibilityEngine,
  onCourseToggle,
  onCourseSelect
}: UseCourseDetailsProps): UseCourseDetailsReturn => {
  const t = useT()

  // Track course details view when course changes
  useEffect(() => {
    if (course) {
      trackCourseDetailsView(course.code, course.name, 'course_details_panel')
    }
  }, [course])

  const getStatus = (): CourseStatus => {
    if (course.completed) {
      return 'completed'
    }
    if (userProgress.waitingGradeCourses.has(course.code)) {
      return 'waiting_grade'
    }
    if (userProgress.inProgressCourses.has(course.code)) {
      return 'in_progress'
    }
    if (course.available) {
      return 'available'
    }
    return 'locked'
  }

  const getStatusText = (): string => {
    const status = getStatus()
    switch (status) {
      case 'completed':
        return t.courseStatus.completed
      case 'waiting_grade':
        return t.courseStatus.waitingGrade
      case 'in_progress':
        return t.courseStatus.inProgress
      case 'available':
        return t.courseStatus.available
      case 'locked':
        return t.courseStatus.prerequisitesRequired
    }
  }

  const getPrerequisites = (): PrerequisiteInfo[] => {
    const prerequisites: PrerequisiteInfo[] = []

    course.prerequisites.forEach((prereq) => {
      if (prereq.type === 'course' && prereq.code) {
        const requiredCode = prereq.code

        // Check if the exact course code is completed
        const directSatisfied = userProgress.completedCourses.has(requiredCode)

        // Check if any alias of the required course is completed
        const allEquivalentCodes = eligibilityEngine.getAllEquivalentCourses(requiredCode)
        const aliasSatisfied = allEquivalentCodes.some((code) => userProgress.completedCourses.has(code))

        const satisfied = directSatisfied || aliasSatisfied

        // Find which specific course satisfied this requirement
        let satisfyingCourse: string | undefined
        if (directSatisfied) {
          satisfyingCourse = requiredCode
        } else if (aliasSatisfied) {
          // Find which alias was actually completed
          satisfyingCourse = allEquivalentCodes.find((code) => userProgress.completedCourses.has(code))
        }

        let text = `Course: ${requiredCode}`
        let courseCodes: string[] | undefined

        // Always show all equivalent courses that actually exist in the course data
        const existingEquivalentCodes = allEquivalentCodes.filter(
          (code) => eligibilityEngine.getCourseByCode(code) !== undefined
        )

        if (existingEquivalentCodes.length > 1) {
          // Show all existing equivalent courses
          text = `Course: ${existingEquivalentCodes.join(' / ')}`
          courseCodes = existingEquivalentCodes
        } else if (existingEquivalentCodes.length === 1) {
          // Show the single existing course
          text = `Course: ${existingEquivalentCodes[0]}`
          courseCodes = existingEquivalentCodes
        } else {
          // Fallback to original code if no equivalent courses exist
          text = `Course: ${requiredCode}`
          courseCodes = [requiredCode]
        }

        prerequisites.push({
          text,
          satisfied,
          type: 'course',
          courseCode: requiredCode,
          courseCodes,
          satisfyingCourse
        })
      } else if (prereq.type === 'alternative_group' && prereq.alternativePrerequisites) {
        // Check if any of the alternatives are satisfied
        const satisfiedAlternatives = prereq.alternativePrerequisites.filter(
          (alt) => alt.type === 'course' && alt.code && userProgress.completedCourses.has(alt.code)
        )
        const satisfied = satisfiedAlternatives.length > 0

        // Create a readable description with aliases
        const alternativeTexts: string[] = []
        const allAlternativeCodes: string[] = []

        prereq.alternativePrerequisites.forEach((alt) => {
          if (alt.type === 'course' && alt.code) {
            const altCode = alt.code
            const allEquivalentCodes = eligibilityEngine.getAllEquivalentCourses(altCode)

            // Filter to only existing courses
            const existingEquivalentCodes = allEquivalentCodes.filter(
              (code) => eligibilityEngine.getCourseByCode(code) !== undefined
            )

            if (existingEquivalentCodes.length > 1) {
              // Show all existing equivalent codes for this alternative
              alternativeTexts.push(existingEquivalentCodes.join(' / '))
              allAlternativeCodes.push(...existingEquivalentCodes)
            } else if (existingEquivalentCodes.length === 1) {
              // Show the single existing course
              alternativeTexts.push(existingEquivalentCodes[0])
              allAlternativeCodes.push(existingEquivalentCodes[0])
            } else {
              // Fallback to original code if no equivalent courses exist
              alternativeTexts.push(altCode)
              allAlternativeCodes.push(altCode)
            }
          }
        })

        prerequisites.push({
          text: `One of: ${alternativeTexts.join(' OR ')}`,
          satisfied,
          type: 'alternative_group',
          courseCodes: allAlternativeCodes
        })
      } else if (prereq.type === 'department_choice') {
        // Handle department choice requirements (like Navy Counselor courses)
        const eligibility = eligibilityEngine.checkCourseEligibility(course.code, userProgress)
        const deptMissing = eligibility.missingPrerequisites.find((mp) => mp.type === 'department_choice')

        let satisfied = true
        let progress = prereq.minimum
        let progressText = ''

        if (deptMissing) {
          satisfied = false
          progress = deptMissing.progress || 0
          progressText = ` (${progress}/${deptMissing.total || prereq.minimum})`
        } else {
          // Course is satisfied, use minimum as progress since it's met
          progress = prereq.minimum
          progressText = ` (${progress}/${prereq.minimum})`
        }

        const departmentList = prereq.departments?.join(', ') || 'various departments'
        const text = `${prereq.minimum} ${prereq.level} level courses from: ${departmentList}${progressText}`

        prerequisites.push({
          text,
          satisfied,
          type: 'department_choice',
          progress,
          total: prereq.minimum
        })
      } else if (prereq.type === 'complex') {
        prerequisites.push({
          text: prereq.description || 'Complex requirement',
          satisfied: false, // Complex requirements need special handling
          type: 'complex'
        })
      }
    })

    return prerequisites
  }

  const getUnlockedCourses = (): Course[] => {
    return eligibilityEngine.getCoursesUnlockedBy(course.code)
  }

  const handleToggleClick = () => {
    if (course.available || course.completed) {
      onCourseToggle(course.code)
    }
  }

  const handleCourseClick = (courseCode: string) => {
    if (!onCourseSelect || !eligibilityEngine) {
      return
    }

    // First try to find the course directly by the clicked code
    let targetCourse = eligibilityEngine.getCourseByCode(courseCode)

    // If not found directly, try to find an equivalent course that exists
    if (!targetCourse) {
      const allEquivalentCodes = eligibilityEngine.getAllEquivalentCourses(courseCode)
      for (const equivalentCode of allEquivalentCodes) {
        targetCourse = eligibilityEngine.getCourseByCode(equivalentCode)
        if (targetCourse) {
          break
        }
      }
    }

    if (targetCourse) {
      // Get the course with updated availability and completion status
      const updatedCourses = eligibilityEngine.updateCourseAvailability(userProgress)
      const updatedTargetCourse = updatedCourses.find((c) => c.code === targetCourse!.code)

      if (updatedTargetCourse) {
        onCourseSelect(updatedTargetCourse)
      } else {
        // Fallback to original course if updated version not found
        onCourseSelect(targetCourse)
      }
    }
  }

  const status = getStatus()
  const prerequisites = getPrerequisites()
  const unlockedCourses = getUnlockedCourses()

  return {
    status,
    getStatusText,
    prerequisites,
    unlockedCourses,
    handleToggleClick,
    handleCourseClick
  }
}
