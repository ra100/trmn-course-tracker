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
export const trackEvent = (eventName: string, parameters?: Record<string, any>): void => {
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
