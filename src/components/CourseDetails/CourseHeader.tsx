import React from 'react'
import { CourseHeaderProps } from './types'
import { Badge } from '~/components/ui/badge'
import { courseHeader, courseTitle, courseCode, courseSection, badgeMargin } from './CourseDetails.styles'

export const CourseHeader: React.FC<CourseHeaderProps> = React.memo(({ course, status, getStatusText }) => {
  const getBadgeColor = () => {
    switch (status) {
      case 'completed':
        return 'green'
      case 'waiting_grade':
        return 'amber'
      case 'in_progress':
        return 'blue'
      case 'available':
        return 'cyan'
      case 'locked':
        return 'gray'
    }
  }

  return (
    <div className={courseHeader}>
      <h2 className={courseTitle}>{course.name}</h2>
      <div className={courseCode}>{course.code}</div>
      <div className={courseSection}>
        {course.section}
        {course.subsection && ` → ${course.subsection}`}
      </div>
      <Badge variant="solid" colorPalette={getBadgeColor()} className={badgeMargin}>
        {getStatusText()}
      </Badge>
    </div>
  )
})

CourseHeader.displayName = 'CourseHeader'
