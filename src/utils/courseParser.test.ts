import { describe, it, expect, beforeEach } from 'vitest'
import { CourseParser, parseCourseData } from './courseParser'
import { UserProgress } from '../types'
import { EligibilityEngine } from './eligibilityEngine'

describe('CourseParser', () => {
  describe('basic course parsing', () => {
    it('should parse regular courses correctly', () => {
      const markdown = `
## Test Section

| Course Name               | Course Number | Prerequisites     |
| ------------------------- | ------------- | ----------------- |
| Basic Course              | SIA-RMN-0001  |                   |
| Advanced Course           | SIA-RMN-0002  | SIA-RMN-0001      |
`

      const parser = new CourseParser(markdown)
      const result = parser.parse()

      expect(result.courses).toHaveLength(2)

      const basicCourse = result.courses.find((c) => c.code === 'SIA-RMN-0001')
      expect(basicCourse).toBeDefined()
      expect(basicCourse?.name).toBe('Basic Course')
      expect(basicCourse?.prerequisites).toHaveLength(0)

      const advancedCourse = result.courses.find((c) => c.code === 'SIA-RMN-0002')
      expect(advancedCourse).toBeDefined()
      expect(advancedCourse?.name).toBe('Advanced Course')
      expect(advancedCourse?.prerequisites).toHaveLength(1)
      expect(advancedCourse?.prerequisites[0].code).toBe('SIA-RMN-0001')
    })
  })

  describe('warrant courses with "Project" suffix', () => {
    it('should extract clean course codes from warrant project courses', () => {
      const markdown = `
## SINA TSC Logistics

### Storekeeper School

| Course Name                     | Course Number       | Prerequisites     |
| ------------------------------- | ------------------- | ----------------- |
| Storekeeper Specialist          | SIA-SRN-20A         | SIA-RMN-0001      |
| Storekeeper Advanced Specialist | SIA-SRN-20C         | SIA-RMN-0002      |
| Storekeeper Warrant Project     | SIA-SRN-20W Project | SIA-RMN-0011      |
| Disbursing Clerk Warrant Project| SIA-SRN-21W Project | SIA-RMN-0011      |
| Normal Warrant Course           | SIA-SRN-22W         | SIA-RMN-0011      |
`

      const parser = new CourseParser(markdown)
      const result = parser.parse()

      expect(result.courses).toHaveLength(5)

      // Check that warrant project courses have clean course codes
      const storekeeperWarrant = result.courses.find((c) => c.name === 'Storekeeper Warrant Project')
      expect(storekeeperWarrant).toBeDefined()
      expect(storekeeperWarrant?.code).toBe('SIA-SRN-20W')

      const disbursingWarrant = result.courses.find((c) => c.name === 'Disbursing Clerk Warrant Project')
      expect(disbursingWarrant).toBeDefined()
      expect(disbursingWarrant?.code).toBe('SIA-SRN-21W')

      const normalWarrant = result.courses.find((c) => c.name === 'Normal Warrant Course')
      expect(normalWarrant).toBeDefined()
      expect(normalWarrant?.code).toBe('SIA-SRN-22W')

      // Verify courses can be found by their clean codes
      const courseMap = new Map(result.courses.map((course) => [course.code, course]))
      expect(courseMap.has('SIA-SRN-20W')).toBe(true)
      expect(courseMap.has('SIA-SRN-21W')).toBe(true)
      expect(courseMap.has('SIA-SRN-22W')).toBe(true)

      // Verify that the dirty codes are not used
      expect(courseMap.has('SIA-SRN-20W Project')).toBe(false)
      expect(courseMap.has('SIA-SRN-21W Project')).toBe(false)
    })
  })

  describe('alternative prerequisites (OR conditions)', () => {
    it('should parse OR prerequisites correctly', () => {
      const markdown = `
## GPU Advanced Leadership College

| Course Name               | Course Number | Prerequisites                |
| ------------------------- | ------------- | ---------------------------- |
| Intro to Leadership       | GPU-ALC-0010  | SIA-RMN-0005 or GPU-ALC-09   |
| Advanced Management       | GPU-ALC-0113  | SIA-RMN-0103 or GPU-ALC-10   |
| Advanced Leadership       | GPU-ALC-0115  | SIA-RMN-0105 or GPU-ALC-0113 |
`

      const parser = new CourseParser(markdown)
      const result = parser.parse()

      expect(result.courses).toHaveLength(3)

      const introLeadership = result.courses.find((c) => c.code === 'GPU-ALC-0010')
      expect(introLeadership).toBeDefined()
      expect(introLeadership?.prerequisites).toHaveLength(1)
      expect(introLeadership?.prerequisites[0].type).toBe('alternative_group')
      expect(introLeadership?.prerequisites[0].alternativePrerequisites).toHaveLength(2)
      expect(introLeadership?.prerequisites[0].alternativePrerequisites?.[0].code).toBe('SIA-RMN-0005')
      expect(introLeadership?.prerequisites[0].alternativePrerequisites?.[1].code).toBe('GPU-ALC-09')

      const advancedManagement = result.courses.find((c) => c.code === 'GPU-ALC-0113')
      expect(advancedManagement).toBeDefined()
      expect(advancedManagement?.prerequisites).toHaveLength(1)
      expect(advancedManagement?.prerequisites[0].type).toBe('alternative_group')
      expect(advancedManagement?.prerequisites[0].alternativePrerequisites).toHaveLength(2)
      expect(advancedManagement?.prerequisites[0].alternativePrerequisites?.[0].code).toBe('SIA-RMN-0103')
      expect(advancedManagement?.prerequisites[0].alternativePrerequisites?.[1].code).toBe('GPU-ALC-10')
    })

    it('should handle mixed prerequisites (regular and OR)', () => {
      const markdown = `
## Test Section

| Course Name     | Course Number | Prerequisites                      |
| --------------- | ------------- | ---------------------------------- |
| Complex Course  | TEST-001      | SIA-RMN-0001 SIA-RMN-0002 or TEST-003 |
`

      const parser = new CourseParser(markdown)
      const result = parser.parse()

      const complexCourse = result.courses.find((c) => c.code === 'TEST-001')
      expect(complexCourse).toBeDefined()
      expect(complexCourse?.prerequisites).toHaveLength(1)
      expect(complexCourse?.prerequisites[0].type).toBe('alternative_group')
    })
  })

  describe('course level extraction', () => {
    it('should extract course levels correctly', () => {
      const markdown = `
## Test Section

| Course Name               | Course Number | Prerequisites |
| ------------------------- | ------------- | ------------- |
| Level A Course            | SIA-RMN-001A  |               |
| Level C Course            | SIA-RMN-002C  |               |
| Level D Course            | SIA-RMN-003D  |               |
| Level W Course            | SIA-RMN-004W  |               |
| Numbered Course           | SIA-RMN-0101  |               |
`

      const parser = new CourseParser(markdown)
      const result = parser.parse()

      const levelACourse = result.courses.find((c) => c.code === 'SIA-RMN-001A')
      expect(levelACourse?.level).toBe('A')

      const levelCCourse = result.courses.find((c) => c.code === 'SIA-RMN-002C')
      expect(levelCCourse?.level).toBe('C')

      const levelDCourse = result.courses.find((c) => c.code === 'SIA-RMN-003D')
      expect(levelDCourse?.level).toBe('D')

      const levelWCourse = result.courses.find((c) => c.code === 'SIA-RMN-004W')
      expect(levelWCourse?.level).toBe('W')

      const numberedCourse = result.courses.find((c) => c.code === 'SIA-RMN-0101')
      expect(numberedCourse?.level).toBe(undefined)
    })
  })

  describe('section and subsection parsing', () => {
    it('should parse sections and subsections correctly', () => {
      const markdown = `
## Main Section

### Subsection One

| Course Name     | Course Number | Prerequisites |
| --------------- | ------------- | ------------- |
| Course One      | TEST-001      |               |

### Subsection Two

| Course Name     | Course Number | Prerequisites |
| --------------- | ------------- | ------------- |
| Course Two      | TEST-002      |               |

## Another Section

| Course Name     | Course Number | Prerequisites |
| --------------- | ------------- | ------------- |
| Course Three    | TEST-003      |               |
`

      const parser = new CourseParser(markdown)
      const result = parser.parse()

      expect(result.categories).toHaveLength(2)
      expect(result.categories[0].title).toBe('Main Section')
      expect(result.categories[0].subsections).toHaveLength(2)
      expect(result.categories[1].title).toBe('Another Section')

      const courseOne = result.courses.find((c) => c.code === 'TEST-001')
      expect(courseOne?.section).toBe('Main Section')
      expect(courseOne?.subsection).toBe('Subsection One')

      const courseTwo = result.courses.find((c) => c.code === 'TEST-002')
      expect(courseTwo?.section).toBe('Main Section')
      expect(courseTwo?.subsection).toBe('Subsection Two')

      const courseThree = result.courses.find((c) => c.code === 'TEST-003')
      expect(courseThree?.section).toBe('Another Section')
      expect(courseThree?.subsection).toBe('')
    })
  })

  describe('course code parsing', () => {
    it.each`
      input                    | expected
      ${'SIA-RMN-0001'}        | ${'SIA-RMN-0001'}
      ${'GPU-ALC-0009'}        | ${'GPU-ALC-0009'}
      ${'SIA-SRMC-07A'}        | ${'SIA-SRMC-07A'}
      ${'SIA-SRN-20W Project'} | ${'SIA-SRN-20W'}
      ${'SIA-SRN-21W Project'} | ${'SIA-SRN-21W'}
    `('should parse course code from: $input -> $expected', ({ input, expected }) => {
      const parser = new CourseParser(`
| Course Name | Course Number | Prerequisites |
| ----------- | ------------ | ------------- |
| Test Course | ${input}     |               |
`)
      const result = parser.parse()
      const course = result.courses[0]
      expect(course.code).toBe(expected)
    })
  })
})

// Test markdown with OR conditions
const testMarkdown = `
## GPU Advanced Leadership College

| Course Name               | Course Number | Prerequisites                |
| ------------------------- | ------------- | ---------------------------- |
| Intro to Management       | GPU-ALC-0009  | SIA-RMN-0004                 |
| Intro to Leadership       | GPU-ALC-0010  | SIA-RMN-0005 or GPU-ALC-0009 |
| Advanced Management       | GPU-ALC-0113  | SIA-RMN-0103 or GPU-ALC-0010 |
| Advanced Leadership       | GPU-ALC-0115  | SIA-RMN-0105 or GPU-ALC-0113 |

## Enlisted Training Center

| Course Name                              | Course Number | Prerequisites                          |
| ---------------------------------------- | ------------- | -------------------------------------- |
| Basic Enlistment Course                  | SIA-RMN-0001  |                                        |
| Basic Non-Commissioned Officer Course    | SIA-RMN-0002  | SIA-RMN-0001                           |
| Senior Chief Petty Officer               | SIA-RMN-0004  | SIA-RMN-0001 SIA-RMN-0002              |
| Master Chief Petty Officer               | SIA-RMN-0005  | SIA-RMN-0004                           |

## Officer Training Center

| Course Name          | Course Number | Prerequisites             |
| -------------------- | ------------- | ------------------------- |
| Lieutenant (SG)      | SIA-RMN-0103  | SIA-RMN-0002              |
| Commander            | SIA-RMN-0105  | SIA-RMN-0103              |
`

describe('Alternative Prerequisites (OR conditions)', () => {
  let courseData: ReturnType<typeof parseCourseData>
  let eligibilityEngine: EligibilityEngine

  beforeEach(() => {
    courseData = parseCourseData(testMarkdown)
    eligibilityEngine = new EligibilityEngine(courseData)
  })

  it('should parse course data correctly', () => {
    expect(courseData.courses.length).toBeGreaterThan(0)
    expect(courseData.courseMap.size).toBeGreaterThan(0)
  })

  it('should parse OR prerequisites correctly', () => {
    const introToLeadership = courseData.courseMap.get('GPU-ALC-0010')
    expect(introToLeadership).toBeDefined()

    const hasAlternativePrereq = introToLeadership!.prerequisites.some((prereq) => prereq.type === 'alternative_group')
    expect(hasAlternativePrereq).toBe(true)

    const alternativePrereq = introToLeadership!.prerequisites.find((prereq) => prereq.type === 'alternative_group')
    expect(alternativePrereq?.alternativePrerequisites).toBeDefined()
    expect(alternativePrereq?.alternativePrerequisites?.length).toBe(2)
  })

  it('should make course unavailable when no prerequisites are met', () => {
    const userProgress: UserProgress = {
      userId: 'test-user',
      completedCourses: new Set<string>(),
      availableCourses: new Set<string>(),
      specialRulesProgress: new Map(),
      lastUpdated: new Date()
    }

    const eligibility = eligibilityEngine.checkCourseEligibility('GPU-ALC-0010', userProgress)
    expect(eligibility.eligible).toBe(false)
    expect(eligibility.missingPrerequisites.length).toBeGreaterThan(0)
  })

  it('should make course available when first alternative prerequisite is met', () => {
    const userProgress: UserProgress = {
      userId: 'test-user',
      completedCourses: new Set(['SIA-RMN-0005']),
      availableCourses: new Set<string>(),
      specialRulesProgress: new Map(),
      lastUpdated: new Date()
    }

    const eligibility = eligibilityEngine.checkCourseEligibility('GPU-ALC-0010', userProgress)
    expect(eligibility.eligible).toBe(true)
    expect(eligibility.missingPrerequisites.length).toBe(0)
  })

  it('should make course available when second alternative prerequisite is met', () => {
    const userProgress: UserProgress = {
      userId: 'test-user',
      completedCourses: new Set(['SIA-RMN-0001', 'SIA-RMN-0002', 'SIA-RMN-0004', 'GPU-ALC-0009']),
      availableCourses: new Set<string>(),
      specialRulesProgress: new Map(),
      lastUpdated: new Date()
    }

    const eligibility = eligibilityEngine.checkCourseEligibility('GPU-ALC-0010', userProgress)
    expect(eligibility.eligible).toBe(true)
    expect(eligibility.missingPrerequisites.length).toBe(0)
  })

  it('should correctly identify courses unlocked by alternative prerequisites', () => {
    const unlockedByALC0009 = eligibilityEngine.getCoursesUnlockedBy('GPU-ALC-0009')
    const unlocksALC0010 = unlockedByALC0009.some((course) => course.code === 'GPU-ALC-0010')
    expect(unlocksALC0010).toBe(true)

    const unlockedByRMN0005 = eligibilityEngine.getCoursesUnlockedBy('SIA-RMN-0005')
    const alsoUnlocksALC0010 = unlockedByRMN0005.some((course) => course.code === 'GPU-ALC-0010')
    expect(alsoUnlocksALC0010).toBe(true)
  })

  it('should handle complex alternative prerequisite chains', () => {
    const userProgress: UserProgress = {
      userId: 'test-user',
      completedCourses: new Set(['SIA-RMN-0001', 'SIA-RMN-0002', 'SIA-RMN-0103']),
      availableCourses: new Set<string>(),
      specialRulesProgress: new Map(),
      lastUpdated: new Date()
    }

    // GPU-ALC-0113 requires "SIA-RMN-0103 or GPU-ALC-0010"
    const eligibility = eligibilityEngine.checkCourseEligibility('GPU-ALC-0113', userProgress)
    expect(eligibility.eligible).toBe(true)
    expect(eligibility.missingPrerequisites.length).toBe(0)
  })

  it('should correctly identify prerequisites for courses with alternatives', () => {
    const prerequisites = eligibilityEngine.getPrerequisitesForCourse('GPU-ALC-0010')
    expect(prerequisites.length).toBe(2) // Should include both SIA-RMN-0005 and GPU-ALC-0009

    const prereqCodes = prerequisites.map((course) => course.code)
    expect(prereqCodes).toContain('SIA-RMN-0005')
    expect(prereqCodes).toContain('GPU-ALC-0009')
  })

  it('should update course availability correctly with alternative prerequisites', () => {
    const userProgress: UserProgress = {
      userId: 'test-user',
      completedCourses: new Set(['SIA-RMN-0001', 'SIA-RMN-0002', 'SIA-RMN-0004', 'GPU-ALC-0009']),
      availableCourses: new Set<string>(),
      specialRulesProgress: new Map(),
      lastUpdated: new Date()
    }

    const updatedCourses = eligibilityEngine.updateCourseAvailability(userProgress)
    const alc0010 = updatedCourses.find((course) => course.code === 'GPU-ALC-0010')

    expect(alc0010).toBeDefined()
    expect(alc0010!.available).toBe(true)
    expect(alc0010!.completed).toBe(false)
  })
})
