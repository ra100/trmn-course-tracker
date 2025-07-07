import { UserSettings } from '../../types'
import { Language } from '../../i18n'

export interface SettingsPanelProps {
  settings: UserSettings
  onSettingsChange: (settings: UserSettings) => void
  onImportMedusaCourses?: (
    courseCodes: string[],
    completionDates?: Map<string, Date>
  ) => {
    imported: number
    trackable: number
    alreadyCompleted: number
    newCourses: string[]
    untrackedCourses: string[]
  }
}

export interface SettingToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export interface LanguageSelectorProps {
  language: Language
  onLanguageChange: (language: Language) => void
}

export interface ThemeSelectorProps {
  isDarkMode: boolean
  onThemeToggle: () => void
}

export interface StatusFilterSectionProps {
  showCompleted: boolean
  showUnavailable: boolean
  onToggle: (key: keyof UserSettings, value: boolean) => void
}

export interface PreferencesSectionProps {
  autoSave: boolean
  onAutoSaveToggle: (checked: boolean) => void
}

export interface UseSettingsHandlersProps {
  settings: UserSettings
  onSettingsChange: (settings: UserSettings) => void
  setLanguage: (language: Language) => void
}

export interface UseSettingsHandlersReturn {
  handleToggle: (key: keyof UserSettings, value: boolean) => void
  handleLanguageChange: (language: Language) => void
  handleReset: () => void
}
