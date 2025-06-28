import React from 'react'
import { UnlockedCoursesSectionProps } from './types'
import { useT } from '~/i18n'
import {
  section,
  sectionTitle,
  unlockedCoursesList,
  unlockedCourseItem,
  clickableUnlockedCourse
} from './CourseDetails.styles'

export const UnlockedCoursesSection: React.FC<UnlockedCoursesSectionProps> = React.memo(
  ({ unlockedCourses, onCourseSelect, handleCourseClick }) => {
    const t = useT()

    if (unlockedCourses.length === 0) {
      return null
    }

    return (
      <div className={section}>
        <h3 className={sectionTitle}>{t.courseDetails.unlocksCourses}</h3>
        <div className={unlockedCoursesList}>
          {unlockedCourses.map((unlockedCourse) =>
            onCourseSelect ? (
              <div
                key={unlockedCourse.id}
                onClick={() => handleCourseClick(unlockedCourse.code)}
                className={clickableUnlockedCourse}
              >
                <strong>{unlockedCourse.code}</strong> - {unlockedCourse.name}
              </div>
            ) : (
              <div key={unlockedCourse.id} className={unlockedCourseItem}>
                <strong>{unlockedCourse.code}</strong> - {unlockedCourse.name}
              </div>
            )
          )}
        </div>
      </div>
    )
  }
)

UnlockedCoursesSection.displayName = 'UnlockedCoursesSection'
