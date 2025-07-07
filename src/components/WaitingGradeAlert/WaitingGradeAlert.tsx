import React from 'react'
import { useWaitingGradeTracking } from '../../hooks/useWaitingGradeTracking'
import { UserProgress } from '../../types'
import { useT } from '../../i18n'
import { css } from 'styled-system/css'
import { formatTimestampForTooltip } from '../../utils/timestampUtils'

interface WaitingGradeAlertProps {
  userProgress: UserProgress
  onCourseSelect?: (courseId: string) => void
}

export const WaitingGradeAlert: React.FC<WaitingGradeAlertProps> = ({ userProgress, onCourseSelect }) => {
  const t = useT()
  const { waitingGradeInfo, warningMessage, hasOverdueCourses, totalWaitingGrade, totalOverdue } =
    useWaitingGradeTracking(userProgress)

  if (totalWaitingGrade === 0) {
    return null
  }

  return (
    <div className={alertContainer}>
      <div className={alertHeader}>
        <h3 className={alertTitle}>
          {hasOverdueCourses ? '⚠️ ' : '📋 '}
          {t.waitingGradeAlert.title}
        </h3>
        <div className={statusSummary}>
          <span className={summaryItem}>
            {totalWaitingGrade} {t.waitingGradeAlert.totalWaiting}
          </span>
          {totalOverdue > 0 && (
            <span className={overdueSummary}>
              {totalOverdue} {t.waitingGradeAlert.overdue}
            </span>
          )}
        </div>
      </div>

      {hasOverdueCourses && (
        <div className={warningBanner}>
          <div className={warningIcon}>⚠️</div>
          <div className={warningText}>{warningMessage}</div>
        </div>
      )}

      <div className={courseList}>
        {waitingGradeInfo.map((course) => (
          <div
            key={course.courseId}
            className={`${courseItem} ${course.isOverdue ? overdueItem : ''}`}
            onClick={() => onCourseSelect?.(course.courseId)}
            data-testid={`course-item-${course.courseId}`}
          >
            <div className={courseHeader}>
              <span className={courseCode}>{course.courseId}</span>
              <span className={courseTimestamp} title={formatTimestampForTooltip(course.timestamp)}>
                {course.formattedTimestamp}
              </span>
            </div>
            <div className={courseStatus}>
              <span className={statusText}>
                {course.daysWaiting} {t.waitingGradeAlert.daysWaiting}
              </span>
              {course.isOverdue && <span className={overdueLabel}>{t.waitingGradeAlert.overdueLabel}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Styles
const alertContainer = css({
  backgroundColor: 'white',
  border: '1px solid',
  borderColor: 'gray.6',
  borderRadius: 'md',
  padding: '1rem',
  marginBottom: '1rem',
  _dark: {
    backgroundColor: 'gray.1',
    borderColor: 'gray.7'
  }
})

const alertHeader = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.75rem'
})

const alertTitle = css({
  fontSize: 'lg',
  fontWeight: 'semibold',
  color: 'gray.12',
  margin: 0
})

const statusSummary = css({
  display: 'flex',
  gap: '0.5rem',
  fontSize: 'sm',
  color: 'gray.11'
})

const summaryItem = css({
  padding: '0.25rem 0.5rem',
  backgroundColor: 'blue.3',
  color: 'blue.11',
  borderRadius: 'sm',
  fontSize: 'xs',
  fontWeight: 'medium'
})

const overdueSummary = css({
  padding: '0.25rem 0.5rem',
  backgroundColor: 'red.3',
  color: 'red.11',
  borderRadius: 'sm',
  fontSize: 'xs',
  fontWeight: 'medium'
})

const warningBanner = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: 'amber.3',
  color: 'amber.11',
  padding: '0.5rem',
  borderRadius: 'sm',
  marginBottom: '0.75rem',
  border: '1px solid',
  borderColor: 'amber.6'
})

const warningIcon = css({
  fontSize: 'lg'
})

const warningText = css({
  fontSize: 'sm',
  fontWeight: 'medium'
})

const courseList = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
})

const courseItem = css({
  padding: '0.5rem',
  backgroundColor: 'gray.2',
  borderRadius: 'sm',
  border: '1px solid',
  borderColor: 'gray.5',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  _hover: {
    backgroundColor: 'gray.3',
    borderColor: 'gray.7'
  },
  _dark: {
    backgroundColor: 'gray.3',
    borderColor: 'gray.6',
    _hover: {
      backgroundColor: 'gray.4',
      borderColor: 'gray.8'
    }
  }
})

const overdueItem = css({
  borderColor: 'red.6',
  backgroundColor: 'red.2',
  _hover: {
    backgroundColor: 'red.3',
    borderColor: 'red.7'
  },
  _dark: {
    backgroundColor: 'red.3',
    borderColor: 'red.6',
    _hover: {
      backgroundColor: 'red.4',
      borderColor: 'red.8'
    }
  }
})

const courseHeader = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.25rem'
})

const courseCode = css({
  fontSize: 'sm',
  fontWeight: 'medium',
  color: 'gray.12'
})

const courseTimestamp = css({
  fontSize: 'xs',
  color: 'gray.10'
})

const courseStatus = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
})

const statusText = css({
  fontSize: 'xs',
  color: 'gray.11'
})

const overdueLabel = css({
  fontSize: 'xs',
  fontWeight: 'medium',
  color: 'red.11',
  backgroundColor: 'red.3',
  padding: '0.125rem 0.25rem',
  borderRadius: 'xs'
})
