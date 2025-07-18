import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useUserSettings,
  useUpdateUserSettings,
  useUpdateSetting,
  useOptimisticUserSettings,
  USER_SETTINGS_QUERY_KEY
} from './useUserSettings'
import { UserSettings } from '../types'

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

const mockUserSettings: UserSettings = {
  layout: 'grid',
  showCompleted: false,
  showUnavailable: false,
  autoSave: false,
  language: 'cs'
}

const defaultUserSettings: UserSettings = {
  layout: 'tree',
  showCompleted: true,
  showUnavailable: true,
  autoSave: true,
  language: 'en'
}

describe('useUserSettings', () => {
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

  describe('useUserSettings', () => {
    it('should return default user settings when localStorage is empty', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useUserSettings(), {
        wrapper: createWrapper(queryClient)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(defaultUserSettings)
    })

    it('should load user settings from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserSettings))

      const { result } = renderHook(() => useUserSettings(), {
        wrapper: createWrapper(queryClient)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUserSettings)
    })

    it('should merge partial settings with defaults', async () => {
      const partialSettings = {
        language: 'cs',
        autoSave: false
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(partialSettings))

      const { result } = renderHook(() => useUserSettings(), {
        wrapper: createWrapper(queryClient)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual({
        ...defaultUserSettings,
        language: 'cs',
        autoSave: false
      })
    })

    it('should handle corrupted localStorage data gracefully', async () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const { result } = renderHook(() => useUserSettings(), {
        wrapper: createWrapper(queryClient)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(defaultUserSettings)
      expect(consoleMock.error).toHaveBeenCalledWith('Error loading user settings:', expect.any(Error))
    })

    it('should have correct query configuration', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useUserSettings(), {
        wrapper: createWrapper(queryClient)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Check that data is cached indefinitely
      const queryData = queryClient.getQueryState(USER_SETTINGS_QUERY_KEY)
      expect(queryData?.dataUpdatedAt).toBeGreaterThan(0)
    })
  })

  describe('useUpdateUserSettings', () => {
    it('should save user settings to localStorage successfully', async () => {
      const { result } = renderHook(() => useUpdateUserSettings(), {
        wrapper: createWrapper(queryClient)
      })

      await act(async () => {
        result.current.mutate(mockUserSettings)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith('trmn-user-settings', JSON.stringify(mockUserSettings))

      expect(result.current.data).toEqual(mockUserSettings)
    })

    it('should update query cache on successful save', async () => {
      const { result } = renderHook(() => useUpdateUserSettings(), {
        wrapper: createWrapper(queryClient)
      })

      await act(async () => {
        await result.current.mutateAsync(mockUserSettings)
      })

      const cachedData = queryClient.getQueryData<UserSettings>(USER_SETTINGS_QUERY_KEY)
      expect(cachedData).toEqual(mockUserSettings)
    })

    it('should handle localStorage save errors', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const { result } = renderHook(() => useUpdateUserSettings(), {
        wrapper: createWrapper(queryClient)
      })

      await act(async () => {
        result.current.mutate(mockUserSettings)
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(new Error('Storage quota exceeded'))
      expect(consoleMock.error).toHaveBeenCalledWith('Error saving user settings:', expect.any(Error))
    })

    it('should log success message in debug mode', async () => {
      // Mock debug mode
      vi.doMock('../config', () => ({
        isDebugEnabled: () => true
      }))

      const { result } = renderHook(() => useUpdateUserSettings(), {
        wrapper: createWrapper(queryClient)
      })

      await act(async () => {
        result.current.mutate(mockUserSettings)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(consoleMock.log).toHaveBeenCalledWith('⚙️ User settings saved to localStorage')
    })
  })

  describe('useUpdateSetting', () => {
    it('should update a specific setting field', async () => {
      // Set initial data
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, defaultUserSettings)

      const { result } = renderHook(() => useUpdateSetting(), {
        wrapper: createWrapper(queryClient)
      })

      await act(async () => {
        await result.current.updateSetting('language', 'cs')
      })

      const updatedData = queryClient.getQueryData<UserSettings>(USER_SETTINGS_QUERY_KEY)
      expect(updatedData?.language).toBe('cs')
      expect(updatedData?.layout).toBe('tree') // Other fields unchanged
    })

    it('should save updated setting to localStorage', async () => {
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, defaultUserSettings)

      const { result } = renderHook(() => useUpdateSetting(), {
        wrapper: createWrapper(queryClient)
      })

      await act(async () => {
        await result.current.updateSetting('autoSave', false)
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'trmn-user-settings',
        JSON.stringify({
          ...defaultUserSettings,
          autoSave: false
        })
      )
    })

    it('should revert on localStorage error', async () => {
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, defaultUserSettings)

      // Verify data is set correctly before error
      const initialData = queryClient.getQueryData<UserSettings>(USER_SETTINGS_QUERY_KEY)
      expect(initialData?.language).toBe('en')

      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const { result } = renderHook(() => useUpdateSetting(), {
        wrapper: createWrapper(queryClient)
      })

      let errorThrown = false
      await act(async () => {
        try {
          await result.current.updateSetting('language', 'cs')
        } catch (error) {
          errorThrown = true
          expect(error).toEqual(new Error('Storage error'))

          // Check cache immediately after error handling
          const dataAfterError = queryClient.getQueryData<UserSettings>(USER_SETTINGS_QUERY_KEY)
          expect(dataAfterError).toEqual(defaultUserSettings)
          expect(dataAfterError?.language).toBe('en')
        }
      })

      expect(errorThrown).toBe(true)
    })

    it('should handle empty cache gracefully', async () => {
      const { result } = renderHook(() => useUpdateSetting(), {
        wrapper: createWrapper(queryClient)
      })

      await act(async () => {
        await result.current.updateSetting('language', 'cs')
      })

      // Should not throw error and cache should remain empty
      const data = queryClient.getQueryData<UserSettings>(USER_SETTINGS_QUERY_KEY)
      expect(data).toBeUndefined()
    })

    it('should work with all setting types', async () => {
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, defaultUserSettings)

      const { result } = renderHook(() => useUpdateSetting(), {
        wrapper: createWrapper(queryClient)
      })

      // Test language
      await result.current.updateSetting('language', 'cs')
      await result.current.updateSetting('layout', 'force')
      await result.current.updateSetting('showCompleted', false)
      await result.current.updateSetting('autoSave', false)

      // Verify final state
      const finalData = queryClient.getQueryData<UserSettings>(USER_SETTINGS_QUERY_KEY)
      expect(finalData).toEqual({
        ...defaultUserSettings,
        language: 'cs',
        layout: 'force',
        showCompleted: false,
        autoSave: false
      })
    })
  })

  describe('useOptimisticUserSettings', () => {
    it('should update settings optimistically', async () => {
      // Set initial data
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, defaultUserSettings)

      const { result } = renderHook(() => useOptimisticUserSettings(), {
        wrapper: createWrapper(queryClient)
      })

      const updater = (current: UserSettings): UserSettings => ({
        ...current,
        language: 'cs' as const,
        autoSave: false
      })

      await result.current.updateOptimistically(updater)

      const updatedData = queryClient.getQueryData<UserSettings>(USER_SETTINGS_QUERY_KEY)
      expect(updatedData?.language).toBe('cs')
      expect(updatedData?.autoSave).toBe(false)
    })

    it('should revert changes on localStorage error', async () => {
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, defaultUserSettings)
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const { result } = renderHook(() => useOptimisticUserSettings(), {
        wrapper: createWrapper(queryClient)
      })

      const updater = (current: UserSettings): UserSettings => ({
        ...current,
        language: 'cs' as const
      })

      let errorThrown = false
      await act(async () => {
        try {
          await result.current.updateOptimistically(updater)
        } catch (error) {
          errorThrown = true
          expect(error).toEqual(new Error('Storage error'))

          // Check cache immediately after error in the catch block
          const dataAfterError = queryClient.getQueryData<UserSettings>(USER_SETTINGS_QUERY_KEY)
          expect(dataAfterError).toEqual(defaultUserSettings)
          expect(dataAfterError?.layout).toBe('tree')
        }
      })

      expect(errorThrown).toBe(true)
    })

    it('should handle empty cache gracefully', async () => {
      const { result } = renderHook(() => useOptimisticUserSettings(), {
        wrapper: createWrapper(queryClient)
      })

      const updater = (current: UserSettings): UserSettings => ({
        ...current,
        language: 'cs' as const
      })

      await act(async () => {
        await result.current.updateOptimistically(updater)
      })

      // Should not throw error and cache should remain empty
      const data = queryClient.getQueryData<UserSettings>(USER_SETTINGS_QUERY_KEY)
      expect(data).toBeUndefined()
    })
  })

  describe('integration tests', () => {
    it('should work with complete flow: load -> update -> specific setting update', async () => {
      // Start with data in localStorage
      const initialSettings = {
        language: 'en' as const
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(initialSettings))

      // Load initial data
      const { result: queryResult } = renderHook(() => useUserSettings(), {
        wrapper: createWrapper(queryClient)
      })

      await waitFor(() => {
        expect(queryResult.current.isSuccess).toBe(true)
      })

      // Update via mutation
      const { result: mutationResult } = renderHook(() => useUpdateUserSettings(), {
        wrapper: createWrapper(queryClient)
      })

      expect(queryResult.current.data).toBeDefined()
      const updatedSettings = {
        ...(queryResult.current.data as UserSettings),
        language: 'cs' as const
      }

      await act(async () => {
        mutationResult.current.mutate(updatedSettings)
      })

      await waitFor(() => {
        expect(mutationResult.current.isSuccess).toBe(true)
      })

      // Update specific setting
      const { result: specificResult } = renderHook(() => useUpdateSetting(), {
        wrapper: createWrapper(queryClient)
      })

      await act(async () => {
        await specificResult.current.updateSetting('autoSave', false)
      })

      const finalData = queryClient.getQueryData<UserSettings>(USER_SETTINGS_QUERY_KEY)
      expect(finalData?.language).toBe('cs')
      expect(finalData?.autoSave).toBe(false)
      expect(finalData?.layout).toBe('tree')
    })
  })
})
