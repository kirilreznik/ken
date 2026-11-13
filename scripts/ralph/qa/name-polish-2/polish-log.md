# Name swiper polish, second run: polish log

One row per item story (`US-NP0xx`) that changed code, `tasks/prd-name-polish-2.md` and `tasks/prd-name-polish.md` §7. Dropped items are only marked in `backlog.md` (with the reason). Before and after screenshots per browser in `scripts/ralph/qa/name-polish-2/shots/` (`webkit-iphone`, `chromium-pixel`, `sim-safari`).

| Slot | Backlog IDs | Commit | Files | Before (per browser) | After (per browser) | Notes |
|---|---|---|---|---|---|---|
| US-NP055 | NP-055 (DS-ALL-03, ELEV-G1-01, ELEV-G2-01, PRO-G2-03) | (this commit) | ui/classes.ts, DecisionButtons.tsx, swipe/ActionBar.tsx, swipe/SwipeHeader.tsx, SettingsScreen.tsx, DESIGN.md | shots/US-NP055/before-{deck-end-fabric,deck-end-none,deck-undo,signin-code,onboarding}-{webkit,chromium}.png, before-deck-sim(-bar).png | shots/US-NP055/after-…-{webkit,chromium}.png, after-deck-sim(-bar).png | Disabled = opaque line fill + stone text (4.2:1), no shadow/edge, via one DISABLED; PRESS exported once and no-scale while disabled. Fields/checkboxes keep 60 % opacity. Removed 3 redundant `aria-disabled:opacity-60` in Settings. Measured: every disabled pill rgb(230,221,214)/rgb(110,101,95), opacity 1, on fabric and none. Sim covers the undo only (deck end, sign-in code and onboarding need mocked writes or a signed-out Safari). |
