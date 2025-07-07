import { useCallback } from 'react'
import { UserProgress, Course, CourseData, CourseStatusTimestamp } from '../types'
import { EligibilityEngine } from '../utils/eligibilityEngine'
import { trackCourseCompletion } from '../utils/analytics'
import { useOptimisticUserProgress } from './useUserProgress'
import { logger } from '~/utils/logger'

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
  handleImportMedusaCourses: (
    courseCodes: string[],
    completionDates?: Map<string, Date>
  ) => {
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
      const newCourseStatusTimestamps = new Map(userProgress.courseStatusTimestamps)
      const newCourseCompletionDates = new Map(userProgress.courseCompletionDates)

      const wasCompleted = newCompleted.has(courseCode)

      // Determine previous status
      let previousStatus: 'available' | 'in_progress' | 'waiting_grade' | 'completed' | undefined
      if (userProgress.completedCourses.has(courseCode)) {
        previousStatus = 'completed'
      } else if (userProgress.inProgressCourses.has(courseCode)) {
        previousStatus = 'in_progress'
      } else if (userProgress.waitingGradeCourses.has(courseCode)) {
        previousStatus = 'waiting_grade'
      } else if (userProgress.availableCourses.has(courseCode)) {
        previousStatus = 'available'
      }

      if (wasCompleted) {
        newCompleted.delete(courseCode)
        // When uncompleting, remove completion date
        newCourseCompletionDates.delete(courseCode)
        // When uncompleting, set back to available
        const timestamp: CourseStatusTimestamp = {
          status: 'available',
          timestamp: new Date(),
          previousStatus
        }
        newCourseStatusTimestamps.set(courseCode, timestamp)
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

        // Set completion date to current date
        const completionDate = new Date()
        newCourseCompletionDates.set(courseCode, completionDate)

        // Update timestamp tracking
        const timestamp: CourseStatusTimestamp = {
          status: 'completed',
          timestamp: completionDate,
          previousStatus
        }
        newCourseStatusTimestamps.set(courseCode, timestamp)
      }

      const newProgress: UserProgress = {
        ...userProgress,
        completedCourses: newCompleted,
        inProgressCourses: newInProgress,
        waitingGradeCourses: newWaitingGrade,
        courseStatusTimestamps: newCourseStatusTimestamps,
        courseCompletionDates: newCourseCompletionDates,
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
      const newCourseStatusTimestamps = new Map(userProgress.courseStatusTimestamps)
      const newCourseCompletionDates = new Map(userProgress.courseCompletionDates)

      // Determine previous status
      let previousStatus: 'available' | 'in_progress' | 'waiting_grade' | 'completed' | undefined
      if (userProgress.completedCourses.has(courseCode)) {
        previousStatus = 'completed'
      } else if (userProgress.inProgressCourses.has(courseCode)) {
        previousStatus = 'in_progress'
      } else if (userProgress.waitingGradeCourses.has(courseCode)) {
        previousStatus = 'waiting_grade'
      } else if (userProgress.availableCourses.has(courseCode)) {
        previousStatus = 'available'
      }

      // Remove from all status sets first
      newCompleted.delete(courseCode)
      newInProgress.delete(courseCode)
      newWaitingGrade.delete(courseCode)

      // Handle completion date based on status
      if (status !== 'completed') {
        // Remove completion date when not completed
        newCourseCompletionDates.delete(courseCode)
      }

      // Add to appropriate set based on new status
      switch (status) {
        case 'completed':
          newCompleted.add(courseCode)
          // Set completion date to current date
          newCourseCompletionDates.set(courseCode, new Date())
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

      // Update timestamp tracking
      const timestamp: CourseStatusTimestamp = {
        status,
        timestamp: new Date(),
        previousStatus
      }
      newCourseStatusTimestamps.set(courseCode, timestamp)

      const newProgress: UserProgress = {
        ...userProgress,
        completedCourses: newCompleted,
        inProgressCourses: newInProgress,
        waitingGradeCourses: newWaitingGrade,
        courseStatusTimestamps: newCourseStatusTimestamps,
        courseCompletionDates: newCourseCompletionDates,
        lastUpdated: new Date()
      }

      updateCourseAvailabilityAndProgress(newProgress)
    },
    [courseData, eligibilityEngine, userProgress, updateCourseAvailabilityAndProgress]
  )

  const handleImportMedusaCourses = useCallback(
    (
      courseCodes: string[],
      completionDates?: Map<string, Date>
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
      const newCourseStatusTimestamps = new Map(userProgress.courseStatusTimestamps)
      const newCourseCompletionDates = new Map(userProgress.courseCompletionDates)

      // Remove all imported trackable courses from other status sets (Medusa import overrides manual status)
      trackableImportedCourses.forEach((courseCode) => {
        newInProgress.delete(courseCode)
        newWaitingGrade.delete(courseCode)

        // Update timestamp for imported courses (use completion date if available, otherwise current date)
        const completionDate = completionDates?.get(courseCode) || new Date()
        const timestamp: CourseStatusTimestamp = {
          status: 'completed',
          timestamp: completionDate,
          previousStatus: newCourseStatusTimestamps.get(courseCode)?.status
        }
        newCourseStatusTimestamps.set(courseCode, timestamp)

        // Store completion date if available
        if (completionDates?.has(courseCode)) {
          const date = completionDates.get(courseCode) ?? new Date()
          newCourseCompletionDates.set(courseCode, date)
          logger.log('💾 Storing completion date for course:', courseCode, '→', date)
        }
      })

      const newProgress: UserProgress = {
        ...userProgress,
        completedCourses: newCompleted,
        inProgressCourses: newInProgress,
        waitingGradeCourses: newWaitingGrade,
        courseStatusTimestamps: newCourseStatusTimestamps,
        courseCompletionDates: newCourseCompletionDates,
        lastUpdated: new Date()
      }

      logger.log('📊 Final progress after import:', {
        completedCourses: Array.from(newCompleted),
        completionDates: Array.from(newCourseCompletionDates.entries()),
        totalCompletionDates: newCourseCompletionDates.size
      })

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
