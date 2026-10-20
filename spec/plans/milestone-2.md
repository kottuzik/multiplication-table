# תוכנית Milestone 2 – תרגול לוח הכפל מקצה לקצה

מקורות: `MILESTONES.md` (Milestone 2), `PRD.md` (F2, זרימות 1, 2 ו-5, טקסטים מאושרים, מקרי קצה, החלטות מוצר 1, 3, 4, 6, 10, 13), `ARCHITECTURE.md` (סעיפים 4, 5, 6), `DESIGN.md` (1.2, 2.1–2.5) והתמונות `wireframes.png`, `mockups.png`, `style-guide.png`. הקוד הקיים (Milestone 1) הוא נקודת המוצא.

## 1. היקף

**בתוך ה-Milestone:**
- מנוע תרגילים מקומי (פונקציות טהורות) ולוגיקת מצב תרגול (Reducer) שניתנים לבדיקה ב-Vitest.
- מצב התרגול נשמר ב-`App` (לא בתוך מסך הלימוד), כך שהוא שורד מעבר בין מסכים.
- מסך לימוד מלא: בורר **הכול** / 1–10 בשתי שורות, כרטיס תרגיל, שדה תשובה, כפתורי **בדיקה** ו-**דלג**, אזור משוב, מונה **תשובות נכונות**, כפתור **סיום תרגול** וחלון סיכום.
- הוספת כל טקסטי מסך הלימוד והסיכום (עברית בלבד) למילון הקיים.
- בדיקות Vitest ללוגיקה ובדיקות UI (React Testing Library) למסך.

**מחוץ ל-Milestone (לא לממש):** תרגום לאנגלית והפעלת כפתור השפה (Milestone 3), מסך אודות מלא וטבלת 10×10 (Milestone 3), PWA (Milestone 4), כל שמירה ב-Storage, צלילים, אנימציות, טיימר, רמזים.

## 2. קבצים

**חדשים:**
```text
src/practice/exercise.ts          # Exercise type, createExercise(table, random), isCorrect(), sanitizeAnswer()
src/practice/exercise.test.ts     # engine tests
src/practice/practiceState.ts     # PracticeState type, initialPracticeState(), practiceReducer()
src/practice/practiceState.test.ts# reducer tests (counter, wrong/empty, table switch, skip list, summary)
src/components/TableSelector.tsx  # "All" + 1..10 chips in two rows (aria-pressed)
src/components/SummaryDialog.tsx  # in-screen modal: title, unsolved list with answers / encouraging message, Close
src/screens/PracticeScreen.test.tsx # UI tests
src/styles/practice.css           # practice screen + selector + feedback + dialog styles
```

**שינויים:**
- `src/App.tsx` — `useReducer(practiceReducer, ...)` ברמת ה-App; העברת state ו-dispatch ל-`PracticeScreen`; ניקוי השדות הזמניים (קלט, משוב, חלון פתוח) ביציאה ממסך הלימוד.
- `src/screens/PracticeScreen.tsx` — החלפת ה-Placeholder במסך המלא.
- `src/i18n/strings.ts` — מפתחות חדשים (סעיף 4.5).
- `src/components/icons.tsx` — אייקונים: ✓ (Check), ✗ (Cross), כוכב.
- `src/App.test.tsx` — עדכון בדיקת מסך הלימוד (אין יותר כותרת Placeholder) + בדיקת שמירת מצב בין מסכים.
- `spec/ARCHITECTURE.md` — הוספת ADR-4 (סעיף 4.8).
- `spec/MILESTONES.md` — סימון 🟡 בסיום.

אין תלויות חדשות.

## 3. מבנה ונתונים

```ts
type Table = 'all' | 1 | 2 | ... | 10
type Exercise = { factorA: number; factorB: number }
type Feedback = 'correct' | 'wrong' | 'empty' | null

type PracticeState = {
  selectedTable: Table      // default 'all'
  exercise: Exercise
  answerInput: string       // digits only, max 3
  correctCount: number      // starts at 0
  feedback: Feedback
  skipped: Exercise[]       // unsolved skipped exercises, in skip order, no duplicates
  isSummaryOpen: boolean
}
```

פעולות ה-Reducer: `input`, `check`, `skip`, `selectTable`, `openSummary`, `closeSummary`, `leaveScreen`.
- ה-Reducer מקבל פונקציית `random` (ברירת מחדל `Math.random`) דרך יצירה (`createPracticeReducer(random)`) או כשדה בפעולה — כדי שהבדיקות יהיו דטרמיניסטיות.
- כל השינויים עוברים דרך ה-Reducer, כך שעדכון המונה והחלפת התרגיל קורים יחד, באופן אטומי.

## 4. גישה ופרטי מימוש

### 4.1 מנוע תרגילים (`exercise.ts`)
- `createExercise(table, random)`: ב-`all` שני גורמים בלתי תלויים `1 + floor(random() * 10)`; בטבלה N — גורם אחד N, השני אקראי 1–10, והמיקום של N (ראשון/שני) אקראי. מותר תרגיל זהה לקודם.
- `sanitizeAnswer(raw)`: הסרת כל מה שאינו ספרה ASCII `0–9`, ואז חיתוך ל-3 תווים (סינון לפני חיתוך, כדי שהדבקה של `a12b3` תיתן `123`).
- `isCorrect(exercise, answer)`: השוואה לפי ערך מספרי (`Number(answer)`), כך ש-`056` = 56.
- `sameExercise(a, b)`: השוואה לפי `factorA` ו-`factorB` בסדרם.

### 4.2 לוגיקת מצב (`practiceState.ts`)
- **input:** שומר `sanitizeAnswer(value)` ומנקה את `feedback` (המשוב נעלם עם ההקלדה הבאה).
- **check:**
  - קלט ריק → `feedback = 'empty'`; תרגיל ומונה ללא שינוי. חריג: אם המשוב הנוכחי הוא `correct` (כלומר רגע אחרי תשובה נכונה, השדה כבר נוקה) — אין שינוי, כדי שלחיצה כפולה מהירה לא תחליף את הודעת ההצלחה בהודעת "שדה ריק".
  - נכון → `correctCount + 1`, הסרת התרגיל מ-`skipped` אם קיים שם, תרגיל חדש מהטבלה הנבחרת, ניקוי הקלט, `feedback = 'correct'`.
  - שגוי → `feedback = 'wrong'`, ניקוי הקלט, תרגיל ומונה ללא שינוי.
  - מניעת ספירה כפולה: כיוון שאחרי תשובה נכונה הקלט מתנקה באותו עדכון, לחיצה נוספת מגיעה לשדה ריק ואינה נספרת.
- **skip:** הוספת התרגיל ל-`skipped` אם אינו שם כבר; תרגיל חדש; ניקוי קלט ומשוב; המונה ללא שינוי.
- **selectTable(t):** אם `t` זהה לנבחרת — אין שינוי (מקרה קצה ב-PRD). אחרת: עדכון הטבלה, תרגיל חדש, ניקוי קלט ומשוב; המונה והרשימה נשמרים.
- **openSummary / closeSummary:** רק משנים את `isSummaryOpen`.
- **leaveScreen:** מנקה `answerInput`, `feedback` ו-`isSummaryOpen`; שומר טבלה, תרגיל, מונה ורשימה.

### 4.3 חיבור ל-App
- `App` מחזיק `const [practice, dispatch] = useReducer(...)`.
- `useEffect` על `screen`: כשהמסך אינו `practice` → `dispatch({ type: 'leaveScreen' })`. כך גם כפתור **חזרה**, כפתור הדפדפן (popstate) ומקרה "יציאה כשחלון הסיכום פתוח" מטופלים במקום אחד (החלון נסגר, הרשימה נשמרת).
- אין שום כתיבה ל-`localStorage`/`sessionStorage`; טעינה מחדש מתחילה מ-`initialPracticeState()` (מונה 0, `all`).

### 4.4 מסך הלימוד (לפי Wireframe, Mockup ו-DESIGN 1.2)
סדר הרכיבים מלמעלה למטה:
1. `TopBar` הקיים (חזרה + שפה).
2. כותרת `h1` מוסתרת ויזואלית (`appName`) — למבנה נגיש; ב-Wireframe אין כותרת גלויה במסך זה.
3. **בורר טבלאות** (`TableSelector`): כותרת **בחרו טבלה:** בסגנון H3, ומתחתיה קבוצת כפתורים (`role="group"` עם `aria-labelledby` לכותרת). כל כפתור עם `aria-pressed`. CSS Grid של 6 עמודות: שורה 1 **הכול**, 1–5; שורה 2: 6–10. ב-RTL הסדר מימין לשמאל אוטומטית. כל כפתור לפחות 44×44px; רווח בין הכפתורים קטן מספיק (כ-4px) כך ש-6 כפתורים נכנסים ב-288px (רוחב 320 פחות שוליים) ללא גלילה אופקית. לא פעיל: רקע לבן ומסגרת כחולה בהירה; פעיל: רקע צהוב `Accent Yellow`.
4. **כרטיס תרגול** (רקע `Surface`, רדיוס 16px, צל כרטיס) — לפי ה-Wireframe, הכרטיס מכיל:
   - התרגיל `7 × 8 = ?` במספרים גדולים ומודגשים בצבע `Primary`, בתוך `dir="ltr"`.
   - `<form>` (Enter = בדיקה) עם `<label>` מוסתר ויזואלית **התשובה שלך**, ושדה `type="text"`, `inputMode="numeric"`, `pattern="[0-9]*"`, `autoComplete="off"`, Placeholder **הקלידו תשובה**, רקע לבן, מסגרת כחולה דקה. בלי `maxLength` (החיתוך נעשה אחרי הסינון).
   - שורת כפתורים: **בדיקה** (ראשי, צהוב, כ-2/3 מהרוחב, `type="submit"`) ראשון ב-DOM — ולכן מימין ב-RTL; **דלג** (משני: רקע לבן, מסגרת `Primary`) בצד השני.
   - **אזור משוב** צמוד מתחת לשורת הכפתורים, `role="status"` (`aria-live="polite"`) שקיים תמיד ב-DOM, עם גובה מינימלי קבוע כדי שלא תהיה קפיצה. טקסט בצבע `Text`; הצלחה: אייקון ✓ ורקע/מסגרת ירוקים בהירים; כישלון: אייקון ✗ ורקע/מסגרת אדומים בהירים; שדה ריק: סגנון ניטרלי.
5. **כרטיס מונה** (רקע `Surface`): **תשובות נכונות:** בגודל Caption ומתחתיו המספר הגדול. הטקסט הנגיש של האזור משלב את התווית והמספר.
6. **סיום תרגול**: כפתור טקסט ממורכז בצבע `Primary`, גובה מגע לפחות 44px.

**Focus:** אחרי **בדיקה** (נכונה, שגויה או ריקה) ואחרי **דלג** — `inputRef.current.focus()`, כדי שהמקלדת בטלפון תישאר פתוחה. בכניסה למסך אין Focus אוטומטי (כדי לא לפתוח מקלדת בלי בקשה).

### 4.5 טקסטים חדשים במילון (`strings.ts`, בדיוק לפי טבלת PRD)
| מפתח | עברית |
|---|---|
| `chooseTable` | בחרו טבלה: |
| `tableAll` | הכול |
| `answerLabel` | התשובה שלך |
| `answerPlaceholder` | הקלידו תשובה |
| `check` | בדיקה |
| `feedbackCorrect` | נכון! כל הכבוד! |
| `feedbackWrong` | לא נכון, נסו שוב |
| `feedbackEmpty` | הקלידו תשובה ואז לחצו על "בדיקה" |
| `skip` | דלג |
| `finish` | סיום תרגול |
| `correctCountLabel` | תשובות נכונות: |
| `summaryTitle` | סיכום התרגול |
| `summaryListTitle` | תרגילים שנשארו ללא פתרון: |
| `summaryEmpty` | לא נשארו תרגילים ללא פתרון. כל הכבוד! |
| `close` | סגירה |

המונה בטבלת ה-PRD הוא "תשובות נכונות: N"; ההצגה מפצלת את התווית מהמספר (כמו ב-Wireframe) — אותו טקסט, ללא שינוי ניסוח.

### 4.6 חלון הסיכום (`SummaryDialog`)
- רכיב מותאם (לא `<dialog>` מובנה — ראו ADR-4): שכבת רקע כהה-שקופה מעל כל המסך (`position: fixed`), ובתוכה כרטיס לבן ברוחב המסך פחות שוליים, רדיוס 16px וצל כרטיס.
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` לכותרת **סיכום התרגול** (H2).
- כשיש תרגילים: **תרגילים שנשארו ללא פתרון:** (H3) ורשימה (`<ul>`) של שורות על רקע `Surface`, כל אחת `7 × 8 = 56` ב-`dir="ltr"`. רק אזור הרשימה נגלל (`max-height` + `overflow-y: auto`). כשאין: אייקון כוכב והודעה **לא נשארו תרגילים ללא פתרון. כל הכבוד!**
- כפתור **סגירה** ראשי (רקע `Primary`, טקסט לבן).
- **מקלדת:** בפתיחה ה-Focus עובר לכפתור **סגירה**; Tab/Shift+Tab נשארים בתוך החלון; Escape סוגר; בסגירה ה-Focus חוזר לכפתור **סיום תרגול**. התוכן שמאחור מקבל `inert` כדי שקוראי מסך לא יקראו אותו.
- הסגירה משנה רק את `isSummaryOpen`.

### 4.7 בדיקות
**`exercise.test.ts`:**
- כל הגורמים תמיד ב-1–10 (הרצה עם ערכי `random` קיצוניים 0 ו-0.999 ועם לולאה אקראית).
- ב-`all` שני הגורמים בלתי תלויים; בטבלה N אחד הגורמים הוא N (שני המיקומים אפשריים).
- `sanitizeAnswer`: אותיות, רווחים, סימנים, ספרות לא-ASCII, הדבקה מעורבת, חיתוך ל-3.
- `isCorrect`: נכון, שגוי, אפסים מובילים.

**`practiceState.test.ts`:**
- נכון → מונה +1 בדיוק, תרגיל חדש, קלט ריק, `correct`.
- שגוי → מונה ותרגיל ללא שינוי, קלט מתנקה, `wrong`; ניסיונות חוזרים ללא הגבלה.
- ריק → `empty`, אין שינוי; `check` כפול אחרי נכון אינו סופר פעמיים ואינו מחליף את הודעת ההצלחה.
- החלפת טבלה → תרגיל מהטבלה החדשה, מונה ורשימה נשמרים, קלט ומשוב מתנקים; בחירה באותה טבלה — אין שינוי.
- דילוג → מונה ללא שינוי, תרגיל חדש, נוסף לרשימה פעם אחת גם אם דולג כמה פעמים, סדר הדילוג נשמר; פתרון נכון מאוחר של אותו תרגיל (באותו סדר) מסיר אותו; תרגיל הפוך (8×7 מול 7×8) אינו מסיר.
- `leaveScreen` מנקה קלט, משוב וחלון, ושומר את השאר. `closeSummary` אינו משנה דבר מלבד החלון.

**`PracticeScreen.test.tsx` / `App.test.tsx` (UI):**
- הקלדת `a1b2c3d4` → השדה מציג `123`; הדבקה של טקסט מעורב מסוננת; אורך מקסימלי 3.
- בדיקה עם שדה ריק → הודעת שדה ריק, המונה 0.
- תשובה שגויה ואז נכונה (ניסיונות חוזרים) → המונה 1.
- לחיצה כפולה מהירה (`dblClick`) על **בדיקה** עם תשובה נכונה → המונה 1.
- אחרי **בדיקה** ה-Focus על שדה התשובה; ההודעה מופיעה ונעלמת עם ההקלדה הבאה.
- הודעות המשוב נמצאות באזור `role="status"`.
- בורר: 11 כפתורים, `aria-pressed` על **הכול** כברירת מחדל, החלפה מעדכנת.
- מעבר לבית/אודות וחזרה → המונה, הטבלה והתרגיל זהים; הקלט והמשוב נוקו.
- **סיום תרגול** → חלון עם התרגילים ותשובותיהם / הודעה מעודדת; Escape ו-**סגירה** סוגרים, ה-Focus חוזר ל-**סיום תרגול**, ושום מצב אחר לא השתנה.
- `localStorage.setItem` / `sessionStorage.setItem` לא נקראים לאורך תרגול (Spy).
- הבדיקות מקבעות את `Math.random` (`vi.spyOn`) כדי לדעת מה התשובה הנכונה.

### 4.8 ADR-4 (יתווסף ל-ARCHITECTURE.md בבנייה)
**ADR-4: מצב התרגול ב-Reducer ב-App, וחלון סיכום מותאם במקום `<dialog>` מובנה.**
- **הקשר:** המצב צריך לשרוד מעבר בין מסכים, להתעדכן באופן אטומי (מונה + תרגיל חדש) ולהיות בדיק. בנוסף, ב-Chrome לאנדרואיד כפתור "חזרה" של המכשיר סוגר `<dialog>` מובנה במקום לחזור לבית — בניגוד למקרה הקצה ב-PRD.
- **החלטה:** `useReducer` עם Reducer טהור ב-`App`; חלון הסיכום כרכיב `div` עם `role="dialog"`, ניהול Focus ו-Escape ידני.
- **השלכות:** כפתור "חזרה" של המכשיר מחזיר לבית גם כשהחלון פתוח (דרך ה-popstate הקיים); מעט יותר קוד לניהול Focus.

## 5. סדר עבודה בבנייה

1. `exercise.ts` + בדיקות.
2. `practiceState.ts` + בדיקות.
3. מפתחות חדשים ב-`strings.ts`, אייקונים.
4. חיבור ה-Reducer ב-`App` (כולל `leaveScreen`).
5. `TableSelector`, `PracticeScreen`, `practice.css`.
6. `SummaryDialog`.
7. בדיקות UI ועדכון `App.test.tsx`.
8. `npm test` + `npm run build`; הרצה בדפדפן ובדיקה עצמית (סעיף 6); תיקונים.
9. ADR-4 ב-ARCHITECTURE.md, סימון 🟡 ב-MILESTONES.md, סגירת שרת הבדיקה.

## 6. אימות מול Definition of Done

| תנאי | איך ייבדק |
|---|---|
| Vitest: טווחים, **הכול**, טבלה, נכון/שגוי, החלפת טבלה | `exercise.test.ts` + `practiceState.test.ts` |
| UI: ריק, לא-מספרי, אורך, ניסיונות חוזרים, לחיצה כפולה | `PracticeScreen.test.tsx` |
| נכון +1 בדיוק; שגוי לא משנה מונה ותרגיל | בדיקות Reducer + UI + ידנית בדפדפן |
| החלפת טבלה שומרת מונה; טעינה מחדש מאפסת; אין Storage | בדיקות + רענון בדפדפן + בדיקת Application/Storage בדפדפן ריק |
| תאימות ל-DESIGN, תוויות, Focus, משוב נגיש | צילום מסך מול Wireframe/Mockup + `read_page` (label, role=status, aria-pressed) |
| מעבר לבית/אודות וחזרה שומר מצב | בדיקת UI + ידנית (כולל כפתור Back של הדפדפן) |
| בורר בשתי שורות, ≥44×44, ללא גלילה אופקית מ-320px | מדידת גודל הכפתורים ו-`scrollWidth <= clientWidth` ב-320 וב-375 |
| Focus חוזר לשדה; משוב מתחת לכפתור ונעלם בהקלדה | בדיקת UI + `document.activeElement` בדפדפן |
| דילוג: מונה ללא שינוי, פעם אחת ברשימה, פתרון מאוחר מסיר | `practiceState.test.ts` |
| סיום תרגול: חלון, הודעה מעודדת, סגירה ללא שינוי, נגישות מקלדת | בדיקות UI + ידנית (Tab, Escape) + צילום מסך |

## 7. נקודות לתשומת לב
- **ה-Wireframe מול ה-Mockup:** ב-Wireframe התרגיל, השדה והכפתור באותו כרטיס; ב-Mockup הם מופרדים. לפי כללי הסתירות ה-Wireframe קובע מבנה — הכול בכרטיס אחד, בצבעים ובסגנון של ה-Mockup.
- כפתור השפה עדיין ללא פעולה (Milestone 3). כל הטקסטים מהמילון בלבד.
- אין `.env`, אין תלויות חדשות, אין commit/push בבנייה.
