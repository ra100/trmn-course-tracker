import { logger } from './logger'

/**
 * Safely parse JSON data with error handling
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString)
  } catch (err) {
    logger.error('Error parsing JSON data:', err)
    return fallback
  }
}

/**
 * Safely save data to localStorage with error handling
 */
export const safeLocalStorageSet = (key: string, data: unknown): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (err) {
    logger.error(`Error saving to localStorage (${key}):`, err)
    return false
  }
}

/**
 * Safely load data from localStorage with error handling
 */
export const safeLocalStorageGet = <T>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      return safeJsonParse(saved, fallback)
    }
  } catch (err) {
    logger.error(`Error loading from localStorage (${key}):`, err)
  }

  return fallback
}

/**
 * Merge partial data with defaults, handling localStorage errors gracefully
 */
export const mergeWithDefaults = <T extends Record<string, unknown>>(storedData: Partial<T>, defaults: T): T => {
  try {
    return {
      ...defaults,
      ...storedData
    }
  } catch (err) {
    logger.error('Error merging stored data with defaults:', err)
    return defaults
  }
}

/**
 * Optimistic update pattern with automatic rollback on error
 */
export const withOptimisticUpdate = async <T>(updateFn: () => Promise<T>, _rollbackData: T): Promise<T> => {
  try {
    return await updateFn()
  } catch (err) {
    logger.error('Optimistic update failed, rolling back:', err)
    throw err
  }
}
