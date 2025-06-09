import React, { useRef } from 'react'
import { ConsentSettingsModalProps } from './types'
import { useT } from '../../i18n'
import { ConsentOption } from './ConsentOption'
import { SettingsModal, ModalContent, ModalHeader, ButtonGroup, Button } from './GDPRConsentBanner.styles'

export const ConsentSettingsModal: React.FC<ConsentSettingsModalProps> = React.memo(
  ({ isOpen, consentSettings, onClose, onSave, onConsentToggle, focusTrapRef }) => {
    const t = useT()
    const settingsCloseButtonRef = useRef<HTMLButtonElement>(null)

    if (!isOpen) {
      return null
    }

    return (
      <SettingsModal
        $isOpen={isOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-settings-title"
        aria-describedby="consent-settings-description"
        ref={focusTrapRef}
      >
        <ModalContent>
          <ModalHeader id="consent-settings-title">{t.gdpr.settingsTitle}</ModalHeader>
          <p id="consent-settings-description" className="sr-only">
            {t.accessibility.focusTrapActive}
          </p>

          <ConsentOption
            label={t.gdpr.essentialCookies}
            description={t.gdpr.essentialDescription}
            checked={consentSettings.functionalStorage === 'granted'}
            disabled
            ariaDescribedby="functional-desc"
          />

          <ConsentOption
            label={t.gdpr.analyticsCookies}
            description={t.gdpr.analyticsDescription}
            checked={consentSettings.analytics === 'granted'}
            onChange={() => onConsentToggle('analytics')}
            ariaDescribedby="analytics-desc"
          />

          <ButtonGroup style={{ marginTop: '1.5rem' }}>
            <Button $variant="outline" onClick={onClose} ref={settingsCloseButtonRef}>
              {t.gdpr.cancel}
            </Button>
            <Button $variant="primary" onClick={onSave}>
              {t.gdpr.saveSettings}
            </Button>
          </ButtonGroup>
        </ModalContent>
      </SettingsModal>
    )
  }
)

ConsentSettingsModal.displayName = 'ConsentSettingsModal'
