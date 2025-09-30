import { ParsedCourseData, Course, Category, SpecialRule, CourseAlias } from '../types'
import { logger } from './logger'

interface SerializedCourseData {
  courses: Course[]
  categories: Category[]
  specialRules: SpecialRule[]
  departmentMappings: Record<string, string[]>
  seriesMappings: Array<[string, string]>
  courseMap: Array<[string, Course]>
  categoryMap: Array<[string, Category]>
  dependencyGraph: Array<[string, string[]]>
  courseAliases?: CourseAlias[]
  aliasMap?: Array<[string, string]>
  buildTimestamp: string
}

export async function loadCourseData(): Promise<ParsedCourseData> {
  try {
    const response = await fetch('./courses.json')
    if (!response.ok) {
      throw new Error(`Failed to load course data: ${response.status} ${response.statusText}`)
    }

    const data: SerializedCourseData = await response.json()

    // Reconstruct Maps from serialized arrays
    const courseMap = new Map<string, Course>(data.courseMap)
    const categoryMap = new Map<string, Category>(data.categoryMap)
    const dependencyGraph = new Map<string, string[]>(data.dependencyGraph)
    const departmentMappings = new Map<string, string[]>(Object.entries(data.departmentMappings))
    const seriesMappings = new Map<string, string>(data.seriesMappings || [])
    const aliasMap = new Map<string, string>(data.aliasMap || [])

    logger.group('📄 Course Data Loader')
    logger.log('📚 Total courses loaded:', data.courses.length)
    logger.log('📋 Categories loaded:', data.categories.length)
    logger.log('⚡ Special rules loaded:', data.specialRules.length)
    logger.log('🗂️ Department mappings loaded:', departmentMappings.size)
    logger.log('📺 Series mappings loaded:', seriesMappings.size)
    logger.log('🕒 Built at:', data.buildTimestamp)
    logger.groupEnd()

    return {
      courses: data.courses,
      categories: data.categories,
      specialRules: data.specialRules,
      departmentMappings,
      seriesMappings,
      courseMap,
      categoryMap,
      dependencyGraph,
      courseAliases: data.courseAliases,
      aliasMap
    }
  } catch (error) {
    logger.error('Failed to load course data:', error)
    throw error
  }
}
