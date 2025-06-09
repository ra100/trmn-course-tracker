import React from 'react'
import { Section, SectionTitle, CourseList, CourseItem } from './DebugPanel.styles'
import { DepartmentSectionProps } from './types'

export const DepartmentSection: React.FC<DepartmentSectionProps> = React.memo(
  ({ department, courses, userProgress }) => (
    <Section>
      <SectionTitle>
        {department} ({courses.length} courses)
      </SectionTitle>
      <CourseList>
        {courses.map((course) => (
          <CourseItem key={course.code}>
            {course.code}: {course.name}
            {userProgress.completedCourses.has(course.code) && ' ✅'}
          </CourseItem>
        ))}
      </CourseList>
    </Section>
  )
)

DepartmentSection.displayName = 'DepartmentSection'
