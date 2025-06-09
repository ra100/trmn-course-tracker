import { useState, useEffect } from 'react'
import { ConsentSettings, updateConsent, getStoredConsent, trackConsentChange } from '../../utils/analytics'
import { UseGDPRConsentReturn } from './types'

interface UseGDPRConsentProps {
  onConsentChange?: (consent: Partial<ConsentSettings>) => void
}

export const useGDPRConsent = ({ onConsentChange }: UseGDPRConsentProps): UseGDPRConsentReturn => {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [consentSettings, setConsentSettings] = useState<Partial<ConsentSettings>>({
    analytics: 'denied',
    functionalStorage: 'granted'
  })

  useEffect(() => {
    // Check if user has already made a consent decision
    const storedConsent = getStoredConsent()

    if (storedConsent) {
      // User has already consented, apply stored settings
      setConsentSettings(storedConsent)
      updateConsent(storedConsent)
      setIsVisible(false)
    } else {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    const fullConsent: Partial<ConsentSettings> = {
      analytics: 'granted',
      functionalStorage: 'granted'
    }

    setConsentSettings(fullConsent)
    updateConsent(fullConsent)
    onConsentChange?.(fullConsent)

    // Track consent changes
    trackConsentChange('analytics', true)

    setIsVisible(false)
  }

  const handleRejectNonEssential = () => {
    const essentialOnly: Partial<ConsentSettings> = {
      analytics: 'denied',
      functionalStorage: 'granted'
    }

    setConsentSettings(essentialOnly)
    updateConsent(essentialOnly)
    onConsentChange?.(essentialOnly)

    // Track consent changes
    trackConsentChange('analytics', false)

    setIsVisible(false)
  }

  const handleSaveSettings = () => {
    updateConsent(consentSettings)
    onConsentChange?.(consentSettings)

    // Track consent changes
    trackConsentChange('analytics', consentSettings.analytics === 'granted')

    setShowSettings(false)
    setIsVisible(false)
  }

  const handleConsentToggle = (key: keyof ConsentSettings) => {
    if (key === 'functionalStorage') {
      // Essential cookies cannot be disabled
      return
    }

    setConsentSettings((prev) => ({
      ...prev,
      [key]: prev[key] === 'granted' ? 'denied' : 'granted'
    }))
  }

  return {
    isVisible,
    showSettings,
    consentSettings,
    setShowSettings,
    handleAcceptAll,
    handleRejectNonEssential,
    handleSaveSettings,
    handleConsentToggle
  }
}
