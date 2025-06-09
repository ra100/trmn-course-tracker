import React from 'react'
import { LanguageSelectorProps } from './types'
import { useT, Language } from '../../i18n'
import { SettingSection, SettingLabel, LanguageSelector as LanguageSelectorElement } from './SettingsPanel.styles'

export const LanguageSelector: React.FC<LanguageSelectorProps> = React.memo(({ language, onLanguageChange }) => {
  const t = useT()

  return (
    <SettingSection>
      <SettingLabel>{t.settings.language}</SettingLabel>
      <LanguageSelectorElement
        value={language}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
        aria-label={t.settings.language}
        title={t.settings.language}
      >
        <option value="en">English</option>
        <option value="cs">Čeština</option>
      </LanguageSelectorElement>
    </SettingSection>
  )
})

LanguageSelector.displayName = 'LanguageSelector'
