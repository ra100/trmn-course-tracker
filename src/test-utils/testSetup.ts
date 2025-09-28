import { vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Shared localStorage mock for all tests
export const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Shared console mock for all tests
export const consoleMock = {
  log: vi.fn(),
  error: vi.fn()
}

// Create test query client with consistent configuration
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      },
      mutations: {
        retry: false
      }
    }
  })
}

// Create wrapper component for React Query testing
export const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  return Wrapper
}

// Setup function to initialize mocks before each test
export const setupTestMocks = () => {
  // Setup localStorage mock
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })

  // Setup console mocks
  Object.defineProperty(console, 'log', { value: consoleMock.log })
  Object.defineProperty(console, 'error', { value: consoleMock.error })

  // Reset localStorage mock implementation
  localStorageMock.setItem.mockImplementation(() => {})
}

// Cleanup function for after each test
export const cleanupTestMocks = () => {
  vi.clearAllMocks()
  localStorageMock.clear()
}

// Helper to create localStorage error scenario
export const createLocalStorageError = (errorMessage = 'Storage quota exceeded') => {
  localStorageMock.setItem.mockImplementation(() => {
    throw new Error(errorMessage)
  })
}

// Helper to create corrupted localStorage data scenario
export const createCorruptedLocalStorageData = (data = 'invalid json') => {
  localStorageMock.getItem.mockReturnValue(data)
}
