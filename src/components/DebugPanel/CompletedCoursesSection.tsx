import React from 'react'
import { section, sectionTitle, courseList, courseItem } from './DebugPanel.styles'
import { CompletedCoursesSectionProps } from './types'

export const CompletedCoursesSection: React.FC<CompletedCoursesSectionProps> = React.memo(
  ({ courseData, userProgress }) => (
    <div className={section}>
      <h4 className={sectionTitle}>All Completed Courses</h4>
      <ul className={courseList}>
        {Array.from(userProgress.completedCourses).map((code) => (
          <li key={code} className={courseItem}>
            {code}
            {courseData.courses.find((c) => c.code === code)?.name &&
              ` - ${courseData.courses.find((c) => c.code === code)?.name}`}
          </li>
        ))}
      </ul>
    </div>
  )
)

CompletedCoursesSection.displayName = 'CompletedCoursesSection'
