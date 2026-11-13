# Name swiper polish, second run: impeccable critique scores

Per screen and heuristic, from impeccable's critique (`.claude/skills/impeccable/`). The reference is the first run's after state (`scripts/ralph/qa/name-polish/scores.md`, "After (re-score)"); this run's after tables are filled by `US-R1…R3` with the same screens, heuristics, scale and method, so the rows compare.

One matrix per group: screens as rows, Nielsen's heuristics H1–H10 as columns (impeccable `reference/critique.md` "Heuristics Scoring Guide", 0–4 each). `n/a` follows the skill's mode-applicability rule (H7/H10 on Persuade surfaces, or a heuristic the screen gives nothing to judge), and the total is renormalized to the applicable maximum; the band reads off the percentage (90 %+ Excellent, 70 %+ Good, 50 %+ Acceptable, 30 %+ Poor).

H1 system status · H2 match with the real world · H3 user control and freedom · H4 consistency and standards · H5 error prevention · H6 recognition over recall · H7 flexibility and efficiency · H8 aesthetic and minimalist design · H9 error recovery · H10 help and documentation.

## Baseline performance

Measured by US-002 (the first run's US-004 method). Budget (`tasks/prd-name-polish.md` §3.1.8): `/names` first-load JS ≤ baseline + 3 KB gzipped, CLS 0 on the swipe screen, detail sheet open < 150 ms.

Measured on 2026-11-13, `npm run build` at `27de04d` (no app code change since the run start), production server `next start -p 3100` from this worktree.

**First-load JS** (every `/_next/static/*.js` referenced by the prerendered HTML, each gzipped at level 9 and summed; the first run's `us004-size.mjs` copied as `shots/us002-size.mjs`, run as `node scripts/ralph/qa/name-polish-2/shots/us002-size.mjs`):

| Route | Files | Raw (B) | Gzipped (B) | First run's after (US-SA) |
|---|---|---|---|---|
| `/names` | 15 | 991,468 | **301,164** | 300,633 |
| `/names/lists` | 15 | 974,708 | 295,558 | 295,007 |
| `/names/welcome` | 13 | 912,246 | 274,258 | 273,930 |

`/names` budget ceiling for this run: 301,164 + 3,072 = **304,236 B gzipped**. (The ~0.5 KB over the first run's after number comes from the work merged since, PR #20's deck change, not from this run.)

**Interaction** (Chromium as Pixel 7 with touch, QA user 1, no CPU throttle, service workers blocked, votes/matches/track mocked so nothing is written; the first run's `us004.mjs` copied as `shots/us002.mjs`, run as `QA_SHOTS_DIR=scripts/ralph/qa/name-polish-2/shots node scripts/ralph/qa/name-polish-2/shots/us002.mjs`; two runs):

| Measure | Method | Run 1 | Run 2 |
|---|---|---|---|
| CLS during 5 swipes (keep, skip, love, keep, skip, touch `drag()`) | `PerformanceObserver` `layout-shift`, entries without `hadRecentInput` summed | 0 (0 entries) | 0 (0 entries) |
| Tap → sheet visible, 3 opens (ms) | `performance.measure` from the `pointerup` timestamp to the frame after `section[role=dialog] h2` is in the DOM; 1st open loads the sheet chunk | 55, 48, 49 | 73, 50, 46 |
| CLS over the whole run (swipes + 3 opens/closes) | same observer | 0 | 0 |

Shots: `shots/us002-chromium-after-swipes.png`, `shots/us002-chromium-sheet.png` (read: sheet for אלכסנדרה over the deck, 863-name position line).

## Stale check

Written by US-002: backlog rows whose files changed since `f430a9c`, and what changed. Nothing is dropped here; each item story decides.

Checked on 2026-11-13 at `27de04d`. `git diff --stat f430a9c HEAD -- src` touches only 4 app files, all from PR #20 ("keep the deck to names in use among Jewish Israelis, drop the origin filter"):

- `src/components/names/FiltersSheet.tsx`: the "נפוץ בקרב" chip group (`ORIGINS`, `SECTOR_LABELS`, `Sector`) removed; the doc comment updated.
- `src/components/names/swipe/SwipeScreen.tsx`: `origin` dropped from the filters-used analytics object (one line).
- `src/lib/names/filters.ts`: `Sector`, `SECTOR_LABELS`, `Filters.origin` and its match removed; `FilterableCard.stats` no longer needs `s`.
- `src/lib/names/prefs.ts`: an old saved `origin` is dropped on read.

The name data changed too (not ours to touch): the deck is now **863 names** (was ~1,300), from `data/names/**` and `scripts/names-content/**`.

**Rows whose files changed:**

| Row | File changed | Effect on the item |
|---|---|---|
| NP-059 | FiltersSheet.tsx | Still present: local `chipClass(on)` at FiltersSheet.tsx:75; one chip group fewer to restyle. |
| NP-058 | FiltersSheet.tsx | Still present: filter rows have no pressed fill; the origin group is gone from the shots. |
| NP-133 | FiltersSheet.tsx | Still present ("ניתן לבחור", "אדמה/יבשה", "כל האורכים"); untouched by the removal. |
| NP-134 | FiltersSheet.tsx | Still present: apply disabled only when `n === null`. One filter fewer, so a 0 result is a bit harder to reach; the row's own repro (ת + ארוך) still has to be checked on the new deck. |
| NP-079 | FiltersSheet.tsx | Still present (no `formatCount`). The deck is now 863, so real counts no longer reach 1,000; the verify ("1,284 everywhere") needs a probe with a larger made-up count. |
| NP-092 | swipe/SwipeScreen.tsx | Still present (`setEntered(true)` in `decideOther`); the removed line is unrelated. |
| NP-091 | swipe/SwipeScreen.tsx | Still present (`undo()` only `setTop`); unrelated. |
| NP-087 | swipe/SwipeScreen.tsx | Still present (`max-[20rem]:h-auto`, pan-y only on overflow); unrelated. |

**Every row against the code** (all 117 rows read against their files): 108 still present as written, 8 partly fixed, 1 looks fixed. Only the 9 that aren't plainly present are listed.

| Row | State | Evidence |
|---|---|---|
| NP-123 | looks fixed | MatchSheet.tsx:102-104 takes `cards` and shows `card.content.niqqud`; SwipeScreen.tsx:344 passes them (done with NP-122, `ebed33e`). ListsScreen doesn't render MatchSheet. |
| NP-111 | partly | BottomSheet.tsx:228 handle is `tabIndex=-1` with `closeInHeader`, but not `aria-hidden`, so it still reads as a second "סגירה". |
| NP-098 | partly | BottomSheet exit animation only with `detents`; Dialog.tsx and RowMenu.tsx have no exit state. |
| NP-042 | partly | InviteScreen.tsx:159,220 both sections have `text-card-title` h2s; the card layout part is untouched. |
| NP-051 | partly | Only AddNameSheet.tsx:78 has `enterKeyHint`; no `autoCorrect` on the name fields (Intro, Onboarding, Settings). |
| NP-115 | partly | Chart tip is clamped (YearChart.tsx:84); zero still reads "0 תינוקות" (detail.ts:173). |
| NP-023 | partly | JoinScreen.tsx:98,132,144,164 still has several `role=status` regions, not one always-mounted one. |
| NP-070 | partly | DESIGN.md:233-247 has the type roles; the shared components this run adds aren't documented yet (expected: later stories add them). |
| NP-146 | partly | "בחירה ביחד" / "לבחור ביחד" / "הבחירה המשותפת" still differ (SettingsScreen.tsx:336-349, EmptyDeck.tsx:95). |

NP-112 stays present: SourceSection.tsx:16 still renders `<footer>` (the row's change is a `div`). NP-040 and NP-120 were read from code only; the runtime check is left to their stories.

## After (re-score)

Same method, rows, columns, n/a rule and bands as the first run's after tables (US-R1…R3). Each group has the after matrix, then the change per screen against the first run's after row.

## Self-audit performance (US-SA)

`/names` first-load JS against the US-002 baseline (+3 KB budget).
