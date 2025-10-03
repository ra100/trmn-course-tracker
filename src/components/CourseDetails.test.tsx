import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { CourseDetails } from './CourseDetails'
import { Course, UserProgress } from '../types'
import { EligibilityEngine } from '../utils/eligibilityEngine'
import { darkTheme } from '../theme'
import { I18nProvider } from '../i18n'

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={darkTheme}>
      <I18nProvider>{component}</I18nProvider>
    </ThemeProvider>
  )
}

const mockCourse: Course = {
  id: 'test-course',
  name: 'Test Course',
  code: 'TC-101',
  prerequisites: [],
  section: 'Test Section',
  subsection: 'Test Subsection',
  sectionId: 'test-section',
  subsectionId: 'test-subsection',
  completed: false,
  available: true,
  description: 'A test course for testing purposes'
}

const mockUserProgress: UserProgress = {
  userId: 'test-user',
  completedCourses: new Set(),
  availableCourses: new Set(['TC-101']),
  inProgressCourses: new Set(),
  waitingGradeCourses: new Set(),
  courseStatusTimestamps: new Map(),
  courseCompletionDates: new Map(),
  specialRulesProgress: new Map(),
  lastUpdated: new Date()
}

const mockEligibilityEngine = {
  getCoursesUnlockedBy: vi.fn(() => []),
  getCourseByCode: vi.fn(),
  updateCourseAvailability: vi.fn(),
  getAllEquivalentCourses: vi.fn((code: string) => [code])
} as unknown as EligibilityEngine

describe('CourseDetails', () => {
  it('renders empty state when no course is selected', () => {
    renderWithTheme(
      <CourseDetails
        course={null}
        userProgress={mockUserProgress}
        eligibilityEngine={mockEligibilityEngine}
        onCourseToggle={vi.fn()}
      />
    )

    expect(screen.getByText('Select a course to view details')).toBeInTheDocument()
  })

  it('renders course information correctly', () => {
    renderWithTheme(
      <CourseDetails
        course={mockCourse}
        userProgress={mockUserProgress}
        eligibilityEngine={mockEligibilityEngine}
        onCourseToggle={vi.fn()}
      />
    )

    expect(screen.getByText('Test Course')).toBeInTheDocument()
    expect(screen.getByText('TC-101')).toBeInTheDocument()
    expect(screen.getByText('Test Section → Test Subsection')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument() // Only badge now
  })

  it('shows "Working On" status correctly', () => {
    const progressWithInProgress = {
      ...mockUserProgress,
      inProgressCourses: new Set(['TC-101'])
    }

    renderWithTheme(
      <CourseDetails
        course={mockCourse}
        userProgress={progressWithInProgress}
        eligibilityEngine={mockEligibilityEngine}
        onCourseToggle={vi.fn()}
      />
    )

    expect(screen.getByText('Working On')).toBeInTheDocument() // Only badge now
  })

  it('shows "Waiting for Grade" status correctly', () => {
    const progressWithWaitingGrade = {
      ...mockUserProgress,
      waitingGradeCourses: new Set(['TC-101'])
    }

    renderWithTheme(
      <CourseDetails
        course={mockCourse}
        userProgress={progressWithWaitingGrade}
        eligibilityEngine={mockEligibilityEngine}
        onCourseToggle={vi.fn()}
      />
    )

    expect(screen.getByText('Waiting for Grade')).toBeInTheDocument() // Only badge now
  })

  it('calls onCourseStatusChange when status buttons are clicked', () => {
    const mockOnCourseStatusChange = vi.fn()

    renderWithTheme(
      <CourseDetails
        course={mockCourse}
        userProgress={mockUserProgress}
        eligibilityEngine={mockEligibilityEngine}
        onCourseToggle={vi.fn()}
        onCourseStatusChange={mockOnCourseStatusChange}
      />
    )

    const workingOnButton = screen.getByText('Working On')
    fireEvent.click(workingOnButton)

    expect(mockOnCourseStatusChange).toHaveBeenCalledWith('TC-101', 'in_progress')

    const waitingGradeButton = screen.getByText('Waiting Grade')
    fireEvent.click(waitingGradeButton)

    expect(mockOnCourseStatusChange).toHaveBeenCalledWith('TC-101', 'waiting_grade')
  })

  it('shows reset button for courses in progress or waiting grade', () => {
    const progressWithInProgress = {
      ...mockUserProgress,
      inProgressCourses: new Set(['TC-101'])
    }

    const mockOnCourseStatusChange = vi.fn()

    renderWithTheme(
      <CourseDetails
        course={mockCourse}
        userProgress={progressWithInProgress}
        eligibilityEngine={mockEligibilityEngine}
        onCourseToggle={vi.fn()}
        onCourseStatusChange={mockOnCourseStatusChange}
      />
    )

    const resetButton = screen.getByText('Reset to Available')
    fireEvent.click(resetButton)

    expect(mockOnCourseStatusChange).toHaveBeenCalledWith('TC-101', 'available')
  })

  it('does not show status change buttons when onCourseStatusChange is not provided', () => {
    renderWithTheme(
      <CourseDetails
        course={mockCourse}
        userProgress={mockUserProgress}
        eligibilityEngine={mockEligibilityEngine}
        onCourseToggle={vi.fn()}
      />
    )

    expect(screen.queryByText('Working On')).not.toBeInTheDocument()
    expect(screen.queryByText('Waiting Grade')).not.toBeInTheDocument()
  })

  it('handles course selection with updated status correctly', () => {
    const mockOnCourseSelect = vi.fn()
    const mockGetCourseByCode = vi.fn()
    const mockUpdateCourseAvailability = vi.fn()

    // Mock prerequisite course
    const prereqCourse: Course = {
      id: 'prereq-course',
      name: 'Prerequisite Course',
      code: 'PREREQ-101',
      prerequisites: [],
      section: 'Prerequisites',
      subsection: '',
      sectionId: 'prereq-section',
      subsectionId: '',
      completed: false,
      available: false,
      description: 'A prerequisite course'
    }

    // Updated course with correct availability status
    const updatedPrereqCourse: Course = {
      ...prereqCourse,
      available: true,
      completed: false
    }

    // Course with prerequisites
    const courseWithPrereqs: Course = {
      ...mockCourse,
      prerequisites: [
        {
          type: 'course',
          code: 'PREREQ-101',
          required: true
        }
      ]
    }

    mockGetCourseByCode.mockReturnValue(prereqCourse)
    mockUpdateCourseAvailability.mockReturnValue([updatedPrereqCourse])

    const mockEngineWithMethods = {
      ...mockEligibilityEngine,
      getCourseByCode: mockGetCourseByCode,
      updateCourseAvailability: mockUpdateCourseAvailability
    } as unknown as EligibilityEngine

    renderWithTheme(
      <CourseDetails
        course={courseWithPrereqs}
        userProgress={mockUserProgress}
        eligibilityEngine={mockEngineWithMethods}
        onCourseToggle={vi.fn()}
        onCourseSelect={mockOnCourseSelect}
      />
    )

    // Find the clickable course code in prerequisites
    const clickableCourseCode = screen.getByText('PREREQ-101')
    fireEvent.click(clickableCourseCode)

    // Verify the methods were called
    expect(mockGetCourseByCode).toHaveBeenCalledWith('PREREQ-101')
    expect(mockUpdateCourseAvailability).toHaveBeenCalledWith(mockUserProgress)

    // Verify onCourseSelect was called with the updated course (with correct availability)
    expect(mockOnCourseSelect).toHaveBeenCalledWith(updatedPrereqCourse)
  })

  it('handles clicking on alias courses by finding equivalent existing courses', () => {
    const mockOnCourseSelect = vi.fn()
    const mockGetCourseByCode = vi.fn()
    const mockUpdateCourseAvailability = vi.fn()

    // Create existing course
    const existingCourse: Course = {
      id: 'existing-course',
      name: 'SIA RMN Basic Course',
      code: 'SIA-RMN-0001',
      prerequisites: [],
      section: 'Enlisted Training',
      subsection: '',
      sectionId: 'enlisted',
      subsectionId: '',
      completed: false,
      available: true,
      description: 'Basic enlisted course'
    }

    const courseWithAliasPrereq: Course = {
      ...mockCourse,
      prerequisites: [
        {
          type: 'course',
          code: 'INTRO-TRMN-0001',
          required: true
        }
      ]
    }

    const mockEngineWithAliases = {
      ...mockEligibilityEngine,
      getCourseByCode: mockGetCourseByCode,
      updateCourseAvailability: mockUpdateCourseAvailability,
      getAllEquivalentCourses: vi.fn(() => ['INTRO-TRMN-0001', 'SIA-RMN-0001'])
    } as unknown as EligibilityEngine

    // Mock getCourseByCode to return null for alias but existing course for real course
    mockGetCourseByCode.mockImplementation((code: string) => {
      if (code === 'SIA-RMN-0001') {
        return existingCourse
      }
      return null // INTRO-TRMN-0001 doesn't exist
    })

    mockUpdateCourseAvailability.mockReturnValue([existingCourse])

    renderWithTheme(
      <CourseDetails
        course={courseWithAliasPrereq}
        userProgress={mockUserProgress}
        eligibilityEngine={mockEngineWithAliases}
        onCourseToggle={vi.fn()}
        onCourseSelect={mockOnCourseSelect}
      />
    )

    // Should show the existing course code
    const clickableCourseCode = screen.getByText('SIA-RMN-0001')
    fireEvent.click(clickableCourseCode)

    expect(mockOnCourseSelect).toHaveBeenCalledWith(existingCourse)
  })

  describe('alias prerequisite/unlock display', () => {
    const mockEligibilityEngineWithAliases = {
      ...mockEligibilityEngine,
      getCoursesUnlockedBy: vi.fn(() => [
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
          available: false,
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
          available: false,
          institution: 'SIA',
          aliases: ['INTRO-TRMN-0003', 'GPU-TRMN-0003', 'SIA-RMN-0003']
        }
      ]),
      getAllEquivalentCourses: vi.fn((code: string) => {
        if (code === 'INTRO-TRMN-0003') {
          return ['INTRO-TRMN-0003', 'GPU-TRMN-0003', 'SIA-RMN-0003']
        }
        return [code]
      }),
      getCourseByCode: vi.fn((code: string) => {
        if (code === 'RMACA-RMACS-02A') {
          return {
            id: 'unlocked-1',
            name: 'RMACA-RMACS-02A',
            code: 'RMACA-RMACS-02A',
            prerequisites: [],
            section: 'RMACA',
            subsection: 'RMACS',
            sectionId: 'rmaca',
            subsectionId: 'rmacs',
            completed: false,
            available: true,
            institution: 'RMACA'
          }
        }
        if (code === 'SIA-SRN-30A') {
          return {
            id: 'unlocked-2',
            name: 'SIA-SRN-30A',
            code: 'SIA-SRN-30A',
            prerequisites: [],
            section: 'SIA',
            subsection: 'SRN',
            sectionId: 'sia',
            subsectionId: 'srn',
            completed: false,
            available: true,
            institution: 'SIA'
          }
        }
        return null
      }),
      updateCourseAvailability: vi.fn((_progress) => [
        {
          id: 'unlocked-1',
          name: 'RMACA-RMACS-02A',
          code: 'RMACA-RMACS-02A',
          prerequisites: [],
          section: 'RMACA',
          subsection: 'RMACS',
          sectionId: 'rmaca',
          subsectionId: 'rmacs',
          completed: false,
          available: true,
          institution: 'RMACA'
        }
      ])
    } as unknown as EligibilityEngine

    it('should display unlocked courses when GPU-TRMN-0003 is completed', () => {
      const progressWithAliasCompleted = {
        ...mockUserProgress,
        completedCourses: new Set(['GPU-TRMN-0003'])
      }

      renderWithTheme(
        <CourseDetails
          course={{
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
          }}
          userProgress={progressWithAliasCompleted}
          eligibilityEngine={mockEligibilityEngineWithAliases}
          onCourseToggle={vi.fn()}
        />
      )

      expect(screen.getByText('RMACA-RMACS-02A')).toBeInTheDocument()
      expect(screen.getByText('SIA-SRN-30A')).toBeInTheDocument()
    })

    it('should show alias information for unlocked courses', () => {
      const progressWithAliasCompleted = {
        ...mockUserProgress,
        completedCourses: new Set(['GPU-TRMN-0003'])
      }

      renderWithTheme(
        <CourseDetails
          course={{
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
          }}
          userProgress={progressWithAliasCompleted}
          eligibilityEngine={mockEligibilityEngineWithAliases}
          onCourseToggle={vi.fn()}
        />
      )

      // Should show actual alias codes instead of generic "Has Aliases" badge
      expect(screen.getAllByText('INTRO-TRMN-0003')).toHaveLength(2) // Each course shows all aliases
      expect(screen.getAllByText('GPU-TRMN-0003')).toHaveLength(4) // Each course shows all aliases
      expect(screen.getAllByText('SIA-RMN-0003')).toHaveLength(2) // Each course shows all aliases
    })

    it('should handle clicking on unlocked courses with aliases', () => {
      const mockOnCourseSelect = vi.fn()
      const progressWithAliasCompleted = {
        ...mockUserProgress,
        completedCourses: new Set(['GPU-TRMN-0003'])
      }

      renderWithTheme(
        <CourseDetails
          course={{
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
          }}
          userProgress={progressWithAliasCompleted}
          eligibilityEngine={mockEligibilityEngineWithAliases}
          onCourseToggle={vi.fn()}
          onCourseSelect={mockOnCourseSelect}
        />
      )

      const unlockedCourse = screen.getByText('RMACA-RMACS-02A')
      fireEvent.click(unlockedCourse)

      expect(mockOnCourseSelect).toHaveBeenCalled()
    })

    it('should show introductory badge for unlocked courses that are introductory', () => {
      const mockEligibilityEngineWithIntroductory = {
        ...mockEligibilityEngine,
        getCoursesUnlockedBy: vi.fn(() => [
          {
            id: 'unlocked-1',
            name: 'GPU-TRMN-0001',
            code: 'GPU-TRMN-0001',
            prerequisites: [],
            section: 'GPU',
            subsection: 'TRMN',
            sectionId: 'gpu',
            subsectionId: 'trmn',
            completed: false,
            available: true,
            institution: 'GPU',
            isIntroductory: true,
            aliases: ['INTRO-TRMN-0001', 'SIA-RMN-0001']
          }
        ]),
        getAllEquivalentCourses: vi.fn(() => ['INTRO-TRMN-0001', 'GPU-TRMN-0001', 'SIA-RMN-0001']),
        getCourseByCode: vi.fn(() => null),
        updateCourseAvailability: vi.fn(() => [])
      } as unknown as EligibilityEngine

      const progressWithAliasCompleted = {
        ...mockUserProgress,
        completedCourses: new Set(['GPU-TRMN-0003'])
      }

      renderWithTheme(
        <CourseDetails
          course={{
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
          }}
          userProgress={progressWithAliasCompleted}
          eligibilityEngine={mockEligibilityEngineWithIntroductory}
          onCourseToggle={vi.fn()}
        />
      )

      expect(screen.getByText('Introductory')).toBeInTheDocument()
    })

    it('should group unlocked courses by institution', () => {
      const progressWithAliasCompleted = {
        ...mockUserProgress,
        completedCourses: new Set(['GPU-TRMN-0003'])
      }

      renderWithTheme(
        <CourseDetails
          course={{
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
          }}
          userProgress={progressWithAliasCompleted}
          eligibilityEngine={mockEligibilityEngineWithAliases}
          onCourseToggle={vi.fn()}
        />
      )

      // Should show institution headers
      expect(screen.getByText('RMACA')).toBeInTheDocument()
      expect(screen.getByText('SIA')).toBeInTheDocument()
    })
  })
})
