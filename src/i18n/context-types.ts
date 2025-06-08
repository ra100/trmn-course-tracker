import { createContext } from 'react'
import { Language, TranslationStrings } from './types'

export interface I18nContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: TranslationStrings
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined)
