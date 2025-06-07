import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { ParsedCourseData, UserProgress, Course, FilterOptions, UserSettings, NodeStatus } from '../types'
import { EligibilityEngine } from '../utils/eligibilityEngine'
import { useT } from '../i18n'

// Helper function to normalize department names for better matching
const normalizeDepartmentName = (name: string): string | null => {
  const nameMapping: { [pattern: string]: string } = {
    // Primary TRMN Departments
    medical: 'Medical',
    astrogation: 'Astrogation',
    communications: 'Communications',
    engineering: 'Engineering',
    tactical: 'Tactical',
    command: 'Command',
    administration: 'Administration',
    logistics: 'Logistics',

    // Specific schools/specialties that map to departments
    'flight operations': 'Flight Operations', // Special case: separate from Astrogation for SWP
    'fire control': 'Tactical',
    'electronic warfare': 'Tactical',
    tracking: 'Tactical',
    sensor: 'Tactical',
    missile: 'Tactical',
    'beam weapons': 'Tactical',
    gunner: 'Tactical',
    weapons: 'Tactical',

    // Engineering subcategories
    impeller: 'Engineering',
    power: 'Engineering',
    gravitics: 'Engineering',
    environmental: 'Engineering',
    hydroponics: 'Engineering',
    'damage control': 'Engineering',

    // Communications subcategories
    'data systems': 'Communications',
    electronics: 'Communications',

    // Astrogation subcategories
    helmsman: 'Astrogation',
    plotting: 'Astrogation',
    quartermaster: 'Astrogation',

    // Medical subcategories
    corpsman: 'Medical',
    'sick berth': 'Medical',
    surgeon: 'Medical',

    // Command subcategories
    boatswain: 'Command',
    'master-at-arms': 'Command',
    'master at arms': 'Command',
    operations: 'Command',
    intelligence: 'Command',

    // Administration subcategories
    personnelman: 'Administration',
    yeoman: 'Administration',
    'navy counselor': 'Administration',
    legalman: 'Administration',
    disbursing: 'Administration',
    postal: 'Administration',
    "ship's serviceman": 'Administration',
    steward: 'Administration'
  }

  const nameLower = name.toLowerCase()
  for (const [pattern, standardName] of Object.entries(nameMapping)) {
    if (nameLower.includes(pattern)) {
      return standardName
    }
  }

  return null
}

// Helper function to map section names to departments when normalization fails
const mapSectionToDepartment = (sectionName: string): string | null => {
  if (!sectionName) return null

  const sectionLower = sectionName.toLowerCase()

  // Map common section patterns to departments
  if (sectionLower.includes('medical')) return 'Medical'
  if (sectionLower.includes('tactical')) return 'Tactical'
  if (sectionLower.includes('engineering')) return 'Engineering'
  if (sectionLower.includes('communication')) return 'Communications'
  if (sectionLower.includes('astrogation')) return 'Astrogation'
  if (sectionLower.includes('command')) return 'Command'
  if (sectionLower.includes('administration')) return 'Administration'
  if (sectionLower.includes('logistics')) return 'Logistics'

  // SINA TSC sections
  if (sectionLower.includes('sina tsc medical')) return 'Medical'
  if (sectionLower.includes('sina tsc tactical')) return 'Tactical'
  if (sectionLower.includes('sina tsc engineering')) return 'Engineering'
  if (sectionLower.includes('sina tsc communications')) return 'Communications'
  if (sectionLower.includes('sina tsc astrogation')) return 'Astrogation'
  if (sectionLower.includes('sina tsc command')) return 'Command'
  if (sectionLower.includes('sina tsc administration')) return 'Administration'

  return null
}

// Helper function to check if a course belongs to a department
const courseMatchesDepartment = (course: Course, department: string): boolean => {
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

  // Direct matches
  return sectionLower.includes(deptLower) || subsectionLower.includes(deptLower)
}

const TreeContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: ${(props) => props.theme.colors.background};
  overflow: auto;
`

const CategorySection = styled.div`
  margin: 2rem;
  background: ${(props) => props.theme.colors.surface};
  border-radius: 8px;
  box-shadow: ${(props) => props.theme.shadows.medium};
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colors.border};

  @media (max-width: 768px) {
    margin: 1rem;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    margin: 0.5rem;
    border-radius: 4px;
  }
`

const CategoryHeader = styled.div`
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary},
    ${(props) => props.theme.colors.primaryHover}
  );
  color: white;
  padding: 1rem;
  font-weight: bold;
  font-size: 1.1rem;
`

const SubsectionContainer = styled.div`
  padding: 1rem;
`

const SubsectionHeader = styled.div`
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${(props) => props.theme.colors.borderLight};
`

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }
`

const CourseNode = styled.div<{ status: NodeStatus }>`
  background: ${(props) => {
    switch (props.status) {
      case 'completed':
        return `linear-gradient(135deg, ${props.theme.colors.courseCompleted}, #22543d)`
      case 'waiting_grade':
        return `linear-gradient(135deg, #d69e2e, #b7791f)`
      case 'in_progress':
        return `linear-gradient(135deg, #38b2ac, #2c7a7b)`
      case 'available':
        return `linear-gradient(135deg, ${props.theme.colors.courseAvailable}, #1a365d)`
      case 'locked':
        return `linear-gradient(135deg, ${props.theme.colors.courseLocked}, ${props.theme.colors.secondary})`
      default:
        return `linear-gradient(135deg, ${props.theme.colors.error}, #c53030)`
    }
  }};
  color: white;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: ${(props) => props.theme.shadows.small};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadows.large};
    filter: brightness(1.1);
  }

  ${(props) =>
    props.status === 'locked' &&
    `
    cursor: not-allowed;
    opacity: 0.6;
  `}

  @media (max-width: 768px) {
    padding: 1.2rem;
    margin-bottom: 0.5rem;

    &:hover {
      transform: none;
    }

    &:active {
      transform: scale(0.98);
    }
  }

  @media (max-width: 480px) {
    padding: 1rem;
    font-size: 0.9rem;
  }
`

const CourseCode = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
`

const CourseName = styled.div`
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.3;
  margin-bottom: 0.5rem;
`

const CourseLevel = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
`

const Prerequisites = styled.div`
  font-size: 0.8rem;
  opacity: 0.9;
  margin-top: 0.5rem;
`

const StatusIcon = styled.div<{ status: NodeStatus }>`
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${(props) => {
    switch (props.status) {
      case 'completed':
        return '#fff'
      case 'waiting_grade':
        return 'rgba(255,255,255,0.9)'
      case 'in_progress':
        return 'rgba(255,255,255,0.9)'
      case 'available':
        return 'rgba(255,255,255,0.3)'
      case 'locked':
        return 'rgba(255,255,255,0.1)'
      default:
        return 'rgba(255,255,255,0.2)'
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: ${(props) => (props.status === 'completed' ? props.theme.colors.success : 'white')};

  &::after {
    content: '${(props) => {
      switch (props.status) {
        case 'completed':
          return '✓'
        case 'waiting_grade':
          return '⏳'
        case 'in_progress':
          return '📚'
        case 'available':
          return '○'
        case 'locked':
          return '●'
        default:
          return '!'
      }
    }}';
  }
`

const SearchContainer = styled.div`
  padding: 1rem;
  background: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(99, 179, 237, 0.2);
  }
`

const StatsContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.8rem;
  }

  @media (max-width: 480px) {
    gap: 0.3rem;
    padding: 0.5rem;
  }
`

const StatItem = styled.div`
  text-align: center;
  flex: 1;
`

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
`

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textSecondary};
`

const GroupingToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};

  @media (max-width: 768px) {
    padding: 0.8rem 1rem;
    gap: 0.8rem;
  }

  @media (max-width: 480px) {
    gap: 0.5rem;
    padding: 0.8rem;
  }
`

const GroupingButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  background: ${(props) => (props.$active ? props.theme.colors.primary : props.theme.colors.background)};
  color: ${(props) => (props.$active ? 'white' : props.theme.colors.text)};
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.$active ? props.theme.colors.primaryHover : props.theme.colors.surface)};
  }
`

const GroupingLabel = styled.span`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.text};
  font-weight: 500;
`

interface SkillTreeViewProps {
  courseData: ParsedCourseData
  userProgress: UserProgress
  filters: FilterOptions
  settings: UserSettings
  eligibilityEngine: EligibilityEngine
  onCourseSelect: (course: Course) => void
  onCourseToggle: (courseCode: string) => void
  onCourseStatusChange: (
    courseCode: string,
    status: 'available' | 'in_progress' | 'waiting_grade' | 'completed'
  ) => void
}

export const SkillTreeView: React.FC<SkillTreeViewProps> = ({
  courseData,
  userProgress,
  filters,
  settings,
  eligibilityEngine,
  onCourseSelect,
  onCourseToggle,
  onCourseStatusChange
}) => {
  const t = useT()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [groupingMode, setGroupingMode] = useState<'section' | 'department'>('section')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updated = eligibilityEngine.updateCourseAvailability(userProgress)
    const filtered = applyFilters(updated)
    setFilteredCourses(filtered)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseData, userProgress, filters, settings, searchTerm, eligibilityEngine])

  const applyFilters = (courses: Course[]): Course[] => {
    return courses.filter((course) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          course.name.toLowerCase().includes(searchLower) ||
          course.code.toLowerCase().includes(searchLower) ||
          course.section.toLowerCase().includes(searchLower) ||
          course.subsection.toLowerCase().includes(searchLower)

        if (!matchesSearch) return false
      }

      // Section filter
      if (filters.sections && filters.sections.length > 0) {
        if (!filters.sections.includes(course.section)) return false
      }

      // Department filter
      if (filters.departments && filters.departments.length > 0) {
        // Use same logic as department grouping to determine course's department
        let courseDepartment: string
        if (course.primaryDepartment) {
          courseDepartment = course.primaryDepartment
        } else if (course.departments && course.departments.length > 0) {
          courseDepartment = course.departments[0]
        } else {
          const normalizedFromSubsection = course.subsection ? normalizeDepartmentName(course.subsection) : null
          if (normalizedFromSubsection) {
            courseDepartment = normalizedFromSubsection
          } else {
            const normalizedFromSection = course.section ? normalizeDepartmentName(course.section) : null
            if (normalizedFromSection) {
              courseDepartment = normalizedFromSection
            } else {
              courseDepartment = mapSectionToDepartment(course.section) || 'Other'
            }
          }
        }

        if (!filters.departments.includes(courseDepartment)) return false
      }

      // Level filter
      if (filters.levels && filters.levels.length > 0) {
        if (!course.level || !filters.levels.includes(course.level)) return false
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        const courseStatus = getCourseStatus(course)
        if (!filters.status.includes(courseStatus)) return false
      }

      // Settings-based filters
      if (!settings.showCompleted && course.completed) return false
      if (!settings.showUnavailable && !course.available && !course.completed) return false

      return true
    })
  }

  const getCourseStatus = (course: Course): NodeStatus => {
    if (course.completed) return 'completed'
    if (userProgress.waitingGradeCourses.has(course.code)) return 'waiting_grade'
    if (userProgress.inProgressCourses.has(course.code)) return 'in_progress'
    if (course.available) return 'available'
    return 'locked'
  }

  const handleCourseClick = (course: Course) => {
    onCourseSelect(course)
  }

  const handleCourseDoubleClick = (course: Course) => {
    if (course.available || course.completed) {
      onCourseToggle(course.code)
    }
  }

  const handleCourseRightClick = (e: React.MouseEvent, course: Course) => {
    e.preventDefault()
    if (
      !course.available &&
      !course.completed &&
      !userProgress.inProgressCourses.has(course.code) &&
      !userProgress.waitingGradeCourses.has(course.code)
    ) {
      return // Don't show context menu for locked courses
    }

    const contextMenu = document.createElement('div')
    contextMenu.style.position = 'fixed'
    contextMenu.style.left = `${e.clientX}px`
    contextMenu.style.top = `${e.clientY}px`
    contextMenu.style.background = 'white'
    contextMenu.style.border = '1px solid #ccc'
    contextMenu.style.borderRadius = '4px'
    contextMenu.style.padding = '8px'
    contextMenu.style.zIndex = '1000'
    contextMenu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
    contextMenu.style.minWidth = '120px'

    const options = [
      { label: t.courseStatus.available, value: 'available' as const },
      { label: t.courseStatus.inProgress, value: 'in_progress' as const },
      { label: t.courseStatus.waitingGrade, value: 'waiting_grade' as const },
      { label: t.courseStatus.completed, value: 'completed' as const }
    ]

    options.forEach((option) => {
      const item = document.createElement('div')
      item.textContent = option.label
      item.style.padding = '4px 8px'
      item.style.cursor = 'pointer'
      item.style.borderRadius = '2px'
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = '#f0f0f0'
      })
      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'transparent'
      })
      item.addEventListener('click', () => {
        onCourseStatusChange(course.code, option.value)
        document.body.removeChild(contextMenu)
      })
      contextMenu.appendChild(item)
    })

    const closeContextMenu = () => {
      if (document.body.contains(contextMenu)) {
        document.body.removeChild(contextMenu)
      }
      document.removeEventListener('click', closeContextMenu)
    }

    document.addEventListener('click', closeContextMenu)
    document.body.appendChild(contextMenu)
  }

  const getPrerequisiteText = (course: Course): string => {
    const prereqs = course.prerequisites
      .filter((p) => p.type === 'course' && p.code)
      .map((p) => p.code)
      .slice(0, 3)

    if (prereqs.length === 0) return 'No prerequisites'
    if (prereqs.length <= 3) return `Requires: ${prereqs.join(', ')}`
    return `Requires: ${prereqs.join(', ')}...`
  }

  const getStats = () => {
    const total = courseData.courses.length
    const completed = userProgress.completedCourses.size
    const available = filteredCourses.filter((c) => c.available).length

    return { total, completed, available }
  }

  const renderCoursesByCategory = () => {
    if (groupingMode === 'department') {
      return renderCoursesByDepartment()
    }

    const categorizedCourses = new Map<string, Map<string, Course[]>>()

    filteredCourses.forEach((course) => {
      if (!categorizedCourses.has(course.section)) {
        categorizedCourses.set(course.section, new Map())
      }

      const sectionMap = categorizedCourses.get(course.section)!
      const subsection = course.subsection || 'General'

      if (!sectionMap.has(subsection)) {
        sectionMap.set(subsection, [])
      }

      sectionMap.get(subsection)!.push(course)
    })

    return Array.from(categorizedCourses.entries()).map(([sectionName, subsections]) => (
      <CategorySection key={sectionName}>
        <CategoryHeader>{sectionName}</CategoryHeader>
        {Array.from(subsections.entries()).map(([subsectionName, courses]) => (
          <SubsectionContainer key={`${sectionName}-${subsectionName}`}>
            {subsectionName !== 'General' && <SubsectionHeader>{subsectionName}</SubsectionHeader>}
            <CourseGrid>
              {courses.map((course) => {
                const status = getCourseStatus(course)
                return (
                  <CourseNode
                    key={course.id}
                    status={status}
                    onClick={() => handleCourseClick(course)}
                    onDoubleClick={() => handleCourseDoubleClick(course)}
                    onContextMenu={(e) => handleCourseRightClick(e, course)}
                    title={`${t.courseActions.doubleClickToToggle} ${
                      course.completed
                        ? t.courseActions.markIncomplete.toLowerCase()
                        : t.courseActions.markComplete.toLowerCase()
                    } | ${t.courseActions.rightClickForOptions}`}
                  >
                    <CourseCode>{course.code}</CourseCode>
                    <CourseName>{course.name}</CourseName>
                    {course.level && <CourseLevel>{course.level}</CourseLevel>}
                    <Prerequisites>{getPrerequisiteText(course)}</Prerequisites>
                    <StatusIcon status={status} />
                  </CourseNode>
                )
              })}
            </CourseGrid>
          </SubsectionContainer>
        ))}
      </CategorySection>
    ))
  }

  const renderCoursesByDepartment = () => {
    const departmentCourses = new Map<string, Course[]>()

    // Extract all unique departments from the filtered courses
    const allDepartments = new Set<string>()

    filteredCourses.forEach((course) => {
      // Check explicit department assignments first
      if (course.primaryDepartment) {
        allDepartments.add(course.primaryDepartment)
      }
      if (course.departments) {
        course.departments.forEach((dept) => allDepartments.add(dept))
      }

      // Check normalized department from subsection
      if (course.subsection) {
        const normalizedDept = normalizeDepartmentName(course.subsection)
        if (normalizedDept) {
          allDepartments.add(normalizedDept)
        }
      }

      // Fallback to section as department
      if (course.section) {
        allDepartments.add(course.section)
      }
    })

    // Group courses by department
    filteredCourses.forEach((course) => {
      let assignedDepartment: string

      // Prioritized department assignment
      if (course.primaryDepartment) {
        assignedDepartment = course.primaryDepartment
      } else if (course.departments && course.departments.length > 0) {
        assignedDepartment = course.departments[0] // Use first department if multiple
      } else {
        // Try to normalize the subsection name to a department
        const normalizedFromSubsection = course.subsection ? normalizeDepartmentName(course.subsection) : null
        if (normalizedFromSubsection) {
          assignedDepartment = normalizedFromSubsection
        } else {
          // Try to normalize the section name to a department
          const normalizedFromSection = course.section ? normalizeDepartmentName(course.section) : null
          if (normalizedFromSection) {
            assignedDepartment = normalizedFromSection
          } else {
            // Fallback: map common section patterns to departments
            assignedDepartment = mapSectionToDepartment(course.section) || 'Other'
          }
        }
      }

      // Add course to its assigned department
      if (!departmentCourses.has(assignedDepartment)) {
        departmentCourses.set(assignedDepartment, [])
      }
      departmentCourses.get(assignedDepartment)!.push(course)
    })

    // Sort departments and render
    const sortedDepartments = Array.from(departmentCourses.keys()).sort()

    return sortedDepartments.map((departmentName) => {
      const courses = departmentCourses.get(departmentName)!
      return (
        <CategorySection key={departmentName}>
          <CategoryHeader>{departmentName}</CategoryHeader>
          <SubsectionContainer>
            <CourseGrid>
              {courses.map((course) => {
                const status = getCourseStatus(course)
                return (
                  <CourseNode
                    key={course.id}
                    status={status}
                    onClick={() => handleCourseClick(course)}
                    onDoubleClick={() => handleCourseDoubleClick(course)}
                    onContextMenu={(e) => handleCourseRightClick(e, course)}
                    title={`${t.courseActions.doubleClickToToggle} ${
                      course.completed
                        ? t.courseActions.markIncomplete.toLowerCase()
                        : t.courseActions.markComplete.toLowerCase()
                    } | ${t.courseActions.rightClickForOptions}`}
                  >
                    <CourseCode>{course.code}</CourseCode>
                    <CourseName>{course.name}</CourseName>
                    {course.level && <CourseLevel>{course.level}</CourseLevel>}
                    <Prerequisites>{getPrerequisiteText(course)}</Prerequisites>
                    <StatusIcon status={status} />
                  </CourseNode>
                )
              })}
            </CourseGrid>
          </SubsectionContainer>
        </CategorySection>
      )
    })
  }

  const stats = getStats()

  return (
    <TreeContainer ref={containerRef}>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder={t.filters.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>

      <GroupingToggle>
        <GroupingLabel>Group by:</GroupingLabel>
        <GroupingButton $active={groupingMode === 'section'} onClick={() => setGroupingMode('section')}>
          Section
        </GroupingButton>
        <GroupingButton $active={groupingMode === 'department'} onClick={() => setGroupingMode('department')}>
          Department
        </GroupingButton>
      </GroupingToggle>

      <StatsContainer>
        <StatItem>
          <StatValue>{stats.completed}</StatValue>
          <StatLabel>Completed</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{stats.available}</StatValue>
          <StatLabel>Available</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total Courses</StatLabel>
        </StatItem>
      </StatsContainer>

      {renderCoursesByCategory()}
    </TreeContainer>
  )
}
