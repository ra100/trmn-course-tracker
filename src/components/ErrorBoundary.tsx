import React, { Component, ReactNode } from 'react'
import styled from 'styled-components'

const ErrorContainer = styled.div`
  padding: 2rem;
  text-align: center;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.error};
  border-radius: 8px;
  margin: 1rem;
`

const ErrorTitle = styled.h2`
  color: ${(props) => props.theme.colors.error};
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
`

const ErrorMessage = styled.p`
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  line-height: 1.5;
`

const RetryButton = styled.button`
  background: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${(props) => props.theme.colors.primaryHover};
  }
`

const ErrorDetails = styled.details`
  margin-top: 1.5rem;
  text-align: left;
  background: ${(props) => props.theme.colors.background};
  border-radius: 4px;
  padding: 1rem;
  border: 1px solid ${(props) => props.theme.colors.border};
`

const ErrorStack = styled.pre`
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0.5rem 0 0 0;
`

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error)
      // eslint-disable-next-line no-console
      console.error('Error info:', errorInfo)
    }

    // In production, you might want to log to an error reporting service
    // e.g., Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorContainer>
          <ErrorTitle>Oops! Something went wrong</ErrorTitle>
          <ErrorMessage>
            We&apos;re sorry, but something unexpected happened. This has been logged and we&apos;ll work to fix it. You
            can try refreshing the page or clicking the retry button below.
          </ErrorMessage>
          <RetryButton onClick={this.handleRetry}>Try Again</RetryButton>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <ErrorDetails>
              <summary>Error Details (Development Only)</summary>
              <ErrorStack>
                <strong>Error:</strong> {this.state.error.message}
                {this.state.error.stack && (
                  <>
                    <br />
                    <strong>Stack Trace:</strong>
                    <br />
                    {this.state.error.stack}
                  </>
                )}
                {this.state.errorInfo?.componentStack && (
                  <>
                    <br />
                    <strong>Component Stack:</strong>
                    <br />
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </ErrorStack>
            </ErrorDetails>
          )}
        </ErrorContainer>
      )
    }

    return this.props.children
  }
}
