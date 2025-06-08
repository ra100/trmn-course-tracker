import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserProgress } from '../types'
import { isDebugEnabled } from '../config'

const USER_PROGRESS_QUERY_KEY = ['userProgress']
const USER_PROGRESS_STORAGE_KEY = 'trmn-user-progress'

// Default user progress
const getDefaultUserProgress = (): UserProgress => ({
  userId: 'default-user',
  completedCourses: new Set<string>(),
  availableCourses: new Set<string>(),
  inProgressCourses: new Set<string>(),
  waitingGradeCourses: new Set<string>(),
  specialRulesProgress: new Map(),
  lastUpdated: new Date()
})

// Load user progress from localStorage
const loadUserProgressFromStorage = (): UserProgress => {
  try {
    const saved = localStorage.getItem(USER_PROGRESS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        ...parsed,
        completedCourses: new Set(parsed.completedCourses || []),
        availableCourses: new Set(parsed.availableCourses || []),
        inProgressCourses: new Set(parsed.inProgressCourses || []),
        waitingGradeCourses: new Set(parsed.waitingGradeCourses || []),
        specialRulesProgress: new Map(parsed.specialRulesProgress || []),
        lastUpdated: new Date(parsed.lastUpdated || Date.now())
      }
    }
  } catch (err) {
    if (isDebugEnabled()) {
      console.error('Error loading user progress:', err)
    }
  }

  return getDefaultUserProgress()
}

// Save user progress to localStorage
const saveUserProgressToStorage = async (progress: UserProgress): Promise<UserProgress> => {
  try {
    const serializable = {
      ...progress,
      completedCourses: Array.from(progress.completedCourses),
      availableCourses: Array.from(progress.availableCourses),
      inProgressCourses: Array.from(progress.inProgressCourses),
      waitingGradeCourses: Array.from(progress.waitingGradeCourses),
      specialRulesProgress: Array.from(progress.specialRulesProgress.entries()),
      lastUpdated: progress.lastUpdated.toISOString()
    }
    localStorage.setItem(USER_PROGRESS_STORAGE_KEY, JSON.stringify(serializable))

    if (isDebugEnabled()) {
      console.log('💾 User progress saved to localStorage')
    }

    return progress
  } catch (err) {
    if (isDebugEnabled()) {
      console.error('Error saving user progress:', err)
    }
    throw err
  }
}

// Hook for user progress
export const useUserProgress = () => {
  return useQuery<UserProgress, Error>({
    queryKey: USER_PROGRESS_QUERY_KEY,
    queryFn: loadUserProgressFromStorage,
    staleTime: Infinity, // Never consider localStorage data stale
    gcTime: Infinity // Keep in cache indefinitely
  })
}

// Hook for updating user progress
export const useUpdateUserProgress = () => {
  const queryClient = useQueryClient()

  return useMutation<UserProgress, Error, UserProgress>({
    mutationFn: saveUserProgressToStorage,
    onSuccess: (updatedProgress) => {
      // Update the cache immediately
      queryClient.setQueryData(USER_PROGRESS_QUERY_KEY, updatedProgress)

      if (isDebugEnabled()) {
        console.log('✅ User progress updated successfully')
      }
    },
    onError: (error) => {
      if (isDebugEnabled()) {
        console.error('❌ Failed to update user progress:', error)
      }
    }
  })
}

// Hook for optimistic updates (for better UX)
export const useOptimisticUserProgress = () => {
  const queryClient = useQueryClient()

  const updateOptimistically = async (updater: (current: UserProgress) => UserProgress) => {
    const currentData = queryClient.getQueryData<UserProgress>(USER_PROGRESS_QUERY_KEY)
    if (currentData) {
      const newData = updater(currentData)
      queryClient.setQueryData(USER_PROGRESS_QUERY_KEY, newData)

      // Save to localStorage in the background
      try {
        await saveUserProgressToStorage(newData)
      } catch (err) {
        // Revert on error
        queryClient.setQueryData(USER_PROGRESS_QUERY_KEY, currentData)
        throw err
      }
    }
  }

  return { updateOptimistically }
}

// Export query key for cache invalidation
export { USER_PROGRESS_QUERY_KEY }
