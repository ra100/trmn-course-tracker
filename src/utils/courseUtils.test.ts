import { describe, it, expect } from 'vitest'
import { getCourseSeriesPrefix, extractCourseNumber, sortCoursesByNumber } from './courseUtils'
import type { Course } from '../types'

describe('courseUtils', () => {
  describe('getCourseSeriesPrefix', () => {
    it('should extract series prefix for SIA-SRN courses', () => {
      expect(getCourseSeriesPrefix('SIA-SRN-30A')).toBe('SIA-SRN')
      expect(getCourseSeriesPrefix('SIA-SRN-01C')).toBe('SIA-SRN')
      expect(getCourseSeriesPrefix('SIA-SRN-25D')).toBe('SIA-SRN')
    })

    it('should extract series prefix for SIA-RMN courses', () => {
      expect(getCourseSeriesPrefix('SIA-RMN-0101')).toBe('SIA-RMN')
      expect(getCourseSeriesPrefix('SIA-RMN-1005')).toBe('SIA-RMN')
    })

    it('should extract series prefix for RMACA courses', () => {
      expect(getCourseSeriesPrefix('RMACA-RMACS-02A')).toBe('RMACA-RMACS')
      expect(getCourseSeriesPrefix('RMACA-AOPA-R01')).toBe('RMACA-AOPA')
      expect(getCourseSeriesPrefix('RMACA-RMAIA-07D')).toBe('RMACA-RMAIA')
    })

    it('should extract series prefix for university courses', () => {
      expect(getCourseSeriesPrefix('MU-ECON-01')).toBe('MU')
      expect(getCourseSeriesPrefix('MU-PLSC-02')).toBe('MU')
      expect(getCourseSeriesPrefix('MU-XENO-01')).toBe('MU')
      expect(getCourseSeriesPrefix('MU-HIST-03')).toBe('MU')
    })

    it('should handle edge cases', () => {
      expect(getCourseSeriesPrefix('INVALID')).toBe('INVALID')
      expect(getCourseSeriesPrefix('A-B')).toBe('A')
      expect(getCourseSeriesPrefix('')).toBe('')
    })
  })

  describe('extractCourseNumber', () => {
    it('should extract numbers from SIA-SRN courses', () => {
      expect(extractCourseNumber('SIA-SRN-30A')).toBe(30)
      expect(extractCourseNumber('SIA-SRN-01C')).toBe(1)
      expect(extractCourseNumber('SIA-SRN-25D')).toBe(25)
    })

    it('should extract numbers from SIA-RMN courses', () => {
      expect(extractCourseNumber('SIA-RMN-0101')).toBe(101)
      expect(extractCourseNumber('SIA-RMN-1005')).toBe(1005)
    })

    it('should extract numbers from RMACA courses', () => {
      expect(extractCourseNumber('RMACA-RMACS-02A')).toBe(2)
      expect(extractCourseNumber('RMACA-AOPA-R01')).toBe(1)
      expect(extractCourseNumber('RMACA-RMAIA-07D')).toBe(7)
    })

    it('should extract numbers from university courses', () => {
      expect(extractCourseNumber('MU-ECON-01')).toBe(1)
      expect(extractCourseNumber('MU-PLSC-02')).toBe(2)
    })

    it('should return 0 for courses without numbers', () => {
      expect(extractCourseNumber('NO-NUMBERS-HERE')).toBe(0)
      expect(extractCourseNumber('INVALID')).toBe(0)
    })
  })

  describe('sortCoursesByNumber', () => {
    const createMockCourse = (code: string): Course => ({
      id: code,
      code,
      name: `Course ${code}`,
      section: 'Test Section',
      subsection: 'Test Subsection',
      sectionId: 'test-section',
      subsectionId: 'test-subsection',
      level: 'A',
      prerequisites: [],
      available: true,
      completed: false,
      departments: ['Test']
    })

    it('should sort courses by numeric order', () => {
      const courses = [
        createMockCourse('SIA-SRN-30A'),
        createMockCourse('SIA-SRN-01C'),
        createMockCourse('SIA-SRN-25D'),
        createMockCourse('SIA-SRN-05A')
      ]

      const sorted = sortCoursesByNumber(courses)
      expect(sorted.map((c) => c.code)).toEqual(['SIA-SRN-01C', 'SIA-SRN-05A', 'SIA-SRN-25D', 'SIA-SRN-30A'])
    })

    it('should sort courses with same number by letter suffix', () => {
      const courses = [
        createMockCourse('SIA-SRN-01W'),
        createMockCourse('SIA-SRN-01A'),
        createMockCourse('SIA-SRN-01D'),
        createMockCourse('SIA-SRN-01C')
      ]

      const sorted = sortCoursesByNumber(courses)
      expect(sorted.map((c) => c.code)).toEqual(['SIA-SRN-01A', 'SIA-SRN-01C', 'SIA-SRN-01D', 'SIA-SRN-01W'])
    })

    it('should handle mixed course types', () => {
      const courses = [
        createMockCourse('SIA-RMN-1005'),
        createMockCourse('MU-ECON-01'),
        createMockCourse('SIA-SRN-30A'),
        createMockCourse('RMACA-AOPA-R01')
      ]

      const sorted = sortCoursesByNumber(courses)
      expect(sorted.map((c) => c.code)).toEqual(['MU-ECON-01', 'RMACA-AOPA-R01', 'SIA-SRN-30A', 'SIA-RMN-1005'])
    })
  })
})
