# Name swiper polish: impeccable critique scores

Per screen and heuristic, from impeccable's critique (`.claude/skills/impeccable/`). The baseline table is filled by the `US-A-IMP-C-G1…G3` audits; the after table by `US-R1…R3` (PRD §7). Use the same screens, heuristics and scale in both, so the rows compare.

## Baseline (before polish)

| Group | Screen | Heuristic | Score | Notes (finding IDs) |
|---|---|---|---|---|

## After (re-score)

| Group | Screen | Heuristic | Baseline | After | Change | Notes (backlog IDs) |
|---|---|---|---|---|---|---|

## Baseline performance

Measured by US-004 on 2026-11-07, `npm run build` at `b6ab9ca` (no code change since the detail run), production server `next start -p 3100`. Budget (PRD §3.1.8): `/names` first-load JS ≤ baseline + 3 KB gzipped, CLS 0 on the swipe screen, detail sheet open < 150 ms.

**First-load JS** (every `/_next/static/*.js` referenced by the prerendered HTML, each gzipped at level 9 and summed; same method as the detail run's `us072-size.mjs`; script `shots/us004-size.mjs`, run as `node scripts/ralph/qa/name-polish/shots/us004-size.mjs`):

| Route | Files | Raw (B) | Gzipped (B) |
|---|---|---|---|
| `/names` | 14 | 995,574 | **301,489** |
| `/names/lists` | 14 | 964,554 | 290,498 |
| `/names/welcome` | 12 | 906,268 | 271,504 |

`/names` budget ceiling for the run: 301,489 + 3,072 = **304,561 B gzipped**.

**Interaction** (Chromium as Pixel 7 with touch, QA user 1, no CPU throttle, service workers blocked, votes/matches/track mocked so nothing is written; script `shots/us004.mjs`, run as `QA_SHOTS_DIR=scripts/ralph/qa/name-polish/shots node scripts/ralph/qa/name-polish/shots/us004.mjs`; two runs):

| Measure | Method | Run 1 | Run 2 |
|---|---|---|---|
| CLS during 5 swipes (keep, skip, love, keep, skip, touch `drag()`) | `PerformanceObserver` `layout-shift`, entries without `hadRecentInput` summed | 0 (0 entries) | 0 (0 entries) |
| Tap → sheet visible, 3 opens (ms) | `performance.measure` from the `pointerup` timestamp to the frame after `section[role=dialog] h2` is in the DOM (as `qa1-q.mjs`); 1st open loads the sheet chunk | 51, 50, 42 | 61, 50, 43 |
| CLS over the whole run (swipes + 3 opens/closes) | same observer | 0 | 0 |

## Screens G1

Baseline inventory of group 1 (Entry, PRD §6), taken by US-005 on 2026-11-07 before any polish, at `f9bedbe` (no app code change since the detail run). Audits and QA use this list of screens and states and these names.

**Where:** `scripts/ralph/qa/name-polish/shots/baseline/G1/` (gitignored), named `<screen>-<state>-<browser>.png`. Browsers: `webkit` (Playwright WebKit, iPhone 15, 393 × 659), `chromium` (Playwright Chromium, Pixel 7, 412 × 839), `webkit375` (WebKit 375 × 667), `webkit320` (WebKit 320 × 568), `sim` (Mobile Safari, iOS Simulator iPhone 17 Pro, production build on :3100). A page taller than the viewport also has `<screen>-<state>-full-<browser>.png` (full page; Playwright only).

**How (re-run for the after shots):**
- Playwright, dev server :3000: `QA_SHOTS_DIR=scripts/ralph/qa/name-polish/shots node scripts/ralph/qa/name-polish/shots/us005-g1.mjs [webkit|chromium|webkit375|webkit320]`. QA user 1 for signed-in screens. Every write is mocked: OTP send (200) and verify (403 `otp_expired`), `names_join` (space id, or `invalid_code`), `names_invite` (a fixed code, or 500); no email goes out and no row changes.
- Simulator: `QA_SHOTS_DIR=… node scripts/ralph/qa/name-polish/shots/us005-sim.mjs <out|email|code|callbackLoading|inside|unconfigured>`. Signed out on `http://127.0.0.1:3100` (own storage; the dev server doesn't hydrate on 127.0.0.1), QA user 1 on `http://localhost:3100`. `code` sends one real code email to QA email 3 (Resend test address) and types a wrong code. `inside` calls the real `names_invite` for user 1's space.
- Unconfigured notice: the layout picks `Unconfigured` on the server from missing env, which can't be switched per request, so both scripts serve `/names/offline`'s HTML with its `<main>` replaced by `Unconfigured`'s markup (same classes) and scripts stripped (`/names/__unconfigured`, through a route in Playwright and a proxy on :3198 for Safari).

| Screen | State | How it's reached | Shots (`-<browser>.png`) | Browsers |
|---|---|---|---|---|
| `/names/welcome` | default | signed out | `welcome-default` (+ `-full` webkit/375/320) | all 5 |
| `/names/welcome` | sign-ups closed | `?closed=1` | `welcome-closed` (+ `-full`) | all 5 |
| `/names/welcome` | session expired | `?expired=1` | `welcome-expired` (+ `-full`) | all 5 |
| `/names/sign-in/email` | email step | open | `signin-email` | all 5 |
| `/names/sign-in/email` | invalid address | "abc" + שליחת קוד | `signin-email-invalid` | all 5 |
| `/names/sign-in/email` | code step, resend timer running | valid address + שליחת קוד | `signin-code` | all 5 |
| `/names/sign-in/email` | wrong code | 6 digits, verify 403 | `signin-code-wrong` (+ `-full` webkit/375/320) | all 5 |
| `/names/sign-in/email` | resend available | code step + 61 s (Playwright clock) | `signin-code-resend` | all 5 |
| `/names/auth/callback` | loading | expired stored session, refresh held | `callback-loading` | Playwright 4 (Safari routes on before it paints: a blank frame at 300 ms, the deck at 700 ms) |
| `/names/auth/callback` | error | `?error_description=x` | `callback-error` | all 5 |
| `/names/onboarding` | default (empty form) | user 1's session with the onboarding metadata removed in the browser only | `onboarding-default` (+ `-full`) | Playwright 4 (Safari needs a not-onboarded account: an auth data change) |
| `/names/intro` | top | user 1 | `intro-top` (+ `-full`) | all 5 |
| `/names/intro` | surname step | field scrolled into view and focused (Safari: drag up; Safari holds a saved surname from earlier runs) | `intro-surname` (+ `-full`) | all 5 |
| `/names/join/[code]` | valid, signed out | `/names/join/QAPOLISH` signed out | `join-invited` (+ `-full`) | all 5 |
| `/names/join/[code]` | valid, joined | user 1, `names_join` mocked | `join-joined` | Playwright 4 (a real join moves user 1 into another space) |
| `/names/join/[code]` | expired / used | user 1, `invalid_code` (Safari: the real RPC rejects `QAPOLISH`) | `join-expired` | all 5 |
| `/names/join/[code]` | sign-ups closed | `/names/welcome?closed=1&join=QAPOLISH` (where a closed sign-up from a join lands) | `join-closed` (+ `-full`) | all 5 |
| `/names/invite` | link ready | user 1 (Playwright mocked; Safari real) | `invite-link` (+ `-full` 320) | all 5 |
| `/names/invite` | link failed | `names_invite` 500 | `invite-error` | Playwright 4 (Safari can't mock Supabase) |
| `/names/offline` | default | open | `offline-default` | all 5 |
| `/names/goodbye` | default (signed out) | open signed out | `goodbye-default` | all 5 |
| `/names/[...missing]` | 404 | `/names/no-such-page` | `404-default` | all 5 |
| unconfigured notice | default | see above | `unconfigured-default` | all 5 |

23 states: 23 shots each in webkit, chromium, webkit375 and webkit320; 19 in sim (the 4 gaps above, each with its reason). 147 PNGs with the full-page ones.

**Seen while taking them** (for the audits to judge; not findings yet):
- `intro-surname`: in Chromium and WebKit the focused surname field sits partly under the sticky "התחלת בחירה" button.
- `intro-top-webkit320`: the lead paragraph runs behind the first feature card at 320 px.
- `welcome-*`: below the fold in WebKit 393 × 659 (email button and legal line need a scroll); fits on Pixel 7. In Safari the bottom toolbar covers the legal line until scrolled.
- `signin-code-wrong`: the resend line drops below the card's fold at 375 and 320.
- `offline`, `404`, `unconfigured`: plain canvas, no background photo or glass, unlike the other entry screens.
