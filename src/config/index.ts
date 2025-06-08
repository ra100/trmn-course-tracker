// Build-time configuration
// These values are set during the build process and tree-shaken in production

// Use Vite's build-time constants, with fallbacks for Node.js environments
declare const __DEV__: boolean
declare const __GTM_ID__: string

const isDevelopmentMode = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development'
const gtmId = typeof __GTM_ID__ !== 'undefined' ? __GTM_ID__ : process.env.VITE_GTM_ID || ''

export const config = {
  // Debug logging - set to false in production builds
  enableDebugLogging: isDevelopmentMode,

  // Error logging - always enabled for error reporting
  enableErrorLogging: true,

  // Performance monitoring - can be toggled per environment
  enablePerformanceLogging: isDevelopmentMode,

  // Development features
  isDevelopment: isDevelopmentMode,

  // Analytics configuration
  analytics: {
    gtmId,
    enabled: !!gtmId // Enable analytics when GTM ID is provided, regardless of environment
  },

  // API endpoints and other environment-specific configs can go here
  apiBaseUrl: '/api'
} as const

// Type-safe configuration access
export type AppConfig = typeof config

// Helper functions for common checks
export const isDebugEnabled = () => config.enableDebugLogging
export const isErrorLoggingEnabled = () => config.enableErrorLogging
export const isPerformanceLoggingEnabled = () => config.enablePerformanceLogging
export const isDev = () => config.isDevelopment
