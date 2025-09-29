import { ParsedCourseData, UserProgress } from '../types'
import { EligibilityEngine } from './eligibilityEngine'
import { CourseAliasManager } from './courseAliasUtils'

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
        courseAliases: CourseAliasManager.createIntroductoryAliases()
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
})
