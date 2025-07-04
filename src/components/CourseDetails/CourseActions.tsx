import React from 'react'
import { CourseActionsProps } from './types'
import { useT } from '~/i18n'
import { Button } from '~/components/ui/button'
import { css } from 'styled-system/css'

export const CourseActions: React.FC<CourseActionsProps> = React.memo(
  ({ course, status, onCourseToggle, onCourseStatusChange }) => {
    const t = useT()

    const handleToggleClick = () => {
      if (course.available || course.completed) {
        onCourseToggle(course.code)
      }
    }

    const buttonStyle = css({
      marginTop: '1rem',
      marginRight: '0.5rem'
    })

    return (
      <>
        <Button onClick={handleToggleClick} disabled={status === 'locked'} className={buttonStyle}>
          {course.completed ? t.courseActions.markIncomplete : t.courseActions.markComplete}
        </Button>

        {onCourseStatusChange && status !== 'locked' && (
          <>
            {status !== 'in_progress' && (
              <Button
                variant="outline"
                onClick={() => onCourseStatusChange(course.code, 'in_progress')}
                className={buttonStyle}
              >
                {t.courseActions.workingOn}
              </Button>
            )}
            {status !== 'waiting_grade' && (
              <Button
                variant="outline"
                onClick={() => onCourseStatusChange(course.code, 'waiting_grade')}
                className={buttonStyle}
              >
                {t.courseActions.waitingGrade}
              </Button>
            )}
            {(status === 'in_progress' || status === 'waiting_grade') && (
              <Button
                variant="outline"
                onClick={() => onCourseStatusChange(course.code, 'available')}
                className={buttonStyle}
              >
                {t.courseActions.resetToAvailable}
              </Button>
            )}
          </>
        )}
      </>
    )
  }
)

CourseActions.displayName = 'CourseActions'
