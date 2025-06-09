import { ParsedCourseData, UserProgress } from '../../types'

export interface DebugPanelProps {
  courseData: ParsedCourseData
  userProgress: UserProgress
}

export interface ParseSummarySectionProps {
  debugData: DebugData
}

export interface DepartmentSectionProps {
  department: string
  courses: DepartmentCourse[]
  userProgress: UserProgress
}

export interface CompletedCoursesSectionProps {
  courseData: ParsedCourseData
  userProgress: UserProgress
}

export interface DepartmentCourse {
  code: string
  name: string
}

export interface DepartmentCourses {
  'Core Requirements': DepartmentCourse[]
  Astrogation: DepartmentCourse[]
  'Flight Operations': DepartmentCourse[]
  Tactical: DepartmentCourse[]
  Engineering: DepartmentCourse[]
  Communications: DepartmentCourse[]
}

export interface DebugData {
  totalCourses: number
  swpRelatedCount: number
  completedCourses: string[]
  departmentCounts: Array<{
    department: string
    count: number
    codes: string[]
  }>
}

export interface UseDebugDataProps {
  courseData: ParsedCourseData
  userProgress: UserProgress
}

export interface UseDebugDataReturn {
  debugData: DebugData
  departmentCourses: DepartmentCourses
}
