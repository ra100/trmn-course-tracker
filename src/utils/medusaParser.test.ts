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

      expect(courseCodes).toHaveLength(7)
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
      { input: 'SIA-RMN-0001 Basic Course', expected: 'SIA-RMN-0001' },
      { input: 'SIA-SRN-20W Project', expected: 'SIA-SRN-20W' },
      { input: 'SIA-SRN-101C Advanced Course', expected: 'SIA-SRN-101C' },
      { input: 'RMACA-AOPA-E01 Aviation Course', expected: 'RMACA-AOPA-E01' },
      { input: 'RMACA-AOPA-R15 Required Course', expected: 'RMACA-AOPA-R15' },
      { input: 'MU-BEK-01 University Course', expected: 'MU-BEK-01' },
      { input: 'MU-BEK-12 Another Course', expected: 'MU-BEK-12' },
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
          expect(result.courses).toHaveLength(1)
          expect(result.courses[0].courseCode).toBe(expected)
        } else {
          expect(result.courses).toHaveLength(0)
        }
      })
    })
  })
})
