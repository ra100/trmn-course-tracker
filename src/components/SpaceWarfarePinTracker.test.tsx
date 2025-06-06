import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { SpaceWarfarePinTracker } from './SpaceWarfarePinTracker'
import { ParsedCourseData, UserProgress } from '../types'
import { lightTheme } from '../theme'

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={lightTheme}>{component}</ThemeProvider>)
}

// Mock courses
const mockCourses = [
  {
    id: '1',
    name: 'Master-at-Arms Advanced Specialist',
    code: 'SIA-SRN-31C',
    prerequisites: [],
    section: 'Command',
    subsection: 'Master at Arms School',
    sectionId: 'command',
    subsectionId: 'maa',
    completed: false,
    available: true
  },
  {
    id: '2',
    name: 'Personnelman Advanced Specialist',
    code: 'SIA-SRN-01C',
    prerequisites: [],
    section: 'Administration',
    subsection: 'Personnelman School',
    sectionId: 'admin',
    subsectionId: 'personnel',
    completed: false,
    available: true
  },
  {
    id: '3',
    name: 'Personnelman Specialist',
    code: 'SIA-SRN-01A',
    prerequisites: [],
    section: 'Administration',
    subsection: 'Personnelman School',
    sectionId: 'admin',
    subsectionId: 'personnel',
    completed: false,
    available: true
  },
  {
    id: '4',
    name: 'Yeoman Specialist',
    code: 'SIA-SRN-04A',
    prerequisites: [],
    section: 'Administration',
    subsection: 'Yeoman School',
    sectionId: 'admin',
    subsectionId: 'yeoman',
    completed: false,
    available: true
  },
  {
    id: '5',
    name: 'Fire Control Qualification',
    code: 'SIA-SRN-08D',
    prerequisites: [],
    section: 'Tactical',
    subsection: 'Fire Control School',
    sectionId: 'tactical',
    subsectionId: 'firecontrol',
    completed: false,
    available: true
  },
  {
    id: '6',
    name: 'Electronics Qualification',
    code: 'SIA-SRN-12D',
    prerequisites: [],
    section: 'Communications',
    subsection: 'Electronics School',
    sectionId: 'comms',
    subsectionId: 'electronics',
    completed: false,
    available: true
  },
  {
    id: '7',
    name: 'Flight Operations Advanced Specialist',
    code: 'SIA-SRN-05C',
    prerequisites: [],
    section: 'Astrogation',
    subsection: 'Flight Operations Group',
    sectionId: 'astro',
    subsectionId: 'flight',
    completed: false,
    available: true
  },
  {
    id: '8',
    name: 'Astrogation Qualification',
    code: 'SIA-SRN-05D',
    prerequisites: [],
    section: 'Astrogation',
    subsection: 'Flight Operations Group',
    sectionId: 'astro',
    subsectionId: 'flight',
    completed: false,
    available: true
  },
  {
    id: '9',
    name: 'Engineering Qualification',
    code: 'SIA-SRN-14D',
    prerequisites: [],
    section: 'Engineering',
    subsection: 'Engineering School',
    sectionId: 'engineering',
    subsectionId: 'engineering',
    completed: false,
    available: true
  }
]

// Mock course data
const mockCourseData: ParsedCourseData = {
  courses: mockCourses,
  categories: [],
  specialRules: [
    {
      id: 'rmn-oswp',
      type: 'OSWP',
      name: 'RMN OSWP',
      description: 'Officer Space Warfare Pin requirements',
      requirements: [
        {
          type: 'course',
          code: 'SIA-SRN-31C',
          required: true,
          level: 'C'
        },
        {
          type: 'course',
          code: 'SIA-SRN-01C',
          required: true,
          level: 'C'
        },
        {
          type: 'department_choice',
          minimum: 4,
          totalOptions: 5,
          level: 'D',
          departments: ['Astrogation', 'Flight Operations', 'Tactical', 'Engineering', 'Communications'],
          description: "At least 1 'D' level from 4 of 5 departments",
          required: true
        }
      ],
      branch: 'RMN',
      rank: 'Officer'
    },
    {
      id: 'rmn-eswp',
      type: 'ESWP',
      name: 'RMN ESWP',
      description: 'Enlisted Space Warfare Pin requirements',
      requirements: [
        {
          type: 'course',
          code: 'SIA-SRN-01A',
          required: true,
          level: 'A'
        },
        {
          type: 'course',
          code: 'SIA-SRN-04A',
          required: true,
          level: 'A'
        },
        {
          type: 'department_choice',
          minimum: 3,
          totalOptions: 5,
          level: 'C',
          departments: ['Astrogation', 'Flight Operations', 'Tactical', 'Engineering', 'Communications'],
          description: "At least 1 'C' level from 3 of 5 departments",
          required: true
        }
      ],
      branch: 'RMN',
      rank: 'Enlisted'
    }
  ],
  courseMap: new Map([
    ['SIA-SRN-31C', mockCourses[0]],
    ['SIA-SRN-01C', mockCourses[1]],
    ['SIA-SRN-01A', mockCourses[2]],
    ['SIA-SRN-04A', mockCourses[3]],
    ['SIA-SRN-08D', mockCourses[4]],
    ['SIA-SRN-12D', mockCourses[5]],
    ['SIA-SRN-05C', mockCourses[6]],
    ['SIA-SRN-05D', mockCourses[7]],
    ['SIA-SRN-14D', mockCourses[8]]
  ]),
  categoryMap: new Map(),
  dependencyGraph: new Map()
}

describe('SpaceWarfarePinTracker', () => {
  describe('OSWP (Officer Space Warfare Pin)', () => {
    it('shows OSWP requirements correctly', () => {
      const userProgress: UserProgress = {
        userId: 'test',
        completedCourses: new Set(),
        availableCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      renderWithTheme(<SpaceWarfarePinTracker courseData={mockCourseData} userProgress={userProgress} />)

      expect(screen.getByText('Officer Space Warfare Pin (OSWP)')).toBeInTheDocument()
      expect(screen.getByText('Master-at-Arms Advanced Specialist (SIA-SRN-31C)')).toBeInTheDocument()
      expect(screen.getByText('Personnelman Advanced Specialist (SIA-SRN-01C)')).toBeInTheDocument()
      expect(screen.getByText(/Department Choice.*1 'D' level from 4 of 5 departments/)).toBeInTheDocument()
    })

    it('calculates OSWP progress correctly with some completed courses', () => {
      const userProgress: UserProgress = {
        userId: 'test',
        completedCourses: new Set(['SIA-SRN-31C', 'SIA-SRN-01C']),
        availableCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      renderWithTheme(<SpaceWarfarePinTracker courseData={mockCourseData} userProgress={userProgress} />)

      expect(screen.getByText('67%')).toBeInTheDocument()
    })

    it('shows OSWP as earned when all requirements met', () => {
      const userProgress: UserProgress = {
        userId: 'test',
        completedCourses: new Set([
          'SIA-SRN-31C', // Master-at-Arms C
          'SIA-SRN-01C', // Personnelman C
          'SIA-SRN-08D', // Tactical D
          'SIA-SRN-12D', // Communications D
          'SIA-SRN-05D', // Astrogation D (Flight Ops)
          'SIA-SRN-14D' // Engineering D
        ]),
        availableCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      renderWithTheme(<SpaceWarfarePinTracker courseData={mockCourseData} userProgress={userProgress} />)

      const oswpSection = screen.getByText('Officer Space Warfare Pin (OSWP)').closest('div')
      expect(oswpSection).toHaveTextContent('EARNED')
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  describe('ESWP (Enlisted Space Warfare Pin)', () => {
    it('shows ESWP requirements correctly', () => {
      const userProgress: UserProgress = {
        userId: 'test',
        completedCourses: new Set(),
        availableCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      renderWithTheme(<SpaceWarfarePinTracker courseData={mockCourseData} userProgress={userProgress} />)

      expect(screen.getByText('Enlisted Space Warfare Pin (ESWP)')).toBeInTheDocument()
      expect(screen.getByText('Personnelman Specialist (SIA-SRN-01A)')).toBeInTheDocument()
      expect(screen.getByText('Yeoman Specialist (SIA-SRN-04A)')).toBeInTheDocument()
      expect(screen.getByText(/Department Choice.*1 'C' level from 3 of 5 departments/)).toBeInTheDocument()
    })

    it('calculates ESWP progress correctly with some completed courses', () => {
      const userProgress: UserProgress = {
        userId: 'test',
        completedCourses: new Set(['SIA-SRN-01A', 'SIA-SRN-04A']),
        availableCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      renderWithTheme(<SpaceWarfarePinTracker courseData={mockCourseData} userProgress={userProgress} />)

      // Should show 67% progress (2 of 3 requirements)
      const eswpSection = screen.getByText('Enlisted Space Warfare Pin (ESWP)').closest('div')
      expect(eswpSection).toHaveTextContent('67%')
    })

    it('shows ESWP as earned when all requirements met', () => {
      const userProgress: UserProgress = {
        userId: 'test',
        completedCourses: new Set([
          'SIA-SRN-01A', // Personnelman A
          'SIA-SRN-04A', // Yeoman A
          'SIA-SRN-05C', // Astrogation C (Flight Ops)
          'SIA-SRN-08C', // Tactical C
          'SIA-SRN-12C' // Communications C
        ]),
        availableCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      renderWithTheme(<SpaceWarfarePinTracker courseData={mockCourseData} userProgress={userProgress} />)

      const eswpSection = screen.getByText('Enlisted Space Warfare Pin (ESWP)').closest('div')
      expect(eswpSection).toHaveTextContent('EARNED')
      expect(eswpSection).toHaveTextContent('100%')
    })
  })

  describe('Department Progress Tracking', () => {
    it('tracks department progress correctly for OSWP', () => {
      const userProgress: UserProgress = {
        userId: 'test',
        completedCourses: new Set([
          'SIA-SRN-31C', // Master-at-Arms C
          'SIA-SRN-01C', // Personnelman C
          'SIA-SRN-08D', // Tactical D
          'SIA-SRN-12D' // Communications D (only 2 departments)
        ]),
        availableCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      renderWithTheme(<SpaceWarfarePinTracker courseData={mockCourseData} userProgress={userProgress} />)

      // Should show 2/4 departments satisfied for OSWP
      expect(screen.getByText(/Progress: 2\/4 departments/)).toBeInTheDocument()
    })

    it('tracks department progress correctly for ESWP with single department', () => {
      const userProgress: UserProgress = {
        userId: 'test',
        completedCourses: new Set([
          'SIA-SRN-01A', // Personnelman A
          'SIA-SRN-04A', // Yeoman A
          'SIA-SRN-05C' // Astrogation C (Flight Ops) - only 1 department
        ]),
        availableCourses: new Set(),
        specialRulesProgress: new Map(),
        lastUpdated: new Date()
      }

      renderWithTheme(<SpaceWarfarePinTracker courseData={mockCourseData} userProgress={userProgress} />)

      // Should show 1/3 departments satisfied for ESWP
      expect(screen.getByText(/Progress: 1\/3 departments/)).toBeInTheDocument()
    })
  })
})
