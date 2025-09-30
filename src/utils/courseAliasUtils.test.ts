import { CourseAliasManager } from './courseAliasUtils'

describe('CourseAliasManager', () => {
  describe('Introductory course aliases', () => {
    let aliasManager: CourseAliasManager

    beforeEach(() => {
      // Create a mock course data with aliases from parsed markdown data
      const mockCourseData = {
        courses: [],
        categories: [],
        specialRules: [],
        departmentMappings: new Map(),
        seriesMappings: new Map(),
        courseMap: new Map(),
        categoryMap: new Map(),
        dependencyGraph: new Map(),
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
        ],
        aliasMap: new Map()
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
