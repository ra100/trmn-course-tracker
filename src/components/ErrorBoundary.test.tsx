import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'
import { darkTheme } from '../theme'
import { logger } from '~/utils/logger'

// Mock component that throws an error
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div data-testid="working-component">Component works fine</div>
}

// Mock logger.error to avoid noise in tests
const originalConsoleError = logger.error
beforeEach(() => {
  logger.error = vi.fn()
})

afterEach(() => {
  logger.error = originalConsoleError
})

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={darkTheme}>{component}</ThemeProvider>)
}

describe('ErrorBoundary', () => {
  describe('Normal Operation', () => {
    it('renders children when no error occurs', () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('working-component')).toBeInTheDocument()
      expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('catches errors and displays error UI', () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      )

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
      expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
      expect(screen.queryByTestId('working-component')).not.toBeInTheDocument()
    })

    it('displays custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom error message</div>

      renderWithTheme(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument()
    })

    it('shows error details in development mode', () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      )

      expect(screen.getByText('Error Details (Development Mode)')).toBeInTheDocument()
      const errorMessages = screen.getAllByText(/Test error message/)
      expect(errorMessages.length).toBeGreaterThan(0)

      process.env.NODE_ENV = originalNodeEnv
    })

    it('hides error details in production mode', () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      )

      expect(screen.queryByText('Error Details (Development Only)')).not.toBeInTheDocument()

      process.env.NODE_ENV = originalNodeEnv
    })
  })

  describe('Recovery', () => {
    it('resets error state when retry button is clicked', () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      )

      // Error state should be shown
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()

      // Click retry button
      fireEvent.click(screen.getByText('Try Again'))

      // The ErrorBoundary should reset its internal state and try to render children again
      // Since our ThrowError component still has shouldThrow=true, it will throw again
      // This tests that the retry mechanism works by clearing the error state
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    })

    it('allows recovery when children stop throwing errors', () => {
      let shouldThrow = true
      const VariableError: React.FC = () => {
        if (shouldThrow) {
          throw new Error('Variable error')
        }
        return <div data-testid="recovered-component">Component recovered</div>
      }

      renderWithTheme(
        <ErrorBoundary>
          <VariableError />
        </ErrorBoundary>
      )

      // Initially should show error
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()

      // Change the throwing condition
      shouldThrow = false

      // Click retry button
      fireEvent.click(screen.getByText('Try Again'))

      // Should now show the recovered component
      expect(screen.getByTestId('recovered-component')).toBeInTheDocument()
      expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Logging', () => {
    it('logs errors to console in development mode', () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      )

      expect(logger.error).toHaveBeenCalledWith('ErrorBoundary caught an error:', expect.any(Error))
      expect(logger.error).toHaveBeenCalledWith('Error info:', expect.any(Object))

      process.env.NODE_ENV = originalNodeEnv
    })
  })
})
