import React from 'react'
import { section, sectionTitle, courseList, courseItem } from './DebugPanel.styles'
import { DepartmentSectionProps } from './types'

export const DepartmentSection: React.FC<DepartmentSectionProps> = React.memo(
  ({ department, courses, userProgress }) => (
    <div className={section}>
      <h4 className={sectionTitle}>
        {department} ({courses.length} courses)
      </h4>
      <ul className={courseList}>
        {courses.map((course) => (
          <li key={course.code} className={courseItem}>
            {course.code}: {course.name}
            {userProgress.completedCourses.has(course.code) && ' ✅'}
          </li>
        ))}
      </ul>
    </div>
  )
)

DepartmentSection.displayName = 'DepartmentSection'
