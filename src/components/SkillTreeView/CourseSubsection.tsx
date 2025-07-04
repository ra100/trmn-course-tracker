import React from 'react'
import { CourseSubsectionProps } from './types'
import { CourseNode } from '../CourseNode'
import { subsectionContainer, subsectionHeader, courseGrid } from './SkillTreeView.styles'

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
      <div className={subsectionContainer}>
        {subsectionName !== 'General' && <div className={subsectionHeader}>{subsectionName}</div>}
        <div className={courseGrid}>
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
        </div>
      </div>
    )
  }
)

CourseSubsection.displayName = 'CourseSubsection'
