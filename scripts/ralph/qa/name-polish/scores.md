# Name swiper polish: impeccable critique scores

Per screen and heuristic, from impeccable's critique (`.claude/skills/impeccable/`). The baseline table is filled by the `US-A-IMP-C-G1…G3` audits; the after table by `US-R1…R3` (PRD §7). Use the same screens, heuristics and scale in both, so the rows compare.

## Baseline (before polish)

One matrix per group: screens as rows, Nielsen's heuristics H1–H10 as columns (impeccable `reference/critique.md` "Heuristics Scoring Guide", 0–4 each). `n/a` follows the skill's mode-applicability rule (H7/H10 on Persuade surfaces, or a heuristic the screen gives nothing to judge), and the total is renormalized to the applicable maximum; the band reads off the percentage (90 %+ Excellent, 70 %+ Good, 50 %+ Acceptable, 30 %+ Poor). The re-score (US-R1…R3) uses the same rows and columns.

H1 system status · H2 match with the real world · H3 user control and freedom · H4 consistency and standards · H5 error prevention · H6 recognition over recall · H7 flexibility and efficiency · H8 aesthetic and minimalist design · H9 error recovery · H10 help and documentation.

### G1 Entry (US-A-IMP-C-G1, 2026-11-07, at `132b981`; findings `findings/IMP-C-G1.md`)

| Screen (states) | H1 | H2 | H3 | H4 | H5 | H6 | H7 | H8 | H9 | H10 | Total | Band | Notes (finding IDs) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| welcome (default, closed, expired), Persuade | 3 | 3 | 3 | 3 | 3 | 3 | n/a | 3 | 2 | n/a | 23/32 (72 %) | Good | H9: expired notice gives no reason (-05), Google error looks like body text (-14); H8 kept at 3 but the action is below the fold on short phones (-01, P1); -22 (owner) |
| sign-in, email step (valid, invalid) | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 30/40 (75 %) | Good | -06 placeholder contrast |
| sign-in, code step (timer, wrong, resend) | 3 | 3 | 2 | 3 | 3 | 4 | 3 | 3 | 2 | 3 | 29/40 (73 %) | Good | H9: wrong-code advice vs locked resend (-02); H3: Back skips the email step (-17); -16 |
| auth callback (loading, error) | 3 | 3 | 3 | 3 | n/a | 3 | n/a | 3 | 3 | n/a | 21/28 (75 %) | Good | -20 |
| onboarding | 3 | 3 | 2 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 29/40 (73 %) | Good | H3: no way out (-10, owner); -13, -19 |
| intro (top, surname) | 3 | 2 | 3 | 3 | 2 | 3 | 3 | 3 | n/a | 3 | 25/36 (69 %) | Acceptable | H5: X drops the surname (-04); H2: "שניכם" (-03); -08 |
| join, invited (signed out) | 3 | 2 | 3 | 2 | 3 | 3 | n/a | 3 | 3 | 3 | 25/36 (69 %) | Acceptable | H4: legal line (-07); H2: "שניכם" (-03); -01 |
| join outcomes (joined, expired, closed) | 3 | 2 | 3 | 3 | n/a | 3 | n/a | 3 | 2 | 2 | 21/32 (66 %) | Acceptable | H9/H10: no one named to ask (-09); H2: "שניכם" (-03); -18 (owner), -19 |
| invite (link ready, link failed) | 3 | 2 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 29/40 (73 %) | Good | H2: "שניכם" (-03) |
| offline | 3 | 3 | 3 | 2 | n/a | 3 | n/a | 3 | 3 | n/a | 20/28 (71 %) | Good | H4: off-brand system screen (-11) |
| goodbye | 3 | 3 | 3 | 3 | n/a | 3 | n/a | 3 | n/a | n/a | 18/24 (75 %) | Good | -19 (no wordmark) |
| 404 | 2 | 3 | 3 | 2 | n/a | 3 | n/a | 3 | 2 | n/a | 18/28 (64 %) | Acceptable | -11 |
| unconfigured notice | 1 | 2 | 1 | 2 | n/a | 2 | n/a | 3 | 1 | n/a | 12/28 (43 %) | Poor | -12 (an operator-only state) |
| **G1 (sum of the rows)** | 36 | 34 | 35 | 35 | 20 | 39 | 15 | 39 | 27 | 20 | **300/432 (69 %)** | **Acceptable** | |

How the scores were made: design-review sub-agent (A) scored each screen from the shots and the source; the parent adjusted H2 to 2 where the "שניכם" copy shows (A listed it as a finding but scored H2 3; the skill's H2 criterion "domain-appropriate language" fails for a third member) and the code step's H3 to 2 for -17. The detector sub-agent (B) found no source issues and one real browser issue (-06); it didn't change a score.


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

## Screens G2

Baseline inventory of group 2 (Deck, PRD §6), taken by US-006 on 2026-11-07 before any polish, at `b1e8771` (no app code change since the detail run). Audits and QA use this list of screens and states and these names.

**Where:** `scripts/ralph/qa/name-polish/shots/baseline/G2/` (gitignored), named `<screen>-<state>-<browser>.png`. Browsers as in G1: `webkit` (iPhone 15, 393 × 659), `chromium` (Pixel 7, 412 × 839), `webkit375` (375 × 667), `webkit320` (320 × 568), `sim` (Mobile Safari, iPhone 17 Pro). No G2 page is taller than its viewport, so there are no `-full` shots.

**How (re-run for the after shots):**
- Playwright, production build :3100, QA user 1: `QA_SHOTS_DIR=scripts/ralph/qa/name-polish/shots node scripts/ralph/qa/name-polish/shots/us006-g2.mjs [webkit|chromium|webkit375|webkit320] [--only backgrounds,actions,ends,pauses,detail,sheets]`. Every backend call the deck makes is mocked: `names_space` (a fixed space id), `space_members` (solo, or a pair with "עומר"), `name_votes` (GET a list made for the state; writes echoed, never sent), `name_matches`, `names_track` / `client_log` / `names_survey`. Device prefs are set per state (background, surname, filters, seen matches, `invitePromptShown`, `sessions`, `survey`, `chosen`). Some states limit the deck to 2 names by rewriting `content.*.json`.
- Simulator: `QA_SHOTS_DIR=… node scripts/ralph/qa/name-polish/shots/us006-sim.mjs <bg <name> [full 291] | url <shot> <path> | tap x y | drag … | shot <name>>` on `http://localhost:3100` with QA user 1 and the real backend, so only states that need no write. Safari holds the surname "רזניק" and an own photo from earlier runs; the run ends on "בדים", as it was.

| Screen | State | How it's reached | Shots (`-<browser>.png`) | Browsers |
|---|---|---|---|---|
| `/names` deck | card + peeking cards, each background | background pref `none` / `fabric` / `notebook` / `nursery`; own photo uploaded through the background sheet | `deck-bg-none`, `deck-bg-fabric`, `deck-bg-notebook`, `deck-bg-nursery`, `deck-bg-own` | all 5 (`deck-bg-own-webkit*`: see gaps) |
| `/names` deck | drag held towards skip / save (swipe label) | touch pointerdown + moves, no pointerup, 32 % of the card width | `deck-drag-start`, `deck-drag-end` | Playwright 4 |
| `/names` deck | after a decision (status line, undo on, position 2) | "שמירה" (Safari: "דילוג") | `deck-after-vote` | all 5 |
| `/names` deck | after undo | "ביטול ההחלטה האחרונה" | `deck-after-undo` | all 5 |
| `/names` deck | skip long-press menu ("דילוג ולא להציג שוב") | touch pointerdown held 900 ms on "דילוג" | `deck-skip-menu` | Playwright 4 |
| `/names` deck | offline, a decision waiting to sync (status footer) | `setOffline` + "שמירה" | `deck-offline-pending` | Playwright 4 |
| `/names` deck | surname set (card line) | surname pref "כהן-לוינסון" (Safari: "רזניק") | `deck-surname` | all 5 |
| `/names` deck | filtered (header dot, 518 names) | filters sheet → "בת" → "הצגת 518 שמות" | `deck-filtered` | Playwright 4 |
| `/names` deck | empty filter result | 2-name deck of girls' names, filter "בן" | `deck-empty-filter` | Playwright 4 |
| `/names` deck | deck end, solo (saved list + invite link) | 2-name deck: save one, skip one | `deck-end-solo` | Playwright 4 |
| `/names` deck | deck end, shared (no invite link) | same, pair space | `deck-end-shared` | Playwright 4 |
| `/names` deck | deck end, nothing saved | 2-name deck, both skipped | `deck-end-none-saved` | Playwright 4 |
| `/names` deck | pause: invite prompt after the 5th save | 4 saves, `invitePromptShown` false, save one more | `deck-pause-invite` | Playwright 4 |
| `/names` deck | pause: round recap (30 decisions) | 29 votes in this session (8 saved), one more | `deck-pause-recap` | Playwright 4 |
| `/names` deck | survey prompt above the card | 60 votes, `sessions.count` 3, `survey` null | `deck-survey-prompt` | Playwright 4 |
| name sheet | 70 % height, each background | card tap | `detail-70-bg-none` … `detail-70-bg-own` | all 5 |
| name sheet | full height | handle dragged up 300 px (Safari: (201,291) → (201,60)) | `detail-full-bg-none`, `detail-full-bg-fabric` | all 5 |
| name sheet | surname line ("עם שם המשפחה") | surname pref + card tap | `detail-surname` | Playwright 4 (Safari's `detail-70-bg-*` show it too) |
| name sheet | similar names section | scrolled into view (Safari: full + 3 drags) | `detail-similar-section` | all 5 |
| name sheet | a similar name opened (גבריאלה) | tap on its chip | `detail-similar-opened` | all 5 |
| toast | vote on a similar name in the sheet ("נשמר: גבריאלה") | "שמירה" in the sheet on the similar name | `toast-sheet-vote` | Playwright 4 |
| name sheet | together badge ("התאמה · שניכם שמרתם…") | pair space, match on נועם (seen), `?sheet=name&n=נועם`, full | `detail-together` | Playwright 4 |
| name sheet | details loading (skeleton lines) | `details.*.json` never answers | `detail-loading` | Playwright 4 |
| name sheet | details offline line | `details.*.json` aborted | `detail-offline` | Playwright 4 |
| filters sheet | default | `?sheet=filters` | `filters-default` | all 5 |
| filters sheet | a chip chosen ("בת", count 518) | tap | `filters-selected` | all 5 |
| filters sheet | scrolled to the end (popularity, trend, origin, length, letter, hidden) | sheet body scrolled | `filters-scrolled` | Playwright 4 |
| background sheet | default (בדים chosen) | `?sheet=background` | `background-default` | all 5 |
| background sheet + toast | own photo saved ("התמונה נשמרה במכשיר הזה.") | file input with `name-detail/shots/qa-own-bg.jpg` | `background-own-saved` | Playwright 4 (WebKit: error toast, see gaps) |
| about sheet | default | `?sheet=about` | `about-default` | all 5 |
| report sheet | default (about the top card) | `?sheet=report` (Safari focuses the field: keyboard bar) | `report-default` | all 5 |
| survey sheet | default | `?sheet=survey` | `survey-default` | all 5 |
| match sheet | new match (נועם) | pair space, `name_matches` → נועם, not seen | `match-default` | Playwright 4 |
| decision sheet ("בחרנו שם", over lists) | solo ("בחרתי שם") / shared ("בחרנו שם") | `chosen` pref = נועם, `/names/lists?sheet=decision` | `decision-solo`, `decision-shared` | Playwright 4 |

45 states: 45 shots each in webkit, chromium, webkit375 and webkit320; 23 in sim. 203 PNGs.

**Gaps (with reasons):**
- Simulator Safari (22 states not shot): it runs against the real backend and Safari can't route Supabase, so states that need made-up votes, a pair space, a match, a chosen name, offline or a blocked data file (`deck-drag-*` too: cliclick can't hold a drag for a screenshot) are Playwright only. The one write it did (an accidental "דילוג" on גבריאל, kept as `deck-after-vote-sim`) was undone with "ביטול" right away; after a reload גבריאל is card 1 of 1295 again.
- Own photo in Playwright WebKit: the upload fails ("אי אפשר לפתוח את התמונה הזו…", the WebKit-driver limit found in the detail run, `name-detail/shots/qa1-j-idb.mjs`), so `background-own-saved-webkit*` show the error toast and `deck-bg-own-webkit*` / `detail-70-bg-own-webkit*` show the fabric fallback. The own photo is real in Chromium and in Safari.

**Seen while taking them** (for the audits to judge; not findings yet):
- `webkit320`: the header drops the "בחירת שם" title and the action bar drops its icons (narrow-screen rules); the recap panel cuts the Nest card at the bottom (the panel scrolls).
- `deck-end-solo`: "לשמות שלי" is a small pill in the solo state and a full button in the shared one (the invite link sits under it).
- `report-default-sim`: the textarea takes focus on open, so the keyboard bar covers the lower sheet in Safari.
- `detail-similar-section-sim`: a drag over the year chart leaves its tooltip on.
- Pause, end and empty panels repeat the Nest app card (`deck-end-*`, `deck-pause-recap`, `decision-*`).

## Screens G3

Baseline inventory of group 3 (Lists and settings, PRD §6), taken by US-007 on 2026-11-07 before any polish, at `f513415` (no app code change since the detail run). Audits and QA use this list of screens and states and these names.

**Where:** `scripts/ralph/qa/name-polish/shots/baseline/G3/` (gitignored), named `<screen>-<state>-<browser>.png`. Browsers as in G1/G2: `webkit` (iPhone 15, 393 × 659), `chromium` (Pixel 7, 412 × 839), `webkit375` (375 × 667), `webkit320` (320 × 568), `sim` (Mobile Safari, iPhone 17 Pro). Pages taller than the viewport also have a `<screen>-<state>-full-<browser>.png` (full page): `lists-saved-default`, `lists-chosen-banner`, `settings-shared`, `privacy-default`, `terms-default` in every Playwright variant, plus `settings-solo`, `duel-done`, `duel-midway` where they overflow, and at 320 also `lists-matches-default`, `lists-matches-offline`, `duel-round-1`, `duel-matches`, `about-default`.

**How (re-run for the after shots):**
- Playwright, production build :3100, QA user 1: `QA_SHOTS_DIR=scripts/ralph/qa/name-polish/shots node scripts/ralph/qa/name-polish/shots/us007-g3.mjs [webkit|chromium|webkit375|webkit320] [--only saved,matches,duel,hidden,settings,pages]`. Same mocks as `us006-g2.mjs` (`names_space`, `space_members` solo or a pair with "עומר", `name_votes` GET a list made for the state with writes echoed and never sent, `name_matches`, tracking). The saved list is 8 rows: 2 loved, 5 kept, 1 custom ("זוהרית"); hidden adds 4 hidden names; matches are 3 (one new and loved). Settings dialogs are opened by URL (`?dialog=delete-account`, `?dialog=leave-space`) and never confirmed.
- Simulator: `QA_SHOTS_DIR=… node scripts/ralph/qa/name-polish/shots/us007-sim.mjs url <shot> <path>` on `http://localhost:3100` with QA user 1 and the real backend, by URL only (no taps, no writes). QA user 1 is really in a shared space (with QA2) with nothing saved or hidden, so Safari shows the empty and shared states.

| Screen | State | How it's reached | Shots (`-<browser>.png`) | Browsers |
|---|---|---|---|---|
| `/names/lists` "שמרתי" | rows: loved first with "אהבתי מאוד", a custom name ("שם שהוספתי"), meta line, duel link | 8 saved votes | `lists-saved-default` (+ `-full`) | Playwright 4 |
| `/names/lists` "שמרתי" | empty ("עוד לא נשמרו שמות.") | no votes | `lists-saved-empty` | all 5 |
| `/names/lists` row menu | open on the first row ("בחרתי בשם…", "הסרה מהרשימה", "לא להציג יותר") | tap "אפשרויות עבור אריאל" | `lists-row-menu` | Playwright 4 |
| `/names/lists` chosen banner | "השם שבחרתי · מוחמד" above the tabs | `chosen` pref | `lists-chosen-banner` (+ `-full`) | Playwright 4 |
| add-name sheet | default (empty field, hint) | "הוספת שם" (Safari: `?sheet=add-name`, keyboard up) | `add-name-default` | all 5 |
| add-name sheet | error "כבר ברשימה" | a saved name typed + "הוספה לרשימה" (nothing written) | `add-name-error` | Playwright 4 |
| `/names/lists` "התאמות" | solo: "בוחרים ביחד?" invite card | solo space, `?tab=matches` | `lists-matches-solo` | Playwright 4 |
| `/names/lists` "התאמות" | shared, none yet ("עוד אין התאמות.") | pair space, no matches | `lists-matches-empty` | all 5 |
| `/names/lists` "התאמות" | shared rows ("חדש", loved mark, meta), duel link | pair space, 3 matches, 2 seen | `lists-matches-default` | Playwright 4 |
| `/names/lists` "התאמות" | offline: "עודכן לאחרונה ב־…" line | same, then `setOffline` | `lists-matches-offline` | Playwright 4 |
| duel | too few names ("לדו־קרב צריך לפחות שני שמות ברשימה.") | 1 saved, `?tab=duel&from=saved` | `duel-few` | all 5 |
| duel | round 1 (progress bar, two name cards, "או", "עצירה…") | 8 saved | `duel-round-1` | Playwright 4 |
| duel | mid-way ("החמישייה עד עכשיו" chips) | 4 picks of the first card | `duel-midway` | Playwright 4 |
| duel | done (ranked five, "בחרתי בשם…", "דו־קרב חדש") | first card picked until the end | `duel-done` | Playwright 4 |
| duel | between matches (source toggle "בין: שמרתי · התאמות") | pair space, 3 matches, `from=matches` | `duel-matches` | Playwright 4 |
| `/names/hidden` | list with "החזרה" buttons | 4 hidden votes | `hidden-default` | Playwright 4 |
| `/names/hidden` | empty ("אין שמות מוסתרים") | no hidden votes | `hidden-empty` | all 5 |
| `/names/settings` | solo (no leave row) | solo space | `settings-solo` (+ `-full`) | Playwright 4 |
| `/names/settings` | shared (with "יציאה מהבחירה המשותפת") | pair space | `settings-shared` (+ `-full`) | all 5 |
| `/names/settings` dialog | delete account ("למחוק את החשבון?"), display only | `?dialog=delete-account` | `settings-delete-dialog` | all 5 |
| `/names/settings` dialog | leave shared choice ("לצאת מהבחירה המשותפת?"), display only | pair space, `?dialog=leave-space` | `settings-leave-dialog` | all 5 |
| `/names/about` | default | direct | `about-default` | all 5 |
| `/names/privacy` | default (draft banner) | direct | `privacy-default` (+ `-full`) | all 5 |
| `/names/terms` | default (draft banner) | direct | `terms-default` (+ `-full`) | all 5 |

24 states: 24 shots each in webkit, chromium, webkit375 and webkit320, plus 33 `-full` shots; 11 in sim. 140 PNGs.

**Gaps (with reasons):**
- Simulator Safari (13 states not shot): it runs against QA user 1's real data (shared space, nothing saved or hidden) and Safari can't route Supabase, so states that need saved, hidden or matched names, a solo space, a chosen name, offline, or a submit/tap that could write are Playwright only. Its full-page settings, privacy and terms are not taken (Safari screenshots are the visible screen).
- The settings screens show QA user 1's sign-in email; the shots stay in the gitignored folder.

**Seen while taking them** (for the audits to judge; not findings yet):
- `webkit375` / `webkit320`: the "השמות שלי" title wraps to two lines beside the invite and "הוספת שם" buttons; at 320 a saved row's meta line wraps ("יציב" alone on the second line).
- Chromium has no "התקנה למסך הבית" row in settings (the install mode differs), WebKit and Safari do.
- The duel's empty "too few" card sits over the blurred peach blob, the rest of the screen is blank.
- Empty states in lists, matches and hidden use three different patterns (card with a link, card with a title + line + link, plain centered line).
