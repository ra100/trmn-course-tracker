import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest'
import { useCourseData } from './useCourseData'
import * as courseDataLoader from '../utils/courseDataLoader'

// Mock the courseDataLoader
vi.mock('../utils/courseDataLoader', () => ({
  loadCourseData: vi.fn()
}))

const mockLoadCourseData = vi.mocked(courseDataLoader.loadCourseData)

// Helper to create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false // Disable retries for testing
      }
    }
  })

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

const mockCourseData = {
  courses: [
    {
      id: '1',
      code: 'TEST-001',
      name: 'Test Course',
      section: 'Test Section',
      subsection: 'Test Subsection',
      sectionId: 'test-section-id',
      subsectionId: 'test-subsection-id',
      prerequisites: [],
      level: 'A' as const,
      available: false,
      completed: false
    }
  ],
  categories: [],
  specialRules: [],
  departmentMappings: new Map(),
  courseMap: new Map(),
  categoryMap: new Map(),
  dependencyGraph: new Map(),
  seriesMappings: new Map()
}

describe('useCourseData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return loading state initially', () => {
    mockLoadCourseData.mockImplementation(() => new Promise(() => {})) // Never resolves

    const { result } = renderHook(() => useCourseData(), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
    expect(result.current.isError).toBe(false)
  })

  it('should return data when fetch succeeds', async () => {
    mockLoadCourseData.mockResolvedValue(mockCourseData)

    const { result } = renderHook(() => useCourseData(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toEqual(mockCourseData)
    expect(result.current.isError).toBe(false)
  })

  it('should cache data between renders', async () => {
    mockLoadCourseData.mockResolvedValue(mockCourseData)

    const wrapper = createWrapper()

    // First render
    const { result: result1 } = renderHook(() => useCourseData(), { wrapper })

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true)
    })

    // Second render - should use cached data
    const { result: result2 } = renderHook(() => useCourseData(), { wrapper })

    expect(result2.current.isLoading).toBe(false)
    expect(result2.current.data).toEqual(mockCourseData)
    expect(mockLoadCourseData).toHaveBeenCalledTimes(1) // Should only be called once
  })

  it('should have correct query configuration', () => {
    mockLoadCourseData.mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useCourseData(), {
      wrapper: createWrapper()
    })

    // Check that the hook returns a proper query object
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('isError')
    expect(result.current).toHaveProperty('isSuccess')
  })
})
