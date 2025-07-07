import React from 'react'
import { CourseHeaderProps } from './types'
import { Badge } from '~/components/ui/badge'
import { formatTimestamp, formatTimestampForTooltip } from '../../utils/timestampUtils'
import {
  courseHeader,
  courseTitle,
  courseCode,
  courseSection,
  badgeMargin,
  badgeStatusStyle
} from './CourseDetails.styles'

export const CourseHeader: React.FC<CourseHeaderProps> = React.memo(
  ({ course, status, getStatusText, userProgress }) => {
    // Get timestamp information for this course
    const courseTimestamp = userProgress.courseStatusTimestamps.get(course.code)
    const completionDate = userProgress.courseCompletionDates.get(course.code)
    const isCompleted = userProgress.completedCourses.has(course.code)

    const showTimestamp =
      courseTimestamp && (courseTimestamp.status === 'waiting_grade' || courseTimestamp.status === 'in_progress')
    const showCompletionDate = Boolean(isCompleted && completionDate)

    return (
      <div className={courseHeader}>
        <h2 className={courseTitle}>{course.name}</h2>
        <div className={courseCode}>{course.code}</div>
        <div className={courseSection}>
          {course.section}
          {course.subsection && ` → ${course.subsection}`}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
          <Badge
            variant="solid"
            className={[
              badgeMargin,
              badgeStatusStyle[status as keyof typeof badgeStatusStyle] || badgeStatusStyle.locked
            ].join(' ')}
          >
            {getStatusText()}
          </Badge>
          {showTimestamp && (
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--colors-gray-10)',
                fontStyle: 'italic'
              }}
              title={formatTimestampForTooltip(courseTimestamp.timestamp)}
            >
              {formatTimestamp(courseTimestamp.timestamp)}
            </div>
          )}
          {showCompletionDate && completionDate && (
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--colors-gray-10)',
                fontStyle: 'italic'
              }}
              title={formatTimestampForTooltip(completionDate)}
            >
              Completed: {formatTimestamp(completionDate)}
            </div>
          )}
        </div>
      </div>
    )
  }
)

CourseHeader.displayName = 'CourseHeader'
