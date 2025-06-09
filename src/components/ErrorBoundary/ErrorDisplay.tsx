import React from 'react'
import { ErrorContainer } from './ErrorBoundary.styles'
import { ErrorHeader } from './ErrorHeader'
import { ErrorDevDetails } from './ErrorDevDetails'
import { ErrorDisplayProps } from './types'

export const ErrorDisplay: React.FC<ErrorDisplayProps> = React.memo(({ onRetry, error, errorInfo }) => (
  <ErrorContainer>
    <ErrorHeader onRetry={onRetry} />
    {error && <ErrorDevDetails error={error} errorInfo={errorInfo} />}
  </ErrorContainer>
))

ErrorDisplay.displayName = 'ErrorDisplay'
