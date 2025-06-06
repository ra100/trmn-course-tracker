import React from 'react'
import styled from 'styled-components'
import { FilterOptions, ParsedCourseData, CourseLevel, NodeStatus } from '../types'

const PanelContainer = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`

const PanelTitle = styled.h3`
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
`

const FilterSection = styled.div`
  margin-bottom: 1.5rem;
`

const FilterLabel = styled.label`
  display: block;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${(props) => props.theme.colors.text};
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.2rem 0;

  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
`

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  accent-color: ${(props) => props.theme.colors.primary};
  width: 16px;
  height: 16px;
`

const ClearButton = styled.button`
  background: ${(props) => props.theme.colors.error};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;

  &:hover {
    opacity: 0.9;
  }
`

const FilterCount = styled.div`
  background: ${(props) => props.theme.colors.surface};
  padding: 0.8rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
  border: 1px solid ${(props) => props.theme.colors.border};
`

const CountValue = styled.div`
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.primary};
  font-weight: bold;
`

const CountLabel = styled.div`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
`

interface FilterPanelProps {
  filters: FilterOptions
  courseData: ParsedCourseData
  onFilterChange: (filters: FilterOptions) => void
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, courseData, onFilterChange }) => {
  const sections = Array.from(new Set(courseData.courses.map((c) => c.section))).sort()
  const levels: CourseLevel[] = ['A', 'C', 'D', 'W']
  const statuses: NodeStatus[] = ['completed', 'available', 'locked']

  const handleSectionChange = (section: string, checked: boolean) => {
    const currentSections = filters.sections || []
    const newSections = checked ? [...currentSections, section] : currentSections.filter((s) => s !== section)

    onFilterChange({
      ...filters,
      sections: newSections.length > 0 ? newSections : undefined
    })
  }

  const handleLevelChange = (level: CourseLevel, checked: boolean) => {
    const currentLevels = filters.levels || []
    const newLevels = checked ? [...currentLevels, level] : currentLevels.filter((l) => l !== level)

    onFilterChange({
      ...filters,
      levels: newLevels.length > 0 ? newLevels : undefined
    })
  }

  const handleStatusChange = (status: NodeStatus, checked: boolean) => {
    const currentStatuses = filters.status || []
    const newStatuses = checked ? [...currentStatuses, status] : currentStatuses.filter((s) => s !== status)

    onFilterChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined
    })
  }

  const handleClearFilters = () => {
    onFilterChange({})
  }

  const getFilterCount = () => {
    let count = 0
    if (filters.sections) count += filters.sections.length
    if (filters.levels) count += filters.levels.length
    if (filters.status) count += filters.status.length
    if (filters.search) count += 1
    return count
  }

  const getStatusLabel = (status: NodeStatus): string => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'available':
        return 'Available'
      case 'locked':
        return 'Locked'
      default:
        return status
    }
  }

  const activeFilterCount = getFilterCount()

  return (
    <PanelContainer>
      <PanelTitle>Filters</PanelTitle>

      {activeFilterCount > 0 && (
        <FilterCount>
          <CountValue>{activeFilterCount}</CountValue>
          <CountLabel>Active Filter{activeFilterCount !== 1 ? 's' : ''}</CountLabel>
        </FilterCount>
      )}

      <FilterSection>
        <FilterLabel>Sections</FilterLabel>
        <CheckboxGroup>
          {sections.map((section) => (
            <CheckboxItem key={section}>
              <Checkbox
                checked={filters.sections?.includes(section) || false}
                onChange={(e) => handleSectionChange(section, e.target.checked)}
              />
              {section}
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </FilterSection>

      <FilterSection>
        <FilterLabel>Course Levels</FilterLabel>
        <CheckboxGroup>
          {levels.map((level) => (
            <CheckboxItem key={level}>
              <Checkbox
                checked={filters.levels?.includes(level) || false}
                onChange={(e) => handleLevelChange(level, e.target.checked)}
              />
              Level {level}
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </FilterSection>

      <FilterSection>
        <FilterLabel>Status</FilterLabel>
        <CheckboxGroup>
          {statuses.map((status) => (
            <CheckboxItem key={status}>
              <Checkbox
                checked={filters.status?.includes(status) || false}
                onChange={(e) => handleStatusChange(status, e.target.checked)}
              />
              {getStatusLabel(status)}
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </FilterSection>

      {activeFilterCount > 0 && <ClearButton onClick={handleClearFilters}>Clear All Filters</ClearButton>}
    </PanelContainer>
  )
}
