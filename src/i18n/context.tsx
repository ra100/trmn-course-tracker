import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, TranslationStrings } from './types'
import { enTranslations } from './translations/en'
import { csTranslations } from './translations/cs'

interface I18nContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: TranslationStrings
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const translations: Record<Language, TranslationStrings> = {
  en: enTranslations,
  cs: csTranslations
}

interface I18nProviderProps {
  children: ReactNode
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem('trmn-language') as Language
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage)
    } else {
      // Try to detect browser language
      const browserLanguage = navigator.language.slice(0, 2) as Language
      if (translations[browserLanguage]) {
        setLanguageState(browserLanguage)
      }
    }
  }, [])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem('trmn-language', newLanguage)
  }

  const currentTranslations = translations[language] || translations.en

  const value: I18nContextType = {
    language,
    setLanguage,
    t: currentTranslations
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider')
  }
  return context
}

// Convenience hook for just getting translations
export const useT = (): TranslationStrings => {
  const { t } = useTranslation()
  return t
}
