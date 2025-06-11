import { useCallback, useMemo, useEffect, useState } from 'react'
import type { Course, FilterOptions, UserSettings, UserProgress, ParsedCourseData } from '../types'
import { getCourseMainDepartment } from '../utils/departmentUtils'
import { sortCoursesByNumber } from '../utils/courseUtils'

export type NodeStatus = 'available' | 'locked' | 'completed' | 'in_progress' | 'waiting_grade'

interface UseCourseFilteringProps {
  courses: Course[]
  searchTerm: string
  filters: FilterOptions
  settings: UserSettings
  userProgress: UserProgress
  courseData: ParsedCourseData
}

interface UseCourseFilteringReturn {
  filteredCourses: Course[]
  getCourseStatus: (course: Course) => NodeStatus
  stats: {
    total: number
    completed: number
    available: number
  }
}

export const useCourseFiltering = ({
  courses,
  searchTerm,
  filters,
  settings,
  userProgress,
  courseData
}: UseCourseFilteringProps): UseCourseFilteringReturn => {
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])

  const getCourseStatus = useCallback(
    (course: Course): NodeStatus => {
      if (course.completed) {
        return 'completed'
      }
      if (userProgress.waitingGradeCourses.has(course.code)) {
        return 'waiting_grade'
      }
      if (userProgress.inProgressCourses.has(course.code)) {
        return 'in_progress'
      }
      if (course.available) {
        return 'available'
      }
      return 'locked'
    },
    [userProgress]
  )

  const applyFilters = useCallback(
    (coursesToFilter: Course[]): Course[] => {
      return coursesToFilter.filter((course) => {
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          const matchesSearch =
            course.name.toLowerCase().includes(searchLower) ||
            course.code.toLowerCase().includes(searchLower) ||
            course.section.toLowerCase().includes(searchLower) ||
            course.subsection.toLowerCase().includes(searchLower)

          if (!matchesSearch) {
            return false
          }
        }

        // Section filter
        if (filters.sections && filters.sections.length > 0) {
          if (!filters.sections.includes(course.section)) {
            return false
          }
        }

        // Department filter
        if (filters.departments && filters.departments.length > 0) {
          // Use the dynamic department mapping to determine course's department
          const courseDepartment = getCourseMainDepartment(course, courseData.departmentMappings || new Map())
          if (!filters.departments.includes(courseDepartment)) {
            return false
          }
        }

        // Level filter
        if (filters.levels && filters.levels.length > 0) {
          if (!course.level || !filters.levels.includes(course.level)) {
            return false
          }
        }

        // Status filter
        if (filters.status && filters.status.length > 0) {
          const courseStatus = getCourseStatus(course)
          if (!filters.status.includes(courseStatus)) {
            return false
          }
        }

        // Settings-based filters
        if (!settings.showCompleted && course.completed) {
          return false
        }
        if (!settings.showUnavailable && !course.available && !course.completed) {
          return false
        }

        return true
      })
    },
    [searchTerm, filters, settings, courseData.departmentMappings, getCourseStatus]
  )

  // Apply filters to courses with default sorting
  const filteredCoursesResult = useMemo(() => {
    const filtered = applyFilters(courses)
    // Apply default sorting by course number
    return sortCoursesByNumber(filtered)
  }, [applyFilters, courses])

  // Update state when filtered courses change
  useEffect(() => {
    setFilteredCourses(filteredCoursesResult)
  }, [filteredCoursesResult])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = courseData.courses.length
    const completed = userProgress.completedCourses.size
    const available = filteredCourses.filter((c) => c.available).length

    return { total, completed, available }
  }, [courseData.courses.length, userProgress.completedCourses.size, filteredCourses])

  return {
    filteredCourses,
    getCourseStatus,
    stats
  }
}
