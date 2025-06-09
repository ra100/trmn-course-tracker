import React from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'
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

  // Focus trap for settings modal
  const focusTrapRef = useFocusTrap({
    isActive: showSettings,
    restoreOnDeactivate: true,
    onEscape: () => setShowSettings(false)
  })

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
        focusTrapRef={focusTrapRef as React.RefObject<HTMLDivElement>}
      />
    </>
  )
}
