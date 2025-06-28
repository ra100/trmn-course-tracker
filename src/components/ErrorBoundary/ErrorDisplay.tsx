import React from 'react'
import { errorContainer } from './ErrorBoundary.styles'
import { ErrorHeader } from './ErrorHeader'
import { ErrorDevDetails } from './ErrorDevDetails'
import { ErrorDisplayProps } from './types'
import { isDebugEnabled } from '../../config'

export const ErrorDisplay: React.FC<ErrorDisplayProps> = React.memo(({ onRetry, error, errorInfo }) => (
  <div className={errorContainer}>
    <ErrorHeader onRetry={onRetry} />
    {error && <ErrorDevDetails error={error} errorInfo={errorInfo} />}
  </div>
))

ErrorDisplay.displayName = 'ErrorDisplay'
