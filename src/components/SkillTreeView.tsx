import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { ParsedCourseData, UserProgress, Course, FilterOptions, UserSettings, NodeStatus } from '../types'
import { EligibilityEngine } from '../utils/eligibilityEngine'

const TreeContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f8f9fa;
  overflow: auto;
`

const CategorySection = styled.div`
  margin: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`

const CategoryHeader = styled.div`
  background: linear-gradient(135deg, #3498db, #2980b9);
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
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ecf0f1;
`

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`

const CourseNode = styled.div<{ status: NodeStatus }>`
  background: ${(props) => {
    switch (props.status) {
      case 'completed':
        return 'linear-gradient(135deg, #27ae60, #229954)'
      case 'available':
        return 'linear-gradient(135deg, #3498db, #2980b9)'
      case 'locked':
        return 'linear-gradient(135deg, #95a5a6, #7f8c8d)'
      default:
        return 'linear-gradient(135deg, #e74c3c, #c0392b)'
    }
  }};
  color: white;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  ${(props) =>
    props.status === 'locked' &&
    `
    cursor: not-allowed;
    opacity: 0.6;
  `}
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
  color: ${(props) => (props.status === 'completed' ? '#27ae60' : 'white')};

  &::after {
    content: '${(props) => {
      switch (props.status) {
        case 'completed':
          return '✓'
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
  background: white;
  border-bottom: 1px solid #ddd;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`

const StatsContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #ddd;
`

const StatItem = styled.div`
  text-align: center;
  flex: 1;
`

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
`

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
`

interface SkillTreeViewProps {
  courseData: ParsedCourseData
  userProgress: UserProgress
  filters: FilterOptions
  settings: UserSettings
  eligibilityEngine: EligibilityEngine
  onCourseSelect: (course: Course) => void
  onCourseToggle: (courseCode: string) => void
}

export const SkillTreeView: React.FC<SkillTreeViewProps> = ({
  courseData,
  userProgress,
  filters,
  settings,
  eligibilityEngine,
  onCourseSelect,
  onCourseToggle
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
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
                    title={`Double-click to ${course.completed ? 'mark incomplete' : 'mark complete'}`}
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

  const stats = getStats()

  return (
    <TreeContainer ref={containerRef}>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search courses by name, code, or section..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>

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
