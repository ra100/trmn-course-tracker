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
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  const handleLanguageChange = (language: Language) => {
    const newSettings = {
      ...settings,
      language
    }
    onSettingsChange(newSettings)
    setLanguage(language)
  }

  const handleReset = () => {
    onSettingsChange({
      layout: 'tree',
      showCompleted: true,
      showUnavailable: true,
      autoSave: true,
      language: 'en'
    })
  }

  return {
    handleToggle,
    handleLanguageChange,
    handleReset
  }
}
