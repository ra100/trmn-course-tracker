import React from 'react'
import { ErrorList } from './MedusaImport.styles'
import { ImportErrorDisplayProps } from './types'

export const ImportErrorDisplay: React.FC<ImportErrorDisplayProps> = React.memo(({ errors }) => (
  <>
    <strong>Import Failed:</strong>
    <ErrorList>
      {errors.map((error) => (
        <li key={`error-${error.replace(/[^a-zA-Z0-9]/g, '').slice(0, 50)}`}>{error}</li>
      ))}
    </ErrorList>
  </>
))

ImportErrorDisplay.displayName = 'ImportErrorDisplay'
