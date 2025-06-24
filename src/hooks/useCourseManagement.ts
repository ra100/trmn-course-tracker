import { useCallback } from 'react'
import { UserProgress, Course, CourseData } from '../types'
import { EligibilityEngine } from '../utils/eligibilityEngine'
import { trackCourseCompletion } from '../utils/analytics'
import { useOptimisticUserProgress } from './useUserProgress'

interface UseCourseManagementProps {
  courseData: CourseData | undefined
  eligibilityEngine: EligibilityEngine | null
  userProgress: UserProgress | undefined
  selectedCourse: Course | null
  setSelectedCourse: (course: Course) => void
}

interface UseCourseManagementReturn {
  toggleCourseCompletion: (courseCode: string) => void
  setCourseStatus: (courseCode: string, status: 'available' | 'in_progress' | 'waiting_grade' | 'completed') => void
  handleImportMedusaCourses: (courseCodes: string[]) => {
    imported: number
    trackable: number
    alreadyCompleted: number
    newCourses: string[]
    untrackedCourses: string[]
  }
}

export const useCourseManagement = ({
  courseData,
  eligibilityEngine,
  userProgress,
  selectedCourse,
  setSelectedCourse
}: UseCourseManagementProps): UseCourseManagementReturn => {
  const { updateOptimistically: updateUserProgress } = useOptimisticUserProgress()

  const updateCourseAvailabilityAndProgress = useCallback(
    (newProgress: UserProgress) => {
      let finalProgress = newProgress

      if (eligibilityEngine) {
        // Update available courses based on new completion status
        const updatedCourses = eligibilityEngine.updateCourseAvailability(newProgress)
        const newAvailable = new Set(updatedCourses.filter((course) => course.available).map((course) => course.code))

        finalProgress = {
          ...newProgress,
          availableCourses: newAvailable
        }

        // Update selectedCourse if it's affected by the changes
        if (selectedCourse) {
          const updatedSelectedCourse = updatedCourses.find((c) => c.code === selectedCourse.code)
          if (updatedSelectedCourse) {
            setSelectedCourse(updatedSelectedCourse)
          }
        }
      }

      updateUserProgress(() => finalProgress)
      return finalProgress
    },
    [eligibilityEngine, selectedCourse, setSelectedCourse, updateUserProgress]
  )

  const toggleCourseCompletion = useCallback(
    (courseCode: string) => {
      if (!courseData || !userProgress) {
        return
      }

      const newCompleted = new Set(userProgress.completedCourses)
      const newInProgress = new Set(userProgress.inProgressCourses)
      const newWaitingGrade = new Set(userProgress.waitingGradeCourses)

      const wasCompleted = newCompleted.has(courseCode)
      if (wasCompleted) {
        newCompleted.delete(courseCode)
      } else {
        newCompleted.add(courseCode)
        // Remove from other statuses when marking as completed
        newInProgress.delete(courseCode)
        newWaitingGrade.delete(courseCode)

        // Track course completion for analytics
        const course = courseData.courses.find((c) => c.code === courseCode)
        if (course) {
          trackCourseCompletion(courseCode, course.name)
        }
      }

      const newProgress: UserProgress = {
        ...userProgress,
        completedCourses: newCompleted,
        inProgressCourses: newInProgress,
        waitingGradeCourses: newWaitingGrade,
        lastUpdated: new Date()
      }

      updateCourseAvailabilityAndProgress(newProgress)
    },
    [courseData, eligibilityEngine, userProgress, updateCourseAvailabilityAndProgress]
  )

  const setCourseStatus = useCallback(
    (courseCode: string, status: 'available' | 'in_progress' | 'waiting_grade' | 'completed') => {
      if (!courseData || !userProgress) {
        return
      }

      const newCompleted = new Set(userProgress.completedCourses)
      const newInProgress = new Set(userProgress.inProgressCourses)
      const newWaitingGrade = new Set(userProgress.waitingGradeCourses)

      // Remove from all status sets first
      newCompleted.delete(courseCode)
      newInProgress.delete(courseCode)
      newWaitingGrade.delete(courseCode)

      // Add to appropriate set based on new status
      switch (status) {
        case 'completed':
          newCompleted.add(courseCode)
          break
        case 'in_progress':
          newInProgress.add(courseCode)
          break
        case 'waiting_grade':
          newWaitingGrade.add(courseCode)
          break
        case 'available':
          // Do nothing - already removed from all sets
          break
      }

      const newProgress: UserProgress = {
        ...userProgress,
        completedCourses: newCompleted,
        inProgressCourses: newInProgress,
        waitingGradeCourses: newWaitingGrade,
        lastUpdated: new Date()
      }

      updateCourseAvailabilityAndProgress(newProgress)
    },
    [courseData, eligibilityEngine, userProgress, updateCourseAvailabilityAndProgress]
  )

  const handleImportMedusaCourses = useCallback(
    (
      courseCodes: string[]
    ): {
      imported: number
      trackable: number
      alreadyCompleted: number
      newCourses: string[]
      untrackedCourses: string[]
    } => {
      if (!courseData || !eligibilityEngine || !userProgress) {
        return { imported: 0, trackable: 0, alreadyCompleted: 0, newCourses: [], untrackedCourses: [] }
      }

      // Get all trackable course codes from our course data
      const trackableCourses = new Set(courseData.courses.map((course) => course.code))

      // Filter imported courses to only include trackable ones
      const trackableImportedCourses = courseCodes.filter((code) => trackableCourses.has(code))

      // Get untracked courses (courses from Medusa that aren't in our system)
      const untrackedCourses = courseCodes.filter((code) => !trackableCourses.has(code))

      // Check which courses are already completed
      const existingCourses = userProgress.completedCourses
      const alreadyCompleted = trackableImportedCourses.filter((code) => existingCourses.has(code))
      const newCourses = trackableImportedCourses.filter((code) => !existingCourses.has(code))

      // Create new status sets - remove imported courses from in-progress and waiting-grade
      const newCompleted = new Set([...Array.from(existingCourses), ...newCourses])
      const newInProgress = new Set(userProgress.inProgressCourses)
      const newWaitingGrade = new Set(userProgress.waitingGradeCourses)

      // Remove all imported trackable courses from other status sets (Medusa import overrides manual status)
      trackableImportedCourses.forEach((courseCode) => {
        newInProgress.delete(courseCode)
        newWaitingGrade.delete(courseCode)
      })

      const newProgress: UserProgress = {
        ...userProgress,
        completedCourses: newCompleted,
        inProgressCourses: newInProgress,
        waitingGradeCourses: newWaitingGrade,
        lastUpdated: new Date()
      }

      updateCourseAvailabilityAndProgress(newProgress)

      return {
        imported: courseCodes.length,
        trackable: trackableImportedCourses.length,
        alreadyCompleted: alreadyCompleted.length,
        newCourses,
        untrackedCourses
      }
    },
    [courseData, eligibilityEngine, userProgress, updateCourseAvailabilityAndProgress]
  )

  return {
    toggleCourseCompletion,
    setCourseStatus,
    handleImportMedusaCourses
  }
}
