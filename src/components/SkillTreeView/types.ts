import { ParsedCourseData, UserProgress, Course, FilterOptions, UserSettings } from '../../types'
import { EligibilityEngine } from '../../utils/eligibilityEngine'

export interface SkillTreeViewProps {
  courseData: ParsedCourseData
  userProgress: UserProgress
  filters: FilterOptions
  settings: UserSettings
  eligibilityEngine: EligibilityEngine
  onCourseSelect: (course: Course) => void
  onCourseToggle: (courseCode: string) => void
  onCourseStatusChange: (
    courseCode: string,
    status: 'available' | 'in_progress' | 'waiting_grade' | 'completed'
  ) => void
}

export interface CourseSearchProps {
  searchTerm: string
  onSearchChange: (searchTerm: string) => void
}

export interface GroupingControlsProps {
  groupingMode: 'section' | 'department'
  onGroupingModeChange: (mode: 'section' | 'department') => void
}

export interface CourseStatsProps {
  stats: {
    completed: number
    available: number
    total: number
  }
}

export interface CourseSectionProps {
  sectionName: string
  courses: Course[]
  userProgress: UserProgress
  getCourseStatus: (course: Course) => 'locked' | 'available' | 'completed' | 'in_progress' | 'waiting_grade'
  onCourseSelect: (course: Course) => void
  onCourseToggle: (courseCode: string) => void
  onCourseStatusChange: (
    courseCode: string,
    status: 'available' | 'in_progress' | 'waiting_grade' | 'completed'
  ) => void
}

export interface CourseSubsectionProps {
  subsectionName: string
  courses: Course[]
  userProgress: UserProgress
  getCourseStatus: (course: Course) => 'locked' | 'available' | 'completed' | 'in_progress' | 'waiting_grade'
  onCourseSelect: (course: Course) => void
  onCourseToggle: (courseCode: string) => void
  onCourseStatusChange: (
    courseCode: string,
    status: 'available' | 'in_progress' | 'waiting_grade' | 'completed'
  ) => void
}

export interface CategoryCourseRendererProps {
  filteredCourses: Course[]
  groupingMode: 'section' | 'department'
  userProgress: UserProgress
  courseData: ParsedCourseData
  getCourseStatus: (course: Course) => 'locked' | 'available' | 'completed' | 'in_progress' | 'waiting_grade'
  onCourseSelect: (course: Course) => void
  onCourseToggle: (courseCode: string) => void
  onCourseStatusChange: (
    courseCode: string,
    status: 'available' | 'in_progress' | 'waiting_grade' | 'completed'
  ) => void
}

export type GroupingMode = 'section' | 'department'
