import React from 'react'
import { isDebugEnabled } from '../../config'
import { errorDetails, errorStack, errorStackContent } from './ErrorBoundary.styles'
import { ErrorDetailsProps } from './types'

export const ErrorDevDetails: React.FC<ErrorDetailsProps> = React.memo(({ error, errorInfo }) => {
  if (!isDebugEnabled()) {
    return null
  }

  return (
    <div className={errorDetails}>
      <h3>Error Details (Development Mode)</h3>
      <p>
        <strong>Message:</strong> {error.message}
      </p>
      <p>
        <strong>Stack:</strong>
      </p>
      <pre className={errorStack}>
        <code className={errorStackContent}>{error.stack}</code>
      </pre>
      {errorInfo && (
        <>
          <p>
            <strong>Component Stack:</strong>
          </p>
          <pre className={errorStack}>
            <code className={errorStackContent}>{errorInfo.componentStack}</code>
          </pre>
        </>
      )}
    </div>
  )
})

ErrorDevDetails.displayName = 'ErrorDevDetails'
