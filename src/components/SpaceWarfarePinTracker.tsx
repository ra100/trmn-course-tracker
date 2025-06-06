import React from 'react'
import styled from 'styled-components'
import { ParsedCourseData, UserProgress } from '../types'

const TrackerContainer = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.colors.border};
  box-shadow: ${(props) => props.theme.shadows.medium};
  margin: 1rem;
  overflow: hidden;
  min-height: 200px;
`

const TrackerHeader = styled.div`
  background: linear-gradient(135deg, #b8860b, #8b7355);
  color: white;
  padding: 1rem;
  font-weight: bold;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const PinIcon = styled.div`
  width: 24px;
  height: 24px;
  background: gold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #000;
  font-weight: bold;
`

const TrackerContent = styled.div`
  padding: 1rem;
`

const PinSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`

const PinTitle = styled.h3`
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const PinBadge = styled.div<{ $earned: boolean }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  background: ${(props) => (props.$earned ? props.theme.colors.success : props.theme.colors.secondary)};
  color: white;
`

const RequirementGroup = styled.div`
  margin-bottom: 1rem;
`

const RequirementTitle = styled.h4`
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
`

const RequirementList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

const RequirementItem = styled.li<{ $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 4px;
  background: ${(props) => (props.$completed ? `${props.theme.colors.success}20` : `${props.theme.colors.surface}`)};
  border: 1px solid ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.border)};
`

const StatusIcon = styled.div<{ $completed: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.secondary)};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
`

const RequirementText = styled.span<{ $completed: boolean }>`
  color: ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.text)};
  font-weight: ${(props) => (props.$completed ? 'bold' : 'normal')};
`

const ProgressBar = styled.div`
  margin-top: 1rem;
`

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: ${(props) => props.theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
`

const ProgressBarFill = styled.div<{ progress: number }>`
  width: ${(props) => props.progress}%;
  height: 100%;
  background: linear-gradient(
    90deg,
    ${(props) => props.theme.colors.primary},
    ${(props) => props.theme.colors.success}
  );
  transition: width 0.3s ease;
`

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textSecondary};
`

interface SpaceWarfarePinTrackerProps {
  courseData: ParsedCourseData
  userProgress: UserProgress
}

interface PinRequirement {
  id: string
  name: string
  courseCode?: string
  type: 'course' | 'department_choice'
  completed: boolean
  level?: string
  departments?: string[]
  minimum?: number
  satisfied?: number
}

interface PinProgress {
  name: string
  type: 'OSWP' | 'ESWP'
  earned: boolean
  requirements: PinRequirement[]
  overallProgress: number
}

export const SpaceWarfarePinTracker: React.FC<SpaceWarfarePinTrackerProps> = ({ courseData, userProgress }) => {
  // RMN OSWP Requirements
  const calculateOSWPProgress = (): PinProgress => {
    const requirements: PinRequirement[] = [
      {
        id: 'maa-c',
        name: 'Master-at-Arms Advanced Specialist',
        courseCode: 'SIA-SRN-31C',
        type: 'course',
        completed: userProgress.completedCourses.has('SIA-SRN-31C')
      },
      {
        id: 'personnelman-c',
        name: 'Personnelman Advanced Specialist',
        courseCode: 'SIA-SRN-01C',
        type: 'course',
        completed: userProgress.completedCourses.has('SIA-SRN-01C')
      },
      {
        id: 'dept-choice',
        name: "Department Choice (1 'D' level from 4 of 5 departments)",
        type: 'department_choice',
        departments: ['Astrogation', 'Flight Operations', 'Tactical', 'Engineering', 'Communications'],
        minimum: 4,
        level: 'D',
        completed: false,
        satisfied: 0
      }
    ]

    // Calculate department choice progress
    const deptRequirement = requirements.find((r) => r.id === 'dept-choice')!
    const departmentCourses = {
      Astrogation: ['SIA-SRN-05D', 'SIA-SRN-06D', 'SIA-SRN-07D', 'SIA-SRN-35D'],
      'Flight Operations': ['SIA-SRN-05D'],
      Tactical: [
        'SIA-SRN-08D',
        'SIA-SRN-09D',
        'SIA-SRN-10D',
        'SIA-SRN-27D',
        'SIA-SRN-28D',
        'SIA-SRN-29D',
        'SIA-SRN-32D'
      ],
      Engineering: ['SIA-SRN-14D', 'SIA-SRN-15D', 'SIA-SRN-16D', 'SIA-SRN-17D', 'SIA-SRN-18D', 'SIA-SRN-19D'],
      Communications: ['SIA-SRN-11D', 'SIA-SRN-12D', 'SIA-SRN-13D']
    }

    let satisfiedDepartments = 0
    Object.entries(departmentCourses).forEach(([dept, courses]) => {
      const hasAnyCourse = courses.some((course) => userProgress.completedCourses.has(course))
      if (hasAnyCourse) {
        satisfiedDepartments++
      }
    })

    deptRequirement.satisfied = satisfiedDepartments
    deptRequirement.completed = satisfiedDepartments >= 4

    const completedRequirements = requirements.filter((r) => r.completed).length
    const overallProgress = (completedRequirements / requirements.length) * 100

    return {
      name: 'Officer Space Warfare Pin (OSWP)',
      type: 'OSWP',
      earned: requirements.every((r) => r.completed),
      requirements,
      overallProgress
    }
  }

  // RMN ESWP Requirements
  const calculateESWPProgress = (): PinProgress => {
    const requirements: PinRequirement[] = [
      {
        id: 'personnelman-a',
        name: 'Personnelman Specialist',
        courseCode: 'SIA-SRN-01A',
        type: 'course',
        completed: userProgress.completedCourses.has('SIA-SRN-01A')
      },
      {
        id: 'yeoman-a',
        name: 'Yeoman Specialist',
        courseCode: 'SIA-SRN-04A',
        type: 'course',
        completed: userProgress.completedCourses.has('SIA-SRN-04A')
      },
      {
        id: 'dept-choice',
        name: "Department Choice (1 'C' level from 3 of 5 departments)",
        type: 'department_choice',
        departments: ['Astrogation', 'Flight Operations', 'Tactical', 'Engineering', 'Communications'],
        minimum: 3,
        level: 'C',
        completed: false,
        satisfied: 0
      }
    ]

    // Calculate department choice progress
    const deptRequirement = requirements.find((r) => r.id === 'dept-choice')!
    const departmentCourses = {
      Astrogation: ['SIA-SRN-05C', 'SIA-SRN-06C', 'SIA-SRN-07C', 'SIA-SRN-35C'],
      'Flight Operations': ['SIA-SRN-05C'],
      Tactical: [
        'SIA-SRN-08C',
        'SIA-SRN-09C',
        'SIA-SRN-10C',
        'SIA-SRN-27C',
        'SIA-SRN-28C',
        'SIA-SRN-29C',
        'SIA-SRN-32C'
      ],
      Engineering: ['SIA-SRN-14C', 'SIA-SRN-15C', 'SIA-SRN-16C', 'SIA-SRN-17C', 'SIA-SRN-18C', 'SIA-SRN-19C'],
      Communications: ['SIA-SRN-11C', 'SIA-SRN-12C', 'SIA-SRN-13C']
    }

    let satisfiedDepartments = 0
    Object.entries(departmentCourses).forEach(([dept, courses]) => {
      const hasAnyCourse = courses.some((course) => userProgress.completedCourses.has(course))
      if (hasAnyCourse) {
        satisfiedDepartments++
      }
    })

    deptRequirement.satisfied = satisfiedDepartments
    deptRequirement.completed = satisfiedDepartments >= 3

    const completedRequirements = requirements.filter((r) => r.completed).length
    const overallProgress = (completedRequirements / requirements.length) * 100

    return {
      name: 'Enlisted Space Warfare Pin (ESWP)',
      type: 'ESWP',
      earned: requirements.every((r) => r.completed),
      requirements,
      overallProgress
    }
  }

  const oswpProgress = calculateOSWPProgress()
  const eswpProgress = calculateESWPProgress()

  const renderRequirement = (req: PinRequirement) => {
    if (req.type === 'course') {
      return (
        <RequirementItem key={req.id} $completed={req.completed}>
          <StatusIcon $completed={req.completed}>{req.completed ? '✓' : '○'}</StatusIcon>
          <RequirementText $completed={req.completed}>
            {req.name} ({req.courseCode})
          </RequirementText>
        </RequirementItem>
      )
    } else if (req.type === 'department_choice') {
      return (
        <RequirementItem key={req.id} $completed={req.completed}>
          <StatusIcon $completed={req.completed}>{req.completed ? '✓' : `${req.satisfied}/${req.minimum}`}</StatusIcon>
          <RequirementText $completed={req.completed}>
            {req.name} - Progress: {req.satisfied}/{req.minimum} departments
          </RequirementText>
        </RequirementItem>
      )
    }
    return null
  }

  const renderPinSection = (progress: PinProgress) => (
    <PinSection key={progress.type}>
      <PinTitle>
        <PinIcon>{progress.type === 'OSWP' ? 'O' : 'E'}</PinIcon>
        {progress.name}
        <PinBadge $earned={progress.earned}>{progress.earned ? 'EARNED' : 'IN PROGRESS'}</PinBadge>
      </PinTitle>

      <RequirementGroup>
        <RequirementTitle>Requirements:</RequirementTitle>
        <RequirementList>{progress.requirements.map(renderRequirement)}</RequirementList>
      </RequirementGroup>

      <ProgressBar>
        <ProgressBarContainer>
          <ProgressBarFill progress={progress.overallProgress} />
        </ProgressBarContainer>
        <ProgressText>
          <span>Overall Progress</span>
          <span>{Math.round(progress.overallProgress)}%</span>
        </ProgressText>
      </ProgressBar>
    </PinSection>
  )

  return (
    <TrackerContainer>
      <TrackerHeader>
        <PinIcon>★</PinIcon>
        RMN Space Warfare Pin Progress
      </TrackerHeader>
      <TrackerContent>
        {renderPinSection(oswpProgress)}
        {renderPinSection(eswpProgress)}
      </TrackerContent>
    </TrackerContainer>
  )
}
