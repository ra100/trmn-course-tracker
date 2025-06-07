import { describe, it, expect, beforeEach } from 'vitest'
import { UserProgress, ParsedCourseData } from '../types'

// This tests the import logic directly, simulating what handleImportMedusaCourses does
describe('Medusa Import Status Override Logic', () => {
  let mockCourseData: ParsedCourseData
  let initialProgress: UserProgress

  beforeEach(() => {
    // Mock course data with trackable courses
    mockCourseData = {
      courses: [
        {
          id: '1',
          code: 'TEST-001',
          name: 'Test Course 1',
          section: 'Test Section',
          subsection: 'Test Subsection',
          sectionId: 'test-section',
          subsectionId: 'test-subsection',
          level: 'A',
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
          level: 'C',
          prerequisites: [],
          available: true,
          completed: false
        },
        {
          id: '3',
          code: 'TEST-003',
          name: 'Test Course 3',
          section: 'Different Section',
          subsection: 'Different Subsection',
          sectionId: 'different-section',
          subsectionId: 'different-subsection',
          level: 'D',
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
      departmentMappings: new Map()
    }

    // Set up the course map
    mockCourseData.courses.forEach((course) => {
      mockCourseData.courseMap.set(course.code, course)
    })

    // Initial user progress
    initialProgress = {
      userId: 'test-user',
      completedCourses: new Set(),
      availableCourses: new Set(['TEST-001', 'TEST-002', 'TEST-003']),
      inProgressCourses: new Set(),
      waitingGradeCourses: new Set(),
      specialRulesProgress: new Map(),
      lastUpdated: new Date()
    }
  })

  // Simulate the handleImportMedusaCourses logic
  const simulateImport = (
    courseCodes: string[],
    userProgress: UserProgress,
    courseData: ParsedCourseData
  ): UserProgress => {
    // Get all trackable course codes from our course data
    const trackableCourses = new Set(courseData.courses.map((course) => course.code))

    // Filter imported courses to only include trackable ones
    const trackableImportedCourses = courseCodes.filter((code) => trackableCourses.has(code))

    // Check which courses are already completed
    const existingCourses = userProgress.completedCourses
    const newCourses = trackableImportedCourses.filter((code) => !existingCourses.has(code))

    // Create new status sets - remove imported courses from in-progress and waiting-grade
    const newCompleted = new Set([...Array.from(existingCourses), ...newCourses])
    const newInProgress = new Set(userProgress.inProgressCourses)
    const newWaitingGrade = new Set(userProgress.waitingGradeCourses)

    // Remove all imported trackable courses from other status sets (Medusa import overrides manual status)
    trackableImportedCourses.forEach((courseCode) => {
      newInProgress.delete(courseCode)
      newWaitingGrade.delete(courseCode)
    })

    return {
      ...userProgress,
      completedCourses: newCompleted,
      inProgressCourses: newInProgress,
      waitingGradeCourses: newWaitingGrade,
      lastUpdated: new Date()
    }
  }

  describe('Status Override Tests', () => {
    // Test cases for status override scenarios using it.each
    const statusOverrideTestCases = [
      {
        name: 'course is in-progress and imported as completed',
        initialStatus: 'in_progress' as const,
        importedCourse: 'TEST-001',
        expectedFinalStatus: 'completed' as const,
        description: 'should override in-progress status with completed'
      },
      {
        name: 'course is waiting-grade and imported as completed',
        initialStatus: 'waiting_grade' as const,
        importedCourse: 'TEST-001',
        expectedFinalStatus: 'completed' as const,
        description: 'should override waiting-grade status with completed'
      }
    ]

    it.each(statusOverrideTestCases)(
      'when $name -> $description',
      ({ initialStatus, importedCourse, expectedFinalStatus }) => {
        // Set up initial progress with course in specific status
        const progressWithStatus: UserProgress = {
          ...initialProgress,
          inProgressCourses: initialStatus === 'in_progress' ? new Set([importedCourse]) : new Set(),
          waitingGradeCourses: initialStatus === 'waiting_grade' ? new Set([importedCourse]) : new Set()
        }

        // Simulate the import
        const resultProgress = simulateImport([importedCourse], progressWithStatus, mockCourseData)

        // Verify the course was added to completed
        expect(resultProgress.completedCourses.has(importedCourse)).toBe(true)

        // Verify the course was removed from other status sets
        expect(resultProgress.inProgressCourses.has(importedCourse)).toBe(false)
        expect(resultProgress.waitingGradeCourses.has(importedCourse)).toBe(false)
      }
    )

    // Test cases for status preservation scenarios
    const statusPreservationTestCases = [
      {
        name: 'course is in-progress and different courses are imported',
        initialStatus: 'in_progress' as const,
        trackedCourse: 'TEST-001',
        importedCourses: ['TEST-002', 'TEST-003'],
        expectedFinalStatus: 'in_progress' as const,
        description: 'should preserve in-progress status when not imported'
      },
      {
        name: 'course is waiting-grade and different courses are imported',
        initialStatus: 'waiting_grade' as const,
        trackedCourse: 'TEST-001',
        importedCourses: ['TEST-002', 'TEST-003'],
        expectedFinalStatus: 'waiting_grade' as const,
        description: 'should preserve waiting-grade status when not imported'
      }
    ]

    it.each(statusPreservationTestCases)(
      'when $name -> $description',
      ({ initialStatus, trackedCourse, importedCourses, expectedFinalStatus }) => {
        // Set up initial progress
        const progressWithStatus: UserProgress = {
          ...initialProgress,
          inProgressCourses: initialStatus === 'in_progress' ? new Set([trackedCourse]) : new Set(),
          waitingGradeCourses: initialStatus === 'waiting_grade' ? new Set([trackedCourse]) : new Set()
        }

        // Simulate the import with different courses
        const resultProgress = simulateImport(importedCourses, progressWithStatus, mockCourseData)

        // Verify the tracked course preserved its status
        if (expectedFinalStatus === 'in_progress') {
          expect(resultProgress.inProgressCourses.has(trackedCourse)).toBe(true)
          expect(resultProgress.waitingGradeCourses.has(trackedCourse)).toBe(false)
        } else if (expectedFinalStatus === 'waiting_grade') {
          expect(resultProgress.waitingGradeCourses.has(trackedCourse)).toBe(true)
          expect(resultProgress.inProgressCourses.has(trackedCourse)).toBe(false)
        }

        // Verify the tracked course was not added to completed
        expect(resultProgress.completedCourses.has(trackedCourse)).toBe(false)

        // Verify the imported courses were added to completed
        importedCourses.forEach((courseCode) => {
          expect(resultProgress.completedCourses.has(courseCode)).toBe(true)
        })
      }
    )

    it('should handle mixed scenario: some courses imported, others preserved', () => {
      // Set up initial progress with multiple courses in different states
      const progressWithMixedStatus: UserProgress = {
        ...initialProgress,
        inProgressCourses: new Set(['TEST-001', 'TEST-002']), // Both in progress
        waitingGradeCourses: new Set(['TEST-003']) // One waiting grade
      }

      // Import only TEST-001
      const resultProgress = simulateImport(['TEST-001'], progressWithMixedStatus, mockCourseData)

      // TEST-001 should be completed and removed from in-progress
      expect(resultProgress.completedCourses.has('TEST-001')).toBe(true)
      expect(resultProgress.inProgressCourses.has('TEST-001')).toBe(false)

      // TEST-002 should stay in-progress (not imported)
      expect(resultProgress.inProgressCourses.has('TEST-002')).toBe(true)
      expect(resultProgress.completedCourses.has('TEST-002')).toBe(false)

      // TEST-003 should stay waiting-grade (not imported)
      expect(resultProgress.waitingGradeCourses.has('TEST-003')).toBe(true)
      expect(resultProgress.completedCourses.has('TEST-003')).toBe(false)
    })

    it('should handle empty import list without affecting existing statuses', () => {
      const progressWithStatus: UserProgress = {
        ...initialProgress,
        inProgressCourses: new Set(['TEST-001']),
        waitingGradeCourses: new Set(['TEST-002'])
      }

      // Import empty list
      const resultProgress = simulateImport([], progressWithStatus, mockCourseData)

      // All statuses should be preserved
      expect(resultProgress.inProgressCourses.has('TEST-001')).toBe(true)
      expect(resultProgress.waitingGradeCourses.has('TEST-002')).toBe(true)
      expect(resultProgress.completedCourses.size).toBe(0)
    })

    it('should handle import of non-trackable courses without affecting existing statuses', () => {
      const progressWithStatus: UserProgress = {
        ...initialProgress,
        inProgressCourses: new Set(['TEST-001']),
        waitingGradeCourses: new Set(['TEST-002'])
      }

      // Import non-trackable courses
      const resultProgress = simulateImport(
        ['NON-TRACKABLE-001', 'NON-TRACKABLE-002'],
        progressWithStatus,
        mockCourseData
      )

      // All statuses should be preserved since non-trackable courses are filtered out
      expect(resultProgress.inProgressCourses.has('TEST-001')).toBe(true)
      expect(resultProgress.waitingGradeCourses.has('TEST-002')).toBe(true)
      expect(resultProgress.completedCourses.size).toBe(0)
    })

    it('should handle import with mix of trackable and non-trackable courses', () => {
      const progressWithStatus: UserProgress = {
        ...initialProgress,
        inProgressCourses: new Set(['TEST-001']),
        waitingGradeCourses: new Set(['TEST-002'])
      }

      // Import mix of trackable and non-trackable courses
      const resultProgress = simulateImport(
        ['TEST-001', 'NON-TRACKABLE-001', 'TEST-003'],
        progressWithStatus,
        mockCourseData
      )

      // TEST-001 should be completed and removed from in-progress
      expect(resultProgress.completedCourses.has('TEST-001')).toBe(true)
      expect(resultProgress.inProgressCourses.has('TEST-001')).toBe(false)

      // TEST-003 should be completed
      expect(resultProgress.completedCourses.has('TEST-003')).toBe(true)

      // TEST-002 should stay waiting-grade (not imported)
      expect(resultProgress.waitingGradeCourses.has('TEST-002')).toBe(true)
      expect(resultProgress.completedCourses.has('TEST-002')).toBe(false)

      // Non-trackable course should not appear anywhere
      expect(resultProgress.completedCourses.has('NON-TRACKABLE-001')).toBe(false)
    })
  })
})
