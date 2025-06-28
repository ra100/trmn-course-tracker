import { ConsentSettings } from '~/utils/analytics'

export interface GDPRConsentBannerProps {
  onConsentChange: (consent: Partial<ConsentSettings>) => void
}

export interface ConsentBannerProps {
  isVisible: boolean
  onAcceptAll: () => void
  onRejectNonEssential: () => void
  onShowSettings: () => void
}

export interface ConsentSettingsModalProps {
  isOpen: boolean
  consentSettings: Partial<ConsentSettings>
  onClose: () => void
  onSave: () => void
  onConsentToggle: (key: keyof ConsentSettings) => void
}

export interface ConsentOptionProps {
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange?: () => void
  ariaDescribedby: string
}

export interface UseGDPRConsentReturn {
  isVisible: boolean
  showSettings: boolean
  consentSettings: Partial<ConsentSettings>
  setShowSettings: (show: boolean) => void
  handleAcceptAll: () => void
  handleRejectNonEssential: () => void
  handleSaveSettings: () => void
  handleConsentToggle: (key: keyof ConsentSettings) => void
}
