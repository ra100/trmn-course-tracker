import { useContext } from 'react'
import { I18nContext } from './context-types'
import { TranslationStrings } from './types'

export const useTranslation = () => {
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
