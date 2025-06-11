import { config } from '../config'
import { getLogger } from './logger'

// Google Analytics gtag function type
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

// GDPR consent status
export type ConsentStatus = 'granted' | 'denied' | 'unknown'

export interface ConsentSettings {
  analytics: ConsentStatus
  functionalStorage: ConsentStatus
}

// Default consent settings (privacy-first approach)
const defaultConsentSettings: ConsentSettings = {
  analytics: 'denied',
  functionalStorage: 'granted'
}

const loadGTM = (gtmId: string): void => {
  const scriptSrc = `https://www.googletagmanager.com/gtag/js?id=${gtmId}`

  // Check if script is already loaded
  const existingScript = document.querySelector(`script[src="${scriptSrc}"]`)
  if (existingScript) {
    getLogger().log(`Analytics: GTM script already loaded (${gtmId})`)
    return
  }

  const script = document.createElement('script')
  script.async = true
  script.src = scriptSrc

  getLogger().log(`Analytics: Loading GTM script (${gtmId})`)
  script.onload = () => {
    getLogger().log(`Analytics: GTM script loaded successfully (${gtmId})`)
  }
  script.onerror = (error) => {
    getLogger().error(`Analytics: Error loading GTM script (${gtmId}):`, error)
  }

  document.head.appendChild(script)
}

// Initialization flag to prevent multiple initializations
let isAnalyticsInitialized = false
// Track last page view to prevent duplicates
let lastTrackedPage: string | null = null
// Track last consent update to prevent duplicates
let lastConsentUpdate: string | null = null

// Initialize Google Analytics
export const initializeAnalytics = (): void => {
  // Prevent multiple initializations
  if (isAnalyticsInitialized) {
    getLogger().log('Analytics: Already initialized, skipping...')
    return
  }

  if (!config.analytics.enabled) {
    getLogger().log('Analytics: Disabled - no GTM ID provided')
    return
  }

  getLogger().log(`Analytics: Initializing with GTM ID: ${config.analytics.gtmId}`)

  // Debug: Log the exact configuration
  getLogger().log('Analytics: Configuration details:', {
    gtmId: config.analytics.gtmId,
    gtmIdLength: config.analytics.gtmId.length,
    gtmIdCharCodes: Array.from(config.analytics.gtmId).map((c) => c.charCodeAt(0)),
    enabled: config.analytics.enabled,
    isDevelopment: config.isDevelopment
  })

  // Initialize dataLayer first
  window.dataLayer = window.dataLayer || []
  // Use the standard gtag function definition that works
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }

  // Set default consent (privacy-first but allows loading the script)
  window.gtag('consent', 'default', {
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    ad_storage: 'denied',
    analytics_storage: defaultConsentSettings.analytics
  })

  // Always load the GTM script (required for gtag to work)
  loadGTM(config.analytics.gtmId)

  // Configure gtag with timestamp (this order is important!)
  window.gtag('js', new Date())
  window.gtag('config', config.analytics.gtmId, {
    // Respect the current consent status
    send_page_view: false // We'll send it manually after checking consent
  })

  // Mark as initialized
  isAnalyticsInitialized = true

  // Apply stored consent if available
  const storedConsent = getStoredConsent()
  if (storedConsent?.analytics === 'granted') {
    updateGTMConsent(storedConsent)
    // Send initial page view if consent is already granted
    trackPageView()
  }

  getLogger().log('Analytics: Initialization completed')
}

// Update consent settings
export const updateConsent = (consentSettings: Partial<ConsentSettings>): void => {
  // Store consent preferences in localStorage
  localStorage.setItem('gdpr-consent', JSON.stringify(consentSettings))

  updateGTMConsent(consentSettings)
}

export const updateGTMConsent = (consentSettings: Partial<ConsentSettings>): void => {
  // Store consent preferences in localStorage
  localStorage.setItem('gdpr-consent', JSON.stringify(consentSettings))

  if (!config.analytics.enabled || !window.gtag) {
    getLogger().log('Analytics: Cannot update consent - not initialized')
    return
  }

  // Prevent duplicate consent updates
  const consentKey = JSON.stringify(consentSettings)
  if (lastConsentUpdate === consentKey) {
    getLogger().log('Analytics: Skipping duplicate consent update')
    return
  }

  getLogger().log('Analytics: Updating consent settings', consentSettings)

  window.gtag('consent', 'update', {
    analytics_storage: consentSettings.analytics || defaultConsentSettings.analytics,
    wait_for_update: 500
  })

  // Update last consent
  lastConsentUpdate = consentKey

  // Reset last tracked page when consent is granted to allow new page view
  if (consentSettings.analytics === 'granted') {
    getLogger().log('Analytics: Consent granted, resetting page tracking')
    lastTrackedPage = null
  }
}

// Get stored consent preferences
export const getStoredConsent = (): Partial<ConsentSettings> | null => {
  try {
    const stored = localStorage.getItem('gdpr-consent')
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    getLogger().error('Analytics: Error reading stored consent', error)
    return null
  }
}

// Track page view
export const trackPageView = (path?: string): void => {
  const page = path || window.location.pathname + window.location.search
  const consent = getStoredConsent()

  // Prevent duplicate page views
  if (lastTrackedPage === page) {
    getLogger().log(`Analytics: Skipping duplicate page view for ${page}`)
    return
  }

  getLogger().log('Analytics page view tracking attempt:', {
    enabled: config.analytics.enabled,
    gtagExists: !!window.gtag,
    gtmId: config.analytics.gtmId,
    page,
    consentStatus: consent?.analytics || 'unknown',
    dataLayerLength: window.dataLayer?.length || 0
  })

  if (!config.analytics.enabled || !window.gtag) {
    getLogger().log('Analytics: Cannot track page view - not initialized')
    return
  }

  // Check if analytics consent is granted
  if (consent?.analytics !== 'granted') {
    getLogger().log('Analytics: Page view not sent - analytics consent not granted')
    return
  }

  // For GTM, push to dataLayer
  if (config.analytics.gtmId) {
    window.gtag('event', 'page_view', {
      page_path: page
    })

    // Update last tracked page
    lastTrackedPage = page
    getLogger().log(`Analytics: Page view tracked - ${page}`)
  }
}

// Track custom event
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>): void => {
  const consent = getStoredConsent()

  if (!config.analytics.enabled || !window.gtag) {
    getLogger().log(`Analytics: Cannot track event ${eventName} - not initialized`)
    return
  }

  // Check if analytics consent is granted
  if (consent?.analytics !== 'granted') {
    getLogger().log(`Analytics: Event ${eventName} not sent - analytics consent not granted`)
    return
  }

  window.gtag('event', eventName, parameters)

  getLogger().log(`Analytics: Event tracked - ${eventName}`, parameters)
}

// Track course completion
export const trackCourseCompletion = (courseId: string, courseName: string): void => {
  trackEvent('course_completion', {
    course_id: courseId,
    course_name: courseName,
    event_category: 'education'
  })
}

// Track course progress
export const trackCourseProgress = (courseId: string, courseName: string, progressPercentage: number): void => {
  trackEvent('course_progress', {
    course_id: courseId,
    course_name: courseName,
    progress_percentage: progressPercentage,
    event_category: 'education'
  })
}

// Track filter usage
export const trackFilterUsage = (filterType: string, filterValue: string | string[]): void => {
  trackEvent('filter_usage', {
    filter_type: filterType,
    filter_value: Array.isArray(filterValue) ? filterValue.join(',') : filterValue,
    event_category: 'navigation'
  })
}

// Track search usage
export const trackSearch = (searchTerm: string, resultsCount: number): void => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
    event_category: 'navigation'
  })
}

// Track settings changes
export const trackSettingsChange = (settingName: string, oldValue: unknown, newValue: unknown): void => {
  trackEvent('settings_change', {
    setting_name: settingName,
    old_value: String(oldValue),
    new_value: String(newValue),
    event_category: 'settings'
  })
}

// Track view mode changes
export const trackViewModeChange = (viewMode: string): void => {
  trackEvent('view_mode_change', {
    view_mode: viewMode,
    event_category: 'navigation'
  })
}

// Track course details view
export const trackCourseDetailsView = (courseId: string, courseName: string, source = 'unknown'): void => {
  trackEvent('course_details_view', {
    course_id: courseId,
    course_name: courseName,
    source, // e.g., 'search', 'filter', 'tree', 'direct'
    event_category: 'education'
  })
}

// Track file import actions
export const trackFileImport = (fileType: string, fileSize: number, success: boolean, errorMessage?: string): void => {
  trackEvent('file_import', {
    file_type: fileType,
    file_size: fileSize,
    success,
    error_message: errorMessage || '',
    event_category: 'data_import'
  })
}

// Track export actions
export const trackDataExport = (exportType: string, dataSize: number): void => {
  trackEvent('data_export', {
    export_type: exportType,
    data_size: dataSize,
    event_category: 'data_export'
  })
}

// Track feature engagement
export const trackFeatureEngagement = (
  featureName: string,
  action: string,
  additionalData?: Record<string, unknown>
): void => {
  trackEvent('feature_engagement', {
    feature_name: featureName,
    action,
    event_category: 'engagement',
    ...additionalData
  })
}

// Track performance metrics
export const trackPerformance = (metricName: string, value: number, unit = 'ms'): void => {
  trackEvent('performance_metric', {
    metric_name: metricName,
    value,
    unit,
    event_category: 'performance'
  })
}

// Track user session milestones
export const trackSessionMilestone = (milestone: string, sessionDuration: number): void => {
  trackEvent('session_milestone', {
    milestone, // e.g., 'first_course_viewed', 'first_completion', '10min_session'
    session_duration: sessionDuration,
    event_category: 'engagement'
  })
}

// Track error events
export const trackError = (errorType: string, errorMessage: string, component?: string): void => {
  trackEvent('error_encountered', {
    error_type: errorType,
    error_message: errorMessage,
    component: component || 'unknown',
    event_category: 'error'
  })
}

// Track GDPR consent changes
export const trackConsentChange = (consentType: string, granted: boolean): void => {
  trackEvent('gdpr_consent_change', {
    consent_type: consentType,
    granted,
    event_category: 'privacy'
  })
}

// Debug utility to check analytics status
export const debugAnalytics = () => {
  const consent = getStoredConsent()
  const debugInfo = {
    // Configuration
    analyticsEnabled: config.analytics.enabled,
    gtmId: config.analytics.gtmId,

    // Runtime state
    gtagExists: !!window.gtag,
    dataLayerExists: !!window.dataLayer,
    dataLayerLength: window.dataLayer?.length || 0,

    // Consent status
    storedConsent: consent,
    analyticsConsentGranted: consent?.analytics === 'granted',

    // Environment
    isDevelopment: config.isDevelopment,
    currentUrl: window.location.href,

    // Last few dataLayer entries
    recentDataLayerEntries: window.dataLayer?.slice(-5) || []
  }

  getLogger().log('🔍 Google Analytics Debug Info:', debugInfo)

  // Test tracking
  if (consent?.analytics === 'granted') {
    getLogger().log('🧪 Testing event tracking...')
    trackEvent('debug_test', { timestamp: Date.now() })
  } else {
    getLogger().log('❌ Cannot test tracking - analytics consent not granted')
  }

  return debugInfo
}

// Make debug function available globally in development
if (config.isDevelopment && typeof window !== 'undefined') {
  // @ts-expect-error Adding debug function to window for development use
  window.debugAnalytics = debugAnalytics

  // @ts-expect-error Adding reset function to window for development use
  window.resetAnalytics = () => {
    isAnalyticsInitialized = false
    lastTrackedPage = null
    lastConsentUpdate = null
    getLogger().log('🔄 Analytics state reset')
  }
}
