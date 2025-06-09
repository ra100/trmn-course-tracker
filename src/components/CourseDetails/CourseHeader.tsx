import React from 'react'
import { CourseHeaderProps } from './types'
import {
  CourseHeader as CourseHeaderContainer,
  CourseTitle,
  CourseCode,
  CourseSection,
  StatusBadge
} from './CourseDetails.styles'

export const CourseHeader: React.FC<CourseHeaderProps> = React.memo(({ course, status, getStatusText }) => {
  return (
    <CourseHeaderContainer>
      <CourseTitle>{course.name}</CourseTitle>
      <CourseCode>{course.code}</CourseCode>
      <CourseSection>
        {course.section}
        {course.subsection && ` → ${course.subsection}`}
      </CourseSection>
      <StatusBadge status={status}>{getStatusText()}</StatusBadge>
    </CourseHeaderContainer>
  )
})

CourseHeader.displayName = 'CourseHeader'
