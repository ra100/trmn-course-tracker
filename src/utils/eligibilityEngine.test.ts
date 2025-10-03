import { ParsedCourseData, UserProgress } from '../types'
import { EligibilityEngine } from './eligibilityEngine'

describe('EligibilityEngine', () => {
  describe('course alias resolution', () => {
    let mockCourseData: ParsedCourseData
    let eligibilityEngine: EligibilityEngine

    beforeEach(() => {
      // Create mock course data with aliases
      mockCourseData = {
        courses: [
          {
            id: '1',
            name: 'INTRO-TRMN-0001',
            code: 'INTRO-TRMN-0001',
            prerequisites: [],
            section: 'Test',
            subsection: 'Test',
            sectionId: 'test',
            subsectionId: 'test',
            completed: false,
            available: true
          },
          {
            id: '2',
            name: 'Course requiring INTRO-TRMN-0003',
            code: 'TEST-001',
            prerequisites: [
              {
                type: 'course',
                code: 'INTRO-TRMN-0003',
                required: true
              }
            ],
            section: 'Test',
            subsection: 'Test',
            sectionId: 'test',
            subsectionId: 'test',
            completed: false,
            available: false
          }
        ],
        categories: [],
        specialRules: [],
        courseMap: new Map(),
        categoryMap: new Map(),
        dependencyGraph: new Map(),
        seriesMappings: new Map(),
        courseAliases: [
          {
            primaryCode: 'INTRO-TRMN-0001',
            alternativeCodes: ['GPU-TRMN-0001', 'SIA-RMN-0001'],
            description: 'Introductory course equivalent - Basic Enlistment',
            active: true
          },
          {
            primaryCode: 'INTRO-TRMN-0002',
            alternativeCodes: ['GPU-TRMN-0002', 'SIA-RMN-0002'],
            description: 'Introductory course equivalent - Basic Non-Commissioned Officer',
            active: true
          },
          {
            primaryCode: 'INTRO-TRMN-0003',
            alternativeCodes: ['GPU-TRMN-0003', 'SIA-RMN-0003'],
            description: 'Introductory course equivalent - Advanced Non-Commissioned Officer',
            active: true
          }
        ]
      }

      // Populate course map
      mockCourseData.courses.forEach((course) => {
        mockCourseData.courseMap.set(course.code, course)
      })

      eligibilityEngine = new EligibilityEngine(mockCourseData)
    })

    it('should make course available when GPU-TRMN-0003 is completed', () => {
      const userProgress: UserProgress = {
        userId: 'test-user',
        completedCourses: new Set(['GPU-TRMN-0003']),
        availableCourses: new Set(),
        inProgressCourses: new Set(),
        waitingGradeCourses: new Set(),
        courseStatusTimestamps: new Map(),
        courseCompletionDates: new Map(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      const result = eligibilityEngine.checkCourseEligibility('TEST-001', userProgress)
      expect(result.eligible).toBe(true)
      expect(result.missingPrerequisites).toHaveLength(0)
    })

    it('should make course available when SIA-RMN-0003 is completed', () => {
      const userProgress: UserProgress = {
        userId: 'test-user',
        completedCourses: new Set(['SIA-RMN-0003']),
        availableCourses: new Set(),
        inProgressCourses: new Set(),
        waitingGradeCourses: new Set(),
        courseStatusTimestamps: new Map(),
        courseCompletionDates: new Map(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      const result = eligibilityEngine.checkCourseEligibility('TEST-001', userProgress)
      expect(result.eligible).toBe(true)
      expect(result.missingPrerequisites).toHaveLength(0)
    })

    it('should not make course available when different course is completed', () => {
      const userProgress: UserProgress = {
        userId: 'test-user',
        completedCourses: new Set(['SOME-OTHER-COURSE']),
        availableCourses: new Set(),
        inProgressCourses: new Set(),
        waitingGradeCourses: new Set(),
        courseStatusTimestamps: new Map(),
        courseCompletionDates: new Map(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      const result = eligibilityEngine.checkCourseEligibility('TEST-001', userProgress)
      expect(result.eligible).toBe(false)
      expect(result.missingPrerequisites).toHaveLength(1)
    })
  })

  describe('getCoursesUnlockedBy alias consideration', () => {
    let mockCourseData: ParsedCourseData
    let eligibilityEngine: EligibilityEngine

    beforeEach(() => {
      // Create mock course data with aliases and unlocked courses
      mockCourseData = {
        courses: [
          {
            id: '1',
            name: 'GPU-TRMN-0003',
            code: 'GPU-TRMN-0003',
            prerequisites: [],
            section: 'GPU',
            subsection: 'TRMN',
            sectionId: 'gpu',
            subsectionId: 'trmn',
            completed: false,
            available: true,
            institution: 'GPU',
            isIntroductory: true,
            aliases: ['INTRO-TRMN-0003', 'SIA-RMN-0003']
          },
          {
            id: '2',
            name: 'RMACA-RMACS-02A',
            code: 'RMACA-RMACS-02A',
            prerequisites: [
              {
                type: 'course',
                code: 'INTRO-TRMN-0003',
                required: true
              }
            ],
            section: 'RMACA',
            subsection: 'RMACS',
            sectionId: 'rmaca',
            subsectionId: 'rmacs',
            completed: false,
            available: false,
            institution: 'RMACA'
          },
          {
            id: '3',
            name: 'SIA-SRN-30A',
            code: 'SIA-SRN-30A',
            prerequisites: [
              {
                type: 'course',
                code: 'INTRO-TRMN-0003',
                required: true
              }
            ],
            section: 'SIA',
            subsection: 'SRN',
            sectionId: 'sia',
            subsectionId: 'srn',
            completed: false,
            available: false,
            institution: 'SIA'
          },
          {
            id: '4',
            name: 'Alternative Course',
            code: 'ALT-001',
            prerequisites: [
              {
                type: 'alternative_group' as const,
                alternativePrerequisites: [
                  {
                    type: 'course' as const,
                    code: 'INTRO-TRMN-0003',
                    required: true
                  }
                ],
                required: true
              }
            ],
            section: 'Alternative',
            subsection: 'Test',
            sectionId: 'alt',
            subsectionId: 'test',
            completed: false,
            available: false,
            institution: 'Test'
          }
        ],
        categories: [],
        specialRules: [],
        courseMap: new Map(),
        categoryMap: new Map(),
        dependencyGraph: new Map(),
        seriesMappings: new Map(),
        courseAliases: [
          {
            primaryCode: 'INTRO-TRMN-0003',
            alternativeCodes: ['GPU-TRMN-0003', 'SIA-RMN-0003'],
            description: 'Introductory course equivalent - Advanced Non-Commissioned Officer',
            active: true
          }
        ]
      }

      // Populate course map
      mockCourseData.courses.forEach((course) => {
        mockCourseData.courseMap.set(course.code, course)
      })

      eligibilityEngine = new EligibilityEngine(mockCourseData)
    })

    it('should find courses unlocked by GPU-TRMN-0003 (alias of INTRO-TRMN-0003)', () => {
      const unlockedCourses = eligibilityEngine.getCoursesUnlockedBy('GPU-TRMN-0003')

      expect(unlockedCourses).toHaveLength(3) // RMACA-RMACS-02A, SIA-SRN-30A, ALT-001
      expect(unlockedCourses.map((c) => c.code)).toContain('RMACA-RMACS-02A')
      expect(unlockedCourses.map((c) => c.code)).toContain('SIA-SRN-30A')
      expect(unlockedCourses.map((c) => c.code)).toContain('ALT-001')
    })

    it('should find courses unlocked by SIA-RMN-0003 (alias of INTRO-TRMN-0003)', () => {
      const unlockedCourses = eligibilityEngine.getCoursesUnlockedBy('SIA-RMN-0003')

      expect(unlockedCourses).toHaveLength(3) // RMACA-RMACS-02A, SIA-SRN-30A, ALT-001
      expect(unlockedCourses.map((c) => c.code)).toContain('RMACA-RMACS-02A')
      expect(unlockedCourses.map((c) => c.code)).toContain('SIA-SRN-30A')
      expect(unlockedCourses.map((c) => c.code)).toContain('ALT-001')
    })

    it('should find courses unlocked by primary course INTRO-TRMN-0003', () => {
      const unlockedCourses = eligibilityEngine.getCoursesUnlockedBy('INTRO-TRMN-0003')

      expect(unlockedCourses).toHaveLength(3) // RMACA-RMACS-02A, SIA-SRN-30A, ALT-001
      expect(unlockedCourses.map((c) => c.code)).toContain('RMACA-RMACS-02A')
      expect(unlockedCourses.map((c) => c.code)).toContain('SIA-SRN-30A')
      expect(unlockedCourses.map((c) => c.code)).toContain('ALT-001')
    })

    it('should return empty array for course that unlocks nothing', () => {
      const unlockedCourses = eligibilityEngine.getCoursesUnlockedBy('RMACA-RMACS-02A')
      expect(unlockedCourses).toHaveLength(0)
    })

    it('should not find courses unlocked by non-existent course', () => {
      const unlockedCourses = eligibilityEngine.getCoursesUnlockedBy('NON-EXISTENT-001')
      expect(unlockedCourses).toHaveLength(0)
    })

    it('should handle courses with no prerequisites', () => {
      const unlockedCourses = eligibilityEngine.getCoursesUnlockedBy('GPU-TRMN-0003')
      expect(unlockedCourses).toHaveLength(3)
    })

    it('should handle alternative prerequisites correctly', () => {
      // Test that alternative prerequisites are also considered
      const altPrereqCourse = {
        id: '5',
        name: 'Course with alternative prereq',
        code: 'ALT-PREREQ-001',
        prerequisites: [
          {
            type: 'alternative_group' as const,
            alternativePrerequisites: [
              {
                type: 'course' as const,
                code: 'INTRO-TRMN-0003',
                required: true
              },
              {
                type: 'course' as const,
                code: 'OTHER-COURSE',
                required: true
              }
            ],
            required: true
          }
        ],
        section: 'Test',
        subsection: 'Test',
        sectionId: 'test',
        subsectionId: 'test',
        completed: false,
        available: false,
        institution: 'Test'
      }

      mockCourseData.courses.push(altPrereqCourse)
      mockCourseData.courseMap.set(altPrereqCourse.code, altPrereqCourse)

      const unlockedCourses = eligibilityEngine.getCoursesUnlockedBy('GPU-TRMN-0003')
      expect(unlockedCourses.map((c) => c.code)).toContain('ALT-PREREQ-001')
    })
  })
})
