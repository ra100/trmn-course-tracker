import React from 'react'
import { errorList } from './MedusaImport.styles'
import { ImportErrorDisplayProps } from './types'

export const ImportErrorDisplay: React.FC<ImportErrorDisplayProps> = React.memo(({ errors }) => (
  <>
    <strong>Import Failed:</strong>
    <ul className={errorList}>
      {errors.map((error) => (
        <li key={`error-${error.replace(/[^a-zA-Z0-9]/g, '').slice(0, 50)}`}>{error}</li>
      ))}
    </ul>
  </>
))

ImportErrorDisplay.displayName = 'ImportErrorDisplay'
