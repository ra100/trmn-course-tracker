/* eslint-disable no-console */
import { ParsedCourseData, Course, Category, SpecialRule } from '../types'
import { isDebugEnabled } from '../config'

interface SerializedCourseData {
  courses: Course[]
  categories: Category[]
  specialRules: SpecialRule[]
  departmentMappings: Record<string, string[]>
  courseMap: Array<[string, Course]>
  categoryMap: Array<[string, Category]>
  dependencyGraph: Array<[string, string[]]>
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

    if (isDebugEnabled()) {
      console.group('📄 Course Data Loader')
      console.log('📚 Total courses loaded:', data.courses.length)
      console.log('📋 Categories loaded:', data.categories.length)
      console.log('⚡ Special rules loaded:', data.specialRules.length)
      console.log('🗂️ Department mappings loaded:', departmentMappings.size)
      console.log('🕒 Built at:', data.buildTimestamp)
      console.groupEnd()
    }

    return {
      courses: data.courses,
      categories: data.categories,
      specialRules: data.specialRules,
      departmentMappings,
      courseMap,
      categoryMap,
      dependencyGraph
    }
  } catch (error) {
    if (isDebugEnabled()) {
      console.error('Failed to load course data:', error)
    }
    throw error
  }
}
