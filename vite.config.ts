import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
