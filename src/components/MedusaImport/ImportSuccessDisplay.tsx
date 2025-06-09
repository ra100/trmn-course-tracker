import React from 'react'
import { ImportSuccessDisplayProps } from './types'
import { ImportStatsDisplay } from './ImportStatsDisplay'

export const ImportSuccessDisplay: React.FC<ImportSuccessDisplayProps> = React.memo(({ result }) => (
  <>
    <strong>Success!</strong> Found {result.courses.length} completed courses in Medusa.
    {result.importStats && <ImportStatsDisplay stats={result.importStats} />}
  </>
))

ImportSuccessDisplay.displayName = 'ImportSuccessDisplay'
