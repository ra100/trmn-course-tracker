import { UserSettings } from '../../types'
import { Language } from '../../i18n'
import { trackSettingsChange } from '../../utils/analytics'
import { UseSettingsHandlersProps, UseSettingsHandlersReturn } from './types'

export const useSettingsHandlers = ({
  settings,
  onSettingsChange,
  setLanguage
}: UseSettingsHandlersProps): UseSettingsHandlersReturn => {
  const handleToggle = (key: keyof UserSettings, value: boolean) => {
    trackSettingsChange(key, settings[key], value)
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  const handleThemeToggle = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light'
    trackSettingsChange('theme', settings.theme, newTheme)
    onSettingsChange({
      ...settings,
      theme: newTheme
    })
  }

  const handleLanguageChange = (language: Language) => {
    trackSettingsChange('language', settings.language, language)
    const newSettings = {
      ...settings,
      language
    }
    onSettingsChange(newSettings)
    setLanguage(language)
  }

  const handleReset = () => {
    trackSettingsChange('reset_all', 'reset_settings', 'default_values')
    onSettingsChange({
      theme: 'light',
      layout: 'tree',
      showCompleted: true,
      showUnavailable: true,
      autoSave: true,
      language: 'en'
    })
  }

  return {
    handleToggle,
    handleThemeToggle,
    handleLanguageChange,
    handleReset
  }
}
