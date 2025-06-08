import { renderHook } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { useCourseFiltering } from './useCourseFiltering'
import type { Course, UserSettings, UserProgress, ParsedCourseData } from '../types'

describe('useCourseFiltering', () => {
  let mockCourses: Course[]
  let mockUserProgress: UserProgress
  let mockSettings: UserSettings
  let mockCourseData: ParsedCourseData

  beforeEach(() => {
    mockCourses = [
      {
        id: '1',
        code: 'TEST-001',
        name: 'Test Course 1',
        section: 'Test Section',
        subsection: 'Test Subsection',
        sectionId: 'test-section',
        subsectionId: 'test-subsection',
        level: 'C',
        prerequisites: [],
        available: true,
        completed: false
      },
      {
        id: '2',
        code: 'TEST-002',
        name: 'Test Course 2',
        section: 'Test Section',
        subsection: 'Test Subsection',
        sectionId: 'test-section',
        subsectionId: 'test-subsection',
        level: 'D',
        prerequisites: [],
        available: false,
        completed: true
      },
      {
        id: '3',
        code: 'TEST-003',
        name: 'Advanced Test Course',
        section: 'Advanced Section',
        subsection: 'Advanced Subsection',
        sectionId: 'advanced-section',
        subsectionId: 'advanced-subsection',
        level: 'W',
        prerequisites: [],
        available: true,
        completed: false
      }
    ]

    mockUserProgress = {
      userId: 'test-user',
      completedCourses: new Set(['TEST-002']),
      inProgressCourses: new Set(['TEST-003']),
      waitingGradeCourses: new Set(),
      availableCourses: new Set(['TEST-001', 'TEST-003']),
      specialRulesProgress: new Map(),
      lastUpdated: new Date()
    }

    mockSettings = {
      showCompleted: true,
      showUnavailable: true,
      theme: 'light',
      language: 'en',
      layout: 'tree',
      autoSave: true
    }

    mockCourseData = {
      courses: mockCourses,
      categories: [],
      specialRules: [],
      departmentMappings: new Map([
        ['Test Section', ['Test Department']],
        ['Advanced Section', ['Advanced Department']]
      ])
    }
  })

  it('should return all courses when no filters are applied', () => {
    const { result } = renderHook(() =>
      useCourseFiltering({
        courses: mockCourses,
        searchTerm: '',
        filters: {},
        settings: mockSettings,
        userProgress: mockUserProgress,
        courseData: mockCourseData
      })
    )

    expect(result.current.filteredCourses).toHaveLength(3)
  })

  it('should filter courses by search term', () => {
    const { result } = renderHook(() =>
      useCourseFiltering({
        courses: mockCourses,
        searchTerm: 'Advanced',
        filters: {},
        settings: mockSettings,
        userProgress: mockUserProgress,
        courseData: mockCourseData
      })
    )

    expect(result.current.filteredCourses).toHaveLength(1)
    expect(result.current.filteredCourses[0].name).toBe('Advanced Test Course')
  })

  it('should filter courses by section', () => {
    const { result } = renderHook(() =>
      useCourseFiltering({
        courses: mockCourses,
        searchTerm: '',
        filters: { sections: ['Test Section'] },
        settings: mockSettings,
        userProgress: mockUserProgress,
        courseData: mockCourseData
      })
    )

    expect(result.current.filteredCourses).toHaveLength(2)
    expect(result.current.filteredCourses.every((c) => c.section === 'Test Section')).toBe(true)
  })

  it('should filter courses by level', () => {
    const { result } = renderHook(() =>
      useCourseFiltering({
        courses: mockCourses,
        searchTerm: '',
        filters: { levels: ['A', 'B'] },
        settings: mockSettings,
        userProgress: mockUserProgress,
        courseData: mockCourseData
      })
    )

    expect(result.current.filteredCourses).toHaveLength(2)
    expect(result.current.filteredCourses.every((c) => c.level === 'A' || c.level === 'B')).toBe(true)
  })

  it('should filter courses by status', () => {
    const { result } = renderHook(() =>
      useCourseFiltering({
        courses: mockCourses,
        searchTerm: '',
        filters: { status: ['completed'] },
        settings: mockSettings,
        userProgress: mockUserProgress,
        courseData: mockCourseData
      })
    )

    expect(result.current.filteredCourses).toHaveLength(1)
    expect(result.current.filteredCourses[0].code).toBe('TEST-002')
  })

  it('should hide completed courses when showCompleted is false', () => {
    const settingsWithoutCompleted = { ...mockSettings, showCompleted: false }

    const { result } = renderHook(() =>
      useCourseFiltering({
        courses: mockCourses,
        searchTerm: '',
        filters: {},
        settings: settingsWithoutCompleted,
        userProgress: mockUserProgress,
        courseData: mockCourseData
      })
    )

    expect(result.current.filteredCourses).toHaveLength(2)
    expect(result.current.filteredCourses.every((c) => !c.completed)).toBe(true)
  })

  it('should hide unavailable courses when showUnavailable is false', () => {
    const settingsWithoutUnavailable = { ...mockSettings, showUnavailable: false }

    const { result } = renderHook(() =>
      useCourseFiltering({
        courses: mockCourses,
        searchTerm: '',
        filters: {},
        settings: settingsWithoutUnavailable,
        userProgress: mockUserProgress,
        courseData: mockCourseData
      })
    )

    // Should show available and completed courses
    expect(result.current.filteredCourses).toHaveLength(2)
    expect(result.current.filteredCourses.every((c) => c.available || c.completed)).toBe(true)
  })

  it('should correctly identify course status', () => {
    const { result } = renderHook(() =>
      useCourseFiltering({
        courses: mockCourses,
        searchTerm: '',
        filters: {},
        settings: mockSettings,
        userProgress: mockUserProgress,
        courseData: mockCourseData
      })
    )

    expect(result.current.getCourseStatus(mockCourses[0])).toBe('available')
    expect(result.current.getCourseStatus(mockCourses[1])).toBe('completed')
    expect(result.current.getCourseStatus(mockCourses[2])).toBe('in_progress')
  })

  it('should calculate correct stats', () => {
    const { result } = renderHook(() =>
      useCourseFiltering({
        courses: mockCourses,
        searchTerm: '',
        filters: {},
        settings: mockSettings,
        userProgress: mockUserProgress,
        courseData: mockCourseData
      })
    )

    expect(result.current.stats.total).toBe(3)
    expect(result.current.stats.completed).toBe(1)
    expect(result.current.stats.available).toBe(2) // TEST-001 and TEST-003 are available
  })

  it('should handle multiple filter combinations', () => {
    const { result } = renderHook(() =>
      useCourseFiltering({
        courses: mockCourses,
        searchTerm: 'Test',
        filters: {
          sections: ['Test Section'],
          levels: ['A', 'B'],
          status: ['available', 'completed']
        },
        settings: mockSettings,
        userProgress: mockUserProgress,
        courseData: mockCourseData
      })
    )

    expect(result.current.filteredCourses).toHaveLength(2)
    expect(
      result.current.filteredCourses.every(
        (c) => c.name.includes('Test') && c.section === 'Test Section' && (c.level === 'A' || c.level === 'B')
      )
    ).toBe(true)
  })
})
