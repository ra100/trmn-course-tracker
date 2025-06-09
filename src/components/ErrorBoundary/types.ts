import { ReactNode } from 'react'

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export interface ErrorDisplayProps {
  onRetry: () => void
  error?: Error
  errorInfo?: React.ErrorInfo
}

export interface ErrorDetailsProps {
  error: Error
  errorInfo?: React.ErrorInfo
}

export interface ErrorHeaderProps {
  onRetry: () => void
}
