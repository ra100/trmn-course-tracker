import { useCallback } from 'react'
import { FilterOptions, CourseLevel, NodeStatus } from '../../types'
import { trackFilterUsage } from '../../utils/analytics'

interface UseFilterHandlersProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
}

interface UseFilterHandlersReturn {
  handleDepartmentChange: (department: string, checked: boolean) => void
  handleLevelChange: (level: CourseLevel, checked: boolean) => void
  handleStatusChange: (status: NodeStatus, checked: boolean) => void
  handleClearFilters: () => void
  getFilterCount: () => number
}

/**
 * Custom hook for managing filter state changes and analytics tracking
 */
export const useFilterHandlers = ({ filters, onFilterChange }: UseFilterHandlersProps): UseFilterHandlersReturn => {
  const handleDepartmentChange = useCallback(
    (department: string, checked: boolean) => {
      const currentDepartments = filters.departments || []
      const newDepartments = checked
        ? [...currentDepartments, department]
        : currentDepartments.filter((d) => d !== department)

      trackFilterUsage('department', checked ? department : `remove_${department}`)

      onFilterChange({
        ...filters,
        departments: newDepartments.length > 0 ? newDepartments : undefined
      })
    },
    [filters, onFilterChange]
  )

  const handleLevelChange = useCallback(
    (level: CourseLevel, checked: boolean) => {
      const currentLevels = filters.levels || []
      const newLevels = checked ? [...currentLevels, level] : currentLevels.filter((l) => l !== level)

      trackFilterUsage('level', checked ? level : `remove_${level}`)

      onFilterChange({
        ...filters,
        levels: newLevels.length > 0 ? newLevels : undefined
      })
    },
    [filters, onFilterChange]
  )

  const handleStatusChange = useCallback(
    (status: NodeStatus, checked: boolean) => {
      const currentStatuses = filters.status || []
      const newStatuses = checked ? [...currentStatuses, status] : currentStatuses.filter((s) => s !== status)

      trackFilterUsage('status', checked ? status : `remove_${status}`)

      onFilterChange({
        ...filters,
        status: newStatuses.length > 0 ? newStatuses : undefined
      })
    },
    [filters, onFilterChange]
  )

  const handleClearFilters = useCallback(() => {
    trackFilterUsage('clear_all', 'filters_cleared')
    onFilterChange({})
  }, [onFilterChange])

  const getFilterCount = useCallback(() => {
    let count = 0
    if (filters.departments) {
      count += filters.departments.length
    }
    if (filters.levels) {
      count += filters.levels.length
    }
    if (filters.status) {
      count += filters.status.length
    }
    if (filters.search) {
      count += 1
    }
    return count
  }, [filters])

  return {
    handleDepartmentChange,
    handleLevelChange,
    handleStatusChange,
    handleClearFilters,
    getFilterCount
  }
}
