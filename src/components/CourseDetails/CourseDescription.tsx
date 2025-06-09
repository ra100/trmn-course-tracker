import React from 'react'
import { CourseDescriptionProps } from './types'
import { useT } from '../../i18n'
import { Section, SectionTitle, DescriptionText } from './CourseDetails.styles'

export const CourseDescription: React.FC<CourseDescriptionProps> = React.memo(({ course }) => {
  const t = useT()

  if (!course.description) {
    return null
  }

  return (
    <Section>
      <SectionTitle>{t.courseDetails.description}</SectionTitle>
      <DescriptionText>{course.description}</DescriptionText>
    </Section>
  )
})

CourseDescription.displayName = 'CourseDescription'
