# COPY · G1: Entry (welcome, sign-in, callback, onboarding, intro, join, invite, offline, goodbye, 404, unconfigured)

Skills: `ux-writing` (`SKILL.md`; references `content-usability-checklist.md`, `accessibility-guidelines.md`; template `error-message-template.md`), `ux-copy` (`SKILL.md`). Assumptions where the skill would ask: the "context, user state, tone" inputs of `ux-copy` are taken from `PRODUCT.md`, `docs/names-pwa/brand/BRAND.md` and the earlier PRDs (warm, calm, plain Hebrew; gender-neutral; no exclamation marks). Skipped: `ux-copy`'s `CONNECTORS.md` and knowledge-base / Figma connectors, `ux-writing`'s `docs/figma-integration.md`, and its readability tools (Hemingway, Flesch-Kincaid are English-only). The capitalization rules don't apply to Hebrew. The English-first rules are applied in gender-neutral Hebrew (US-002).

**Method:** `ux-writing`'s four-phase edit (purposeful, concise, conversational, clear) on every visible string, with the content-usability checklist. Errors are checked against the `[What failed]. [Why]. [What to do].` pattern and the error template's checklist. Buttons are checked against `[Verb] [object]`, and terms against "Same word means same thing throughout".

**How it was checked:**
- Strings were read from the code (inventory below) and seen on screen.
- Playwright on the dev server :3000 (`us005-g1.mjs` with `G1_OUT=…/audit/COPY-G1`): all 23 states in WebKit iPhone 15 and Chromium Pixel 7. Every write was mocked.
- Simulator Mobile Safari, signed out on :3100 (`us005-sim.mjs out` and `email`): welcome (default, closed, expired), callback error, join invited and closed, offline, goodbye, 404, and the email and invalid-address steps. No code email was sent.
- Shots: `scripts/ralph/qa/name-polish/shots/audit/COPY-G1/<screen>-<state>-<webkit|chromium|sim>.png`. Browsers don't change the copy. The bidi of the LTR parts (email in the code-step lead, `name@example.com` in the invalid-address line) renders the same in all three.

**Out of scope (§3.1.5):** `/names/privacy` and `/names/terms` text, and name content (the זיו preview card's intro and tags, the נֹעַם tile). Card UI labels belong to G2.

**Already filed by earlier lenses (not repeated here; this lens agrees):**
- IMP-C-G1-02: the wrong-code line asks for a new code while resend is locked.
- IMP-C-G1-03: "שניכם".
- IMP-C-G1-05: "צריך להיכנס שוב" with no reason.
- IMP-C-G1-09: the expired-or-used invite lead.
- IMP-C-G1-11: the 404 has no explanation.
- IMP-C-G1-12: the unconfigured dead end.
- IMP-C-G1-13 and CRIT-G1-02: the five labels for "into the deck".
- IMP-C-G1-19: periods in titles.
- IMP-C-G1-20: the callback error's action.
- CRIT-G1-03: the missing-fields hint points by position.
- CRIT-G1-06: join names no person.
- ELEV-G1-06: the expiry line's middle dot.
- INT-G1-01: no "new code sent" line after a resend.
- IMP-A-G1-05: the Google-failure tab title is "מתחברים".

## String inventory and review

Verdicts: ✓ = passes the four standards, or the finding or earlier ID.

| Screen | String (source) | Verdict |
|---|---|---|
| welcome | "בחירת שם" (title), "שם אחד בכל פעם, עם מספרים אמיתיים מהלמ"ס. לבד או ביחד." (`welcome/page.tsx`) | ✓ (הלמ"ס is a known abbreviation in Israel) |
| welcome | "כניסה עם Google", "כניסה עם קוד במייל" (`WelcomeActions.tsx`) | ✓ |
| welcome | "בהמשך מאשרים את תנאי השימוש ומדיניות הפרטיות" | ✓ |
| welcome | Google failure "הכניסה עם Google לא הצליחה" (`GOOGLE_FAILED_MESSAGE`) | COPY-G1-07 |
| welcome closed | "ההרשמה עוד לא פתוחה. אפשר להשאיר אימייל בעמוד הבית ונעדכן כשנפתח." + "להשארת אימייל" (`auth.ts`, `ClosedNotice.tsx`) | COPY-G1-02 (term) |
| welcome expired | "צריך להיכנס שוב" | IMP-C-G1-05 |
| all sign-in | "אין חיבור לאינטרנט. אפשר להיכנס כשהחיבור יחזור." (`OFFLINE_MESSAGE`) | ✓ |
| sign-in | "משהו השתבש. אפשר לנסות שוב." (`GENERIC_MESSAGE`; also onboarding) | COPY-G1-06 |
| sign-in | "נשלחו יותר מדי קודים. אפשר לנסות שוב בעוד כמה דקות." (`RATE_LIMIT_MESSAGE`) | COPY-G1-05 |
| email step | "כניסה עם קוד במייל" (title and tab), "נשלח קוד בן 6 ספרות לכתובת שלך." | COPY-G1-03 |
| email step | "כתובת אימייל", placeholder "name@example.com", "שליחת קוד" / "שולחים…" | COPY-G1-02 (term); rest ✓ |
| email step | "צריך כתובת אימייל, למשל name@example.com" (`INVALID_EMAIL_MESSAGE`) | COPY-G1-04 |
| code step | "מה הקוד?", "שלחנו קוד בן 6 ספרות ל־{email}. אפשר לבדוק גם בתיקיית הספאם." | ✓ |
| code step | "הקוד מהמייל", "כניסה" / "נכנסים…", "שינוי כתובת", "חזרה" (aria) | ✓ |
| code step | "הקוד לא נכון או שפג תוקפו. אפשר לבקש קוד חדש." (`WRONG_CODE_MESSAGE`) | IMP-C-G1-02 |
| code step | "שליחה חוזרת", "אפשר לשלוח שוב בעוד {n} שניות" / "…בעוד שנייה", "אפשר לשלוח קוד חדש" (sr) (`resend.ts`) | ✓ |
| callback | "מתחברים…" (title), "רק רגע, מסיימים את הכניסה", tab "מתחברים" | COPY-G1-08 |
| callback error | "הכניסה עם Google לא הצליחה" / "אפשר לנסות שוב או להיכנס עם קוד במייל." / "חזרה לכניסה" | ✓ (action: IMP-C-G1-20) |
| skeleton | "בטעינה" (sr) | ✓ |
| onboarding | "רגע לפני שמתחילים", "כמה פרטים, ואפשר לבחור." | ✓ |
| onboarding | "איך לקרוא לך?", "השם יוצג בבחירה משותפת.", "צריך שם, עד 40 תווים." | ✓ |
| onboarding | "אני בן/בת 18 ומעלה", "השירות מיועד מגיל 18 ומעלה.", "קראתי ואני מסכים/ה לתנאי השימוש ולמדיניות הפרטיות", "אשמח לקבל עדכון כש־Nest יוצאת לחנויות" | COPY-G1-01 |
| onboarding | "לא חובה. אפשר לשנות בהגדרות.", "אישורים" (sr legend), "(נפתח בכרטיסייה חדשה)" (sr) | ✓ |
| onboarding | "אפשר להתחיל אחרי שממלאים שם ומאשרים את שני הסעיפים הראשונים." | CRIT-G1-03 |
| onboarding | "אין חיבור לאינטרנט. אפשר לשמור שוב כשהחיבור יחזור." | ✓ |
| onboarding | "התחלת בחירה" / "שומרים…" | IMP-C-G1-13 |
| intro | "סגירה" (aria), "שם אחד בכל פעם", lead "עוברים על שמות שניתנו לתינוקות בישראל, שומרים את מה שמדבר אל הלב ומדלגים על השאר." | ✓ |
| intro | "כמה תינוקות קיבלו כל שם, ואיך זה השתנה מאז 2000. לפי נתוני הלמ"ס." | ✓ |
| intro | "הבחירות נשארות פרטיות." + solo "מה ששומרים ועל מה שמדלגים נשאר פרטי." / shared "…שם ששניכם שמרתם…" | COPY-G1-09 (solo); IMP-C-G1-03 (shared) |
| intro | "עובד גם לבד. מהשמות ששמרתם אפשר לצמצם לחמישייה בדו־קרב." | COPY-G1-10 |
| intro | "שם משפחה, לא חובה", placeholder "כדי לראות את השם המלא", "נשמר רק במכשיר הזה." | COPY-G1-11 |
| intro | "התחלת בחירה", tab "איך זה עובד" | ✓ |
| join invited | "קיבלת הזמנה לבחור שם ביחד ב־Nest", "הבחירה נעשית בנפרד, בכל טלפון. שם ששניכם שמרתם יופיע בהתאמות." | CRIT-G1-06, IMP-C-G1-03 |
| join loading | "רק רגע, מצטרפים לבחירה" | ✓ |
| join joined | "הצטרפת." / "מעכשיו שמות ששניכם שמרתם יופיעו בהתאמות." / "השמות ששמרת עוברים איתך." / "להתחיל לבחור" | COPY-G1-12; IMP-C-G1-03, -19, CRIT-G1-02 |
| join already | "כבר משתתפים בבחירה הזו." / "אפשר להמשיך לבחור." / "להמשיך לבחור" | ✓ |
| join invalid | "הקישור כבר לא בתוקף." / "אפשר לבקש קישור חדש." / "לבחירת שמות" or "לכניסה" | IMP-C-G1-09 |
| join offline | "אין חיבור לאינטרנט." / "אפשר לפתוח את הקישור שוב כשהחיבור יחזור." / "ניסיון חוזר" | COPY-G1-13 |
| join error | "ההצטרפות לא הצליחה." / "אפשר לנסות שוב." / "ניסיון חוזר" | ✓ (cause unknown to the app) |
| invite | "הזמנה לבחירה", "חזרה" (aria), lead "בוחרים שם ביחד? שולחים קישור, והבחירה נעשית בנפרד, בכל טלפון. שם ששניכם…" | IMP-C-G1-03; rest ✓ |
| invite | "קישור הזמנה", "קישור ההזמנה" (aria), "בתוקף עד {date} · הקישור עובד פעם אחת" | ELEV-G1-06 |
| invite | "שליחת קישור הזמנה", "העתקת הקישור", "הקישור הועתק", "לא הצלחנו להעתיק. אפשר לסמן את הקישור ולהעתיק אותו." | ✓ |
| invite | "צריך חיבור לאינטרנט כדי ליצור קישור הזמנה.", "לא הצלחנו ליצור קישור. אפשר לנסות שוב.", "ניסיון חוזר", "יוצרים קישור" (sr) | ✓ |
| invite | "מי כבר כאן", "{name} (אני)", "בלי שם"; share "בחירת שם ב־Nest" / "בואו לבחור שם ביחד" | ✓ |
| offline | "אין חיבור לאינטרנט" / "העמוד הזה עוד לא שמור במכשיר. אפשר לחזור לבחירת שם, או לנסות שוב כשהחיבור יחזור." / "לבחירת שם" | ✓ (label: CRIT-G1-02) |
| goodbye | "החשבון נמחק" / "כל הבחירות שלך נמחקו מהשרת ומהמכשיר הזה." / "לדף הבית של Nest" | COPY-G1-14 |
| 404 | "העמוד לא נמצא" / "לבחירת שם" | IMP-C-G1-11 |
| unconfigured | "השירות לא מוגדר" | IMP-C-G1-12 |

No exclamation marks, no medical advice, no due date and no raw English error reaches the screen in G1 (checked).

---

### COPY-G1-01: Onboarding's confirmations use slash gender forms and store jargon

- **Screen and state:** `/names/onboarding`, default
- **Browser:** webkit-iphone · chromium-pixel (same copy in Safari)
- **What's wrong:**
  - "אני בן/בת 18 ומעלה" and "קראתי ואני מסכים/ה ל…" are the only slash forms in G1. Every other G1 string reaches gender neutrality by wording (impersonal plural, first-person past), so these two read like a form.
  - Gender-neutral wording is available with the same meaning: "מלאו לי 18" and "קראתי והסכמתי ל…" (first-person past is the same for everyone).
  - "אשמח לקבל עדכון כש־Nest יוצאת לחנויות": "לחנויות" means the app stores. That's insider shorthand, and the present tense "יוצאת" reads as if it's happening now.
- **Rule it breaks:**
  - `ux-writing` · `SKILL.md` Clarity · "Avoid discriminatory or exclusionary language (gendered defaults…)"
  - `SKILL.md` Clarity · "Avoid jargon, idioms, and technical terms"
  - `content-usability-checklist.md` Conversational · "Natural, spoken language"
- **Severity:** P2 (project rule: gender-neutral Hebrew)
- **Effort:** XS
- **Proposed change:** in `src/components/names/Onboarding.tsx`, change three lines:
  - "מלאו לי 18"
  - "קראתי והסכמתי ל<תנאי השימוש> ול<מדיניות הפרטיות>"
  - "אשמח לקבל עדכון כשהאפליקציה של Nest תצא לחנויות האפליקציות"

  The hint "השירות מיועד מגיל 18 ומעלה." stays. Update the onboarding tests that read these labels.
- **Guardrail:** owner (§3.2: these are consent statements that are stored with the account, so the wording is legal-adjacent). Recommendation: approve. The meaning is unchanged.
- **Screenshot:** `shots/audit/COPY-G1/onboarding-default-full-webkit.png`, `onboarding-default-chromium.png`

### COPY-G1-02: "מייל" and "אימייל" both name the same thing

- **Screen and state:** welcome (buttons, closed notice), sign-in email and code steps, callback error
- **Browser:** all three
- **What's wrong:**
  - "כניסה עם קוד במייל", "הקוד מהמייל" and "להיכנס עם קוד במייל" say מייל.
  - "כתובת אימייל", "צריך כתובת אימייל…", "אפשר להשאיר אימייל…" and "להשארת אימייל" say אימייל.
  - On the email step both words are on one panel: the title says "במייל" and the field label right under it says "אימייל".
  - The same split is in G2 (`SurveySheet.tsx`) and in `src/lib/names/email.ts`.
- **Rule it breaks:** `ux-copy` · `SKILL.md` Principles · "Consistent: Same terms for the same things everywhere"; `ux-writing` · `content-usability-checklist.md` · "Same word means same thing throughout"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** use "מייל" everywhere in the UI (it's shorter and already in the main button). Strings to change:
  - `EmailSignIn.tsx` label: "כתובת מייל"
  - `INVALID_EMAIL_MESSAGE` (see COPY-G1-04)
  - `SIGNUPS_CLOSED_MESSAGE` and the `ClosedNotice` link: "להשארת מייל"

  COPY-G2 and COPY-G3 should list the G2 and G3 strings. Update the tests that read them.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G1/signin-email-webkit.png`, `welcome-closed-full-webkit.png`

### COPY-G1-03: "נשלח קוד…" reads as "a code was sent" before anything is sent

- **Screen and state:** `/names/sign-in/email`, email step
- **Browser:** all three
- **What's wrong:** without vowels, "נשלח קוד בן 6 ספרות לכתובת שלך." reads first as the past passive ("a code has been sent to your address"). That's how the next step's "שלחנו קוד…" reads too. On this step nothing has been sent yet, and the address field is empty right below it, so the lead can be read as describing an action that didn't happen.
- **Rule it breaks:** `ux-writing` · `SKILL.md` Phase 4 Clear · "Ensure unambiguous meaning"; `content-usability-checklist.md` · "Accurate action words"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `src/components/names/EmailSignIn.tsx`, give the email step's lead a verb that can only be read one way, e.g. "שולחים לכתובת שלך קוד בן 6 ספרות, ואיתו נכנסים.". Update the test that reads it.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G1/signin-email-webkit.png`, `signin-email-sim.png`

### COPY-G1-04: The invalid-address line says an address is needed, not what's wrong with it

- **Screen and state:** `/names/sign-in/email`, "abc" + "שליחת קוד" (and an empty field)
- **Browser:** all three
- **What's wrong:**
  - `INVALID_EMAIL_MESSAGE` = "צריך כתובת אימייל, למשל name@example.com" is shown both for an empty field and for "abc", "name@gmail" or "name@@x.com".
  - For a typed address, "צריך כתובת" reads as if nothing was entered.
  - The person isn't told what's missing (usually the "@" or the domain ending).
- **Rule it breaks:** `ux-writing` · `SKILL.md` Validation Errors · "Brief, specific guidance to correct input. Pattern: [Field] [specific requirement]" (example "Email must include @"); `error-message-template.md` · "Specific problem"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `src/lib/names/authErrors.ts`, split the message in two:
  - empty field: "צריך כתובת מייל"
  - something typed: "הכתובת לא שלמה. היא צריכה להיראות כמו name@example.com"

  In `EmailSignIn.tsx`'s `submitEmail`, pick the line by whether `email.trim()` is empty. `aria-invalid` stays on both. Update `authErrors` tests.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G1/signin-email-invalid-webkit.png`, `signin-email-invalid-chromium.png`, `signin-email-invalid-sim.png`

### COPY-G1-05: The rate-limit line blames "too many codes sent" also when too many codes were typed

- **Screen and state:** `/names/sign-in/email`, both steps (Supabase 429)
- **Browser:** code path (all engines)
- **What's wrong:**
  - `authErrorKind` maps every 429 / `over_request_rate_limit` to `RATE_LIMIT_MESSAGE` = "נשלחו יותר מדי קודים. אפשר לנסות שוב בעוד כמה דקות.". This includes a 429 from `verifyOtp` (Supabase also rate-limits code checks).
  - After several wrong codes, the person is told they asked for too many codes, which they didn't. The real cause is too many tries.
- **Rule it breaks:** `ux-writing` · `error-message-template.md` · "Specific problem"; `content-usability-checklist.md` Clear · "Accurate action words"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** one line that's true for both, in `src/lib/names/authErrors.ts`: "היו יותר מדי ניסיונות. אפשר לנסות שוב בעוד כמה דקות." Update the test that pins it.
- **Guardrail:** polish
- **Screenshot:** none (the state needs a real rate limit; read from `authErrors.ts:5` and `:36`)

### COPY-G1-06: "משהו השתבש" doesn't say what failed

- **Screen and state:** sign-in email step (send failed, 5xx or unknown), code step (verify failed, unknown), onboarding (save failed)
- **Browser:** code path
- **What's wrong:**
  - `GENERIC_MESSAGE` = "משהו השתבש. אפשר לנסות שוב." is the line for every unexpected failure in G1. Each screen knows which action failed, but the line doesn't say it.
  - On the code step, "something went wrong" after typing a code leaves it unclear whether the code was wrong. On onboarding, it's unclear whether the details were saved.
- **Rule it breaks:**
  - `ux-writing` · `SKILL.md` What to Avoid · "Vague causes ('Something went wrong')"
  - `error-message-template.md` · "Specific problem — Not generic 'something went wrong'"
  - Pattern: "[Action failed]. [Likely cause]. [Recovery step]."
- **Severity:** P3
- **Effort:** S
- **Proposed change:** in `src/lib/names/authErrors.ts`, choose the line by the `area` already passed to `handleAuthError`:
  - `sign-in-email-send`: "לא הצלחנו לשלוח את הקוד. אפשר לנסות שוב בעוד רגע."
  - `sign-in-email-verify`: "לא הצלחנו לבדוק את הקוד. אפשר לנסות שוב."
  - `onboarding-*`: "לא הצלחנו לשמור את הפרטים. אפשר לנסות שוב."
  - Google: already "הכניסה עם Google לא הצליחה".

  Keep `GENERIC_MESSAGE` as the fallback. Update the tests.
- **Guardrail:** polish (the app already knows which action failed; nothing invented)
- **Screenshot:** none (needs a 5xx; read from `authErrors.ts:7`, `EmailSignIn.tsx` `fail()`, `Onboarding.tsx` `fail()`)

### COPY-G1-07: On welcome, the Google failure has no next step

- **Screen and state:** `/names/welcome`, after `signInWithOAuth` fails (the `kind === "other"` path)
- **Browser:** code path (WelcomeActions)
- **What's wrong:**
  - Welcome shows only "הכניסה עם Google לא הצליחה" above the buttons.
  - The same failure on the callback screen adds "אפשר לנסות שוב או להיכנס עם קוד במייל.", so the person who stays on welcome gets the half without the way forward.
  - The look of this line is IMP-C-G1-14. This finding is about its words.
- **Rule it breaks:** `ux-writing` · `SKILL.md` Error Messages · "Pattern: [What failed]. [Why/context]. [What to do]."; What to Avoid · "Dead ends (error with no recovery path)"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `src/components/names/WelcomeActions.tsx`, show `GOOGLE_FAILED_MESSAGE` followed by the callback's lead: "הכניסה עם Google לא הצליחה. אפשר לנסות שוב או להיכנס עם קוד במייל.". Share one constant with `AuthCallback.tsx` (`src/lib/names/routing.ts`).
- **Guardrail:** polish
- **Screenshot:** none (needs an OAuth start failure; read from `WelcomeActions.tsx:33`)

### COPY-G1-08: The callback says "מתחברים" where every other sign-in string says "כניסה"

- **Screen and state:** `/names/auth/callback`, loading (title, tab title)
- **Browser:** webkit-iphone · chromium-pixel
- **What's wrong:** G1 names this act "כניסה" everywhere:
  - "כניסה עם Google", "כניסה עם קוד במייל", "כניסה" / "נכנסים…"
  - "חזרה לכניסה", "צריך להיכנס שוב"
  - "רק רגע, מסיימים את הכניסה" (under this very title)

  Only the callback's title and tab say "מתחברים…" / "מתחברים". The tab title is also what IMP-A-G1-05 found stuck on the error state.
- **Rule it breaks:** `ux-copy` · `SKILL.md` · "Consistent: Same terms for the same things everywhere"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** make the title "נכנסים…" in `AuthCallback.tsx` and the tab "נכנסים" in `src/app/names/auth/callback/page.tsx`. Merge with IMP-A-G1-05 (same file).
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G1/callback-loading-webkit.png`, `callback-loading-chromium.png`

### COPY-G1-09: The intro's solo privacy line repeats "פרטי" and doesn't parse

- **Screen and state:** `/names/intro`, top, solo space
- **Browser:** webkit-iphone · chromium-pixel
- **What's wrong:**
  - The point reads "הבחירות נשארות פרטיות. מה ששומרים ועל מה שמדלגים נשאר פרטי.".
  - The second sentence repeats the first ("private" twice).
  - Its subject joins "מה ש…" and "על מה ש…" under one singular verb, so it doesn't parse cleanly when read aloud.
  - The shared variant says something new ("ועל דילוגים אף אחד לא יודע"). The solo one adds nothing.
- **Rule it breaks:** `ux-writing` · `SKILL.md` Conciseness · "Every word must have a job"; Phase 3 · "Read aloud—would you say this?"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `src/components/names/Intro.tsx`, change the solo line to one fact, e.g. "הבחירות נשארות פרטיות. אף אחד לא רואה מה שמרת ועל מה דילגת." (the same meaning, no new claim). Update the intro test that reads it.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G1/intro-top-full-webkit.png` (shared QA user; the solo line is from the code)

### COPY-G1-10: "עובד גם לבד" then addresses "you" in the plural

- **Screen and state:** `/names/intro`, third point
- **Browser:** webkit-iphone · chromium-pixel
- **What's wrong:**
  - "עובד גם לבד. מהשמות ששמרתם אפשר לצמצם לחמישייה בדו־קרב." speaks to one person choosing alone in the plural "ששמרתם".
  - The same screen's lead uses the impersonal plural ("עוברים… שומרים… מדלגים"), and join uses the singular "ששמרת", so the three G1 address forms meet on one screen.
  - "דו־קרב" also appears here for the first time with no hint that it's a place in the app.
- **Rule it breaks:** `ux-copy` · `SKILL.md` · "Consistent"; `ux-writing` · `content-usability-checklist.md` · "Consistent patterns and terminology"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** use the impersonal form, as in the lead: "עובד גם לבד. מהשמות ששומרים אפשר לצמצם לחמישייה בדו־קרב, ברשימות." The duel is a tab of `/names/lists` (checked). Change it in `Intro.tsx` and its test.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G1/intro-top-full-webkit.png`

### COPY-G1-11: The surname field's purpose is in the placeholder and disappears on typing

- **Screen and state:** `/names/intro`, surname step
- **Browser:** webkit-iphone · chromium-pixel · sim-safari (baseline)
- **What's wrong:**
  - Why to give a surname ("כדי לראות את השם המלא") is only the placeholder. It disappears with the first letter, and for someone opening the intro from the sheet's "הוספת שם משפחה" it's gone as soon as they start typing.
  - The static hint holds only "נשמר רק במכשיר הזה.".
  - The placeholder is also in `stone` on a white field, a contrast issue already filed as IMP-C-G1-06.
- **Rule it breaks:** `ux-writing` · `SKILL.md` Form Fields · "Placeholder: Use sparingly, only for standard inputs like 'name@example.com'"; Instructions · "explain why information is needed"; `accessibility-guidelines.md` · "Visible label + optional placeholder"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `src/components/names/Intro.tsx`, drop the placeholder and make the hint "כדי לראות את השם המלא על הכרטיס. נשמר רק במכשיר הזה.". Update the test.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G1/intro-surname-webkit.png`, `intro-surname-chromium.png`

### COPY-G1-12: "השמות ששמרת עוברים איתך." doesn't say where, and the move is already done

- **Screen and state:** `/names/join/[code]`, joined with votes moved
- **Browser:** webkit-iphone · chromium-pixel (joined state mocked; the votes-moved line is from the code)
- **What's wrong:**
  - `VOTES_MOVE_TEXT` is shown after the join finished, but it's in the present tense ("are moving with you"), so it reads as still happening.
  - It doesn't say where the names went, to the shared choice. That's the one thing a person who used the app alone wants to know here.
- **Rule it breaks:** `ux-writing` · `SKILL.md` Success Messages · "Past tense, specific"; Tense · "Prefer past tense … for status messages"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `src/lib/names/join.ts`: "השמות ששמרת עברו איתך לבחירה המשותפת." Update the join test.
- **Guardrail:** polish (`votesMoved` is what the RPC reports; no new claim)
- **Screenshot:** `shots/audit/COPY-G1/join-joined-webkit.png`

### COPY-G1-13: Join's offline lead says to reopen the link, under a "ניסיון חוזר" button

- **Screen and state:** `/names/join/[code]`, signed in, `names_join` offline
- **Browser:** code path (`JOIN_COPY.offline`)
- **What's wrong:**
  - The lead is "אפשר לפתוח את הקישור שוב כשהחיבור יחזור." and the only action is "ניסיון חוזר", which retries on the same screen. The text sends the person back to their messages for a step the button already does.
  - The title "אין חיבור לאינטרנט." also differs by its period from the same title on `/names/offline` (that part is IMP-C-G1-19).
- **Rule it breaks:** `ux-copy` · `SKILL.md` CTAs · "Match the outcome to the label"; `ux-writing` · `SKILL.md` · "Purposeful — Helps users … achieve goals"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `src/lib/names/join.ts`: lead "אפשר לנסות שוב כשהחיבור יחזור." Update the test.
- **Guardrail:** polish
- **Screenshot:** none (offline join state not in the baseline inventory; read from `join.ts:82` and `JoinScreen.tsx:150`)

### COPY-G1-14: Goodbye says "מהשרת"

- **Screen and state:** `/names/goodbye`
- **Browser:** all three
- **What's wrong:** "כל הבחירות שלך נמחקו מהשרת ומהמכשיר הזה." uses the system word "השרת" in the app's only farewell. The rest of the app never mentions a server. Settings' delete dialog (G3) should be checked for the same word.
- **Rule it breaks:** `ux-writing` · `SKILL.md` Common Mistakes · "System-oriented language vs. user language"; Clarity · "Avoid jargon … technical terms"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `src/lib/names/accountDeletion.ts`: `DELETED_LEAD` = "כל הבחירות שלך נמחקו מ־Nest ומהמכשיר הזה." (same scope: the account's data and this device). Update the test.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/COPY-G1/goodbye-default-webkit.png`, `goodbye-default-sim.png`
