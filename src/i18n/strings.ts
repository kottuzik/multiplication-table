// UI text dictionary. All UI strings must come from here (approved texts in PRD).
// Milestone 3 adds an `en` entry with the same keys.

export type Language = 'he'

export type Strings = {
  appName: string
  back: string
  languageButton: string
  homeSubtitle: string
  practiceButton: string
  aboutButton: string
  aboutTitle: string
}

export const strings: Record<Language, Strings> = {
  he: {
    appName: 'כפל כיף',
    back: 'חזרה',
    languageButton: 'English',
    homeSubtitle: 'לומדים את לוח הכפל בכיף!',
    practiceButton: 'בואו נתרגל',
    aboutButton: 'אודות',
    aboutTitle: 'אודות כפל כיף',
  },
}

export const currentLanguage: Language = 'he'

export function useStrings(): Strings {
  return strings[currentLanguage]
}
