import React from 'react'
import { ConsentBannerProps } from './types'
import { useT } from '../../i18n'
import { BannerWrapper, BannerContent, BannerText, ButtonGroup, Button } from './GDPRConsentBanner.styles'

export const ConsentBanner: React.FC<ConsentBannerProps> = React.memo(
  ({ isVisible, onAcceptAll, onRejectNonEssential, onShowSettings }) => {
    const t = useT()

    return (
      <BannerWrapper $isVisible={isVisible} role="banner" aria-label={t.gdpr.bannerLabel}>
        <BannerContent>
          <BannerText>{t.gdpr.bannerText}</BannerText>

          <ButtonGroup>
            <Button $variant="outline" onClick={onShowSettings} aria-label={t.gdpr.customizeSettings}>
              {t.gdpr.settings}
            </Button>
            <Button $variant="secondary" onClick={onRejectNonEssential} aria-label={t.gdpr.rejectNonEssential}>
              {t.gdpr.rejectAll}
            </Button>
            <Button $variant="primary" onClick={onAcceptAll} aria-label={t.gdpr.acceptAll}>
              {t.gdpr.acceptAll}
            </Button>
          </ButtonGroup>
        </BannerContent>
      </BannerWrapper>
    )
  }
)

ConsentBanner.displayName = 'ConsentBanner'
