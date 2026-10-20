# תוכנית Milestone 3 – מסך אודות וממשק דו-לשוני מלא

מקורות: `MILESTONES.md` (Milestone 3), `PRD.md` (F3, F4, זרימות 3 ו-4, טבלת הטקסטים המאושרים, מקרי קצה "החלפת שפה באמצע תרגיל", "החלפת שפה כשחלון הסיכום פתוח", "שפת מכשיר לא נתמכת", החלטות מוצר 2, 5, 11), `ARCHITECTURE.md` (סעיפים 2, 4 "בחירת שפה", 6), `DESIGN.md` (1.3, 2.3 "כיוון החצים", "כפתור שפה", "Multiplication Table", 2.5) והתמונות `wireframes.png`, `mockups.png`, `style-guide.png`. הקוד הקיים (Milestones 1–2) הוא נקודת המוצא.

## 1. היקף

**בתוך ה-Milestone:**
- מילון אנגלית מלא (`en`) לכל המפתחות הקיימים, ומפתחות חדשים למסך אודות — בשתי השפות, בדיוק לפי טבלת ה-PRD.
- מצב שפה גלובלי (React Context), החלפה בלחיצה על כפתור השפה בכל מסך, ועדכון `lang`, `dir` וכותרת הדפדפן (`document.title`) ברמת המסמך.
- בחירת שפה התחלתית: העדפה שמורה ב-`localStorage` ← אחרת שפת הדפדפן (`en`/`en-*` = אנגלית) ← אחרת עברית. שמירה רק בהחלפה ידנית; פעולה תקינה כשהאחסון חסום.
- מסך אודות מלא: כותרת, פסקת הסבר, קו הפרדה, כותרת **לוח הכפל המלא** וטבלת 10×10 כ-HTML Table.
- כפתור השפה נשאר לחיץ גם כשחלון הסיכום פתוח (החלטת המשתמש בתכנון — ראו 4.6).
- בדיקות Vitest ו-UI לשפה ולמסך אודות.

**מחוץ ל-Milestone (לא לממש):** PWA, Manifest ואייקונים (Milestone 4), שמירת כל מידע אחר ב-Storage, שפות נוספות, אינטראקציה בטבלה (הדגשה בלחיצה וכו'), אנימציות מעבר שפה.

## 2. קבצים

**חדשים:**
```text
src/i18n/language.ts            # Language helpers: detectInitialLanguage(), saveLanguage(), languageDir()
src/i18n/language.test.ts       # detection order, invalid stored value, blocked storage
src/i18n/LanguageContext.tsx    # LanguageProvider + useLanguage(); applies lang/dir/title to <html>
src/components/MultiplicationTable.tsx # 10×10 HTML table (dir="ltr", th scope col/row)
src/screens/AboutScreen.test.tsx # 100 correct cells, headers, LTR, texts in both languages
src/styles/about.css            # about screen + table styles
```

**שינויים:**
- `src/i18n/strings.ts` — `Language = 'he' | 'en'`, מילון `en`, מפתחות חדשים (4.2); `useStrings()` קורא את השפה מה-Context (חתימה זהה, כך שהמסכים לא משתנים).
- `src/components/LanguageButton.tsx` — לחיצה מחליפה שפה; `lang` של התווית = השפה השנייה (לא קבוע `en`).
- `src/components/SummaryDialog.tsx` — שורה עליונה עם כפתור השפה בתוך שכבת החלון (4.6).
- `src/screens/AboutScreen.tsx` — החלפת ה-Placeholder במסך המלא.
- `src/App.tsx` — עטיפה ב-`LanguageProvider`.
- `src/main.tsx` — ייבוא `about.css`.
- `src/test/setup.ts` — ניקוי `localStorage` ואיפוס `lang`/`dir` של `<html>` אחרי כל בדיקה.
- `src/App.test.tsx`, `src/screens/PracticeScreen.test.tsx` — בדיקות החלפת שפה (4.7).
- `spec/ARCHITECTURE.md` — ADR-5 (4.8).
- `spec/MILESTONES.md` — סימון 🟡 בסיום.
- `CLAUDE.md` — ללא שינוי (פקודות ההרצה לא משתנות).

אין תלויות חדשות. `index.html` נשאר עם `lang="he" dir="rtl"` כברירת מחדל עד שה-JS נטען.

## 3. מבנה ונתונים

```ts
type Language = 'he' | 'en'
const LANGUAGE_STORAGE_KEY = 'times-fun:language'   // the ONLY thing stored, value 'he' | 'en'

type LanguageContextValue = {
  language: Language
  toggleLanguage: () => void   // switch to the other language and save the manual choice
}
```

- השפה מוחזקת ב-`useState` בתוך `LanguageProvider`, **נפרדת לגמרי** ממצב התרגול (`practiceReducer`). לכן החלפת שפה אינה נוגעת בתרגיל, בקלט, במשוב, במונה, ברשימת הדילוגים או בחלון הפתוח.
- ערך ברירת המחדל של ה-Context הוא עברית, כך שרכיב שמרונדר בבדיקה בלי Provider (למשל `PracticeScreen` לבדו) ממשיך לעבוד.
- החלפת שפה אינה מוסיפה רשומה להיסטוריה ואינה מחליפה מסך.

## 4. גישה ופרטי מימוש

### 4.1 בחירת שפה ושמירה (`language.ts`)
- `detectInitialLanguage(storage, navigatorLanguage)` — פונקציה טהורה שמקבלת את מקורות המידע כפרמטרים (לבדיקות):
  1. קריאה מ-`localStorage` בתוך `try/catch`; אם הערך הוא בדיוק `'he'` או `'en'` — הוא נבחר. ערך אחר מתעלמים ממנו.
  2. אחרת: השפה הראשית של הדפדפן (`navigator.languages[0] ?? navigator.language`), באותיות קטנות; אם היא `en` או מתחילה ב-`en-` — אנגלית.
  3. בכל מקרה אחר (כולל `he`, `iw`, שפה לא נתמכת או חסרה) — עברית.
- `saveLanguage(language)` — כתיבה ל-`localStorage` בתוך `try/catch`; כישלון מתעלם בשקט (האפליקציה ממשיכה עם השפה בזיכרון).
- `languageDir(language)` — `'rtl'` לעברית, `'ltr'` לאנגלית.
- שמירה מתבצעת **רק** ב-`toggleLanguage` (בחירה ידנית), לא בטעינה הראשונית — כך שזיהוי אוטומטי לא "ננעל".

### 4.2 מילון (`strings.ts`, בדיוק לפי טבלת ה-PRD)
- `strings.en` עם כל המפתחות הקיימים: `Times Fun`, `Back`, `עברית` (כפתור השפה), `Learn the times table the fun way!`, `Let's Practice`, `About`, `About Times Fun`, `Choose a table:`, `All`, `Your answer`, `Type your answer`, `Check`, `Correct! Great job!`, `Not quite, try again`, `Type an answer, then tap "Check"`, `Skip`, `Finish`, `Correct answers:`, `Practice Summary`, `Exercises left unsolved:`, `No unsolved exercises. Great job!`, `I want to solve`, `Done`.
- מפתחות חדשים (בשתי השפות):

| מפתח | עברית | English |
|---|---|---|
| `aboutText` | כפל כיף היא אפליקציה פשוטה ומהנה לתרגול ולשינון לוח הכפל. בחרו טבלה, פתרו תרגילים וקבלו משוב מיידי. האפליקציה פועלת גם ללא חיבור לאינטרנט. | Times Fun is a simple, fun app for practicing and memorizing the times table. Choose a table, solve exercises and get instant feedback. The app works even without an internet connection. |
| `aboutTableTitle` | לוח הכפל המלא | The Full Times Table |

- הטיפוס `Record<Language, Strings>` מבטיח ב-TypeScript שלשתי השפות אותם מפתחות בדיוק.
- `useStrings()` מחזיר `strings[language]` מה-Context. ה-`currentLanguage` הקבוע יוסר.
- הסימן `×` בפינת הטבלה ובתרגילים אינו טקסט מתורגם (סימן מתמטי) ולכן אינו במילון — כמו היום.

### 4.3 `LanguageProvider` (`LanguageContext.tsx`)
- `useState(() => detectInitialLanguage(...))` — חישוב פעם אחת בטעינה.
- `useLayoutEffect` על כל שינוי שפה: `document.documentElement.lang`, `document.documentElement.dir`, ו-`document.title = strings[language].appName`. `useLayoutEffect` (ולא `useEffect`) כדי שמשתמש באנגלית לא יראה הבהוב של פריסה מימין לשמאל.
- `toggleLanguage`: מחליף לשפה השנייה וקורא ל-`saveLanguage`.
- כל חצי הכפתורים כבר מתהפכים לפי `[dir='rtl']` ב-CSS הקיים, ולכן מספיק עדכון `dir` במסמך: **Back** יצביע שמאלה ו-**Let's Practice** / **About** ימינה.
- סדר הרכיבים מתהפך אוטומטית (CSS Logical Properties ו-Flex/Grid קיימים): כפתור השפה עובר לימין באנגלית, **Back** לשמאל, בורר הטבלאות משמאל לימין (**All** ראשון משמאל), **Check** משמאל ו-**Skip** מימין, **I want to solve** משמאל בחלון. בבנייה אבדוק שאין `left`/`right` פיזיים שמונעים את ההיפוך, ואתקן ל-Logical אם יש.

### 4.4 כפתור השפה (`LanguageButton.tsx`)
- `onClick={toggleLanguage}`. התווית `t.languageButton` (במצב עברית "English", במצב אנגלית "עברית").
- `lang` על הכפתור = קוד השפה השנייה (`en` או `he`), כדי שקורא מסך יקרא את שם השפה בהגייה הנכונה.
- אחרי ההחלפה ה-Focus נשאר על הכפתור (אותו אלמנט, ללא Re-mount).

### 4.5 מסך אודות (לפי Wireframe, Mockup ו-DESIGN 1.3)
מבנה מלמעלה למטה:
1. `TopBar` עם **חזרה** וכפתור שפה (קיים).
2. כותרת H1 `aboutTitle` עם הכתם הצהוב (המחלקה הקיימת `.screen-title`).
3. פסקה `aboutText` — ממורכזת, Body 16px, כמו ב-Wireframe, ברוחב מלא של התוכן.
4. קו הפרדה עדין (`<hr>` בצבע `Surface`/`Primary Light` שקוף).
5. כותרת H2 `aboutTableTitle` עם הדגשה צהובה, כמו ב-Mockup (גודל H3 20px כדי להתאים לפרופורציה ב-Mockup ולמסך צר; רמת הכותרת הסמנטית H2).
6. `MultiplicationTable`.

**רכיב הטבלה (`MultiplicationTable.tsx`):**
- נוצר מערך המספרים 1–10 (לא נשמר בשום מקום); תא = `row * col`.
- `<table dir="ltr" aria-labelledby={id של כותרת הטבלה}>`: שורת `<thead>` עם `<th scope="col">` לתא הפינה `×` ול-1–10; ב-`<tbody>` כל שורה מתחילה ב-`<th scope="row">` ואחריה 10 תאי `<td>`.
- תא הפינה `×` נשאר טקסט רגיל (לא מוסתר מקוראי מסך), כי הוא מתאר את פעולת הטבלה.
- עיצוב: תאי כותרת ברקע `Primary Light` שקוף-חלקית/כחול בהיר יותר עם טקסט מודגש `Primary` (כמו ב-Mockup), תא הפינה ברקע `Primary` וטקסט לבן, תאי נתונים לבנים/`Surface`, קווי הפרדה דקים (`1px` בגוון כחול בהיר), טקסט `Text`, מספרים במרכז התא, פינות חיצוניות מעוגלות וצל כרטיס עדין.
- **מסך צר (320px ומעלה):** `width: 100%`, `table-layout: fixed`, `border-collapse: collapse`, ריפוד תא קטן (למשל 4px אנכי, 0–2px אופקי), גופן 14px (Caption) ובמסכים עד 360px — 12–13px, ו-`font-variant-numeric: tabular-nums`. ברוחב 320px יש ~288px ל-11 עמודות (~26px לעמודה), מספיק ל-"100". אין גלילה אופקית של העמוד ואין גלילה בתוך הטבלה; התוכן לא משתנה.
- הטבלה מוצגת משמאל לימין בשתי השפות (תא `×` ו-1 משמאל, 10 מימין).

### 4.6 כפתור שפה כשחלון הסיכום פתוח (החלטת המשתמש)
היום, כשהחלון פתוח, כל התוכן שמאחוריו `inert` ומכוסה ברקע כהה, ולכן כפתור השפה אינו לחיץ. לפי החלטת המשתמש בתכנון, הכפתור יישאר לחיץ:
- בתוך שכבת החלון (`.summary-overlay`) תתווסף שורה עליונה ובה `LanguageButton`, באותו מיקום ובאותו סגנון כמו ב-`TopBar` (אותו רוחב עמוד, ריפוד וגובה), כך שהכפתור נראה "מעל" הרקע הכהה בדיוק במקומו.
- `role="dialog"` + `aria-modal` יעברו לעוטף שמכיל גם את שורת השפה וגם את כרטיס החלון (העוטף עצמו שקוף), כך שקורא המסך וה-Tab יגיעו לכפתור. לכידת ה-Tab תכלול אותו. ה-Focus הראשוני נשאר על הכפתור הראשון **בכרטיס** (כמו היום).
- לחיצה: הטקסטים בחלון מתחלפים, החלון נשאר פתוח עם אותה רשימה, כיוון החלון והכפתורים מתהפך, ה-Focus נשאר על כפתור השפה.
- כפתור "חזרה" של המכשיר ו-Escape ממשיכים לפעול כמו היום (ADR-4).

### 4.7 בדיקות
**`language.test.ts` (Vitest):**
- ערך שמור `en` / `he` גובר על שפת הדפדפן.
- ערך שמור לא תקין (`fr`, ריק) — מתעלמים, ממשיכים לשפת הדפדפן.
- שפת דפדפן `en`, `en-US`, `EN-gb` → אנגלית; `he`, `he-IL`, `fr`, `ar`, ריק → עברית.
- `localStorage` שזורק שגיאה בקריאה ובכתיבה → אין קריסה, נבחרת שפה לפי הדפדפן, `saveLanguage` לא זורק.

**`AboutScreen.test.tsx` (UI):**
- 100 תאי `td`, וכל תא בשורה r ועמודה c שווה `r × c`.
- 11 כותרות עמודה (`scope="col"`) ו-10 כותרות שורה (`scope="row"`); הטבלה עם `dir="ltr"` ושם נגיש = כותרת הטבלה.
- כותרת, פסקת הסבר וכותרת הטבלה בעברית, ואחרי לחיצה על כפתור השפה — באנגלית.

**`App.test.tsx` (UI, App מלא):**
- ברירת מחדל: `navigator.language = 'en-US'` → האפליקציה נפתחת באנגלית, `lang="en"`, `dir="ltr"`; `he-IL` או `fr` → עברית.
- לחיצה על כפתור השפה בכל אחד משלושת המסכים מחליפה את כל הטקסטים, `lang`, `dir` ו-`document.title`, ואינה מחליפה מסך.
- **אין מחרוזות בשפה הלא נכונה:** בכל מסך (כולל חלון הסיכום, הודעות המשוב ומצב "אין דילוגים") — במצב אנגלית אין אף תו עברי בטקסט הגלוי או ב-`placeholder`/`aria-label`, מלבד כפתור השפה ("עברית"); במצב עברית אין אף אות לטינית מלבד "English".
- שמירה: לחיצה ידנית כותבת `times-fun:language` ל-`localStorage`; Render מחדש של App מתחיל בשפה השמורה. טעינה בלי לחיצה אינה כותבת דבר. לא נשמר שום מפתח אחר.
- `localStorage` חסום (Mock שזורק) — האפליקציה נטענת והחלפת שפה עובדת.

**`PracticeScreen.test.tsx` / `App.test.tsx` (שמירת מצב בהחלפת שפה):**
- באמצע תרגיל עם תשובה מוקלדת ומונה > 0: החלפת שפה משאירה את התרגיל, את הקלט, את המונה, את הטבלה הנבחרת ואת רשימת הדילוגים.
- חלון סיכום פתוח: כפתור השפה לחיץ, הטקסטים בחלון מתחלפים, החלון נשאר פתוח עם אותה רשימה.

הבדיקות הקיימות (Milestones 1–2) ממשיכות לעבור בעברית; יש לאפס `localStorage` ואת `<html>` בין בדיקות ב-`setup.ts`, ולהגדיר את `navigator.language` במפורש בבדיקות שתלויות בו.

### 4.8 ADR-5 (יתווסף ל-ARCHITECTURE.md בבנייה)
**ADR-5: שפת הממשק ב-React Context, מוחלת על `<html>`, וכפתור השפה זמין גם מעל חלון הסיכום.**
- **הקשר:** כל הרכיבים צריכים את השפה; החלפתה חייבת לשנות `lang`/`dir` של המסמך מיד בלי לגעת במצב התרגול; ה-PRD דורש אפשרות להחליף שפה כשחלון הסיכום פתוח, אבל התוכן שמאחוריו `inert`.
- **החלטה:** `LanguageProvider` עם `useState` נפרד ממצב התרגול; `useLayoutEffect` מעדכן `lang`, `dir` ו-`document.title`; רק המפתח `times-fun:language` נשמר, ורק בבחירה ידנית, בתוך `try/catch`. בחלון הסיכום מוצג עותק של כפתור השפה בשכבת החלון, בתוך אזור ה-`dialog`.
- **השלכות:** אין תלות חדשה; המסכים ממשיכים להשתמש ב-`useStrings()` ללא שינוי; ההיפוך הוויזואלי נשען על CSS Logical Properties ו-`[dir]`. מגבלה: עד שה-JS נטען מוצג `index.html` בעברית (רגע קצר וריק, כי אין בו תוכן).

## 5. סדר עבודה בבנייה

1. `language.ts` + `language.test.ts`.
2. מילון `en` ומפתחות אודות ב-`strings.ts`; `LanguageContext.tsx`; חיבור ב-`App.tsx`; `useStrings()` מה-Context.
3. הפעלת `LanguageButton`; בדיקת ההיפוך בכל המסכים ותיקון מאפיינים פיזיים (left/right) אם יש.
4. כפתור השפה בשכבת חלון הסיכום (4.6).
5. `MultiplicationTable`, `AboutScreen`, `about.css`.
6. עדכון `setup.ts` ובדיקות UI (4.7).
7. `npm test` + `npm run build`; הרצה בדפדפן ובדיקה עצמית (סעיף 6) ב-320, 375 ודסקטופ, בשתי השפות; תיקונים.
8. ADR-5 ב-ARCHITECTURE.md, סימון 🟡 ב-MILESTONES.md, סגירת שרת הבדיקה.

## 6. אימות מול Definition of Done

| תנאי | איך ייבדק |
|---|---|
| טבלה: 100 תוצאות נכונות, כותרות שורה ועמודה, קריאה במסך צר, ללא גלילה אופקית, משמאל לימין בשתי השפות | `AboutScreen.test.tsx` + בדפדפן: `scrollWidth <= clientWidth` ב-320/375, מיקום התא `×` משמאל בשתי השפות, צילום מסך |
| החצים מתהפכים (באנגלית **Back** שמאלה) | בדפדפן: `getComputedStyle(...).transform` של החצים בשתי השפות + צילום מסך |
| כל הטקסטים מתחלפים, אין מחרוזות בשפה הלא נכונה | בדיקת "אין תווים עבריים/לטיניים" בכל מסך + `get_page_text` בדפדפן |
| החלפת שפה באמצע תרגיל שומרת תרגיל, קלט ומונה | בדיקת UI + ידנית בדפדפן |
| `lang`/`dir` מתעדכנים; התרגיל קריא בשני הכיוונים | בדיקת UI + בדפדפן (`document.documentElement`), צילום התרגיל וחלון הסיכום בשתי השפות |
| בחירה ידנית נשמרת בטעינה מחדש; `localStorage` חסום — ממשיך לפעול | בדיקות + בדפדפן: החלפה, רענון, בדיקת ה-Storage (מפתח אחד בלבד); הדמיית חסימה ב-Mock |
| שלושת המסכים תואמים Wireframes, Style Guide ו-Mockups | צילומי מסך של שלושת המסכים בשתי השפות מול התמונות |

## 7. נקודות לתשומת לב
- **Wireframe ו-Mockup מול DESIGN לגבי כפתור השפה:** בתמונות יש תפריט נפתח עם ▾ ושם השפה הנוכחית; DESIGN וה-PRD קובעים כפתור יחיד עם שם השפה **השנייה** וללא ▾ — כפי שכבר ממומש.
- **פסקת ההסבר ב-Wireframe** שבורה לכמה שורות; הטקסט עצמו זהה לטבלת ה-PRD, והשבירה נקבעת לפי רוחב המסך.
- **כותרת הדפדפן (`document.title`)** תתחלף עם השפה (כפל כיף / Times Fun), כדי שלא תישאר מחרוזת בשפה הלא נכונה. שם האפליקציה המותקנת (Manifest, Milestone 4) נשאר **כפל כיף** קבוע לפי ה-PRD.
- שינוי במבנה החלון (4.6) הוא תוספת קטנה לחלון הקיים; כל שאר התנהגות החלון מ-Milestone 2 נשארת.
- אין `.env`, אין תלויות חדשות, אין commit/push בבנייה. נשמר ב-`localStorage` רק קוד השפה.
