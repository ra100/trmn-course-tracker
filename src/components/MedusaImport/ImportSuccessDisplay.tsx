import React from 'react'
import { ImportSuccessDisplayProps } from './types'
import { ImportStatsDisplay } from './ImportStatsDisplay'

export const ImportSuccessDisplay: React.FC<ImportSuccessDisplayProps> = React.memo(({ result }) => (
  <>
    <strong>Success!</strong> Found {result.courses.length} completed courses in Medusa.
    {result.importStats && (
      <ImportStatsDisplay
        stats={{
          ...result.importStats,
          newCourses:
            'newCourses' in result.importStats
              ? ((result.importStats as Record<string, unknown>).newCourses as string[])
              : [],
          untrackedCourses:
            'untrackedCourses' in result.importStats
              ? ((result.importStats as Record<string, unknown>).untrackedCourses as string[])
              : []
        }}
      />
    )}
  </>
))

ImportSuccessDisplay.displayName = 'ImportSuccessDisplay'
