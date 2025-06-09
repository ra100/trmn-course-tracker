import React from 'react'
import { CategoryCourseRendererProps } from './types'
import { getCourseMainDepartment } from '../../utils/departmentUtils'
import { CourseSection } from './CourseSection'
import { CourseSubsection } from './CourseSubsection'
import { CategorySection, CategoryHeader } from './SkillTreeView.styles'

export const CategoryCourseRenderer: React.FC<CategoryCourseRendererProps> = React.memo(
  ({
    filteredCourses,
    groupingMode,
    userProgress,
    courseData,
    getCourseStatus,
    onCourseSelect,
    onCourseToggle,
    onCourseStatusChange
  }) => {
    const renderCoursesByCategory = () => {
      const categorizedCourses = new Map<string, Map<string, typeof filteredCourses>>()

      filteredCourses.forEach((course) => {
        if (!categorizedCourses.has(course.section)) {
          categorizedCourses.set(course.section, new Map())
        }

        const sectionMap = categorizedCourses.get(course.section)
        if (sectionMap) {
          const subsection = course.subsection || 'General'

          if (!sectionMap.has(subsection)) {
            sectionMap.set(subsection, [])
          }

          const subsectionCourses = sectionMap.get(subsection)
          if (subsectionCourses) {
            subsectionCourses.push(course)
          }
        }
      })

      return Array.from(categorizedCourses.entries()).map(([sectionName, subsections]) => (
        <CategorySection key={sectionName}>
          <CategoryHeader>{sectionName}</CategoryHeader>
          {Array.from(subsections.entries()).map(([subsectionName, courses]) => (
            <CourseSubsection
              key={`${sectionName}-${subsectionName}`}
              subsectionName={subsectionName}
              courses={courses}
              userProgress={userProgress}
              getCourseStatus={getCourseStatus}
              onCourseSelect={onCourseSelect}
              onCourseToggle={onCourseToggle}
              onCourseStatusChange={onCourseStatusChange}
            />
          ))}
        </CategorySection>
      ))
    }

    const renderCoursesByDepartment = () => {
      const departmentCourses = new Map<string, typeof filteredCourses>()

      // Group courses by department using dynamic mappings
      filteredCourses.forEach((course) => {
        const assignedDepartment = getCourseMainDepartment(course, courseData.departmentMappings || new Map())

        if (!departmentCourses.has(assignedDepartment)) {
          departmentCourses.set(assignedDepartment, [])
        }
        const deptCourses = departmentCourses.get(assignedDepartment)
        if (deptCourses) {
          deptCourses.push(course)
        }
      })

      // Sort departments and render
      const sortedDepartments = Array.from(departmentCourses.keys()).sort()

      return sortedDepartments.map((departmentName) => {
        const courses = departmentCourses.get(departmentName)
        if (!courses) {
          return null
        }

        return (
          <CourseSection
            key={departmentName}
            sectionName={departmentName}
            courses={courses}
            userProgress={userProgress}
            getCourseStatus={getCourseStatus}
            onCourseSelect={onCourseSelect}
            onCourseToggle={onCourseToggle}
            onCourseStatusChange={onCourseStatusChange}
          />
        )
      })
    }

    if (groupingMode === 'department') {
      return renderCoursesByDepartment()
    }

    return renderCoursesByCategory()
  }
)

CategoryCourseRenderer.displayName = 'CategoryCourseRenderer'
