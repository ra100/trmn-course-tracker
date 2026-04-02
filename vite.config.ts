import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [
    react()
  ],
  resolve: {
    tsconfigPaths: true
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __GTM_ID__: JSON.stringify(process.env.VITE_GTM_ID || '')
  },
  build: {
    outDir: 'build'
  },
  server: {
    port: 3001
  },
  preview: {
    port: 3001
  }
})
