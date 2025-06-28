import React from 'react'
import { PreferencesSectionProps } from './types'
import { useT } from '~/i18n'
import { SettingToggle } from './SettingToggle'
import { settingSection, settingLabel, toggleGroup } from './SettingsPanel.styles'

export const PreferencesSection: React.FC<PreferencesSectionProps> = React.memo(
  ({ isDarkMode, autoSave, onThemeToggle, onAutoSaveToggle }) => {
    const t = useT()

    return (
      <div className={settingSection}>
        <div className={settingLabel}>{t.settings.theme}</div>
        <div className={toggleGroup}>
          <SettingToggle
            label={t.settings.dark}
            description="Switch between light and dark theme"
            checked={isDarkMode}
            onChange={onThemeToggle}
          />

          <SettingToggle
            label={t.settings.autoSave}
            description="Automatically save your course completion progress"
            checked={autoSave}
            onChange={onAutoSaveToggle}
          />
        </div>
      </div>
    )
  }
)

PreferencesSection.displayName = 'PreferencesSection'
