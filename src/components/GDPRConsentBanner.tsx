import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ConsentSettings, updateConsent, getStoredConsent } from '../utils/analytics'
import { useT } from '../i18n'

const BannerWrapper = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border-top: 2px solid ${({ theme }) => theme.colors.primary};
  padding: 1rem;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transform: translateY(${({ $isVisible }) => ($isVisible ? '0' : '100%')});
  transition: transform 0.3s ease-in-out;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`

const BannerContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
`

const BannerText = styled.div`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.875rem;
  line-height: 1.4;

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`

const Button = styled.button<{ $variant: 'primary' | 'secondary' | 'outline' }>`
  padding: 0.5rem 1rem;
  border: 1px solid;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  ${({ theme, $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary};
          border-color: ${theme.colors.primary};
          color: white;

          &:hover {
            background: ${theme.colors.primaryHover};
            border-color: ${theme.colors.primaryHover};
          }
        `
      case 'secondary':
        return `
          background: ${theme.colors.secondary};
          border-color: ${theme.colors.secondary};
          color: white;

          &:hover {
            background: ${theme.colors.secondary};
            border-color: ${theme.colors.secondary};
            opacity: 0.8;
          }
        `
      case 'outline':
        return `
          background: transparent;
          border-color: ${theme.colors.border};
          color: ${theme.colors.text};

          &:hover {
            background: ${theme.colors.background};
            border-color: ${theme.colors.primary};
          }
        `
    }
  }}

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 0.75rem 1rem;
  }
`

const SettingsModal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 1rem;
`

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`

const ModalHeader = styled.h3`
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.25rem;
`

const ConsentOption = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
`

const ConsentLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`

const ConsentDescription = styled.p`
  margin: 0.5rem 0 0 1.75rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.4;
`

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 1rem;
  height: 1rem;
  accent-color: ${({ theme }) => theme.colors.primary};
`

interface GDPRConsentBannerProps {
  onConsentChange?: (consent: Partial<ConsentSettings>) => void
}

export const GDPRConsentBanner: React.FC<GDPRConsentBannerProps> = ({ onConsentChange }) => {
  const t = useT()
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [consentSettings, setConsentSettings] = useState<Partial<ConsentSettings>>({
    analytics: 'denied',
    functionalStorage: 'granted',
    securityStorage: 'granted'
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
      functionalStorage: 'granted',
      securityStorage: 'granted'
    }

    setConsentSettings(fullConsent)
    updateConsent(fullConsent)
    onConsentChange?.(fullConsent)
    setIsVisible(false)
  }

  const handleRejectNonEssential = () => {
    const essentialOnly: Partial<ConsentSettings> = {
      analytics: 'denied',
      functionalStorage: 'granted',
      securityStorage: 'granted'
    }

    setConsentSettings(essentialOnly)
    updateConsent(essentialOnly)
    onConsentChange?.(essentialOnly)
    setIsVisible(false)
  }

  const handleSaveSettings = () => {
    updateConsent(consentSettings)
    onConsentChange?.(consentSettings)
    setShowSettings(false)
    setIsVisible(false)
  }

  const handleConsentToggle = (key: keyof ConsentSettings) => {
    if (key === 'functionalStorage' || key === 'securityStorage') {
      // Essential cookies cannot be disabled
      return
    }

    setConsentSettings((prev) => ({
      ...prev,
      [key]: prev[key] === 'granted' ? 'denied' : 'granted'
    }))
  }

  if (!isVisible && !showSettings) {
    return null
  }

  return (
    <>
      <BannerWrapper $isVisible={isVisible} role="banner" aria-label={t.gdpr.bannerLabel}>
        <BannerContent>
          <BannerText>{t.gdpr.bannerText}</BannerText>

          <ButtonGroup>
            <Button $variant="outline" onClick={() => setShowSettings(true)} aria-label={t.gdpr.customizeSettings}>
              {t.gdpr.settings}
            </Button>
            <Button $variant="secondary" onClick={handleRejectNonEssential} aria-label={t.gdpr.rejectNonEssential}>
              {t.gdpr.rejectAll}
            </Button>
            <Button $variant="primary" onClick={handleAcceptAll} aria-label={t.gdpr.acceptAll}>
              {t.gdpr.acceptAll}
            </Button>
          </ButtonGroup>
        </BannerContent>
      </BannerWrapper>

      <SettingsModal $isOpen={showSettings} role="dialog" aria-modal="true" aria-labelledby="consent-settings-title">
        <ModalContent>
          <ModalHeader id="consent-settings-title">{t.gdpr.settingsTitle}</ModalHeader>

          <ConsentOption>
            <ConsentLabel>
              <Checkbox
                checked={consentSettings.functionalStorage === 'granted'}
                disabled
                aria-describedby="functional-desc"
              />
              {t.gdpr.essentialCookies}
            </ConsentLabel>
            <ConsentDescription id="functional-desc">{t.gdpr.essentialDescription}</ConsentDescription>
          </ConsentOption>

          <ConsentOption>
            <ConsentLabel>
              <Checkbox
                checked={consentSettings.analytics === 'granted'}
                onChange={() => handleConsentToggle('analytics')}
                aria-describedby="analytics-desc"
              />
              {t.gdpr.analyticsCookies}
            </ConsentLabel>
            <ConsentDescription id="analytics-desc">{t.gdpr.analyticsDescription}</ConsentDescription>
          </ConsentOption>

          <ButtonGroup style={{ marginTop: '1.5rem' }}>
            <Button $variant="outline" onClick={() => setShowSettings(false)}>
              {t.gdpr.cancel}
            </Button>
            <Button $variant="primary" onClick={handleSaveSettings}>
              {t.gdpr.saveSettings}
            </Button>
          </ButtonGroup>
        </ModalContent>
      </SettingsModal>
    </>
  )
}
