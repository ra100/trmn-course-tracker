import React, { useState, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { ParsedCourseData, UserProgress, Course, FilterOptions, UserSettings } from '../types'
import { EligibilityEngine } from '../utils/eligibilityEngine'
import { useT } from '../i18n'

import { useCourseFiltering } from '../hooks/useCourseFiltering'
import { getCourseMainDepartment } from '../utils/departmentUtils'
import { CourseNode } from './CourseNode'

// Note: Department normalization is now handled by departmentUtils using dynamic mappings

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

const SkillTreeViewComponent: React.FC<SkillTreeViewProps> = ({
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
  const [groupingMode, setGroupingMode] = useState<'section' | 'department'>('section')
  const containerRef = useRef<HTMLDivElement>(null)

  // Memoize expensive computations
  const updatedCourses = useMemo(() => {
    return eligibilityEngine.updateCourseAvailability(userProgress)
  }, [eligibilityEngine, userProgress])

  // Use custom hook for filtering logic
  const { filteredCourses, getCourseStatus, stats } = useCourseFiltering({
    courses: updatedCourses,
    searchTerm,
    filters,
    settings,
    userProgress,
    courseData
  })

  const renderCoursesByCategory = () => {
    if (groupingMode === 'department') {
      return renderCoursesByDepartment()
    }

    const categorizedCourses = new Map<string, Map<string, Course[]>>()

    filteredCourses.forEach((course) => {
      if (!categorizedCourses.has(course.section)) {
        categorizedCourses.set(course.section, new Map())
      }

      const sectionMap = categorizedCourses.get(course.section)
      if (sectionMap) {
        const subsection = course.subsection || 'General'

        if (!sectionMap.has(subsection)) {
          sectionMap.set(subsection, [])
        }

        const subsectionCourses = sectionMap.get(subsection)
        if (subsectionCourses) {
          subsectionCourses.push(course)
        }
      }
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
                    course={course}
                    status={status}
                    userProgress={userProgress}
                    onCourseSelect={onCourseSelect}
                    onCourseToggle={onCourseToggle}
                    onCourseStatusChange={onCourseStatusChange}
                  />
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

    // Note: Department extraction is now handled by the department grouping logic below

    // Group courses by department using dynamic mappings
    filteredCourses.forEach((course) => {
      const assignedDepartment = getCourseMainDepartment(course, courseData.departmentMappings || new Map())

      if (!departmentCourses.has(assignedDepartment)) {
        departmentCourses.set(assignedDepartment, [])
      }
      const deptCourses = departmentCourses.get(assignedDepartment)
      if (deptCourses) {
        deptCourses.push(course)
      }
    })

    // Sort departments and render
    const sortedDepartments = Array.from(departmentCourses.keys()).sort()

    return sortedDepartments.map((departmentName) => {
      const courses = departmentCourses.get(departmentName)
      if (!courses) {
        return null
      }

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
                    course={course}
                    status={status}
                    userProgress={userProgress}
                    onCourseSelect={onCourseSelect}
                    onCourseToggle={onCourseToggle}
                    onCourseStatusChange={onCourseStatusChange}
                  />
                )
              })}
            </CourseGrid>
          </SubsectionContainer>
        </CategorySection>
      )
    })
  }

  return (
    <TreeContainer ref={containerRef}>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder={t.filters.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label={t.filters.search}
          role="searchbox"
        />
      </SearchContainer>

      <GroupingToggle role="group" aria-label="Course grouping options">
        <GroupingLabel id="grouping-label">Group by:</GroupingLabel>
        <GroupingButton
          $active={groupingMode === 'section'}
          onClick={() => setGroupingMode('section')}
          aria-pressed={groupingMode === 'section'}
          aria-describedby="grouping-label"
        >
          Section
        </GroupingButton>
        <GroupingButton
          $active={groupingMode === 'department'}
          onClick={() => setGroupingMode('department')}
          aria-pressed={groupingMode === 'department'}
          aria-describedby="grouping-label"
        >
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

export const SkillTreeView = React.memo(SkillTreeViewComponent)
