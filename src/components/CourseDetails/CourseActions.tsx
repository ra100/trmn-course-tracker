import React from 'react'
import { CourseActionsProps } from './types'
import { useT } from '../../i18n'
import { ActionButton } from './CourseDetails.styles'

export const CourseActions: React.FC<CourseActionsProps> = ({
  course,
  status,
  onCourseToggle,
  onCourseStatusChange
}) => {
  const t = useT()

  const handleToggleClick = () => {
    if (course.available || course.completed) {
      onCourseToggle(course.code)
    }
  }

  return (
    <>
      <ActionButton variant="primary" onClick={handleToggleClick} disabled={status === 'locked'}>
        {course.completed ? t.courseActions.markIncomplete : t.courseActions.markComplete}
      </ActionButton>

      {onCourseStatusChange && status !== 'locked' && (
        <>
          {status !== 'in_progress' && (
            <ActionButton variant="secondary" onClick={() => onCourseStatusChange(course.code, 'in_progress')}>
              {t.courseActions.workingOn}
            </ActionButton>
          )}
          {status !== 'waiting_grade' && (
            <ActionButton variant="secondary" onClick={() => onCourseStatusChange(course.code, 'waiting_grade')}>
              {t.courseActions.waitingGrade}
            </ActionButton>
          )}
          {(status === 'in_progress' || status === 'waiting_grade') && (
            <ActionButton variant="secondary" onClick={() => onCourseStatusChange(course.code, 'available')}>
              {t.courseActions.resetToAvailable}
            </ActionButton>
          )}
        </>
      )}
    </>
  )
}
