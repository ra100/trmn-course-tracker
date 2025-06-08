import { describe, it, expect, beforeEach } from 'vitest'
import { CourseParser, parseCourseData } from './courseParser'
import { UserProgress, Course } from '../types'
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

  describe('department extraction from parsed data', () => {
    it('should extract unique departments from course sections and subsections', () => {
      const markdown = `
## Tactical

### Fire Control School

| Course Name               | Course Number | Prerequisites |
| ------------------------- | ------------- | ------------- |
| Fire Control Qualification| SIA-SRN-08C   |               |

### Electronic Warfare School

| Course Name               | Course Number | Prerequisites |
| ------------------------- | ------------- | ------------- |
| EW Qualification          | SIA-SRN-09C   |               |

## Engineering

### Power Systems School

| Course Name               | Course Number | Prerequisites |
| ------------------------- | ------------- | ------------- |
| Power Systems Qualification| SIA-SRN-14C  |               |

## Communications

| Course Name               | Course Number | Prerequisites |
| ------------------------- | ------------- | ------------- |
| Comms Qualification       | SIA-SRN-11C   |               |
`

      const parser = new CourseParser(markdown)
      parser.parse() // Parse to populate courses

      // Access the private method through reflection for testing
      const departments = (parser as any).getUniqueDepartments()

      expect(departments).toContain('Tactical')
      expect(departments).toContain('Engineering')
      expect(departments).toContain('Communications')
      expect(departments).toContain('Fire Control School')
      expect(departments).toContain('Electronic Warfare School')
      expect(departments).toContain('Power Systems School')
      expect(departments).toHaveLength(6)

      // Should be sorted
      expect(departments).toEqual(departments.slice().sort())
    })

    it('should extract departments from requirement text using parsed data', () => {
      const markdown = `
## Tactical

### Fire Control School

| Course Name               | Course Number | Prerequisites |
| ------------------------- | ------------- | ------------- |
| Fire Control Qualification| SIA-SRN-08C   |               |

## Engineering

| Course Name               | Course Number | Prerequisites |
| ------------------------- | ------------- | ------------- |
| Engineering Qualification | SIA-SRN-14C   |               |

## Communications

| Course Name               | Course Number | Prerequisites |
| ------------------------- | ------------- | ------------- |
| Comms Qualification       | SIA-SRN-11C   |               |
`

      const parser = new CourseParser(markdown)
      parser.parse() // Parse to populate courses

      // Test extractDepartments method with various texts
      const tacAndEngText = "At least 1 'D' level from Tactical and Engineering departments"
      const departments1 = (parser as any).extractDepartments(tacAndEngText)
      expect(departments1).toContain('Tactical')
      expect(departments1).toContain('Engineering')
      expect(departments1).toHaveLength(2)

      const commsText = 'Communications qualification required'
      const departments2 = (parser as any).extractDepartments(commsText)
      expect(departments2).toContain('Communications')
      expect(departments2).toHaveLength(1)

      const noMatchText = 'Some random text with no department names'
      const departments3 = (parser as any).extractDepartments(noMatchText)
      expect(departments3).toHaveLength(0)
    })

    it('should handle case-insensitive department matching', () => {
      const markdown = `
## Tactical

| Course Name               | Course Number | Prerequisites |
| ------------------------- | ------------- | ------------- |
| Tactical Course           | SIA-SRN-08C   |               |
`

      const parser = new CourseParser(markdown)
      parser.parse()

      const lowerCaseText = 'tactical department requirements'
      const upperCaseText = 'TACTICAL department requirements'
      const mixedCaseText = 'TaCtIcAl department requirements'

      const departments1 = (parser as any).extractDepartments(lowerCaseText)
      const departments2 = (parser as any).extractDepartments(upperCaseText)
      const departments3 = (parser as any).extractDepartments(mixedCaseText)

      expect(departments1).toContain('Tactical')
      expect(departments2).toContain('Tactical')
      expect(departments3).toContain('Tactical')
    })
  })

  describe('Space Warfare Pin parsing', () => {
    it('should parse Space Warfare Pin special rules correctly', () => {
      const markdown = `
# Space Warfare Pin

## Officers

| RMN OSWP | RMMC OSWP |
| -------- | --------- |
| [Master-at-Arms](https://wiki.trmn.org/index.php/Master-at-Arms) 'C' (SIA-SRN-31C) [Personnelman](https://wiki.trmn.org/index.php/Personnelman) 'C' (SIA-SRN-01C) Plus at least 1 'D' level from four (4) of the five following departments: [Astrogation](https://wiki.trmn.org/index.php?title=Astrogation&action=edit&redlink=1) [Flight Operations](https://wiki.trmn.org/index.php?title=Flight_Operations&action=edit&redlink=1) [Tactical](https://wiki.trmn.org/index.php?title=Tactical&action=edit&redlink=1) [Engineering](https://wiki.trmn.org/index.php?title=Engineering&action=edit&redlink=1) [Communications](https://wiki.trmn.org/index.php?title=Communications&action=edit&redlink=1) | [Rifleman](https://wiki.trmn.org/index.php?title=Rifleman&action=edit&redlink=1) 'D' (SIA-SRMC-07D) [Admin Specialist](https://wiki.trmn.org/index.php?title=Admin_Specialist&action=edit&redlink=1) 'C' (SIA-SRMC-09C) Plus at least 3 'D' levels of Marine specialties |

## Enlisted

| RMN ESWP | RMMC ESWP |
| -------- | --------- |
| [Personnelman](https://wiki.trmn.org/index.php/Personnelman) 'A' (SIA-SRN-01A) [Yeoman](https://wiki.trmn.org/index.php/Yeoman) 'A' (SIA-SRN-04A) Plus at least 1 'C' level from three (3) of the following departments: Astrogation Flight Operations Tactical Engineering Communications | [Rifleman](https://wiki.trmn.org/index.php?title=Rifleman&action=edit&redlink=1) 'A' (SIA-SRMC-07A) Plus at least three (3) 'C' levels of Marine specialties |
`

      const parser = new CourseParser(markdown)
      const result = parser.parse()

      // Should have parsed special rules
      expect(result.specialRules.length).toBeGreaterThan(0)

      // Find OSWP rules
      const rmn_oswp = result.specialRules.find((rule) => rule.name === 'RMN OSWP')
      expect(rmn_oswp).toBeDefined()
      expect(rmn_oswp?.type).toBe('OSWP')
      expect(rmn_oswp?.branch).toBe('RMN')
      expect(rmn_oswp?.rank).toBe('Officer')

      // Check OSWP requirements
      expect(rmn_oswp?.requirements).toBeDefined()
      const oswpCourseReqs = rmn_oswp?.requirements.filter((req) => req.type === 'course')
      expect(oswpCourseReqs?.length).toBe(2) // Master-at-Arms and Personnelman

      const oswpDeptReq = rmn_oswp?.requirements.find((req) => req.type === 'department_choice')
      expect(oswpDeptReq).toBeDefined()
      expect(oswpDeptReq?.minimum).toBe(4)
      expect(oswpDeptReq?.totalOptions).toBe(5)
      expect(oswpDeptReq?.level).toBe('D')

      // Find ESWP rules
      const rmn_eswp = result.specialRules.find((rule) => rule.name === 'RMN ESWP')
      expect(rmn_eswp).toBeDefined()
      expect(rmn_eswp?.type).toBe('ESWP')
      expect(rmn_eswp?.branch).toBe('RMN')
      expect(rmn_eswp?.rank).toBe('Enlisted')

      // Check ESWP requirements
      const eswpCourseReqs = rmn_eswp?.requirements.filter((req) => req.type === 'course')
      expect(eswpCourseReqs?.length).toBe(2) // Personnelman and Yeoman

      const eswpDeptReq = rmn_eswp?.requirements.find((req) => req.type === 'department_choice')
      expect(eswpDeptReq).toBeDefined()
      expect(eswpDeptReq?.minimum).toBe(3)
      expect(eswpDeptReq?.totalOptions).toBe(5)
      expect(eswpDeptReq?.level).toBe('C')
    })

    it('should parse both RMN and RMMC variants', () => {
      const markdown = `
# Space Warfare Pin

## Officers

| RMN OSWP | RMMC OSWP |
| -------- | --------- |
| [Master-at-Arms](https://wiki.trmn.org/index.php/Master-at-Arms) 'C' (SIA-SRN-31C) Plus requirements | [Rifleman](https://wiki.trmn.org/index.php?title=Rifleman&action=edit&redlink=1) 'D' (SIA-SRMC-07D) Plus requirements |
`

      const parser = new CourseParser(markdown)
      const result = parser.parse()

      const rmnRule = result.specialRules.find((rule) => rule.branch === 'RMN' && rule.type === 'OSWP')
      const rmmcRule = result.specialRules.find((rule) => rule.branch === 'RMMC' && rule.type === 'OSWP')

      expect(rmnRule).toBeDefined()
      expect(rmmcRule).toBeDefined()
      expect(rmnRule?.name).toBe('RMN OSWP')
      expect(rmmcRule?.name).toBe('RMMC OSWP')
    })

    it('should extract specific course codes from SWP requirements', () => {
      const markdown = `
# Space Warfare Pin

## Officers

| RMN OSWP | RMMC OSWP |
| -------- | --------- |
| Master-at-Arms 'C' (SIA-SRN-31C) Personnelman 'C' (SIA-SRN-01C) Plus at least 1 'D' level from four (4) departments | Rifleman 'D' (SIA-SRMC-07D) Admin Specialist 'C' (SIA-SRMC-09C) |
`

      const parser = new CourseParser(markdown)
      const result = parser.parse()

      const rmnOswp = result.specialRules.find((rule) => rule.name === 'RMN OSWP')
      expect(rmnOswp).toBeDefined()

      const courseRequirements = rmnOswp?.requirements.filter((req) => req.type === 'course')
      expect(courseRequirements?.length).toBe(2)

      const courseCodes = courseRequirements?.map((req) => req.code)
      expect(courseCodes).toContain('SIA-SRN-31C')
      expect(courseCodes).toContain('SIA-SRN-01C')

      const rmmcOswp = result.specialRules.find((rule) => rule.name === 'RMMC OSWP')
      const rmmcCourses = rmmcOswp?.requirements.filter((req) => req.type === 'course')
      const rmmcCodes = rmmcCourses?.map((req) => req.code)
      expect(rmmcCodes).toContain('SIA-SRMC-07D')
      expect(rmmcCodes).toContain('SIA-SRMC-09C')
    })

    it('should correctly identify officer vs enlisted sections', () => {
      const markdown = `
# Space Warfare Pin

## Officers

| RMN OSWP | RMMC OSWP |
| -------- | --------- |
| Officer requirements with SIA-SRN-31C | Officer RMMC requirements |

## Enlisted

| RMN ESWP | RMMC ESWP |
| -------- | --------- |
| Enlisted requirements with SIA-SRN-01A | Enlisted RMMC requirements |
`

      const parser = new CourseParser(markdown)
      const result = parser.parse()

      const officerRules = result.specialRules.filter((rule) => rule.rank === 'Officer')
      const enlistedRules = result.specialRules.filter((rule) => rule.rank === 'Enlisted')

      expect(officerRules.length).toBe(2) // RMN and RMMC OSWP
      expect(enlistedRules.length).toBe(2) // RMN and RMMC ESWP

      const rmnOfficer = officerRules.find((rule) => rule.branch === 'RMN')
      const rmnEnlisted = enlistedRules.find((rule) => rule.branch === 'RMN')

      expect(rmnOfficer?.type).toBe('OSWP')
      expect(rmnEnlisted?.type).toBe('ESWP')
    })

    it('should handle department choice requirements correctly', () => {
      const markdown = `
# Space Warfare Pin

## Officers

| RMN OSWP | RMMC OSWP |
| -------- | --------- |
| Plus at least 1 'D' level from four (4) of the five following departments | RMMC requirements |

## Enlisted

| RMN ESWP | RMMC ESWP |
| -------- | --------- |
| Plus at least 1 'C' level from three (3) of the following departments | RMMC requirements |
`

      const parser = new CourseParser(markdown)
      const result = parser.parse()

      const rmnOswp = result.specialRules.find((rule) => rule.name === 'RMN OSWP')
      const oswpDeptReq = rmnOswp?.requirements.find((req) => req.type === 'department_choice')

      expect(oswpDeptReq).toBeDefined()
      expect(oswpDeptReq?.minimum).toBe(4)
      expect(oswpDeptReq?.totalOptions).toBe(5)
      expect(oswpDeptReq?.level).toBe('D')
      expect(oswpDeptReq?.departments).toEqual([
        'Astrogation',
        'Flight Operations',
        'Tactical',
        'Engineering',
        'Communications'
      ])

      const rmnEswp = result.specialRules.find((rule) => rule.name === 'RMN ESWP')
      const eswpDeptReq = rmnEswp?.requirements.find((req) => req.type === 'department_choice')

      expect(eswpDeptReq).toBeDefined()
      expect(eswpDeptReq?.minimum).toBe(3)
      expect(eswpDeptReq?.totalOptions).toBe(5)
      expect(eswpDeptReq?.level).toBe('C')
    })

    it('should handle realistic Space Warfare Pin markdown structure', () => {
      const markdown = `
# Space Warfare Pin

RMN

The Space Warfare Pin comes in two varieties: a gold one, for officers, and a silver one for enlisted personnel.

### Officers

Both RMN and RMMC officers wear the same pin.

| RMN OSWP                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | RMMC OSWP                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Master-at-Arms](https://wiki.trmn.org/index.php/Master-at-Arms) 'C' (SIA-SRN-31C) [Personnelman](https://wiki.trmn.org/index.php/Personnelman) 'C' (SIA-SRN-01C) Plus at least 1 'D' level from four (4) of the five following departments: [Astrogation](https://wiki.trmn.org/index.php?title=Astrogation&action=edit&redlink=1) [Flight Operations](https://wiki.trmn.org/index.php?title=Flight_Operations&action=edit&redlink=1) [Tactical](https://wiki.trmn.org/index.php?title=Tactical&action=edit&redlink=1) [Engineering](https://wiki.trmn.org/index.php?title=Engineering&action=edit&redlink=1) [Communications](https://wiki.trmn.org/index.php?title=Communications&action=edit&redlink=1) (note that for the purposes of the OSWP, Flight Ops is a separate department from Astrogation) | [Rifleman](https://wiki.trmn.org/index.php?title=Rifleman&action=edit&redlink=1) 'D' (SIA-SRMC-07D) [Damage Control Technician](https://wiki.trmn.org/index.php/Damage_Control_Technician) 'C' (SIA-SRN-19C) [Admin Specialist](https://wiki.trmn.org/index.php?title=Admin_Specialist&action=edit&redlink=1) 'C' (SIA-SRMC-09C) [Military Police](https://wiki.trmn.org/index.php?title=Military_Police&action=edit&redlink=1) 'C' (SIA-SRMC-02C) Plus at least 3 'D' levels of the following Marine specialties: [Assault Marine](https://wiki.trmn.org/index.php?title=Assault_Marine&action=edit&redlink=1) [Recon Marine](https://wiki.trmn.org/index.php?title=Recon_Marine&action=edit&redlink=1) [Heavy Weapons](https://wiki.trmn.org/index.php?title=Heavy_Weapons&action=edit&redlink=1) [Missile Crew](https://wiki.trmn.org/index.php?title=Missile_Crew&action=edit&redlink=1) [Laser/Graser Crew](https://wiki.trmn.org/index.php?title=Laser/Graser_Crew&action=edit&redlink=1) [Armorer](https://wiki.trmn.org/index.php/Armorer) |

### Enlisted

| RMN ESWP                                                                                                                                                                                                                                                                                                                                                                                  | RMMC ESWP                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Personnelman](https://wiki.trmn.org/index.php/Personnelman) 'A' (SIA-SRN-01A) [Yeoman](https://wiki.trmn.org/index.php/Yeoman) 'A' (SIA-SRN-04A) Plus at least 1 'C' level from three (3) of the following departments: Astrogation Flight Operations Tactical Engineering Communications (note that for the purposes of the ESWP, Flight Ops is a separate department from Astrogation) | [Rifleman](https://wiki.trmn.org/index.php?title=Rifleman&action=edit&redlink=1) 'A' (SIA-SRMC-07A) [Damage Control Technician](https://wiki.trmn.org/index.php/Damage_Control_Technician) 'A' (SIA-SRN-19A) Plus at least three (3) 'C' levels of the following Marine specialties: [Assault Marine](https://wiki.trmn.org/index.php?title=Assault_Marine&action=edit&redlink=1) [Recon Marine](https://wiki.trmn.org/index.php?title=Recon_Marine&action=edit&redlink=1) [Heavy Weapons](https://wiki.trmn.org/index.php?title=Heavy_Weapons&action=edit&redlink=1) [Missile Crew](https://wiki.trmn.org/index.php?title=Missile_Crew&action=edit&redlink=1) [Laser/Graser Crew](https://wiki.trmn.org/index.php?title=Laser/Graser_Crew&action=edit&redlink=1) [Military Police](https://wiki.trmn.org/index.php?title=Military_Police&action=edit&redlink=1) [Armorer](https://wiki.trmn.org/index.php/Armorer) |
`

      const parser = new CourseParser(markdown)
      const result = parser.parse()

      // Should find all four variants (RMN/RMMC × OSWP/ESWP)
      expect(result.specialRules.length).toBe(4)

      const rmnOswp = result.specialRules.find((rule) => rule.name === 'RMN OSWP')
      const rmnEswp = result.specialRules.find((rule) => rule.name === 'RMN ESWP')
      const rmmcOswp = result.specialRules.find((rule) => rule.name === 'RMMC OSWP')
      const rmmcEswp = result.specialRules.find((rule) => rule.name === 'RMMC ESWP')

      expect(rmnOswp).toBeDefined()
      expect(rmnEswp).toBeDefined()
      expect(rmmcOswp).toBeDefined()
      expect(rmmcEswp).toBeDefined()

      // Verify course requirements are extracted correctly
      const rmnOswpCourses = rmnOswp?.requirements.filter((req) => req.type === 'course')
      expect(rmnOswpCourses?.some((req) => req.code === 'SIA-SRN-31C')).toBe(true)
      expect(rmnOswpCourses?.some((req) => req.code === 'SIA-SRN-01C')).toBe(true)

      const rmnEswpCourses = rmnEswp?.requirements.filter((req) => req.type === 'course')
      expect(rmnEswpCourses?.some((req) => req.code === 'SIA-SRN-01A')).toBe(true)
      expect(rmnEswpCourses?.some((req) => req.code === 'SIA-SRN-04A')).toBe(true)
    })
  })

  describe('Navy Counselor complex prerequisites', () => {
    it('should parse Navy Counselor Specialist complex requirements correctly', () => {
      const markdown = `
## Navy Counselor School

| Course Name               | Course Number | Course Prerequisites                                                                                                                                      |
| ------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navy Counselor Specialist | SIA-SRN-02A   | SIA-RMN-0001 SIA-SRN-01A 5 A courses from any of the following departments: Astrogation Tactical Command Communications Engineering Logistics, or Medical |
`

      const parser = new CourseParser(markdown)
      const result = parser.parse()

      const navyCounselorSpecialist = result.courses.find((c) => c.code === 'SIA-SRN-02A')
      expect(navyCounselorSpecialist).toBeDefined()
      expect(navyCounselorSpecialist?.prerequisites).toHaveLength(3)

      // Should have specific course prerequisites
      const coursePrereqs = navyCounselorSpecialist?.prerequisites.filter((p) => p.type === 'course')
      expect(coursePrereqs).toHaveLength(2)
      expect(coursePrereqs?.[0].code).toBe('SIA-RMN-0001')
      expect(coursePrereqs?.[1].code).toBe('SIA-SRN-01A')

      // Should have department choice requirement
      const deptChoiceReq = navyCounselorSpecialist?.prerequisites.find((p) => p.type === 'department_choice')
      expect(deptChoiceReq).toBeDefined()
      expect(deptChoiceReq?.minimum).toBe(5)
      expect(deptChoiceReq?.level).toBe('A')
      expect(deptChoiceReq?.departments).toContain('Astrogation')
      expect(deptChoiceReq?.departments).toContain('Tactical')
      expect(deptChoiceReq?.departments).toContain('Command')
      expect(deptChoiceReq?.departments).toContain('Communications')
      expect(deptChoiceReq?.departments).toContain('Engineering')
      expect(deptChoiceReq?.departments).toContain('Logistics')
      expect(deptChoiceReq?.departments).toContain('Medical')
    })

    it('should parse Navy Counselor Advanced Specialist with "departments listed above" correctly', () => {
      const markdown = `
## Navy Counselor School

| Course Name                        | Course Number | Course Prerequisites                                                                                        |
| ---------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------- |
| Navy Counselor Advanced Specialist | SIA-SRN-02C   | SIA-RMN-0002 SIA-SRN-02A 2 C courses from any of the departments listed above.                             |
`

      const parser = new CourseParser(markdown)
      const result = parser.parse()

      const navyCounselorAdvanced = result.courses.find((c) => c.code === 'SIA-SRN-02C')
      expect(navyCounselorAdvanced).toBeDefined()
      expect(navyCounselorAdvanced?.prerequisites).toHaveLength(3)

      // Should have specific course prerequisites
      const coursePrereqs = navyCounselorAdvanced?.prerequisites.filter((p) => p.type === 'course')
      expect(coursePrereqs).toHaveLength(2)
      expect(coursePrereqs?.[0].code).toBe('SIA-RMN-0002')
      expect(coursePrereqs?.[1].code).toBe('SIA-SRN-02A')

      // Should have department choice requirement referencing "departments listed above"
      const deptChoiceReq = navyCounselorAdvanced?.prerequisites.find((p) => p.type === 'department_choice')
      expect(deptChoiceReq).toBeDefined()
      expect(deptChoiceReq?.minimum).toBe(2)
      expect(deptChoiceReq?.level).toBe('C')
      expect(deptChoiceReq?.departments).toContain('Astrogation')
      expect(deptChoiceReq?.departments).toContain('Medical')
    })

    it('should parse Navy Counselor Qualification with single D course requirement', () => {
      const markdown = `
## Navy Counselor School

| Course Name                | Course Number | Course Prerequisites                                                                |
| -------------------------- | ------------- | ----------------------------------------------------------------------------------- |
| Navy Counselor Qualification | SIA-SRN-02D   | SIA-RMN-0101 SIA-SRN-02C 1 D course from any of the departments listed above.      |
`

      const parser = new CourseParser(markdown)
      const result = parser.parse()

      const navyCounselorQual = result.courses.find((c) => c.code === 'SIA-SRN-02D')
      expect(navyCounselorQual).toBeDefined()
      expect(navyCounselorQual?.prerequisites).toHaveLength(3)

      // Should have specific course prerequisites
      const coursePrereqs = navyCounselorQual?.prerequisites.filter((p) => p.type === 'course')
      expect(coursePrereqs).toHaveLength(2)
      expect(coursePrereqs?.[0].code).toBe('SIA-RMN-0101')
      expect(coursePrereqs?.[1].code).toBe('SIA-SRN-02C')

      // Should have department choice requirement for single D course
      const deptChoiceReq = navyCounselorQual?.prerequisites.find((p) => p.type === 'department_choice')
      expect(deptChoiceReq).toBeDefined()
      expect(deptChoiceReq?.minimum).toBe(1)
      expect(deptChoiceReq?.level).toBe('D')
      expect(deptChoiceReq?.departments).toContain('Astrogation')
    })
  })

  describe('Real Navy Counselor courses from courses.md', () => {
    it('should parse actual Navy Counselor courses correctly', async () => {
      // Read the actual courses.md file
      const fs = await import('fs')
      const path = await import('path')
      const coursesPath = path.join(process.cwd(), 'public', 'courses.md')
      const coursesContent = fs.readFileSync(coursesPath, 'utf-8')

      const parser = new CourseParser(coursesContent)
      const result = parser.parse()

      // Verify department mappings were parsed
      expect(result.departmentMappings).toBeDefined()
      expect(result.departmentMappings?.size).toBeGreaterThan(0)

      // Check specific department mappings
      const tacticalMappings = result.departmentMappings?.get('tactical')
      expect(tacticalMappings).toBeDefined()
      expect(tacticalMappings).toContain('fire control')
      expect(tacticalMappings).toContain('missile')
      expect(tacticalMappings).toContain('gunner')

      const communicationsMappings = result.departmentMappings?.get('communications')
      expect(communicationsMappings).toBeDefined()
      expect(communicationsMappings).toContain('data systems')
      expect(communicationsMappings).toContain('electronics')

      const engineeringMappings = result.departmentMappings?.get('engineering')
      expect(engineeringMappings).toBeDefined()
      expect(engineeringMappings).toContain('impeller')
      expect(engineeringMappings).toContain('damage control')

      // Find Navy Counselor courses
      const navyCounselorSpecialist = result.courses.find((c) => c.code === 'SIA-SRN-02A')
      const navyCounselorAdvanced = result.courses.find((c) => c.code === 'SIA-SRN-02C')
      const navyCounselorQual = result.courses.find((c) => c.code === 'SIA-SRN-02D')

      // Verify Navy Counselor Specialist
      expect(navyCounselorSpecialist).toBeDefined()
      expect(navyCounselorSpecialist?.name).toBe('Navy Counselor Specialist')
      expect(navyCounselorSpecialist?.prerequisites).toHaveLength(3)

      const specialistCoursePrereqs = navyCounselorSpecialist?.prerequisites.filter((p) => p.type === 'course')
      expect(specialistCoursePrereqs).toHaveLength(2)
      expect(specialistCoursePrereqs?.[0].code).toBe('SIA-RMN-0001')
      expect(specialistCoursePrereqs?.[1].code).toBe('SIA-SRN-01A')

      const specialistDeptReq = navyCounselorSpecialist?.prerequisites.find((p) => p.type === 'department_choice')
      expect(specialistDeptReq).toBeDefined()
      expect(specialistDeptReq?.minimum).toBe(5)
      expect(specialistDeptReq?.level).toBe('A')
      expect(specialistDeptReq?.departments).toContain('Astrogation')
      expect(specialistDeptReq?.departments).toContain('Medical')

      // Verify Navy Counselor Advanced Specialist
      expect(navyCounselorAdvanced).toBeDefined()
      expect(navyCounselorAdvanced?.name).toBe('Navy Counselor Advanced Specialist')
      expect(navyCounselorAdvanced?.prerequisites).toHaveLength(3)

      const advancedDeptReq = navyCounselorAdvanced?.prerequisites.find((p) => p.type === 'department_choice')
      expect(advancedDeptReq).toBeDefined()
      expect(advancedDeptReq?.minimum).toBe(2)
      expect(advancedDeptReq?.level).toBe('C')

      // Verify Navy Counselor Qualification
      expect(navyCounselorQual).toBeDefined()
      expect(navyCounselorQual?.name).toBe('Navy Counselor Qualification')
      expect(navyCounselorQual?.prerequisites).toHaveLength(3)

      const qualDeptReq = navyCounselorQual?.prerequisites.find((p) => p.type === 'department_choice')
      expect(qualDeptReq).toBeDefined()
      expect(qualDeptReq?.minimum).toBe(1)
      expect(qualDeptReq?.level).toBe('D')
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

    expect(introToLeadership).toBeDefined()
    const hasAlternativePrereq = (introToLeadership as Course).prerequisites.some(
      (prereq) => prereq.type === 'alternative_group'
    )
    expect(hasAlternativePrereq).toBe(true)

    const alternativePrereq = (introToLeadership as Course).prerequisites.find(
      (prereq) => prereq.type === 'alternative_group'
    )
    expect(alternativePrereq?.alternativePrerequisites).toBeDefined()
    expect(alternativePrereq?.alternativePrerequisites?.length).toBe(2)
  })

  it('should make course unavailable when no prerequisites are met', () => {
    const userProgress: UserProgress = {
      userId: 'test-user',
      completedCourses: new Set<string>(),
      availableCourses: new Set<string>(),
      inProgressCourses: new Set<string>(),
      waitingGradeCourses: new Set<string>(),
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
      inProgressCourses: new Set<string>(),
      waitingGradeCourses: new Set<string>(),
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
      inProgressCourses: new Set<string>(),
      waitingGradeCourses: new Set<string>(),
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
      inProgressCourses: new Set<string>(),
      waitingGradeCourses: new Set<string>(),
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
      inProgressCourses: new Set<string>(),
      waitingGradeCourses: new Set<string>(),
      specialRulesProgress: new Map(),
      lastUpdated: new Date()
    }

    const updatedCourses = eligibilityEngine.updateCourseAvailability(userProgress)
    const alc0010 = updatedCourses.find((course) => course.code === 'GPU-ALC-0010')

    expect(alc0010).toBeDefined()
    expect(alc0010?.available).toBe(true)
    expect(alc0010?.completed).toBe(false)
  })
})
