import { useMemo } from 'react'
import { UserProgress } from '../types'
import {
  getOverdueWaitingGradeCourses,
  getWaitingGradeWarningMessage,
  formatTimestamp,
  getDaysInWaitingGrade
} from '../utils/timestampUtils'

export interface WaitingGradeInfo {
  courseId: string
  daysWaiting: number
  formattedTimestamp: string
  timestamp: Date
  isOverdue: boolean
}

export interface UseWaitingGradeTrackingReturn {
  waitingGradeInfo: WaitingGradeInfo[]
  overdueCourses: Array<{ courseId: string; daysWaiting: number }>
  warningMessage: string
  hasOverdueCourses: boolean
  totalWaitingGrade: number
  totalOverdue: number
}

/**
 * Hook to track courses in waiting_grade status and identify overdue ones
 */
export const useWaitingGradeTracking = (userProgress: UserProgress): UseWaitingGradeTrackingReturn => {
  const waitingGradeInfo = useMemo(() => {
    const info: WaitingGradeInfo[] = []

    Array.from(userProgress.waitingGradeCourses).forEach((courseId) => {
      const statusTimestamp = userProgress.courseStatusTimestamps.get(courseId)
      if (statusTimestamp && statusTimestamp.status === 'waiting_grade') {
        const daysWaiting = getDaysInWaitingGrade(statusTimestamp.timestamp)
        info.push({
          courseId,
          daysWaiting,
          formattedTimestamp: formatTimestamp(statusTimestamp.timestamp),
          timestamp: statusTimestamp.timestamp,
          isOverdue: daysWaiting > 7
        })
      }
    })

    return info.sort((a, b) => b.daysWaiting - a.daysWaiting) // Sort by most overdue first
  }, [userProgress.waitingGradeCourses, userProgress.courseStatusTimestamps])

  const overdueCourses = useMemo(() => {
    return getOverdueWaitingGradeCourses(userProgress.waitingGradeCourses, userProgress.courseStatusTimestamps)
  }, [userProgress.waitingGradeCourses, userProgress.courseStatusTimestamps])

  const warningMessage = useMemo(() => {
    return getWaitingGradeWarningMessage(overdueCourses)
  }, [overdueCourses])

  const hasOverdueCourses = overdueCourses.length > 0
  const totalWaitingGrade = userProgress.waitingGradeCourses.size
  const totalOverdue = overdueCourses.length

  return {
    waitingGradeInfo,
    overdueCourses,
    warningMessage,
    hasOverdueCourses,
    totalWaitingGrade,
    totalOverdue
  }
}
