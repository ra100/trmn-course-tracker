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
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 6px;
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
  margin-bottom: 1rem;
  background: ${(props) => props.theme.colors.surface};
  border-radius: 4px;
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
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
`

const RequirementList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

const RequirementItem = styled.li<{ $completed: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 4px;
  background: ${(props) => (props.$completed ? `${props.theme.colors.success}10` : `${props.theme.colors.background}`)};
  border: 1px solid ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.border)};
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: ${(props) => (props.$completed ? `${props.theme.colors.success}20` : `${props.theme.colors.border}20`)};
  }

  &:last-child {
    margin-bottom: 0;
  }
`

const StatusIcon = styled.div<{ $completed: boolean }>`
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
  border-radius: 50%;
  background: ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.secondary)};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  flex-shrink: 0;
  border: 1px solid ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.border)};
`

const RequirementText = styled.span<{ $completed: boolean }>`
  color: ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.text)};
  font-weight: ${(props) => (props.$completed ? '600' : 'normal')};
  line-height: 1.3;
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
`

const DepartmentList = styled.div`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-top: 0.25rem;
  font-style: italic;
`

const FlexContainer = styled.div`
  flex: 1;
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

// Helper function to extract level from course code
const extractLevelFromCourseCode = (courseCode: string): string | undefined => {
  const match = courseCode.match(/([ACDW])$/)
  return match ? match[1] : undefined
}

// Helper function to extract unique departments from course data with normalization
const extractDepartmentsFromCourses = (courseData: ParsedCourseData): string[] => {
  const departments = new Set<string>()

  courseData.courses.forEach((course) => {
    // Extract primary department names from sections
    if (course.section) {
      departments.add(course.section)
    }

    // Extract normalized department names from subsections
    if (course.subsection) {
      // Normalize common department patterns
      const normalizedDept = normalizeDepartmentName(course.subsection)
      if (normalizedDept) {
        departments.add(normalizedDept)
      }
    }

    // Use explicit department assignments if available
    if (course.departments) {
      course.departments.forEach((dept) => departments.add(dept))
    }
    if (course.primaryDepartment) {
      departments.add(course.primaryDepartment)
    }
  })

  return Array.from(departments).sort()
}

// Helper function to normalize department names for better matching
const normalizeDepartmentName = (name: string): string | null => {
  const nameMapping: { [pattern: string]: string } = {
    'flight operations': 'Flight Operations',
    tactical: 'Tactical',
    astrogation: 'Astrogation',
    engineering: 'Engineering',
    communications: 'Communications',
    'fire control': 'Tactical',
    'electronic warfare': 'Tactical',
    'power systems': 'Engineering',
    weapons: 'Tactical'
  }

  const nameLower = name.toLowerCase()
  for (const [pattern, standardName] of Object.entries(nameMapping)) {
    if (nameLower.includes(pattern)) {
      return standardName
    }
  }

  return null
}

// Helper function to check if a course belongs to a department using parsed data
const courseMatchesDepartment = (course: any, department: string, allDepartments: string[]): boolean => {
  const deptLower = department.toLowerCase()

  // 1. Check explicit department assignments first (most reliable)
  if (course.primaryDepartment && course.primaryDepartment.toLowerCase() === deptLower) {
    return true
  }
  if (course.departments && course.departments.some((d: string) => d.toLowerCase() === deptLower)) {
    return true
  }

  // 2. Check normalized subsection names
  if (course.subsection) {
    const normalizedDept = normalizeDepartmentName(course.subsection)
    if (normalizedDept && normalizedDept.toLowerCase() === deptLower) {
      return true
    }
  }

  // 3. Check direct section/subsection matches as fallback
  const sectionLower = course.section.toLowerCase()
  const subsectionLower = course.subsection.toLowerCase()

  // Direct subsection match
  if (subsectionLower.includes(deptLower)) {
    return true
  }

  // Direct section match (if no more specific subsection match)
  if (sectionLower.includes(deptLower)) {
    const hasMoreSpecificSubsectionMatch = allDepartments.some(
      (dept) => dept.toLowerCase() !== deptLower && subsectionLower.includes(dept.toLowerCase())
    )
    return !hasMoreSpecificSubsectionMatch
  }

  return false
}

// Helper function to find courses by department and level using only parsed data
const findCoursesByDepartmentAndLevel = (
  courseData: ParsedCourseData,
  departments: string[],
  level: string
): string[] => {
  const allDepartments = extractDepartmentsFromCourses(courseData)

  return courseData.courses
    .filter((course) => {
      // Check if course level matches
      const courseLevel = course.level || extractLevelFromCourseCode(course.code)
      if (courseLevel !== level) return false

      // Check if course belongs to any of the specified departments
      return departments.some((dept) => courseMatchesDepartment(course, dept, allDepartments))
    })
    .map((course) => course.code)
}

// Helper function to calculate department choice progress
const calculateDepartmentProgress = (
  courseData: ParsedCourseData,
  userProgress: UserProgress,
  requirement: PinRequirement
): { satisfied: number; completed: boolean } => {
  if (!requirement.departments || !requirement.level) {
    return { satisfied: 0, completed: false }
  }

  const allDepartments = extractDepartmentsFromCourses(courseData)
  const departmentCourses = findCoursesByDepartmentAndLevel(courseData, requirement.departments, requirement.level)
  const departmentGroups: { [dept: string]: string[] } = {}

  // Group courses by department using only parsed data
  requirement.departments.forEach((dept: string) => {
    departmentGroups[dept] = departmentCourses.filter((courseCode) => {
      const course = courseData.courseMap.get(courseCode)
      return course ? courseMatchesDepartment(course, dept, allDepartments) : false
    })
  })

  // Count satisfied departments
  let satisfiedDepartments = 0
  Object.entries(departmentGroups).forEach(([dept, courses]) => {
    const hasAnyCourse = courses.some((course) => userProgress.completedCourses.has(course))
    if (hasAnyCourse) {
      satisfiedDepartments++
    }
  })

  return {
    satisfied: satisfiedDepartments,
    completed: satisfiedDepartments >= (requirement.minimum || 0)
  }
}

// Generic function to calculate pin progress for any pin type
const calculatePinProgress = (
  courseData: ParsedCourseData,
  userProgress: UserProgress,
  pinType: 'OSWP' | 'ESWP'
): PinProgress => {
  const pinNames = {
    OSWP: 'Officer Space Warfare Pin (OSWP)',
    ESWP: 'Enlisted Space Warfare Pin (ESWP)'
  }

  // Find pin rule from parsed special rules
  const pinRule = courseData.specialRules.find((rule) => rule.type === pinType && rule.branch === 'RMN')

  if (!pinRule) {
    console.log(`No ${pinType} rule found in specialRules`)
    return {
      name: pinNames[pinType],
      type: pinType,
      earned: false,
      requirements: [
        {
          id: 'fallback-info',
          name: `No ${pinType} requirements found in course data. Please check if the course data includes Space Warfare Pin rules.`,
          type: 'course' as const,
          completed: false
        }
      ],
      overallProgress: 0
    }
  }

  const requirements: PinRequirement[] = []

  // Convert parsed requirements to our format
  pinRule.requirements.forEach((req, index) => {
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
      const baseRequirement: PinRequirement = {
        id: `dept-choice-${index}`,
        name: req.description || `Department Choice (${req.minimum} of ${req.totalOptions} departments)`,
        type: 'department_choice',
        departments: req.departments,
        minimum: req.minimum,
        level: req.level,
        completed: false,
        satisfied: 0,
        description: req.description
      }

      // Calculate progress for this department choice requirement
      const progress = calculateDepartmentProgress(courseData, userProgress, baseRequirement)
      baseRequirement.satisfied = progress.satisfied
      baseRequirement.completed = progress.completed

      requirements.push(baseRequirement)
    }
  })

  const completedRequirements = requirements.filter((r) => r.completed).length
  const overallProgress = requirements.length > 0 ? (completedRequirements / requirements.length) * 100 : 0

  return {
    name: pinNames[pinType],
    type: pinType,
    earned: requirements.length > 0 && requirements.every((r) => r.completed),
    requirements,
    overallProgress
  }
}

export const SpaceWarfarePinTracker: React.FC<SpaceWarfarePinTrackerProps> = ({ courseData, userProgress }) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    OSWP: false,
    ESWP: false
  })

  // Debug: Log the data being received
  console.debug('SpaceWarfarePinTracker - courseData.specialRules:', courseData.specialRules)
  console.debug('SpaceWarfarePinTracker - userProgress:', userProgress)

  const toggleSection = (sectionType: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionType]: !prev[sectionType]
    }))
  }

  const oswpProgress = calculatePinProgress(courseData, userProgress, 'OSWP')
  const eswpProgress = calculatePinProgress(courseData, userProgress, 'ESWP')

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
          <FlexContainer>
            <RequirementText $completed={req.completed}>
              {displayText} - Progress: {req.satisfied}/{req.minimum} departments
            </RequirementText>
            {req.departments && req.departments.length > 0 && (
              <DepartmentList>Available departments: {req.departments.join(', ')}</DepartmentList>
            )}
          </FlexContainer>
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
