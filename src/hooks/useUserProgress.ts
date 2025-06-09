import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserProgress, SpecialRuleProgress } from '../types'
import { getLogger } from '../utils/logger'

const USER_PROGRESS_QUERY_KEY = ['userProgress']
const USER_PROGRESS_STORAGE_KEY = 'trmn-user-progress'
const DB_NAME = 'TRMNCourseTracker'
const DB_VERSION = 2 // Increment version for schema change
const METADATA_STORE = 'userMetadata'
const COURSES_STORE = 'courseStates'
const METADATA_KEY = 'main'

// Course status types
type CourseStatus = 'completed' | 'available' | 'inProgress' | 'waitingGrade'

// User metadata (without course lists)
interface UserMetadata {
  userId: string
  specialRulesProgress: Array<[string, SpecialRuleProgress]>
  lastUpdated: string
}

// Course state record
interface CourseStateRecord {
  courseId: string
  status: CourseStatus
  lastUpdated: string
}

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

        // Create metadata store for user info and special rules
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE, { keyPath: 'id' })
          getLogger().log('📦 Created IndexedDB metadata store')
        }

        // Create courses store for individual course states
        if (!db.objectStoreNames.contains(COURSES_STORE)) {
          const courseStore = db.createObjectStore(COURSES_STORE, { keyPath: 'courseId' })
          courseStore.createIndex('status', 'status', { unique: false })
          courseStore.createIndex('lastUpdated', 'lastUpdated', { unique: false })
          getLogger().log('📦 Created IndexedDB course states store')
        }

        // Migration from v1 to v2: move old data to new structure
        if (event.oldVersion < 2) {
          const transaction = (event.target as IDBOpenDBRequest).transaction
          if (transaction && db.objectStoreNames.contains('userProgress')) {
            this.migrateFromV1ToV2(transaction, db)
          }
        }
      }
    })
  }

  private async migrateFromV1ToV2(transaction: IDBTransaction, _db: IDBDatabase): Promise<void> {
    try {
      const oldStore = transaction.objectStore('userProgress')
      const request = oldStore.get('main')

      request.onsuccess = async () => {
        const oldData = request.result
        if (oldData) {
          getLogger().log('🔄 Migrating from IndexedDB v1 to v2 structure...')

          // Save metadata
          const metadataStore = transaction.objectStore(METADATA_STORE)
          const metadata: UserMetadata = {
            userId: oldData.userId || 'default-user',
            specialRulesProgress: oldData.specialRulesProgress || [],
            lastUpdated: oldData.lastUpdated || new Date().toISOString()
          }
          metadataStore.put({ id: METADATA_KEY, ...metadata })

          // Save individual course states
          const courseStore = transaction.objectStore(COURSES_STORE)
          const now = new Date().toISOString()

          // Process each course list
          const courseLists = [
            { courses: oldData.completedCourses || [], status: 'completed' as CourseStatus },
            { courses: oldData.availableCourses || [], status: 'available' as CourseStatus },
            { courses: oldData.inProgressCourses || [], status: 'inProgress' as CourseStatus },
            { courses: oldData.waitingGradeCourses || [], status: 'waitingGrade' as CourseStatus }
          ]

          for (const { courses, status } of courseLists) {
            for (const courseId of courses) {
              const record: CourseStateRecord = {
                courseId,
                status,
                lastUpdated: now
              }
              courseStore.put(record)
            }
          }

          getLogger().log('✅ Successfully migrated to IndexedDB v2 structure')
        }
      }
    } catch (err) {
      getLogger().error('❌ Error during IndexedDB v1 to v2 migration:', err)
    }
  }

  async saveMetadata(metadata: UserMetadata): Promise<void> {
    if (!this.isAvailable || !this.dbPromise) {
      throw new Error('IndexedDB is not available')
    }

    const db = await this.dbPromise

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], 'readwrite')
      const store = transaction.objectStore(METADATA_STORE)

      const request = store.put({ id: METADATA_KEY, ...metadata })

      request.onerror = () => {
        getLogger().error('Failed to save metadata to IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }

  async loadMetadata(): Promise<UserMetadata | null> {
    if (!this.isAvailable || !this.dbPromise) {
      throw new Error('IndexedDB is not available')
    }

    const db = await this.dbPromise

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], 'readonly')
      const store = transaction.objectStore(METADATA_STORE)
      const request = store.get(METADATA_KEY)

      request.onerror = () => {
        getLogger().error('Failed to load metadata from IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        const result = request.result
        if (result) {
          resolve({
            userId: result.userId,
            specialRulesProgress: result.specialRulesProgress,
            lastUpdated: result.lastUpdated
          })
        } else {
          resolve(null)
        }
      }
    })
  }

  async setCourseStatus(courseId: string, status: CourseStatus): Promise<void> {
    if (!this.isAvailable || !this.dbPromise) {
      throw new Error('IndexedDB is not available')
    }

    const db = await this.dbPromise

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COURSES_STORE], 'readwrite')
      const store = transaction.objectStore(COURSES_STORE)

      const record: CourseStateRecord = {
        courseId,
        status,
        lastUpdated: new Date().toISOString()
      }

      const request = store.put(record)

      request.onerror = () => {
        getLogger().error('Failed to set course status in IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }

  async removeCourse(courseId: string): Promise<void> {
    if (!this.isAvailable || !this.dbPromise) {
      throw new Error('IndexedDB is not available')
    }

    const db = await this.dbPromise

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COURSES_STORE], 'readwrite')
      const store = transaction.objectStore(COURSES_STORE)

      const request = store.delete(courseId)

      request.onerror = () => {
        getLogger().error('Failed to remove course from IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }

  async loadAllCourseStates(): Promise<CourseStateRecord[]> {
    if (!this.isAvailable || !this.dbPromise) {
      throw new Error('IndexedDB is not available')
    }

    const db = await this.dbPromise

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COURSES_STORE], 'readonly')
      const store = transaction.objectStore(COURSES_STORE)
      const request = store.getAll()

      request.onerror = () => {
        getLogger().error('Failed to load course states from IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        resolve(request.result || [])
      }
    })
  }

  async bulkUpdateCourseStates(updates: Array<{ courseId: string; status: CourseStatus }>): Promise<void> {
    if (!this.isAvailable || !this.dbPromise) {
      throw new Error('IndexedDB is not available')
    }

    const db = await this.dbPromise

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COURSES_STORE], 'readwrite')
      const store = transaction.objectStore(COURSES_STORE)
      const now = new Date().toISOString()

      let completed = 0
      const total = updates.length

      if (total === 0) {
        resolve()
        return
      }

      const onComplete = () => {
        completed++
        if (completed === total) {
          resolve()
        }
      }

      const onError = (error: unknown) => {
        getLogger().error('Failed to bulk update course states:', error)
        reject(error)
      }

      for (const { courseId, status } of updates) {
        const record: CourseStateRecord = {
          courseId,
          status,
          lastUpdated: now
        }

        const request = store.put(record)
        request.onsuccess = onComplete
        request.onerror = () => onError(request.error)
      }
    })
  }

  async clear(): Promise<void> {
    if (!this.isAvailable || !this.dbPromise) {
      throw new Error('IndexedDB is not available')
    }

    const db = await this.dbPromise

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE, COURSES_STORE], 'readwrite')

      let completed = 0
      const onComplete = () => {
        completed++
        if (completed === 2) {
          getLogger().log('🗑️ User progress cleared from IndexedDB')
          resolve()
        }
      }

      const onError = (error: unknown) => {
        getLogger().error('Failed to clear user progress from IndexedDB:', error)
        reject(error)
      }

      // Clear metadata
      const metadataRequest = transaction.objectStore(METADATA_STORE).clear()
      metadataRequest.onsuccess = onComplete
      metadataRequest.onerror = () => onError(metadataRequest.error)

      // Clear course states
      const coursesRequest = transaction.objectStore(COURSES_STORE).clear()
      coursesRequest.onsuccess = onComplete
      coursesRequest.onerror = () => onError(coursesRequest.error)
    })
  }

  // Legacy method for backward compatibility
  async save(progress: UserProgress): Promise<void> {
    // Save metadata
    const metadata: UserMetadata = {
      userId: progress.userId,
      specialRulesProgress: Array.from(progress.specialRulesProgress.entries()),
      lastUpdated: progress.lastUpdated.toISOString()
    }
    await this.saveMetadata(metadata)

    // Prepare course updates
    const updates: Array<{ courseId: string; status: CourseStatus }> = []

    progress.completedCourses.forEach((courseId) => updates.push({ courseId, status: 'completed' }))
    progress.availableCourses.forEach((courseId) => updates.push({ courseId, status: 'available' }))
    progress.inProgressCourses.forEach((courseId) => updates.push({ courseId, status: 'inProgress' }))
    progress.waitingGradeCourses.forEach((courseId) => updates.push({ courseId, status: 'waitingGrade' }))

    // Clear existing course states and add new ones
    await this.clear()
    await this.bulkUpdateCourseStates(updates)

    getLogger().log('💾 User progress saved to IndexedDB (optimized)')
  }

  // Legacy method for backward compatibility
  async load(): Promise<UserProgress | null> {
    try {
      const [metadata, courseStates] = await Promise.all([this.loadMetadata(), this.loadAllCourseStates()])

      if (!metadata) {
        return null
      }

      // Reconstruct UserProgress from optimized storage
      const completedCourses = new Set<string>()
      const availableCourses = new Set<string>()
      const inProgressCourses = new Set<string>()
      const waitingGradeCourses = new Set<string>()

      for (const record of courseStates) {
        switch (record.status) {
          case 'completed':
            completedCourses.add(record.courseId)
            break
          case 'available':
            availableCourses.add(record.courseId)
            break
          case 'inProgress':
            inProgressCourses.add(record.courseId)
            break
          case 'waitingGrade':
            waitingGradeCourses.add(record.courseId)
            break
        }
      }

      return {
        userId: metadata.userId,
        completedCourses,
        availableCourses,
        inProgressCourses,
        waitingGradeCourses,
        specialRulesProgress: new Map(metadata.specialRulesProgress),
        lastUpdated: new Date(metadata.lastUpdated)
      }
    } catch (err) {
      getLogger().error('Failed to load user progress from IndexedDB:', err)
      throw err
    }
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

      // Save to IndexedDB using optimized structure
      await userProgressDB.save(progress)

      // Remove from localStorage after successful migration
      localStorage.removeItem(USER_PROGRESS_STORAGE_KEY)

      getLogger().log('✅ Successfully migrated user progress to IndexedDB (optimized)')
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

// Optimized hook for single course status updates
export const useUpdateCourseStatus = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { courseId: string; status: CourseStatus; fromStatus?: CourseStatus }>({
    mutationFn: async ({ courseId, status }) => {
      if (isIndexedDBAvailable()) {
        await userProgressDB.setCourseStatus(courseId, status)
      } else {
        // Fallback to full progress update for localStorage
        const currentData = queryClient.getQueryData<UserProgress>(USER_PROGRESS_QUERY_KEY)
        if (currentData) {
          const updatedProgress = { ...currentData }

          // Remove from all sets first
          updatedProgress.completedCourses.delete(courseId)
          updatedProgress.availableCourses.delete(courseId)
          updatedProgress.inProgressCourses.delete(courseId)
          updatedProgress.waitingGradeCourses.delete(courseId)

          // Add to appropriate set
          switch (status) {
            case 'completed':
              updatedProgress.completedCourses.add(courseId)
              break
            case 'available':
              updatedProgress.availableCourses.add(courseId)
              break
            case 'inProgress':
              updatedProgress.inProgressCourses.add(courseId)
              break
            case 'waitingGrade':
              updatedProgress.waitingGradeCourses.add(courseId)
              break
          }

          updatedProgress.lastUpdated = new Date()
          await saveUserProgress(updatedProgress)
        }
      }
    },
    onSuccess: (_, { courseId, status, fromStatus }) => {
      // Optimistically update the cache
      const currentData = queryClient.getQueryData<UserProgress>(USER_PROGRESS_QUERY_KEY)
      if (currentData) {
        const updatedProgress = { ...currentData }

        // Remove from previous status if specified
        if (fromStatus) {
          switch (fromStatus) {
            case 'completed':
              updatedProgress.completedCourses.delete(courseId)
              break
            case 'available':
              updatedProgress.availableCourses.delete(courseId)
              break
            case 'inProgress':
              updatedProgress.inProgressCourses.delete(courseId)
              break
            case 'waitingGrade':
              updatedProgress.waitingGradeCourses.delete(courseId)
              break
          }
        } else {
          // Remove from all sets if fromStatus not specified
          updatedProgress.completedCourses.delete(courseId)
          updatedProgress.availableCourses.delete(courseId)
          updatedProgress.inProgressCourses.delete(courseId)
          updatedProgress.waitingGradeCourses.delete(courseId)
        }

        // Add to new status
        switch (status) {
          case 'completed':
            updatedProgress.completedCourses.add(courseId)
            break
          case 'available':
            updatedProgress.availableCourses.add(courseId)
            break
          case 'inProgress':
            updatedProgress.inProgressCourses.add(courseId)
            break
          case 'waitingGrade':
            updatedProgress.waitingGradeCourses.add(courseId)
            break
        }

        updatedProgress.lastUpdated = new Date()
        queryClient.setQueryData(USER_PROGRESS_QUERY_KEY, updatedProgress)
      }

      getLogger().log(`✅ Course ${courseId} status updated to ${status}`)
    },
    onError: (error, { courseId }) => {
      getLogger().error(`❌ Failed to update course ${courseId} status:`, error)
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000)
  })
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

// Export types for external use
export type { CourseStatus, CourseStateRecord }
