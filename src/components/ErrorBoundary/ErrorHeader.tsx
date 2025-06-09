import React from 'react'
import { ErrorTitle, ErrorMessage, RetryButton } from './ErrorBoundary.styles'
import { ErrorHeaderProps } from './types'

export const ErrorHeader: React.FC<ErrorHeaderProps> = React.memo(({ onRetry }) => (
  <>
    <ErrorTitle>Oops! Something went wrong</ErrorTitle>
    <ErrorMessage>
      We&apos;re sorry, but something unexpected happened. This has been logged and we&apos;ll work to fix it. You can
      try refreshing the page or clicking the retry button below.
    </ErrorMessage>
    <RetryButton onClick={onRetry}>Try Again</RetryButton>
  </>
))

ErrorHeader.displayName = 'ErrorHeader'
