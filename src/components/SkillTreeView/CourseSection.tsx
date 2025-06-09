import React from 'react'
import { CourseSectionProps } from './types'
import { CourseSubsection } from './CourseSubsection'
import { CategorySection, CategoryHeader } from './SkillTreeView.styles'

export const CourseSection: React.FC<CourseSectionProps> = React.memo(
  ({ sectionName, courses, userProgress, getCourseStatus, onCourseSelect, onCourseToggle, onCourseStatusChange }) => {
    return (
      <CategorySection>
        <CategoryHeader>{sectionName}</CategoryHeader>
        <CourseSubsection
          subsectionName="General"
          courses={courses}
          userProgress={userProgress}
          getCourseStatus={getCourseStatus}
          onCourseSelect={onCourseSelect}
          onCourseToggle={onCourseToggle}
          onCourseStatusChange={onCourseStatusChange}
        />
      </CategorySection>
    )
  }
)

CourseSection.displayName = 'CourseSection'
