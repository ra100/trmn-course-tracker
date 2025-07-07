import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WaitingGradeAlert } from './WaitingGradeAlert'
import { UserProgress } from '../../types'
import { I18nProvider } from '../../i18n'

describe('WaitingGradeAlert', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const createMockUserProgress = (overrides: Partial<UserProgress> = {}): UserProgress => ({
    userId: 'test-user',
    completedCourses: new Set(),
    availableCourses: new Set(),
    inProgressCourses: new Set(),
    waitingGradeCourses: new Set(),
    courseStatusTimestamps: new Map(),
    courseCompletionDates: new Map(),
    specialRulesProgress: new Map(),
    lastUpdated: new Date(),
    ...overrides
  })

  const renderWithI18n = (component: React.ReactElement) => {
    return render(<I18nProvider>{component}</I18nProvider>)
  }

  it('should not render when no courses are waiting for grade', () => {
    const userProgress = createMockUserProgress()
    const { container } = renderWithI18n(<WaitingGradeAlert userProgress={userProgress} />)

    expect(container.firstChild).toBeNull()
  })

  it('should render waiting grade courses without overdue warning', () => {
    const userProgress = createMockUserProgress({
      waitingGradeCourses: new Set(['COURSE-001', 'COURSE-002']),
      courseStatusTimestamps: new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2024-01-10T12:00:00.000Z') }], // 5 days ago
        ['COURSE-002', { status: 'waiting_grade', timestamp: new Date('2024-01-08T12:00:00.000Z') }] // 7 days ago
      ])
    })

    renderWithI18n(<WaitingGradeAlert userProgress={userProgress} />)

    expect(screen.getByText('📋 Courses Waiting for Grade')).toBeInTheDocument()
    expect(screen.getByText('2 waiting for grade')).toBeInTheDocument()
    expect(screen.getByText('COURSE-001')).toBeInTheDocument()
    expect(screen.getByText('COURSE-002')).toBeInTheDocument()
    expect(screen.getByText('5 days ago')).toBeInTheDocument()
    expect(screen.getByText('7 days ago')).toBeInTheDocument()

    // Should not show overdue warning
    expect(screen.queryByText(/⚠️.*courses have been waiting for grades/)).not.toBeInTheDocument()
  })

  it('should render overdue warning for courses waiting too long', () => {
    const userProgress = createMockUserProgress({
      waitingGradeCourses: new Set(['COURSE-001', 'COURSE-002', 'COURSE-003']),
      courseStatusTimestamps: new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2023-12-31T12:00:00.000Z') }], // 15 days ago
        ['COURSE-002', { status: 'waiting_grade', timestamp: new Date('2024-01-10T12:00:00.000Z') }], // 5 days ago
        ['COURSE-003', { status: 'waiting_grade', timestamp: new Date('2023-12-20T12:00:00.000Z') }] // 26 days ago
      ])
    })

    renderWithI18n(<WaitingGradeAlert userProgress={userProgress} />)

    expect(screen.getByText('⚠️ Courses Waiting for Grade')).toBeInTheDocument()
    expect(screen.getByText('3 waiting for grade')).toBeInTheDocument()
    expect(screen.getByText('2 overdue')).toBeInTheDocument()
    expect(screen.getByText('2 courses have been waiting for grades for more than 14 days')).toBeInTheDocument()

    // Check that overdue courses are marked correctly
    expect(screen.getAllByText('OVERDUE')).toHaveLength(2)
  })

  it('should handle course selection when onCourseSelect is provided', () => {
    const mockOnCourseSelect = vi.fn()
    const userProgress = createMockUserProgress({
      waitingGradeCourses: new Set(['COURSE-001']),
      courseStatusTimestamps: new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2024-01-10T12:00:00.000Z') }]
      ])
    })

    renderWithI18n(<WaitingGradeAlert userProgress={userProgress} onCourseSelect={mockOnCourseSelect} />)

    const courseElement = screen.getByText('COURSE-001')
    const courseItem = courseElement.closest('div')
    expect(courseItem).toBeInTheDocument()

    if (!courseItem) {
      throw new Error('Course item not found')
    }

    fireEvent.click(courseItem)
    expect(mockOnCourseSelect).toHaveBeenCalledWith('COURSE-001')
  })

  it('should display courses sorted by days waiting (most overdue first)', () => {
    const userProgress = createMockUserProgress({
      waitingGradeCourses: new Set(['COURSE-001', 'COURSE-002', 'COURSE-003']),
      courseStatusTimestamps: new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2024-01-10T12:00:00.000Z') }], // 5 days ago
        ['COURSE-002', { status: 'waiting_grade', timestamp: new Date('2023-12-31T12:00:00.000Z') }], // 15 days ago
        ['COURSE-003', { status: 'waiting_grade', timestamp: new Date('2024-01-08T12:00:00.000Z') }] // 7 days ago
      ])
    })

    renderWithI18n(<WaitingGradeAlert userProgress={userProgress} />)

    // Courses should be sorted by days waiting in descending order:
    // COURSE-002: 15 days, COURSE-003: 7 days, COURSE-001: 5 days
    expect(screen.getByTestId('course-item-COURSE-002')).toBeInTheDocument() // 15 days (most)
    expect(screen.getByTestId('course-item-COURSE-003')).toBeInTheDocument() // 7 days
    expect(screen.getByTestId('course-item-COURSE-001')).toBeInTheDocument() // 5 days (least)

    // Verify the order by checking the DOM order
    const courseItems = [
      screen.getByTestId('course-item-COURSE-002'),
      screen.getByTestId('course-item-COURSE-003'),
      screen.getByTestId('course-item-COURSE-001')
    ]

    const allCourseItems = screen.getAllByTestId(/course-item-/)
    expect(allCourseItems[0]).toBe(courseItems[0]) // COURSE-002 should be first
    expect(allCourseItems[1]).toBe(courseItems[1]) // COURSE-003 should be second
    expect(allCourseItems[2]).toBe(courseItems[2]) // COURSE-001 should be third
  })

  it('should display appropriate timestamp formatting', () => {
    const userProgress = createMockUserProgress({
      waitingGradeCourses: new Set(['COURSE-001', 'COURSE-002']),
      courseStatusTimestamps: new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2024-01-10T12:00:00.000Z') }], // 5 days ago
        ['COURSE-002', { status: 'waiting_grade', timestamp: new Date('2023-12-25T12:00:00.000Z') }] // 21 days ago (formatted as date)
      ])
    })

    renderWithI18n(<WaitingGradeAlert userProgress={userProgress} />)

    expect(screen.getByText('5 days ago')).toBeInTheDocument()
    expect(screen.getByText('Dec 25, 2023')).toBeInTheDocument() // Older than 2 weeks shows date
  })

  it('should show single course overdue message correctly', () => {
    const userProgress = createMockUserProgress({
      waitingGradeCourses: new Set(['COURSE-001']),
      courseStatusTimestamps: new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2023-12-31T12:00:00.000Z') }] // 15 days ago
      ])
    })

    renderWithI18n(<WaitingGradeAlert userProgress={userProgress} />)

    expect(screen.getByText('Course COURSE-001 has been waiting for grades for 15 days')).toBeInTheDocument()
  })

  it('should handle courses with missing timestamp data gracefully', () => {
    const userProgress = createMockUserProgress({
      waitingGradeCourses: new Set(['COURSE-001', 'COURSE-002']),
      courseStatusTimestamps: new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2024-01-10T12:00:00.000Z') }]
        // COURSE-002 has no timestamp data
      ])
    })

    renderWithI18n(<WaitingGradeAlert userProgress={userProgress} />)

    expect(screen.getByText('2 waiting for grade')).toBeInTheDocument() // Still shows total count
    expect(screen.getByText('COURSE-001')).toBeInTheDocument() // Shows course with timestamp
    expect(screen.queryByText('COURSE-002')).not.toBeInTheDocument() // Doesn't show course without timestamp
  })
})
