export interface Course {
  id: string
  name: string
  code: string
  prerequisites: Prerequisite[]
  section: string
  subsection: string
  sectionId: string
  subsectionId: string
  completed: boolean
  available: boolean
  description?: string
  level?: CourseLevel
  departments?: string[]
  primaryDepartment?: string
}

export interface Prerequisite {
  type: PrerequisiteType
  code?: string
  description?: string
  required: boolean
  minimum?: number
  totalOptions?: number
  departments?: string[]
  level?: CourseLevel
  alternativePrerequisites?: Prerequisite[]
}

export type PrerequisiteType = 'course' | 'complex' | 'department_choice' | 'level_requirement' | 'alternative_group'

export type CourseLevel = 'A' | 'C' | 'D' | 'W'

export interface Category {
  id: string
  title: string
  subsections: Subsection[]
  description?: string
}

export interface Subsection {
  id: string
  title: string
  parentId: string
  description?: string
}

export interface SpecialRule {
  id: string
  type: SpecialRuleType
  name: string
  description: string
  requirements: Requirement[]
  branch?: 'RMN' | 'RMMC'
  rank?: 'Officer' | 'Enlisted'
}

export type SpecialRuleType = 'OSWP' | 'ESWP' | 'WARFARE_PIN' | 'QUALIFICATION'

export interface Requirement {
  type: RequirementType
  code?: string
  description?: string
  required: boolean
  minimum?: number
  totalOptions?: number
  level?: CourseLevel
  departments?: string[]
  alternativeRequirements?: Requirement[]
}

export type RequirementType = 'course' | 'department_choice' | 'level_requirement' | 'complex' | 'alternative_group'

export interface UserProgress {
  userId: string
  completedCourses: Set<string>
  availableCourses: Set<string>
  inProgressCourses: Set<string>
  waitingGradeCourses: Set<string>
  specialRulesProgress: Map<string, SpecialRuleProgress>
  lastUpdated: Date
}

export interface SpecialRuleProgress {
  ruleId: string
  completed: boolean
  progress: RequirementProgress[]
  eligible: boolean
}

export interface RequirementProgress {
  requirementId: string
  satisfied: boolean
  progress: number
  total: number
  details?: string
}

export interface CourseData {
  courses: Course[]
  categories: Category[]
  specialRules: SpecialRule[]
}

export interface ParsedCourseData extends CourseData {
  courseMap: Map<string, Course>
  categoryMap: Map<string, Category>
  dependencyGraph: Map<string, string[]>
}

export interface EligibilityResult {
  courseCode: string
  eligible: boolean
  missingPrerequisites: MissingPrerequisite[]
  reason?: string
}

export interface MissingPrerequisite {
  type: PrerequisiteType
  description: string
  missing: string[]
  satisfied: string[]
  progress?: number
  total?: number
}

export interface SkillTreeNode {
  id: string
  course: Course
  x: number
  y: number
  connections: string[]
  level: number
  status: NodeStatus
}

export type NodeStatus = 'locked' | 'available' | 'completed' | 'in_progress' | 'waiting_grade'

export interface SkillTreeLayout {
  nodes: SkillTreeNode[]
  connections: Connection[]
  bounds: {
    minX: number
    maxX: number
    minY: number
    maxY: number
  }
}

export interface Connection {
  id: string
  from: string
  to: string
  type: ConnectionType
}

export type ConnectionType = 'prerequisite' | 'alternative' | 'complex'

export interface FilterOptions {
  sections?: string[]
  subsections?: string[]
  departments?: string[]
  levels?: CourseLevel[]
  status?: NodeStatus[]
  search?: string
}

export interface UserSettings {
  theme: 'light' | 'dark'
  layout: 'tree' | 'grid' | 'force'
  showCompleted: boolean
  showUnavailable: boolean
  autoSave: boolean
  language: 'en' | 'cs'
}

export interface AppState {
  courseData: ParsedCourseData | null
  userProgress: UserProgress
  skillTreeLayout: SkillTreeLayout | null
  filters: FilterOptions
  settings: UserSettings
  selectedCourse: Course | null
  loading: boolean
  error: string | null
}
