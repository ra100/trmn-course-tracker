import React from 'react'
import { CourseHeaderProps } from './types'
import { Badge } from '~/components/ui/badge'
import {
  courseHeader,
  courseTitle,
  courseCode,
  courseSection,
  badgeMargin,
  badgeStatusStyle
} from './CourseDetails.styles'

export const CourseHeader: React.FC<CourseHeaderProps> = React.memo(({ course, status, getStatusText }) => {
  return (
    <div className={courseHeader}>
      <h2 className={courseTitle}>{course.name}</h2>
      <div className={courseCode}>{course.code}</div>
      <div className={courseSection}>
        {course.section}
        {course.subsection && ` → ${course.subsection}`}
      </div>
      <Badge
        variant="solid"
        className={[
          badgeMargin,
          badgeStatusStyle[status as keyof typeof badgeStatusStyle] || badgeStatusStyle.locked
        ].join(' ')}
      >
        {getStatusText()}
      </Badge>
    </div>
  )
})

CourseHeader.displayName = 'CourseHeader'
