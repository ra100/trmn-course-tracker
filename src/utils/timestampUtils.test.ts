import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatTimestamp,
  formatTimestampForTooltip,
  isWaitingGradeTooLong,
  getDaysInWaitingGrade,
  getOverdueWaitingGradeCourses,
  getWaitingGradeWarningMessage,
  WAITING_GRADE_THRESHOLD_DAYS
} from './timestampUtils'

describe('timestampUtils', () => {
  beforeEach(() => {
    // Mock current date to a fixed time for consistent testing
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatTimestamp', () => {
    it('should return "today" for current date', () => {
      const today = new Date('2024-01-15T12:00:00.000Z')
      expect(formatTimestamp(today)).toBe('today')
    })

    it('should return "1 day ago" for yesterday', () => {
      const yesterday = new Date('2024-01-14T12:00:00.000Z')
      expect(formatTimestamp(yesterday)).toBe('1 day ago')
    })

    it('should return "x days ago" for days within 2 weeks', () => {
      const threeDaysAgo = new Date('2024-01-12T12:00:00.000Z')
      expect(formatTimestamp(threeDaysAgo)).toBe('3 days ago')

      const tenDaysAgo = new Date('2024-01-05T12:00:00.000Z')
      expect(formatTimestamp(tenDaysAgo)).toBe('10 days ago')
    })

    it('should return formatted date for dates older than 2 weeks', () => {
      const threeWeeksAgo = new Date('2023-12-25T12:00:00.000Z')
      expect(formatTimestamp(threeWeeksAgo)).toBe('Dec 25, 2023')

      const twoMonthsAgo = new Date('2023-11-15T12:00:00.000Z')
      expect(formatTimestamp(twoMonthsAgo)).toBe('Nov 15, 2023')
    })

    it('should handle edge case of exactly 14 days ago', () => {
      const exactlyTwoWeeksAgo = new Date('2024-01-01T12:00:00.000Z')
      expect(formatTimestamp(exactlyTwoWeeksAgo)).toBe('Jan 1, 2024')
    })
  })

  describe('isWaitingGradeTooLong', () => {
    it('should return false for timestamps within threshold', () => {
      const recent = new Date('2024-01-10T12:00:00.000Z') // 5 days ago
      expect(isWaitingGradeTooLong(recent)).toBe(false)

      const exactlyThreshold = new Date('2024-01-01T12:00:00.000Z') // 14 days ago
      expect(isWaitingGradeTooLong(exactlyThreshold)).toBe(false)
    })

    it('should return true for timestamps beyond threshold', () => {
      const tooOld = new Date('2023-12-31T12:00:00.000Z') // 15 days ago
      expect(isWaitingGradeTooLong(tooOld)).toBe(true)

      const wayTooOld = new Date('2023-12-01T12:00:00.000Z') // 45 days ago
      expect(isWaitingGradeTooLong(wayTooOld)).toBe(true)
    })
  })

  describe('getDaysInWaitingGrade', () => {
    it('should return correct number of days', () => {
      const fiveDaysAgo = new Date('2024-01-10T12:00:00.000Z')
      expect(getDaysInWaitingGrade(fiveDaysAgo)).toBe(5)

      const fifteenDaysAgo = new Date('2023-12-31T12:00:00.000Z')
      expect(getDaysInWaitingGrade(fifteenDaysAgo)).toBe(15)
    })

    it('should return 0 for current date', () => {
      const today = new Date('2024-01-15T12:00:00.000Z')
      expect(getDaysInWaitingGrade(today)).toBe(0)
    })
  })

  describe('getOverdueWaitingGradeCourses', () => {
    it('should return empty array when no courses are overdue', () => {
      const waitingGradeCourses = new Set(['COURSE-001', 'COURSE-002'])
      const courseStatusTimestamps = new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2024-01-10T12:00:00.000Z') }], // 5 days ago
        ['COURSE-002', { status: 'waiting_grade', timestamp: new Date('2024-01-08T12:00:00.000Z') }] // 7 days ago
      ])

      const result = getOverdueWaitingGradeCourses(waitingGradeCourses, courseStatusTimestamps)
      expect(result).toEqual([])
    })

    it('should return overdue courses sorted by most overdue first', () => {
      const waitingGradeCourses = new Set(['COURSE-001', 'COURSE-002', 'COURSE-003'])
      const courseStatusTimestamps = new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2023-12-31T12:00:00.000Z') }], // 15 days ago
        ['COURSE-002', { status: 'waiting_grade', timestamp: new Date('2024-01-10T12:00:00.000Z') }], // 5 days ago (not overdue)
        ['COURSE-003', { status: 'waiting_grade', timestamp: new Date('2023-12-20T12:00:00.000Z') }] // 26 days ago
      ])

      const result = getOverdueWaitingGradeCourses(waitingGradeCourses, courseStatusTimestamps)
      expect(result).toEqual([
        { courseId: 'COURSE-003', daysWaiting: 26 },
        { courseId: 'COURSE-001', daysWaiting: 15 }
      ])
    })

    it('should handle courses with no timestamp data', () => {
      const waitingGradeCourses = new Set(['COURSE-001', 'COURSE-002'])
      const courseStatusTimestamps = new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2023-12-31T12:00:00.000Z') }] // 15 days ago
        // COURSE-002 has no timestamp data
      ])

      const result = getOverdueWaitingGradeCourses(waitingGradeCourses, courseStatusTimestamps)
      expect(result).toEqual([{ courseId: 'COURSE-001', daysWaiting: 15 }])
    })

    it('should ignore courses with non-waiting_grade status', () => {
      const waitingGradeCourses = new Set(['COURSE-001', 'COURSE-002'])
      const courseStatusTimestamps = new Map([
        ['COURSE-001', { status: 'waiting_grade', timestamp: new Date('2023-12-31T12:00:00.000Z') }], // 15 days ago
        ['COURSE-002', { status: 'completed', timestamp: new Date('2023-12-31T12:00:00.000Z') }] // 15 days ago but completed
      ])

      const result = getOverdueWaitingGradeCourses(waitingGradeCourses, courseStatusTimestamps)
      expect(result).toEqual([{ courseId: 'COURSE-001', daysWaiting: 15 }])
    })
  })

  describe('getWaitingGradeWarningMessage', () => {
    it('should return empty string for no overdue courses', () => {
      const result = getWaitingGradeWarningMessage([])
      expect(result).toBe('')
    })

    it('should return specific message for single overdue course', () => {
      const overdueCourses = [{ courseId: 'COURSE-001', daysWaiting: 20 }]
      const result = getWaitingGradeWarningMessage(overdueCourses)
      expect(result).toBe('Course COURSE-001 has been waiting for grades for 20 days')
    })

    it('should return general message for multiple overdue courses', () => {
      const overdueCourses = [
        { courseId: 'COURSE-001', daysWaiting: 20 },
        { courseId: 'COURSE-002', daysWaiting: 25 },
        { courseId: 'COURSE-003', daysWaiting: 30 }
      ]
      const result = getWaitingGradeWarningMessage(overdueCourses)
      expect(result).toBe(`3 courses have been waiting for grades for more than ${WAITING_GRADE_THRESHOLD_DAYS} days`)
    })
  })

  describe('formatTimestampForTooltip', () => {
    it('should format timestamp with full date and time', () => {
      const timestamp = new Date('2024-01-15T14:30:45.000Z')
      const formatted = formatTimestampForTooltip(timestamp)

      // The exact format might vary by locale, but should include date and time
      expect(formatted).toMatch(/Jan 15, 2024/)
      expect(formatted).toMatch(/\d{1,2}:\d{2}:\d{2}/)
    })

    it('should handle different timestamps consistently', () => {
      const morningTimestamp = new Date('2024-01-15T08:15:30.000Z')
      const eveningTimestamp = new Date('2024-01-15T20:45:15.000Z')

      const morningFormatted = formatTimestampForTooltip(morningTimestamp)
      const eveningFormatted = formatTimestampForTooltip(eveningTimestamp)

      // Both should contain the date
      expect(morningFormatted).toMatch(/Jan 15, 2024/)
      expect(eveningFormatted).toMatch(/Jan 15, 2024/)

      // Both should contain time information
      expect(morningFormatted).toMatch(/\d{1,2}:\d{2}:\d{2}/)
      expect(eveningFormatted).toMatch(/\d{1,2}:\d{2}:\d{2}/)
    })
  })
})
