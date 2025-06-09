import React from 'react'
import { MedusaImport } from './MedusaImport'
import { useTranslation, useT } from '../i18n'
import {
  StatusFilterSection,
  LanguageSelector,
  PreferencesSection,
  useSettingsHandlers,
  SettingsPanelProps,
  PanelContainer,
  PanelTitle,
  ResetButton
} from './SettingsPanel/index'

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, onImportMedusaCourses }) => {
  const t = useT()
  const { setLanguage } = useTranslation()

  const { handleToggle, handleThemeToggle, handleLanguageChange, handleReset } = useSettingsHandlers({
    settings,
    onSettingsChange,
    setLanguage
  })

  return (
    <PanelContainer>
      <PanelTitle>{t.settings.title}</PanelTitle>

      <StatusFilterSection
        showCompleted={settings.showCompleted}
        showUnavailable={settings.showUnavailable}
        onToggle={handleToggle}
      />

      <LanguageSelector language={settings.language} onLanguageChange={handleLanguageChange} />

      <PreferencesSection
        isDarkMode={settings.theme === 'dark'}
        autoSave={settings.autoSave}
        onThemeToggle={handleThemeToggle}
        onAutoSaveToggle={(checked) => handleToggle('autoSave', checked)}
      />

      {onImportMedusaCourses && <MedusaImport onImportMedusaCourses={onImportMedusaCourses} />}

      <ResetButton onClick={handleReset}>{t.ui.reset} to Defaults</ResetButton>
    </PanelContainer>
  )
}
