import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFilterHandlers } from './useFilterHandlers'
import { FilterOptions } from '../../types'

// Mock analytics
vi.mock('../../utils/analytics', () => ({
  trackFilterUsage: vi.fn()
}))

describe('useFilterHandlers', () => {
  const mockOnFilterChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const defaultFilters: FilterOptions = {}

  it('handles department filter changes correctly', () => {
    const { result } = renderHook(() =>
      useFilterHandlers({
        filters: defaultFilters,
        onFilterChange: mockOnFilterChange
      })
    )

    act(() => {
      result.current.handleDepartmentChange('Engineering', true)
    })

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      departments: ['Engineering']
    })
  })

  it('handles removing department filter correctly', () => {
    const filters: FilterOptions = { departments: ['Engineering', 'Tactical'] }
    const { result } = renderHook(() =>
      useFilterHandlers({
        filters,
        onFilterChange: mockOnFilterChange
      })
    )

    act(() => {
      result.current.handleDepartmentChange('Engineering', false)
    })

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      departments: ['Tactical']
    })
  })

  it('removes departments property when last department is unchecked', () => {
    const filters: FilterOptions = { departments: ['Engineering'] }
    const { result } = renderHook(() =>
      useFilterHandlers({
        filters,
        onFilterChange: mockOnFilterChange
      })
    )

    act(() => {
      result.current.handleDepartmentChange('Engineering', false)
    })

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      departments: undefined
    })
  })

  it('handles level filter changes correctly', () => {
    const { result } = renderHook(() =>
      useFilterHandlers({
        filters: defaultFilters,
        onFilterChange: mockOnFilterChange
      })
    )

    act(() => {
      result.current.handleLevelChange('A', true)
    })

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      levels: ['A']
    })
  })

  it('handles status filter changes correctly', () => {
    const { result } = renderHook(() =>
      useFilterHandlers({
        filters: defaultFilters,
        onFilterChange: mockOnFilterChange
      })
    )

    act(() => {
      result.current.handleStatusChange('completed', true)
    })

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      status: ['completed']
    })
  })

  it('handles clear filters correctly', () => {
    const filters: FilterOptions = {
      departments: ['Engineering'],
      levels: ['A'],
      status: ['completed']
    }
    const { result } = renderHook(() =>
      useFilterHandlers({
        filters,
        onFilterChange: mockOnFilterChange
      })
    )

    act(() => {
      result.current.handleClearFilters()
    })

    expect(mockOnFilterChange).toHaveBeenCalledWith({})
  })

  it('calculates filter count correctly', () => {
    const filters: FilterOptions = {
      departments: ['Engineering', 'Tactical'],
      levels: ['A'],
      status: ['completed', 'available'],
      search: 'test'
    }
    const { result } = renderHook(() =>
      useFilterHandlers({
        filters,
        onFilterChange: mockOnFilterChange
      })
    )

    expect(result.current.getFilterCount()).toBe(6) // 2 + 1 + 2 + 1
  })

  it('returns zero count for empty filters', () => {
    const { result } = renderHook(() =>
      useFilterHandlers({
        filters: defaultFilters,
        onFilterChange: mockOnFilterChange
      })
    )

    expect(result.current.getFilterCount()).toBe(0)
  })

  it('maintains stable function references', () => {
    const { result, rerender } = renderHook(() =>
      useFilterHandlers({
        filters: defaultFilters,
        onFilterChange: mockOnFilterChange
      })
    )

    const firstRender = result.current
    rerender()
    const secondRender = result.current

    expect(firstRender.handleDepartmentChange).toBe(secondRender.handleDepartmentChange)
    expect(firstRender.handleLevelChange).toBe(secondRender.handleLevelChange)
    expect(firstRender.handleStatusChange).toBe(secondRender.handleStatusChange)
    expect(firstRender.handleClearFilters).toBe(secondRender.handleClearFilters)
    expect(firstRender.getFilterCount).toBe(secondRender.getFilterCount)
  })
})
