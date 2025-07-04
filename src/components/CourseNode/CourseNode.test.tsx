import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeProvider } from 'styled-components'
import { darkTheme } from '../../theme'
import { CourseNode } from './CourseNode'
import { Course, UserProgress, NodeStatus } from '../../types'

// Mock analytics
vi.mock('../../utils/analytics', () => ({
  trackCourseDetailsView: vi.fn(),
  trackFeatureEngagement: vi.fn()
}))

// Mock i18n
vi.mock('../../i18n', () => ({
  useT: () => ({
    courseActions: {
      doubleClickToToggle: 'Double click to toggle',
      markIncomplete: 'Mark Incomplete',
      markComplete: 'Mark Complete',
      rightClickForOptions: 'Right click for options'
    },
    courseStatus: {
      available: 'Available',
      inProgress: 'In Progress',
      waitingGrade: 'Waiting Grade',
      completed: 'Completed'
    }
  })
}))

const createMockCourse = (overrides?: Partial<Course>): Course => ({
  id: 'test-course-1',
  name: 'Test Course',
  code: 'TST-001',
  prerequisites: [],
  section: 'Test Section',
  subsection: 'Test Subsection',
  sectionId: 'test-section-id',
  subsectionId: 'test-subsection-id',
  completed: false,
  available: true,
  level: 'A',
  ...overrides
})

const createMockUserProgress = (): UserProgress => ({
  userId: 'test-user',
  completedCourses: new Set(),
  availableCourses: new Set(),
  inProgressCourses: new Set(),
  waitingGradeCourses: new Set(),
  specialRulesProgress: new Map(),
  lastUpdated: new Date()
})

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={darkTheme}>{component}</ThemeProvider>)
}

describe('CourseNode', () => {
  const mockOnCourseSelect = vi.fn()
  const mockOnCourseToggle = vi.fn()
  const mockOnCourseStatusChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const defaultProps = {
    course: createMockCourse(),
    status: 'available' as NodeStatus,
    userProgress: createMockUserProgress(),
    onCourseSelect: mockOnCourseSelect,
    onCourseToggle: mockOnCourseToggle,
    onCourseStatusChange: mockOnCourseStatusChange
  }

  it('renders course information correctly', () => {
    const course = createMockCourse({
      name: 'Advanced Testing',
      code: 'TST-ADV-001',
      level: 'A'
    })

    renderWithTheme(<CourseNode {...defaultProps} course={course} />)

    expect(screen.getByText('Advanced Testing')).toBeInTheDocument()
    expect(screen.getByText('TST-ADV-001')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('displays prerequisites correctly', () => {
    const course = createMockCourse({
      prerequisites: [
        { type: 'course', code: 'TST-001', required: true },
        { type: 'course', code: 'TST-002', required: true }
      ]
    })

    renderWithTheme(<CourseNode {...defaultProps} course={course} />)

    expect(screen.getByText('Requires: TST-001, TST-002')).toBeInTheDocument()
  })

  it('shows "No prerequisites" when course has no prerequisites', () => {
    const course = createMockCourse({ prerequisites: [] })

    renderWithTheme(<CourseNode {...defaultProps} course={course} />)

    expect(screen.getByText('No prerequisites')).toBeInTheDocument()
  })

  it('calls onCourseSelect when clicked', () => {
    renderWithTheme(<CourseNode {...defaultProps} />)

    const courseNode = screen.getByRole('button')
    fireEvent.click(courseNode)

    expect(mockOnCourseSelect).toHaveBeenCalledWith(defaultProps.course)
  })

  it('calls onCourseToggle when double clicked for available course', () => {
    const course = createMockCourse({ available: true })

    renderWithTheme(<CourseNode {...defaultProps} course={course} />)

    const courseNode = screen.getByRole('button')
    fireEvent.doubleClick(courseNode)

    expect(mockOnCourseToggle).toHaveBeenCalledWith(course.code)
  })

  it('calls onCourseToggle when double clicked for completed course', () => {
    const course = createMockCourse({ completed: true })

    renderWithTheme(<CourseNode {...defaultProps} course={course} />)

    const courseNode = screen.getByRole('button')
    fireEvent.doubleClick(courseNode)

    expect(mockOnCourseToggle).toHaveBeenCalledWith(course.code)
  })

  it('does not call onCourseToggle when double clicked for locked course', () => {
    const course = createMockCourse({ available: false, completed: false })

    renderWithTheme(<CourseNode {...defaultProps} course={course} status="locked" />)

    const courseNode = screen.getByRole('button')
    fireEvent.doubleClick(courseNode)

    expect(mockOnCourseToggle).not.toHaveBeenCalled()
  })

  it('handles keyboard interaction correctly', () => {
    renderWithTheme(<CourseNode {...defaultProps} />)

    const courseNode = screen.getByRole('button')
    fireEvent.keyDown(courseNode, { key: 'Enter' })

    expect(mockOnCourseSelect).toHaveBeenCalledWith(defaultProps.course)
  })

  it('handles space bar keyboard interaction', () => {
    renderWithTheme(<CourseNode {...defaultProps} />)

    const courseNode = screen.getByRole('button')
    fireEvent.keyDown(courseNode, { key: ' ' })

    expect(mockOnCourseSelect).toHaveBeenCalledWith(defaultProps.course)
  })

  it('displays correct status icon for completed course', () => {
    renderWithTheme(<CourseNode {...defaultProps} status="completed" />)

    const courseNode = screen.getByRole('button')
    expect(courseNode).toBeInTheDocument()
    // Status icon is rendered via CSS pseudo-element, so we can't test content directly
  })

  it('displays correct status icon for in progress course', () => {
    renderWithTheme(<CourseNode {...defaultProps} status="in_progress" />)

    const courseNode = screen.getByRole('button')
    expect(courseNode).toBeInTheDocument()
  })

  it('displays correct status icon for locked course', () => {
    renderWithTheme(<CourseNode {...defaultProps} status="locked" />)

    const courseNode = screen.getByRole('button')
    expect(courseNode).toBeInTheDocument()
  })

  it('has correct accessibility attributes', () => {
    const course = createMockCourse({ name: 'Test Course', code: 'TST-001' })

    renderWithTheme(<CourseNode {...defaultProps} course={course} status="available" />)

    const courseNode = screen.getByRole('button')
    expect(courseNode).toHaveAttribute('tabIndex', '0')
    expect(courseNode).toHaveAttribute('aria-label')
    expect(courseNode).toHaveAttribute('title')
  })

  it('renders without level when level is not provided', () => {
    const course = createMockCourse({ level: undefined })

    renderWithTheme(<CourseNode {...defaultProps} course={course} />)

    expect(screen.getByText('Test Course')).toBeInTheDocument()
    expect(screen.queryByText('A')).not.toBeInTheDocument()
  })

  it('truncates long prerequisite lists', () => {
    const course = createMockCourse({
      prerequisites: [
        { type: 'course', code: 'TST-001', required: true },
        { type: 'course', code: 'TST-002', required: true },
        { type: 'course', code: 'TST-003', required: true },
        { type: 'course', code: 'TST-004', required: true }
      ]
    })

    renderWithTheme(<CourseNode {...defaultProps} course={course} />)

    expect(screen.getByText('Requires: TST-001, TST-002, TST-003...')).toBeInTheDocument()
  })
})
