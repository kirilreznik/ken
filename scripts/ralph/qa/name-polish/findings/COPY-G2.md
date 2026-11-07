# COPY · G2: Deck (swipe screen, name sheet, filters, background, match, decision, survey, about, report, toasts)

Skills: `ux-writing` (`SKILL.md`; references `content-usability-checklist.md`, `accessibility-guidelines.md`; templates `error-message-template.md`, `empty-state-template.md`), `ux-copy` (`SKILL.md`). The assumptions are the same as in COPY-G1. The "context, user state, tone" inputs of `ux-copy` come from `PRODUCT.md`, `BRAND.md` and the earlier PRDs: warm, calm, plain, gender-neutral Hebrew with no exclamation marks. Skipped: `ux-copy`'s `CONNECTORS.md`, its knowledge-base and Figma connectors, and the English-only readability tools. Capitalization rules don't apply to Hebrew.

**Method:** every visible and screen-reader string goes through `ux-writing`'s four-phase edit (purposeful, concise, conversational, clear) and the content-usability checklist. Errors are checked against `[What failed]. [Why]. [What to do].`, empty states against the empty-state template, and buttons against `[Verb] [object]`. Terms are checked against "Same word means same thing throughout". Numbers are checked against "Use numerals".

**How it was checked:**
- Strings were read from the code (inventory below) and seen on screen.
- Playwright on the dev server :3000 (`us006-g2.mjs` with `G2_OUT=…/audit/COPY-G2 G2_PORT=3000`): all 45 G2 states in WebKit iPhone 15 and Chromium Pixel 7 (`survey-default` saved in Chromium only). All backend calls were mocked.
- Simulator Mobile Safari on :3000, signed in as QA user 1, read-only (`shots/copy-g2-sim.mjs`, no taps on the action row): the deck, the 70 % name sheet, and the filters, background, about, survey and report sheets. The copy and its bidi look the same as in Playwright. Safari ends on the deck, with nothing voted.
- Shots: `scripts/ralph/qa/name-polish/shots/audit/COPY-G2/<screen>-<state>-<webkit|chromium|sim>.png`.

**Out of scope (§3.1.5):** name content: intros, meanings, verses, people, similar names and the theme of each name. Also out of scope is the about sheet's licence and attribution text: the CBS source line, "השימוש בנתונים לא מעיד על תמיכה…" and the access date.

**Already filed by earlier lenses (not repeated here; this lens agrees):**
- IMP-C-G2-03: exclamation marks in "מזל טוב!" and "תודה!".
- IMP-C-G2-09: "קצר וארוך" for all lengths.
- IMP-C-G2-10: "יוניסקס" next to "מתאים לכולם" (owner).
- IMP-C-G2-13: the toast after hiding a name says "דילוג".
- IMP-C-G2-15: the sheet's offline line.
- IMP-C-G2-16: the survey's "שליחה".
- IMP-C-G2-17 and IMP-C-G1-03: "שניכם", "מי שבוחר", "כל אחד". This also covers the match sheet's line and the together badge, "שניכם שמרתם את השם הזה".
- IMP-C-G2-18: a refused survey shows as sent (owner).
- IMP-C-G2-19: the rank as "#148". COPY-G2-02 adds the repeated year in the same line.
- CRIT-G2-01: "אין שמות שמתאימים לסינון הזה" when the filter is done.
- CRIT-G2-02: "לא נשמרו שמות הפעם".
- A11Y-G2-04: two "סגירה" in the name sheet.
- IMP-C-G1-19: periods in titles ("עברת על כל השמות." vs "אין שמות שמתאימים לסינון הזה").
- COPY-G1-02: "האימייל" in the survey lead, which is G2's case of the מייל/אימייל split.

## String inventory and review

Verdicts: ✓ means the string passes the four standards. Otherwise the cell gives the finding or earlier ID.

| Screen | String (source) | Verdict |
|---|---|---|
| header | "בחירת שם" (h1), "הגדרות", "בחירת רקע", "סינון" / "סינון, פעיל" (aria) (`SwipeHeader.tsx`) | ✓ |
| header | saved count pill "{n}" + aria "השמות שלי: {n} נשמרו" (`a11y.ts:73`) | ✓ |
| card | sex tag "בן" / "בת" / "מתאים לכולם", "שם {n} מתוך {total}" (`card.ts:40`), "על הנתונים" (aria, title) | ✓ |
| card | hints "מהתנ״ך", "אדם מוכר אחד" / "{n} אנשים מוכרים" (`cardHints.ts`) | ✓ |
| card | sex bar "בנים {x}%" / "בנות {y}%", "פחות מ־1%", "מעל 99%", sr "מאז 1949 ניתן ל־{x} אחוז בנים…" | ✓ |
| card | count tile "ב־2024" / "מאז 1949", "{n}" / "כ־{n}", "תינוקות · {נפוץ/בינוני/נדיר}" | ✓ |
| card | trend tile "2000–2024", "{↗/→/↘} {בעלייה/יציב/בירידה} לאחרונה", sparkline aria (`card.ts:91`) | ✓ |
| card | "לכל הפרטים", sr "לפרטים נוספים: הקשה" (`a11y.ts:13`), stamps "שמירה" / "דילוג" / "אהבתי מאוד" | ✓ |
| action bar | "שמירה" (aria "שמירה לרשימה"), "אהבתי" (aria "אהבתי מאוד"), "דילוג", "אפשרויות דילוג", "דילוג ולא להציג שוב" | ✓ (visible words are in the names, WCAG 2.5.3) |
| action bar | undo aria "ביטול ההחלטה האחרונה", title "ביטול" | ✓ (term: COPY-G2-01) |
| shortcuts (sr) | "קיצורי מקלדת: K שמירה, L אהבתי מאוד, S דילוג, Z ביטול…" (`keys.ts`) | ✓ |
| footer (sr) | "השם {n} נשמר", "…נשמר, ראשון ברשימה", "דילוג על {n}", "השם {n} לא יוצג שוב", "בוטל: {n}", ". השם הבא: {n}" (`a11y.ts`) | COPY-G2-03 |
| footer | "אין חיבור · בחירה אחת ממתינה לסנכרון" / "{n} בחירות ממתינות לסנכרון" (`offline.ts`) | COPY-G2-01 |
| survey prompt | "5 שאלות קצרות כדי לשפר את האפליקציה?", aria "לא עכשיו, להסתיר את השאלון" (`SurveyPrompt.tsx`) | COPY-G2-04 |
| empty filter | "אין שמות שמתאימים לסינון הזה", "איפוס סינון", "שינוי הסינון" (`EmptyDeck.tsx`) | CRIT-G2-01; buttons ✓ |
| deck end | "עברת על כל השמות.", "בקרוב יתווספו עוד." | ✓ (the owner's FR-W14 wording, kept) |
| deck end | "השמות ששמרת:", "לא נשמרו שמות הפעם.", "לשמות שלי", "להזמין מישהו לבחור ביחד" | CRIT-G2-02; rest ✓ |
| pause invite | "רוצה לבחור עם מישהו?", "כבר שמרת 5 שמות. אפשר להזמין את מי שבוחר איתך: …", "על מה דילגת נשאר רק אצלך.", "הזמנה לבחירה משותפת", "אחר כך, להמשיך לבחור" (`PausePanel.tsx`) | IMP-C-G2-17; rest ✓ |
| pause recap | "סיכום הסבב", "עברת על {n} שמות ושמרת {k}." / "…, עוד בלי שמירות בסבב הזה." (`launch.ts:74`), "שמות ששמרת בסבב הזה" (aria), "להמשיך לבחור", "לשמות שלי" | COPY-G2-10 (zero saves); rest ✓ |
| Nest card | "כל ההריון במקום אחד", "מאותו צוות: אפליקציה לתורים, לבדיקות ולמסמכים של ההיריון. היא עוד לא בחנויות.", "נעדכן אותך כש־Nest יוצאת. אפשר לבטל בהגדרות.", "לעדכן אותי כשהיא יוצאת" / "שומרים…", "מה זה Nest?" (`NestCard.tsx`) | COPY-G2-13 |
| name sheet | "סגירה", "הוספת שם משפחה", "עם שם המשפחה", "שם המשפחה נשמר רק במכשיר הזה." | A11Y-G2-04 (two סגירה); rest ✓ |
| name sheet | sections "מה השם אומר", "מהתנ״ך", "אנשים מוכרים בשם הזה", "ביחד", "בנים ובנות, מאז 1949", "שמות קרובים" | ✓ (about: COPY-G2-12) |
| name sheet | tiles "{n} / תינוקות מאז 1949", "#{r} / בדירוג 2024", "פי {x} / לעומת 2000", "{x}% פחות / לעומת 2000", "בערך כמו / בשנת 2000" (`detail.ts`) | IMP-C-G2-19 (#) |
| name sheet | "כמה תינוקות קיבלו את השם בכל שנה", line "ב־2024: {n} תינוקות, #{r} בשנת 2024" (`NumbersSection.tsx`, `detail.ts:40`) | COPY-G2-02 |
| name sheet | chart: "ב־{year}: {n} תינוקות", "החצים ימינה ושמאלה עוברים בין השנים", "אין נתונים לשנים 2000–2024", table "מספר התינוקות בכל שנה" / "שנה" / "תינוקות" | ✓ |
| name sheet | together "התאמה · שניכם שמרתם את השם הזה" (`detail.ts:260`) | IMP-C-G1-03 |
| name sheet | similar chip aria "{name}, {sex}, פרטי השם" | ✓ |
| name sheet | "מקור: הלשכה המרכזית לסטטיסטיקה", "על הנתונים", "דיווח על טעות" | ✓ |
| name sheet | "הפרטים האלה יופיעו כשיהיה חיבור לאינטרנט" (`DetailsPending.tsx`), "אין חיבור לאינטרנט. אפשר לפתוח את הפרטים כשהחיבור יחזור." (`LazyNameDetailSheet.tsx`) | IMP-C-G2-15; second ✓ |
| toasts | "נשמר: {n}", "אהבתי מאוד: {n}", "דילוג: {n}" (`a11y.ts:62–67`) | COPY-G2-03, IMP-C-G2-13 |
| filters | "סינון", "איפוס", "לבן או לבת", "כל השמות", "בן", "בת", "מתאים לכולם" | ✓ |
| filters | "נושאים", "ניתן לבחור כמה נושאים", theme labels (`themes.ts`), "כל הנושאים" / "{n} נושאים" | COPY-G2-08 (ניתן), COPY-G2-09 (אדמה/יבשה), IMP-C-G2-10 |
| filters | "כמה נפוץ" (נפוץ / בינוני / נדיר), "מגמה" (בעלייה / יציב / בירידה), "נפוץ בקרב" (יהודים / מוסלמים / נוצרים / דרוזים) | ✓ (CBS categories) |
| filters | tiles "אות ראשונה" / "כל האותיות", "אורך" / "קצר, עד 3 אותיות" / "ארוך, 5 אותיות ומעלה" / "קצר וארוך" | IMP-C-G2-09; rest ✓ |
| filters | "מספר אותיות מותאם אישית", slider aria "מספר אותיות, לפחות" / "…לכל היותר", "{n} אותיות (ומעלה)", "בין {a} ל־{b} אותיות" | COPY-G2-08 (checkbox); rest ✓ |
| filters | "שמות שהסתרתי", apply "הצגת {n} שמות" / "הצגת שם אחד" / "הצגת שמות", sr "{n} שמות מתאימים" | ✓ (0 results: IMP-C-G2-12) |
| background | "רקע למסך", "בחירת רקע" (radiogroup), "ללא רקע" / "כרטיסים לבנים", "בדים" / "ברירת מחדל", "מחברת", "חדר תינוק", "תמונה משלי" / "מהגלריה", "נבחר", "החלפת התמונה" | ✓ |
| background | "תמונה משלי נשמרת רק במכשיר הזה. היא לא עולה לשרת ולא מוצגת לשאר המשתתפים בבחירה." | COPY-G2-07 |
| background | toasts "התמונה נשמרה במכשיר הזה.", "אי אפשר לפתוח את התמונה הזו. אפשר לבחור תמונה אחרת." | ✓ |
| match | aria "יש התאמה: {name}", "יש התאמה", "{n} שמרו את השם הזה." / "שניכם שמרתם…", "לרשימת ההתאמות", "להמשיך לבחור" | IMP-C-G1-03; rest ✓ |
| decision | "בחרתי שם" / "בחרנו שם", "מזל טוב! השם נשמר כאן…", "חזרה לרשימה", "לשנות את הבחירה" (`DecisionSheet.tsx`, `launch.ts`) | IMP-C-G2-03; COPY-G2-11 |
| survey | "שאלון קצר", lead "חמש שאלות, כולן לא חובה. … בלי האימייל ובלי השם שלך." | COPY-G2-04 (חמש), COPY-G1-02 (אימייל) |
| survey | questions and options (`survey.ts`) | COPY-G2-06 ("התינוק כבר נולד"); rest ✓ |
| survey | "אפשר לענות על שאלה אחת לפחות, או לסגור.", "אין חיבור לאינטרנט. אפשר לשלוח כשהחיבור יחזור.", "שליחה" / "שולחים…" | COPY-G2-05; IMP-C-G2-16 |
| about | "על הנתונים", "מספרי הלידות" + body, "מקור" block, "לקובץ הנתונים", "לתנאי הרישיון", "הפירושים" + body, "(נפתח בכרטיסייה חדשה)" (sr) | COPY-G2-12 ("הידועים"); rest ✓ |
| about | report button "דיווח על טעות בשם הזה" / "יש טעות? אפשר לדווח" (`report.ts:32`) | ✓ |
| report | "דיווח על טעות בשם {name}", lead "אפשר לכתוב מה לא נכון… הדיווח נשלח בלי פרטים עליך.", "באיזה שם? (לא חובה)", "מה לא נכון?", "עד 1000 תווים." | ✓ (the "no details about you" claim checked: `buildReport` sends area, name, text only) |
| report | "צריך לכתוב מה לא נכון", "עד 1000 תווים" (error), "שליחת דיווח" / "שולחים…", "תודה, הדיווח נשלח", "הדיווח לא נשלח. אפשר לנסות שוב.", offline line, "סגירה" | ✓ |

Checked in G2: there are no due dates, no medical advice and no raw English errors. The only exclamation marks are the two in IMP-C-G2-03, and the only slash form is COPY-G2-09, which isn't a gender slash. The Hebrew is gender-neutral by wording, except for IMP-C-G2-17 and COPY-G2-06.

---

### COPY-G2-01: The offline line says "ממתינות לסנכרון", and a single vote has three names

- **Screen and state:** `/names`, offline with votes waiting (`deck-offline-pending`)
- **Browser:** webkit-iphone · chromium-pixel (Playwright only; Safari can't go offline here)
- **What's wrong:**
  - The footer reads "אין חיבור · בחירה אחת ממתינה לסנכרון". "סנכרון" is the system's word for what happens. What the person wants to know is that their votes aren't lost and will be sent when the connection comes back.
  - The line calls a vote "בחירה". The undo button next to it calls the same act "ההחלטה" ("ביטול ההחלטה האחרונה"). G2 also uses "בחירה" for the whole choosing ("בחירה משותפת", "המשתתפים בבחירה") and for the chosen name ("לשנות את הבחירה"). So "בחירה אחת ממתינה" can be read as "one choosing is waiting".
- **Rule it breaks:**
  - `ux-writing` · `SKILL.md` Common Mistakes · "System-oriented language vs. user language"
  - `ux-copy` · `SKILL.md` · "Consistent: Same terms for the same things everywhere"
  - `content-usability-checklist.md` · "Same word means same thing throughout"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `src/lib/names/offline.ts`, change `pendingText` to say what happens next and use the undo button's word:
  - one: "החלטה אחת תישלח כשהחיבור יחזור"
  - many: "{n} החלטות יישלחו כשהחיבור יחזור"

  `OFFLINE_TEXT` "אין חיבור" stays. The line becomes "אין חיבור · 3 החלטות יישלחו כשהחיבור יחזור" (about 40 characters, one line at 320 px: check at `webkit320`). Update `tests/names/offline` (or wherever `pendingText` is pinned).
- **Guardrail:** polish. FR-W29's draft wording ("לא מחובר · … ממתינות לסנכרון") was already reworded in the app, and the meaning doesn't change.
- **Screenshot:** `shots/audit/COPY-G2/deck-offline-pending-webkit.png`, `deck-offline-pending-chromium.png`

### COPY-G2-02: The sheet's numbers line says 2024 twice

- **Screen and state:** name sheet, "כמה תינוקות קיבלו את השם בכל שנה", the line under the chart
- **Browser:** all three
- **What's wrong:** the line reads "ב־2024: 16 תינוקות, #980 בשנת 2024". It opens with the year and then repeats it at the end, because `rankText` ("#{r} בשנת 2024", `detail.ts:40`) was written to stand alone, and here it's appended after "ב־2024:".
- **Rule it breaks:** `ux-writing` · `SKILL.md` Conciseness · "Every word must have a job"; `content-usability-checklist.md` · "No redundancy"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** do this in one change with IMP-C-G2-19 (same function). In `NumbersSection.tsx`, use a rank text without the year after "ב־2024:", e.g. "ב־2024: 16 תינוקות, מקום 980 בדירוג". You can add a `rankText(rank, { year: false })` or a second helper in `detail.ts`. Update the detail tests that pin the line.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G2/detail-full-bg-none-webkit.png`, `detail-70-bg-fabric-sim.png`

### COPY-G2-03: A vote is announced in two different forms, and "בוטל: {name}" doesn't say what was undone

- **Screen and state:** `/names` after a decision or undo (screen-reader status); name sheet after a vote on a similar name (toast)
- **Browser:** all three (`toast-sheet-vote`; the status is sr-only and read from `a11y.ts`)
- **What's wrong:**
  - The deck's status says "השם שלמה נשמר" and "השם שלמה נשמר, ראשון ברשימה". The same votes made in the sheet show the toasts "נשמר: שלמה" and "אהבתי מאוד: שלמה" (`a11y.ts:62–67`). It's one act with two sentence shapes, and two different results for "אהבתי".
  - After undo, the status says only "בוטל: שלמה". It doesn't say what was cancelled (the save, the skip or the hide). The button that caused it is called "ביטול ההחלטה האחרונה".
- **Rule it breaks:**
  - `ux-copy` · `SKILL.md` · "Consistent: Same terms for the same things everywhere"
  - `ux-writing` · `SKILL.md` Success Messages · "Past tense, specific"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `src/lib/names/a11y.ts`:
  - Toasts use the status sentences: `השם ${name} נשמר`, `השם ${name} נשמר, ראשון ברשימה`, `דילוג על ${name}`. Hidden is IMP-C-G2-13: `השם ${name} לא יוצג שוב`. They stay under 30 characters for the names in the data.
  - Undo: `ההחלטה על ${name} בוטלה`.

  Update `tests/names/a11y*`.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G2/toast-sheet-vote-webkit.png`, `deck-after-undo-webkit.png`

### COPY-G2-04: The survey prompt isn't a real question, and "האפליקציה" is ambiguous

- **Screen and state:** `/names`, survey prompt above the card (`deck-survey-prompt`); survey sheet lead
- **Browser:** webkit-iphone · chromium-pixel (survey sheet also in Safari)
- **What's wrong:**
  - "5 שאלות קצרות כדי לשפר את האפליקציה?" is a noun phrase with a question mark. It doesn't ask anything the person can say yes to, so the line reads as a label rather than an invitation. That's part of why CRIT-G2-04 found the prompt doesn't look tappable.
  - "האפליקציה" is unclear on a screen whose pause and end panels advertise the Nest pregnancy app as "אפליקציה… היא עוד לא בחנויות". The survey is about choosing a name.
  - The prompt writes "5" and the sheet's lead writes "חמש שאלות" for the same count.
- **Rule it breaks:**
  - `ux-writing` · `SKILL.md` Phase 1 Purposeful · "Is value to user clear?" and Phase 4 · "Ensure unambiguous meaning"
  - `SKILL.md` Numbers · "Use numerals, not words"
  - `ux-copy` · "Consistent"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:**
  - `SurveyPrompt.tsx`: "אפשר לשאול 5 שאלות קצרות על בחירת השם?" The dismiss label stays.
  - `SurveySheet.tsx` lead: "5 שאלות, כולן לא חובה." Its "האימייל" follows COPY-G1-02.

  Update the survey tests that pin these strings.
- **Guardrail:** polish. The meaning doesn't change: it's the same short survey, and the purpose ("to improve") stays in the sheet's lead.
- **Screenshot:** `shots/audit/COPY-G2/deck-survey-prompt-webkit.png`, `survey-default-chromium.png`, `survey-default-sim.png`

### COPY-G2-05: The survey's empty-submit error reads as a permission

- **Screen and state:** survey sheet, "שליחה" with nothing answered
- **Browser:** code path (`SurveySheet.tsx:102`)
- **What's wrong:**
  - "אפשר לענות על שאלה אחת לפחות, או לסגור." starts with "אפשר" ("you may"). The app uses that word for options. Here it has to say what's missing: nothing will be sent until one answer is given.
  - The report sheet next to it uses the requirement form for the same situation: "צריך לכתוב מה לא נכון".
- **Rule it breaks:** `ux-writing` · `SKILL.md` Validation Errors · "Brief, specific guidance to correct input. Pattern: [Field] [specific requirement]"; `ux-copy` · "Consistent"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `SurveySheet.tsx`, use "צריך לענות על שאלה אחת לפחות. אפשר גם לסגור בלי לשלוח." Update the test.
- **Guardrail:** polish
- **Screenshot:** none (the state needs a submit with nothing answered; read from `SurveySheet.tsx:102`)

### COPY-G2-06: A survey option says "התינוק כבר נולד"

- **Screen and state:** survey sheet, "באיזה שלב ההיריון עכשיו?"
- **Browser:** all three (lower in the sheet)
- **What's wrong:**
  - "התינוק כבר נולד" uses the masculine generic for the baby. Everywhere else, the app talks about babies in the plural ("תינוקות") or avoids the noun.
  - The other options name a stage ("עד שבוע 20", "אחרי שבוע 20"). This one names a person.
- **Rule it breaks:** `ux-writing` · `SKILL.md` Clarity · "Avoid discriminatory or exclusionary language (gendered defaults…)"
- **Severity:** P3 (project rule: gender-neutral Hebrew)
- **Effort:** XS
- **Proposed change:** in `src/lib/names/survey.ts`, change the label to "אחרי הלידה". The stored value stays `born`, so earlier answers still count the same. Update the survey test.
- **Guardrail:** polish (the label changes, the answer's meaning and value don't)
- **Screenshot:** `shots/audit/COPY-G2/survey-default-chromium.png` (the option is below the fold; read from `survey.ts:43`)

### COPY-G2-07: The photo privacy note uses a button label as its subject and says "לשרת"

- **Screen and state:** background sheet, the note under the options
- **Browser:** all three
- **What's wrong:**
  - "תמונה משלי נשמרת רק במכשיר הזה." starts with the option's first-person label "תמונה משלי" as if it were a noun. Read as a sentence, it says "a picture of mine is saved only on this device", in the person's own voice, inside a note the app is writing to them.
  - "היא לא עולה לשרת" uses the system word "שרת" (COPY-G1-14). What matters to the person is that the photo doesn't leave the phone.
- **Rule it breaks:** `ux-writing` · `SKILL.md` Phase 3 · "Read aloud—would you say this?"; Common Mistakes · "System-oriented language vs. user language"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `BackgroundSheet.tsx:105`, use "תמונה משלך נשמרת רק במכשיר הזה. היא לא יוצאת ממנו ולא מוצגת לשאר המשתתפים בבחירה." The claim stays the same (`photo.ts` keeps it in IndexedDB only, checked). Update the test if one pins it.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G2/background-default-webkit.png`

### COPY-G2-08: Filters say "ניתן לבחור" and "מותאם אישית"

- **Screen and state:** filters sheet, "נושאים" hint; the length picker's checkbox
- **Browser:** all three (the checkbox opens under "אורך")
- **What's wrong:**
  - "ניתן לבחור כמה נושאים" is the only "ניתן" in the UI. Every other hint says "אפשר" ("אפשר לבטל בהגדרות", "אפשר לנסות שוב").
  - "מספר אותיות מותאם אישית" is a calque of "custom" that tells the person nothing. Checking it shows a range slider for the number of letters.
- **Rule it breaks:** `content-usability-checklist.md` Conversational · "Natural, spoken language" and "Familiar words and phrases"; `ux-copy` · "Consistent"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `FiltersSheet.tsx`, change the hint to "אפשר לבחור כמה נושאים" (`:148`) and the checkbox label to "בחירת טווח של מספר אותיות" (`:303`). Update the filters tests that read them.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G2/filters-default-webkit.png`, `filters-default-sim.png`

### COPY-G2-09: The theme "אדמה/יבשה" is the one label with a slash

- **Screen and state:** filters sheet, "נושאים" chips
- **Browser:** all three
- **What's wrong:** two-word themes are joined with "ו", as in "אש ואור", "ים ומים" and "שמחה ורגשות". "אדמה/יבשה" is joined with a slash, so it reads like a form field or a data key.
- **Rule it breaks:** `content-usability-checklist.md` · "Consistent patterns and terminology"; Conversational · "Natural, spoken language"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `src/lib/names/themes.ts:34`, use "אדמה ויבשה". This changes the label only, not the theme id or which names it holds. Update the themes test if it pins the label.
- **Guardrail:** polish (a UI label, not name content)
- **Screenshot:** `shots/audit/COPY-G2/filters-default-webkit.png`

### COPY-G2-10: The recap with no saves says "עוד בלי שמירות"

- **Screen and state:** `/names` pause recap after 30 decisions with nothing saved in the round
- **Browser:** code path (`launch.ts:74`; the baseline recap has 8 saves)
- **What's wrong:** "עברת על 30 שמות, עוד בלי שמירות בסבב הזה." turns "saving" into an unusual plural noun ("שמירות"). It's the one recap line that doesn't use a verb, while the other says "ושמרת 8".
- **Rule it breaks:** `ux-writing` · `SKILL.md` Phase 3 · "Read aloud—would you say this?"; `content-usability-checklist.md` · "Natural, spoken language"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `src/lib/names/launch.ts`, use "עברת על 30 שמות ועוד לא שמרת אף אחד בסבב הזה." The tone stays neutral, with no blame. Update the recap test.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G2/deck-pause-recap-webkit.png` (the 8-save variant)

### COPY-G2-11: "לשנות את הבחירה" clears the chosen name

- **Screen and state:** decision sheet ("בחרתי שם" / "בחרנו שם"), the secondary link
- **Browser:** webkit-iphone · chromium-pixel (lower in the sheet, IMP-C-G2-08)
- **What's wrong:**
  - The link removes the chosen name (IMP-C-G2-04: one tap, no undo). Its label promises a change, which suggests the person will pick another name next.
  - "הבחירה" is also the app's word for the whole choosing (COPY-G2-01).
- **Rule it breaks:** `ux-copy` · `SKILL.md` CTAs · "Match the outcome to the label"; `ux-writing` · `SKILL.md` · "Accurate action words"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `DecisionSheet.tsx:94`, label it by its outcome: "ביטול הבחירה ב־{name}" (solo and shared). Do it in the same change as IMP-C-G2-04 (same control), which decides whether it gets a confirm or an undo. Update the test.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G2/decision-solo-webkit.png`, `decision-shared-webkit.png`

### COPY-G2-12: The about text says "האנשים הידועים", the sheet says "אנשים מוכרים"

- **Screen and state:** about sheet ("הפירושים"); name sheet section; card hints
- **Browser:** all three
- **What's wrong:** the name sheet's section is "אנשים מוכרים בשם הזה" (FR-D11), and the card hints say "אדם מוכר אחד" / "{n} אנשים מוכרים". The about text that explains where they come from says "האנשים הידועים נבדקו מול Wikidata". `CardPeople.tsx:34` still has the old "אנשים ידועים בשם הזה" label in a branch that nothing renders anymore (the card is slim since the detail run).
- **Rule it breaks:** `ux-copy` · `SKILL.md` · "Consistent: Same terms for the same things everywhere"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `about/AboutContent.tsx:55`, use "האנשים המוכרים נבדקו מול Wikidata". In `CardPeople.tsx`, drop the unused non-sheet branch and its label, or make it "מוכרים". Update the about test if it pins the line.
- **Guardrail:** polish. The about text is the app's own data note, not the privacy or terms text, and its meaning doesn't change.
- **Screenshot:** `shots/audit/COPY-G2/about-default-sim.png`, `detail-together-webkit.png`

### COPY-G2-13: The Nest card says "בחנויות" and "כשהיא יוצאת"

- **Screen and state:** Nest card on the deck end, the pause recap and the decision sheet
- **Browser:** all three
- **What's wrong:** this is the same opt-in as onboarding's line in COPY-G1-01, with the same two problems:
  - "היא עוד לא בחנויות" is insider shorthand for the app stores.
  - "נעדכן אותך כש־Nest יוצאת" and the button "לעדכן אותי כשהיא יוצאת" use the present tense, so they read as if the launch is happening now.
- **Rule it breaks:** `ux-writing` · `SKILL.md` Clarity · "Avoid jargon, idioms, and technical terms"; Phase 4 · "Ensure unambiguous meaning"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `NestCard.tsx`:
  - "היא עוד לא בחנויות האפליקציות."
  - "נעדכן אותך כש־Nest תצא. אפשר לבטל בהגדרות."
  - Button: "לעדכן אותי כשהיא תצא".

  Take the owner's wording from COPY-G1-01 so both opt-ins match. Update the NestCard test.
- **Guardrail:** owner (§3.2: it's the same stored marketing consent as COPY-G1-01, so the wording is legal-adjacent). Recommendation: approve together with COPY-G1-01.
- **Screenshot:** `shots/audit/COPY-G2/deck-end-solo-webkit.png`, `deck-pause-recap-webkit.png`, `decision-solo-webkit.png`
