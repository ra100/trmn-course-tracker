import { defineConfig } from 'vitest/config'

export default defineConfig({
  define: {
    // Define build-time constants for tests
    __DEV__: JSON.stringify(true) // Always enable debug logging in tests
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts']
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
