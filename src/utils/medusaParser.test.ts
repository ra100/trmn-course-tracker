import { describe, it, expect } from 'vitest'
import { parseMedusaHTML, validateMedusaHTML, extractCompletedCourseCodes } from './medusaParser'

describe('medusaParser', () => {
  const sampleMedusaHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Lieutenant (SG) Rastislav Svarba | Royal Manticoran Navy Database</title>
      <link rel="stylesheet" href="https://medusa.trmn.org/css/app.css">
    </head>
    <body>
      <div class="tab-content">
        <div role="tabpanel" class="tab-pane active" id="RMN">
          <div class="row zebra-odd">
            <div class="col-sm-6 Incised901Light text-left">SIA-RMN-0001 Basic Enlisted Course</div>
            <div class="col-sm-1 Incised901Light text-right">90%</div>
            <div class="col-sm-3 Incised901Light text-right">15 Dec 2024</div>
            <div class="col-sm-2"></div>
          </div>
          <div class="row zebra-odd">
            <div class="col-sm-6 Incised901Light text-left">SIA-RMN-0002 Basic Non-Comm Course</div>
            <div class="col-sm-1 Incised901Light text-right">100%</div>
            <div class="col-sm-3 Incised901Light text-right">15 Dec 2024</div>
            <div class="col-sm-2"></div>
          </div>
          <div class="row zebra-odd">
            <div class="col-sm-6 Incised901Light text-left">SIA-RMN-0103 Lieutenant Course</div>
            <div class="col-sm-1 Incised901Light text-right">96%</div>
            <div class="col-sm-3 Incised901Light text-right">20 Feb 2025</div>
            <div class="col-sm-2"></div>
          </div>
        </div>

        <div role="tabpanel" class="tab-pane" id="RMACSSpecialty">
          <div class="row zebra-odd">
            <div class="col-sm-6 Incised901Light text-left">RMACA-AOPA-E01 A Tale of Two ILSs</div>
            <div class="col-sm-1 Incised901Light text-right">100%</div>
            <div class="col-sm-3 Incised901Light text-right">19 Jan 2025</div>
            <div class="col-sm-2"></div>
          </div>
          <div class="row zebra-odd">
            <div class="col-sm-6 Incised901Light text-left">RMACA-AOPA-R01 Aircraft Preflight</div>
            <div class="col-sm-1 Incised901Light text-right">100%</div>
            <div class="col-sm-3 Incised901Light text-right">04 Jan 2025</div>
            <div class="col-sm-2"></div>
          </div>
        </div>

        <div role="tabpanel" class="tab-pane" id="MannheimUniversity">
          <div class="row zebra-odd">
            <div class="col-sm-6 Incised901Light text-left">MU-BEK-01 IS 100 - Introduction to Incident Command System</div>
            <div class="col-sm-1 Incised901Light text-right">100%</div>
            <div class="col-sm-3 Incised901Light text-right">17 Dec 2024</div>
            <div class="col-sm-2"></div>
          </div>
          <div class="row zebra-odd">
            <div class="col-sm-6 Incised901Light text-left">MU-BEK-02 IS 200 - Basic Incident Command System for Initial Response</div>
            <div class="col-sm-1 Incised901Light text-right">100%</div>
            <div class="col-sm-3 Incised901Light text-right">17 Dec 2024</div>
            <div class="col-sm-2"></div>
          </div>
        </div>
      </div>
      <div class="tab-content">
        <h4>Academic Record</h4>
        <p>Service Record information</p>
      </div>
    </body>
    </html>
  `

  describe('parseMedusaHTML', () => {
    it('should parse RMN courses correctly', () => {
      const result = parseMedusaHTML(sampleMedusaHTML)

      expect(result.errors).toHaveLength(0)

      const rmnCourses = result.courses.filter((c) => c.category === 'RMN')
      expect(rmnCourses).toHaveLength(3)

      expect(rmnCourses[0]).toEqual({
        courseCode: 'SIA-RMN-0001',
        courseName: 'SIA-RMN-0001 Basic Enlisted Course',
        grade: '90%',
        completionDate: '15 Dec 2024',
        category: 'RMN'
      })

      expect(rmnCourses[2]).toEqual({
        courseCode: 'SIA-RMN-0103',
        courseName: 'SIA-RMN-0103 Lieutenant Course',
        grade: '96%',
        completionDate: '20 Feb 2025',
        category: 'RMN'
      })
    })

    it('should parse RMACS specialty courses correctly', () => {
      const result = parseMedusaHTML(sampleMedusaHTML)

      const rmacsCourses = result.courses.filter((c) => c.category === 'RMACS Specialty')
      expect(rmacsCourses).toHaveLength(2)

      expect(rmacsCourses[0]).toEqual({
        courseCode: 'RMACA-AOPA-E01',
        courseName: 'RMACA-AOPA-E01 A Tale of Two ILSs',
        grade: '100%',
        completionDate: '19 Jan 2025',
        category: 'RMACS Specialty'
      })
    })

    it('should parse Mannheim University courses correctly', () => {
      const result = parseMedusaHTML(sampleMedusaHTML)

      const muCourses = result.courses.filter((c) => c.category === 'Mannheim University')
      expect(muCourses).toHaveLength(2)

      expect(muCourses[0]).toEqual({
        courseCode: 'MU-BEK-01',
        courseName: 'MU-BEK-01 IS 100 - Introduction to Incident Command System',
        grade: '100%',
        completionDate: '17 Dec 2024',
        category: 'Mannheim University'
      })
    })

    it('should handle warrant courses with W suffix', () => {
      const htmlWithWarrant = `
        <div role="tabpanel" id="RMN">
          <div class="row zebra-odd">
            <div class="col-sm-6 Incised901Light text-left">SIA-SRN-20W Project</div>
            <div class="col-sm-1 Incised901Light text-right">95%</div>
            <div class="col-sm-3 Incised901Light text-right">01 Mar 2025</div>
            <div class="col-sm-2"></div>
          </div>
        </div>
      `

      const result = parseMedusaHTML(htmlWithWarrant)

      expect(result.courses).toHaveLength(1)
      expect(result.courses[0].courseCode).toBe('SIA-SRN-20W')
    })

    it('should handle invalid HTML gracefully', () => {
      const invalidHTML = '<div>Invalid content</div>'
      const result = parseMedusaHTML(invalidHTML)

      expect(result.courses).toHaveLength(0)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle malformed course rows', () => {
      const malformedHTML = `
        <div role="tabpanel" id="RMN">
          <div class="row zebra-odd">
            <div class="col-sm-6">Incomplete course info</div>
          </div>
          <div class="row zebra-odd">
            <div class="col-sm-6">SIA-RMN-0001 Valid Course</div>
            <div class="col-sm-1">100%</div>
            <div class="col-sm-3">01 Jan 2025</div>
          </div>
        </div>
      `

      const result = parseMedusaHTML(malformedHTML)

      expect(result.courses).toHaveLength(1)
      expect(result.courses[0].courseCode).toBe('SIA-RMN-0001')
    })

    it('should set parse date', () => {
      const result = parseMedusaHTML(sampleMedusaHTML)

      expect(result.parseDate).toBeInstanceOf(Date)
      expect(result.parseDate.getTime()).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('validateMedusaHTML', () => {
    it('should validate correct medusa HTML', () => {
      const result = validateMedusaHTML(sampleMedusaHTML)

      expect(result.valid).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should reject non-medusa HTML', () => {
      const nonMedusaHTML = '<html><body><h1>Random Page</h1></body></html>'
      const result = validateMedusaHTML(nonMedusaHTML)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('does not appear to be from medusa.trmn.org')
    })

    it('should require multiple indicators', () => {
      const partialHTML = '<div>medusa.trmn.org</div>'
      const result = validateMedusaHTML(partialHTML)

      expect(result.valid).toBe(false)
    })
  })

  describe('extractCompletedCourseCodes', () => {
    it('should extract course codes from medusa courses', () => {
      const result = parseMedusaHTML(sampleMedusaHTML)
      const courseCodes = extractCompletedCourseCodes(result.courses)

      expect(courseCodes).toContain('SIA-RMN-0001')
      expect(courseCodes).toContain('SIA-RMN-0002')
      expect(courseCodes).toContain('SIA-RMN-0103')
      expect(courseCodes).toContain('RMACA-AOPA-E01')
      expect(courseCodes).toContain('RMACA-AOPA-R01')
      expect(courseCodes).toContain('MU-BEK-01')
      expect(courseCodes).toContain('MU-BEK-02')

      // Should have at least the structured courses, may have more from text search
      expect(courseCodes.length).toBeGreaterThanOrEqual(7)
    })

    it('should filter out invalid courses', () => {
      const invalidCourses = [
        {
          courseCode: 'SIA-RMN-0001',
          courseName: 'Valid',
          grade: '100%',
          completionDate: '01 Jan 2025',
          category: 'RMN'
        },
        { courseCode: '', courseName: 'Invalid', grade: '100%', completionDate: '01 Jan 2025', category: 'RMN' }
      ]

      const courseCodes = extractCompletedCourseCodes(invalidCourses)

      expect(courseCodes).toEqual(['SIA-RMN-0001'])
    })
  })

  describe('course code extraction patterns', () => {
    const testCases = [
      // Traditional formats
      { input: 'SIA-RMN-0001 Basic Course', expected: 'SIA-RMN-0001' },
      { input: 'SIA-SRN-20W Project', expected: 'SIA-SRN-20W' },
      { input: 'SIA-SRN-101C Advanced Course', expected: 'SIA-SRN-101C' },
      { input: 'RMACA-AOPA-E01 Aviation Course', expected: 'RMACA-AOPA-E01' },
      { input: 'RMACA-AOPA-R15 Required Course', expected: 'RMACA-AOPA-R15' },
      { input: 'MU-BEK-01 University Course', expected: 'MU-BEK-01' },
      { input: 'MU-BEK-12 Another Course', expected: 'MU-BEK-12' },
      // New university formats
      { input: 'LU-XI-CZ01 Cryptozoology Course', expected: 'LU-XI-CZ01' },
      { input: 'LU-XI-CZ02 Advanced Cryptozoology', expected: 'LU-XI-CZ02' },
      { input: 'MU-PLSC-01 Political Science I', expected: 'MU-PLSC-01' },
      { input: 'MU-ECON-02 Economics II', expected: 'MU-ECON-02' },
      // New RMACA formats
      { input: 'RMACA-RMAIA-07A Basic Intelligence', expected: 'RMACA-RMAIA-07A' },
      { input: 'RMACA-RMAIA-07D Advanced Intelligence', expected: 'RMACA-RMAIA-07D' },
      { input: 'RMACA-AOPA-E07 Emergency Procedures', expected: 'RMACA-AOPA-E07' },
      { input: 'RMACA-AOPA-R09 Radio Operations', expected: 'RMACA-AOPA-R09' },
      // Edge cases
      { input: 'Invalid course name', expected: null }
    ]

    testCases.forEach(({ input, expected }) => {
      it(`should extract "${expected}" from "${input}"`, () => {
        const html = `
          <div role="tabpanel" id="RMN">
            <div class="row zebra-odd">
              <div class="col-sm-6">${input}</div>
              <div class="col-sm-1">100%</div>
              <div class="col-sm-3">01 Jan 2025</div>
            </div>
          </div>
        `

        const result = parseMedusaHTML(html)

        if (expected) {
          expect(result.courses.length).toBeGreaterThanOrEqual(1)
          const course = result.courses.find((c) => c.courseCode === expected)
          expect(course).toBeDefined()
          expect(course?.courseCode).toBe(expected)
        } else {
          // For invalid course names, should not find any structured courses
          // but may still find some via text search if pattern matches elsewhere
          const structuredCourses = result.courses.filter((c) => c.category === 'RMN')
          expect(structuredCourses).toHaveLength(0)
        }
      })
    })
  })

  describe('enhanced course format support', () => {
    it('should parse new university course formats (LU, MU)', () => {
      const htmlWithNewFormats = `
        <div role="tabpanel" id="LysanderUniversity">
          <div class="row zebra-odd">
            <div class="col-sm-6">LU-XI-CZ01 Introduction to Cryptozoology</div>
            <div class="col-sm-1">95%</div>
            <div class="col-sm-3">01 Mar 2025</div>
          </div>
          <div class="row zebra-even">
            <div class="col-sm-6">LU-XI-CZ02 Advanced Cryptozoology</div>
            <div class="col-sm-1">88%</div>
            <div class="col-sm-3">15 Mar 2025</div>
          </div>
        </div>
        <div role="tabpanel" id="MannheimUniversity">
          <div class="row zebra-odd">
            <div class="col-sm-6">MU-PLSC-01 Political Science I</div>
            <div class="col-sm-1">92%</div>
            <div class="col-sm-3">20 Feb 2025</div>
          </div>
          <div class="row zebra-even">
            <div class="col-sm-6">MU-ECON-02 Economics II</div>
            <div class="col-sm-1">87%</div>
            <div class="col-sm-3">10 Mar 2025</div>
          </div>
        </div>
      `

      const result = parseMedusaHTML(htmlWithNewFormats)

      expect(result.errors).toHaveLength(0)
      expect(result.courses).toHaveLength(4)

      // Check LU courses
      const luCourses = result.courses.filter((c) => c.category === 'Lysander University')
      expect(luCourses).toHaveLength(2)
      expect(luCourses[0].courseCode).toBe('LU-XI-CZ01')
      expect(luCourses[1].courseCode).toBe('LU-XI-CZ02')

      // Check MU courses with new format
      const muCourses = result.courses.filter((c) => c.category === 'Mannheim University')
      expect(muCourses).toHaveLength(2)
      expect(muCourses[0].courseCode).toBe('MU-PLSC-01')
      expect(muCourses[1].courseCode).toBe('MU-ECON-02')
    })

    it('should parse new RMACA course formats', () => {
      const htmlWithRMACAFormats = `
        <div role="tabpanel" id="RMACA">
          <div class="row zebra-odd">
            <div class="col-sm-6">RMACA-RMAIA-07A Basic Intelligence</div>
            <div class="col-sm-1">94%</div>
            <div class="col-sm-3">05 Feb 2025</div>
          </div>
          <div class="row zebra-even">
            <div class="col-sm-6">RMACA-RMAIA-07D Advanced Intelligence</div>
            <div class="col-sm-1">91%</div>
            <div class="col-sm-3">20 Feb 2025</div>
          </div>
          <div class="row zebra-odd">
            <div class="col-sm-6">RMACA-AOPA-E07 Emergency Procedures</div>
            <div class="col-sm-1">96%</div>
            <div class="col-sm-3">12 Mar 2025</div>
          </div>
          <div class="row zebra-even">
            <div class="col-sm-6">RMACA-AOPA-R09 Radio Operations</div>
            <div class="col-sm-1">89%</div>
            <div class="col-sm-3">25 Mar 2025</div>
          </div>
        </div>
      `

      const result = parseMedusaHTML(htmlWithRMACAFormats)

      expect(result.errors).toHaveLength(0)
      expect(result.courses).toHaveLength(4)

      const rmacaCourses = result.courses.filter((c) => c.category === 'Royal Manticoran Aerospace Command Academy')
      expect(rmacaCourses).toHaveLength(4)

      const courseCodes = rmacaCourses.map((c) => c.courseCode)
      expect(courseCodes).toContain('RMACA-RMAIA-07A')
      expect(courseCodes).toContain('RMACA-RMAIA-07D')
      expect(courseCodes).toContain('RMACA-AOPA-E07')
      expect(courseCodes).toContain('RMACA-AOPA-R09')
    })

    it('should handle unknown panels gracefully', () => {
      const htmlWithUnknownPanels = `
        <div role="tabpanel" id="NewUnknownPanel">
          <div class="row zebra-odd">
            <div class="col-sm-6">XYZ-ABC-001 Unknown Course Type</div>
            <div class="col-sm-1">85%</div>
            <div class="col-sm-3">01 Apr 2025</div>
          </div>
        </div>
        <div role="tabpanel" id="AnotherNewCategory">
          <div class="row zebra-odd">
            <div class="col-sm-6">DEF-GHI-002 Another Unknown Course</div>
            <div class="col-sm-1">92%</div>
            <div class="col-sm-3">15 Apr 2025</div>
          </div>
        </div>
        <div role="tabpanel" id="SomeSpecialtyPanel">
          <div class="row zebra-odd">
            <div class="col-sm-6">JKL-MNO-003 Specialty Course</div>
            <div class="col-sm-1">88%</div>
            <div class="col-sm-3">20 Apr 2025</div>
          </div>
        </div>
      `

      const result = parseMedusaHTML(htmlWithUnknownPanels)

      expect(result.errors).toHaveLength(0)
      expect(result.courses).toHaveLength(3)

      // Check that categories are generated from panel IDs
      const categories = result.courses.map((c) => c.category)
      expect(categories).toContain('New Unknown Panel')
      expect(categories).toContain('Another New Category')
      expect(categories).toContain('Some Specialty Panel')

      // Check course codes
      const courseCodes = result.courses.map((c) => c.courseCode)
      expect(courseCodes).toContain('XYZ-ABC-001')
      expect(courseCodes).toContain('DEF-GHI-002')
      expect(courseCodes).toContain('JKL-MNO-003')
    })

    it('should find courses in unexpected locations (fallback text search)', () => {
      const htmlWithCoursesInUnexpectedPlaces = `
        <div class="some-other-content">
          <p>Student has completed ABC-DEF-123 and XYZ-QWE-456 courses.</p>
          <span>Additional course: PQR-STU-789</span>
        </div>
        <div role="tabpanel" id="RMN">
          <div class="row zebra-odd">
            <div class="col-sm-6">SIA-RMN-0001 Regular Course</div>
            <div class="col-sm-1">95%</div>
            <div class="col-sm-3">01 Jan 2025</div>
          </div>
        </div>
      `

      const result = parseMedusaHTML(htmlWithCoursesInUnexpectedPlaces)

      expect(result.courses.length).toBeGreaterThan(1)

      // Should find the regular course
      const regularCourse = result.courses.find((c) => c.courseCode === 'SIA-RMN-0001')
      expect(regularCourse).toBeDefined()
      expect(regularCourse?.category).toBe('RMN')

      // Should also find courses mentioned in text
      const courseCodes = result.courses.map((c) => c.courseCode)
      expect(courseCodes).toContain('ABC-DEF-123')
      expect(courseCodes).toContain('XYZ-QWE-456')
      expect(courseCodes).toContain('PQR-STU-789')

      // Text-found courses should have generic category
      const textFoundCourses = result.courses.filter((c) => c.category === 'Other/Unknown')
      expect(textFoundCourses.length).toBeGreaterThan(0)
    })

    it('should not duplicate courses found in both structured and text locations', () => {
      const htmlWithDuplicates = `
        <div role="tabpanel" id="RMN">
          <div class="row zebra-odd">
            <div class="col-sm-6">SIA-RMN-0001 Regular Course</div>
            <div class="col-sm-1">95%</div>
            <div class="col-sm-3">01 Jan 2025</div>
          </div>
        </div>
        <div class="some-text">
          <p>Previously completed: SIA-RMN-0001</p>
        </div>
      `

      const result = parseMedusaHTML(htmlWithDuplicates)

      const sia001Courses = result.courses.filter((c) => c.courseCode === 'SIA-RMN-0001')
      expect(sia001Courses).toHaveLength(1) // Should not duplicate
      expect(sia001Courses[0].category).toBe('RMN') // Should keep the structured data
    })
  })

  describe('category mapping', () => {
    it('should map known panel IDs correctly', () => {
      const testPanels = [
        { panelId: 'RMN', expectedCategory: 'RMN' },
        { panelId: 'RMNSpeciality', expectedCategory: 'RMN Speciality' },
        { panelId: 'RMACSSpecialty', expectedCategory: 'RMACS Specialty' },
        { panelId: 'MannheimUniversity', expectedCategory: 'Mannheim University' },
        { panelId: 'LysanderUniversity', expectedCategory: 'Lysander University' },
        { panelId: 'RMACA', expectedCategory: 'Royal Manticoran Aerospace Command Academy' },
        { panelId: 'GPU', expectedCategory: 'Grayson Protector University' },
        { panelId: 'SIA', expectedCategory: 'Saganami Island Academy' }
      ]

      testPanels.forEach(({ panelId, expectedCategory }) => {
        const html = `
          <html>
          <body>
          <div role="tabpanel" id="${panelId}">
            <div class="row zebra-odd">
              <div class="col-sm-6">TEST-001 Test Course</div>
              <div class="col-sm-1">100%</div>
              <div class="col-sm-3">01 Jan 2025</div>
            </div>
          </div>
        `

        const result = parseMedusaHTML(html)
        expect(result.courses).toHaveLength(1)
        expect(result.courses[0].category).toBe(expectedCategory)
      })
    })

    it('should generate readable categories for unknown panels', () => {
      const testCases = [
        { panelId: 'SomeNewPanel', expected: 'Some New Panel' },
        { panelId: 'AcademicDepartment', expected: 'Academic Department' },
        { panelId: 'XYZ', expected: 'X Y Z' },
        { panelId: 'NewCategory123', expected: 'New Category123' }
      ]

      testCases.forEach(({ panelId, expected }) => {
        const html = `
          <div role="tabpanel" id="${panelId}">
            <div class="row zebra-odd">
              <div class="col-sm-6">TEST-001 Test Course</div>
              <div class="col-sm-1">100%</div>
              <div class="col-sm-3">01 Jan 2025</div>
            </div>
          </div>
        `

        const result = parseMedusaHTML(html)
        expect(result.courses).toHaveLength(1)
        expect(result.courses[0].category).toBe(expected)
      })
    })
  })

  describe('comprehensive course detection', () => {
    it('should find all course formats in a complex HTML document', () => {
      const complexHTML = `
        <html>
        <body>
        <div role="tabpanel" id="RMN">
          <div class="row zebra-odd">
            <div class="col-sm-6">SIA-RMN-0001 Traditional Course</div>
            <div class="col-sm-1">95%</div>
            <div class="col-sm-3">01 Jan 2025</div>
          </div>
        </div>
        <div role="tabpanel" id="LysanderUniversity">
          <div class="row zebra-odd">
            <div class="col-sm-6">LU-XI-CZ01 University Course</div>
            <div class="col-sm-1">88%</div>
            <div class="col-sm-3">15 Feb 2025</div>
          </div>
        </div>
        <div role="tabpanel" id="RMACA">
          <div class="row zebra-odd">
            <div class="col-sm-6">RMACA-AOPA-E07 Aerospace Course</div>
            <div class="col-sm-1">92%</div>
            <div class="col-sm-3">20 Mar 2025</div>
          </div>
        </div>
        <div role="tabpanel" id="UnknownPanel">
          <div class="row zebra-odd">
            <div class="col-sm-6">NEW-FMT-001 Future Format</div>
            <div class="col-sm-1">90%</div>
            <div class="col-sm-3">10 Apr 2025</div>
          </div>
        </div>
        <div class="random-text">
          Also mentioned: ABC-XYZ-999 and DEF-QWE-888
        </div>
        </body>
        </html>
      `

      const result = parseMedusaHTML(complexHTML)

      expect(result.courses.length).toBeGreaterThanOrEqual(6)

      const courseCodes = result.courses.map((c) => c.courseCode)
      expect(courseCodes).toContain('SIA-RMN-0001')
      expect(courseCodes).toContain('LU-XI-CZ01')
      expect(courseCodes).toContain('RMACA-AOPA-E07')
      expect(courseCodes).toContain('NEW-FMT-001')
      expect(courseCodes).toContain('ABC-XYZ-999')
      expect(courseCodes).toContain('DEF-QWE-888')

      // Check categories
      const categories = result.courses.map((c) => c.category)
      expect(categories).toContain('RMN')
      expect(categories).toContain('Lysander University')
      expect(categories).toContain('Royal Manticoran Aerospace Command Academy')
      expect(categories).toContain('Unknown Panel')
      expect(categories).toContain('Other/Unknown')
    })
  })
})
