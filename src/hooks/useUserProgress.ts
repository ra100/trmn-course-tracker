import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserProgress } from '../types'
import { getLogger } from '../utils/logger'

const USER_PROGRESS_QUERY_KEY = ['userProgress']
const USER_PROGRESS_STORAGE_KEY = 'trmn-user-progress'
const DB_NAME = 'TRMNCourseTracker'
const DB_VERSION = 1
const STORE_NAME = 'userProgress'
const PROGRESS_KEY = 'main'

// Check if IndexedDB is available
const isIndexedDBAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && indexedDB !== null
  } catch {
    return false
  }
}

// IndexedDB utilities
class UserProgressDB {
  private dbPromise: Promise<IDBDatabase> | null = null
  private isAvailable: boolean

  constructor() {
    this.isAvailable = isIndexedDBAvailable()
    if (this.isAvailable) {
      this.dbPromise = this.initDB()
    }
  }

  private async initDB(): Promise<IDBDatabase> {
    if (!this.isAvailable) {
      throw new Error('IndexedDB is not available')
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        getLogger().error('Failed to open IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('lastUpdated', 'lastUpdated', { unique: false })
          getLogger().log('📦 Created IndexedDB object store for user progress')
        }
      }
    })
  }

  async save(progress: UserProgress): Promise<void> {
    if (!this.isAvailable || !this.dbPromise) {
      throw new Error('IndexedDB is not available')
    }

    const db = await this.dbPromise

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const serializable = {
        id: PROGRESS_KEY,
        ...progress,
        completedCourses: Array.from(progress.completedCourses),
        availableCourses: Array.from(progress.availableCourses),
        inProgressCourses: Array.from(progress.inProgressCourses),
        waitingGradeCourses: Array.from(progress.waitingGradeCourses),
        specialRulesProgress: Array.from(progress.specialRulesProgress.entries()),
        lastUpdated: progress.lastUpdated.toISOString()
      }

      const request = store.put(serializable)

      request.onerror = () => {
        getLogger().error('Failed to save user progress to IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        getLogger().log('💾 User progress saved to IndexedDB')
        resolve()
      }
    })
  }

  async load(): Promise<UserProgress | null> {
    if (!this.isAvailable || !this.dbPromise) {
      throw new Error('IndexedDB is not available')
    }

    const db = await this.dbPromise

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(PROGRESS_KEY)

      request.onerror = () => {
        getLogger().error('Failed to load user progress from IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        const result = request.result
        if (result) {
          const progress: UserProgress = {
            ...result,
            completedCourses: new Set(result.completedCourses || []),
            availableCourses: new Set(result.availableCourses || []),
            inProgressCourses: new Set(result.inProgressCourses || []),
            waitingGradeCourses: new Set(result.waitingGradeCourses || []),
            specialRulesProgress: new Map(result.specialRulesProgress || []),
            lastUpdated: new Date(result.lastUpdated || Date.now())
          }
          resolve(progress)
        } else {
          resolve(null)
        }
      }
    })
  }

  async clear(): Promise<void> {
    if (!this.isAvailable || !this.dbPromise) {
      throw new Error('IndexedDB is not available')
    }

    const db = await this.dbPromise

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(PROGRESS_KEY)

      request.onerror = () => {
        getLogger().error('Failed to clear user progress from IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        getLogger().log('🗑️ User progress cleared from IndexedDB')
        resolve()
      }
    })
  }
}

// Singleton instance
const userProgressDB = new UserProgressDB()

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

// Load from localStorage
const loadFromLocalStorage = (): UserProgress | null => {
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
    getLogger().error('Error loading user progress from localStorage:', err)
  }
  return null
}

// Save to localStorage
const saveToLocalStorage = (progress: UserProgress): void => {
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
  } catch (err) {
    getLogger().error('Error saving user progress to localStorage:', err)
    throw err
  }
}

// Migration: Load from localStorage and move to IndexedDB
const migrateFromLocalStorage = async (): Promise<UserProgress | null> => {
  const progress = loadFromLocalStorage()
  if (progress && isIndexedDBAvailable()) {
    try {
      getLogger().log('🔄 Migrating user progress from localStorage to IndexedDB...')

      // Save to IndexedDB
      await userProgressDB.save(progress)

      // Remove from localStorage after successful migration
      localStorage.removeItem(USER_PROGRESS_STORAGE_KEY)

      getLogger().log('✅ Successfully migrated user progress to IndexedDB')
      return progress
    } catch (err) {
      getLogger().error('❌ Error during migration from localStorage:', err)
    }
  }

  return progress
}

// Load user progress with migration support
const loadUserProgress = async (): Promise<UserProgress> => {
  try {
    // If IndexedDB is available, try to load from it first
    if (isIndexedDBAvailable()) {
      try {
        const existingProgress = await userProgressDB.load()
        if (existingProgress) {
          return existingProgress
        }

        // If no IndexedDB data, try migration from localStorage
        const migratedProgress = await migrateFromLocalStorage()
        if (migratedProgress) {
          return migratedProgress
        }
      } catch (indexedDBError) {
        getLogger().error('❌ Error with IndexedDB, falling back to localStorage:', indexedDBError)
      }
    }

    // Fallback to localStorage (for environments without IndexedDB or when IndexedDB fails)
    const localStorageProgress = loadFromLocalStorage()
    if (localStorageProgress) {
      return localStorageProgress
    }

    // If no data exists anywhere, return default
    const defaultProgress = getDefaultUserProgress()

    // Try to save default to IndexedDB first, fallback to localStorage
    if (isIndexedDBAvailable()) {
      try {
        await userProgressDB.save(defaultProgress)
      } catch {
        saveToLocalStorage(defaultProgress)
      }
    } else {
      saveToLocalStorage(defaultProgress)
    }

    return defaultProgress
  } catch (err) {
    getLogger().error('❌ Error loading user progress:', err)
    return getDefaultUserProgress()
  }
}

// Save user progress to IndexedDB with localStorage fallback
const saveUserProgress = async (progress: UserProgress): Promise<UserProgress> => {
  try {
    // Try IndexedDB first if available
    if (isIndexedDBAvailable()) {
      await userProgressDB.save(progress)
      return progress
    }
  } catch (err) {
    getLogger().error('❌ Error saving user progress to IndexedDB:', err)
  }

  // Fallback: save to localStorage
  try {
    saveToLocalStorage(progress)
    getLogger().log('💾 User progress saved to localStorage (fallback)')
    return progress
  } catch (fallbackErr) {
    getLogger().error('❌ Fallback localStorage save failed:', fallbackErr)
    throw fallbackErr
  }
}

// Hook for user progress
export const useUserProgress = () => {
  return useQuery<UserProgress, Error>({
    queryKey: USER_PROGRESS_QUERY_KEY,
    queryFn: loadUserProgress,
    staleTime: 5 * 60 * 1000, // 5 minutes - reasonable for IndexedDB
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3, // Retry failed loads
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

// Hook for updating user progress
export const useUpdateUserProgress = () => {
  const queryClient = useQueryClient()

  return useMutation<UserProgress, Error, UserProgress>({
    mutationFn: saveUserProgress,
    onSuccess: (updatedProgress) => {
      // Update the cache immediately
      queryClient.setQueryData(USER_PROGRESS_QUERY_KEY, updatedProgress)
      getLogger().log('✅ User progress updated successfully')
    },
    onError: (error) => {
      getLogger().error('❌ Failed to update user progress:', error)
    },
    retry: 2, // Retry failed saves
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
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

      // Save to storage in the background
      try {
        await saveUserProgress(newData)
      } catch (err) {
        // Revert on error
        queryClient.setQueryData(USER_PROGRESS_QUERY_KEY, currentData)
        throw err
      }
    }
  }

  return { updateOptimistically }
}

// Utility function for manual migration (if needed)
export const triggerMigration = async (): Promise<void> => {
  try {
    await migrateFromLocalStorage()
  } catch (err) {
    getLogger().error('❌ Manual migration failed:', err)
    throw err
  }
}

// Utility function to clear all progress data
export const clearAllProgress = async (): Promise<void> => {
  try {
    if (isIndexedDBAvailable()) {
      await userProgressDB.clear()
    }
    localStorage.removeItem(USER_PROGRESS_STORAGE_KEY)
    getLogger().log('🗑️ All user progress data cleared')
  } catch (err) {
    getLogger().error('❌ Failed to clear progress data:', err)
    throw err
  }
}

// Export query key for cache invalidation
export { USER_PROGRESS_QUERY_KEY }
