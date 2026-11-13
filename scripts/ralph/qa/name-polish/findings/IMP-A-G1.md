# IMP-A · G1: Entry (welcome, sign-in, callback, onboarding, intro, join, invite, offline, goodbye, 404, unconfigured)

Run 2026-11-07 by US-A-IMP-A-G1 at `16f3538` (no app code change since the baselines).

Skill: `impeccable` (`.claude/skills/impeccable/SKILL.md`, references read: `reference/audit.md`, `reference/craft-floor.md`, `reference/polish.md`, `reference/harden.md`). Mode Operate for every screen, Persuade for `/names/welcome` (PRD §3.3.5). This is the code-level audit: it checks what can be measured in the code and the rendered page. Design judgment belongs to IMP-C-G1.

Assumptions where the skill would ask: the closing "run these one at a time or all at once" is skipped (Ralph can't ask, PRD §3.3.2). Every finding goes to triage, and nothing is fixed here. audit.md's "Suggested command" field maps to the PRD §7 "Proposed change", so the commands (`harden`, `optimize`, `polish`…) are only named in the summary. Skipped steps: none needed a service. `critique-storage` wasn't read, because IMP-C didn't write a snapshot (see IMP-C-G1.md).

## Method and evidence

- **Code read:** every G1 route (`src/app/names/{welcome,sign-in/email,auth/callback,onboarding,intro,invite,join/[code],offline,goodbye}/page.tsx`, `not-found.tsx`, `error.tsx`, `layout.tsx`) and component (`AuthLayout`, `WelcomeActions`, `PreviewCard`, `EmailSignIn`, `CodeInput`, `ResendTimer`, `AuthCallback`, `Onboarding`, `Intro`, `InviteScreen`, `JoinScreen`, `ClosedNotice`, `ExpiredNotice`, `GoodbyeScreen`, `Unconfigured`, `ConnectionNote`, `AuthGuard`, `AuthProvider`, `ui/Button`, `ui/classes.ts`, `names.css`).
- **Detector:** `sh .claude/skills/impeccable/scripts/impeccable detect --json` on all 27 G1 sources (run under `bash`): exit 0, `[]`. This matches IMP-C-G1 and its overlay results (the only real overlay hit, placeholder contrast, is IMP-C-G1-06).
- **Rendered probe** (`shots/imp-a-g1-probe.mjs`, Playwright WebKit iPhone 15 on the dev server, all writes mocked). It covered 14 states: welcome, welcome with both notices, sign-in email, code and wrong code, callback error, offline, 404, goodbye, join invited and joined, intro and invite. For each state it recorded axe-core violations, interactive targets under 44 px, the font size of every input, horizontal overflow, headings, landmarks, page title, console errors, and the reduced-motion computed animation on the callback spinner.
  - Result: 0 axe violations on every state on a settled page. One `document-title` hit came from the first dev load only; the production page has its title. No horizontal overflow. One `<main>` per page.
  - The only targets under 44 px are join's two inline legal links (71 × 18, 87 × 18), already IMP-C-G1-07.
- **Production probe** (`shots/imp-a-g1-prod.mjs`, :3100, build of the same code): page titles, page errors, and the time from navigation to the first sign-in button on welcome, in WebKit and Chromium plus a Chromium run with 4× CPU throttling.
- **Server HTML:** `curl` of `/names/welcome` on :3000 and :3100.
- **Shots:** `scripts/ralph/qa/name-polish/shots/audit/IMP-A-G1/` from `us005-g1.mjs` (`-webkit` iPhone 15, `-chromium` Pixel 7, `-webkit320`), `probe-*` and the Simulator pair `signin-email-before-focus-sim.png` / `signin-email-focus-tap-sim.png` (Mobile Safari, 127.0.0.1:3100, signed out).
- **Gaps:** the onboarding state didn't render in any browser today, in either `us005-g1.mjs` or the probe. The trimmed-metadata session now redirects to `/names`; IMP-C-G1 saw this only in Chromium. Onboarding was audited from code and from `baseline/G1/onboarding-default-*.png`. The Simulator input-zoom check ran with the Simulator's hardware keyboard attached, so it doesn't prove there is no zoom on a device (see -02).

## Audit health score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | Good semantics, labels, live regions and focus management. Gaps: reduced motion freezes the loading spinners (-03), wrong titles on 404 and the callback error (-04, -05), the terms checkbox error isn't tied to the field (-07). Placeholder contrast and the small join links were already found (IMP-C-G1-06, -07) |
| 2 | Performance | 3 | Welcome and the join invitation ship a skeleton as their HTML, so the first screen of the funnel waits for JS, hydration and the session check (-01) |
| 3 | Theming | 4 | Tokens only (detector clean, `designGuard` test). Light only by design (PRODUCT.md), so dark mode is n/a |
| 4 | Responsive design | 3 | No overflow at 320 px and all targets ≥ 44 px except inline links. Inputs are under 16 px (-02). The welcome fold on short phones is IMP-C-G1-01 |
| 5 | Implementation integrity | 3 | A coherent product-specific system. Isolated drift: entry screens hand-roll the primary pill without the shared press state (-08, merges IMP-C-G1-15) |
| **Total** | | **16/20** | **Good** (address weak dimensions) |

**Implementation integrity verdict: pass.** The detector found nothing in the G1 source. Every screen uses `AuthLayout` with the fabric photo and the card glass, plus tokens, the shared `IconButton`/`Button` on intro, invite and join, and product copy. The one repeated shortcut is the primary ink pill typed out again in `WelcomeActions`, `EmailSignIn`, `AuthCallback` and `Onboarding` instead of `buttonClass("primary")` (-08).

**Executive summary.** 16/20 (Good). 8 findings: 0 P0, 0 P1, 1 P2, 7 P3. Top issues: -01 (skeleton-only HTML on the funnel's first screen), -02 (inputs under 16 px), -03 (spinners frozen under reduced motion), -06 (loading states with no time limit). Recommended next steps: `optimize` for -01, `harden` for -02, -06 and -07, `animate` for -03, `polish` for -04, -05 and -08.

**Patterns.** (1) Pages that start on the client: two of the three auth guards render the skeleton until `INITIAL_SESSION`, even though `hasStoredSession()` already knows synchronously whether a session can exist (-01). (2) The type tokens put every input at 15 px or smaller (-02). (3) Waiting states rely on the network to resolve or fail and never time out (-06).

**Positive findings.**
- Sign-in fields: `inputMode`, `autoComplete="email"` / `one-time-code`, LTR fields, `aria-invalid` and `aria-describedby`, auto-submit on the 6th digit with a guard against submitting the same code twice.
- The resend timer is announced at the start, every 15 s and at the end, and isn't announced every second.
- Live regions stay mounted (`ConnectionNote` uses `display: contents`).
- Onboarding uses `aria-disabled` and moves focus to the first missing field.
- Join outcomes use `role="status"` with the full text.
- Safe areas are respected (`env(safe-area-inset-*)` in `AuthLayout`, intro and invite).
- `:focus-visible` and `::selection` are themed from the palette (craft-floor "browser surfaces").
- No layout-property animation, and no `will-change`.

## Findings

Severity is the PRD's scale (§7): P1 broken, inaccessible or clearly off-brand · P2 noticeable · P3 refinement. Shot paths are relative to `scripts/ralph/qa/name-polish/shots/`.

### IMP-A-G1-01: Welcome and the join invitation render only a skeleton on the server

- **Screen and state:** `/names/welcome` (all states), `/names/join/[code]` signed out
- **Browser:** all (server HTML); measured in webkit-iphone and chromium-pixel on :3100
- **What's wrong:** `RedirectIfSignedIn` (`AuthGuard.tsx:50`) returns `<AuthSkeleton />` while `loading`, and `JoinScreen.tsx:99` does the same. `loading` is always true on the server, so the prerendered HTML of the funnel's first screen holds only "בטעינה". The HTML has no title panel, pitch or sign-in buttons: `curl` of `/names/welcome` contains "כניסה עם Google" 0 times. Locally the button appears 45–78 ms after navigation (132 ms with 4× CPU). On a phone network, the JS download (≈ 271 KB gzipped first load, US-004), hydration and `getSession` all happen before anything but a grey card shows. The page is also `index: true` with no content in its HTML. `AuthProvider` already reads `hasStoredSession()` synchronously, so a visitor without a stored session never needs to wait.
- **Rule it breaks:** `impeccable` · `reference/audit.md` Performance · "Render performance" / craft-floor "Coverage: every brief requirement present and findable within seconds"; `reference/harden.md` · "Core functionality works without JavaScript … Progressive enhancement"
- **Severity:** P2
- **Effort:** S
- **Proposed change:** `src/components/names/AuthGuard.tsx` `RedirectIfSignedIn` and `JoinScreen.tsx` signed-out branch: render the children while `loading`, and show the skeleton only once a stored session is known (via `hasStoredSession()` after mount, or a session that arrived). Redirects stay as they are. Verify that a signed-in visitor still never sees welcome flash longer than today's skeleton, and recheck CLS on welcome.
- **Guardrail:** polish (same screens, same routing, earlier paint)
- **Screenshot:** `audit/IMP-A-G1/welcome-default-webkit.png` (settled); evidence is the server HTML and `imp-a-g1-prod.mjs` output (recorded in this file)

### IMP-A-G1-02: Every G1 text input is under 16 px

- **Screen and state:** sign-in email step (`#email` 15 px, `text-card-title`), onboarding (`#display-name` 15 px), intro (`#surname` 15 px, `text-intro`), invite (read-only link 12 px, `text-caption`; it is focused and selected on tap)
- **Browser:** webkit-iphone (computed sizes from the probe); sim-safari (tap on the email field showed no zoom, but the Simulator had a hardware keyboard and the field was already autofocused, so this doesn't rule zoom out on a device)
- **What's wrong:** iOS Safari zooms the page when a focused input's font is under 16 px. The page then stays zoomed after the keyboard closes, and the 480 px column and the sticky intro footer move off-screen. The viewport doesn't prevent it (`width=device-width, initial-scale=1`, rightly no `maximum-scale`). The code input (22 px) is fine.
- **Rule it breaks:** `impeccable` · `reference/harden.md` · "iOS Safari force-zooms focused inputs under 16px, which breaks form layouts"
- **Severity:** P3 (not reproduced in the Simulator; rule-based)
- **Effort:** S
- **Proposed change:** add a new type token for form fields at 16 px (allowed by §3.1.2: a new token, not a changed value) in `docs/names-pwa/brand/tokens.json`, then `npm run tokens:css`. Use it on the four inputs (`EmailSignIn.tsx:174`, `Onboarding.tsx:166`, `Intro.tsx:144`, `InviteScreen.tsx:172`). Check on a device or the Simulator with the software keyboard (I/O › Keyboard › Toggle Software Keyboard). If triage judges a 15 → 16 px field change as visible drift from board 1, it goes to the owner.
- **Guardrail:** polish (new token); owner only if triage reads it as a type change
- **Screenshot:** `audit/IMP-A-G1/signin-email-before-focus-sim.png`, `audit/IMP-A-G1/signin-email-focus-tap-sim.png`, `audit/IMP-A-G1/intro-surname-webkit.png`

### IMP-A-G1-03: Reduced motion freezes the loading spinners

- **Screen and state:** `/names/auth/callback` loading ("מתחברים…"), `/names/join/[code]` joining ("רק רגע, מצטרפים לבחירה")
- **Browser:** webkit-iphone with `reducedMotion: "reduce"` (computed `animation-duration: 0.00001s`, `animation-iteration-count: 1`)
- **What's wrong:** the global reduced-motion rule in `names.css:67-77` cuts every animation to 0.01 ms and one run, so the `animate-spin` ring becomes a still arc. The text still says "רק רגע", but a static ring reads as a stuck or broken page during a wait that can take seconds. The spinner is the only sign that something is still happening.
- **Rule it breaks:** `impeccable` · `reference/audit.md` Accessibility · "flag a global `0.01ms` kill that destroys useful feedback"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** give the two spinners a reduced-motion alternative, either a slow opacity pulse (no movement) or `data-motion` with a calm rotation allowed (`names.css` plus the two spans in `AuthCallback.tsx:74` and `JoinScreen.tsx:139`). Better still, one shared spinner in `ui/`. Coordinate with the MOT lens.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-A-G1/callback-loading-webkit.png`

### IMP-A-G1-04: The 404 page's title changes to "בחירת שם · Nest" after it loads

- **Screen and state:** `/names/<anything missing>` (404)
- **Browser:** webkit-iphone and chromium-pixel, :3100 and :3000
- **What's wrong:** the server sends `<title>העמוד לא נמצא · בחירת שם</title>`, but `document.title` in the browser is "בחירת שם · Nest". That is the root layout's template around the names layout's default, so the tab, history and the screen reader's page announcement lose "העמוד לא נמצא". The dev server also logged a `pageerror: Type error` on this route in WebKit; production logged none.
- **Rule it breaks:** `impeccable` · `reference/audit.md` Accessibility · "Semantic HTML … Missing ARIA" (the page title is the first thing announced; WCAG 2.4.2 Page Titled) / `polish.md` "Keep terminology … consistent"
- **Severity:** P3
- **Effort:** S
- **Proposed change:** find why the not-found metadata is replaced on the client (`src/app/names/not-found.tsx` with `[...missing]/page.tsx` calling `notFound()`; read the Next 16 docs on `not-found` metadata). If the fix isn't clean, render a React 19 `<title>` in `not-found.tsx` as `error.tsx` already does.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-A-G1/404-default-webkit.png`

### IMP-A-G1-05: The Google failure screen keeps the title "מתחברים"

- **Screen and state:** `/names/auth/callback` error
- **Browser:** all (`document.title` "מתחברים · בחירת שם" while the heading says "הכניסה עם Google לא הצליחה")
- **What's wrong:** the route's metadata title is static. When the callback fails, the tab and the screen reader's page title still say it's signing in.
- **Rule it breaks:** `impeccable` · `reference/craft-floor.md` · "Copy: … errors name the problem and the recovery"; WCAG 2.4.2 (audit.md Accessibility)
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `AuthCallback.tsx` failed branch: add `<title>{\`${GOOGLE_FAILED_MESSAGE} · בחירת שם\`}</title>`, the same pattern as `error.tsx:18`.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-A-G1/callback-error-webkit.png`

### IMP-A-G1-06: Callback and join wait forever when the network hangs

- **Screen and state:** `/names/auth/callback` loading, `/names/join/[code]` joining; also every `AuthSkeleton` behind `AuthProvider`'s `INITIAL_SESSION`
- **Browser:** webkit-iphone (with `/auth/v1/token` routed to a request that never answers, "מתחברים…" held for the whole probe run; no code path ends it)
- **What's wrong:** these states end only when the request resolves or rejects. `AuthCallback`, `joinWithCode` and `AuthProvider` have no time limit, so a stalled mobile connection (captive Wi-Fi, a lift) shows a spinner with no way forward. The callback's failure branch, which has the recovery link, never appears.
- **Rule it breaks:** `impeccable` · `reference/harden.md` · "Network errors: … Handle timeout scenarios" / "Loading states: … Time estimates for long operations"
- **Severity:** P3
- **Effort:** S
- **Proposed change:** after a fixed wait (e.g. 15 s, as a constant in `src/lib/names/`), show the existing failure branch: the callback's "חזרה לכניסה" and join's `offline`/`error` outcome with "ניסיון חוזר". No new copy is needed beyond what `JOIN_COPY` and the callback already have.
- **Guardrail:** polish (an existing error state for an existing flow, §3.1.4)
- **Screenshot:** `audit/IMP-A-G1/callback-loading-webkit.png`

### IMP-A-G1-07: Onboarding's terms checkbox is marked invalid with no message tied to it

- **Screen and state:** `/names/onboarding` after "התחלת בחירה" with the terms unchecked
- **Browser:** code (`Onboarding.tsx:194-208`); the state didn't render in the browsers today (see Gaps)
- **What's wrong:** on submit, focus moves to the terms checkbox, which gets `aria-invalid`, but it has no `aria-describedby`. The display name has its hint and the age box has `age-hint`. A screen reader hears "invalid" with no reason. The reason ("אפשר להתחיל אחרי שממלאים שם ומאשרים את שני הסעיפים הראשונים.") is tied only to the submit button.
- **Rule it breaks:** `impeccable` · `reference/harden.md` · "Form validation errors: Inline errors near fields; Clear, specific messages"; audit.md "Form issues: … poor error messaging"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `Onboarding.tsx`: `aria-describedby="onboarding-missing"` on the terms and age checkboxes while they are invalid (keep `age-hint` too). No new copy.
- **Guardrail:** polish
- **Screenshot:** `baseline/G1/onboarding-default-webkit.png`

### IMP-A-G1-08: Hand-rolled primary pills skip the shared press state and `touch-manipulation`

- **Screen and state:** welcome / join invited (Google button, email link), sign-in email and code (`שליחת קוד`, `כניסה`), callback error (`חזרה לכניסה`), onboarding (`התחלת בחירה`)
- **Browser:** code; visible in every browser as no pressed feedback on these buttons, unlike intro, invite and join outcomes, which use `Button`
- **What's wrong:** the primary pill's classes are typed out again in four components (`WelcomeActions.tsx:72,82`, `EmailSignIn.tsx:24`, `AuthCallback.tsx:63`, `Onboarding.tsx:237`). The copies miss `PRESS` from `ui/classes.ts` (`touch-manipulation`, `motion-safe:active:scale-95`), and their disabled opacity differs (0.70 on welcome vs the shared 0.60). The same control behaves differently on adjacent screens. This is the technical side of IMP-C-G1-15 (merge in triage).
- **Rule it breaks:** `impeccable` · `reference/polish.md` · "Replace custom implementations with shared components where the system owns the pattern" / "Every control needs appropriate default, hover, focus, active, disabled, loading … behavior"
- **Severity:** P3
- **Effort:** S
- **Proposed change:** use `buttonClass("primary")` / `buttonClass("secondary")` (or `Button`) in the four files. Keep the Google mark and the envelope icon as children. Welcome's soft-glass email link maps to the `secondary` variant only if it looks the same on the fabric; otherwise add `PRESS` to it.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-A-G1/welcome-default-webkit.png`, `audit/IMP-A-G1/signin-email-webkit.png`

## Confirmed from IMP-C-G1 (no new entry)

Technical evidence for findings already in `IMP-C-G1.md`, for triage to attach:
- IMP-C-G1-06 placeholder contrast: `placeholder:text-faint` (#B5ACA6 on white, 2.2:1) on `#email`; intro uses `text-stone`.
- IMP-C-G1-07: join's legal links measure 71 × 18 and 87 × 18 px and have no `min-h-11` (welcome's do).
- IMP-C-G1-01: page height 820 px vs a 659 px viewport on welcome, and 841 px on join invited (WebKit iPhone 15 in Playwright).

## Recommended actions (audit.md order)

1. [P2] `/impeccable optimize`: IMP-A-G1-01, render welcome and join's signed-out content on the server.
2. [P3] `/impeccable harden`: IMP-A-G1-02 (16 px fields), -06 (timeouts), -07 (checkbox error).
3. [P3] `/impeccable animate`: IMP-A-G1-03 (reduced-motion spinner).
4. [P3] `/impeccable polish`: IMP-A-G1-04, -05 (titles), -08 (shared button).
