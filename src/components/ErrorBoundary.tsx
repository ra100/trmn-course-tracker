import React, { Component } from 'react'
import { ErrorDisplay } from './ErrorBoundary/ErrorDisplay'
import { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary/types'
import { logger } from '../utils/logger'

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

    logger.error('ErrorBoundary caught an error:', error)
    logger.error('Error info:', errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorDisplay onRetry={this.handleRetry} error={this.state.error} errorInfo={this.state.errorInfo} />
    }

    return this.props.children
  }
}
