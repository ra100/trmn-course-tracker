import { config, isDebugEnabled } from '../config'

// Google Analytics gtag function type
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

// GDPR consent status
export type ConsentStatus = 'granted' | 'denied' | 'unknown'

export interface ConsentSettings {
  analytics: ConsentStatus
  functionalStorage: ConsentStatus
  securityStorage: ConsentStatus
}

// Default consent settings (privacy-first approach)
const defaultConsentSettings: ConsentSettings = {
  analytics: 'denied',
  functionalStorage: 'granted',
  securityStorage: 'granted'
}

// Initialize Google Analytics
export const initializeAnalytics = (): void => {
  if (!config.analytics.enabled) {
    if (isDebugEnabled()) {
      console.log('Analytics: Disabled in current environment')
    }
    return
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }

  // Set default consent mode (privacy-first)
  window.gtag('consent', 'default', {
    analytics_storage: defaultConsentSettings.analytics,
    functionality_storage: defaultConsentSettings.functionalStorage,
    security_storage: defaultConsentSettings.securityStorage,
    wait_for_update: 500
  })

  // Load GTM
  if (config.analytics.gtmId) {
    loadGTM(config.analytics.gtmId)
  }

  if (isDebugEnabled()) {
    console.log('Analytics: Initialized with consent defaults')
  }
}

// Load Google Tag Manager
const loadGTM = (gtmId: string): void => {
  // GTM script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`
  document.head.appendChild(script)

  if (isDebugEnabled()) {
    console.log(`Analytics: Google Tag Manager loaded (${gtmId})`)
  }
}

// Update consent settings
export const updateConsent = (consentSettings: Partial<ConsentSettings>): void => {
  if (!config.analytics.enabled || !window.gtag) {
    if (isDebugEnabled()) {
      console.log('Analytics: Cannot update consent - not initialized')
    }
    return
  }

  window.gtag('consent', 'update', {
    analytics_storage: consentSettings.analytics || defaultConsentSettings.analytics,
    functionality_storage: consentSettings.functionalStorage || defaultConsentSettings.functionalStorage,
    security_storage: consentSettings.securityStorage || defaultConsentSettings.securityStorage
  })

  // Store consent preferences in localStorage
  localStorage.setItem('gdpr-consent', JSON.stringify(consentSettings))

  if (isDebugEnabled()) {
    console.log('Analytics: Consent updated', consentSettings)
  }

  // Send page view after consent is granted
  if (consentSettings.analytics === 'granted') {
    trackPageView()
  }
}

// Get stored consent preferences
export const getStoredConsent = (): Partial<ConsentSettings> | null => {
  try {
    const stored = localStorage.getItem('gdpr-consent')
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    if (isDebugEnabled()) {
      console.error('Analytics: Error reading stored consent', error)
    }
    return null
  }
}

// Track page view
export const trackPageView = (path?: string): void => {
  if (!config.analytics.enabled || !window.gtag) {
    return
  }

  const page = path || window.location.pathname + window.location.search

  // For GTM, push to dataLayer
  if (config.analytics.gtmId) {
    window.gtag('event', 'page_view', {
      page_path: page
    })
  }

  if (isDebugEnabled()) {
    console.log(`Analytics: Page view tracked - ${page}`)
  }
}

// Track custom event
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>): void => {
  if (!config.analytics.enabled || !window.gtag) {
    return
  }

  window.gtag('event', eventName, parameters)

  if (isDebugEnabled()) {
    console.log(`Analytics: Event tracked - ${eventName}`, parameters)
  }
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
