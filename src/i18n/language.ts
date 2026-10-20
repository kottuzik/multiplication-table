// Language selection and the language preference (the only value the app stores).

export type Language = 'he' | 'en'

export const LANGUAGE_STORAGE_KEY = 'times-fun:language'

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

function isLanguage(value: unknown): value is Language {
  return value === 'he' || value === 'en'
}

function getStorage(): StorageLike | null {
  try {
    return window.localStorage
  } catch {
    // Accessing localStorage itself can throw when site data is blocked.
    return null
  }
}

function browserLanguage(): string | undefined {
  if (typeof navigator === 'undefined') return undefined
  return navigator.languages?.[0] ?? navigator.language
}

// Saved manual choice first, then English only for an English browser, otherwise Hebrew.
export function detectInitialLanguage(
  storage: StorageLike | null = getStorage(),
  navigatorLanguage: string | undefined = browserLanguage(),
): Language {
  try {
    const saved = storage?.getItem(LANGUAGE_STORAGE_KEY)
    if (isLanguage(saved)) return saved
  } catch {
    // Blocked storage: fall back to the browser language.
  }
  const primary = (navigatorLanguage ?? '').toLowerCase()
  return primary === 'en' || primary.startsWith('en-') ? 'en' : 'he'
}

export function saveLanguage(language: Language, storage: StorageLike | null = getStorage()): void {
  try {
    storage?.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    // Keep working with the in-memory choice.
  }
}

export function languageDir(language: Language): 'rtl' | 'ltr' {
  return language === 'he' ? 'rtl' : 'ltr'
}

export function otherLanguage(language: Language): Language {
  return language === 'he' ? 'en' : 'he'
}
