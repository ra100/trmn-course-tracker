import React from 'react'
import { ErrorDetails, ErrorStack } from './ErrorBoundary.styles'
import { ErrorDetailsProps } from './types'

export const ErrorDevDetails: React.FC<ErrorDetailsProps> = React.memo(({ error, errorInfo }) => {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <ErrorDetails>
      <summary>Error Details (Development Only)</summary>
      <ErrorStack>
        <strong>Error:</strong> {error.message}
        {error.stack && (
          <>
            <br />
            <strong>Stack Trace:</strong>
            <br />
            {error.stack}
          </>
        )}
        {errorInfo?.componentStack && (
          <>
            <br />
            <strong>Component Stack:</strong>
            <br />
            {errorInfo.componentStack}
          </>
        )}
      </ErrorStack>
    </ErrorDetails>
  )
})

ErrorDevDetails.displayName = 'ErrorDevDetails'
