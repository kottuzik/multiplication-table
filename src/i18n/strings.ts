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
  chooseTable: string
  tableAll: string
  answerLabel: string
  answerPlaceholder: string
  check: string
  feedbackCorrect: string
  feedbackWrong: string
  feedbackEmpty: string
  skip: string
  finish: string
  correctCountLabel: string
  summaryTitle: string
  summaryListTitle: string
  summaryEmpty: string
  solveSkipped: string
  done: string
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
    chooseTable: 'בחרו טבלה:',
    tableAll: 'הכול',
    answerLabel: 'התשובה שלך',
    answerPlaceholder: 'הקלידו תשובה',
    check: 'בדיקה',
    feedbackCorrect: 'נכון! כל הכבוד!',
    feedbackWrong: 'לא נכון, נסו שוב',
    feedbackEmpty: 'הקלידו תשובה ואז לחצו על "בדיקה"',
    skip: 'דלג',
    finish: 'סיום תרגול',
    correctCountLabel: 'תשובות נכונות:',
    summaryTitle: 'סיכום התרגול',
    summaryListTitle: 'תרגילים שנשארו ללא פתרון:',
    summaryEmpty: 'לא נשארו תרגילים ללא פתרון. כל הכבוד!',
    solveSkipped: 'רוצה לפתור',
    done: 'סיים',
  },
}

export const currentLanguage: Language = 'he'

export function useStrings(): Strings {
  return strings[currentLanguage]
}
