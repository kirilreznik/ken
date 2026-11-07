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
