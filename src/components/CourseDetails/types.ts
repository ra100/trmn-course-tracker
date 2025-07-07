import { Course, UserProgress } from '../../types'
import { EligibilityEngine } from '../../utils/eligibilityEngine'

export interface CourseDetailsProps {
  course: Course | null
  userProgress: UserProgress
  eligibilityEngine: EligibilityEngine
  onCourseToggle: (courseCode: string) => void
  onCourseStatusChange?: (
    courseCode: string,
    status: 'available' | 'in_progress' | 'waiting_grade' | 'completed'
  ) => void
  onCourseSelect?: (course: Course) => void
}

export interface CourseHeaderProps {
  course: Course
  status: CourseStatus
  getStatusText: () => string
  userProgress: UserProgress
}

export interface CourseActionsProps {
  course: Course
  status: CourseStatus
  onCourseToggle: (courseCode: string) => void
  onCourseStatusChange?: (
    courseCode: string,
    status: 'available' | 'in_progress' | 'waiting_grade' | 'completed'
  ) => void
}

export interface PrerequisitesSectionProps {
  prerequisites: PrerequisiteInfo[]
  onCourseSelect?: (course: Course) => void
  handleCourseClick: (courseCode: string) => void
}

export interface UnlockedCoursesSectionProps {
  unlockedCourses: Course[]
  onCourseSelect?: (course: Course) => void
  handleCourseClick: (courseCode: string) => void
}

export interface CourseDescriptionProps {
  course: Course
}

export type CourseStatus = 'completed' | 'available' | 'locked' | 'in_progress' | 'waiting_grade'

export interface PrerequisiteInfo {
  text: string
  satisfied: boolean
  type: 'course' | 'alternative_group' | 'department_choice' | 'complex'
  courseCode?: string
  courseCodes?: string[]
  progress?: number
  total?: number
}

export interface UseCourseDetailsReturn {
  status: CourseStatus
  getStatusText: () => string
  prerequisites: PrerequisiteInfo[]
  unlockedCourses: Course[]
  handleToggleClick: () => void
  handleCourseClick: (courseCode: string) => void
}
