import React from 'react'
import { Section, SectionTitle, CourseList, CourseItem } from './DebugPanel.styles'
import { CompletedCoursesSectionProps } from './types'

export const CompletedCoursesSection: React.FC<CompletedCoursesSectionProps> = React.memo(
  ({ courseData, userProgress }) => (
    <Section>
      <SectionTitle>All Completed Courses</SectionTitle>
      <CourseList>
        {Array.from(userProgress.completedCourses).map((code) => (
          <CourseItem key={code}>
            {code}
            {courseData.courses.find((c) => c.code === code)?.name &&
              ` - ${courseData.courses.find((c) => c.code === code)?.name}`}
          </CourseItem>
        ))}
      </CourseList>
    </Section>
  )
)

CompletedCoursesSection.displayName = 'CompletedCoursesSection'
