import React from 'react'
import { Button } from '~/components/ui/button'
import { useT } from '~/i18n'
import { bannerContainer, bannerContent, bannerText, bannerActions } from './GDPRConsentBanner.styles'
import { ConsentBannerProps } from './types'

export const ConsentBanner: React.FC<ConsentBannerProps> = React.memo(
  ({ isVisible, onAcceptAll, onRejectNonEssential, onShowSettings }) => {
    const t = useT()

    if (!isVisible) {
      return null
    }

    return (
      <div className={bannerContainer}>
        <div className={bannerContent}>
          <p className={bannerText}>{t.gdpr.bannerText}</p>
          <div className={bannerActions}>
            <Button onClick={onAcceptAll} size="sm">
              {t.gdpr.acceptAll}
            </Button>
            <Button onClick={onRejectNonEssential} variant="outline" size="sm">
              {t.gdpr.rejectNonEssential}
            </Button>
            <Button onClick={onShowSettings} variant="ghost" size="sm">
              {t.gdpr.settings}
            </Button>
          </div>
        </div>
      </div>
    )
  }
)

ConsentBanner.displayName = 'ConsentBanner'
