import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserProgress, SpecialRuleProgress } from '../types'
import { logger } from '../utils/logger'

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
  previousStatus?: CourseStatus
  completionDate?: string
}

// Check if IndexedDB is available
const isIndexedDBAvailable = (): boolean => {
  try {
    const available = typeof window !== 'undefined' && 'indexedDB' in window && indexedDB !== null
    logger.log(`🔍 IndexedDB availability check: ${available}`)
    if (available) {
      logger.log('✅ IndexedDB is available and will be used')
    } else {
      logger.log('❌ IndexedDB not available, falling back to localStorage')
    }
    return available
  } catch (err) {
    logger.error('❌ Error checking IndexedDB availability:', err)
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
        logger.error('Failed to open IndexedDB:', request.error)
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
          logger.log('📦 Created IndexedDB metadata store')
        }

        // Create courses store for individual course states
        if (!db.objectStoreNames.contains(COURSES_STORE)) {
          const courseStore = db.createObjectStore(COURSES_STORE, { keyPath: 'courseId' })
          courseStore.createIndex('status', 'status', { unique: false })
          courseStore.createIndex('lastUpdated', 'lastUpdated', { unique: false })
          logger.log('📦 Created IndexedDB course states store')
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
          logger.log('🔄 Migrating from IndexedDB v1 to v2 structure...')

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

          logger.log('✅ Successfully migrated to IndexedDB v2 structure')
        }
      }
    } catch (err) {
      logger.error('❌ Error during IndexedDB v1 to v2 migration:', err)
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
        logger.error('Failed to save metadata to IndexedDB:', request.error)
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
        logger.error('Failed to load metadata from IndexedDB:', request.error)
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
        logger.error('Failed to set course status in IndexedDB:', request.error)
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
        logger.error('Failed to remove course from IndexedDB:', request.error)
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
        logger.error('Failed to load course states from IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        resolve(request.result || [])
      }
    })
  }

  async bulkUpdateCourseStates(
    updates: Array<{ courseId: string; status: CourseStatus; completionDate?: string }>
  ): Promise<void> {
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
        logger.error('Failed to bulk update course states:', error)
        reject(error)
      }

      for (const { courseId, status, completionDate } of updates) {
        const record: CourseStateRecord = {
          courseId,
          status,
          lastUpdated: now,
          completionDate
        }

        const request = store.put(record)
        request.onsuccess = onComplete
        request.onerror = () => onError(request.error)
      }
    })
  }

  async clearCourseStates(): Promise<void> {
    if (!this.isAvailable || !this.dbPromise) {
      throw new Error('IndexedDB is not available')
    }

    const db = await this.dbPromise

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COURSES_STORE], 'readwrite')
      const store = transaction.objectStore(COURSES_STORE)

      const request = store.clear()

      request.onerror = () => {
        logger.error('Failed to clear course states from IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        logger.log('🗑️ Course states cleared from IndexedDB')
        resolve()
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
          logger.log('🗑️ User progress cleared from IndexedDB')
          resolve()
        }
      }

      const onError = (error: unknown) => {
        logger.error('Failed to clear user progress from IndexedDB:', error)
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
    logger.log('📦 Starting IndexedDB save operation...')

    // Prepare course updates with completion dates
    const updates: Array<{ courseId: string; status: CourseStatus; completionDate?: string }> = []

    progress.completedCourses.forEach((courseId) => {
      const completionDate = progress.courseCompletionDates.get(courseId)
      updates.push({
        courseId,
        status: 'completed',
        completionDate: completionDate?.toISOString()
      })
    })
    progress.availableCourses.forEach((courseId) => updates.push({ courseId, status: 'available' }))
    progress.inProgressCourses.forEach((courseId) => updates.push({ courseId, status: 'inProgress' }))
    progress.waitingGradeCourses.forEach((courseId) => updates.push({ courseId, status: 'waitingGrade' }))

    logger.log(`📦 Preparing to save ${updates.length} course state records...`)

    // Debug completion dates being saved
    const completionDatesCount = updates.filter((u) => u.completionDate).length
    if (completionDatesCount > 0) {
      logger.log(`📅 Saving ${completionDatesCount} completion dates to IndexedDB`)
    }

    // Clear existing course states first (but NOT metadata)
    logger.log('🗑️ Clearing existing course states...')
    await this.clearCourseStates()

    logger.log('📦 Bulk updating course states...')
    await this.bulkUpdateCourseStates(updates)

    // Save metadata AFTER course states to ensure consistency
    const metadata: UserMetadata = {
      userId: progress.userId,
      specialRulesProgress: Array.from(progress.specialRulesProgress.entries()),
      lastUpdated: progress.lastUpdated.toISOString()
    }

    logger.log('📦 Saving metadata to IndexedDB...')
    await this.saveMetadata(metadata)

    logger.log('✅ IndexedDB save operation completed successfully')
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
      const courseStatusTimestamps = new Map<string, import('../types').CourseStatusTimestamp>()
      const courseCompletionDates = new Map<string, Date>()

      for (const record of courseStates) {
        switch (record.status) {
          case 'completed':
            completedCourses.add(record.courseId)
            // Restore completion date if available
            if (record.completionDate) {
              courseCompletionDates.set(record.courseId, new Date(record.completionDate))
            }
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

        // Convert CourseStatus to proper status format
        const statusMap: Record<CourseStatus, 'completed' | 'available' | 'in_progress' | 'waiting_grade'> = {
          completed: 'completed',
          available: 'available',
          inProgress: 'in_progress',
          waitingGrade: 'waiting_grade'
        }

        const previousStatusMap: Record<CourseStatus, 'completed' | 'available' | 'in_progress' | 'waiting_grade'> = {
          completed: 'completed',
          available: 'available',
          inProgress: 'in_progress',
          waitingGrade: 'waiting_grade'
        }

        courseStatusTimestamps.set(record.courseId, {
          status: statusMap[record.status],
          timestamp: new Date(record.lastUpdated),
          previousStatus: record.previousStatus ? previousStatusMap[record.previousStatus] : undefined
        })
      }

      // Debug completion dates loaded
      if (courseCompletionDates.size > 0) {
        logger.log(
          `📅 Loaded ${courseCompletionDates.size} completion dates from IndexedDB:`,
          Array.from(courseCompletionDates.entries()).map(([code, date]) => ({ code, date: date.toISOString() }))
        )
      }

      return {
        userId: metadata.userId,
        completedCourses,
        availableCourses,
        inProgressCourses,
        waitingGradeCourses,
        courseStatusTimestamps,
        courseCompletionDates,
        specialRulesProgress: new Map(metadata.specialRulesProgress),
        lastUpdated: new Date(metadata.lastUpdated)
      }
    } catch (err) {
      logger.error('Failed to load user progress from IndexedDB:', err)
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
  courseStatusTimestamps: new Map(),
  courseCompletionDates: new Map(),
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
        courseStatusTimestamps: new Map(
          (parsed.courseStatusTimestamps || []).map(
            ([courseId, timestamp]: [string, { status: string; timestamp: string; previousStatus?: string }]) => [
              courseId,
              {
                ...timestamp,
                timestamp: new Date(timestamp.timestamp)
              }
            ]
          )
        ),
        courseCompletionDates: new Map(
          (parsed.courseCompletionDates || []).map(([courseId, dateString]: [string, string]) => [
            courseId,
            new Date(dateString)
          ])
        ),
        specialRulesProgress: new Map(parsed.specialRulesProgress || []),
        lastUpdated: new Date(parsed.lastUpdated || Date.now())
      }
    }
  } catch (err) {
    logger.error('Error loading user progress from localStorage:', err)
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
      courseStatusTimestamps: Array.from(progress.courseStatusTimestamps.entries()).map(([courseId, timestamp]) => [
        courseId,
        {
          ...timestamp,
          timestamp: timestamp.timestamp.toISOString()
        }
      ]),
      courseCompletionDates: Array.from(progress.courseCompletionDates.entries()).map(([courseId, date]) => [
        courseId,
        date.toISOString()
      ]),
      specialRulesProgress: Array.from(progress.specialRulesProgress.entries()),
      lastUpdated: progress.lastUpdated.toISOString()
    }
    localStorage.setItem(USER_PROGRESS_STORAGE_KEY, JSON.stringify(serializable))
  } catch (err) {
    logger.error('Error saving user progress to localStorage:', err)
    throw err
  }
}

// Migration: Load from localStorage and move to IndexedDB
const migrateFromLocalStorage = async (): Promise<UserProgress | null> => {
  const progress = loadFromLocalStorage()
  if (progress && isIndexedDBAvailable()) {
    try {
      logger.log('🔄 Migrating user progress from localStorage to IndexedDB...')

      // Save to IndexedDB using optimized structure
      await userProgressDB.save(progress)

      // Verify the save by trying to load it back
      const verifyLoad = await userProgressDB.load()
      if (verifyLoad) {
        // Only remove from localStorage after verifying IndexedDB works
        localStorage.removeItem(USER_PROGRESS_STORAGE_KEY)
        logger.log('✅ Successfully migrated user progress to IndexedDB (optimized)')
        return progress
      }
      logger.error('❌ Failed to verify IndexedDB migration - keeping localStorage backup')
      return progress
    } catch (err) {
      logger.error('❌ Error during migration from localStorage:', err)
      // Keep localStorage data on error
      return progress
    }
  }

  return progress
}

// Load user progress with migration support
const loadUserProgress = async (): Promise<UserProgress> => {
  try {
    // First, always check localStorage for immediate fallback
    const localStorageProgress = loadFromLocalStorage()

    // If IndexedDB is available, try to load from it first
    if (isIndexedDBAvailable()) {
      try {
        const existingProgress = await userProgressDB.load()
        if (existingProgress) {
          logger.log('✅ Loaded user progress from IndexedDB')
          return existingProgress
        }

        // If no IndexedDB data, try migration from localStorage
        if (localStorageProgress) {
          const migratedProgress = await migrateFromLocalStorage()
          if (migratedProgress) {
            return migratedProgress
          }
        }
      } catch (indexedDBError) {
        logger.error('❌ Error with IndexedDB, falling back to localStorage:', indexedDBError)
        // If IndexedDB fails but we have localStorage data, use it
        if (localStorageProgress) {
          logger.log('✅ Using localStorage fallback due to IndexedDB error')
          return localStorageProgress
        }
      }
    }

    // Fallback to localStorage (for environments without IndexedDB or when IndexedDB fails)
    if (localStorageProgress) {
      logger.log('✅ Loaded user progress from localStorage')
      return localStorageProgress
    }

    // If no data exists anywhere, return default
    const defaultProgress = getDefaultUserProgress()
    logger.log('📝 Created default user progress')

    // Try to save default to IndexedDB first, fallback to localStorage
    if (isIndexedDBAvailable()) {
      try {
        await userProgressDB.save(defaultProgress)
        logger.log('💾 Saved default progress to IndexedDB')
      } catch {
        saveToLocalStorage(defaultProgress)
        logger.log('💾 Saved default progress to localStorage (IndexedDB failed)')
      }
    } else {
      saveToLocalStorage(defaultProgress)
      logger.log('💾 Saved default progress to localStorage')
    }

    return defaultProgress
  } catch (err) {
    logger.error('❌ Error loading user progress:', err)
    return getDefaultUserProgress()
  }
}

// Save user progress to IndexedDB with localStorage fallback
const saveUserProgress = async (progress: UserProgress): Promise<UserProgress> => {
  let indexedDBSuccess = false

  // Try IndexedDB first if available
  if (isIndexedDBAvailable()) {
    try {
      logger.log('💾 Attempting to save user progress to IndexedDB...')
      await userProgressDB.save(progress)
      indexedDBSuccess = true
      logger.log('✅ User progress saved to IndexedDB successfully')
    } catch (err) {
      logger.error('❌ Error saving user progress to IndexedDB:', err)
    }
  }

  // Always maintain localStorage as backup (either as primary or secondary storage)
  try {
    logger.log('💾 Saving user progress to localStorage...')
    saveToLocalStorage(progress)
    if (indexedDBSuccess) {
      logger.log('✅ User progress also backed up to localStorage')
    } else {
      logger.log('✅ User progress saved to localStorage (primary)')
    }
    return progress
  } catch (fallbackErr) {
    logger.error('❌ Critical: All storage methods failed!', fallbackErr)
    throw fallbackErr
  }
}

// Hook for user progress
export const useUserProgress = () => {
  return useQuery<UserProgress, Error>({
    queryKey: USER_PROGRESS_QUERY_KEY,
    queryFn: loadUserProgress,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - user progress rarely becomes stale
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days - keep in cache for a long time
    retry: 3, // Retry failed loads
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Don't refetch on focus to prevent data loss
    refetchOnMount: false, // Don't refetch on mount if we have cached data
    refetchOnReconnect: false // Don't refetch on reconnect
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
      logger.log('✅ User progress updated successfully')
    },
    onError: (error) => {
      logger.error('❌ Failed to update user progress:', error)
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

      // Save to storage in the background using the same strategy as saveUserProgress
      try {
        await saveUserProgress(newData)
        logger.log('✅ Optimistic update saved successfully')
      } catch (err) {
        // Revert on error
        queryClient.setQueryData(USER_PROGRESS_QUERY_KEY, currentData)
        logger.error('❌ Failed to save optimistic update, reverted:', err)
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

      logger.log(`✅ Course ${courseId} status updated to ${status}`)
    },
    onError: (error, { courseId }) => {
      logger.error(`❌ Failed to update course ${courseId} status:`, error)
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
    logger.error('❌ Manual migration failed:', err)
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
    logger.log('🗑️ All user progress data cleared')
  } catch (err) {
    logger.error('❌ Failed to clear progress data:', err)
    throw err
  }
}

// Debug function to inspect IndexedDB contents
export const debugIndexedDB = async (): Promise<void> => {
  if (!isIndexedDBAvailable()) {
    logger.log('❌ IndexedDB not available')
    return
  }

  try {
    const metadata = await userProgressDB.loadMetadata()
    const courseStates = await userProgressDB.loadAllCourseStates()

    logger.log('🔍 IndexedDB Debug Info:')
    logger.log('📊 Metadata:', metadata)
    logger.log(`📚 Course States: ${courseStates.length} records`)
    logger.log('🎯 Sample course states:', courseStates.slice(0, 5))

    // Check localStorage too
    const localData = loadFromLocalStorage()
    logger.log('📱 localStorage data:', {
      exists: !!localData,
      completed: localData?.completedCourses?.size || 0,
      userId: localData?.userId
    })
  } catch (err) {
    logger.error('❌ Error debugging IndexedDB:', err)
  }
}

// Quick recovery function to immediately restore from localStorage
export const recoverFromLocalStorage = async (): Promise<void> => {
  const localData = loadFromLocalStorage()
  if (localData && isIndexedDBAvailable()) {
    logger.log('🔄 Starting immediate recovery from localStorage...')
    logger.log(`📚 Found ${localData.completedCourses.size} completed courses`)

    try {
      await userProgressDB.save(localData)
      logger.log('✅ Successfully recovered data to IndexedDB!')

      // Verify the recovery
      const verified = await userProgressDB.load()
      if (verified) {
        logger.log('✅ Recovery verified - data is now accessible!')
        // Force refresh the React Query cache
        if (typeof window !== 'undefined' && window.location) {
          window.location.reload()
        }
      } else {
        logger.log('❌ Recovery verification failed')
      }
    } catch (err) {
      logger.error('❌ Recovery failed:', err)
    }
  } else {
    logger.log('❌ No localStorage data found to recover')
  }
}

// Force refresh achievements (clears React Query cache)
export const forceRefreshAchievements = (): void => {
  if (typeof window !== 'undefined') {
    logger.log('🔄 Forcing page refresh to clear caches...')
    window.location.reload()
  }
}

// Expose debug functions globally for easy browser console access
if (typeof window !== 'undefined') {
  const windowWithDebug = window as Window & {
    debugUserProgress?: () => Promise<void>
    recoverData?: () => Promise<void>
    refreshAchievements?: () => void
  }
  windowWithDebug.debugUserProgress = debugIndexedDB
  windowWithDebug.recoverData = recoverFromLocalStorage
  windowWithDebug.refreshAchievements = forceRefreshAchievements
}

// Export query key for cache invalidation
export { USER_PROGRESS_QUERY_KEY }

// Export types for external use
export type { CourseStatus, CourseStateRecord }
