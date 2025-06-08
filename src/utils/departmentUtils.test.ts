import { describe, it, expect } from 'vitest'
import {
  normalizeDepartmentName,
  getCourseMainDepartment,
  courseMatchesDepartment,
  getAllDepartments,
  findCoursesByDepartmentAndLevel
} from './departmentUtils'
import { Course, ParsedCourseData } from '../types'

describe('departmentUtils', () => {
  const mockDepartmentMappings = new Map([
    [
      'tactical',
      ['fire control', 'electronic warfare', 'tracking', 'sensor', 'missile', 'beam weapons', 'gunner', 'weapons']
    ],
    ['engineering', ['impeller', 'power', 'gravitics', 'environmental', 'hydroponics', 'damage control']],
    ['communications', ['data systems', 'electronics', 'communications']],
    ['astrogation', ['astrogation', 'flight operations', 'coxswain', 'helmsman', 'plotting', 'quartermaster']],
    ['medical', ['medical', 'corpsman', 'medic', 'sick berth', 'surgeon']],
    ['command', ['boatswain', 'master-at-arms', 'operations', 'intelligence', 'command']]
  ])

  const mockCourse: Course = {
    id: '1',
    code: 'TEST-001',
    name: 'Test Course',
    section: 'SINA TSC Tactical',
    subsection: 'Fire Control School',
    sectionId: 'tactical',
    subsectionId: 'fire-control',
    level: 'A',
    prerequisites: [],
    available: true,
    completed: false
  }

  const mockCourseData: ParsedCourseData = {
    courses: [
      mockCourse,
      {
        id: '2',
        code: 'TEST-002',
        name: 'Engineering Course',
        section: 'SINA TSC Engineering',
        subsection: 'Impeller School',
        sectionId: 'engineering',
        subsectionId: 'impeller',
        level: 'C',
        prerequisites: [],
        available: true,
        completed: false
      },
      {
        id: '3',
        code: 'TEST-003',
        name: 'Medical Course',
        section: 'SINA TSC Medical',
        subsection: 'Corpsman School',
        sectionId: 'medical',
        subsectionId: 'corpsman',
        level: 'A',
        prerequisites: [],
        available: true,
        completed: false
      }
    ],
    courseMap: new Map(),
    categoryMap: new Map(),
    dependencyGraph: new Map(),
    categories: [],
    specialRules: [],
    departmentMappings: mockDepartmentMappings
  }

  // Set up course map
  mockCourseData.courses.forEach((course) => {
    mockCourseData.courseMap.set(course.code, course)
  })

  describe('normalizeDepartmentName', () => {
    it('should normalize subsection names to departments', () => {
      expect(normalizeDepartmentName('Fire Control School', mockDepartmentMappings)).toBe('Tactical')
      expect(normalizeDepartmentName('Impeller School', mockDepartmentMappings)).toBe('Engineering')
      expect(normalizeDepartmentName('Corpsman School', mockDepartmentMappings)).toBe('Medical')
    })

    it('should handle case insensitive matching', () => {
      expect(normalizeDepartmentName('FIRE CONTROL', mockDepartmentMappings)).toBe('Tactical')
      expect(normalizeDepartmentName('fire control', mockDepartmentMappings)).toBe('Tactical')
    })

    it('should return null for unknown names', () => {
      expect(normalizeDepartmentName('Unknown School', mockDepartmentMappings)).toBeNull()
      expect(normalizeDepartmentName('', mockDepartmentMappings)).toBeNull()
    })
  })

  describe('getCourseMainDepartment', () => {
    it('should determine department from subsection first', () => {
      expect(getCourseMainDepartment(mockCourse, mockDepartmentMappings)).toBe('Tactical')
    })

    it('should fall back to section if subsection does not match', () => {
      const courseWithoutMatchingSubsection: Course = {
        ...mockCourse,
        subsection: 'Unknown Subsection',
        section: 'SINA TSC Engineering'
      }
      expect(getCourseMainDepartment(courseWithoutMatchingSubsection, mockDepartmentMappings)).toBe('Engineering')
    })

    it('should return Other for unmatched courses', () => {
      const unknownCourse: Course = {
        ...mockCourse,
        section: 'Unknown Section',
        subsection: 'Unknown Subsection'
      }
      expect(getCourseMainDepartment(unknownCourse, mockDepartmentMappings)).toBe('Other')
    })
  })

  describe('courseMatchesDepartment', () => {
    it('should match courses to their correct departments', () => {
      expect(courseMatchesDepartment(mockCourse, 'Tactical', mockDepartmentMappings)).toBe(true)
      expect(courseMatchesDepartment(mockCourse, 'Engineering', mockDepartmentMappings)).toBe(false)
    })
  })

  describe('getAllDepartments', () => {
    it('should return all unique departments from courses', () => {
      const departments = getAllDepartments(mockCourseData)
      expect(departments).toContain('Tactical')
      expect(departments).toContain('Engineering')
      expect(departments).toContain('Medical')
      expect(departments.length).toBe(3)
    })

    it('should return sorted departments', () => {
      const departments = getAllDepartments(mockCourseData)
      expect(departments).toEqual(['Engineering', 'Medical', 'Tactical'])
    })
  })

  describe('findCoursesByDepartmentAndLevel', () => {
    it('should find courses by department and level', () => {
      const courses = findCoursesByDepartmentAndLevel(mockCourseData, ['Tactical'], 'A')
      expect(courses).toHaveLength(1)
      expect(courses[0].code).toBe('TEST-001')
    })

    it('should find courses by multiple departments', () => {
      const courses = findCoursesByDepartmentAndLevel(mockCourseData, ['Tactical', 'Medical'], 'A')
      expect(courses).toHaveLength(2)
      expect(courses.map((c) => c.code)).toContain('TEST-001')
      expect(courses.map((c) => c.code)).toContain('TEST-003')
    })

    it('should filter by level when specified', () => {
      const courses = findCoursesByDepartmentAndLevel(mockCourseData, ['Engineering'], 'C')
      expect(courses).toHaveLength(1)
      expect(courses[0].code).toBe('TEST-002')
    })

    it('should return all department courses when no level specified', () => {
      const courses = findCoursesByDepartmentAndLevel(mockCourseData, ['Tactical'])
      expect(courses).toHaveLength(1)
      expect(courses[0].code).toBe('TEST-001')
    })
  })
})
