import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilterState } from './useFilterState'
import { FilterOptions } from '../types'
import * as analytics from '../utils/analytics'

// Mock analytics functions
vi.mock('../utils/analytics', () => ({
  trackFilterUsage: vi.fn(),
  trackSearch: vi.fn()
}))

const mockTrackFilterUsage = vi.mocked(analytics.trackFilterUsage)
const mockTrackSearch = vi.mocked(analytics.trackSearch)

describe('useFilterState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useFilterState())

      expect(result.current.filters).toEqual({
        search: '',
        sections: [],
        subsections: [],
        departments: [],
        levels: [],
        status: []
      })
    })
  })

  describe('setFilters', () => {
    it('should update filters correctly', () => {
      const { result } = renderHook(() => useFilterState())

      const newFilters: FilterOptions = {
        search: 'test',
        departments: ['Engineering'],
        levels: ['A'],
        status: ['available']
      }

      act(() => {
        result.current.setFilters(newFilters)
      })

      expect(result.current.filters).toEqual(newFilters)
    })

    it('should track search usage when search term changes', () => {
      const courseCount = 42
      const { result } = renderHook(() => useFilterState(courseCount))

      const newFilters: FilterOptions = {
        search: 'tactical'
      }

      act(() => {
        result.current.setFilters(newFilters)
      })

      expect(mockTrackSearch).toHaveBeenCalledWith('tactical', courseCount)
    })

    it('should not track search when search term is empty', () => {
      const { result } = renderHook(() => useFilterState())

      const newFilters: FilterOptions = {
        search: ''
      }

      act(() => {
        result.current.setFilters(newFilters)
      })

      expect(mockTrackSearch).not.toHaveBeenCalled()
    })

    it('should track filter usage for array filters', () => {
      const { result } = renderHook(() => useFilterState())

      const newFilters: FilterOptions = {
        departments: ['Engineering', 'Tactical']
      }

      act(() => {
        result.current.setFilters(newFilters)
      })

      expect(mockTrackFilterUsage).toHaveBeenCalledWith('departments', ['Engineering', 'Tactical'])
    })

    it('should track filter usage for status filters', () => {
      const { result } = renderHook(() => useFilterState())

      const newFilters: FilterOptions = {
        status: ['completed', 'available']
      }

      act(() => {
        result.current.setFilters(newFilters)
      })

      expect(mockTrackFilterUsage).toHaveBeenCalledWith('status', ['completed', 'available'])
    })

    it('should not track filter usage when values are the same', () => {
      const { result } = renderHook(() => useFilterState())

      const newFilters: FilterOptions = {
        departments: []
      }

      act(() => {
        result.current.setFilters(newFilters)
      })

      // Should not track because empty array is the same as initial state
      expect(mockTrackFilterUsage).not.toHaveBeenCalled()
    })
  })

  describe('clearFilters', () => {
    it('should reset filters to default values', () => {
      const { result } = renderHook(() => useFilterState())

      // Set some filters first
      act(() => {
        result.current.setFilters({
          search: 'test',
          departments: ['Engineering'],
          status: ['completed']
        })
      })

      // Clear filters
      act(() => {
        result.current.clearFilters()
      })

      expect(result.current.filters).toEqual({
        search: '',
        sections: [],
        subsections: [],
        departments: [],
        levels: [],
        status: []
      })
    })

    it('should track clear all filter action', () => {
      const { result } = renderHook(() => useFilterState())

      act(() => {
        result.current.clearFilters()
      })

      expect(mockTrackFilterUsage).toHaveBeenCalledWith('clear_all', 'true')
    })
  })

  describe('updateFilter', () => {
    it('should update a specific filter property', () => {
      const { result } = renderHook(() => useFilterState())

      act(() => {
        result.current.updateFilter('search', 'tactical')
      })

      expect(result.current.filters.search).toBe('tactical')
    })

    it('should update array filter properties', () => {
      const { result } = renderHook(() => useFilterState())

      act(() => {
        result.current.updateFilter('departments', ['Engineering'])
      })

      expect(result.current.filters.departments).toEqual(['Engineering'])
    })

    it('should track filter usage when updating filter', () => {
      const { result } = renderHook(() => useFilterState())

      act(() => {
        result.current.updateFilter('levels', ['A', 'C'])
      })

      expect(mockTrackFilterUsage).toHaveBeenCalledWith('levels', ['A', 'C'])
    })
  })

  describe('resetToDefaults', () => {
    it('should reset to default filters', () => {
      const { result } = renderHook(() => useFilterState())

      // Set some filters first
      act(() => {
        result.current.setFilters({
          search: 'test',
          departments: ['Engineering']
        })
      })

      // Reset to defaults
      act(() => {
        result.current.resetToDefaults()
      })

      expect(result.current.filters).toEqual({
        search: '',
        sections: [],
        subsections: [],
        departments: [],
        levels: [],
        status: []
      })
    })

    it('should track reset action when filters are not already default', () => {
      const { result } = renderHook(() => useFilterState())

      // Set some filters first
      act(() => {
        result.current.setFilters({
          search: 'test'
        })
      })

      // Reset to defaults
      act(() => {
        result.current.resetToDefaults()
      })

      expect(mockTrackFilterUsage).toHaveBeenCalledWith('reset', 'true')
    })

    it('should not track reset action when filters are already default', () => {
      const { result } = renderHook(() => useFilterState())

      // Reset when already at defaults
      act(() => {
        result.current.resetToDefaults()
      })

      expect(mockTrackFilterUsage).not.toHaveBeenCalled()
    })
  })

  describe('function stability', () => {
    it('should have stable function references', () => {
      const { result, rerender } = renderHook(() => useFilterState())

      const initialFunctions = {
        setFilters: result.current.setFilters,
        clearFilters: result.current.clearFilters,
        updateFilter: result.current.updateFilter,
        resetToDefaults: result.current.resetToDefaults
      }

      // Trigger a rerender
      rerender()

      // Functions should be the same references (memoized)
      expect(result.current.setFilters).toBe(initialFunctions.setFilters)
      expect(result.current.clearFilters).toBe(initialFunctions.clearFilters)
      expect(result.current.updateFilter).toBe(initialFunctions.updateFilter)
      expect(result.current.resetToDefaults).toBe(initialFunctions.resetToDefaults)
    })
  })

  describe('edge cases', () => {
    it('should handle rapid filter changes correctly', () => {
      const { result } = renderHook(() => useFilterState())

      act(() => {
        result.current.updateFilter('search', 'test1')
        result.current.updateFilter('search', 'test2')
        result.current.updateFilter('search', 'test3')
      })

      expect(result.current.filters.search).toBe('test3')
    })

    it('should handle complex filter combinations', () => {
      const { result } = renderHook(() => useFilterState())

      const complexFilters: FilterOptions = {
        search: 'engineering',
        sections: ['SINA TSC'],
        subsections: ['Engineering'],
        departments: ['Engineering', 'Tactical'],
        levels: ['A', 'C'],
        status: ['available', 'completed']
      }

      act(() => {
        result.current.setFilters(complexFilters)
      })

      expect(result.current.filters).toEqual(complexFilters)
    })

    it('should handle courseCount changes correctly', () => {
      const { result, rerender } = renderHook(({ courseCount }) => useFilterState(courseCount), {
        initialProps: { courseCount: 10 }
      })

      act(() => {
        result.current.setFilters({ search: 'test' })
      })

      expect(mockTrackSearch).toHaveBeenCalledWith('test', 10)

      // Rerender with different courseCount
      rerender({ courseCount: 20 })

      act(() => {
        result.current.setFilters({ search: 'newtest' })
      })

      expect(mockTrackSearch).toHaveBeenCalledWith('newtest', 20)
    })
  })
})
