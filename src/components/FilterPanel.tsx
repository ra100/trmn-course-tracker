import React from 'react'
import { FilterOptions, ParsedCourseData } from '~/types'
import { useT } from '~/i18n'
import {
  FilterCountDisplay,
  StatusFilterSection,
  LevelFilterSection,
  DepartmentFilterSection,
  useFilterHandlers
} from './FilterPanel/index'
import { Button } from '~/components/ui/button'
import { panelContainer, panelTitle, clearButton } from './FilterPanel/filterPanel.styles'

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
    <div className={panelContainer}>
      <h3 className={panelTitle}>{t.filters.title}</h3>

      <FilterCountDisplay count={activeFilterCount} />

      <StatusFilterSection filters={filters} onStatusChange={handleStatusChange} />

      <LevelFilterSection filters={filters} onLevelChange={handleLevelChange} />

      <DepartmentFilterSection filters={filters} courseData={courseData} onDepartmentChange={handleDepartmentChange} />

      {activeFilterCount > 0 && (
        <Button variant="outline" colorPalette="red" className={clearButton} onClick={handleClearFilters}>
          {t.filters.clearFilters}
        </Button>
      )}
    </div>
  )
}

export const FilterPanel = React.memo(FilterPanelComponent)
