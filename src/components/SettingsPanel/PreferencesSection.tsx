import React from 'react'
import { PreferencesSectionProps } from './types'
import { useT } from '../../i18n'
import { SettingToggle } from './SettingToggle'
import { SettingSection, SettingLabel, ToggleGroup } from './SettingsPanel.styles'

export const PreferencesSection: React.FC<PreferencesSectionProps> = React.memo(
  ({ isDarkMode, autoSave, onThemeToggle, onAutoSaveToggle }) => {
    const t = useT()

    return (
      <SettingSection>
        <SettingLabel>{t.settings.theme}</SettingLabel>
        <ToggleGroup>
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
        </ToggleGroup>
      </SettingSection>
    )
  }
)

PreferencesSection.displayName = 'PreferencesSection'
