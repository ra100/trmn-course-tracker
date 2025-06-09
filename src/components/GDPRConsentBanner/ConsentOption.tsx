import React from 'react'
import { ConsentOptionProps } from './types'
import {
  ConsentOption as ConsentOptionContainer,
  ConsentLabel,
  ConsentDescription,
  Checkbox
} from './GDPRConsentBanner.styles'

export const ConsentOption: React.FC<ConsentOptionProps> = React.memo(
  ({ label, description, checked, disabled = false, onChange, ariaDescribedby }) => {
    return (
      <ConsentOptionContainer>
        <ConsentLabel>
          <Checkbox checked={checked} disabled={disabled} onChange={onChange} aria-describedby={ariaDescribedby} />
          {label}
        </ConsentLabel>
        <ConsentDescription id={ariaDescribedby}>{description}</ConsentDescription>
      </ConsentOptionContainer>
    )
  }
)

ConsentOption.displayName = 'ConsentOption'
