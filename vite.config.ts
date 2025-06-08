import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    // Define build-time constants
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },
  build: {
    outDir: 'build' // for GitHub Pages compatibility
  },
  server: {
    port: 3001
  },
  preview: {
    port: 3001
  }
})
