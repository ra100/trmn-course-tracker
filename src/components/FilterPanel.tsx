import React from 'react'
import { FilterOptions, ParsedCourseData } from '../types'
import { useT } from '../i18n'
import {
  FilterCountDisplay,
  StatusFilterSection,
  LevelFilterSection,
  DepartmentFilterSection,
  useFilterHandlers,
  PanelContainer,
  PanelTitle,
  ClearButton
} from './FilterPanel/index'

interface FilterPanelProps {
  filters: FilterOptions
  courseData: ParsedCourseData
  onFilterChange: (filters: FilterOptions) => void
}

/**
 * FilterPanel provides comprehensive course filtering options
 * with status, level, and department filters
 */
const FilterPanelComponent: React.FC<FilterPanelProps> = ({ filters, courseData, onFilterChange }) => {
  const t = useT()
  const { handleDepartmentChange, handleLevelChange, handleStatusChange, handleClearFilters, getFilterCount } =
    useFilterHandlers({ filters, onFilterChange })

  const activeFilterCount = getFilterCount()

  return (
    <PanelContainer>
      <PanelTitle>{t.filters.title}</PanelTitle>

      <FilterCountDisplay count={activeFilterCount} />

      <StatusFilterSection filters={filters} onStatusChange={handleStatusChange} />

      <LevelFilterSection filters={filters} onLevelChange={handleLevelChange} />

      <DepartmentFilterSection filters={filters} courseData={courseData} onDepartmentChange={handleDepartmentChange} />

      {activeFilterCount > 0 && <ClearButton onClick={handleClearFilters}>{t.filters.clearFilters}</ClearButton>}
    </PanelContainer>
  )
}

export const FilterPanel = React.memo(FilterPanelComponent)
