import React from 'react'
import { MedusaImport } from './MedusaImport'
import { useTranslation, useT } from '~/i18n'
import {
  StatusFilterSection,
  LanguageSelector,
  PreferencesSection,
  useSettingsHandlers,
  SettingsPanelProps
} from './SettingsPanel/index'
import { Button } from '~/components/ui/button'
import { panelContainer, panelTitle, resetButton } from './SettingsPanel/SettingsPanel.styles'

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, onImportMedusaCourses }) => {
  const t = useT()
  const { setLanguage } = useTranslation()

  const { handleToggle, handleThemeToggle, handleLanguageChange, handleReset } = useSettingsHandlers({
    settings,
    onSettingsChange,
    setLanguage
  })

  return (
    <div className={panelContainer}>
      <h3 className={panelTitle}>{t.settings.title}</h3>

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

      <Button variant="outline" colorPalette="amber" className={resetButton} onClick={handleReset}>
        {t.ui.reset} to Defaults
      </Button>
    </div>
  )
}
