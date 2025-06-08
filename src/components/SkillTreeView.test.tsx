import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ThemeProvider } from 'styled-components'
import { SkillTreeView } from './SkillTreeView'
import { lightTheme } from '../theme'
import { ParsedCourseData, UserProgress, Course, FilterOptions, UserSettings } from '../types'
import { EligibilityEngine } from '../utils/eligibilityEngine'
import { I18nProvider } from '../i18n'

const mockCourseData: ParsedCourseData = {
  courses: [
    {
      id: '1',
      name: 'Tactical Course 1',
      code: 'SIA-SRN-08C',
      section: 'Naval Training',
      subsection: 'Fire Control School',
      sectionId: 'naval-training',
      subsectionId: 'fire-control',
      prerequisites: [],
      completed: false,
      available: true,
      level: 'C',
      departments: ['Tactical'],
      primaryDepartment: 'Tactical'
    },
    {
      id: '2',
      name: 'Engineering Course 1',
      code: 'SIA-SRN-14C',
      section: 'Naval Training',
      subsection: 'Power Systems School',
      sectionId: 'naval-training',
      subsectionId: 'power-systems',
      prerequisites: [],
      completed: true,
      available: true,
      level: 'C',
      departments: ['Engineering'],
      primaryDepartment: 'Engineering'
    },
    {
      id: '3',
      name: 'Communications Course 1',
      code: 'SIA-SRN-11C',
      section: 'Naval Training',
      subsection: 'Communications',
      sectionId: 'naval-training',
      subsectionId: 'communications',
      prerequisites: [],
      completed: false,
      available: true,
      level: 'C',
      departments: ['Communications'],
      primaryDepartment: 'Communications'
    }
  ],
  courseMap: new Map([
    [
      'SIA-SRN-08C',
      {
        id: '1',
        name: 'Tactical Course 1',
        code: 'SIA-SRN-08C',
        section: 'Naval Training',
        subsection: 'Fire Control School',
        sectionId: 'naval-training',
        subsectionId: 'fire-control',
        prerequisites: [],
        completed: false,
        available: true,
        level: 'C',
        departments: ['Tactical'],
        primaryDepartment: 'Tactical'
      }
    ],
    [
      'SIA-SRN-14C',
      {
        id: '2',
        name: 'Engineering Course 1',
        code: 'SIA-SRN-14C',
        section: 'Naval Training',
        subsection: 'Power Systems School',
        sectionId: 'naval-training',
        subsectionId: 'power-systems',
        prerequisites: [],
        completed: true,
        available: true,
        level: 'C',
        departments: ['Engineering'],
        primaryDepartment: 'Engineering'
      }
    ],
    [
      'SIA-SRN-11C',
      {
        id: '3',
        name: 'Communications Course 1',
        code: 'SIA-SRN-11C',
        section: 'Naval Training',
        subsection: 'Communications',
        sectionId: 'naval-training',
        subsectionId: 'communications',
        prerequisites: [],
        completed: false,
        available: true,
        level: 'C',
        departments: ['Communications'],
        primaryDepartment: 'Communications'
      }
    ]
  ]),
  categories: [],
  categoryMap: new Map(),
  dependencyGraph: new Map(),
  specialRules: [],
  departmentMappings: new Map([
    [
      'tactical',
      ['fire control', 'electronic warfare', 'tracking', 'sensor', 'missile', 'beam weapons', 'gunner', 'weapons']
    ],
    [
      'engineering',
      ['impeller', 'power', 'gravitics', 'environmental', 'hydroponics', 'damage control', 'power systems']
    ],
    ['communications', ['data systems', 'electronics', 'communications']],
    ['astrogation', ['astrogation', 'flight operations', 'coxswain', 'helmsman', 'plotting', 'quartermaster']],
    ['medical', ['medical', 'corpsman', 'medic', 'sick berth', 'surgeon']],
    ['command', ['boatswain', 'master-at-arms', 'operations', 'intelligence', 'command']]
  ])
}

const mockUserProgress: UserProgress = {
  userId: 'test-user',
  completedCourses: new Set(['SIA-SRN-14C']),
  availableCourses: new Set(['SIA-SRN-08C', 'SIA-SRN-14C', 'SIA-SRN-11C']),
  inProgressCourses: new Set(),
  waitingGradeCourses: new Set(),
  specialRulesProgress: new Map(),
  lastUpdated: new Date()
}

const mockFilters: FilterOptions = {}

const mockSettings: UserSettings = {
  autoSave: true,
  language: 'en',
  layout: 'tree',
  showCompleted: true,
  showUnavailable: true,
  theme: 'light'
}

const mockEligibilityEngine = {
  updateCourseAvailability: vi.fn().mockImplementation((progress: UserProgress) => {
    return mockCourseData.courses.map((course) => ({
      ...course,
      completed: progress.completedCourses.has(course.code),
      available: progress.availableCourses.has(course.code)
    }))
  })
} as unknown as EligibilityEngine

const mockProps = {
  courseData: mockCourseData,
  userProgress: mockUserProgress,
  filters: mockFilters,
  settings: mockSettings,
  eligibilityEngine: mockEligibilityEngine,
  onCourseSelect: vi.fn(),
  onCourseToggle: vi.fn(),
  onCourseStatusChange: vi.fn()
}

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <I18nProvider>{component}</I18nProvider>
    </ThemeProvider>
  )
}

describe('SkillTreeView', () => {
  it('renders course tree with section grouping by default', () => {
    renderWithTheme(<SkillTreeView {...mockProps} />)

    // Should show grouping toggle
    expect(screen.getByText('Group by:')).toBeInTheDocument()
    expect(screen.getByText('Section')).toBeInTheDocument()
    expect(screen.getByText('Department')).toBeInTheDocument()

    // Should show section groups
    expect(screen.getByText('Naval Training')).toBeInTheDocument()

    // Should show courses
    expect(screen.getByText('Tactical Course 1')).toBeInTheDocument()
    expect(screen.getByText('Engineering Course 1')).toBeInTheDocument()
    expect(screen.getByText('Communications Course 1')).toBeInTheDocument()
  })

  it('switches to department grouping when department button is clicked', () => {
    renderWithTheme(<SkillTreeView {...mockProps} />)

    // Click department grouping button
    const departmentButton = screen.getByText('Department')
    fireEvent.click(departmentButton)

    // Should show department groups
    expect(screen.getByText('Tactical')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Communications')).toBeInTheDocument()

    // Courses should still be visible
    expect(screen.getByText('Tactical Course 1')).toBeInTheDocument()
    expect(screen.getByText('Engineering Course 1')).toBeInTheDocument()
    expect(screen.getByText('Communications Course 1')).toBeInTheDocument()
  })

  it('switches back to section grouping when section button is clicked', () => {
    renderWithTheme(<SkillTreeView {...mockProps} />)

    // Switch to department grouping first
    const departmentButton = screen.getByText('Department')
    fireEvent.click(departmentButton)

    // Switch back to section grouping
    const sectionButton = screen.getByText('Section')
    fireEvent.click(sectionButton)

    // Should show section groups again
    expect(screen.getByText('Naval Training')).toBeInTheDocument()
  })

  it('calls onCourseSelect when a course is clicked', () => {
    renderWithTheme(<SkillTreeView {...mockProps} />)

    const courseElement = screen.getByText('Tactical Course 1')
    fireEvent.click(courseElement)

    expect(mockProps.onCourseSelect).toHaveBeenCalledWith(expect.objectContaining({ code: 'SIA-SRN-08C' }))
  })

  it('calls onCourseToggle when a course is double-clicked', () => {
    renderWithTheme(<SkillTreeView {...mockProps} />)

    const courseElement = screen.getByText('Tactical Course 1')
    fireEvent.doubleClick(courseElement)

    expect(mockProps.onCourseToggle).toHaveBeenCalledWith('SIA-SRN-08C')
  })

  it('filters courses correctly with search', () => {
    renderWithTheme(<SkillTreeView {...mockProps} />)

    const searchInput = screen.getByPlaceholderText('Search courses by name, code, or section...')
    fireEvent.change(searchInput, { target: { value: 'Tactical' } })

    // Should show only tactical course
    expect(screen.getByText('Tactical Course 1')).toBeInTheDocument()
    expect(screen.queryByText('Engineering Course 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Communications Course 1')).not.toBeInTheDocument()
  })

  it('shows statistics correctly', () => {
    renderWithTheme(<SkillTreeView {...mockProps} />)

    // Should show correct stats
    expect(screen.getByText('1')).toBeInTheDocument() // Completed
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('Total Courses')).toBeInTheDocument()
  })

  describe('Department filtering', () => {
    it('applies department filter correctly', () => {
      const filtersWithDepartment: FilterOptions = {
        departments: ['Tactical']
      }

      renderWithTheme(<SkillTreeView {...mockProps} filters={filtersWithDepartment} />)

      // Should show only tactical courses
      expect(screen.getByText('Tactical Course 1')).toBeInTheDocument()
      expect(screen.queryByText('Engineering Course 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Communications Course 1')).not.toBeInTheDocument()
    })

    it('shows all courses when no department filter is applied', () => {
      renderWithTheme(<SkillTreeView {...mockProps} />)

      // Should show all courses
      expect(screen.getByText('Tactical Course 1')).toBeInTheDocument()
      expect(screen.getByText('Engineering Course 1')).toBeInTheDocument()
      expect(screen.getByText('Communications Course 1')).toBeInTheDocument()
    })
  })
})
