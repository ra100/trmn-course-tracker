import React from 'react'
import { Button } from '~/components/ui/button'
import { errorTitle, errorMessage } from './ErrorBoundary.styles'
import { ErrorHeaderProps } from './types'

export const ErrorHeader: React.FC<ErrorHeaderProps> = React.memo(({ onRetry }) => (
  <>
    <h2 className={errorTitle}>Oops! Something went wrong</h2>
    <p className={errorMessage}>
      We&apos;re sorry, but something unexpected happened. This has been logged and we&apos;ll work to fix it. You can
      try refreshing the page or clicking the retry button below.
    </p>
    <Button onClick={onRetry}>Try Again</Button>
  </>
))

ErrorHeader.displayName = 'ErrorHeader'
