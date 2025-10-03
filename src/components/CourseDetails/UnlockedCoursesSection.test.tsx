import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { UnlockedCoursesSection } from './UnlockedCoursesSection'
import { Course } from '../../types'
import { darkTheme } from '../../theme'
import { I18nProvider } from '../../i18n'

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={darkTheme}>
      <I18nProvider>{component}</I18nProvider>
    </ThemeProvider>
  )
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
  },
  {
    id: 'unlocked-3',
    name: 'GPU-TRMN-0004',
    code: 'GPU-TRMN-0004',
    prerequisites: [],
    section: 'GPU',
    subsection: 'TRMN',
    sectionId: 'gpu',
    subsectionId: 'trmn',
    completed: false,
    available: true,
    institution: 'GPU',
    isIntroductory: true
  }
]

describe('UnlockedCoursesSection', () => {
  describe('alias display functionality', () => {
    it('should display unlocked courses with alias information', () => {
      const mockOnCourseSelect = vi.fn()
      const mockHandleCourseClick = vi.fn()

      renderWithTheme(
        <UnlockedCoursesSection
          unlockedCourses={mockUnlockedCourses}
          onCourseSelect={mockOnCourseSelect}
          handleCourseClick={mockHandleCourseClick}
        />
      )

      // Course names should appear once in description div
      expect(screen.getByText('RMACA-RMACS-02A')).toBeInTheDocument()
      expect(screen.getByText('SIA-SRN-30A')).toBeInTheDocument()
      expect(screen.getAllByText('GPU-TRMN-0004')).toHaveLength(2) // Once in strong, once in description

      // Alias codes should be displayed (multiple times since used by multiple courses)
      expect(screen.getAllByText('INTRO-TRMN-0003')).toHaveLength(2) // Used by both courses
      expect(screen.getAllByText('GPU-TRMN-0003')).toHaveLength(2) // Used by both courses
      expect(screen.getAllByText('SIA-RMN-0003')).toHaveLength(2) // Used by both courses
    })

    it('should show actual alias codes for courses with aliases', () => {
      const mockOnCourseSelect = vi.fn()
      const mockHandleCourseClick = vi.fn()

      renderWithTheme(
        <UnlockedCoursesSection
          unlockedCourses={mockUnlockedCourses}
          onCourseSelect={mockOnCourseSelect}
          handleCourseClick={mockHandleCourseClick}
        />
      )

      // Should show actual alias codes instead of generic "Has Aliases" badge
      expect(screen.getAllByText('INTRO-TRMN-0003')).toHaveLength(2) // Used by both courses
      expect(screen.getAllByText('GPU-TRMN-0003')).toHaveLength(2) // Used by both courses
      expect(screen.getAllByText('SIA-RMN-0003')).toHaveLength(2) // Used by both courses
    })

    it('should show "Introductory" badge for introductory courses', () => {
      const mockOnCourseSelect = vi.fn()
      const mockHandleCourseClick = vi.fn()

      renderWithTheme(
        <UnlockedCoursesSection
          unlockedCourses={mockUnlockedCourses}
          onCourseSelect={mockOnCourseSelect}
          handleCourseClick={mockHandleCourseClick}
        />
      )

      expect(screen.getByText('Introductory')).toBeInTheDocument()
    })

    it('should group courses by institution', () => {
      const mockOnCourseSelect = vi.fn()
      const mockHandleCourseClick = vi.fn()

      renderWithTheme(
        <UnlockedCoursesSection
          unlockedCourses={mockUnlockedCourses}
          onCourseSelect={mockOnCourseSelect}
          handleCourseClick={mockHandleCourseClick}
        />
      )

      // Should show institution headers
      expect(screen.getByText('RMACA')).toBeInTheDocument()
      expect(screen.getByText('SIA')).toBeInTheDocument()
      expect(screen.getByText('GPU')).toBeInTheDocument()
    })

    it('should handle course clicks correctly', () => {
      const mockOnCourseSelect = vi.fn()
      const mockHandleCourseClick = vi.fn((code: string) => {
        expect(code).toBe('RMACA-RMACS-02A')
      })

      renderWithTheme(
        <UnlockedCoursesSection
          unlockedCourses={mockUnlockedCourses}
          onCourseSelect={mockOnCourseSelect}
          handleCourseClick={mockHandleCourseClick}
        />
      )

      // Get all elements with the course code and click the first one (the strong element)
      const courseElements = screen.getAllByText('RMACA-RMACS-02A')
      const courseElement = courseElements[0] // Click the strong element, not the description div
      fireEvent.click(courseElement)

      expect(mockHandleCourseClick).toHaveBeenCalledWith('RMACA-RMACS-02A')
    })

    it('should not render when no unlocked courses', () => {
      const mockOnCourseSelect = vi.fn()
      const mockHandleCourseClick = vi.fn()

      const { container } = renderWithTheme(
        <UnlockedCoursesSection
          unlockedCourses={[]}
          onCourseSelect={mockOnCourseSelect}
          handleCourseClick={mockHandleCourseClick}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should display course descriptions when available', () => {
      const coursesWithDescriptions: Course[] = [
        {
          id: 'unlocked-1',
          name: 'Course with Description',
          code: 'TEST-001',
          prerequisites: [],
          section: 'Test',
          subsection: 'Test',
          sectionId: 'test',
          subsectionId: 'test',
          completed: false,
          available: true,
          institution: 'Test',
          description: 'This is a test course description',
          aliases: ['INTRO-TRMN-0003']
        }
      ]

      const mockOnCourseSelect = vi.fn()
      const mockHandleCourseClick = vi.fn()

      renderWithTheme(
        <UnlockedCoursesSection
          unlockedCourses={coursesWithDescriptions}
          onCourseSelect={mockOnCourseSelect}
          handleCourseClick={mockHandleCourseClick}
        />
      )

      expect(screen.getByText('This is a test course description')).toBeInTheDocument()
    })

    it('should handle courses without aliases correctly', () => {
      const coursesWithoutAliases: Course[] = [
        {
          id: 'unlocked-1',
          name: 'Course without Aliases',
          code: 'TEST-001',
          prerequisites: [],
          section: 'Test',
          subsection: 'Test',
          sectionId: 'test',
          subsectionId: 'test',
          completed: false,
          available: true,
          institution: 'Test'
          // No aliases property
        }
      ]

      const mockOnCourseSelect = vi.fn()
      const mockHandleCourseClick = vi.fn()

      renderWithTheme(
        <UnlockedCoursesSection
          unlockedCourses={coursesWithoutAliases}
          onCourseSelect={mockOnCourseSelect}
          handleCourseClick={mockHandleCourseClick}
        />
      )

      expect(screen.getByText('Course without Aliases')).toBeInTheDocument()
      // Should not show "Has Aliases" badge
      expect(screen.queryByText('Has Aliases')).not.toBeInTheDocument()
    })

    it('should handle courses without institution correctly', () => {
      const coursesWithoutInstitution: Course[] = [
        {
          id: 'unlocked-1',
          name: 'Course without Institution',
          code: 'TEST-001',
          prerequisites: [],
          section: 'Test',
          subsection: 'Test',
          sectionId: 'test',
          subsectionId: 'test',
          completed: false,
          available: true,
          institution: undefined,
          aliases: ['INTRO-TRMN-0003']
        }
      ]

      const mockOnCourseSelect = vi.fn()
      const mockHandleCourseClick = vi.fn()

      renderWithTheme(
        <UnlockedCoursesSection
          unlockedCourses={coursesWithoutInstitution}
          onCourseSelect={mockOnCourseSelect}
          handleCourseClick={mockHandleCourseClick}
        />
      )

      expect(screen.getByText('Course without Institution')).toBeInTheDocument()
      // Should show "Other" as institution
      expect(screen.getByText('Other')).toBeInTheDocument()
    })
  })
})
