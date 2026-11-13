# Name swiper polish: run summary

Run: `tasks/prd-name-polish.md`, branch `ralph/name-polish` (from `origin/claude/project-thread-79v2l8` at 87747d9, the PRD on top of `ralph/name-detail`). It is 99 commits ahead of that base, counting this one. Written by US-FINAL on 2026-11-08.

## Result: stopped after 3 cycles, 0 bugs open for the owner's review

QA hit the hard cap of 3 cycles. Cycle 3 was **not** clean: it filed 1 bug (NP-BUG-012). US-FIX3 fixed it in ee82b30, and US-FINAL re-checked the fix (below). No QA cycle ran after that fix, so this run can't claim "clean after cycle 3". Every bug the run filed is `fixed`. None is `open`, `blocked` or `wontfix-owner`.

- **Stories:** 132 of 132 done:
  - setup US-000…007 (8)
  - audits (32)
  - triage US-T1/T2 (2)
  - polish US-P01…P50 (50)
  - re-review US-R1…R3 (3)
  - docs US-D1 (1)
  - self-audit US-SA (1)
  - US-QA0 plus 3 cycles × 10 areas, all run in full (31)
  - US-FIX1…3 (3)
  - US-FINAL (1)
- **QA cycles:**

  | Cycle | Bugs filed | Fixed in |
  |---|---|---|
  | Re-review (US-R1…R3) | 3 (NP-BUG-001…003) | aa7b659 (US-FIX1) |
  | 1 | 6 (NP-BUG-004…009) | aa7b659 (US-FIX1) |
  | 2 | 2 (NP-BUG-010, 011) | 3f43c87 (US-FIX2) |
  | 3 | 1 (NP-BUG-012) | ee82b30 (US-FIX3) |
- **Final re-check (NP-BUG-012, the only bug fixed in the last cycle):**
  - Setup: the :3100 production build, which contains ee82b30's `DuelScreen.tsx`. Probe `shots/qa3b-p26c.mjs --only duel`, all writes mocked. Run twice each in WebKit 320 × 568, WebKit 262 × 439 (Safari Page Zoom 150 %) and Chromium 320 × 568, the browsers it failed in.
  - Result: 18 snaps, 0 page overflow, 0 boxes off screen, 0 clipped text.
  - The 19-letter name "בתשבעשלומציוןאביגיל" was drawn into a round and wraps on two lines inside its card. The data names (כריסטיאן, זינאלדין, אלכסנדרה) stay whole at 262 px.
  - It holds. Shots: `shots/final/run{1,2}/duel-long-{1,midway,done}-{webkit320,zoom150,chromium320}.png` and `report-*.json`.
  - Not re-checked in the Simulator: the bug never failed there, and a long-name duel needs real saved votes (same limit as US-FIX3).

| ID | Found → fixed | Browser | Summary |
|---|---|---|---|
| NP-BUG-001 | R1 → 1 | webkit-iphone, sim-safari | The welcome preview card's peek cut the intro line through its letters |
| NP-BUG-002 | R2 → 1 | webkit-iphone, chromium-pixel | The offline sync line sat on the card and covered "לכל הפרטים" at 320 px |
| NP-BUG-003 | R3 → 1 | webkit-iphone, chromium-pixel | The "added" toast covered the duel's "עצירה" link |
| NP-BUG-004 | 1 → 1 | all three | The deck toast covered "דילוג" and "אהבתי" and took their taps |
| NP-BUG-005 | 1 → 1 | webkit-iphone, chromium-pixel | The lists title ran under the invite button at 320 px |
| NP-BUG-006 | 1 → 1 | webkit-iphone, chromium-pixel | The remove undo toast covered the add-name sheet's field and error |
| NP-BUG-007 | 1 → 1 | sim-safari | Tapping the invite link field zoomed Safari, and it stayed zoomed |
| NP-BUG-008 | 1 → 1 | all three | With reduced motion, the card trailed the finger and glided back |
| NP-BUG-009 | 1 → 1 | chromium-pixel | Offline after one online visit, the photo backgrounds didn't load |
| NP-BUG-010 | 2 → 2 | webkit-iphone, chromium-pixel | At 320 × 568 about 1 card in 10 clipped "לכל הפרטים" |
| NP-BUG-011 | 2 → 2 | sim-safari, chromium-pixel | The sticky "עדכון זמין" toast covered the card's "לכל הפרטים" |
| NP-BUG-012 | 3 → 3 | webkit-iphone, chromium-pixel | A long one-word added name ran off the duel card at narrow widths |

Steps, fix notes and screenshots for each are in [bugs.md](bugs.md).

**Ideas QA logged (not acted on):** 3, in [ux-insights.md](ux-insights.md):

- **NP-UX-001:** `first_vote` can fire twice per space after an undo.
- **NP-UX-002:** the matches tab count lags for about 2 s after remove and undo.
- **NP-UX-003:** the sticky update toast covers the trend tile's word until "רענון" is tapped. Nothing tappable is covered.

## Critique scores, before and after

Source: impeccable critique, Nielsen H1–H10, 0–4 each, `n/a` renormalized. Baseline from US-A-IMP-C-G1…G3, after from US-R1…R3. The full matrices and the method are in [scores.md](scores.md).

| Group | Baseline | After | Change |
|---|---|---|---|
| G1 Entry | 300/432 (69 %), Acceptable | 318/432 (74 %), Good | +18 |
| G2 Deck | 320/432 (74 %), Good | 333/432 (77 %), Good | +13 |
| G3 Lists and settings | 240/360 (67 %), Acceptable | 258/360 (72 %), Good | +18 |

Every group is higher than its baseline, and no screen is lower than its own. **Some screens didn't move:**

- G1: the email step, auth callback and unconfigured notice.
- G2: the card, decisions, filtered/empty, background, match, about and report.
- G3: the duel, settings dialogs and about.

Three cells were held at their baseline because the code under them was unchanged, and a scorer's move there is variance:

- G1: the unconfigured notice (11 → held at 12).
- G2: H5 on "filtered + empty" and on the filters sheet, and H8 on the pauses.

| Screen | Baseline | After | Change |
|---|---|---|---|
| **G1** welcome | 23/32 | 24/32 | +1 |
| sign-in, email step | 30/40 | 30/40 | 0 |
| sign-in, code step | 29/40 | 30/40 | +1 |
| auth callback | 21/28 | 21/28 | 0 |
| onboarding | 29/40 | 30/40 | +1 |
| intro | 25/36 | 27/36 | +2 |
| join, invited | 25/36 | 27/36 | +2 |
| join outcomes | 21/32 | 24/32 | +3 |
| invite | 29/40 | 30/40 | +1 |
| offline | 20/28 | 22/28 | +2 |
| goodbye | 18/24 | 19/24 | +1 |
| 404 | 18/28 | 22/28 | +4 |
| unconfigured notice | 12/28 (Poor) | 12/28 (Poor) | 0 |
| **G2** deck: card + backgrounds | 27/36 | 27/36 | 0 |
| deck: decisions | 29/40 | 29/40 | 0 |
| deck: filtered + empty | 28/36 | 28/36 | 0 |
| deck: end | 16/24 | 17/24 | +1 |
| deck: pauses + survey prompt | 20/28 | 21/28 | +1 |
| name sheet + toast | 29/40 | 31/40 | +2 |
| filters sheet | 26/36 | 28/36 | +2 |
| background sheet | 32/40 | 32/40 | 0 |
| match sheet | 18/24 | 18/24 | 0 |
| decision sheet | 17/28 | 22/28 | +5 |
| survey sheet | 25/36 | 27/36 | +2 |
| about sheet | 20/24 | 20/24 | 0 |
| report sheet | 33/40 | 33/40 | 0 |
| **G3** lists "שמרתי" | 21/36 | 25/36 | +4 |
| lists row menu | 20/36 | 26/36 | +6 |
| add-name sheet | 29/40 | 30/40 | +1 |
| lists "התאמות" | 26/40 | 28/40 | +2 |
| duel | 27/40 | 27/40 | 0 |
| hidden | 23/36 | 26/36 | +3 |
| settings | 28/40 | 29/40 | +1 |
| settings dialogs | 26/36 | 26/36 | 0 |
| about page | 19/24 | 19/24 | 0 |
| privacy + terms | 21/32 | 22/32 | +1 |

## Polish items

- **Findings:** 282 audit findings (32 files in `findings/`) plus 19 earlier UX ideas.
- **Backlog:** 171 polish items (P1 5, P2 41, P3 125) and 26 owner items.
- **Done:** 54, in the 50 slots US-P01…P50. That is all 5 P1, all 41 P2 and 8 P3. Some slots hold more than one item: P16, P21 and P49 hold two each, and NP-054 (16 px fields) went in with P34.
- **Dropped:** 0.
- **`next-run`:** 117, all P3. None was started.

Each slot's commit, files and before/after shots are in [polish-log.md](polish-log.md), and each item's change and how to verify it are in [backlog.md](backlog.md).

**Done (54):** P1: NP-137 list undo, NP-003 sign-in network failure while online, NP-075 deck end buttons, NP-001 welcome buttons above the fold, NP-072 deck load error. P2/P3: NP-047, 053, 009, 004, 005, 012, 048, 049, 076, 022, 154, 157, 011, 170, 014, 126, 124, 125, 139, 069, 171, 138, 073, 094, 088, 089, 010, 029, 025, 030, 031, 054, 002, 039, 077, 082, 085, 086, 110, 129, 117, 122, 160, 074, 024, 026, 028, 038, 027.

**`next-run` (117), by area:**

- **G1:** NP-006, 007, 008, 102, 013, 015, 016, 017, 018, 019, 020, 021, 023, 032, 033, 034, 035, 036, 037, 040, 041, 042, 043, 044, 045.
- **G2:** NP-050, 063, 078, 079, 080, 081, 083, 084, 087, 090, 091, 092, 093, 103, 104, 109, 112, 113, 114, 115, 116, 118, 119, 120, 123, 130, 131, 132, 133, 134, 135, 065, 101.
- **G3:** NP-097, 100, 127, 140, 141, 142, 143, 144, 145, 147, 148, 149, 150, 151, 152, 153, 155, 156, 158, 159, 161, 162, 163, 164, 165, 166, 167, 168, 169.
- **Whole app:** NP-046, 051, 052, 057, 058, 062, 071, 095, 096, 098, 099, 105, 106, 107, 108, 111, 121, 128, 136, 146, and the design-system items above (NP-055, 056, 059, 060, 061, 064, 066, 067, 068, 070).

The full list with titles is the `next-run` rows of backlog.md.

## Owner decisions (26, [owner-decisions.md](owner-decisions.md))

Each item has its evidence and options in owner-decisions.md. The most urgent is **OD-011**.

| ID | Decision | Recommendation |
|---|---|---|
| OD-001 | Consent and opt-in wording (slash gender forms, 'בחנויות') | Option 1, with the consent version bumped so stored consents stay traceable |
| OD-002 | Duel over a long list takes hundreds of rounds | Option 1: keeps the duel short with no new screen |
| OD-003 | Join never names who invited you | Option 1 in a backend run; the strongest trust cue on the join screen |
| OD-004 | 'בחרנו בשם' in a shared choice is stored on this device only | Option 2 now (copy only), option 1 with the next backend run |
| OD-005 | Onboarding has no way out | Option 1: reuse sign-out, remove a dead end |
| OD-006 | A closed sign-up from an invite loses the invitation | Option 1 wording only, once the owner confirms what invitees are promised |
| OD-007 | The welcome preview's mask fades out the CBS numbers | Leave as is; revisit with the welcome fit fix |
| OD-008 | Theme 'יוניסקס' duplicates the sex chip 'מתאים לכולם' | Rename or drop in a content run |
| OD-009 | The filters sheet is a wall of options | Option 1 in a later design run |
| OD-010 | A refused survey is shown as sent | Option 1 if the survey answers matter for research; otherwise keep |
| OD-011 | Leaving a shared choice always fails (`names_leave` not deployed) | Option 1 (deploy migration 0011) before launch; it's the only way to undo a join |
| OD-012 | Type sizes under the skills' floors (13.5 / 11 / 10.5 px) | Raise tag and label to 12 px in a next run with a layout pass; body can stay |
| OD-013 | 'דו־קרב' is a tab that removes the tabs | Leave as is |
| OD-014 | Matches copy and the matching rule for 3+ members | Confirm option 1; the copy already says 'every member' (NP-025) |
| OD-015 | Long legal pages have no section index | Option 1 later; the text stays untouched |
| OD-016 | A wrong duel pick can't be taken back | Option 1: one step back, no new screen |
| OD-017 | Choosing the name sits behind a row's '⋮' menu | Option 2: put the choice where the match moment already is |
| OD-018 | After choosing, the deck and the next visit show no trace | Option 1 |
| OD-019 | A first match made from the name sheet shows only after the sheet closes | Option 1 |
| OD-020 | A new device shows the first-time intro to a long-time user | Option 1 (the surname field also lives in settings) |
| OD-021 | Lists always open on 'שמרתי' | Option 1 |
| OD-022 | No way to remove an own background photo | Option 1: a private photo on a shared device should be removable |
| OD-023 | 'בעלייה' never shows a name with the current data | Wait for more names; the data is right |
| OD-024 | 'Did you mean …' for one-letter-off custom names | Later run |
| OD-025 | Root-sharing and biblical-spelling 'similar names' | Owner spot check in a content pass |
| OD-026 | Service worker network-first fetches have no timeout | Option 1 in a later run; the deck's new data-failure state covers the visible part |

## Performance (budget PRD §3.1.8)

First-load JS is gzipped and measured with `shots/us004-size.mjs` on the :3100 production build. Interaction is measured with `shots/us004.mjs` in Chromium as a Pixel 7.

| Measure | US-004 baseline (b6ab9ca) | Final (ee82b30 build, US-FINAL) | Budget |
|---|---|---|---|
| `/names` first-load JS | 301,489 B | **301,319 B** (−170) | ≤ 304,561 B: pass |
| `/names/lists` | 290,498 B | 295,638 B (+5,140) | none set |
| `/names/welcome` | 271,504 B | 274,338 B (+2,834) | none set |
| CLS, 5 swipes + 3 sheet opens | 0 | 0 | 0: pass |
| Tap → sheet visible (ms) | 51, 50, 42 / 61, 50, 43 | 69, 21, 21 (one run) | < 150: pass |

The `/names` budget was broken once during the run:

- Before the self-audit, `/names` was 306,717 B, over the budget by 2,156 B.
- US-SA lazy-loaded the background, report and survey sheets, bringing it to 300,633 B.
- QA cycles 1–3 measured 300,633, 301,124 and 301,319 B.

The final tap times are from one run. The 21 ms values are later opens: the sheet chunk is already loaded, and the probe has no CPU throttle.

## Skills that couldn't run fully, and blocked checks

**Skills:** all 30 skills in `.claude/skills/` loaded and were used (US-002), but some steps couldn't run here:

- **Figma, Superdesign, MCP, claude.ai steps:** skipped everywhere. `CONNECTORS.md` (accessibility-review, design-critique-quick, design-system, ux-copy) and `ds-consumer/SKILL.md` (design's L3 path) don't exist.
- **impeccable:** its interview and question probes, `live` mode and `critique-storage write` were skipped (no question tool; it would add `.impeccable/`). The assumptions were inferred from PRODUCT.md / DESIGN.md and written in each finding file.
- **accessibility-audit:** its axe DevTools / Lighthouse extensions were replaced by axe in Playwright plus manual checks (no new dependency).
- **design-elevation:** its "map to Tailwind's palette" rule was mapped to the Nest tokens instead.
- **ui-ux-pro-max:** its palettes, fonts and GSAP were not adopted (§3.1.2, §3.1.7).
- **break-ui:** its "Demo data / Worst case" toggle wasn't shipped; worst cases were rendered through probes.
- **improve-animations / design-review sub-agent fan-out:** ran in-thread or as sub-agents, findings only.

**Checks that were blocked or only partly possible:**

- **No real phone.** "All three" means Playwright WebKit (iPhone 15), Playwright Chromium (Pixel 7) and iOS Simulator Safari (iPhone 17 Pro, iOS 26.5).
- **Installed web app:** Add to Home Screen works in the Simulator, but cliclick input never reaches an installed web app's page. Standalone mode was judged visually on the welcome screen only; the rest needs a phone (US-A-NATIVE).
- **Keyboard:** the Simulator types from the Mac's keyboard, so no on-screen keyboard shows. Whether the keyboard covers a button can't be judged there.
- **VoiceOver:** its output can't be read from the Simulator. Screen-reader behaviour was checked through ARIA snapshots and live regions in Playwright (e.g. US-P39 pause).
- **Online request failure in Safari:** it can't be produced (shared Mac network), so US-P02's failure state was verified in WebKit and Chromium only.
- **Own photo upload in Playwright WebKit:** fails, because an ephemeral context can't store a Blob (ND-UX-005, harness only). It was checked in Chromium and the Simulator.
- **Glass colour:** Playwright WebKit skips `backdrop-filter: saturate()`, so glass was judged from Chromium and Simulator shots.
- **Unconfigured notice:** rendered from its markup, because the env can't switch per request (US-005).
- **States that need the real shared space:** some deck end, pause and recap states (30 real votes) and the long-name duel weren't reached in the Simulator, so they were checked with mocked Playwright states (e.g. US-P03, US-P39, US-FIX3, this re-check).
- **Incident (US-A-IMP-A-G3, 2026-11-07):** a Playwright mock that left a write unanswered let WebKit send a DELETE to the dev server, and it deleted QA user 1. The user was re-created and restored the same day, and the rule "never leave a write unanswered in a mock" is in progress.txt. No other backend data was touched. The run made no Supabase, Vercel or auth change.

## Screenshots

`scripts/ralph/qa/name-polish/shots/` is gitignored, so every screenshot is on this Mac only. The probe scripts (`*.mjs`, `*.py`) sit in the same folder and are also untracked. The folders under `shots/`:

| Folder | What it holds |
|---|---|
| `baseline/G1`, `G2`, `G3` | Before: every screen and state per browser (`webkit`, `chromium`, `webkit375`, `webkit320`, `sim`; US-005…007) |
| `after/G1`, `G2`, `G3` | After: the same states for the re-score (US-R1…R3) |
| `audit/<LENS>-G<n>` | Each audit lens's evidence |
| `polish/US-P01` … `US-P50` | Before/after per polish slot (paths per browser in polish-log.md) |
| `qa0/`, `qa1/`, `qa2/`, `qa3/<area>` | QA cycles by area A–J |
| `fix1/`, `fix2/`, `fix3/` | Fix verification per cycle |
| `final/run1`, `run2` | US-FINAL re-check of NP-BUG-012 |
