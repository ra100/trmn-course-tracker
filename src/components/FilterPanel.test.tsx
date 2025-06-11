import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeProvider } from 'styled-components'
import { FilterPanel } from './FilterPanel'
import { FilterOptions, ParsedCourseData } from '../types'
import { lightTheme } from '../theme'
import { I18nProvider } from '../i18n'

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <I18nProvider>{component}</I18nProvider>
    </ThemeProvider>
  )
}

const mockCourseData: ParsedCourseData = {
  courses: [
    {
      id: '1',
      code: 'TEST-001',
      name: 'Test Course 1',
      section: 'Tactical School',
      subsection: 'Fire Control',
      sectionId: 'tactical-school',
      subsectionId: 'fire-control',
      level: 'A',
      prerequisites: [],
      available: true,
      completed: false,
      departments: ['Tactical']
    },
    {
      id: '2',
      code: 'TEST-002',
      name: 'Test Course 2',
      section: 'Engineering School',
      subsection: 'Engineering',
      sectionId: 'engineering-school',
      subsectionId: 'engineering',
      level: 'C',
      prerequisites: [],
      available: true,
      completed: false,
      departments: ['Engineering']
    }
  ],
  courseMap: new Map(),
  categoryMap: new Map(),
  dependencyGraph: new Map(),
  categories: [],
  specialRules: [],
  departmentMappings: new Map(),
  seriesMappings: new Map()
}

// Set up the course map
mockCourseData.courses.forEach((course) => {
  mockCourseData.courseMap.set(course.code, course)
})

describe('FilterPanel', () => {
  const mockOnFilterChange = vi.fn()
  const defaultFilters: FilterOptions = {}

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders filter panel with all sections', () => {
    renderWithTheme(
      <FilterPanel filters={defaultFilters} courseData={mockCourseData} onFilterChange={mockOnFilterChange} />
    )

    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByText('Levels')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('displays all status filter options including new ones', () => {
    renderWithTheme(
      <FilterPanel filters={defaultFilters} courseData={mockCourseData} onFilterChange={mockOnFilterChange} />
    )

    // Check all status options are present
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Working On')).toBeInTheDocument()
    expect(screen.getByText('Waiting Grade')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('Locked')).toBeInTheDocument()
  })

  it('calls onFilterChange when status filters are toggled', () => {
    renderWithTheme(
      <FilterPanel filters={defaultFilters} courseData={mockCourseData} onFilterChange={mockOnFilterChange} />
    )

    // Click on "Working On" status filter
    const workingOnCheckbox = screen.getByLabelText(/Working On/i)
    fireEvent.click(workingOnCheckbox)

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      status: ['in_progress']
    })
  })

  it('calls onFilterChange when waiting grade filter is toggled', () => {
    renderWithTheme(
      <FilterPanel filters={defaultFilters} courseData={mockCourseData} onFilterChange={mockOnFilterChange} />
    )

    // Click on "Waiting Grade" status filter
    const waitingGradeCheckbox = screen.getByLabelText(/Waiting Grade/i)
    fireEvent.click(waitingGradeCheckbox)

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      status: ['waiting_grade']
    })
  })

  it('displays multiple selected status filters correctly', () => {
    const filtersWithMultipleStatus: FilterOptions = {
      status: ['completed', 'in_progress', 'waiting_grade']
    }

    renderWithTheme(
      <FilterPanel
        filters={filtersWithMultipleStatus}
        courseData={mockCourseData}
        onFilterChange={mockOnFilterChange}
      />
    )

    // Verify checkboxes are checked
    const completedCheckbox = screen.getByLabelText(/Completed/i) as HTMLInputElement
    const workingOnCheckbox = screen.getByLabelText(/Working On/i) as HTMLInputElement
    const waitingGradeCheckbox = screen.getByLabelText(/Waiting Grade/i) as HTMLInputElement
    const availableCheckbox = screen.getByLabelText(/Available/i) as HTMLInputElement

    expect(completedCheckbox.checked).toBe(true)
    expect(workingOnCheckbox.checked).toBe(true)
    expect(waitingGradeCheckbox.checked).toBe(true)
    expect(availableCheckbox.checked).toBe(false)
  })

  it('shows active filter count when filters are applied', () => {
    const filtersWithStatus: FilterOptions = {
      status: ['in_progress', 'waiting_grade']
    }

    renderWithTheme(
      <FilterPanel filters={filtersWithStatus} courseData={mockCourseData} onFilterChange={mockOnFilterChange} />
    )

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Active Filters')).toBeInTheDocument()
  })

  it('shows singular active filter text when only one filter is applied', () => {
    const filtersWithOneStatus: FilterOptions = {
      status: ['in_progress']
    }

    renderWithTheme(
      <FilterPanel filters={filtersWithOneStatus} courseData={mockCourseData} onFilterChange={mockOnFilterChange} />
    )

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Active Filter')).toBeInTheDocument()
  })

  it('clears all filters when clear button is clicked', () => {
    const filtersWithStatus: FilterOptions = {
      status: ['in_progress', 'waiting_grade']
    }

    renderWithTheme(
      <FilterPanel filters={filtersWithStatus} courseData={mockCourseData} onFilterChange={mockOnFilterChange} />
    )

    const clearButton = screen.getByText('Clear Filters')
    fireEvent.click(clearButton)

    expect(mockOnFilterChange).toHaveBeenCalledWith({})
  })

  it('removes status filter when unchecked', () => {
    const filtersWithMultipleStatus: FilterOptions = {
      status: ['completed', 'in_progress']
    }

    renderWithTheme(
      <FilterPanel
        filters={filtersWithMultipleStatus}
        courseData={mockCourseData}
        onFilterChange={mockOnFilterChange}
      />
    )

    // Uncheck "Working On" status filter
    const workingOnCheckbox = screen.getByLabelText(/Working On/i)
    fireEvent.click(workingOnCheckbox)

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      status: ['completed']
    })
  })

  it('displays course levels', () => {
    renderWithTheme(
      <FilterPanel filters={defaultFilters} courseData={mockCourseData} onFilterChange={mockOnFilterChange} />
    )

    expect(screen.getByText('A (Basic)')).toBeInTheDocument()
    expect(screen.getByText('C (Intermediate)')).toBeInTheDocument()
    expect(screen.getByText('D (Advanced)')).toBeInTheDocument()
    expect(screen.getByText('W (Specialist)')).toBeInTheDocument()
  })
})
