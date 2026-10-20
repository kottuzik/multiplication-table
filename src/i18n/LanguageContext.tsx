import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { detectInitialLanguage, languageDir, otherLanguage, saveLanguage } from './language'
import type { Language } from './language'
import { strings } from './strings'

type LanguageContextValue = {
  language: Language
  toggleLanguage: () => void
}

// Default (no provider, e.g. a screen rendered alone in a test): Hebrew.
const LanguageContext = createContext<LanguageContextValue>({ language: 'he', toggleLanguage: () => {} })

// Language state is kept apart from the practice state, so switching never touches the exercise.
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => detectInitialLanguage())

  // Layout effect: apply before paint so English users never see an RTL flash.
  useLayoutEffect(() => {
    const root = document.documentElement
    root.lang = language
    root.dir = languageDir(language)
    document.title = strings[language].appName
  }, [language])

  // Only a manual choice is saved; the detected default is never written.
  const toggleLanguage = useCallback(() => {
    const next = otherLanguage(language)
    setLanguage(next)
    saveLanguage(next)
  }, [language])

  const value = useMemo(() => ({ language, toggleLanguage }), [language, toggleLanguage])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext)
}
