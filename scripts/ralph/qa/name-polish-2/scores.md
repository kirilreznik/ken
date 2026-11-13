# Name swiper polish, second run: impeccable critique scores

Per screen and heuristic, from impeccable's critique (`.claude/skills/impeccable/`). The reference is the first run's after state (`scripts/ralph/qa/name-polish/scores.md`, "After (re-score)"); this run's after tables are filled by `US-R1…R3` with the same screens, heuristics, scale and method, so the rows compare.

One matrix per group: screens as rows, Nielsen's heuristics H1–H10 as columns (impeccable `reference/critique.md` "Heuristics Scoring Guide", 0–4 each). `n/a` follows the skill's mode-applicability rule (H7/H10 on Persuade surfaces, or a heuristic the screen gives nothing to judge), and the total is renormalized to the applicable maximum; the band reads off the percentage (90 %+ Excellent, 70 %+ Good, 50 %+ Acceptable, 30 %+ Poor).

H1 system status · H2 match with the real world · H3 user control and freedom · H4 consistency and standards · H5 error prevention · H6 recognition over recall · H7 flexibility and efficiency · H8 aesthetic and minimalist design · H9 error recovery · H10 help and documentation.

## Baseline performance

Measured by US-002 (the first run's US-004 method). Budget (`tasks/prd-name-polish.md` §3.1.8): `/names` first-load JS ≤ baseline + 3 KB gzipped, CLS 0 on the swipe screen, detail sheet open < 150 ms.

## Stale check

Written by US-002: backlog rows whose files changed since `f430a9c`, and what changed. Nothing is dropped here; each item story decides.

## After (re-score)

Same method, rows, columns, n/a rule and bands as the first run's after tables (US-R1…R3). Each group has the after matrix, then the change per screen against the first run's after row.

## Self-audit performance (US-SA)

`/names` first-load JS against the US-002 baseline (+3 KB budget).
