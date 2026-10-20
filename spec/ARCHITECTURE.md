# ARCHITECTURE — כפל כיף / Times Fun

> מסמך ארכיטקטורה המבוסס על PRD – אפליקציית לימוד לוח הכפל לילדים. עודכן: 20.10.2026.

## 1. החלטה ארכיטקטונית

המוצר יהיה **Static Single-Page Application (SPA)** המותקן כ-**Progressive Web App (PWA)**. כל יצירת התרגילים, בדיקת התשובות, הצגת המשוב והחלפת השפה מתבצעים בדפדפן. לאחר טעינה מוצלחת ראשונה ושמירת קובצי האפליקציה ב-Cache, השימוש אינו דורש רשת.

לא נדרשים Backend, Database, Authentication, שרת API, אחסון קבצים בענן, שירות AI או אינטגרציות חיצוניות. אין להוסיף אותם במסגרת המוצר הנוכחי.

## 2. Technology Stack

| רכיב | טכנולוגיה נבחרת | תפקיד |
|---|---|---|
| Frontend | React + TypeScript | שלושה מסכים, רכיבי UI וניהול מצב מקומי |
| Build & Development | Vite | שרת פיתוח מהיר ובניית קובצי Static |
| Styling | CSS רגיל עם CSS Modules לפי הצורך | Mobile-first, התאמה רספונסיבית ו-RTL/LTR ללא תלות בספריית UI |
| PWA | vite-plugin-pwa עם Workbox (`generateSW`) | Manifest, Service Worker ו-Precache לנכסים |
| Localization | מילוני תרגום מקומיים ב-TypeScript | עברית ואנגלית ללא שירות חיצוני |
| State | React `useState` ו-Context רק לשפה אם נחוץ | מצב התרגול והחלפת השפה |
| Persistence | `localStorage` להעדפת שפה בלבד | שמירת בחירת השפה הידנית בין כניסות |
| Testing | Vitest + React Testing Library; בדיקת E2E ידנית בדפדפני יעד | בדיקת לוגיקת תרגילים וזרימות ממשק |
| Source Control | Git + GitHub | Repository וקוד מקור |
| CI/CD | GitHub Actions | בדיקות, Build ו-Deployment אוטומטיים |
| Hosting | GitHub Pages עם HTTPS | הגשת קובצי Static ללא שרת אפליקציה |
| Assets | קבצים מקומיים ב-Repository | איור, אייקונים ו-Manifest ללא תלות ברשת |

### נימוקי בחירה וחלופות שנבדקו

- **React לעומת Vue ו-Vanilla TypeScript:** שלושתן מתאימות למוצר קטן. React נבחר בשל בשלותו, תיעוד רחב, קהילת מפתחים, דוגמאות קוד וניהול UI צפוי. Vanilla TS עשוי להניב Bundle קטן יותר, אך אינו נדרש כדי לעמוד באילוצים. אין צורך ב-Next.js או SSR.
- **Vite לעומת Create React App ו-Next.js:** Vite מתאים ישירות ל-SPA סטטי; אין צורך בתשתית Server Rendering.
- **CSS רגיל לעומת Tailwind ו-Component Libraries:** כמות מסכים קטנה, ודרישות RTL ונגישות מצדיקות CSS פשוט ללא תלות עיצובית נוספת.
- **vite-plugin-pwa/Workbox לעומת Service Worker ידני:** מפחית טעויות ב-Precache ובניהול גרסאות; יש להגדיר במפורש את הנכסים שנדרשים Offline.
- **GitHub Pages לעומת Vercel ו-Cloudflare Pages:** שלושתן מסוגלות לארח Static Site; GitHub Pages מתאים לברירת המחדל שבבקשה ולפריסה אוטומטית דרך GitHub Actions, ללא Backend.
- **אחסון:** אין צורך ב-Supabase, Firebase או IndexedDB. שמירת מצב התרגול בין סשנים אסורה לפי ה-PRD; רק העדפת השפה נשמרת ב-`localStorage`, בכפוף להנחת ה-PRD.

### עלויות ומגבלות

- עבור Repository ציבורי, GitHub Pages זמין במסגרת GitHub Free. לא צפויות עלויות Hosting לאפליקציה קטנה במסגרת המכסות הרגילות; Domain מותאם אישית, אם ייבחר, עשוי לעלות כסף.
- GitHub Pages הוא Hosting סטטי בלבד; אין בו Backend או Database, וזה תואם לדרישות.
- לפי התיעוד הרשמי: אתר מפורסם עד 1GB, מגבלת תעבורה רכה של 100GB בחודש ו-Deployment timeout של 10 דקות. אם הפרויקט יגדל או ישנה אופי לשירות מסחרי, יש לבחון מחדש את התאמת תנאי השירות.
- Service Worker ו-Cache עלולים להגיש גרסה ישנה עד שהעדכון נקלט; נדרשת אסטרטגיית עדכון בטוחה.
- התקנה ב-iOS תלויה בהתנהגות Safari ובפעולת המשתמש להוספה למסך הבית; אין להבטיח Install Prompt זהה באנדרואיד וב-iPhone.

## 3. מבנה המערכת

```text
GitHub Repository
   └── GitHub Actions → Vite Build → GitHub Pages (HTTPS)
                                      │
                                      ▼
                              Browser / Installed PWA
                              ├── App Shell / Navigation
                              ├── Home Screen
                              ├── Practice Screen
                              │   └── Exercise Engine (local)
                              ├── About Screen / 10×10 Table
                              ├── Localization (he/en)
                              ├── Session State (memory)
                              ├── Language Preference (localStorage)
                              └── Service Worker / Precache
```

### Modules ואחריות

1. **App Shell / Navigation:** מעבר בין `home`, `practice`, `about` באמצעות React State, ללא React Router. הכפתור Back במסכים המשניים חוזר לבית. כפתור השפה זמין בכל מסך.
2. **Home:** שם המוצר בהתאם לשפה, איור מקומי בנושא מתמטיקה וכפתורי מעבר לתרגול ולאודות.
3. **Practice:** בורר `all` או מספר 1–10, הצגת תרגיל, שדה תשובה, כפתור בדיקה, משוב ומונה תשובות נכונות.
4. **Exercise Engine:** פונקציות טהורות ליצירת זוג גורמים בטווח 1–10 ולבדיקת תשובה; אין תלות ברשת או בממשק.
5. **About:** טבלת כפל 10×10 המיוצרת מערכים מספריים ומוצגת כטבלת HTML נגישה, וכן הסבר קצר בשפה הפעילה.
6. **Localization:** מילוני מחרוזות מקומיים לשתי השפות; עדכון `lang` ו-`dir` ברכיב המסמך בעת החלפת שפה.
7. **PWA:** Manifest, אייקונים, Service Worker ושמירת App Shell וכל הנכסים הנדרשים לשימוש Offline.

## 4. Data Model וניהול מצב

אין Database ואין שרת. המודל נשמר בדפדפן:

| ישות לוגית | שדות | מיקום ואורך חיים |
|---|---|---|
| `Exercise` | `factorA: number`, `factorB: number` | React State, בסשן בלבד |
| `PracticeState` | `selectedTable: 'all' \| 1..10`, `exercise`, `answerInput: string`, `correctCount: number`, `feedback` | React State, בסשן בלבד |
| `Language` | `'he' \| 'en'` | React State; העדפה ידנית ב-`localStorage` בלבד |
| `Translations` | מפת מפתחות למחרוזות בעברית ובאנגלית | קוד Static מקומי |
| `MultiplicationTable` | ערכים מחושבים של 1–10 × 1–10 | מחושב בזמן הצגה; ללא אחסון |

**כלל מחייב:** `correctCount`, התרגיל הנוכחי, התשובה והמשוב **לא** יישמרו ב-`localStorage`, `sessionStorage`, IndexedDB או שרת. טעינה מחדש מאפסת את המונה ואת מצב התרגול. סגירת האפליקציה ופתיחתה מחדש מתחילה סשן חדש; אין מנגנון שחזור סשן.

**בחירת שפה:** בתחילת טעינה יש לבדוק העדפה תקינה ב-`localStorage`; אם אין, לבחור אנגלית רק כאשר שפת הדפדפן הראשית היא `en` או מתחילה ב-`en-`, ועברית בכל מקרה אחר (כולל `he` ושפה לא נתמכת). שינוי ידני שומר רק את קוד השפה. אם אחסון הדפדפן חסום, ממשיכים לפעול עם מצב בזיכרון.

## 5. לוגיקת תרגול ו-Data Flow

### יצירת תרגיל

- ברירת המחדל של בורר הטבלאות: `all`.
- ב-`all`: שני הגורמים נבחרים אקראית, כל אחד באופן בלתי תלוי מתוך 1–10.
- בבחירת טבלה `N`: גורם אחד הוא `N`, והאחר נבחר אקראית מתוך 1–10; ניתן להציב את `N` ראשון או שני.
- מותר שהתרגיל החדש יהיה זהה לקודם.
- מעבר לטבלה אחרת יוצר תרגיל חדש מיד, מוחק תשובה ומשוב קודמים ושומר את המונה.

### בדיקת תשובה

1. קלט התשובה מוצג כשדה טקסט עם `inputMode="numeric"`, ולא `type="number"`, כדי לשלוט בתווים ובאורך.
2. השדה מקבל רק ספרות ASCII `0–9`, עד שלושה תווים; תווים אחרים מוסרים גם בהדבקה. התשובה נשמרת כמחרוזת עד לבדיקה.
3. לחיצה על Check/בדיקה עם שדה ריק מציגה הודעת בקשה להזנת תשובה; המונה והתרגיל אינם משתנים.
4. תשובה מספרית השווה ל-`factorA * factorB`: הגדלת המונה בדיוק פעם אחת, הצגת משוב הצלחה ויצירת תרגיל חדש. יש להבטיח שהודעת ההצלחה נראית/מוכרזת גם בעת החלפת התרגיל.
5. תשובה שגויה: הצגת משוב כישלון, השארת אותו תרגיל, ניקוי שדה התשובה, ללא שינוי במונה; ניסיונות חוזרים ללא הגבלה.
6. יש למנוע הפעלה כפולה של בדיקה עבור אותה תשובה נכונה עקב לחיצות מהירות או אירועים חוזרים.
7. שינוי שפה במהלך תרגיל משנה רק מחרוזות ו-RTL/LTR; אינו משנה את הגורמים, התשובה המוקלדת או המונה.

**זרימה מרכזית:** `User Input → Input Validation → Exercise Check → Practice State Update → Immediate UI Feedback`. אין קריאות API.

## 6. ממשק, שפות ונגישות

- שלושה מסכים בלבד: בית, לימוד, אודות. שמות המוצר: **כפל כיף** ו-**Times Fun**.
- כל טקסטי הממשק, כולל הודעות שגיאה, כפתורים, תוויות, שם המוצר והסבר אודות, יהיו בעברית או באנגלית בהתאם לשפה הפעילה. יש להשתמש במחרוזות המוצעות ב-PRD כברירת מחדל ולספק תרגום תואם גם להודעת שדה ריק.
- `document.documentElement.lang` יהיה `he` או `en`, ו-`dir` יהיה `rtl` או `ltr`. שימוש ב-CSS Logical Properties כגון `margin-inline` ו-`padding-inline`.
- מספרי התרגיל והסימן `×` יישארו בסדר קריא ועקבי גם בממשק RTL, באמצעות בידוד כיווניות מתאים (`dir="ltr"` לרצף המתמטי).
- Mobile-first, אזורי מגע גדולים, התאמה למסכים צרים ולשינוי אוריינטציה, ללא גלילה אופקית.
- רכיבי HTML סמנטיים, `label` לשדה התשובה, מצבי Focus ברורים, ניגודיות מספקת ומשוב טקסטואלי שאינו נשען על צבע בלבד.
- משוב על תשובה יוכרז לקוראי מסך באמצעות אזור `aria-live` מתאים, בלי לייצר הכרזות מיותרות.
- טבלת 10×10 במסך אודות תהיה HTML Table עם כותרות שורה ועמודה, ולא תמונה.
- אין להשתמש בפונטים, תמונות או סקריפטים מ-CDN חיצוני בזמן הריצה, כדי לשמר Offline מלא.

## 7. PWA ו-Offline

- להגדיר `Web App Manifest` עם `name`/`short_name`, `start_url`, `scope`, `display: standalone`, אייקונים מתאימים וערכי Theme. שם המוצר במניפסט יהיה שם קבוע שנבחר בזמן Build; שפת ממשק בתוך האפליקציה תמשיך להשתנות דינמית. אין להבטיח שינוי שם האייקון המותקן בזמן אמת.
- להשתמש ב-`vite-plugin-pwa` במצב `generateSW` ולבצע Precache של `index.html`, קובצי JS/CSS, איורים, אייקונים ושאר נכסי Static החיוניים. יש לוודא שה-Manifest וקובצי האייקונים זמינים גם Offline.
- להשתמש בנתיבים יחסיים לבסיס הפריסה של Vite, כולל `start_url` ו-`scope`, כדי לתמוך ב-GitHub Pages תחת נתיב Repository.
- אחרי טעינה ראשונה מוצלחת והשלמת התקנת ה-Service Worker וה-Precache, פתיחה מחדש וניווט בין המסכים יפעלו ללא אינטרנט. אין להבטיח Offline אם ההתקנה/ה-Caching טרם הושלמו, או אם המשתמש מחק נתוני אתר.
- עבור עדכונים, להעדיף הודעה/הפעלה מבוקרת של גרסה חדשה או עדכון בעת פתיחה מחודשת, כדי לא לאבד מצב תרגול באמצע שימוש. יש להימנע מהחלפת UI פעיל באמצע סשן.
- טעינה ראשונה ללא חיבור לרשת אינה נתמכת; במקרה כזה מוצגת שגיאת הדפדפן הרגילה.
- לבדוק התקנה ו-Offline ב-Chrome Android וב-Safari iOS, וכן שימוש בסיסי בדסקטופ.

## 8. APIs, Authentication, Security ופרטיות

- **APIs:** אין API פנימי או חיצוני. כל פעולות המוצר מקומיות.
- **Authentication / Authorization:** לא נדרשים; אין חשבונות או הרשאות משתמש.
- **פרטיות:** אין איסוף פרטים אישיים, Analytics, Cookies למעקב, פרסומות או העברת נתוני תרגול לשרת. העדפת שפה בלבד נשמרת מקומית. Hosting עשוי לייצר רישומי גישה תשתיתיים שאינם בשליטת קוד האפליקציה; אין לטעון שאין כלל רישומי שרת.
- **אבטחה:** פריסה ב-HTTPS, ללא Secrets בקוד לקוח; הימנעות מהזרקת HTML לא מהימן; תלות בספריות מוכרות ועדכון Dependencies; כל הנכסים המקומיים ברישיון מתאים ובטוחים לילדים.
- **תוכן:** אין הצגת התשובה הנכונה או רמזים, ואין הוספת משחקים, פרסים, טיימר או סטטיסטיקות מעבר למונה הסשן.

## 9. GitHub, Hosting ו-Deployment

### Repository

- Repository יחיד ב-GitHub המכיל קוד React/TypeScript, נכסים, קובצי PWA, בדיקות, `package.json`, `package-lock.json`, תצורת Vite ו-GitHub Actions.
- `main` מייצג קוד מוכן לפרסום; שינויים יוכלו להיבדק ב-Branches וב-Pull Requests לפני מיזוג.
- לא לשמור Credentials או קובצי `.env` רגישים ב-Repository. אין צורך ב-Environment Variables או Secrets של שירותי אפליקציה במוצר הנוכחי.

### Build ופריסה

1. GitHub Actions מופעל אוטומטית עם Push ל-`main`.
2. סביבת CI מתקינה גרסת Node LTS התואמת ל-Vite ול-vite-plugin-pwa, מריצה `npm ci`, בדיקות ו-`npm run build`.
3. Vite יוצר את תיקיית `dist` עם קובצי האפליקציה וה-PWA.
4. Workflow מעלה את `dist` כ-Pages Artifact ומפרסם באמצעות פעולות GitHub Pages הרשמיות.
5. GitHub Pages מגיש את האפליקציה ב-HTTPS. אין צורך בשרת יישום, במסד נתונים או ב-Database Migrations.

**הגדרת נתיב:** אם כתובת הפרויקט היא `https://<user>.github.io/<repo>/`, להגדיר ב-Vite `base: '/<repo>/'`; אם מדובר באתר Root או Domain מותאם, `base: '/'`. נתיבי האייקונים וה-PWA חייבים להתאים ל-`base`.

**Development:** ניתן לפתח ולבדוק מקומית עם Vite ללא Docker וללא שירות ענן מחייב. ניתן לבדוק גם דרך Preview של Build, אך `vite preview` אינו שרת Production. אין סביבת Supabase, ולכן אין צורך בשני פרויקטי Database או בפרטי גישה ל-Production.

## 10. בדיקות וקבלת ארכיטקטורה

בדיקות יחידה יכסו טווחי הגורמים, מצב `all`, טבלה נבחרת, בדיקת תשובה, ניסיון חוזר, שמירת מונה בהחלפת טבלה, איפוס בטעינה מחדש והתנהגות קלט ריק/לא תקין. בדיקות רכיבים יכסו החלפת שפה ללא אובדן מצב, תוויות, הודעות ו-RTL/LTR. בדיקות ידניות במכשירי יעד יכסו התקנה, טעינה לאחר Precache במצב Airplane Mode, ניווט Offline, איור Offline, רענון גרסה, מקלדת מספרית, נגישות בסיסית ומסכים צרים.

## 11. החלטות ומגבלות שיש לשמר

- ה-PRD מגדיר את שמירת העדפת השפה כהנחה שטרם אושרה; הארכיטקטורה מממשת אותה כפי שנכתבה, בלי לשמור מידע אחר.
- טקסטי הממשק ב-PRD הם הצעות שטרם אושרו; הם משמשים בסיס לתרגומים ואינם מוסיפים דרישות מוצר.
- איור הבית עדיין לא סופק. יש להשתמש בנכס מקומי בעל רישיון מתאים, ולא בקישור מרוחק.
- אין להוסיף Backend, Database, AI או אינטגרציות ללא שינוי מפורש של דרישות המוצר.

## 12. מקורות רשמיים

המקורות הבאים שימשו לאימות ההחלטות הטכנולוגיות והפריסה (נבדקו ב-20.10.2026):

1. [React Documentation](https://react.dev/learn) — רכיבים וניהול State.
2. [TypeScript Documentation](https://www.typescriptlang.org/docs/) — Type Safety.
3. [Vite — Deploying a Static Site](https://vite.dev/guide/static-deploy.html) — Build ופריסה ב-GitHub Pages, Vercel ו-Cloudflare Pages.
4. [vite-plugin-pwa Documentation](https://vite-pwa-org.netlify.app/) — Manifest, Service Worker, Workbox ו-Offline.
5. [GitHub Pages — Getting Started](https://docs.github.com/en/pages/getting-started-with-github-pages) — Hosting ותמיכה בתוכניות.
6. [GitHub Pages — Limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) — מכסות ומגבלות שירות.
7. [MDN — Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) — התקנה ו-Offline.
8. [MDN — Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) — אחסון העדפות מקומי.
9. [Vitest Documentation](https://vitest.dev/guide/) — בדיקות יחידה.

**מקור דרישות המוצר:** קובץ ה-PRD שסופק עבור כפל כיף / Times Fun. אין במסמך זה Milestones או לוחות זמנים.
