import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useWaitingGradeTracking } from './useWaitingGradeTracking'
import { UserProgress } from '../types'

describe('useWaitingGradeTracking', () => {
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

  it('should return empty arrays when no courses are waiting for grade', () => {
    const userProgress = createMockUserProgress()
    const { result } = renderHook(() => useWaitingGradeTracking(userProgress))

    expect(result.current.waitingGradeInfo).toEqual([])
    expect(result.current.overdueCourses).toEqual([])
    expect(result.current.warningMessage).toBe('')
    expect(result.current.hasOverdueCourses).toBe(false)
    expect(result.current.totalWaitingGrade).toBe(0)
    expect(result.current.totalOverdue).toBe(0)
  })

  it('should track courses in waiting_grade status', () => {
    const userProgress = createMockUserProgress({
      waitingGradeCourses: new Set(['COURSE-001', 'COURSE-002']),
      courseStatusTimestamps: new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2024-01-10T12:00:00.000Z') }], // 5 days ago
        ['COURSE-002', { status: 'waiting_grade', timestamp: new Date('2024-01-08T12:00:00.000Z') }] // 7 days ago
      ])
    })

    const { result } = renderHook(() => useWaitingGradeTracking(userProgress))

    expect(result.current.waitingGradeInfo).toEqual([
      {
        courseId: 'COURSE-002',
        daysWaiting: 7,
        formattedTimestamp: '7 days ago',
        timestamp: new Date('2024-01-08T12:00:00.000Z'),
        isOverdue: false
      },
      {
        courseId: 'COURSE-001',
        daysWaiting: 5,
        formattedTimestamp: '5 days ago',
        timestamp: new Date('2024-01-10T12:00:00.000Z'),
        isOverdue: false
      }
    ])
    expect(result.current.totalWaitingGrade).toBe(2)
    expect(result.current.totalOverdue).toBe(0)
    expect(result.current.hasOverdueCourses).toBe(false)
  })

  it('should identify overdue courses', () => {
    const userProgress = createMockUserProgress({
      waitingGradeCourses: new Set(['COURSE-001', 'COURSE-002', 'COURSE-003']),
      courseStatusTimestamps: new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2023-12-31T12:00:00.000Z') }], // 15 days ago
        ['COURSE-002', { status: 'waiting_grade', timestamp: new Date('2024-01-10T12:00:00.000Z') }], // 5 days ago
        ['COURSE-003', { status: 'waiting_grade', timestamp: new Date('2023-12-20T12:00:00.000Z') }] // 26 days ago
      ])
    })

    const { result } = renderHook(() => useWaitingGradeTracking(userProgress))

    expect(result.current.waitingGradeInfo).toEqual([
      {
        courseId: 'COURSE-003',
        daysWaiting: 26,
        formattedTimestamp: 'Dec 20, 2023',
        timestamp: new Date('2023-12-20T12:00:00.000Z'),
        isOverdue: true
      },
      {
        courseId: 'COURSE-001',
        daysWaiting: 15,
        formattedTimestamp: 'Dec 31, 2023',
        timestamp: new Date('2023-12-31T12:00:00.000Z'),
        isOverdue: true
      },
      {
        courseId: 'COURSE-002',
        daysWaiting: 5,
        formattedTimestamp: '5 days ago',
        timestamp: new Date('2024-01-10T12:00:00.000Z'),
        isOverdue: false
      }
    ])

    expect(result.current.overdueCourses).toEqual([
      { courseId: 'COURSE-003', daysWaiting: 26 },
      { courseId: 'COURSE-001', daysWaiting: 15 }
    ])

    expect(result.current.totalWaitingGrade).toBe(3)
    expect(result.current.totalOverdue).toBe(2)
    expect(result.current.hasOverdueCourses).toBe(true)
  })

  it('should generate appropriate warning messages', () => {
    const singleOverdueProgress = createMockUserProgress({
      waitingGradeCourses: new Set(['COURSE-001']),
      courseStatusTimestamps: new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2023-12-31T12:00:00.000Z') }] // 15 days ago
      ])
    })

    const { result: singleResult } = renderHook(() => useWaitingGradeTracking(singleOverdueProgress))
    expect(singleResult.current.warningMessage).toBe('Course COURSE-001 has been waiting for grades for 15 days')

    const multipleOverdueProgress = createMockUserProgress({
      waitingGradeCourses: new Set(['COURSE-001', 'COURSE-002']),
      courseStatusTimestamps: new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2023-12-31T12:00:00.000Z') }], // 15 days ago
        ['COURSE-002', { status: 'waiting_grade', timestamp: new Date('2023-12-20T12:00:00.000Z') }] // 26 days ago
      ])
    })

    const { result: multipleResult } = renderHook(() => useWaitingGradeTracking(multipleOverdueProgress))
    expect(multipleResult.current.warningMessage).toBe('2 courses have been waiting for grades for more than 14 days')
  })

  it('should handle courses with missing timestamp data', () => {
    const userProgress = createMockUserProgress({
      waitingGradeCourses: new Set(['COURSE-001', 'COURSE-002']),
      courseStatusTimestamps: new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2023-12-31T12:00:00.000Z') }]
        // COURSE-002 has no timestamp data
      ])
    })

    const { result } = renderHook(() => useWaitingGradeTracking(userProgress))

    expect(result.current.waitingGradeInfo).toEqual([
      {
        courseId: 'COURSE-001',
        daysWaiting: 15,
        formattedTimestamp: 'Dec 31, 2023',
        timestamp: new Date('2023-12-31T12:00:00.000Z'),
        isOverdue: true
      }
    ])
    expect(result.current.totalWaitingGrade).toBe(2) // Still counts the course without timestamp
    expect(result.current.totalOverdue).toBe(1) // But only counts the one with overdue timestamp
  })

  it('should ignore courses with non-waiting_grade status in timestamps', () => {
    const userProgress = createMockUserProgress({
      waitingGradeCourses: new Set(['COURSE-001', 'COURSE-002']),
      courseStatusTimestamps: new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2023-12-31T12:00:00.000Z') }],
        ['COURSE-002', { status: 'completed', timestamp: new Date('2023-12-31T12:00:00.000Z') }] // Status mismatch
      ])
    })

    const { result } = renderHook(() => useWaitingGradeTracking(userProgress))

    expect(result.current.waitingGradeInfo).toEqual([
      {
        courseId: 'COURSE-001',
        daysWaiting: 15,
        formattedTimestamp: 'Dec 31, 2023',
        timestamp: new Date('2023-12-31T12:00:00.000Z'),
        isOverdue: true
      }
    ])
    expect(result.current.totalWaitingGrade).toBe(2)
    expect(result.current.totalOverdue).toBe(1)
  })

  it('should sort courses by days waiting in descending order', () => {
    const userProgress = createMockUserProgress({
      waitingGradeCourses: new Set(['COURSE-001', 'COURSE-002', 'COURSE-003']),
      courseStatusTimestamps: new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2024-01-10T12:00:00.000Z') }], // 5 days ago
        ['COURSE-002', { status: 'waiting_grade', timestamp: new Date('2023-12-31T12:00:00.000Z') }], // 15 days ago
        ['COURSE-003', { status: 'waiting_grade', timestamp: new Date('2024-01-08T12:00:00.000Z') }] // 7 days ago
      ])
    })

    const { result } = renderHook(() => useWaitingGradeTracking(userProgress))

    expect(result.current.waitingGradeInfo.map((info) => info.courseId)).toEqual([
      'COURSE-002', // 15 days (most)
      'COURSE-003', // 7 days
      'COURSE-001' // 5 days (least)
    ])
  })
})
