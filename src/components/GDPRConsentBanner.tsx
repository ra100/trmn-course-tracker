import React from 'react'
import { ConsentBanner, ConsentSettingsModal, useGDPRConsent, GDPRConsentBannerProps } from './GDPRConsentBanner/index'

export const GDPRConsentBanner: React.FC<GDPRConsentBannerProps> = ({ onConsentChange }) => {
  const {
    isVisible,
    showSettings,
    consentSettings,
    setShowSettings,
    handleAcceptAll,
    handleRejectNonEssential,
    handleSaveSettings,
    handleConsentToggle
  } = useGDPRConsent({ onConsentChange })

  if (!isVisible && !showSettings) {
    return null
  }

  return (
    <>
      <ConsentBanner
        isVisible={isVisible}
        onAcceptAll={handleAcceptAll}
        onRejectNonEssential={handleRejectNonEssential}
        onShowSettings={() => setShowSettings(true)}
      />

      <ConsentSettingsModal
        isOpen={showSettings}
        consentSettings={consentSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        onConsentToggle={handleConsentToggle}
      />
    </>
  )
}
