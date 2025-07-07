/**
 * Timestamp utility functions for course status changes
 */

export const WAITING_GRADE_THRESHOLD_DAYS = 14 // 2 weeks

/**
 * Formats a timestamp based on how long ago it was
 * If less than 2 weeks, show "x days ago"
 * Otherwise, show the date
 */
export const formatTimestamp = (timestamp: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 14) {
    if (diffDays === 0) {
      return 'today'
    } else if (diffDays === 1) {
      return '1 day ago'
    }
    return `${diffDays} days ago`
  }
  return timestamp.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Formats a timestamp for tooltip display with full date and time
 */
export const formatTimestampForTooltip = (timestamp: Date): string => {
  return timestamp.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * Checks if a course has been in waiting_grade status for too long
 */
export const isWaitingGradeTooLong = (timestamp: Date): boolean => {
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  return diffDays > WAITING_GRADE_THRESHOLD_DAYS
}

/**
 * Gets the number of days a course has been in waiting_grade status
 */
export const getDaysInWaitingGrade = (timestamp: Date): number => {
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Filters courses that have been in waiting_grade status for too long
 */
export const getOverdueWaitingGradeCourses = (
  waitingGradeCourses: Set<string>,
  courseStatusTimestamps: Map<string, { status: string; timestamp: Date; previousStatus?: string }>
): Array<{ courseId: string; daysWaiting: number }> => {
  const overdueCourses: Array<{ courseId: string; daysWaiting: number }> = []

  Array.from(waitingGradeCourses).forEach((courseId) => {
    const statusTimestamp = courseStatusTimestamps.get(courseId)
    if (statusTimestamp && statusTimestamp.status === 'waiting_grade') {
      const daysWaiting = getDaysInWaitingGrade(statusTimestamp.timestamp)
      if (daysWaiting > WAITING_GRADE_THRESHOLD_DAYS) {
        overdueCourses.push({
          courseId,
          daysWaiting
        })
      }
    }
  })

  return overdueCourses.sort((a, b) => b.daysWaiting - a.daysWaiting) // Sort by most overdue first
}

/**
 * Gets a formatted warning message for overdue waiting grade courses
 */
export const getWaitingGradeWarningMessage = (
  overdueCourses: Array<{ courseId: string; daysWaiting: number }>
): string => {
  if (overdueCourses.length === 0) {
    return ''
  }

  if (overdueCourses.length === 1) {
    const course = overdueCourses[0]
    return `Course ${course.courseId} has been waiting for grades for ${course.daysWaiting} days`
  }

  return `${overdueCourses.length} courses have been waiting for grades for more than ${WAITING_GRADE_THRESHOLD_DAYS} days`
}
