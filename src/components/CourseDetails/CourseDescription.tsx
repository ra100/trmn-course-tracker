import React from 'react'
import { CourseDescriptionProps } from './types'
import { useT } from '~/i18n'
import { section, sectionTitle, descriptionText } from './CourseDetails.styles'

export const CourseDescription: React.FC<CourseDescriptionProps> = React.memo(({ course }) => {
  const t = useT()

  if (!course.description) {
    return null
  }

  return (
    <div className={section}>
      <h3 className={sectionTitle}>{t.courseDetails.description}</h3>
      <div className={descriptionText}>{course.description}</div>
    </div>
  )
})

CourseDescription.displayName = 'CourseDescription'
