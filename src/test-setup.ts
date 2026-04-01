import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Silence logger output during tests - __DEV__ is true in vitest.config.ts
// which enables debug logging, causing noisy console output in test runs.
// Individual tests that need to assert on logger calls can spy on it.
vi.mock('./utils/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    group: vi.fn(),
    groupEnd: vi.fn(),
    table: vi.fn()
  }
}))

// Export the theme for tests that need it
export { darkTheme as testTheme } from './theme'
