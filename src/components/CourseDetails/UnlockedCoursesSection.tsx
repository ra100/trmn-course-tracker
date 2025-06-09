import React from 'react'
import { UnlockedCoursesSectionProps } from './types'
import { useT } from '../../i18n'
import {
  Section,
  SectionTitle,
  UnlockedCoursesList,
  UnlockedCourseItem,
  ClickableUnlockedCourse
} from './CourseDetails.styles'

export const UnlockedCoursesSection: React.FC<UnlockedCoursesSectionProps> = React.memo(
  ({ unlockedCourses, onCourseSelect, handleCourseClick }) => {
    const t = useT()

    if (unlockedCourses.length === 0) {
      return null
    }

    return (
      <Section>
        <SectionTitle>{t.courseDetails.unlocksCourses}</SectionTitle>
        <UnlockedCoursesList>
          {unlockedCourses.map((unlockedCourse) =>
            onCourseSelect ? (
              <ClickableUnlockedCourse key={unlockedCourse.id} onClick={() => handleCourseClick(unlockedCourse.code)}>
                <strong>{unlockedCourse.code}</strong> - {unlockedCourse.name}
              </ClickableUnlockedCourse>
            ) : (
              <UnlockedCourseItem key={unlockedCourse.id}>
                <strong>{unlockedCourse.code}</strong> - {unlockedCourse.name}
              </UnlockedCourseItem>
            )
          )}
        </UnlockedCoursesList>
      </Section>
    )
  }
)

UnlockedCoursesSection.displayName = 'UnlockedCoursesSection'
