# PRD: Name swiper PWA ("בחירת שם" at nestjourney.app/names), autonomous build + QA run

## 1. Introduction

The landing page's name swipe demo turned out to be the most convincing thing Nest has. The owner decided on 2026-11-04 to pause the Nest app for about a week and ship the name swiper as a full, installable web app (PWA) at **https://nestjourney.app/names**, so people start using Nest before the app is in the stores. Everyone who signs up is already a Nest user: the swiper uses the same Supabase backend, the same spaces and the same `name_votes` table as the app.

This file is the **Ralph run** that builds the whole PWA without a human in the loop: sign-in (Google, SMS code, email code), the swipe experience at full parity with the landing demo and the E16 design, lists, matches with a partner by invite link, the duel, offline use, installability, account deletion, legal pages, and then up to 3 QA → fix cycles.

What lives where:

| What | Where |
|---|---|
| This PRD (scope, decisions, rules, QA) | `tasks/prd-names-pwa.md` |
| Stories (machine-readable) | `scripts/ralph/prd-names-pwa.json`, installed as `scripts/ralph/prd.json` by `scripts/ralph/run-names-pwa.sh` |
| Ralph's per-iteration prompt | `scripts/ralph/CLAUDE.md` |
| Accounts, settings, secrets (owner runbook) | [`docs/names-pwa/SETUP.md`](../docs/names-pwa/SETUP.md) |
| Product spec for the card, deck, lists, duel, data rules | [`docs/names-pwa/E16-name-swipe-spec.md`](../docs/names-pwa/E16-name-swipe-spec.md) (the "E16 spec", copied from the app repo) |
| Design boards (PNG + HTML source) | `docs/names-pwa/design/screens/*.png`, `docs/names-pwa/design/source/*.dc.html` |
| Brand book and tokens | `docs/names-pwa/brand/BRAND.md`, `docs/names-pwa/brand/tokens.json`, logos in `docs/names-pwa/brand/svg` and `png` |
| Names data | `data/names/names.json` (19,884 CBS names), `data/names/name-content.json` (10 sample cards) |
| Landing demo (parity reference) | `src/lib/pregnancy-names-demo.mjs` |
| Backend migration | `kirilreznik/pregnancy-manager` `supabase/migrations/0009_names_pwa.sql` (applied by the owner, SETUP §2) |

**Sources of truth, in order:** this PRD's decisions (§3) → the E16 spec (behaviour, copy, data rules) → the design boards (look) → the landing demo (interaction details the boards don't show). Where they disagree, the earlier one wins and the story's `notes` say so.

Ralph has no claude.ai login and can't open canvas or artifact links. Everything it needs is in this repo.

## 2. Goals

- A signed-in, installable PWA at `/names` that does everything the landing demo does, plus everything in the E16 spec that makes sense on the web: the 10 sample names with full cards, keep / love / skip / undo, filters, backgrounds (including the user's own photo), lists, hidden names, adding a name, partner matches, duel, "על הנתונים".
- Sign-in with Google, a 6-digit SMS code (Supabase + Twilio Verify) or a 6-digit email code (Supabase + Resend SMTP). Then a short onboarding: a display name, 18+ confirmation, terms and privacy consent, an optional opt-in for Nest launch updates. **Never a due date** (owner, 2026-11-04).
- Solo works fully. A partner joins by invite link, and a name both kept becomes a match. Nobody ever sees another person's skips.
- Works offline after the first visit: swiping, lists and the duel; votes sync when back online.
- Nest design system (ink, peach, clay, Heebo, liquid glass), Hebrew only, RTL, gender-neutral copy, WCAG AA.
- The code reads every name that has a content entry, so populating more names later (E16b, a separate task) only swaps `data/names/name-content.json`.
- After the build, up to 3 QA → fix cycles. The run stops after the 3rd fix pass even if bugs remain, and leaves an honest summary.

## 3. Decisions

### 3.1 Owner decisions (don't reopen)

1. **Where:** repo `kirilreznik/ken` (this repo), which holds only the landing page and the swiper. Route `/names`, installable with its own manifest and service worker scoped to `/names/`. The landing stays at `/` (and `/pregnancy`). `public/sw.js` stays as it is: it's a self-removing worker that clears the old Ken PWA off phones; the swiper's worker is a different file.
2. **Backend:** the shared Nest Supabase project "Nest (EU)", ref `hkoumskvmkqqnwhnizbq`, Frankfurt. Tables `spaces`, `space_members`, `space_invites`, `name_votes`; RPCs `name_matches`, and from migration 0009 `names_space`, `names_invite`, `names_join`, `prepare_account_deletion`.
3. **Sign-in:** Google; SMS code via Supabase's Twilio Verify provider; email code via Supabase with Resend SMTP. The owner creates the accounts (SETUP.md).
4. **No due date, ever.** The swiper never asks for one, at sign-in or anywhere else. A swiper user's space has `due_date = null`.
5. **Partner matching by invite link.** Nobody sees a partner's skips (E16 privacy rule).
6. **Deck = the 10 names with content.** Populating all names is a separate task (E16b).
7. **Names data ships as static files** with the app and is cached for offline use. Only votes, matches and invites go to the database.
8. **Hebrew only.** Gender-neutral positioning: for whoever manages the pregnancy, alone or with someone. 18+ confirmation. Privacy policy and terms before public sign-ups.
9. Full parity with the landing demo, in the Nest design.

### 3.2 Decisions made for this run (resolve gaps; change only by editing this PRD)

1. **Sign-in comes first.** `/names` without a session goes to `/names/welcome`. The welcome screen shows a preview card (a static, non-interactive זיו card) so people see what they get. Anonymous swiping is the landing demo's job.
2. **Sign-ups switch is Supabase's.** The dashboard toggle "Allow new users to sign up" stays off until the legal review (SETUP §3.3). When a new person tries to sign in while it's off, Supabase answers `signups not allowed` / `Signups not allowed for otp`; the PWA shows "ההרשמה עוד לא פתוחה. אפשר להשאיר אימייל בעמוד הבית ונעדכן כשנפתח." with a link to `/#waitlist`. Existing accounts sign in normally.
3. **Pure client-side app.** Pages under `/names` are client components; `@supabase/supabase-js` runs in the browser with `flowType: 'pkce'`, `persistSession: true`, `detectSessionInUrl: true`, storage `localStorage`, storage key `nest-names-auth`. No SSR auth, no `@supabase/ssr`. The only server code is `/api/names/account` (account deletion, needs the secret key) and the manifest route.
4. **Spaces:** on every start after sign-in, call `names_space(display_name)`. It returns the active space (the membership joined last) or creates a names space. All votes use that space id. Joining by invite calls `names_join(code, display_name)`, which moves the joiner's solo votes into the shared space.
5. **Invite link format:** `https://nestjourney.app/names/join/{CODE}` (8 characters, from `names_invite()`). Shared with the Web Share API when available, otherwise copied to the clipboard. Valid 7 days, single use. Opening it signed out stores the code in `sessionStorage` (`nest-names-join`) and in the OAuth `redirectTo` query, then completes the join after sign-in and onboarding.
6. **Members limit:** no limit (E16 allows 3+ members; matches show "{n} שמרו").
7. **Leaving a shared space is not in this run** (it deletes that person's votes by design). Account deletion is in.
8. **Local preferences** (surname, filters, background, intro seen, seen matches, duel state) live in `localStorage` under `nest-names:{userId}:{key}`, per device, like E16 keeps them in AsyncStorage. The user's own background photo lives in IndexedDB as a resized Blob, never uploaded.
9. **Votes:** read from `name_votes` (own rows only, RLS), cached in IndexedDB, written through an outbox in IndexedDB that flushes in order on `online`, on focus and every 30 s. Upsert on `(space_id, user_id, name)`. Undo of a first vote deletes the row. Latest write wins. Realtime subscription on own `name_votes` rows for multi-device sync.
10. **Matches:** `rpc('name_matches', { p_space })`, refetched on focus, on any own vote change, and every 60 s while the swipe or lists screen is visible. A new match (not in `seen matches`) shows the one-time match sheet (board 4).
11. **Routes** (all under `src/app/names/`): `page.tsx` (swipe), `welcome`, `sign-in/phone`, `sign-in/email`, `auth/callback`, `onboarding`, `intro`, `lists` (segments via `?tab=saved|matches|duel`), `hidden`, `invite`, `join/[code]`, `settings`, `about`, `privacy`, `terms`. The filters, background, about, match and report views are **sheets** over the current screen, opened with a `?sheet=` search param so the browser Back button closes them; `about` also exists as a full page for direct links.
12. **Swipe direction** follows the layout, as in the demo: in RTL, "שמירה" is the right-most action, so a drag toward the right keeps and toward the left skips. Compute it from the keep button's position, not a constant. Swipe up = "אהבתי מאוד". Buttons stay the primary path.
13. **Hiding a name (E16 FR-11):** long-press (500 ms) or right-click on "דילוג" opens a small menu with "דילוג ולא להציג שוב"; the "שמרתי" row menu has "לא להציג יותר"; the filters sheet's "שמות שהסתרתי ({n})" opens `/names/hidden`.
14. **Quick chips** on the swipe screen, as in the demo and board 2: "כל השמות", "מתאים לכולם", "בת", "בן". They set the sex filter; the rest is in the filters sheet.
15. **Background "תמונה משלי"** uses `<input type="file" accept="image/*">` (no `capture`), resizes to 1,200 px on the long side with a canvas, stores a JPEG Blob in IndexedDB. Legibility: stronger glass plus a scrim, and the average luminance of the area under the card (canvas) raises the scrim for dark photos. Text never switches to white.
16. **Reduce transparency:** `@media (prefers-reduced-transparency: reduce)` and browsers without `backdrop-filter` support both get solid white cards.
17. **Reduced motion:** `@media (prefers-reduced-motion: reduce)`: no fling, the next card fades in (as the demo does).
18. **Report a mistake (E16 FR-14):** POST to `{SUPABASE_URL}/functions/v1/client-log` with `{ area: 'names-report', name, message, path, appVersion }`; no user id, no email, no phone. `client-log` is deployed on the EU project.
19. **Analytics:** the existing Vercel Analytics (page views only, no personal data, no custom events). `/names` app pages send no query strings to analytics (they may contain invite codes): use the `beforeSend` hook to strip them.
20. **Indexing:** `/names/welcome`, `/names/privacy`, `/names/terms` and `/names/about` are indexable; every other `/names` route has `robots: noindex`.
21. **Copy for the landing:** the demo gets a link to the real app ("לבחירת שם עם שמירה והתאמות" → `/names`), and the end-of-deck state in the demo links there too. The demo itself stays anonymous and unchanged otherwise.

## 4. Before the run (owner)

All of [`docs/names-pwa/SETUP.md`](../docs/names-pwa/SETUP.md) steps 1 to 10. In short: merge ken PR #5 and this PR; apply migration 0009 to the EU project; Supabase URL config, email code templates, sign-ups switch off, test phone numbers; Google OAuth client; Twilio Verify; Resend + DNS; Supabase SMTP; Vercel variables; `.env.local` and `scripts/ralph/.env.test.local` on the Mac. Then:

```
./scripts/ralph/run-names-pwa.sh        # 140 iterations; run it again to resume
```

US-000 checks all of this first and stops the run with a clear list if anything is missing.

## 5. Environment variables

| Name | Where | Used by |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel, `.env.local` | browser client, `client-log` URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel, `.env.local` | browser client (publishable key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (Sensitive), `.env.local` | `/api/names/account` only. Never imported by client code |
| `NEXT_PUBLIC_SITE_URL` | Vercel Production, `.env.local` | absolute invite links, OAuth `redirectTo`; falls back to `window.location.origin` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Vercel, optional | renders Turnstile on sign-in and passes `captchaToken` when set |
| `PREGNANCY_OPERATOR_NAME`, `PREGNANCY_CONTACT_EMAIL` | Vercel, `.env.local` | legal pages (server-rendered into the static pages at build) |
| `NAMES_QA_*` | `scripts/ralph/.env.test.local` | Ralph's QA only (SETUP §10) |

A missing `NEXT_PUBLIC_SUPABASE_*` must not break `npm run build` or the landing page: `/names` then shows "השירות לא מוגדר" and nothing else.

## 6. Backend

Already in the database (0001–0008, plus 0009 from SETUP §2). Ralph never applies or edits migrations and never changes Supabase settings. If a story needs a database change, it writes the SQL into `docs/names-pwa/backend-requests.md` with the reason, marks the story's dependent part `blocked` in `notes`, and moves on.

| Object | Use in the PWA |
|---|---|
| `names_space(p_display_name text) → uuid` | after sign-in and onboarding, every start |
| `names_invite() → (code, expires_at)` | invite screen |
| `names_join(p_code text, p_display_name text) → uuid` | join screen; error `invalid_code` |
| `name_votes` (`id, space_id, user_id, name, vote in keep/love/skip/hidden, custom, created_at, updated_at`, unique `(space_id, user_id, name)`) | own votes, RLS: own rows only. Realtime enabled |
| `name_matches(p_space uuid) → (name, kept_by_count, loved_by_count, matched_at)` | matches; never returns skips |
| `space_members` (`space_id, user_id, display_name, joined_at, role`) | member count (shared copy, "התאמות" segment visibility), member names in settings. Members can read members of their space |
| `prepare_account_deletion(p_user uuid)` | service role only, from `/api/names/account` |
| Auth user metadata | onboarding writes `user_metadata`: `display_name`, `age_confirmed_at`, `terms_version`, `privacy_version`, `terms_accepted_at`, `updates_opt_in` (boolean), `updates_opt_in_at`, `signup_source: 'names-pwa'` via `supabase.auth.updateUser({ data })` |

**Account deletion** (`DELETE /api/names/account`, Route Handler, Node runtime): reads `Authorization: Bearer <access token>`, verifies it with the service client's `auth.getUser(token)`, calls `rpc('prepare_account_deletion', { p_user })`, then `auth.admin.deleteUser(userId)`. Returns 204, or 401 for a bad token, 500 with no detail on failure. Rate-limit: one call per user per minute (in-memory is enough). The client then signs out and clears `nest-names:*` localStorage keys and the IndexedDB databases.

## 7. Functional requirements

Copy is Hebrew, gender-neutral and explicit ("שליחת קוד", not "המשך"). Every requirement here also follows the E16 spec where it says "as E16".

### Sign-in and onboarding

- **FR-W1 Welcome** (`/names/welcome`): the Nest wordmark (`docs/names-pwa/brand/svg/nest-wordmark.svg`, copied to `public/names/`), the title "בחירת שם", a one-line pitch ("שם אחד בכל פעם, עם מספרים אמיתיים מהלמ"ס. לבד או ביחד."), a static preview card of זיו on the fabric background, and three buttons: "כניסה עם Google", "כניסה עם קוד ב־SMS", "כניסה עם קוד במייל". Below: "בהמשך מאשרים את תנאי השימוש ומדיניות הפרטיות" with links. On the fabric photo with the liquid-glass look.
- **FR-W2 Google:** `signInWithOAuth({ provider: 'google', options: { redirectTo: {origin}/names/auth/callback[?join=CODE] } })`. `/names/auth/callback` waits for the session (PKCE exchange), shows a calm loading state, then routes on (FR-W6). An error in the URL (`error_description`) shows "הכניסה עם Google לא הצליחה" with "חזרה לכניסה".
- **FR-W3 SMS code** (`/names/sign-in/phone`): step 1, a phone field labelled "מספר טלפון נייד", `inputmode="tel"`, `autocomplete="tel"`, LTR digits inside an RTL layout. Accepts Israeli mobile numbers as typed (`050-1234567`, `0501234567`, `+972 50 123 4567`) and normalises to E.164 `+9725XXXXXXXX`; other formats get "צריך מספר נייד ישראלי, למשל 050-1234567". Button "שליחת קוד". Calls `signInWithOtp({ phone, options: { channel: 'sms', captchaToken? } })`. Step 2, "הקוד נשלח ל־{masked number}", a 6-digit code field (`inputmode="numeric"`, `autocomplete="one-time-code"`, auto-submit on 6 digits), button "כניסה". `verifyOtp({ phone, token, type: 'sms' })`. "שליחה חוזרת" enabled after a 60 s countdown that is shown in words. "שינוי מספר" goes back.
- **FR-W4 Email code** (`/names/sign-in/email`): same two steps with an email field (`autocomplete="email"`, LTR), `signInWithOtp({ email, options: { shouldCreateUser: true, captchaToken? } })` and `verifyOtp({ email, token, type: 'email' })`. Copy: "שלחנו קוד בן 6 ספרות ל־{email}. אפשר לבדוק גם בתיקיית הספאם."
- **FR-W5 Errors** map Supabase errors to Hebrew, never show raw English: wrong or expired code ("הקוד לא נכון או שפג תוקפו. אפשר לבקש קוד חדש."), rate limit ("נשלחו יותר מדי קודים. אפשר לנסות שוב בעוד כמה דקות."), sign-ups closed (§3.2.2), network ("אין חיבור לאינטרנט. הכניסה צריכה חיבור."), anything else ("משהו השתבש. אפשר לנסות שוב.") plus a `client-log` report without personal data.
- **FR-W6 Routing after sign-in:** if `user_metadata.terms_accepted_at` is missing → `/names/onboarding`; else if a join code is pending → `/names/join/{code}`; else if intro not seen on this device → `/names/intro`; else `/names`.
- **FR-W7 Onboarding** (`/names/onboarding`), one screen, no due date:
  - "איך לקרוא לך?" (display name, required, 1–40 characters, prefilled from Google's `full_name`/`name` first word when present). Shown to a partner in the shared space. RTL input rules (§8).
  - Checkbox, required: "אני בן/בת 18 ומעלה".
  - Checkbox, required: "קראתי ואני מסכים/ה ל[תנאי השימוש] ול[מדיניות הפרטיות]" (links open in a new tab).
  - Checkbox, optional, unchecked by default: "אשמח לקבל עדכון כש־Nest יוצאת לחנויות" (separate marketing consent, Israeli anti-spam law).
  - Button "התחלת בחירה", disabled until the required fields are valid; disabled state is announced.
  - Saves metadata (§6), calls `names_space(display_name)`, then routes as FR-W6. Someone under 18 can't continue: unchecking is allowed, and there's a line "השירות מיועד לבני 18 ומעלה."
- **FR-W8 Session:** a session persists across restarts. If the refresh token is rejected, sign out locally and go to welcome with "צריך להיכנס שוב". Sign-out is in settings.

### Swipe and cards (parity with the demo + E16)

- **FR-W9 Intro** (`/names/intro`): E16 FR-3 and FR-4 and board 1: what the cards show, numbers are births from CBS, likes are private; the shared line only when the space has 2+ members; optional surname ("שם משפחה, לא חובה"), stored on the device only; "התחלת בחירה". Shown once per device per user.
- **FR-W10 Swipe screen** (`/names`): board 2 (no background) and boards 8–10 (photos), and the demo's layout: header with "בחירת שם", the background button (aria-label "בחירת רקע"), a settings/menu button, and the "השמות שלי" pill with the saved count (ink). Quick chips (§3.2.14). The card stack with two peeking cards (−3°, +2°) showing the next names. Actions: "שמירה" (ink pill), "אהבתי מאוד" (peach circle), "דילוג" (glass pill). Footer: "ביטול" (undo) and a polite live status line ("זיו נשמר", "דילגת על יעל", "בוטל: נועם"). Swipe stamps "שמירה"/"דילוג"/"אהבתי מאוד" while dragging. Desktop: the screen is a centered column of max 480 px over the full-width canvas or photo. Focus order: header → chips → card → actions → footer. Keyboard shortcuts are in FR-W11.
- **FR-W11 Gestures and keys:** pointer drag (mouse, touch, pen) with the demo's thresholds (|dx| > 100 px, or > 40 px with velocity > 0.6 px/ms; vertical up > 100 px = love); a short drag snaps back. Keyboard, when focus is in the swipe area: `Enter` on a focused button activates it; shortcuts `K` keep, `L` love, `S` skip, `Z` or `Backspace` undo, listed in an `aria-describedby` hint ("קיצורי מקלדת: K שמירה, L אהבתי מאוד, S דילוג, Z ביטול"). Vertical scrolling inside a long card still works (`touch-action: pan-y`, as the demo).
- **FR-W12 Card content:** exactly E16 FR-5, FR-5a, FR-5b and the demo's `cardInner`: sex tag and "שם {n} מתוך {total}" position (the demo's wording; E16's "שם {n} היום" is not used), the name with niqqud, full name with surname when set, intro, "מהתנ״ך" well with book icon, "אנשים ידועים בשם הזה" (up to 2, initial avatar), the boys/girls bar (boys `ink`, girls `peach`, labels with "פחות מ־1%"/"מעל 99%"), and two tiles: births in the latest year with the popularity band, and the 2000–2024 trend sparkline with its word and arrow. Empty sections are hidden. Each card is an `article` whose `aria-label` is "{name}, {sex tag}, {intro}, ניתן ל־{n} תינוקות ב־{year}, {trend}" (E16 acceptance #5).
- **FR-W13 Derived values** come from `data/names/names.json` with the E16 §2 rules (sex tag ≥ 90% and the 200-birth rule, band by 2024 rank, trend ±25% comparing the last 3 years with the 3 years five years earlier), computed in `src/lib/names/` with unit tests. The demo's hard-coded `band`/`trend` values are a cross-check: the computed values must equal them for all 10 names, or the story notes the difference and which rule produced it.
- **FR-W14 Deck:** the names that have a content entry, shuffled with a seeded PRNG (seed = hash of user id), stable for the user and different between users; excludes decided and hidden names; respects filters. Empty filter → "אין שמות שמתאימים לסינון הזה" + "איפוס סינון". All decided → "עברת על כל השמות. בקרוב יתווספו עוד." with "לשמות שלי" and, when the space has one member, "להזמין מישהו לבחור ביחד".
- **FR-W15 Votes:** keep, love (counts as keep, ranks first), skip, hidden. Undo up to 10 back (E16 FR-7), undo of a vote that existed before restores the previous vote. Optimistic UI; offline goes to the outbox (§3.2.9).
- **FR-W16 Filters sheet** (board 3, E16 FR-10): sex tag, popularity, trend, first letter, length, origin by sector ("נפוץ בקרב: יהודים · מוסלמים · נוצרים · דרוזים", default all), the live count on the apply button ("הצגת {n} שמות"), "איפוס", and "שמות שהסתרתי ({n})". Persisted per user on the device.
- **FR-W17 Backgrounds sheet** (board 11, E16 FR-8a–8e with §3.2.15–16): "ללא רקע", "בדים" (default), "מחברת", "חדר תינוק", "תמונה משלי". Current choice ringed in ink with a check and "נבחר". Applies to swipe, intro and match views. Photos: `public/landing/names-fabric.webp`, `names-notebook.webp`, `names-nursery.webp` (already in the repo). A missing own-photo Blob falls back to "בדים".

### Lists, matches, duel

- **FR-W18 "השמות שלי"** (`/names/lists`, board 5): segments "שמרתי", "התאמות" (only when the space has 2+ members), "דו־קרב". "שמרתי": loved first with "אהבו מאוד", each row with sex tag, count and trend word; row menu "הסרה מהרשימה" (deletes the vote, the deck offers it again) and "לא להציג יותר" (vote = hidden). "הוספת שם" (E16 FR-12): Hebrew letters (and ׳ ״ - and spaces inside), 1–20 characters; a name in `names.json` is treated as the data name; a duplicate shows "כבר ברשימה"; a new name is saved with `custom = true`, no count, no intro.
- **FR-W19 "התאמות":** from `name_matches`, newest first, "{n} שמרו" when n ≥ 3, a heart marker when `loved_by_count > 0` ("מישהו אהב מאוד", never who). No partner skip state anywhere.
- **FR-W20 Match sheet** (board 4): "יש התאמה: {name}" in ink, no green, no confetti, with "לרשימת ההתאמות" and "להמשיך לבחור". Once per name per device.
- **FR-W21 Duel** (`/names/lists?tab=duel`, board 6, E16 FR-13): from "שמרתי", or from "התאמות" when it has 2+ names (a toggle). "סיבוב X מתוך Y", progress bar, pick one of two (big buttons whose label is the name), ends in a ranked top 5 (or fewer). "עצירה, אפשר להמשיך אחר כך" saves; reopening resumes. Fewer than 2 names → an explanation and a link to the swipe screen.
- **FR-W22 Hidden names** (`/names/hidden`): the list with "החזרה" per row (deletes the hidden vote).

### Sharing

- **FR-W23 Invite** (`/names/invite`, reachable from the lists header, the end-of-deck state and settings): copy "בוחרים שם ביחד? שולחים קישור, וכל אחד מחליק אצלו. שם ששניכם שמרתם יופיע בהתאמות. אף אחד לא רואה על מה השני דילג." Button "שליחת קישור הזמנה" (Web Share API: title "בחירת שם ב־Nest", text "בואו לבחור שם ביחד", url) and "העתקת הקישור" (clipboard, then "הקישור הועתק"). Shows the expiry ("בתוקף עד {date}") and that it works once. Below it, the members list: the display names of everyone in the space, the user's own shown as "{name} (אני)".
- **FR-W24 Join** (`/names/join/[code]`): signed out → store the code (§3.2.5) and show "קיבלת הזמנה לבחור שם ביחד ב־Nest" with the three sign-in buttons. Signed in → after onboarding, call `names_join`. Success: "הצטרפת. מעכשיו שמות ששניכם שמרתם יופיעו בהתאמות." and "להתחיל לבחור". `invalid_code` → "הקישור כבר לא בתוקף. אפשר לבקש קישור חדש." If the user has votes in their own names space, a line says they move with them ("השמות ששמרת עוברים איתך").

### App shell

- **FR-W25 Settings** (`/names/settings`): display name (editable; saves to the user's own `space_members` row, which RLS "member updates self" allows, and to `user_metadata.display_name`), the sign-in method shown (masked phone or email, or "Google"), the updates opt-in toggle, "הזמנת מישהו לבחור ביחד", "על הנתונים", "התקנה למסך הבית" (FR-W27), "תנאי שימוש", "מדיניות פרטיות", "יציאה מהחשבון", "מחיקת החשבון". Delete asks to confirm in a dialog ("מחיקת החשבון תמחק את כל הבחירות שלך. אם יש מרחב משותף, הוא נשאר אצל מי שהוזמן/ה." / buttons "מחיקה לצמיתות" and "ביטול"), then `/api/names/account`, then a goodbye screen.
- **FR-W26 Manifest** (`/names/manifest.webmanifest`, linked from the `/names` layout): `name` "Nest · בחירת שם", `short_name` "בחירת שם", `lang` "he", `dir` "rtl", `start_url` "/names?source=pwa", `scope` "/names/", `id` "/names/", `display` "standalone", `background_color` and `theme_color` from tokens (canvas), icons 192 and 512 (`any`) from `docs/names-pwa/brand/png/icon-192.png`, `icon-512.png` and a 512 `maskable` built from `android-adaptive-foreground` on `peach-soft`, copied into `public/names/icons/`. `apple-touch-icon` 180 and `appleWebApp` metadata (`capable`, title "בחירת שם", status bar `default`).
- **FR-W27 Install:** Android/desktop Chrome: catch `beforeinstallprompt` and show "התקנה למסך הבית" in settings and once, dismissible, on the lists screen after the 5th vote. iOS Safari (not standalone): the same entry opens a sheet with the steps "לוחצים על כפתור השיתוף ואז על 'הוספה למסך הבית'" and an icon. Never shown when already standalone (`display-mode: standalone` or `navigator.standalone`).
- **FR-W28 Service worker** (`public/names/sw.js`, registered from the `/names` layout with `scope: '/names/'` in production builds only): precache on install the app shell routes (`/names`, `/names/welcome`, `/names/lists`, `/names/intro`), the names data files, the 3 background photos, the Heebo fonts and icons; cache-first for `/_next/static/*`, `/landing/*`, `/names/data/*`, fonts and icons; network-first with cache fallback for `/names*` navigations; never cache `/api/*`, Supabase requests or `/names/auth/callback`. Versioned cache names with old caches deleted on `activate`. An "עדכון זמין" toast with "רענון" when a new worker is waiting. `public/sw.js` stays untouched.
- **FR-W29 Offline:** with no network after one online visit: the app opens, swiping works, votes queue (a small "לא מחובר · {n} בחירות ממתינות לסנכרון" status in the footer), lists and duel work from cache, matches show the last list with "עודכן לאחרונה {time}". Sign-in screens say a connection is needed. Back online, the outbox flushes and the status clears.
- **FR-W30 About the data** (sheet and `/names/about`, board 7, E16 FR-14): CBS attribution (release 391/2025, the file `11_25_391t1.xlsx`, years 1949–2024, access date 2026-11-03, links to the data file and the licence, no suggestion of endorsement), the 5-births threshold, "ההסברים נכתבו בעזרת בינה מלאכותית ועשויים להכיל טעויות", known people from Wikidata, and "יש טעות? אפשר לדווח" opening the report sheet (§3.2.18) with "דיווח על טעות בשם {name}", a text area and "שליחת דיווח", then "תודה, הדיווח נשלח".
- **FR-W31 Legal pages** (`/names/privacy`, `/names/terms`): server-rendered static pages from `src/content/names-legal/privacy.ts` and `terms.ts`, Hebrew, with a "טיוטה, ממתינה לבדיקה משפטית" banner while `LEGAL_DRAFT = true`. The privacy draft states only facts from this PRD: what is collected (phone or email, Google name and email for Google sign-in, display name, name votes, invite usage, consent timestamps, technical logs), what stays on the device (surname, own photo, filters, background), processors and regions (Supabase EU Frankfurt, Vercel, Twilio, Resend EU, Google, Cloudflare Turnstile when enabled), purpose, retention (until account deletion; logs per provider), rights (access, correction, deletion via settings or `PREGNANCY_CONTACT_EMAIL`), 18+, no sale of data, no medical advice. Terms: the service is general information, no medical advice, CBS data attribution, AI-written intros may be wrong, acceptable use, account deletion, operator name and contact from env. No invented legal claims, company numbers or addresses.
- **FR-W32 Landing links** (§3.2.21): in `src/lib/pregnancy-names-demo.mjs`, the side note and the end-of-deck state get a link to `/names`; tests in `tests/pregnancy-landing.test.ts` updated. Nothing else on the landing changes.
- **FR-W33 Unconfigured and error states:** missing env → "השירות לא מוגדר" (§5). A render error under `/names` → a Hebrew error boundary with "ניסיון חוזר" and a `client-log` report. 404 under `/names` → "העמוד לא נמצא" with "לבחירת שם".

## 8. Rules for every story

These hold for every build story and are not repeated in each story's criteria.

- **Next.js 16 has changed. Don't code from memory.** Before using a Next.js API (route handlers, metadata, `manifest`, `viewport`, layouts, client components, `useSearchParams` + Suspense, `next/font`), read the matching guide in `node_modules/next/dist/docs/` if it exists, otherwise https://nextjs.org/docs. Same for `@supabase/supabase-js` v2 auth (https://supabase.com/docs/reference/javascript/auth-signinwithotp etc.).
- Routes under `src/app/names/`; non-route code in `src/lib/names/` (pure logic, data, Supabase, storage), `src/components/names/` (UI) and `src/content/names-legal/`. Don't touch the landing except FR-W32.
- **Design tokens only.** `src/styles/nest-tokens.css` (US-005) defines every color, radius, shadow, blur and type size from `docs/names-pwa/brand/tokens.json` as CSS variables and Tailwind 4 `@theme` values. No hex, rgb or pixel font size anywhere else in names code (the glass alpha values live in the tokens file too). Fonts: Heebo 500/700/800 self-hosted from `public/landing/heebo-*.woff2`.
- **RTL-first:** `dir="rtl"` from the root layout; logical properties only (`margin-inline-start`, `ps-*`/`pe-*`, `start-*`/`end-*`, `inset-inline`), never `left`/`right` or `ml`/`mr`/`pl`/`pr`. Mirror only directional icons (back chevron, trend arrows); the heart, bookmark, image and logo never mirror. LTR runs (phone numbers, emails, codes, invite links) in `<bdi>` or `dir="ltr"` spans.
- **Hebrew inputs:** `dir="rtl"` + `text-align: start`; phone, email and code inputs are `dir="ltr"`. Never prefill a made-up value.
- **Accessibility (WCAG 2.1 AA):** touch targets ≥ 44 × 44 px; every icon-only control has a Hebrew `aria-label`; visible focus ring (ink, 2 px, offset); status never by color alone; live regions for status changes; dialogs and sheets trap focus, close on Escape and Back, and return focus; contrast ≥ 4.5:1 for text.
- **Copy:** gender-neutral Hebrew (infinitives, nouns, "אפשר…"; slashes only in labels and checkboxes), explicit action labels, no exclamation marks in system messages, no medical advice, demo data never presented as real (the 10 cards are real data plus reviewed sample content, not demo data).
- **Privacy:** never log, report or send to analytics a phone number, email, display name, surname, photo or vote. Surname and own photo never leave the device.
- **Dependencies:** allowed without asking: `@playwright/test` (dev), `idb-keyval`. Anything else needs a line in `progress.txt` saying why, and must be small and maintained. No UI kit, no state library, no PWA plugin (write the worker by hand).
- **Checks:** every story ends with `npm run lint` (0 errors), `npx tsc --noEmit`, `npm test` and `npm run build` green. Logic goes in `src/lib/names/` with Vitest tests in `tests/names/`.
- **UI stories** also need the browser check (§10) against the named board(s) and the demo.
- **Commits:** build stories commit once each when done, `feat(names): …`, `test(names): …`, `docs(names): …`, `chore(names): …`. QA stories never commit. FIX stories commit once per cycle. Never `git stash`, `git clean`, `git checkout .` or `git reset --hard`.
- **Never** change Supabase or Vercel settings, apply SQL, push to `main`, or deploy. Ralph works on branch `ralph/names-pwa` and pushes it.

## 9. Story order

Always pick the `passes: false` story with the lowest `priority`. Summary (criteria are in the JSON):

1. **Gate:** US-000 checks every prerequisite (env files, Supabase reachable, migration 0009 present, test phone sign-in works for QA users 1–3, Google provider redirect, email code send to the sink, Playwright runs). It stops the run with a list of missing items instead of continuing.
2. **Setup:** US-001 branch, baseline; US-002 Playwright + QA folders + helper scripts; US-003 names layout shell; US-004 copy brand assets; US-005 tokens; US-006 fonts and base styles.
3. **Domain logic (pure, tested):** US-007 types and data loading; US-008 sex tag and percentages; US-009 popularity and trend; US-010 data build step (hashed static files); US-011 filters; US-012 deck; US-013 vote model and undo; US-014 duel engine; US-015 accessibility strings; US-016 custom name validation; US-017 phone and email validation; US-018 local prefs store.
4. **Supabase and data:** US-019 client and env guard; US-020 auth state and route guard; US-021 space bootstrap; US-022 votes cache + outbox; US-023 realtime and matches.
5. **Sign-in and onboarding:** US-024 shared auth UI parts (incl. Turnstile hook); US-025 welcome; US-026 Google; US-027 phone code; US-028 email code; US-029 error mapping; US-030 onboarding; US-031 post-sign-in routing.
6. **Glass primitives:** US-032 glass surfaces and buttons; US-033 sheet and dialog; US-034 screen background.
7. **Card:** US-035 card header and name; US-036 Bible and people; US-037 boys/girls bar; US-038 stat tiles + sparkline; US-039 card assembly; US-040 stack; US-041 action bar.
8. **Swipe screen:** US-042 header + chips; US-043 drag gesture; US-044 keyboard and reduced motion; US-045 wiring votes/undo/status; US-046 hide flow; US-047 empty and end states.
9. **Other screens:** US-048 intro; US-049 backgrounds sheet; US-050 own photo; US-051 filters sheet; US-052 hidden list; US-053 lists "שמרתי" + add name; US-054 matches + match sheet; US-055 duel; US-056 invite; US-057 join; US-058 settings; US-059 account deletion API; US-060 account deletion UI; US-061 about + report; US-062 legal pages.
10. **PWA:** US-063 manifest + icons; US-064 service worker; US-065 offline UX + update toast; US-066 install prompts.
11. **Polish:** US-067 landing links; US-068 metadata, robots, errors, 404; US-069 analytics privacy; US-070 accessibility audit; US-071 RTL + tokens audit; US-072 performance pass; US-073 docs; US-074 full regression + smoke walkthrough.
12. **QA:** US-QA0, then cycle 1 (12 stories A–L) → US-FIX1 → cycle 2 → US-FIX2 → cycle 3 → US-FIX3 → US-FINAL.

## 10. Browser check (UI stories)

Ralph verifies in a real browser with Playwright (Chromium), not by reading code.

1. Run the app: `npm run dev` on port 3000 if `curl -s localhost:3000/names/welcome` doesn't answer; leave it running between stories. For service worker stories use `npm run build && npm run start -- -p 3100`, because the worker registers only in production builds.
2. Sign in as a QA user without the UI using `scripts/ralph/qa/names-pwa/login.mjs <1|2|3>` (US-002): it signs in through the Supabase REST API with the test phone number and fixed code from `.env.test.local`, and writes a Playwright `storageState` with the session under the `nest-names-auth` key. Sign-in screens themselves are tested through the UI with the same test numbers.
3. Take screenshots with `scripts/ralph/qa/names-pwa/shot.mjs <path> <out.png> [--state 1] [--bg fabric] [--viewport 390x844]`: iPhone-size viewport 390 × 844 at device scale factor 2, `locale: 'he-IL'`, `timezoneId: 'Asia/Jerusalem'`. Also check desktop 1280 × 800 for layout stories. Screenshots go to `scripts/ralph/qa/names-pwa/shots/` (gitignored).
4. Look at the screenshot (read the PNG) next to the board PNG in `docs/names-pwa/design/screens/` and the matching `.dc.html` (exact sizes, colors, radii, copy). Check layout, spacing, colors, radii, glass, copy, and which side things are on in RTL. Interactions (drag, tap, keyboard) are scripted with Playwright's `page.mouse`, `page.touchscreen` and `page.keyboard`.
5. Fix differences and repeat until it matches. Not on "close enough". A deliberate difference from §3 goes in the story's `notes`.
6. Accessibility: run `@axe-core/playwright` if installed (allowed as a dev dependency) or Playwright's `page.accessibility.snapshot()` and check labels and roles.

Board ↔ screen:

| Board | PNG | Source | Screen |
|---|---|---|---|
| 1 | `01-intro.png` | `Intro.dc.html` | `/names/intro` |
| 2 | `02-main.png` | `Main.dc.html` | `/names`, background "ללא רקע" |
| 3 | `03-filters.png` | `Filters.dc.html` | `/names?sheet=filters` |
| 4 | `04-match.png` | `Match.dc.html` | match sheet |
| 5 | `05-lists.png` | `Lists.dc.html` | `/names/lists` |
| 6 | `06-duel.png` | `Duel.dc.html` | `/names/lists?tab=duel` |
| 7 | `07-about.png` | `About.dc.html` | `/names?sheet=about`, `/names/about` |
| 8–10 | `08-glass-fabric.png`, `09-glass-notebook.png`, `10-glass-nursery.png` | `Glass*.dc.html` | `/names` on each photo |
| 11 | `11-background.png` | `Background.dc.html` | `/names?sheet=background` |
| — | landing demo | `src/lib/pregnancy-names-demo.mjs` | welcome preview card, interactions, end state |

Screens without a board (welcome, sign-in, onboarding, invite, join, settings, legal, install sheet) follow the same look: board 1's glass-on-photo layout for welcome, sign-in and onboarding; board 5's list layout on canvas for settings, invite and legal pages. Don't port the boards' demo-only bits: the "הנתונים במסך זה הם לדוגמה בלבד" footer, the "לדוגמה בלבד" label, the sample surname "לוי", the "ד"/"ש" match avatars, the "12" saved count, "[מספר]" placeholders.

## 11. QA

### 11.1 Record

Everything goes in `scripts/ralph/qa/names-pwa/` (created by US-002):

- `bugs.md`: one entry per bug, IDs `NP-BUG-001` on. Fields: id, cycle found, QA story, screen, viewport, steps, expected, actual, screenshot path, `status: open | fixed | blocked | wontfix-owner`, fix note, cycle fixed.
- `ux-insights.md`: non-blocking ideas, IDs `NP-UX-001` on. Never acted on in this run.
- `SUMMARY.md`: written by US-FINAL.

Never write a secret, OTP, phone number or token into these files or `progress.txt` (env key names are fine).

### 11.2 What counts as a bug

All block equally: a functional bug (error, dead control, wrong data, a vote not saved, a wrong number, a sign-in that fails); a visual difference from the board or the demo that §3 doesn't explain; a token, RTL or design-system violation (§8); an accessibility failure; copy that breaks §8; a difference from an FR or the E16 spec; a privacy leak (§8). `blocked` is only for a check the environment can't run (for example the real Google round trip), never for "couldn't reproduce".

### 11.3 The loop (3 cycles, hard cap)

1. **US-QA0** (once): QA folder, the 3 QA users signed in through REST, the QA users' data reset (delete their `name_votes` rows and, if QA users 1–3 share a space from earlier runs, note it), a production build running on port 3100.
2. **Cycle N QA** (N = 1, 2, 3): `US-QA{N}-A` … `US-QA{N}-L`, each running its full checklist in §11.4, every cycle, even areas that passed before. QA stories log findings, never fix, never commit.
3. **US-FIX{N}:** if cycle N found zero `open` bugs, mark every remaining QA and FIX story `passes: true` with `skipped: QA clean after cycle N` and let US-FINAL run. Otherwise fix every `open` bug, verify each fix in the browser, set `fixed` with a note, run the checks, one commit `fix(names): resolve the {k} bugs found in QA cycle {N}`.
4. **US-FIX3 is the last fix pass.** No cycle 4. What it can't fix stays `open`.
5. **US-FINAL** re-checks every bug US-FIX3 marked `fixed`, writes `SUMMARY.md` ("clean after cycle N" or "stopped after 3 cycles, {k} bugs open for the owner's review", with the list, plus the owner checks from SETUP §13 still to do), commits it, and pushes the branch. Never rounds up.

### 11.4 Checklists (run in full every cycle)

Phone viewport 390 × 844 unless it says desktop. "User 1/2/3" are the QA users from `.env.test.local`.

**A: Sign-in (FR-W1–W5, W8)**
- Welcome matches its spec: wordmark, title, pitch, preview card, three buttons with Hebrew labels, legal links work.
- Phone: each accepted format of user 1's test number normalises correctly (check the request body in Playwright's network log); an invalid number shows the message; the code step masks the number; a wrong code shows the Hebrew error; the right code signs in; resend is disabled for 60 s and says so.
- Email: entering `NAMES_QA_EMAIL_SINK` shows the "code sent" step (the request to `/auth/v1/otp` returns 200 or the sign-ups-closed error, which must show the §3.2.2 message); a wrong code shows the Hebrew error. Don't send more than 2 emails per cycle.
- Google: clicking the button navigates to `accounts.google.com` with a `client_id` and a `redirect_uri` of `{SUPABASE_URL}/auth/v1/callback`; stop there. `/names/auth/callback?error_description=x` shows the Hebrew error.
- No raw English error is ever shown. Offline sign-in says a connection is needed.
- Session survives a reload and a new tab; sign out returns to welcome and clears local `nest-names:*` keys.

**B: Onboarding and routing (FR-W6, W7, W9)**
- A user without `terms_accepted_at` (reset user 3's metadata through the admin API first) lands on onboarding. There is **no due date field anywhere**.
- The button stays disabled until name + 18+ + terms are set; the opt-in is optional and unchecked by default; links open the legal pages.
- After submit: metadata saved (admin API read), `names_space` created a space with `due_date` null and `origin` 'names', routing goes to intro, then `/names`.
- Intro: copy per space size; surname optional, RTL, shown on cards, absent from every network request.

**C: Card content (FR-W12, W13)**
- All 10 names: every section in E16 FR-5a order, empty sections hidden (לביא, שקד, אביגיל, עמית, אלה have no people).
- Numbers match `data/names/names.json` for 3 names checked by hand; band and trend match the E16 rules and the demo.
- Bar labels: יעל and אביגיל show "מעל 99%"/"פחות מ־1%"; colors ink and peach.
- The card's `aria-label` matches FR-W12. Long content at 200% zoom scrolls inside the card and the buttons stay reachable.
- Peeking cards show the next two names.

**D: Actions, gestures, undo (FR-W10, W11, W15)**
- Each button records the right vote: check with a REST read of `name_votes` as user 1.
- Drag right keeps, left skips, up loves; a short drag snaps back; mouse and touch both work (Playwright `touchscreen`).
- Keyboard shortcuts work and are announced; focus never gets lost after a decision.
- Undo restores the card and the previous vote, up to 10; the 11th is unavailable and the button is disabled with `aria-disabled`.
- Long-press and right-click on "דילוג" offer "דילוג ולא להציג שוב"; the name goes to hidden.
- Reduced motion (`page.emulateMedia({ reducedMotion: 'reduce' })`): no fling, fade only.

**E: Backgrounds (FR-W17)**
- The 5 options; current one ringed with check and "נבחר"; each applies right away on swipe, intro and match views and matches boards 2, 8–11.
- Choice survives reload; fresh profile default is "בדים".
- Own photo: upload a test image with `setInputFiles` (one very dark, one busy); it's stored in IndexedDB, never sent over the network (check every request), text stays ink and readable (≥ 4.5:1 sampled under the name); replacing it replaces the Blob; deleting the Blob falls back to "בדים".
- `prefers-reduced-transparency` emulation (or forcing the no-backdrop-filter class) gives solid white cards.

**F: Filters, chips, hidden, deck end (FR-W14, W16, W22)**
- Each filter group changes the deck correctly for the 10 names ("בת" → girls only; "בעלייה" → rising only; first letter "א" → אריאל, אביגיל, אלה); the apply count is right; chips set the same filter; "איפוס" resets; filters survive reload.
- Empty filter state and its button; end-of-deck state and its links (invite link only when solo).
- Hidden list count and "החזרה".
- Deck order stable across reloads for user 1 and different for user 2.

**G: Lists (FR-W18)**
- "שמרתי" order (loved first), markers, sex tag, count, trend word; row menu actions; "הוספת שם" rules (empty, non-Hebrew, too long, data name, duplicate, custom name with no count). Segment labels; "התאמות" hidden while solo.

**H: Invite, join, matches (FR-W19, W20, W23, W24)**
- User 1 creates an invite: link format, Web Share fallback to copy, expiry text.
- User 2 (solo, with 2 votes of their own) opens `/names/join/{code}` signed out → signs in → onboarding if needed → joined; their votes moved (REST); "התאמות" appears for both.
- Both keep the same name (user 2 via REST is fine): user 1 sees it in "התאמות" within 60 s and the match sheet once; ink, no green, no confetti; it never shows again for that name.
- User 2 skips a name user 1 kept: nothing about it appears for user 1 anywhere, and a REST read as user 1 of `name_votes` returns only user 1's rows and `name_matches` doesn't return it.
- Reusing the code (as user 3) shows the expired-link message. User 3 with a fresh invite makes 3 members and "{n} שמרו" appears for a name all three kept.

**I: Duel (FR-W21)**
- Starts from "שמרתי"; from "התאמות" with 2+ matches; progress and round text right; ends in a ranked top 5 or fewer; stop and resume across reload; fewer than 2 names explains; buttons labelled by the name.

**J: About, report, legal, settings (FR-W25, W30, W31)**
- About: CBS attribution, release, file, years, access date, both links, non-endorsement, threshold, AI note, Wikidata note.
- Report: sends to `client-log` with only `area`, `name`, `message`, `path`, `appVersion`; confirmation shown.
- Legal pages: draft banner, operator name and contact from env, every processor named, no invented facts.
- Settings: display name edit updates `space_members` (REST) and metadata; opt-in toggle saves; sign out; delete account on a **throwaway user created by the admin API in this check** (never users 1–3): the user is gone (admin API), their votes gone, a shared space they created passes to the other member.

**K: PWA and offline (FR-W26–W29)** on the production build (port 3100)
- Manifest fields and icons load (fetch each URL, 200, right size and purpose); `/names` links the manifest; Chromium reports the page installable (`beforeinstallprompt` fires, or the manifest + worker pass Chrome's installability rules).
- The worker is registered with scope `/names/` and `public/sw.js` is unchanged.
- Offline (`context.setOffline(true)`) after one visit: the app opens, swiping works, votes queue with the footer status, lists and duel work, matches show the cached list; back online the outbox flushes (REST check) and the status clears.
- A new build shows "עדכון זמין" and "רענון" reloads into it.
- iOS install sheet text appears with a Safari iPhone user agent and not in standalone mode.

**L: Accessibility, RTL, design-system and privacy audit**
- axe (or the accessibility snapshot) on welcome, sign-in, onboarding, swipe, every sheet, lists, duel, invite, join, settings, about, legal: no serious or critical issues; every control labelled in Hebrew; focus visible and trapped in sheets.
- 200% zoom and 320 px width: no horizontal scroll, nothing cut off.
- Code check of every file under `src/app/names`, `src/components/names`, `src/lib/names`: no hex/rgb outside `src/styles/nest-tokens.css`, no `left`/`right`/`ml-`/`mr-`/`pl-`/`pr-`, every icon-only button has `aria-label`, no green.
- Network log of a full session: no phone, email, display name, surname, vote or photo in analytics or `client-log` requests; no request to anything except this origin, Supabase, Vercel analytics and (when set) Turnstile.
- Landing at `/` still renders and its demo works; `tests/pregnancy-landing.test.ts` passes.

## 12. Non-goals

- Content for all names (E16b), the weighted deck (E16 FR-9 weighting), the Wikidata pipeline.
- Leaving a shared space, removing a member, changing who's in a space other than by invite.
- Push notifications, email notifications about matches.
- Any Nest app (React Native) change, including handling a space with no due date (owner follow-up, SETUP §2).
- Applying migrations, changing Supabase, Google, Twilio, Resend or Vercel settings, deploying, or merging to `main`.
- The real Google round trip, real SMS and real email delivery, real iPhone/Android install (owner checks, SETUP §13).
- English or Arabic UI.
- Acting on UX insights.

## 13. Success

- Every build story passes with its browser check done.
- QA ends clean, or ends after cycle 3 with every remaining bug in `SUMMARY.md`.
- On the final commit: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` green; branch `ralph/names-pwa` pushed, ready for the owner to open a PR, run the SETUP §13 checks on a Vercel preview, and merge.
