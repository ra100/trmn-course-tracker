import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCourseManagement } from './useCourseManagement'
import { UserProgress, Course, CourseData } from '../types'
import { EligibilityEngine } from '../utils/eligibilityEngine'
import * as analytics from '../utils/analytics'
import * as userProgressHook from './useUserProgress'

// Mock dependencies
vi.mock('../utils/analytics', () => ({
  trackCourseCompletion: vi.fn()
}))

vi.mock('./useUserProgress', () => ({
  useOptimisticUserProgress: vi.fn()
}))

describe('useCourseManagement', () => {
  const mockUpdateOptimistically = vi.fn()
  const mockSetSelectedCourse = vi.fn()
  const mockEligibilityEngine = {
    updateCourseAvailability: vi.fn()
  } as unknown as EligibilityEngine

  const mockCourseData: CourseData = {
    courses: [
      { id: '1', code: 'BASIC-001', name: 'Basic Course 1', available: true } as Course,
      { id: '2', code: 'BASIC-002', name: 'Basic Course 2', available: false } as Course,
      { id: '3', code: 'ADV-001', name: 'Advanced Course 1', available: false } as Course
    ],
    categories: [],
    specialRules: []
  }

  const mockUserProgress: UserProgress = {
    userId: 'test-user',
    completedCourses: new Set(['BASIC-001']),
    inProgressCourses: new Set(['BASIC-002']),
    waitingGradeCourses: new Set(),
    availableCourses: new Set(['BASIC-001', 'BASIC-002']),
    specialRulesProgress: new Map(),
    lastUpdated: new Date()
  }

  const mockSelectedCourse: Course = {
    id: '1',
    code: 'BASIC-001',
    name: 'Basic Course 1',
    available: true
  } as Course

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useOptimisticUserProgress
    vi.mocked(userProgressHook.useOptimisticUserProgress).mockReturnValue({
      updateOptimistically: mockUpdateOptimistically
    })

    // Mock eligibility engine
    mockEligibilityEngine.updateCourseAvailability = vi.fn().mockReturnValue([
      { ...mockCourseData.courses[0], available: true },
      { ...mockCourseData.courses[1], available: true },
      { ...mockCourseData.courses[2], available: false }
    ])
  })

  const renderUseCourseManagement = (overrides = {}) => {
    const props = {
      courseData: mockCourseData,
      eligibilityEngine: mockEligibilityEngine,
      userProgress: mockUserProgress,
      selectedCourse: mockSelectedCourse,
      setSelectedCourse: mockSetSelectedCourse,
      ...overrides
    }

    return renderHook(() => useCourseManagement(props))
  }

  describe('toggleCourseCompletion', () => {
    it('should mark course as completed when not completed', () => {
      const { result } = renderUseCourseManagement()

      act(() => {
        result.current.toggleCourseCompletion('BASIC-002')
      })

      expect(mockUpdateOptimistically).toHaveBeenCalledWith(expect.any(Function))

      // Verify the update function creates correct progress
      const updateFn = mockUpdateOptimistically.mock.calls[0][0]
      const newProgress = updateFn()

      expect(newProgress.completedCourses).toContain('BASIC-002')
      expect(newProgress.inProgressCourses).not.toContain('BASIC-002')
      expect(analytics.trackCourseCompletion).toHaveBeenCalledWith('BASIC-002', 'Basic Course 2')
    })

    it('should mark course as incomplete when already completed', () => {
      const { result } = renderUseCourseManagement()

      act(() => {
        result.current.toggleCourseCompletion('BASIC-001')
      })

      expect(mockUpdateOptimistically).toHaveBeenCalledWith(expect.any(Function))

      // Verify the update function creates correct progress
      const updateFn = mockUpdateOptimistically.mock.calls[0][0]
      const newProgress = updateFn()

      expect(newProgress.completedCourses).not.toContain('BASIC-001')
      expect(analytics.trackCourseCompletion).not.toHaveBeenCalled()
    })

    it('should update selected course when it matches the toggled course', () => {
      const { result } = renderUseCourseManagement()

      act(() => {
        result.current.toggleCourseCompletion('BASIC-001')
      })

      expect(mockSetSelectedCourse).toHaveBeenCalledWith(expect.objectContaining({ code: 'BASIC-001' }))
    })

    it('should not update when missing dependencies', () => {
      const { result } = renderUseCourseManagement({
        courseData: undefined
      })

      act(() => {
        result.current.toggleCourseCompletion('BASIC-001')
      })

      expect(mockUpdateOptimistically).not.toHaveBeenCalled()
    })
  })

  describe('setCourseStatus', () => {
    it('should set course to completed status', () => {
      const { result } = renderUseCourseManagement()

      act(() => {
        result.current.setCourseStatus('BASIC-002', 'completed')
      })

      expect(mockUpdateOptimistically).toHaveBeenCalledWith(expect.any(Function))

      // Verify the update function creates correct progress
      const updateFn = mockUpdateOptimistically.mock.calls[0][0]
      const newProgress = updateFn()

      expect(newProgress.completedCourses).toContain('BASIC-002')
      expect(newProgress.inProgressCourses).not.toContain('BASIC-002')
      expect(newProgress.waitingGradeCourses).not.toContain('BASIC-002')
    })

    it('should set course to in_progress status', () => {
      const { result } = renderUseCourseManagement()

      act(() => {
        result.current.setCourseStatus('BASIC-001', 'in_progress')
      })

      expect(mockUpdateOptimistically).toHaveBeenCalledWith(expect.any(Function))

      // Verify the update function creates correct progress
      const updateFn = mockUpdateOptimistically.mock.calls[0][0]
      const newProgress = updateFn()

      expect(newProgress.inProgressCourses).toContain('BASIC-001')
      expect(newProgress.completedCourses).not.toContain('BASIC-001')
      expect(newProgress.waitingGradeCourses).not.toContain('BASIC-001')
    })

    it('should set course to waiting_grade status', () => {
      const { result } = renderUseCourseManagement()

      act(() => {
        result.current.setCourseStatus('BASIC-001', 'waiting_grade')
      })

      expect(mockUpdateOptimistically).toHaveBeenCalledWith(expect.any(Function))

      // Verify the update function creates correct progress
      const updateFn = mockUpdateOptimistically.mock.calls[0][0]
      const newProgress = updateFn()

      expect(newProgress.waitingGradeCourses).toContain('BASIC-001')
      expect(newProgress.completedCourses).not.toContain('BASIC-001')
      expect(newProgress.inProgressCourses).not.toContain('BASIC-001')
    })

    it('should set course to available status by removing from all sets', () => {
      const { result } = renderUseCourseManagement()

      act(() => {
        result.current.setCourseStatus('BASIC-001', 'available')
      })

      expect(mockUpdateOptimistically).toHaveBeenCalledWith(expect.any(Function))

      // Verify the update function creates correct progress
      const updateFn = mockUpdateOptimistically.mock.calls[0][0]
      const newProgress = updateFn()

      expect(newProgress.completedCourses).not.toContain('BASIC-001')
      expect(newProgress.inProgressCourses).not.toContain('BASIC-001')
      expect(newProgress.waitingGradeCourses).not.toContain('BASIC-001')
    })
  })

  describe('handleImportMedusaCourses', () => {
    it('should import trackable courses correctly', () => {
      const { result } = renderUseCourseManagement()

      let importResult
      act(() => {
        importResult = result.current.handleImportMedusaCourses(['BASIC-001', 'BASIC-002', 'UNKNOWN-001'])
      })

      expect(importResult).toEqual({
        imported: 3,
        trackable: 2,
        alreadyCompleted: 1
      })

      expect(mockUpdateOptimistically).toHaveBeenCalledWith(expect.any(Function))

      // Verify the update function creates correct progress
      const updateFn = mockUpdateOptimistically.mock.calls[0][0]
      const newProgress = updateFn()

      expect(newProgress.completedCourses).toContain('BASIC-001')
      expect(newProgress.completedCourses).toContain('BASIC-002')
      expect(newProgress.inProgressCourses).not.toContain('BASIC-002')
    })

    it('should return zero stats when missing dependencies', () => {
      const { result } = renderUseCourseManagement({
        courseData: undefined
      })

      let importResult
      act(() => {
        importResult = result.current.handleImportMedusaCourses(['BASIC-001'])
      })

      expect(importResult).toEqual({
        imported: 0,
        trackable: 0,
        alreadyCompleted: 0
      })

      expect(mockUpdateOptimistically).not.toHaveBeenCalled()
    })

    it('should override existing status for imported courses', () => {
      const progressWithWaitingGrade: UserProgress = {
        ...mockUserProgress,
        waitingGradeCourses: new Set(['BASIC-002'])
      }

      const { result } = renderUseCourseManagement({
        userProgress: progressWithWaitingGrade
      })

      act(() => {
        result.current.handleImportMedusaCourses(['BASIC-002'])
      })

      // Verify the update function creates correct progress
      const updateFn = mockUpdateOptimistically.mock.calls[0][0]
      const newProgress = updateFn()

      expect(newProgress.completedCourses).toContain('BASIC-002')
      expect(newProgress.waitingGradeCourses).not.toContain('BASIC-002')
    })
  })

  describe('course availability updates', () => {
    it('should update available courses when eligibility changes', () => {
      const { result } = renderUseCourseManagement()

      act(() => {
        result.current.toggleCourseCompletion('BASIC-002')
      })

      expect(mockEligibilityEngine.updateCourseAvailability).toHaveBeenCalled()

      // Verify the update function includes new available courses
      const updateFn = mockUpdateOptimistically.mock.calls[0][0]
      const newProgress = updateFn()

      expect(newProgress.availableCourses).toEqual(new Set(['BASIC-001', 'BASIC-002']))
    })

    it('should handle eligibility engine absence gracefully', () => {
      const { result } = renderUseCourseManagement({
        eligibilityEngine: null
      })

      act(() => {
        result.current.toggleCourseCompletion('BASIC-002')
      })

      // Should still call updateOptimistically, but without availability updates
      expect(mockUpdateOptimistically).toHaveBeenCalled()
    })
  })

  describe('selected course updates', () => {
    it('should update selected course when it is affected by changes', () => {
      const { result } = renderUseCourseManagement()

      act(() => {
        result.current.setCourseStatus('BASIC-001', 'in_progress')
      })

      expect(mockSetSelectedCourse).toHaveBeenCalledWith(expect.objectContaining({ code: 'BASIC-001' }))
    })

    it('should not update selected course when it is not affected', () => {
      const { result } = renderUseCourseManagement()

      act(() => {
        result.current.setCourseStatus('BASIC-002', 'completed')
      })

      expect(mockSetSelectedCourse).toHaveBeenCalledWith(expect.objectContaining({ code: 'BASIC-001' }))
    })

    it('should handle no selected course gracefully', () => {
      const { result } = renderUseCourseManagement({
        selectedCourse: null
      })

      act(() => {
        result.current.toggleCourseCompletion('BASIC-001')
      })

      expect(mockSetSelectedCourse).not.toHaveBeenCalled()
    })
  })
})
