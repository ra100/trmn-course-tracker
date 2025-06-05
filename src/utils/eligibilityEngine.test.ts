import { describe, it, expect, beforeEach } from 'vitest'
import { EligibilityEngine } from './eligibilityEngine'
import { Course, UserProgress, ParsedCourseData, Category } from '../types'

describe('EligibilityEngine', () => {
  let eligibilityEngine: EligibilityEngine
  let sampleCourses: Course[]
  let emptyProgress: UserProgress
  let sampleCourseData: ParsedCourseData

  beforeEach(() => {
    // Create sample courses with warrant courses and alternative prerequisites
    sampleCourses = [
      {
        id: '1',
        name: 'Basic Enlistment Course',
        code: 'SIA-RMN-0001',
        prerequisites: [],
        section: 'Enlisted Training Center',
        subsection: '',
        sectionId: 'section1',
        subsectionId: '',
        completed: false,
        available: true,
        level: 'A'
      },
      {
        id: '2',
        name: 'Senior Chief Petty Officer',
        code: 'SIA-RMN-0004',
        prerequisites: [
          { type: 'course', code: 'SIA-RMN-0001', required: true },
          { type: 'course', code: 'SIA-RMN-0002', required: true },
          { type: 'course', code: 'SIA-RMN-0003', required: true }
        ],
        section: 'Enlisted Training Center',
        subsection: '',
        sectionId: 'section1',
        subsectionId: '',
        completed: false,
        available: false,
        level: 'A'
      },
      {
        id: '3',
        name: 'Storekeeper Warrant Project',
        code: 'SIA-SRN-20W',
        prerequisites: [
          { type: 'course', code: 'SIA-RMN-0011', required: true },
          { type: 'course', code: 'SIA-SRN-20C', required: true }
        ],
        section: 'SINA TSC Logistics',
        subsection: 'Storekeeper School',
        sectionId: 'section2',
        subsectionId: 'subsection1',
        completed: false,
        available: false,
        level: 'W'
      },
      {
        id: '4',
        name: 'Intro to Leadership',
        code: 'GPU-ALC-0010',
        prerequisites: [
          {
            type: 'alternative_group',
            description: 'SIA-RMN-0005 or GPU-ALC-09',
            required: true,
            alternativePrerequisites: [
              { type: 'course', code: 'SIA-RMN-0005', required: true },
              { type: 'course', code: 'GPU-ALC-09', required: true }
            ]
          }
        ],
        section: 'GPU Advanced Leadership College',
        subsection: '',
        sectionId: 'section3',
        subsectionId: '',
        completed: false,
        available: false,
        level: 'A'
      },
      {
        id: '5',
        name: 'Advanced Management',
        code: 'GPU-ALC-0113',
        prerequisites: [
          {
            type: 'alternative_group',
            description: 'SIA-RMN-0103 or GPU-ALC-10',
            required: true,
            alternativePrerequisites: [
              { type: 'course', code: 'SIA-RMN-0103', required: true },
              { type: 'course', code: 'GPU-ALC-10', required: true }
            ]
          }
        ],
        section: 'GPU Advanced Leadership College',
        subsection: '',
        sectionId: 'section3',
        subsectionId: '',
        completed: false,
        available: false,
        level: 'C'
      }
    ]

    emptyProgress = {
      userId: 'test-user',
      completedCourses: new Set(),
      availableCourses: new Set(),
      specialRulesProgress: new Map(),
      lastUpdated: new Date()
    }

    // Create ParsedCourseData structure
    const courseMap = new Map(sampleCourses.map((course) => [course.code, course]))
    const categories: Category[] = []
    const categoryMap = new Map<string, Category>()
    const dependencyGraph = new Map<string, string[]>()

    sampleCourseData = {
      courses: sampleCourses,
      categories,
      specialRules: [],
      courseMap,
      categoryMap,
      dependencyGraph
    }

    eligibilityEngine = new EligibilityEngine(sampleCourseData)
  })

  describe('basic eligibility', () => {
    it('should identify courses with no prerequisites as available', () => {
      const result = eligibilityEngine.checkCourseEligibility('SIA-RMN-0001', emptyProgress)

      expect(result.eligible).toBe(true)
      expect(result.missingPrerequisites).toHaveLength(0)
    })

    it('should identify courses with unmet prerequisites as unavailable', () => {
      const result = eligibilityEngine.checkCourseEligibility('SIA-RMN-0004', emptyProgress)

      expect(result.eligible).toBe(false)
      expect(result.missingPrerequisites).toHaveLength(3)
      expect(result.missingPrerequisites[0].missing).toContain('SIA-RMN-0001')
      expect(result.missingPrerequisites[1].missing).toContain('SIA-RMN-0002')
      expect(result.missingPrerequisites[2].missing).toContain('SIA-RMN-0003')
    })
  })

  describe('warrant courses', () => {
    it('should handle warrant courses correctly', () => {
      const result = eligibilityEngine.checkCourseEligibility('SIA-SRN-20W', emptyProgress)

      expect(result.eligible).toBe(false)
      expect(result.missingPrerequisites).toHaveLength(2)
      expect(result.missingPrerequisites[0].missing).toContain('SIA-RMN-0011')
      expect(result.missingPrerequisites[1].missing).toContain('SIA-SRN-20C')
    })

    it('should allow warrant courses when prerequisites are met', () => {
      const progressWithWarrantPrereqs: UserProgress = {
        userId: 'test-user',
        completedCourses: new Set(['SIA-RMN-0011', 'SIA-SRN-20C']),
        availableCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      const result = eligibilityEngine.checkCourseEligibility('SIA-SRN-20W', progressWithWarrantPrereqs)

      expect(result.eligible).toBe(true)
      expect(result.missingPrerequisites).toHaveLength(0)
    })
  })

  describe('alternative prerequisites (OR conditions)', () => {
    it('should allow course when first alternative is met', () => {
      const progressWithFirstAlternative: UserProgress = {
        userId: 'test-user',
        completedCourses: new Set(['SIA-RMN-0005']),
        availableCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      const result = eligibilityEngine.checkCourseEligibility('GPU-ALC-0010', progressWithFirstAlternative)

      expect(result.eligible).toBe(true)
      expect(result.missingPrerequisites).toHaveLength(0)
    })

    it('should block course when no alternatives are met', () => {
      const result = eligibilityEngine.checkCourseEligibility('GPU-ALC-0010', emptyProgress)

      expect(result.eligible).toBe(false)
      expect(result.missingPrerequisites).toHaveLength(1)
      expect(result.missingPrerequisites[0].description).toContain('SIA-RMN-0005 or GPU-ALC-09')
    })
  })

  describe('edge cases', () => {
    it('should handle non-existent course codes gracefully', () => {
      const result = eligibilityEngine.checkCourseEligibility('NON-EXISTENT-001', emptyProgress)

      expect(result.eligible).toBe(false)
      expect(result.reason).toBe('Course not found')
    })
  })
})
