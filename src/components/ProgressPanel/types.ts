// Shared interfaces for ProgressPanel components

export interface OverallStats {
  totalCourses: number
  completedCourses: number
  inProgressCourses: number
  waitingGradeCourses: number
  availableCourses: number
  completionPercentage: number
}

export interface SectionProgressData {
  section: string
  completed: number
  total: number
  percentage: number
}

export interface LevelProgressData {
  level: string
  completed: number
  total: number
  percentage: number
}

export interface Achievement {
  title: string
  description: string
  completed: boolean
}

export interface PinRequirement {
  id: string
  name: string
  courseCode?: string
  type: 'course' | 'department_choice'
  completed: boolean
  level?: string
  departments?: string[]
  minimum?: number
  satisfied?: number
  description?: string
}

export interface PinProgress {
  name: string
  type: 'OSWP' | 'ESWP'
  earned: boolean
  requirements: PinRequirement[]
  overallProgress: number
}
