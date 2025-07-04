import { describe, it, expect, beforeEach } from 'vitest'
import { EligibilityEngine } from './eligibilityEngine'
import { Course, UserProgress, ParsedCourseData, Category, SpecialRule } from '../types'

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
      },
      {
        id: '6',
        name: 'Department Choice Course',
        code: 'DEPT-001',
        prerequisites: [
          {
            type: 'department_choice',
            description: '2 A level courses from Tactical or Engineering',
            required: true,
            minimum: 2,
            level: 'A',
            departments: ['Tactical', 'Engineering']
          }
        ],
        section: 'Department Choice Test',
        subsection: '',
        sectionId: 'section4',
        subsectionId: '',
        completed: false,
        available: false,
        level: 'C'
      },
      {
        id: '7',
        name: 'Complex Course',
        code: 'COMPLEX-001',
        prerequisites: [
          {
            type: 'complex',
            description: 'Complex requirement description',
            required: true
          }
        ],
        section: 'Complex Section',
        subsection: '',
        sectionId: 'section5',
        subsectionId: '',
        completed: false,
        available: false,
        level: 'A'
      },
      {
        id: '8',
        name: 'Tactical Course A1',
        code: 'TAC-A1',
        prerequisites: [],
        section: 'SINA TSC Tactical',
        subsection: 'Tactical',
        sectionId: 'section6',
        subsectionId: 'subsection2',
        completed: false,
        available: true,
        level: 'A'
      },
      {
        id: '9',
        name: 'Engineering Course A1',
        code: 'ENG-A1',
        prerequisites: [],
        section: 'SINA TSC Engineering',
        subsection: 'Engineering',
        sectionId: 'section7',
        subsectionId: 'subsection3',
        completed: false,
        available: true,
        level: 'A'
      }
    ]

    emptyProgress = {
      userId: 'test-user',
      completedCourses: new Set(),
      availableCourses: new Set(),
      inProgressCourses: new Set(),
      waitingGradeCourses: new Set(),
      specialRulesProgress: new Map(),
      lastUpdated: new Date()
    }

    // Create ParsedCourseData structure
    const courseMap = new Map(sampleCourses.map((course) => [course.code, course]))
    const categories: Category[] = []
    const categoryMap = new Map<string, Category>()
    const dependencyGraph = new Map<string, string[]>()

    const specialRules: SpecialRule[] = [
      {
        id: 'OSWP-RMN',
        type: 'OSWP',
        name: 'Officer Space Warfare Pin',
        description: 'Officer Space Warfare Pin requirements',
        requirements: [
          { type: 'course', code: 'SIA-RMN-0101', required: true },
          { type: 'course', code: 'GPU-ALC-0010', required: true }
        ],
        branch: 'RMN'
      }
    ]

    sampleCourseData = {
      courses: sampleCourses,
      categories,
      specialRules,
      courseMap,
      categoryMap,
      dependencyGraph,
      seriesMappings: new Map()
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
        inProgressCourses: new Set(),
        waitingGradeCourses: new Set(),
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
        inProgressCourses: new Set(),
        waitingGradeCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      const result = eligibilityEngine.checkCourseEligibility('GPU-ALC-0010', progressWithFirstAlternative)

      expect(result.eligible).toBe(true)
      expect(result.missingPrerequisites).toHaveLength(0)
    })

    it('should allow course when second alternative is met', () => {
      const progressWithSecondAlternative: UserProgress = {
        userId: 'test-user',
        completedCourses: new Set(['GPU-ALC-09']),
        availableCourses: new Set(),
        inProgressCourses: new Set(),
        waitingGradeCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      const result = eligibilityEngine.checkCourseEligibility('GPU-ALC-0010', progressWithSecondAlternative)

      expect(result.eligible).toBe(true)
      expect(result.missingPrerequisites).toHaveLength(0)
    })

    it('should block course when no alternatives are met', () => {
      const result = eligibilityEngine.checkCourseEligibility('GPU-ALC-0010', emptyProgress)

      expect(result.eligible).toBe(false)
      expect(result.missingPrerequisites).toHaveLength(1)
      expect(result.missingPrerequisites[0].description).toContain('SIA-RMN-0005 or GPU-ALC-09')
    })

    it('should handle alternative prerequisites with empty array', () => {
      const courseWithEmptyAlternatives: Course = {
        id: 'test',
        name: 'Test Course',
        code: 'TEST-001',
        prerequisites: [
          {
            type: 'alternative_group',
            description: 'Empty alternatives test',
            required: true,
            alternativePrerequisites: []
          }
        ],
        section: 'Test',
        subsection: '',
        sectionId: 'test',
        subsectionId: '',
        completed: false,
        available: false,
        level: 'A'
      }

      // Add the test course to our data
      sampleCourseData.courses.push(courseWithEmptyAlternatives)
      sampleCourseData.courseMap.set('TEST-001', courseWithEmptyAlternatives)

      const result = eligibilityEngine.checkCourseEligibility('TEST-001', emptyProgress)

      expect(result.eligible).toBe(false)
      expect(result.missingPrerequisites).toHaveLength(1)
      expect(result.missingPrerequisites[0].description).toBe('Empty alternatives test')
    })
  })

  describe('department choice prerequisites', () => {
    it('should handle department choice prerequisites correctly', () => {
      const result = eligibilityEngine.checkCourseEligibility('DEPT-001', emptyProgress)

      expect(result.eligible).toBe(false)
      expect(result.missingPrerequisites).toHaveLength(1)
      expect(result.missingPrerequisites[0].type).toBe('department_choice')
    })

    it('should satisfy department choice when requirements are met', () => {
      const progressWithDeptCourses: UserProgress = {
        userId: 'test-user',
        completedCourses: new Set(['TAC-A1', 'ENG-A1']),
        availableCourses: new Set(),
        inProgressCourses: new Set(),
        waitingGradeCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      const result = eligibilityEngine.checkCourseEligibility('DEPT-001', progressWithDeptCourses)

      expect(result.eligible).toBe(true)
      expect(result.missingPrerequisites).toHaveLength(0)
    })

    it('should handle department choice with missing minimum field', () => {
      const courseWithInvalidDept: Course = {
        id: 'invalid-dept',
        name: 'Invalid Dept Course',
        code: 'INVALID-DEPT-001',
        prerequisites: [
          {
            type: 'department_choice',
            description: 'Invalid department requirement',
            required: true,
            departments: ['Tactical']
            // missing minimum field
          }
        ],
        section: 'Test',
        subsection: '',
        sectionId: 'test',
        subsectionId: '',
        completed: false,
        available: false,
        level: 'A'
      }

      sampleCourseData.courses.push(courseWithInvalidDept)
      sampleCourseData.courseMap.set('INVALID-DEPT-001', courseWithInvalidDept)

      const result = eligibilityEngine.checkCourseEligibility('INVALID-DEPT-001', emptyProgress)

      expect(result.eligible).toBe(false)
      expect(result.missingPrerequisites).toHaveLength(1)
    })
  })

  describe('complex prerequisites', () => {
    it('should handle complex prerequisites', () => {
      const result = eligibilityEngine.checkCourseEligibility('COMPLEX-001', emptyProgress)

      expect(result.eligible).toBe(false)
      expect(result.missingPrerequisites).toHaveLength(1)
      expect(result.missingPrerequisites[0].type).toBe('complex')
      expect(result.missingPrerequisites[0].description).toBe('Complex requirement description')
    })
  })

  describe('prerequisite validation edge cases', () => {
    it('should handle prerequisites without code field', () => {
      const courseWithoutCode: Course = {
        id: 'no-code',
        name: 'No Code Course',
        code: 'NO-CODE-001',
        prerequisites: [
          {
            type: 'course',
            required: true
            // missing code field
          }
        ],
        section: 'Test',
        subsection: '',
        sectionId: 'test',
        subsectionId: '',
        completed: false,
        available: false,
        level: 'A'
      }

      sampleCourseData.courses.push(courseWithoutCode)
      sampleCourseData.courseMap.set('NO-CODE-001', courseWithoutCode)

      const result = eligibilityEngine.checkCourseEligibility('NO-CODE-001', emptyProgress)

      expect(result.eligible).toBe(true) // Should pass validation when no code is provided
      expect(result.missingPrerequisites).toHaveLength(0)
    })

    it('should handle unknown prerequisite types', () => {
      const courseWithUnknownType: Course = {
        id: 'unknown-type',
        name: 'Unknown Type Course',
        code: 'UNKNOWN-001',
        prerequisites: [
          {
            type: 'unknown_type' as any,
            required: true,
            description: 'Unknown prerequisite type'
          }
        ],
        section: 'Test',
        subsection: '',
        sectionId: 'test',
        subsectionId: '',
        completed: false,
        available: false,
        level: 'A'
      }

      sampleCourseData.courses.push(courseWithUnknownType)
      sampleCourseData.courseMap.set('UNKNOWN-001', courseWithUnknownType)

      const result = eligibilityEngine.checkCourseEligibility('UNKNOWN-001', emptyProgress)

      expect(result.eligible).toBe(true) // Should pass when unknown type returns null
      expect(result.missingPrerequisites).toHaveLength(0)
    })
  })

  describe('course availability updates', () => {
    it('should update course availability correctly', () => {
      const progressWithSomeCourses: UserProgress = {
        userId: 'test-user',
        completedCourses: new Set(['SIA-RMN-0001']),
        availableCourses: new Set(),
        inProgressCourses: new Set(),
        waitingGradeCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      const updatedCourses = eligibilityEngine.updateCourseAvailability(progressWithSomeCourses)

      const basicCourse = updatedCourses.find((c) => c.code === 'SIA-RMN-0001')
      expect(basicCourse?.completed).toBe(true)
      expect(basicCourse?.available).toBe(false) // completed courses are not available

      const unavailableCourse = updatedCourses.find((c) => c.code === 'SIA-RMN-0004')
      expect(unavailableCourse?.completed).toBe(false)
      expect(unavailableCourse?.available).toBe(false) // still missing prerequisites
    })
  })

  describe('special rule eligibility', () => {
    it('should check special rule eligibility', () => {
      const progressWithSpecialRulePrereqs: UserProgress = {
        userId: 'test-user',
        completedCourses: new Set(['SIA-RMN-0101', 'GPU-ALC-0010']),
        availableCourses: new Set(),
        inProgressCourses: new Set(),
        waitingGradeCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      const rule = sampleCourseData.specialRules[0]
      const eligible = eligibilityEngine.checkSpecialRuleEligibility(rule, progressWithSpecialRulePrereqs)

      expect(eligible).toBe(true)
    })

    it('should reject special rule when requirements not met', () => {
      const rule = sampleCourseData.specialRules[0]
      const eligible = eligibilityEngine.checkSpecialRuleEligibility(rule, emptyProgress)

      expect(eligible).toBe(false)
    })
  })

  describe('utility methods', () => {
    it('should get available courses', () => {
      const availableCourses = eligibilityEngine.getAvailableCourses(emptyProgress)

      // Should include courses with no prerequisites
      const availableCodes = availableCourses.map((c) => c.code)
      expect(availableCodes).toContain('SIA-RMN-0001')
      expect(availableCodes).toContain('TAC-A1')
      expect(availableCodes).toContain('ENG-A1')
    })

    it('should get completed courses', () => {
      const progressWithCompletedCourses: UserProgress = {
        userId: 'test-user',
        completedCourses: new Set(['SIA-RMN-0001', 'TAC-A1']),
        availableCourses: new Set(),
        inProgressCourses: new Set(),
        waitingGradeCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      const completedCourses = eligibilityEngine.getCompletedCourses(progressWithCompletedCourses)

      expect(completedCourses).toHaveLength(2)
      expect(completedCourses.map((c) => c.code)).toContain('SIA-RMN-0001')
      expect(completedCourses.map((c) => c.code)).toContain('TAC-A1')
    })

    it('should get course by code', () => {
      const course = eligibilityEngine.getCourseByCode('SIA-RMN-0001')

      expect(course).toBeDefined()
      expect(course?.name).toBe('Basic Enlistment Course')
    })

    it('should return undefined for non-existent course code', () => {
      const course = eligibilityEngine.getCourseByCode('NON-EXISTENT')

      expect(course).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('should handle non-existent course codes gracefully', () => {
      const result = eligibilityEngine.checkCourseEligibility('NON-EXISTENT-001', emptyProgress)

      expect(result.eligible).toBe(false)
      expect(result.reason).toBe('Course not found')
    })

    it('should handle course with no level in department counting', () => {
      const courseWithoutLevel: Course = {
        id: 'no-level',
        name: 'No Level Course',
        code: 'NO-LEVEL-001',
        prerequisites: [],
        section: 'SINA TSC Tactical',
        subsection: 'Tactical',
        sectionId: 'test',
        subsectionId: 'test',
        completed: false,
        available: true
        // missing level field
      }

      sampleCourseData.courses.push(courseWithoutLevel)
      sampleCourseData.courseMap.set('NO-LEVEL-001', courseWithoutLevel)

      const progressWithNoLevelCourse: UserProgress = {
        userId: 'test-user',
        completedCourses: new Set(['NO-LEVEL-001']),
        availableCourses: new Set(),
        inProgressCourses: new Set(),
        waitingGradeCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      // Should not count towards department requirements when level doesn't match
      const result = eligibilityEngine.checkCourseEligibility('DEPT-001', progressWithNoLevelCourse)
      expect(result.eligible).toBe(false) // Still needs A level courses
    })
  })
})
