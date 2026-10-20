// UI text dictionary. All UI strings must come from here (approved texts in PRD).
import { useLanguage } from './LanguageContext'
import type { Language } from './language'

export type { Language }

export type Strings = {
  appName: string
  back: string
  languageButton: string
  homeSubtitle: string
  practiceButton: string
  aboutButton: string
  aboutTitle: string
  aboutText: string
  aboutTableTitle: string
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
    aboutText:
      'כפל כיף היא אפליקציה פשוטה ומהנה לתרגול ולשינון לוח הכפל. בחרו טבלה, פתרו תרגילים וקבלו משוב מיידי. האפליקציה פועלת גם ללא חיבור לאינטרנט.',
    aboutTableTitle: 'לוח הכפל המלא',
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
  en: {
    appName: 'Times Fun',
    back: 'Back',
    languageButton: 'עברית',
    homeSubtitle: 'Learn the times table the fun way!',
    practiceButton: "Let's Practice",
    aboutButton: 'About',
    aboutTitle: 'About Times Fun',
    aboutText:
      'Times Fun is a simple, fun app for practicing and memorizing the times table. Choose a table, solve exercises and get instant feedback. The app works even without an internet connection.',
    aboutTableTitle: 'The Full Times Table',
    chooseTable: 'Choose a table:',
    tableAll: 'All',
    answerLabel: 'Your answer',
    answerPlaceholder: 'Type your answer',
    check: 'Check',
    feedbackCorrect: 'Correct! Great job!',
    feedbackWrong: 'Not quite, try again',
    feedbackEmpty: 'Type an answer, then tap "Check"',
    skip: 'Skip',
    finish: 'Finish',
    correctCountLabel: 'Correct answers:',
    summaryTitle: 'Practice Summary',
    summaryListTitle: 'Exercises left unsolved:',
    summaryEmpty: 'No unsolved exercises. Great job!',
    solveSkipped: 'I want to solve',
    done: 'Done',
  },
}

export function useStrings(): Strings {
  return strings[useLanguage().language]
}
