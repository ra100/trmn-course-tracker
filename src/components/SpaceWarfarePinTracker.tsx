import React, { useState } from 'react'
import styled from 'styled-components'
import { ParsedCourseData, UserProgress } from '../types'

const TrackerContainer = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.colors.border};
  box-shadow: ${(props) => props.theme.shadows.medium};
  margin: 1rem;
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
  border-radius: 8px 8px 0 0;
`

const PinIcon = styled.div`
  width: 28px;
  height: 28px;
  background: gold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #000;
  font-weight: bold;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`

const TrackerContent = styled.div`
  padding: 1rem;
  overflow: visible;
`

const PinSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  background: ${(props) => props.theme.colors.background};
  overflow: visible;

  &:last-child {
    margin-bottom: 0;
  }
`

const PinTitle = styled.h3`
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 1rem 0;
  font-size: 1rem;
  display: flex;
  flex-flow: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.border}40;
  }
`

const PinBadge = styled.div<{ $earned: boolean }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  background: ${(props) => (props.$earned ? props.theme.colors.success : props.theme.colors.secondary)};
  color: white;
`

const RequirementGroup = styled.div<{ $expanded: boolean }>`
  margin-bottom: 1.5rem;
  background: ${(props) => props.theme.colors.surface};
  border-radius: 6px;
  overflow: visible;
  max-height: ${(props) => (props.$expanded ? 'none' : '0')};
  opacity: ${(props) => (props.$expanded ? '1' : '0')};
  transition: all 0.3s ease;

  ${(props) =>
    !props.$expanded &&
    `
    margin-bottom: 0;
    pointer-events: none;
  `}
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
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  background: ${(props) => (props.$completed ? `${props.theme.colors.success}15` : `${props.theme.colors.background}`)};
  border: 1px solid ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.border)};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
`

const StatusIcon = styled.div<{ $completed: boolean }>`
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  border-radius: 50%;
  background: ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.secondary)};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  flex-shrink: 0;
  border: 2px solid ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.border)};
`

const RequirementText = styled.span<{ $completed: boolean }>`
  color: ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.text)};
  font-weight: ${(props) => (props.$completed ? '600' : 'normal')};
  line-height: 1.4;
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
`

const PinHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const ProgressBar = styled.div`
  margin-top: 1rem;
`

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 10px;
  background: ${(props) => props.theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
`

const ProgressBarFill = styled.div<{ progress: number }>`
  width: ${(props) => props.progress}%;
  height: 100%;
  background: linear-gradient(
    90deg,
    ${(props) => props.theme.colors.primary},
    ${(props) => props.theme.colors.success}
  );
  border-radius: 8px;
  transition: width 0.5s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textSecondary};
`

const ExpandIcon = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  width: 20px;
  min-height: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${(props) => props.theme.colors.primary};
  color: white;
  font-size: 0.8rem;
  margin-left: auto;
  transform: rotate(${(props) => (props.$expanded ? '180deg' : '0deg')});
  transition: transform 0.3s ease;
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
  description?: string
}

interface PinProgress {
  name: string
  type: 'OSWP' | 'ESWP'
  earned: boolean
  requirements: PinRequirement[]
  overallProgress: number
}

export const SpaceWarfarePinTracker: React.FC<SpaceWarfarePinTrackerProps> = ({ courseData, userProgress }) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    OSWP: true,
    ESWP: true
  })

  // Debug: Log the data being received
  console.log('SpaceWarfarePinTracker - courseData.specialRules:', courseData.specialRules)
  console.log('SpaceWarfarePinTracker - userProgress:', userProgress)

  const toggleSection = (sectionType: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionType]: !prev[sectionType]
    }))
  }
  // Helper function to extract level from course code
  const extractLevelFromCourseCode = (courseCode: string): string | undefined => {
    const match = courseCode.match(/([ACDW])$/)
    return match ? match[1] : undefined
  }

  // Helper function to find courses by department and level
  const findCoursesByDepartmentAndLevel = (departments: string[], level: string): string[] => {
    const matchingCourses: string[] = []

    courseData.courses.forEach((course) => {
      // Check if course level matches (extract from course code)
      const courseLevel = course.level || extractLevelFromCourseCode(course.code)
      if (courseLevel === level) {
        // Check if course belongs to any of the specified departments
        // We can determine department by course section/subsection or by course code patterns
        const belongsToDepartment = departments.some((dept) => {
          // Check section/subsection names
          const sectionMatch = course.section.toLowerCase().includes(dept.toLowerCase())
          const subsectionMatch = course.subsection.toLowerCase().includes(dept.toLowerCase())

          // Also check for specific course code patterns that indicate department
          let codeMatch = false
          // Special handling for SRN-05 codes to avoid double counting
          if (dept === 'Flight Operations' && course.code.includes('SRN-05')) {
            // Flight Operations takes priority for SRN-05 codes
            codeMatch = course.subsection.toLowerCase().includes('flight operations')
          } else if (dept === 'Astrogation' && course.code.includes('SRN-05')) {
            // Astrogation only matches if NOT a Flight Operations course
            codeMatch = !course.subsection.toLowerCase().includes('flight operations')
          } else if (
            dept === 'Tactical' &&
            (course.code.includes('SRN-08') ||
              course.code.includes('SRN-09') ||
              course.code.includes('SRN-10') ||
              course.code.includes('SRN-27') ||
              course.code.includes('SRN-28') ||
              course.code.includes('SRN-29') ||
              course.code.includes('SRN-32'))
          )
            codeMatch = true
          if (
            dept === 'Engineering' &&
            (course.code.includes('SRN-14') ||
              course.code.includes('SRN-15') ||
              course.code.includes('SRN-16') ||
              course.code.includes('SRN-17') ||
              course.code.includes('SRN-18') ||
              course.code.includes('SRN-19'))
          )
            codeMatch = true
          if (
            dept === 'Communications' &&
            (course.code.includes('SRN-11') || course.code.includes('SRN-12') || course.code.includes('SRN-13'))
          )
            codeMatch = true

          return sectionMatch || subsectionMatch || codeMatch
        })

        if (belongsToDepartment) {
          matchingCourses.push(course.code)
        }
      }
    })

    return matchingCourses
  }

  // RMN OSWP Requirements from parsed data
  const calculateOSWPProgress = (): PinProgress => {
    // Find OSWP rule from parsed special rules
    const oswpRule = courseData.specialRules.find((rule) => rule.type === 'OSWP' && rule.branch === 'RMN')

    if (!oswpRule) {
      console.log('No OSWP rule found in specialRules')
      // Fallback to hardcoded if not found in parsed data
      return {
        name: 'Officer Space Warfare Pin (OSWP)',
        type: 'OSWP',
        earned: false,
        requirements: [
          {
            id: 'fallback-info',
            name: 'No OSWP requirements found in course data. Please check if the course data includes Space Warfare Pin rules.',
            type: 'course' as const,
            completed: false
          }
        ],
        overallProgress: 0
      }
    }

    const requirements: PinRequirement[] = []

    // Convert parsed requirements to our format
    oswpRule.requirements.forEach((req, index) => {
      if (req.type === 'course' && req.code) {
        const courseName = courseData.courseMap.get(req.code)?.name || `Course ${req.code}`
        requirements.push({
          id: `course-${index}`,
          name: courseName,
          courseCode: req.code,
          type: 'course',
          completed: userProgress.completedCourses.has(req.code)
        })
      } else if (req.type === 'department_choice') {
        requirements.push({
          id: `dept-choice-${index}`,
          name: req.description || `Department Choice (${req.minimum} of ${req.totalOptions} departments)`,
          type: 'department_choice',
          departments: req.departments,
          minimum: req.minimum,
          level: req.level,
          completed: false,
          satisfied: 0,
          description: req.description
        })
      }
    })

    // Calculate department choice progress
    requirements.forEach((req) => {
      if (req.type === 'department_choice' && req.departments && req.level) {
        const departmentCourses = findCoursesByDepartmentAndLevel(req.departments, req.level)
        const departmentGroups: { [dept: string]: string[] } = {}

        // Group courses by department
        req.departments.forEach((dept) => {
          departmentGroups[dept] = departmentCourses.filter((courseCode) => {
            const course = courseData.courseMap.get(courseCode)
            if (!course) return false

            // Use same logic as above to determine department
            const sectionMatch = course.section.toLowerCase().includes(dept.toLowerCase())
            const subsectionMatch = course.subsection.toLowerCase().includes(dept.toLowerCase())

            let codeMatch = false
            if (dept === 'Astrogation' && course.code.includes('SRN-05')) codeMatch = true
            if (dept === 'Flight Operations' && course.code.includes('SRN-05')) codeMatch = true
            if (
              dept === 'Tactical' &&
              (course.code.includes('SRN-08') ||
                course.code.includes('SRN-09') ||
                course.code.includes('SRN-10') ||
                course.code.includes('SRN-27') ||
                course.code.includes('SRN-28') ||
                course.code.includes('SRN-29') ||
                course.code.includes('SRN-32'))
            )
              codeMatch = true
            if (
              dept === 'Engineering' &&
              (course.code.includes('SRN-14') ||
                course.code.includes('SRN-15') ||
                course.code.includes('SRN-16') ||
                course.code.includes('SRN-17') ||
                course.code.includes('SRN-18') ||
                course.code.includes('SRN-19'))
            )
              codeMatch = true
            if (
              dept === 'Communications' &&
              (course.code.includes('SRN-11') || course.code.includes('SRN-12') || course.code.includes('SRN-13'))
            )
              codeMatch = true

            return sectionMatch || subsectionMatch || codeMatch
          })
        })

        let satisfiedDepartments = 0
        Object.entries(departmentGroups).forEach(([dept, courses]) => {
          const hasAnyCourse = courses.some((course) => userProgress.completedCourses.has(course))
          if (hasAnyCourse) {
            satisfiedDepartments++
          }
        })

        req.satisfied = satisfiedDepartments
        req.completed = satisfiedDepartments >= (req.minimum || 0)
      }
    })

    const completedRequirements = requirements.filter((r) => r.completed).length
    const overallProgress = requirements.length > 0 ? (completedRequirements / requirements.length) * 100 : 0

    return {
      name: 'Officer Space Warfare Pin (OSWP)',
      type: 'OSWP',
      earned: requirements.length > 0 && requirements.every((r) => r.completed),
      requirements,
      overallProgress
    }
  }

  // RMN ESWP Requirements from parsed data
  const calculateESWPProgress = (): PinProgress => {
    // Find ESWP rule from parsed special rules
    const eswpRule = courseData.specialRules.find((rule) => rule.type === 'ESWP' && rule.branch === 'RMN')

    if (!eswpRule) {
      console.log('No ESWP rule found in specialRules')
      // Fallback to hardcoded if not found in parsed data
      return {
        name: 'Enlisted Space Warfare Pin (ESWP)',
        type: 'ESWP',
        earned: false,
        requirements: [
          {
            id: 'fallback-info',
            name: 'No ESWP requirements found in course data. Please check if the course data includes Space Warfare Pin rules.',
            type: 'course' as const,
            completed: false
          }
        ],
        overallProgress: 0
      }
    }

    const requirements: PinRequirement[] = []

    // Convert parsed requirements to our format
    eswpRule.requirements.forEach((req, index) => {
      if (req.type === 'course' && req.code) {
        const courseName = courseData.courseMap.get(req.code)?.name || `Course ${req.code}`
        requirements.push({
          id: `course-${index}`,
          name: courseName,
          courseCode: req.code,
          type: 'course',
          completed: userProgress.completedCourses.has(req.code)
        })
      } else if (req.type === 'department_choice') {
        requirements.push({
          id: `dept-choice-${index}`,
          name: req.description || `Department Choice (${req.minimum} of ${req.totalOptions} departments)`,
          type: 'department_choice',
          departments: req.departments,
          minimum: req.minimum,
          level: req.level,
          completed: false,
          satisfied: 0,
          description: req.description
        })
      }
    })

    // Calculate department choice progress
    requirements.forEach((req) => {
      if (req.type === 'department_choice' && req.departments && req.level) {
        const departmentCourses = findCoursesByDepartmentAndLevel(req.departments, req.level)
        const departmentGroups: { [dept: string]: string[] } = {}

        // Group courses by department
        req.departments.forEach((dept) => {
          departmentGroups[dept] = departmentCourses.filter((courseCode) => {
            const course = courseData.courseMap.get(courseCode)
            if (!course) return false

            // Special priority matching to avoid double-counting courses
            // Priority: Flight Operations > Other code matches > Section > Subsection

            // 1. First check for Flight Operations with SRN-05 codes
            if (dept === 'Flight Operations' && course.code.includes('SRN-05')) {
              return course.subsection.toLowerCase().includes('flight operations')
            }

            // 2. Then check other department code patterns (excluding Astrogation SRN-05)
            if (
              dept === 'Tactical' &&
              (course.code.includes('SRN-08') ||
                course.code.includes('SRN-09') ||
                course.code.includes('SRN-10') ||
                course.code.includes('SRN-27') ||
                course.code.includes('SRN-28') ||
                course.code.includes('SRN-29') ||
                course.code.includes('SRN-32'))
            ) {
              return true
            }

            if (
              dept === 'Engineering' &&
              (course.code.includes('SRN-14') ||
                course.code.includes('SRN-15') ||
                course.code.includes('SRN-16') ||
                course.code.includes('SRN-17') ||
                course.code.includes('SRN-18') ||
                course.code.includes('SRN-19'))
            ) {
              return true
            }

            if (
              dept === 'Communications' &&
              (course.code.includes('SRN-11') || course.code.includes('SRN-12') || course.code.includes('SRN-13'))
            ) {
              return true
            }

            // 3. Check section match (but not for Astrogation SRN-05 courses)
            if (course.section.toLowerCase().includes(dept.toLowerCase())) {
              // Don't match Astrogation for SRN-05 courses that are Flight Operations
              if (
                dept === 'Astrogation' &&
                course.code.includes('SRN-05') &&
                course.subsection.toLowerCase().includes('flight operations')
              ) {
                return false
              }
              return true
            }

            // 4. Check subsection match only if not already matched by section
            if (course.subsection.toLowerCase().includes(dept.toLowerCase())) {
              return true
            }

            return false
          })
        })

        let satisfiedDepartments = 0
        Object.entries(departmentGroups).forEach(([dept, courses]) => {
          const hasAnyCourse = courses.some((course) => userProgress.completedCourses.has(course))
          if (hasAnyCourse) {
            satisfiedDepartments++
          }
        })

        req.satisfied = satisfiedDepartments
        req.completed = satisfiedDepartments >= (req.minimum || 0)
      }
    })

    const completedRequirements = requirements.filter((r) => r.completed).length
    const overallProgress = requirements.length > 0 ? (completedRequirements / requirements.length) * 100 : 0

    return {
      name: 'Enlisted Space Warfare Pin (ESWP)',
      type: 'ESWP',
      earned: requirements.length > 0 && requirements.every((r) => r.completed),
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
      // Format the text to match test expectations
      const displayText = req.name.startsWith('Department Choice')
        ? req.name
        : `Department Choice - ${req.description || req.name}`

      return (
        <RequirementItem key={req.id} $completed={req.completed}>
          <StatusIcon $completed={req.completed}>{req.completed ? '✓' : `${req.satisfied}/${req.minimum}`}</StatusIcon>
          <RequirementText $completed={req.completed}>
            {displayText} - Progress: {req.satisfied}/{req.minimum} departments
          </RequirementText>
        </RequirementItem>
      )
    }
    return null
  }

  const renderPinSection = (progress: PinProgress) => {
    const isExpanded = expandedSections[progress.type]

    return (
      <PinSection key={progress.type}>
        <PinTitle onClick={() => toggleSection(progress.type)}>
          <PinHeader>
            {progress.name}
            <ExpandIcon $expanded={isExpanded}>▼</ExpandIcon>
          </PinHeader>
          <PinBadge $earned={progress.earned}>{progress.earned ? 'EARNED' : 'IN PROGRESS'}</PinBadge>
        </PinTitle>

        <RequirementGroup $expanded={isExpanded}>
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
  }

  return (
    <TrackerContainer>
      <TrackerHeader>
        <PinIcon>★</PinIcon>
        Space Warfare Pin
      </TrackerHeader>
      <TrackerContent>
        {renderPinSection(oswpProgress)}
        {renderPinSection(eswpProgress)}
      </TrackerContent>
    </TrackerContainer>
  )
}
