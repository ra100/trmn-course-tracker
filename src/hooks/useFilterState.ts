import { useState, useCallback } from 'react'
import { FilterOptions } from '../types'
import { trackFilterUsage, trackSearch } from '../utils/analytics'

export interface FilterStateActions {
  setFilters: (newFilters: FilterOptions) => void
  clearFilters: () => void
  updateFilter: <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => void
  resetToDefaults: () => void
}

export interface UseFilterStateReturn extends FilterStateActions {
  filters: FilterOptions
}

const defaultFilters: FilterOptions = {
  search: '',
  sections: [],
  subsections: [],
  departments: [],
  levels: [],
  status: []
}

/**
 * Custom hook for managing filter state with analytics tracking
 * Extracts filter management logic from App.tsx for better separation of concerns
 */
export const useFilterState = (courseCount = 0): UseFilterStateReturn => {
  const [filters, setFiltersState] = useState<FilterOptions>(defaultFilters)

  const setFilters = useCallback(
    (newFilters: FilterOptions) => {
      const previousFilters = filters

      // Track search usage if search term changed
      if (newFilters.search !== previousFilters.search && newFilters.search) {
        trackSearch(newFilters.search, courseCount)
      }

      // Track filter usage for other filter types
      Object.keys(newFilters).forEach((key) => {
        const filterKey = key as keyof FilterOptions
        const newValue = newFilters[filterKey]
        const oldValue = previousFilters[filterKey]

        if (newValue !== oldValue && filterKey !== 'search') {
          // Handle different filter value types
          if (Array.isArray(newValue)) {
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
              trackFilterUsage(filterKey, newValue)
            }
          } else if (typeof newValue === 'boolean') {
            if (newValue !== oldValue) {
              trackFilterUsage(filterKey, String(newValue))
            }
          }
        }
      })

      setFiltersState(newFilters)
    },
    [filters, courseCount]
  )

  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters)
    trackFilterUsage('clear_all', 'true')
  }, [])

  const updateFilter = useCallback(
    <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
      setFilters({
        ...filters,
        [key]: value
      })
    },
    [filters, setFilters]
  )

  const resetToDefaults = useCallback(() => {
    if (JSON.stringify(filters) !== JSON.stringify(defaultFilters)) {
      setFiltersState(defaultFilters)
      trackFilterUsage('reset', 'true')
    }
  }, [filters])

  return {
    filters,
    setFilters,
    clearFilters,
    updateFilter,
    resetToDefaults
  }
}
