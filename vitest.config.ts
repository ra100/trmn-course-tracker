import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  define: {
    // Define build-time constants for tests
    __DEV__: JSON.stringify(true) // Always enable debug logging in tests
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test-setup.ts']
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      '~': path.resolve(__dirname, './src'),
      'styled-system': path.resolve(__dirname, './src/styled-system')
    }
  }
})
