import React from 'react'
import { LanguageSelectorProps } from './types'
import { useT, Language } from '~/i18n'
import { settingSection, settingLabel, languageSelector } from './SettingsPanel.styles'

export const LanguageSelector: React.FC<LanguageSelectorProps> = React.memo(({ language, onLanguageChange }) => {
  const t = useT()

  return (
    <div className={settingSection}>
      <label htmlFor="language-select" className={settingLabel}>
        {t.settings.language}
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
        aria-label={t.settings.language}
        title={t.settings.language}
        className={languageSelector}
      >
        <option value="en">English</option>
        <option value="cs">Čeština</option>
      </select>
    </div>
  )
})

LanguageSelector.displayName = 'LanguageSelector'
