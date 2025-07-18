import React, { useMemo, useCallback } from 'react'
import { CategoryCourseRendererProps } from './types'
import { getCourseMainDepartment } from '~/utils/departmentUtils'
import {
  getCourseSeriesCodes,
  getCourseSeriesPrefix,
  getSeriesDisplayName,
  sortCoursesByNumber
} from '~/utils/courseUtils'
import { useT } from '~/i18n'
import { CourseSection } from './CourseSection'
import { CourseSubsection } from './CourseSubsection'
import { categorySection, categoryHeader } from './SkillTreeView.styles'
import { Course } from '~/types'
import { css } from 'styled-system/css'

type GroupedCourses = Map<string, Course[]>
type NestedGroupedCourses = Map<string, Map<string, Course[]>>

/**
 * Optimized CategoryCourseRenderer component that efficiently renders courses
 * grouped by category, department, or series with memoized computations.
 *
 * Performance optimizations:
 * - useMemo for expensive grouping operations
 * - useCallback for render functions to prevent unnecessary re-renders
 * - Early memoization of series codes to avoid repeated calculations
 * - Efficient Map operations for grouping instead of repeated array operations
 */
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
    const t = useT()

    // Helper function to get translated department name
    const getDepartmentDisplayName = useCallback(
      (departmentName: string): string => {
        return t.filters.departmentLabels[departmentName as keyof typeof t.filters.departmentLabels] || departmentName
      },
      [t]
    )

    // Memoize the course series codes to avoid recalculation
    const seriesCodes = useMemo(() => getCourseSeriesCodes(courseData.seriesMappings), [courseData.seriesMappings])

    // Memoize categorized courses grouping
    const categorizedCourses = useMemo((): NestedGroupedCourses => {
      const result = new Map<string, Map<string, Course[]>>()

      filteredCourses.forEach((course) => {
        if (!result.has(course.section)) {
          result.set(course.section, new Map())
        }

        const sectionMap = result.get(course.section)
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

      return result
    }, [filteredCourses])

    // Memoize department courses grouping
    const departmentCourses = useMemo((): GroupedCourses => {
      const result = new Map<string, Course[]>()
      const departmentMappings = courseData.departmentMappings || new Map()

      filteredCourses.forEach((course) => {
        const assignedDepartment = getCourseMainDepartment(course, departmentMappings)

        if (!result.has(assignedDepartment)) {
          result.set(assignedDepartment, [])
        }
        const deptCourses = result.get(assignedDepartment)
        if (deptCourses) {
          deptCourses.push(course)
        }
      })

      return result
    }, [filteredCourses, courseData.departmentMappings])

    // Memoize series courses grouping
    const seriesCourses = useMemo((): GroupedCourses => {
      const result = new Map<string, Course[]>()

      filteredCourses.forEach((course) => {
        const seriesPrefix = getCourseSeriesPrefix(course.code, seriesCodes)

        if (!result.has(seriesPrefix)) {
          result.set(seriesPrefix, [])
        }
        const courses = result.get(seriesPrefix)
        if (courses) {
          courses.push(course)
        }
      })

      return result
    }, [filteredCourses, seriesCodes])

    // Memoized render function for categories
    const renderCoursesByCategory = useCallback(() => {
      return Array.from(categorizedCourses.entries()).map(([sectionName, subsections]) => (
        <div key={sectionName} className={categorySection}>
          <div className={categoryHeader}>{sectionName}</div>
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
        </div>
      ))
    }, [categorizedCourses, userProgress, getCourseStatus, onCourseSelect, onCourseToggle, onCourseStatusChange])

    // Memoized render function for departments
    const renderCoursesByDepartment = useCallback(() => {
      const sortedDepartments = Array.from(departmentCourses.keys()).sort()

      return sortedDepartments.map((departmentName) => {
        const courses = departmentCourses.get(departmentName)
        if (!courses) {
          return null
        }

        return (
          <CourseSection
            key={departmentName}
            sectionName={getDepartmentDisplayName(departmentName)}
            courses={courses}
            userProgress={userProgress}
            getCourseStatus={getCourseStatus}
            onCourseSelect={onCourseSelect}
            onCourseToggle={onCourseToggle}
            onCourseStatusChange={onCourseStatusChange}
          />
        )
      })
    }, [
      departmentCourses,
      getDepartmentDisplayName,
      userProgress,
      getCourseStatus,
      onCourseSelect,
      onCourseToggle,
      onCourseStatusChange
    ])

    // Memoized render function for series
    const renderCoursesBySeries = useCallback(() => {
      const sortedSeries = Array.from(seriesCourses.keys()).sort()

      return sortedSeries.map((seriesPrefix) => {
        const courses = seriesCourses.get(seriesPrefix)
        if (!courses) {
          return null
        }

        const sortedCourses = sortCoursesByNumber(courses)
        const displayName = getSeriesDisplayName(seriesPrefix, courseData.seriesMappings)

        return (
          <CourseSection
            key={seriesPrefix}
            sectionName={displayName}
            courses={sortedCourses}
            userProgress={userProgress}
            getCourseStatus={getCourseStatus}
            onCourseSelect={onCourseSelect}
            onCourseToggle={onCourseToggle}
            onCourseStatusChange={onCourseStatusChange}
          />
        )
      })
    }, [
      seriesCourses,
      courseData.seriesMappings,
      userProgress,
      getCourseStatus,
      onCourseSelect,
      onCourseToggle,
      onCourseStatusChange
    ])

    // Memoize the final render result based on grouping mode
    return useMemo(() => {
      // Show "No results found" message when no courses match filters
      if (filteredCourses.length === 0) {
        return (
          <div
            className={css({
              textAlign: 'center',
              padding: '2rem',
              color: 'gray.500',
              fontSize: 'lg'
            })}
          >
            {t.errors?.noCoursesFound || 'No courses found matching current filters'}
          </div>
        )
      }

      switch (groupingMode) {
        case 'department':
          return renderCoursesByDepartment()
        case 'series':
          return renderCoursesBySeries()
        default:
          return renderCoursesByCategory()
      }
    }, [
      groupingMode,
      renderCoursesByDepartment,
      renderCoursesBySeries,
      renderCoursesByCategory,
      filteredCourses.length,
      t
    ])
  }
)

CategoryCourseRenderer.displayName = 'CategoryCourseRenderer'
