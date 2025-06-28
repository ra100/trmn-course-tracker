import React from 'react'
import { importResults } from './MedusaImport.styles'
import { ImportErrorDisplay } from './ImportErrorDisplay'
import { ImportSuccessDisplay } from './ImportSuccessDisplay'
import { ImportResultsProps } from './types'

export const ImportResults: React.FC<ImportResultsProps> = React.memo(({ result }) => {
  if (!result) {
    return null
  }

  const hasErrors = result.errors.length > 0

  return (
    <div className={importResults({ type: hasErrors ? 'error' : 'success' })}>
      {hasErrors ? <ImportErrorDisplay errors={result.errors} /> : <ImportSuccessDisplay result={result} />}
    </div>
  )
})

ImportResults.displayName = 'ImportResults'
