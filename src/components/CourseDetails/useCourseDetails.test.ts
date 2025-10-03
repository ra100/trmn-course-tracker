import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCourseDetails } from './useCourseDetails'
import { Course, UserProgress } from '../../types'
import { EligibilityEngine } from '../../utils/eligibilityEngine'
import { I18nProvider } from '../../i18n'

// Mock the analytics module
vi.mock('../../utils/analytics', () => ({
  trackCourseDetailsView: vi.fn()
}))

// Mock the i18n hook
vi.mock('../../i18n', async () => {
  const actual = await vi.importActual('../../i18n')
  return {
    ...actual,
    useT: () => ({
      courseDetails: {
        unlocksCourses: 'Unlocks Courses'
      },
      courseStatus: {
        completed: 'Completed',
        waitingGrade: 'Waiting for Grade',
        inProgress: 'Working On',
        available: 'Available',
        prerequisitesRequired: 'Prerequisites Required'
      }
    })
  }
})

const mockCourse: Course = {
  id: 'test-course',
  name: 'GPU-TRMN-0003',
  code: 'GPU-TRMN-0003',
  prerequisites: [],
  section: 'GPU',
  subsection: 'TRMN',
  sectionId: 'gpu',
  subsectionId: 'trmn',
  completed: true,
  available: false,
  institution: 'GPU',
  isIntroductory: true,
  aliases: ['INTRO-TRMN-0003', 'SIA-RMN-0003']
}

const mockUserProgress: UserProgress = {
  userId: 'test-user',
  completedCourses: new Set(['GPU-TRMN-0003']),
  availableCourses: new Set(),
  inProgressCourses: new Set(),
  waitingGradeCourses: new Set(),
  courseStatusTimestamps: new Map(),
  courseCompletionDates: new Map(),
  specialRulesProgress: new Map(),
  lastUpdated: new Date()
}

const mockUnlockedCourses: Course[] = [
  {
    id: 'unlocked-1',
    name: 'RMACA-RMACS-02A',
    code: 'RMACA-RMACS-02A',
    prerequisites: [
      {
        type: 'course' as const,
        code: 'INTRO-TRMN-0003',
        required: true
      }
    ],
    section: 'RMACA',
    subsection: 'RMACS',
    sectionId: 'rmaca',
    subsectionId: 'rmacs',
    completed: false,
    available: true,
    institution: 'RMACA',
    aliases: ['INTRO-TRMN-0003', 'GPU-TRMN-0003', 'SIA-RMN-0003']
  },
  {
    id: 'unlocked-2',
    name: 'SIA-SRN-30A',
    code: 'SIA-SRN-30A',
    prerequisites: [
      {
        type: 'course' as const,
        code: 'INTRO-TRMN-0003',
        required: true
      }
    ],
    section: 'SIA',
    subsection: 'SRN',
    sectionId: 'sia',
    subsectionId: 'srn',
    completed: false,
    available: true,
    institution: 'SIA',
    aliases: ['INTRO-TRMN-0003', 'GPU-TRMN-0003', 'SIA-RMN-0003']
  }
]

const mockEligibilityEngine = {
  getCoursesUnlockedBy: vi.fn(() => mockUnlockedCourses),
  getCourseByCode: vi.fn((code: string) => {
    if (code === 'RMACA-RMACS-02A') {
      return mockUnlockedCourses[0]
    }
    if (code === 'SIA-SRN-30A') {
      return mockUnlockedCourses[1]
    }
    return null
  }),
  updateCourseAvailability: vi.fn((_progress) => mockUnlockedCourses),
  getAllEquivalentCourses: vi.fn((code: string) => {
    if (code === 'INTRO-TRMN-0003') {
      return ['INTRO-TRMN-0003', 'GPU-TRMN-0003', 'SIA-RMN-0003']
    }
    return [code]
  })
} as unknown as EligibilityEngine

describe('useCourseDetails', () => {
  describe('alias functionality', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return unlocked courses for completed alias course', () => {
      const { result } = renderHook(
        () =>
          useCourseDetails({
            course: mockCourse,
            userProgress: mockUserProgress,
            eligibilityEngine: mockEligibilityEngine,
            onCourseToggle: vi.fn(),
            onCourseSelect: vi.fn()
          }),
        { wrapper: I18nProvider }
      )

      expect(result.current.unlockedCourses).toHaveLength(2)
      expect(result.current.unlockedCourses.map((c) => c.code)).toContain('RMACA-RMACS-02A')
      expect(result.current.unlockedCourses.map((c) => c.code)).toContain('SIA-SRN-30A')
    })

    it('should handle course clicks for unlocked courses with aliases', () => {
      const mockOnCourseSelect = vi.fn()
      const mockOnCourseToggle = vi.fn()

      const { result } = renderHook(
        () =>
          useCourseDetails({
            course: mockCourse,
            userProgress: mockUserProgress,
            eligibilityEngine: mockEligibilityEngine,
            onCourseToggle: mockOnCourseToggle,
            onCourseSelect: mockOnCourseSelect
          }),
        { wrapper: I18nProvider }
      )

      // Test clicking on an unlocked course
      result.current.handleCourseClick('RMACA-RMACS-02A')

      expect(mockOnCourseSelect).toHaveBeenCalled()
    })

    it('should handle courses with no unlocked courses', () => {
      const mockEngineWithNoUnlocked = {
        ...mockEligibilityEngine,
        getCoursesUnlockedBy: vi.fn(() => [])
      } as unknown as EligibilityEngine

      const { result } = renderHook(
        () =>
          useCourseDetails({
            course: mockCourse,
            userProgress: mockUserProgress,
            eligibilityEngine: mockEngineWithNoUnlocked,
            onCourseToggle: vi.fn(),
            onCourseSelect: vi.fn()
          }),
        { wrapper: I18nProvider }
      )

      expect(result.current.unlockedCourses).toHaveLength(0)
    })

    it('should handle courses that do not exist in course map', () => {
      const mockEngineWithMissingCourse = {
        ...mockEligibilityEngine,
        getCourseByCode: vi.fn(() => null)
      } as unknown as EligibilityEngine

      const { result } = renderHook(
        () =>
          useCourseDetails({
            course: mockCourse,
            userProgress: mockUserProgress,
            eligibilityEngine: mockEngineWithMissingCourse,
            onCourseToggle: vi.fn(),
            onCourseSelect: vi.fn()
          }),
        { wrapper: I18nProvider }
      )

      // Should still return unlocked courses even if some courses are missing
      result.current.handleCourseClick('NON-EXISTENT-COURSE')
      // Should not crash and should handle gracefully
    })

    it('should handle prerequisite courses with aliases', () => {
      const courseWithAliasPrereq: Course = {
        ...mockCourse,
        prerequisites: [
          {
            type: 'course' as const,
            code: 'INTRO-TRMN-0003',
            required: true
          }
        ]
      }

      const { result } = renderHook(
        () =>
          useCourseDetails({
            course: courseWithAliasPrereq,
            userProgress: mockUserProgress,
            eligibilityEngine: mockEligibilityEngine,
            onCourseToggle: vi.fn(),
            onCourseSelect: vi.fn()
          }),
        { wrapper: I18nProvider }
      )

      // Should handle prerequisites that reference aliases
      expect(result.current.prerequisites).toBeDefined()
    })

    it('should handle alternative prerequisites with aliases', () => {
      const courseWithAltAliasPrereq: Course = {
        ...mockCourse,
        prerequisites: [
          {
            type: 'alternative_group' as const,
            alternativePrerequisites: [
              {
                type: 'course' as const,
                code: 'INTRO-TRMN-0003',
                required: true
              }
            ],
            required: true
          }
        ]
      }

      const { result } = renderHook(
        () =>
          useCourseDetails({
            course: courseWithAltAliasPrereq,
            userProgress: mockUserProgress,
            eligibilityEngine: mockEligibilityEngine,
            onCourseToggle: vi.fn(),
            onCourseSelect: vi.fn()
          }),
        { wrapper: I18nProvider }
      )

      // Should handle alternative prerequisites that reference aliases
      expect(result.current.prerequisites).toBeDefined()
    })

    it('should handle status correctly for completed alias courses', () => {
      const { result } = renderHook(
        () =>
          useCourseDetails({
            course: mockCourse,
            userProgress: mockUserProgress,
            eligibilityEngine: mockEligibilityEngine,
            onCourseToggle: vi.fn(),
            onCourseSelect: vi.fn()
          }),
        { wrapper: I18nProvider }
      )

      expect(result.current.status).toBe('completed')
      expect(result.current.getStatusText()).toBe('Completed')
    })

    it('should handle status correctly for available courses', () => {
      const availableCourse: Course = {
        ...mockCourse,
        code: 'AVAILABLE-COURSE',
        completed: false,
        available: true
      }

      const availableUserProgress: UserProgress = {
        ...mockUserProgress,
        completedCourses: new Set() // No courses completed for this test
      }

      const { result } = renderHook(
        () =>
          useCourseDetails({
            course: availableCourse,
            userProgress: availableUserProgress,
            eligibilityEngine: mockEligibilityEngine,
            onCourseToggle: vi.fn(),
            onCourseSelect: vi.fn()
          }),
        { wrapper: I18nProvider }
      )

      expect(result.current.status).toBe('available')
      expect(result.current.getStatusText()).toBe('Available')
    })

    it('should handle toggle click for available courses', () => {
      const availableCourse: Course = {
        ...mockCourse,
        completed: false,
        available: true
      }

      const mockOnCourseToggle = vi.fn()

      const { result } = renderHook(
        () =>
          useCourseDetails({
            course: availableCourse,
            userProgress: mockUserProgress,
            eligibilityEngine: mockEligibilityEngine,
            onCourseToggle: mockOnCourseToggle,
            onCourseSelect: vi.fn()
          }),
        { wrapper: I18nProvider }
      )

      result.current.handleToggleClick()
      expect(mockOnCourseToggle).toHaveBeenCalledWith('GPU-TRMN-0003')
    })

    it('should handle toggle click for completed courses', () => {
      const mockOnCourseToggle = vi.fn()

      const { result } = renderHook(
        () =>
          useCourseDetails({
            course: mockCourse,
            userProgress: mockUserProgress,
            eligibilityEngine: mockEligibilityEngine,
            onCourseToggle: mockOnCourseToggle,
            onCourseSelect: vi.fn()
          }),
        { wrapper: I18nProvider }
      )

      result.current.handleToggleClick()
      expect(mockOnCourseToggle).toHaveBeenCalledWith('GPU-TRMN-0003')
    })
  })
})
