import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useUserProgress,
  useUpdateUserProgress,
  useOptimisticUserProgress,
  USER_PROGRESS_QUERY_KEY
} from './useUserProgress'
import { UserProgress } from '../types'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock console methods
const consoleMock = {
  log: vi.fn(),
  error: vi.fn()
}

Object.defineProperty(console, 'log', { value: consoleMock.log })
Object.defineProperty(console, 'error', { value: consoleMock.error })

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      },
      mutations: {
        retry: false
      }
    }
  })
}

const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  return Wrapper
}

const mockUserProgress: UserProgress = {
  userId: 'test-user',
  completedCourses: new Set(['COURSE-001', 'COURSE-002']),
  availableCourses: new Set(['COURSE-003', 'COURSE-004']),
  inProgressCourses: new Set(['COURSE-005']),
  waitingGradeCourses: new Set(['COURSE-006']),
  courseStatusTimestamps: new Map(),
  courseCompletionDates: new Map(),
  specialRulesProgress: new Map([
    [
      'rule1',
      {
        ruleId: 'rule1',
        completed: true,
        progress: [],
        eligible: true
      }
    ]
  ]),
  lastUpdated: new Date('2024-01-01T00:00:00.000Z')
}

describe('useUserProgress', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
    // Reset localStorage mock implementation
    localStorageMock.setItem.mockImplementation(() => {})
  })

  afterEach(() => {
    queryClient.clear()
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('useUserProgress', () => {
    it('should return default user progress when localStorage is empty', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useUserProgress(), {
        wrapper: createWrapper(queryClient)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual({
        userId: 'default-user',
        completedCourses: new Set(),
        availableCourses: new Set(),
        inProgressCourses: new Set(),
        waitingGradeCourses: new Set(),
        courseStatusTimestamps: new Map(),
        courseCompletionDates: new Map(),
        specialRulesProgress: new Map(),
        lastUpdated: expect.any(Date)
      })
    })

    it('should load user progress from localStorage', async () => {
      const serializedProgress = {
        userId: 'test-user',
        completedCourses: ['COURSE-001', 'COURSE-002'],
        availableCourses: ['COURSE-003', 'COURSE-004'],
        inProgressCourses: ['COURSE-005'],
        waitingGradeCourses: ['COURSE-006'],
        courseStatusTimestamps: [],
        courseCompletionDates: [],
        specialRulesProgress: [
          [
            'rule1',
            {
              ruleId: 'rule1',
              completed: true,
              progress: [],
              eligible: true
            }
          ]
        ],
        lastUpdated: '2024-01-01T00:00:00.000Z'
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(serializedProgress))

      const { result } = renderHook(() => useUserProgress(), {
        wrapper: createWrapper(queryClient)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUserProgress)
    })

    it('should handle corrupted localStorage data gracefully', async () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const { result } = renderHook(() => useUserProgress(), {
        wrapper: createWrapper(queryClient)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual({
        userId: 'default-user',
        completedCourses: new Set(),
        availableCourses: new Set(),
        inProgressCourses: new Set(),
        waitingGradeCourses: new Set(),
        courseStatusTimestamps: new Map(),
        courseCompletionDates: new Map(),
        specialRulesProgress: new Map(),
        lastUpdated: expect.any(Date)
      })

      expect(consoleMock.error).toHaveBeenCalledWith(
        'Error loading user progress from localStorage:',
        expect.any(Error)
      )
    })

    it('should handle missing fields in stored data', async () => {
      const incompleteData = {
        userId: 'test-user',
        completedCourses: ['COURSE-001']
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(incompleteData))

      const { result } = renderHook(() => useUserProgress(), {
        wrapper: createWrapper(queryClient)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual({
        userId: 'test-user',
        completedCourses: new Set(['COURSE-001']),
        availableCourses: new Set(),
        inProgressCourses: new Set(),
        waitingGradeCourses: new Set(),
        courseStatusTimestamps: new Map(),
        courseCompletionDates: new Map(),
        specialRulesProgress: new Map(),
        lastUpdated: expect.any(Date)
      })
    })

    it('should have correct query configuration', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useUserProgress(), {
        wrapper: createWrapper(queryClient)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Check that data is cached indefinitely
      const queryData = queryClient.getQueryState(USER_PROGRESS_QUERY_KEY)
      expect(queryData?.dataUpdatedAt).toBeGreaterThan(0)
    })
  })

  describe('useUpdateUserProgress', () => {
    it('should save user progress to localStorage successfully', async () => {
      const { result } = renderHook(() => useUpdateUserProgress(), {
        wrapper: createWrapper(queryClient)
      })

      await act(async () => {
        result.current.mutate(mockUserProgress)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'trmn-user-progress',
        JSON.stringify({
          userId: 'test-user',
          completedCourses: ['COURSE-001', 'COURSE-002'],
          availableCourses: ['COURSE-003', 'COURSE-004'],
          inProgressCourses: ['COURSE-005'],
          waitingGradeCourses: ['COURSE-006'],
          courseStatusTimestamps: [],
          courseCompletionDates: [],
          specialRulesProgress: [
            [
              'rule1',
              {
                ruleId: 'rule1',
                completed: true,
                progress: [],
                eligible: true
              }
            ]
          ],
          lastUpdated: '2024-01-01T00:00:00.000Z'
        })
      )

      expect(result.current.data).toEqual(mockUserProgress)
    })

    it('should update query cache on successful save', async () => {
      const { result } = renderHook(() => useUpdateUserProgress(), {
        wrapper: createWrapper(queryClient)
      })

      await act(async () => {
        await result.current.mutateAsync(mockUserProgress)
      })

      const cachedData = queryClient.getQueryData<UserProgress>(USER_PROGRESS_QUERY_KEY)
      expect(cachedData).toEqual(mockUserProgress)
    })

    it('should handle localStorage save errors', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const { result } = renderHook(() => useUpdateUserProgress(), {
        wrapper: createWrapper(queryClient)
      })

      await act(async () => {
        result.current.mutate(mockUserProgress)
      })

      // Wait longer for retries to exhaust (2 retries with exponential backoff)
      await waitFor(
        () => {
          expect(result.current.isError).toBe(true)
        },
        { timeout: 15000 }
      )

      expect(result.current.error).toEqual(new Error('Storage quota exceeded'))
      expect(consoleMock.error).toHaveBeenCalledWith('❌ Critical: All storage methods failed!', expect.any(Error))
    })

    it('should log success message in debug mode', async () => {
      // Mock debug mode
      vi.doMock('../config', () => ({
        isDebugEnabled: () => true
      }))

      const { result } = renderHook(() => useUpdateUserProgress(), {
        wrapper: createWrapper(queryClient)
      })

      await act(async () => {
        result.current.mutate(mockUserProgress)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(consoleMock.log).toHaveBeenCalledWith('✅ User progress saved to localStorage (primary)')
    })
  })

  describe('useOptimisticUserProgress', () => {
    it('should update progress optimistically', async () => {
      // Set initial data
      queryClient.setQueryData(USER_PROGRESS_QUERY_KEY, mockUserProgress)

      const { result } = renderHook(() => useOptimisticUserProgress(), {
        wrapper: createWrapper(queryClient)
      })

      const updater = (current: UserProgress) => ({
        ...current,
        completedCourses: new Set([...Array.from(current.completedCourses), 'NEW-COURSE'])
      })

      await act(async () => {
        await result.current.updateOptimistically(updater)
      })

      const updatedData = queryClient.getQueryData<UserProgress>(USER_PROGRESS_QUERY_KEY)
      expect(updatedData?.completedCourses.has('NEW-COURSE')).toBe(true)
    })

    it('should revert changes on localStorage error', async () => {
      queryClient.setQueryData(USER_PROGRESS_QUERY_KEY, mockUserProgress)
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const { result } = renderHook(() => useOptimisticUserProgress(), {
        wrapper: createWrapper(queryClient)
      })

      const updater = (current: UserProgress) => ({
        ...current,
        completedCourses: new Set([...Array.from(current.completedCourses), 'NEW-COURSE'])
      })

      let errorThrown = false
      await act(async () => {
        try {
          await result.current.updateOptimistically(updater)
        } catch (error) {
          errorThrown = true
          expect(error).toEqual(new Error('Storage quota exceeded'))

          // Check cache immediately after error in the catch block
          const dataAfterError = queryClient.getQueryData<UserProgress>(USER_PROGRESS_QUERY_KEY)
          expect(dataAfterError).toEqual(mockUserProgress)
          expect(dataAfterError?.completedCourses.has('NEW-COURSE')).toBe(false)
        }
      })

      expect(errorThrown).toBe(true)
    })

    it('should handle empty cache gracefully', async () => {
      const { result } = renderHook(() => useOptimisticUserProgress(), {
        wrapper: createWrapper(queryClient)
      })

      const updater = (current: UserProgress) => ({
        ...current,
        completedCourses: new Set([...Array.from(current.completedCourses), 'NEW-COURSE'])
      })

      await act(async () => {
        await result.current.updateOptimistically(updater)
      })

      // Should not throw error and cache should remain empty
      const data = queryClient.getQueryData<UserProgress>(USER_PROGRESS_QUERY_KEY)
      expect(data).toBeUndefined()
    })
  })

  describe('integration tests', () => {
    it('should work with complete flow: load -> update -> optimistic update', async () => {
      // Start with data in localStorage
      const serializedProgress = {
        userId: 'test-user',
        completedCourses: ['COURSE-001'],
        availableCourses: ['COURSE-002'],
        inProgressCourses: [],
        waitingGradeCourses: [],
        specialRulesProgress: [],
        lastUpdated: '2024-01-01T00:00:00.000Z'
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(serializedProgress))

      // Load initial data
      const { result: queryResult } = renderHook(() => useUserProgress(), {
        wrapper: createWrapper(queryClient)
      })

      await waitFor(() => {
        expect(queryResult.current.isSuccess).toBe(true)
      })

      // Update via mutation
      const { result: mutationResult } = renderHook(() => useUpdateUserProgress(), {
        wrapper: createWrapper(queryClient)
      })

      expect(queryResult.current.data).toBeDefined()
      const updatedProgress = {
        ...(queryResult.current.data as UserProgress),
        completedCourses: new Set(['COURSE-001', 'COURSE-002']),
        lastUpdated: new Date()
      }

      await act(async () => {
        mutationResult.current.mutate(updatedProgress)
      })

      await waitFor(() => {
        expect(mutationResult.current.isSuccess).toBe(true)
      })

      // Make optimistic update
      const { result: optimisticResult } = renderHook(() => useOptimisticUserProgress(), {
        wrapper: createWrapper(queryClient)
      })

      await act(async () => {
        await optimisticResult.current.updateOptimistically((current) => ({
          ...current,
          inProgressCourses: new Set(['COURSE-003'])
        }))
      })

      const finalData = queryClient.getQueryData<UserProgress>(USER_PROGRESS_QUERY_KEY)
      expect(finalData?.completedCourses.has('COURSE-002')).toBe(true)
      expect(finalData?.inProgressCourses.has('COURSE-003')).toBe(true)
    })
  })
})
