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
  specialRulesProgress: new Map(),
  lastUpdated: new Date()
}

const mockEligibilityEngine = {
  getCoursesUnlockedBy: vi.fn(() => []),
  getCourseByCode: vi.fn(),
  updateCourseAvailability: vi.fn()
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
})
