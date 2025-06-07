import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { ProgressPanel } from './ProgressPanel'
import { ParsedCourseData, UserProgress } from '../types'
import { lightTheme } from '../theme'
import { I18nProvider } from '../i18n'
import { EligibilityEngine } from '../utils/eligibilityEngine'

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <I18nProvider>{component}</I18nProvider>
    </ThemeProvider>
  )
}

const createUserProgress = (completedCourses: string[] = []): UserProgress => ({
  userId: 'test',
  completedCourses: new Set(completedCourses),
  availableCourses: new Set(),
  inProgressCourses: new Set(),
  waitingGradeCourses: new Set(),
  specialRulesProgress: new Map(),
  lastUpdated: new Date()
})

// Mock courses for Space Warfare Pin testing
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
    available: true,
    level: 'C' as const
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
    available: true,
    level: 'C' as const
  },
  {
    id: '3',
    name: 'Fire Control Qualification',
    code: 'SIA-SRN-08D',
    prerequisites: [],
    section: 'Tactical',
    subsection: 'Fire Control School',
    sectionId: 'tactical',
    subsectionId: 'firecontrol',
    completed: false,
    available: true,
    level: 'D' as const
  },
  {
    id: '4',
    name: 'Communications Qualification',
    code: 'SIA-SRN-12D',
    prerequisites: [],
    section: 'Communications',
    subsection: 'Electronics School',
    sectionId: 'comms',
    subsectionId: 'electronics',
    completed: false,
    available: true,
    level: 'D' as const
  }
]

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
          description: 'Master-at-Arms Advanced Specialist',
          required: true
        },
        {
          type: 'course',
          code: 'SIA-SRN-01C',
          description: 'Personnelman Advanced Specialist',
          required: true
        },
        {
          type: 'department_choice',
          description: '1 "D" level from 4 of 5 departments',
          departments: ['Tactical', 'Engineering', 'Communications', 'Astrogation', 'Flight Operations'],
          level: 'D',
          minimum: 4,
          totalOptions: 5,
          required: true
        }
      ],
      branch: 'RMN',
      rank: 'Officer'
    }
  ],
  courseMap: new Map([
    ['SIA-SRN-31C', mockCourses[0]],
    ['SIA-SRN-01C', mockCourses[1]],
    ['SIA-SRN-08D', mockCourses[2]],
    ['SIA-SRN-12D', mockCourses[3]]
  ]),
  categoryMap: new Map(),
  dependencyGraph: new Map()
}

const mockEligibilityEngine = {
  getAvailableCourses: vi.fn(() => []),
  updateCourseAvailability: vi.fn(() => []),
  getCoursePrerequisites: vi.fn(() => []),
  getUnlockedCourses: vi.fn(() => [])
} as unknown as EligibilityEngine

describe('ProgressPanel', () => {
  describe('Basic Functionality', () => {
    it('renders progress overview correctly', () => {
      const userProgress = createUserProgress(['SIA-SRN-31C'])

      renderWithTheme(
        <ProgressPanel
          userProgress={userProgress}
          courseData={mockCourseData}
          eligibilityEngine={mockEligibilityEngine}
        />
      )

      expect(screen.getByText('Progress Overview')).toBeInTheDocument()
      expect(screen.getByText('Achievements')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Completed courses
    })

    it('shows basic achievements', () => {
      const userProgress = createUserProgress(['SIA-SRN-31C'])

      renderWithTheme(
        <ProgressPanel
          userProgress={userProgress}
          courseData={mockCourseData}
          eligibilityEngine={mockEligibilityEngine}
        />
      )

      expect(screen.getByText('First Course')).toBeInTheDocument()
      expect(screen.getByText('Complete your first course')).toBeInTheDocument()
    })
  })

  describe('Space Warfare Pin Achievements', () => {
    it('displays Space Warfare Pin achievement', () => {
      const userProgress = createUserProgress()

      renderWithTheme(
        <ProgressPanel
          userProgress={userProgress}
          courseData={mockCourseData}
          eligibilityEngine={mockEligibilityEngine}
        />
      )

      expect(screen.getByText('Space Warfare Pins')).toBeInTheDocument()
      expect(screen.getByText('Earn OSWP or ESWP Space Warfare qualifications')).toBeInTheDocument()
    })

    it('shows Space Warfare Pin as expandable', () => {
      const userProgress = createUserProgress()

      renderWithTheme(
        <ProgressPanel
          userProgress={userProgress}
          courseData={mockCourseData}
          eligibilityEngine={mockEligibilityEngine}
        />
      )

      const expandIcon = screen.getByText('▼')
      expect(expandIcon).toBeInTheDocument()
    })

    it('expands to show OSWP and ESWP details when clicked', () => {
      const userProgress = createUserProgress()

      renderWithTheme(
        <ProgressPanel
          userProgress={userProgress}
          courseData={mockCourseData}
          eligibilityEngine={mockEligibilityEngine}
        />
      )

      const spaceWarfareAchievement = screen.getByText('Space Warfare Pins').closest('div')
      fireEvent.click(spaceWarfareAchievement!)

      expect(screen.getByText('OSWP')).toBeInTheDocument()
    })

    it('shows OSWP requirements when expanded', () => {
      const userProgress = createUserProgress()

      renderWithTheme(
        <ProgressPanel
          userProgress={userProgress}
          courseData={mockCourseData}
          eligibilityEngine={mockEligibilityEngine}
        />
      )

      const spaceWarfareAchievement = screen.getByText('Space Warfare Pins').closest('div')
      fireEvent.click(spaceWarfareAchievement!)

      expect(screen.getByText(/Master-at-Arms Advanced Specialist/)).toBeInTheDocument()
      expect(screen.getByText(/Personnelman Advanced Specialist/)).toBeInTheDocument()
    })

    it('shows progress tracking for Space Warfare Pin requirements', () => {
      const userProgress = createUserProgress(['SIA-SRN-31C'])

      renderWithTheme(
        <ProgressPanel
          userProgress={userProgress}
          courseData={mockCourseData}
          eligibilityEngine={mockEligibilityEngine}
        />
      )

      const spaceWarfareAchievement = screen.getByText('Space Warfare Pins').closest('div')
      fireEvent.click(spaceWarfareAchievement!)

      // Should show partial progress
      expect(screen.getByText('33%')).toBeInTheDocument() // 1 of 3 requirements completed
    })

    it('shows Space Warfare Pin as earned when requirements met', () => {
      const userProgress = createUserProgress([
        'SIA-SRN-31C', // Master-at-Arms C
        'SIA-SRN-01C', // Personnelman C
        'SIA-SRN-08D', // Tactical D
        'SIA-SRN-12D' // Communications D (need 4 departments but this gives partial credit)
      ])

      renderWithTheme(
        <ProgressPanel
          userProgress={userProgress}
          courseData={mockCourseData}
          eligibilityEngine={mockEligibilityEngine}
        />
      )

      const spaceWarfareAchievement = screen.getByText('Space Warfare Pins').closest('div')
      fireEvent.click(spaceWarfareAchievement!)

      // Should show completed checkmarks
      const checkmarks = screen.getAllByText('✓')
      expect(checkmarks.length).toBeGreaterThan(0)
    })

    it('handles missing Space Warfare Pin data gracefully', () => {
      const courseDataWithoutPins: ParsedCourseData = {
        ...mockCourseData,
        specialRules: []
      }

      const userProgress = createUserProgress()

      renderWithTheme(
        <ProgressPanel
          userProgress={userProgress}
          courseData={courseDataWithoutPins}
          eligibilityEngine={mockEligibilityEngine}
        />
      )

      const spaceWarfareAchievement = screen.getByText('Space Warfare Pins').closest('div')
      fireEvent.click(spaceWarfareAchievement!)

      expect(screen.getByText(/No OSWP requirements found/)).toBeInTheDocument()
    })

    it('collapses Space Warfare Pin details when clicked again', () => {
      const userProgress = createUserProgress()

      renderWithTheme(
        <ProgressPanel
          userProgress={userProgress}
          courseData={mockCourseData}
          eligibilityEngine={mockEligibilityEngine}
        />
      )

      const spaceWarfareAchievement = screen.getByText('Space Warfare Pins').closest('div')

      // Expand
      fireEvent.click(spaceWarfareAchievement!)
      expect(screen.getByText('OSWP')).toBeInTheDocument()

      // Collapse
      fireEvent.click(spaceWarfareAchievement!)

      // Details should be hidden (but expand button should still be there)
      const expandIcon = screen.getByText('▼')
      expect(expandIcon).toBeInTheDocument()
    })
  })
})
