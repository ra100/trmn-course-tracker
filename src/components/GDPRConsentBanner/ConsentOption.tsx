import React from 'react'
import { Switch } from '~/components/ui/switch'
import {
  consentOption,
  consentOptionInfo,
  consentOptionTitle,
  consentOptionDescription
} from './GDPRConsentBanner.styles'
import { ConsentOptionProps } from './types'

export const ConsentOption: React.FC<ConsentOptionProps> = React.memo(
  ({ label, description, checked, disabled = false, onChange, ariaDescribedby }) => (
    <div className={consentOption}>
      <div className={consentOptionInfo}>
        <h4 className={consentOptionTitle}>{label}</h4>
        <p id={ariaDescribedby} className={consentOptionDescription}>
          {description}
        </p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} aria-describedby={ariaDescribedby} />
    </div>
  )
)

ConsentOption.displayName = 'ConsentOption'
