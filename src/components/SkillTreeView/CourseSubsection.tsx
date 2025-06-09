import React from 'react'
import { CourseSubsectionProps } from './types'
import { CourseNode } from '../CourseNode'
import { SubsectionContainer, SubsectionHeader, CourseGrid } from './SkillTreeView.styles'

export const CourseSubsection: React.FC<CourseSubsectionProps> = React.memo(
  ({
    subsectionName,
    courses,
    userProgress,
    getCourseStatus,
    onCourseSelect,
    onCourseToggle,
    onCourseStatusChange
  }) => {
    return (
      <SubsectionContainer>
        {subsectionName !== 'General' && <SubsectionHeader>{subsectionName}</SubsectionHeader>}
        <CourseGrid>
          {courses.map((course) => {
            const status = getCourseStatus(course)
            return (
              <CourseNode
                key={course.id}
                course={course}
                status={status}
                userProgress={userProgress}
                onCourseSelect={onCourseSelect}
                onCourseToggle={onCourseToggle}
                onCourseStatusChange={onCourseStatusChange}
              />
            )
          })}
        </CourseGrid>
      </SubsectionContainer>
    )
  }
)

CourseSubsection.displayName = 'CourseSubsection'
