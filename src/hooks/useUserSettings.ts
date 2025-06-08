import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserSettings } from '../types'
import { isDebugEnabled } from '../config'

const USER_SETTINGS_QUERY_KEY = ['userSettings']
const USER_SETTINGS_STORAGE_KEY = 'trmn-user-settings'

// Default user settings
const getDefaultUserSettings = (): UserSettings => ({
  theme: 'light',
  layout: 'tree',
  showCompleted: true,
  showUnavailable: true,
  autoSave: true,
  language: 'en'
})

// Load user settings from localStorage
const loadUserSettingsFromStorage = (): UserSettings => {
  try {
    const saved = localStorage.getItem(USER_SETTINGS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        ...getDefaultUserSettings(),
        ...parsed
      }
    }
  } catch (err) {
    if (isDebugEnabled()) {
      console.error('Error loading user settings:', err)
    }
  }

  return getDefaultUserSettings()
}

// Save user settings to localStorage
const saveUserSettingsToStorage = async (settings: UserSettings): Promise<UserSettings> => {
  try {
    localStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(settings))

    if (isDebugEnabled()) {
      console.log('⚙️ User settings saved to localStorage')
    }

    return Promise.resolve(settings)
  } catch (err) {
    if (isDebugEnabled()) {
      console.error('Error saving user settings:', err)
    }
    throw err
  }
}

// Hook for user settings
export const useUserSettings = () => {
  return useQuery<UserSettings, Error>({
    queryKey: USER_SETTINGS_QUERY_KEY,
    queryFn: loadUserSettingsFromStorage,
    staleTime: Infinity, // Never consider localStorage data stale
    gcTime: Infinity // Keep in cache indefinitely
  })
}

// Hook for updating user settings
export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient()

  return useMutation<UserSettings, Error, UserSettings>({
    mutationFn: saveUserSettingsToStorage,
    onSuccess: (updatedSettings) => {
      // Update the cache immediately
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, updatedSettings)

      if (isDebugEnabled()) {
        console.log('✅ User settings updated successfully')
      }
    },
    onError: (error) => {
      if (isDebugEnabled()) {
        console.error('❌ Failed to update user settings:', error)
      }
    }
  })
}

// Hook for updating specific setting fields
export const useUpdateSetting = () => {
  const queryClient = useQueryClient()

  const updateSetting = async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const currentSettings = queryClient.getQueryData<UserSettings>(USER_SETTINGS_QUERY_KEY)
    if (currentSettings) {
      const newSettings = { ...currentSettings, [key]: value }

      // Update cache optimistically
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, newSettings)

      // Save to localStorage
      try {
        await saveUserSettingsToStorage(newSettings)
      } catch (err) {
        // Revert on error
        queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, currentSettings)
        throw err
      }

      return newSettings
    }
  }

  return { updateSetting }
}

// Hook for optimistic settings updates
export const useOptimisticUserSettings = () => {
  const queryClient = useQueryClient()

  const updateOptimistically = async (updater: (current: UserSettings) => UserSettings) => {
    const currentData = queryClient.getQueryData<UserSettings>(USER_SETTINGS_QUERY_KEY)
    if (currentData) {
      const newData = updater(currentData)
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, newData)

      // Save to localStorage in the background
      try {
        await saveUserSettingsToStorage(newData)
      } catch (err) {
        // Revert on error
        queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, currentData)
        throw err
      }
    }
  }

  return { updateOptimistically }
}

// Export query key for cache invalidation
export { USER_SETTINGS_QUERY_KEY }
