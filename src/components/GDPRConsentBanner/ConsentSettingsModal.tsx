import React from 'react'
import { Dialog } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { useT } from '~/i18n'
import { ConsentOption } from './ConsentOption'
import { modalContent, modalActions } from './GDPRConsentBanner.styles'
import { ConsentSettingsModalProps } from './types'

export const ConsentSettingsModal: React.FC<ConsentSettingsModalProps> = React.memo(
  ({ isOpen, consentSettings, onClose, onSave, onConsentToggle }) => {
    const t = useT()

    return (
      <Dialog.Root open={isOpen} onOpenChange={(details) => !details.open && onClose()}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Title>{t.gdpr.settingsTitle}</Dialog.Title>
            <Dialog.Description className="sr-only">{t.accessibility.focusTrapActive}</Dialog.Description>
            <div className={modalContent}>
              <ConsentOption
                label={t.gdpr.essentialCookies}
                description={t.gdpr.essentialDescription}
                checked
                disabled
                ariaDescribedby="essential-desc"
              />
              <ConsentOption
                label={t.gdpr.analyticsCookies}
                description={t.gdpr.analyticsDescription}
                checked={consentSettings.analytics === 'granted'}
                onChange={() => onConsentToggle('analytics')}
                ariaDescribedby="analytics-desc"
              />
            </div>
            <div className={modalActions}>
              <Dialog.CloseTrigger asChild>
                <Button variant="outline">{t.gdpr.cancel}</Button>
              </Dialog.CloseTrigger>
              <Button onClick={onSave}>{t.gdpr.saveSettings}</Button>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    )
  }
)

ConsentSettingsModal.displayName = 'ConsentSettingsModal'
