import { CourseAliasManager } from './courseAliasUtils'

describe('CourseAliasManager', () => {
  describe('Introductory course aliases', () => {
    let aliasManager: CourseAliasManager

    beforeEach(() => {
      // Create a mock course data with aliases
      const mockCourseData = {
        courseAliases: CourseAliasManager.createIntroductoryAliases()
      }
      aliasManager = new CourseAliasManager(mockCourseData)
    })

    it('should resolve GPU-TRMN-0003 to INTRO-TRMN-0003', () => {
      const resolved = aliasManager.resolveCourseCode('GPU-TRMN-0003')
      expect(resolved).toBe('INTRO-TRMN-0003')
    })

    it('should resolve SIA-RMN-0003 to INTRO-TRMN-0003', () => {
      const resolved = aliasManager.resolveCourseCode('SIA-RMN-0003')
      expect(resolved).toBe('INTRO-TRMN-0003')
    })

    it('should recognize GPU-TRMN-0003 as an alias', () => {
      expect(aliasManager.isAlias('GPU-TRMN-0003')).toBe(true)
      expect(aliasManager.isAlias('SIA-RMN-0003')).toBe(true)
    })

    it('should recognize INTRO-TRMN-0003 as primary', () => {
      expect(aliasManager.isPrimary('INTRO-TRMN-0003')).toBe(true)
    })

    it('should expand INTRO-TRMN-0003 to include all aliases', () => {
      const expanded = aliasManager.expandCourseCodes('INTRO-TRMN-0003')
      expect(expanded).toContain('INTRO-TRMN-0003')
      expect(expanded).toContain('GPU-TRMN-0003')
      expect(expanded).toContain('SIA-RMN-0003')
    })

    it('should satisfy requirement when GPU-TRMN-0003 is completed for INTRO-TRMN-0003 requirement', () => {
      const satisfies = aliasManager.satisfiesRequirement('GPU-TRMN-0003', 'INTRO-TRMN-0003')
      expect(satisfies).toBe(true)
    })

    it('should satisfy requirement when INTRO-TRMN-0003 is completed for GPU-TRMN-0003 requirement', () => {
      const satisfies = aliasManager.satisfiesRequirement('INTRO-TRMN-0003', 'GPU-TRMN-0003')
      expect(satisfies).toBe(true)
    })

    it('should get all satisfied courses for GPU-TRMN-0003', () => {
      const satisfied = aliasManager.getSatisfiedCourses('GPU-TRMN-0003')
      expect(satisfied).toContain('INTRO-TRMN-0003')
      expect(satisfied).toContain('GPU-TRMN-0003')
      expect(satisfied).toContain('SIA-RMN-0003')
    })
  })
})
