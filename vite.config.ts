import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tsconfigPaths(),
    // Bundle analyzer - generates stats.html in build directory
    visualizer({
      filename: 'build/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap' // 'treemap', 'sunburst', 'network'
    })
  ],
  define: {
    // Define build-time constants
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __GTM_ID__: JSON.stringify(process.env.VITE_GTM_ID || '')
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
