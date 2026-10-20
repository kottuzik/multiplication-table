# תוכנית Milestone 4 – PWA, התקנה ושימוש Offline

מקורות: `MILESTONES.md` (Milestone 4), `PRD.md` (F5, מקרה קצה "טעינה ראשונה ללא אינטרנט", החלטות מוצר 7 ו-12), `ARCHITECTURE.md` (סעיפים 2, 6, 7, 9 ו-ADR-2, ADR-3), `DESIGN.md` (צבעים, "איור הבית"). הקוד הקיים (Milestones 1–3) הוא נקודת המוצא. תיעוד `vite-plugin-pwa` נבדק (גרסה 2.0.0, תומכת ב-Vite 8).

## 1. היקף

**בתוך ה-Milestone:**
- `vite-plugin-pwa` במצב `generateSW`: Manifest, Service Worker ו-Precache לכל הנכסים (HTML, JS, CSS, פונטים, SVG, אייקונים).
- קובץ אייקון ריבועי שנגזר מאיור הבית, ומתוכו אייקונים מוכנים: Android (192, 512, Maskable), אייפון (`apple-touch-icon` 180×180 ללא שקיפות) ו-Favicon.
- תגיות `<head>` לאייפון ולמניפסט ב-`index.html`.
- מדיניות עדכון לפי ADR-3: גרסה חדשה מורדת ברקע ונכנסת לתוקף רק בפתיחה הבאה; ללא הודעה, ללא רענון כפוי.
- בדיקה עצמית בדפדפן במחשב (Build + Preview): רישום Service Worker, Manifest, ניתוק רשת ושימוש מלא Offline, ומדיניות העדכון.
- הוראות בדיקה ידנית בטלפון (Chrome Android, Safari iOS) — לאחר אישורך ל-Push.

**מחוץ ל-Milestone (לא לממש):** הודעות "מוכן לעבודה Offline" או "יש גרסה חדשה", כפתור "התקן" באפליקציה, מסכי פתיחה לאייפון (`apple-touch-startup-image`), Service Worker בשרת הפיתוח (`npm run dev`), Push Notifications, שמירת נתונים נוספים, שינוי ב-Workflow (אם לא יידרש), בדיקות הקבלה הכוללות (Milestone 5).

## 2. קבצים

**חדשים:**
```text
public/app-icon.svg                 # square source icon derived from the home illustration (board "3 × 4 = ?" + smiling star)
public/favicon.ico                  # generated
public/pwa-64x64.png                # generated
public/pwa-192x192.png              # generated
public/pwa-512x512.png              # generated
public/maskable-icon-512x512.png    # generated (safe-zone padding for Android shapes)
public/apple-touch-icon-180x180.png # generated, opaque background (iPhone)
src/pwa.test.ts                     # checks the manifest settings and index.html head tags
```

**שינויים:**
- `package.json` — תלויות פיתוח חדשות: `vite-plugin-pwa`, `@vite-pwa/assets-generator`; סקריפט `generate-icons` (הרצה חד-פעמית שמייצרת את קובצי ה-PNG מ-`app-icon.svg`; הקבצים נשמרים ב-Repository, כך שה-Build וה-CI לא תלויים ביצירה).
- `vite.config.ts` — הוספת `VitePWA(...)` (סעיף 4.2). הגדרות ה-Manifest יוצאו לקובץ/קבוע שגם הבדיקה יכולה לייבא.
- `index.html` — Favicon חדש, `apple-touch-icon`, `apple-mobile-web-app-title`, `apple-mobile-web-app-capable`, `mobile-web-app-capable` (סעיף 4.3).
- `.claude/launch.json` — תצורת הרצה נוספת `preview` (`npm run build && npm run preview`, פורט 4173) לבדיקת ה-PWA; Service Worker לא פועל בשרת הפיתוח.
- `spec/ARCHITECTURE.md` — ADR-6 (סעיף 4.6).
- `spec/MILESTONES.md` — סימון 🟡 בסיום.
- `CLAUDE.md` — הוספת פקודת הרצה לבדיקת PWA: `npm run build && npm run preview` ← http://localhost:4173/multiplication-table/.

ללא שינוי: קוד המסכים, מילוני הטקסט, מצב התרגול, `.github/workflows/deploy.yml` (כבר מריץ `npm ci`, בדיקות ו-Build; תיקיית `dist` תכלול את קובצי ה-PWA). אין `.env`. אין צורך בשורות חדשות ב-`.gitignore` (לא מפעילים מצב פיתוח של ה-Service Worker, ולכן לא נוצרת תיקיית `dev-dist`).

## 3. Manifest

```ts
{
  name: 'כפל כיף',
  short_name: 'כפל כיף',
  lang: 'he',
  dir: 'rtl',
  start_url: './',            // relative to base: /multiplication-table/
  scope: './',
  display: 'standalone',
  background_color: '#FFFFFF', // same as the page background (DESIGN: white screens) – iPhone flash in app color
  theme_color: '#FFFFFF',      // matches the existing <meta name="theme-color">
  icons: [
    { src: 'pwa-64x64.png',   sizes: '64x64',   type: 'image/png' },
    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}
```

- השם קבוע **כפל כיף** בכל שפת ממשק (PRD F5). שפת הממשק בתוך האפליקציה ממשיכה להתחלף כרגיל.
- אין `description` ואין `screenshots` — לא נדרשים ב-spec.

## 4. גישה ופרטי מימוש

### 4.1 האייקון (`public/app-icon.svg`)
- ריבועי (512×512), רקע אטום (צהוב בהיר `#FFF9D6` בפינות מעוגלות על לבן, או רקע מלא בצבע הזה — ייבחר לפי מה שנראה טוב בגדלים קטנים).
- התוכן נלקח מאיור הבית: הלוח הכחול עם `3 × 4 = ?` וכוכב צהוב מחייך אחד, באותם צבעים ובאותו סגנון; בלי קווי הקישוט הדקים שלא נראים בגודל קטן. הלוח במרכז, בתוך "אזור בטוח" של כ-80% כדי שגם האייקון המעוגל/Maskable באנדרואיד לא יחתוך אותו.
- הטקסט `3 × 4 = ?` מומר לצורות (Paths) או נכתב בגופן גנרי עבה, כדי שהיצירה ל-PNG לא תהיה תלויה בגופן Rubik.
- הרצה חד-פעמית: `npm run generate-icons` (`pwa-assets-generator --preset minimal-2023 public/app-icon.svg`). ה-Preset יוצר את כל הקבצים בסעיף 2; `apple-touch-icon` נוצר עם רקע אטום.
- בדיקה חזותית של כל קובץ PNG שנוצר (ובמיוחד 180×180 ו-Maskable) לפני המשך.

### 4.2 `vite.config.ts`
```ts
VitePWA({
  strategies: 'generateSW',
  registerType: 'prompt',   // ADR-3: no skipWaiting / clientsClaim – the new version waits for the next launch
  injectRegister: 'auto',   // we do not import the virtual module, so the plugin injects a plain registration script
  manifest: MANIFEST,
  includeAssets: ['favicon.ico', 'app-icon.svg', 'apple-touch-icon-180x180.png'],
  workbox: {
    globPatterns: ['**/*.{html,js,css,svg,png,ico,woff2}'],
    navigateFallback: 'index.html',
    cleanupOutdatedCaches: true,
  },
})
```
- **מדיניות עדכון (ADR-3):** במצב `prompt` ה-Service Worker החדש מותקן ומחכה, ואינו משתלט על דף פתוח. כיוון שאין לנו ממשק הודעה ואיננו קוראים ל-`updateSW()`, הגרסה החדשה נכנסת לתוקף רק כשכל חלונות האפליקציה נסגרים ונפתחים מחדש. אין רענון כפוי, ולכן מצב תרגול פעיל לא נמחק.
- **פונטים:** חבילת `@fontsource/rubik` מייצרת קובצי `woff2` (וגם `woff` כגיבוי לדפדפנים ישנים). נכניס ל-Precache רק `woff2` (כל דפדפני היעד תומכים) כדי לא להכפיל את גודל ה-Cache. בבנייה נוודא ש-Rubik אכן נטען Offline גם בעברית וגם באנגלית.
- **גודל קבצים:** נוודא שאף קובץ לא חורג ממגבלת ברירת המחדל של Workbox (2MB); אם יש אזהרה בבנייה — נטפל בה.
- ה-Manifest והאייקונים נכללים ב-Precache (גם דרך `includeAssets` וגם דרך ה-glob), כך שהם זמינים Offline.
- כל הנתיבים יחסיים ל-`base: '/multiplication-table/'` (הפלאגין מוסיף את ה-`base` לקישור ה-Manifest ולנתיב רישום ה-Service Worker).

### 4.3 `index.html`
```html
<link rel="icon" href="/favicon.ico" sizes="48x48" />
<link rel="icon" href="/app-icon.svg" sizes="any" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
<meta name="apple-mobile-web-app-title" content="כפל כיף" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="theme-color" content="#FFFFFF" />   <!-- already exists -->
```
- Vite מוסיף את ה-`base` לנתיבים שמתחילים ב-`/` בתוך `index.html` בזמן ה-Build; נוודא שב-`dist/index.html` הם מתחילים ב-`/multiplication-table/`.
- הקישור ל-`/src/assets/home-illustration.svg` כ-Favicon מוחלף ב-Favicon החדש. איור הבית עצמו לא משתנה.
- ללא `apple-touch-startup-image`. רקע הדף לבן כמו `background_color`.
- `<title>` נשאר **כפל כיף** (ומתחלף בזמן ריצה לפי השפה, כמו היום).

### 4.4 בדיקות (`src/pwa.test.ts`, Vitest)
- ה-Manifest: `name` ו-`short_name` = **כפל כיף**, `lang: 'he'`, `dir: 'rtl'`, `display: 'standalone'`, `start_url`/`scope` יחסיים, `background_color` לבן, אייקונים 192 ו-512 ואייקון `maskable`.
- `index.html` מכיל את תגיות האייפון ואת `apple-touch-icon`, וקובצי האייקונים שהוא וה-Manifest מפנים אליהם קיימים ב-`public/`.
- `registerType` אינו `autoUpdate` ואין `skipWaiting`/`clientsClaim` בהגדרות (שמירה על ADR-3).
- כל הבדיקות הקיימות ממשיכות לעבור (`npm test`).

### 4.5 בדיקה עצמית בדפדפן (Build + Preview, http://localhost:4173/multiplication-table/)
1. `npm run build` מסתיים בהצלחה; ב-`dist` קיימים `manifest.webmanifest`, `sw.js`, `registerSW.js` והאייקונים; ב-`sw.js` רשימת ה-Precache כוללת JS, CSS, `woff2`, SVG ואייקונים.
2. Service Worker נרשם ופעיל (`navigator.serviceWorker.controller` אחרי טעינה שנייה); ה-Manifest נטען ותקין (שם, אייקונים, `start_url`, `scope`).
3. **Offline:** אחרי השלמת ה-Precache — ניתוק רשת (דרך Playwright) ופתיחה מחדש של הכתובת: מסך הבית ואיור הבית מוצגים, ניווט לתרגול ולאודות, פתרון תרגיל נכון ושגוי, החלפת שפה, צפייה בטבלה, גופן Rubik — ללא שגיאות רשת בקונסול ובבקשות.
4. **עדכון (ADR-3):** בזמן שדף פתוח עם מונה גבוה מ-0 — בנייה מחדש עם שינוי קטן זמני, טעינת הגרסה החדשה ברקע: הדף לא מתרענן והמונה נשמר; ה-Service Worker החדש במצב "waiting". אחרי סגירת כל הלשוניות ופתיחה מחדש — הגרסה החדשה פעילה. השינוי הזמני מוחזר בסיום.
5. האייקונים נפתחים ונראים תקינים בגדליהם; `apple-touch-icon` אטום (ללא שקיפות).

### 4.6 ADR-6 (יתווסף ל-ARCHITECTURE.md בבנייה)
**ADR-6: אייקונים מוכנים מראש ממקור SVG ריבועי, ו-`registerType: 'prompt'` ללא ממשק**
- **הקשר:** אייקוני PWA צריכים להיות ריבועיים ואטומים (אייפון), ואיור הבית מלבני ושקוף. ADR-3 דורש שגרסה חדשה לא תופעל באמצע שימוש וללא הודעה.
- **החלטה:** קובץ `public/app-icon.svg` ריבועי נגזר מאיור הבית; קובצי ה-PNG נוצרים פעם אחת בעזרת `@vite-pwa/assets-generator` ונשמרים ב-Repository (ה-Build וה-CI לא מייצרים אותם מחדש). הפלאגין מוגדר `registerType: 'prompt'` בלי לייבא את מודול ההודעה, כך שהגרסה החדשה ממתינה ונכנסת לתוקף רק בפתיחה הבאה.
- **השלכות:** שינוי באייקון דורש הרצה חוזרת של `npm run generate-icons`. אין קוד ממשק לעדכונים. מגבלת האייפון מ-ADR-3 נשארת בתוקף.

## 5. סדר עבודה בבנייה

1. התקנת `vite-plugin-pwa` ו-`@vite-pwa/assets-generator` (תלויות פיתוח).
2. `public/app-icon.svg`; `npm run generate-icons`; בדיקה חזותית של הקבצים שנוצרו ותיקון ה-SVG לפי הצורך.
3. `VitePWA` ב-`vite.config.ts` עם ה-Manifest ומדיניות העדכון.
4. תגיות `index.html`.
5. `src/pwa.test.ts`; `npm test` + `npm run build`; בדיקת תוכן `dist`.
6. תצורת `preview` ב-`.claude/launch.json`; בדיקה עצמית לפי 4.5 (כולל Offline ועדכון); תיקונים.
7. ADR-6 ב-ARCHITECTURE.md, פקודת ההרצה ב-CLAUDE.md, סימון 🟡 ב-MILESTONES.md, סגירת שרת הבדיקה.
8. הכנת הוראות הבדיקה בטלפון (סעיף 6) — לביצוע שלך אחרי אישורך ל-Push.

## 6. אימות מול Definition of Done

| תנאי | איך ייבדק |
|---|---|
| Manifest תקין ו-Service Worker שנרשם ופועל ב-HTTPS/Localhost | `pwa.test.ts` + בדפדפן ב-Preview (4.5 שלבים 1–2) |
| השם מתחת לאייקון **כפל כיף**; באייפון אייקון ייעודי | ערכי ה-Manifest ותגיות האייפון בבדיקה ובדפדפן; ההתקנה בפועל — בבדיקה הידנית שלך |
| Offline אחרי טעינה ראשונה: ניווט, תרגול, החלפת שפה, טבלה ואיור — ללא שגיאות רשת (בדיקת AI במחשב) | 4.5 שלב 3, עם צילומי מסך ורשימת בקשות רשת |
| אייקונים ונכסים מקומיים זמינים Offline; ללא CDN/API | רשימת ה-Precache ב-`sw.js` + בקשות רשת במצב Offline (אין פנייה לדומיין חיצוני) |
| בדיקה ידנית שלך ב-GitHub Pages (Chrome Android, Safari iOS) | אחרי Push מאושר: אספק הוראות צעד אחר צעד (פתיחה מקוונת, התקנה למסך הבית, בדיקת השם והאייקון, מצב טיסה, פתיחה ושימוש) ואתעד את התוצאות שיתקבלו ממך ואת מגבלות המכשירים |
| עדכון גרסה אינו מוחק סשן פעיל ב-Reload כפוי | `pwa.test.ts` (הגדרות) + 4.5 שלב 4 |

## 7. נקודות לתשומת לב
- **Service Worker לא פועל ב-`npm run dev`.** בדיקת ה-PWA נעשית רק על Build דרך `npm run preview` (או בכתובת GitHub Pages). "הרץ כדי שאבדוק" ימשיך להריץ את שרת הפיתוח, אלא אם תהיה בקשה לגרסת ה-Preview.
- **הבדיקה בטלפון דורשת Push** (כתובת HTTPS). לפי הכללים — אעצור ואבקש את אישורך לפני ה-Push. ייתכן שה-Milestone יישאר 🟡 עד הבדיקה שלך בטלפון.
- **טעינה ראשונה ללא אינטרנט** לא נתמכת (מגבלת PWA, PRD) — מוצגת הודעת הדפדפן הרגילה.
- **פתיחה ראשונה:** אחרי הביקור הראשון, ה-Service Worker מתקין את ה-Cache ברקע; ה-Offline מובטח רק אחרי שזה הסתיים (כמה שניות בחיבור רגיל).
- **אייפון:** התקנה רק דרך Safari ← שיתוף ← "הוספה למסך הבית"; השם המוצע יהיה **כפל כיף** וניתן לשינוי ידני ע"י המשתמש. עדכונים עשויים להופיע רק אחרי סגירת האפליקציה ממחליף האפליקציות (ADR-3).
- **Favicon:** בלשונית הדפדפן יוצג האייקון החדש במקום איור הבית המלא.
- אין `.env`, אין שירותים חיצוניים, אין commit/push בבנייה.
