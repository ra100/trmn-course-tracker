import React from 'react'
import { CourseSectionProps } from './types'
import { CourseSubsection } from './CourseSubsection'
import { categorySection, categoryHeader } from './SkillTreeView.styles'

export const CourseSection: React.FC<CourseSectionProps> = React.memo(
  ({ sectionName, courses, userProgress, getCourseStatus, onCourseSelect, onCourseToggle, onCourseStatusChange }) => {
    return (
      <div className={categorySection}>
        <div className={categoryHeader}>{sectionName}</div>
        <CourseSubsection
          subsectionName="General"
          courses={courses}
          userProgress={userProgress}
          getCourseStatus={getCourseStatus}
          onCourseSelect={onCourseSelect}
          onCourseToggle={onCourseToggle}
          onCourseStatusChange={onCourseStatusChange}
        />
      </div>
    )
  }
)

CourseSection.displayName = 'CourseSection'
