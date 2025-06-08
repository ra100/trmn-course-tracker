import { useQuery } from '@tanstack/react-query'
import { ParsedCourseData } from '../types'
import { loadCourseData } from '../utils/courseDataLoader'

const COURSE_DATA_QUERY_KEY = ['courseData']

export const useCourseData = () => {
  return useQuery<ParsedCourseData, Error>({
    queryKey: COURSE_DATA_QUERY_KEY,
    queryFn: loadCourseData,
    staleTime: 10 * 60 * 1000, // 10 minutes - course data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000) // Exponential backoff
  })
}

// Export the query key for potential invalidation
export { COURSE_DATA_QUERY_KEY }
