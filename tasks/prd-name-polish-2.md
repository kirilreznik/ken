# PRD: Second polish run for the name swiper, code only (the 117 queued P3 items)

Status: ready for a Ralph run. Owner: Kiril. Written 2026-11-13; rewritten the same day to **code only** at the owner's request: no QA, no screenshots, no browser or Simulator checks, no re-scoring. The owner verifies later.

Stories: `scripts/ralph/prd-name-polish-2.json` (installed as `scripts/ralph/prd.json` by `scripts/ralph/run-name-polish-2.sh`). Branch: `ralph/name-polish-2`.

## 1. What this run does

The first polish run left 117 P3 refinements as `next-run`. They are in `scripts/ralph/qa/name-polish-2/backlog.md`, one row each with the files, the one-line change and the finding IDs it came from. This run codes them as fast as possible:

- **72 stories (`US-B01` … `US-B72`)**, each a batch of 1–4 items that touch the same component, in the backlog's ranked order (prerequisites first, e.g. NP-055's shared disabled look before NP-058).
- **`US-END`**: lint and build once, a short `SUMMARY.md`, push the branch.

## 2. Rules

- **Fast, code only.** Read the item's backlog row and the files it names; read a finding (in `scripts/ralph/qa/name-polish/findings/<LENS>-<G>.md`) only when the one-line change isn't clear. Don't open skills, browsers, the Simulator or screenshots. Don't run tests or the build in item stories; the only check is `npx tsc --noEmit`.
- **Guardrails still hold** (`tasks/prd-name-polish.md` §3.1): refine, never redesign; existing token values are the owner's (a new token goes through `docs/names-pwa/brand/tokens.json` + `npm run tokens:css`); no new features; copy keeps its meaning and never touches legal text or name content; every new animation has a reduced-motion version; no dependencies; only `/names` code. Design tokens only, RTL logical properties, Hebrew `aria-label` on icon buttons.
- **Never touch the name data:** `data/names/**`, `scripts/names-content/**`, `scripts/build-names-data.mjs`, generated names JSON. Other work owns them.
- **No origin filter any more** (ken PR #20): items mentioning origins apply to what's left.
- **Don't build anything from ken PR #23** (search, Latin spelling, naming after a relative, twins). It's a separate open PR on the same screens; merge conflicts are expected and will be resolved when both land.
- **Drop rather than stall.** An item that is already fixed, needs the owner, or would touch name data is set `dropped` with a one-line reason.
- **Commits:** one per story, `polish(names): NP-0xx, …`. Never `git stash`, `git clean`, `git checkout .` or `git reset --hard`. Never push `main`, never change Supabase or Vercel, never print secrets.

## 3. Start or resume (owner)

From the worktree the run already uses:

```
cd ~/Ken-names-ralph && git fetch origin && git merge --no-edit origin/claude/project-thread-79v2l8 && ./scripts/ralph/run-name-polish-2.sh
```

The script installs the code-only stories (archiving the old `prd.json`), marks every batch whose items are already `done` in `backlog.md` as passed, keeps `progress.txt`, and runs 100 iterations by default (73 stories plus room for usage-limit stops).

## 4. User stories

### US-B01: NP-055 + NP-057: One opaque disabled look, defined once with PRESS; One link class (inline, standalone, quiet) with a 44 px minimum
**Description:** Code the backlog item(s) NP-055, NP-057 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-055 (One opaque disabled look, defined once with PRESS): Export PRESS and DISABLED once; an opaque token-based disabled fill; the deck bar dims further behind panels. Files: ui/classes.ts, DecisionButtons.tsx, swipe/ActionBar.tsx. Findings: DS-ALL-03, ELEV-G1-01, ELEV-G2-01, PRO-G2-03
- [ ] NP-057 (One link class (inline, standalone, quiet) with a 44 px minimum): linkClass variants; link variant gets min-w-11 justify-center. Files: ui/classes.ts, the 14 hand-rolled links. Findings: DS-ALL-07, IMP-A-G3-06
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-055, NP-057`

### US-B02: NP-068 + NP-060: One skeleton look that matches its list; One segmented control class
**Description:** Code the backlog item(s) NP-068, NP-060 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-068 (One skeleton look that matches its list): skeletonClass (sand on canvas, well on glass); list skeleton of three real-height rows. Files: ui/classes.ts (skeletonClass), lists/ (ListSkeleton). Findings: DS-ALL-17, ELEV-G3-02
- [ ] NP-060 (One segmented control class): segmentGroupClass / segmentClass used by both. Files: ui/classes.ts, ListsScreen.tsx, lists/DuelScreen.tsx. Findings: DS-ALL-05
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-068, NP-060`

### US-B03: NP-066: Tags, the clay dot and token aliases spelled once
**Description:** Code the backlog item(s) NP-066 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-066 (Tags, the clay dot and token aliases spelled once): tagClass, dotClass; rounded-full → rounded-pill; aliases through Tailwind names. Files: ui/classes.ts and callers. Findings: DS-ALL-15
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-066`

### US-B04: NP-056 + NP-059: Button gets a 52 px size, no ! overrides; Filters chip comes from chipClass
**Description:** Code the backlog item(s) NP-056, NP-059 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-056 (Button gets a 52 px size, no ! overrides): ButtonSize 'tall' (h-13 px-6 text-card-title); drop the ! overrides. Files: ui/classes.ts, ui/Button.tsx, MatchSheet.tsx, about/AboutContent.tsx. Findings: DS-ALL-02
- [ ] NP-059 (Filters chip comes from chipClass): chipClass(selected, 'md') replaces the local chip. Files: ui/classes.ts, FiltersSheet.tsx. Findings: DS-ALL-04
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-056, NP-059`

### US-B05: NP-018 + NP-019 + NP-020: Callback: 'נכנסים' wording and the failure screen's own title; Callback error offers the email code as a second way; Callback and join stop waiting af
**Description:** Code the backlog item(s) NP-018, NP-019, NP-020 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-018 (Callback: 'נכנסים' wording and the failure screen's own title): Title 'נכנסים…' and tab 'נכנסים'; failed branch sets its own <title>. Files: AuthCallback.tsx, app/names/auth/callback/page.tsx. Findings: COPY-G1-08, IMP-A-G1-05
- [ ] NP-019 (Callback error offers the email code as a second way): Secondary link to /names/sign-in/email (keeping join). Files: AuthCallback.tsx. Findings: IMP-C-G1-20
- [ ] NP-020 (Callback and join stop waiting after a deadline): After 15 s show the existing failure branch with its retry. Files: AuthCallback.tsx, JoinScreen.tsx, lib/names/ (timeout constant). Findings: IMP-A-G1-06
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-018, NP-019, NP-020`

### US-B06: NP-021 + NP-095 + NP-099: Loading spinners keep a calm reduced-motion version; Reduced motion: no 0.01 ms 'all' transitions, dialog and toast keep their fade; One menu entrance
**Description:** Code the backlog item(s) NP-021, NP-095, NP-099 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-021 (Loading spinners keep a calm reduced-motion version): A names-spinner class; under reduced motion a slow opacity pulse instead of a frozen ring. Files: app/names/names.css, AuthCallback.tsx, JoinScreen.tsx. Findings: IMP-A-G1-03, MOT-G13-09
- [ ] NP-095 (Reduced motion: no 0.01 ms 'all' transitions, dialog and toast keep their fade): transition-property:none in the switch-off; dialog-in/out and toast fades in the reduced list. Files: app/names/names.css. Findings: MOT-G2-07, MOT-G13-03
- [ ] NP-099 (One menu entrance for both menus): names-menu-in (opacity + scale 0.97, 150 ms) from the trigger's corner. Files: app/names/names.css, lists/RowMenu.tsx, swipe/ActionBar.tsx. Findings: MOT-G13-05, MOT-G2-11
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-021, NP-095, NP-099`

### US-B07: NP-035 + NP-036: Rate-limit line: true for sends and tries, cleared when the wait is over; 'משהו השתבש' says what failed
**Description:** Code the backlog item(s) NP-035, NP-036 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-035 (Rate-limit line: true for sends and tries, cleared when the wait is over): 'היו יותר מדי ניסיונות…' and clear the error on address change / next send. Files: lib/names/authErrors.ts, EmailSignIn.tsx. Findings: COPY-G1-05, JRN-ALL-07
- [ ] NP-036 ('משהו השתבש' says what failed): Pick the line by the error area (send / verify / callback). Files: lib/names/authErrors.ts. Findings: COPY-G1-06
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-035, NP-036`

### US-B08: NP-062: Icons on a 2 px stroke
**Description:** Code the backlog item(s) NP-062 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-062 (Icons on a 2 px stroke): strokeWidth 2 everywhere. Files: ThemeIcon.tsx, card/NameCard.tsx, BackgroundSheet.tsx. Findings: DS-ALL-09, ELEV-G2-06
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-062`

### US-B09: NP-071 + NP-015 + NP-008: Titles balance and intros avoid one-word last lines; Sign-in fields are described by the step's lead; The wordmark doesn't jump between welcome and si
**Description:** Code the backlog item(s) NP-071, NP-015, NP-008 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-071 (Titles balance and intros avoid one-word last lines): text-balance on titles, text-pretty on leads and intros. Files: auth/AuthLayout.tsx, offline/page.tsx, not-found.tsx, GoodbyeScreen.tsx, ListsScreen.tsx, HiddenScreen.tsx, AddNameSheet.tsx, about/AboutContent.tsx, legal/LegalScreen.tsx. Findings: ELEV-G1-04, IMP-C-G3-23
- [ ] NP-015 (Sign-in fields are described by the step's lead): id on the lead; aria-describedby on #email and the code input points to it. Files: auth/AuthLayout.tsx, EmailSignIn.tsx. Findings: A11Y-G1-05
- [ ] NP-008 (The wordmark doesn't jump between welcome and sign-in): Take the back link out of the flow (absolute, same 44 px glass circle) so the wordmark keeps its place. Files: auth/AuthLayout.tsx. Findings: ELEV-G1-03
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-071, NP-015, NP-008`

### US-B10: NP-058: Pressed state for secondary controls: links, rows, tiles
**Description:** Code the backlog item(s) NP-058 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-058 (Pressed state for secondary controls: links, rows, tiles): iconButtonClass for the back circle; a non-scaling pressed fill (active:bg-sand / opacity) on links, rows and tiles. Files: auth/AuthLayout.tsx, ui/classes.ts, BackgroundSheet.tsx, FiltersSheet.tsx, ListsScreen.tsx, SettingsScreen.tsx. Findings: PRO-G1-03, PRO-G2-02, PRO-G3-01
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-058`

### US-B11: NP-111 + NP-098: Sheet handle isn't a second 'סגירה' for screen readers; Sheets, dialogs and menus get a short exit
**Description:** Code the backlog item(s) NP-111, NP-098 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-111 (Sheet handle isn't a second 'סגירה' for screen readers): aria-hidden and tabIndex -1 on the handle when closeInHeader. Files: ui/BottomSheet.tsx. Findings: A11Y-G2-04, NP-UX-010
- [ ] NP-098 (Sheets, dialogs and menus get a short exit): One closing state (EXIT_MS + onClosed) for every sheet, Dialog and the menu. Files: ui/BottomSheet.tsx, ui/Dialog.tsx, lists/RowMenu.tsx, names.css. Findings: INT-G2-05, INT-G3-06, MOT-G13-02
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-111, NP-098`

### US-B12: NP-050 + NP-105 + NP-106: Tall sheet sized with dvh in landscape; Sheet gesture: a cancelled drag doesn't close the sheet; Sheet gesture: a quick flick closes
**Description:** Code the backlog item(s) NP-050, NP-105, NP-106 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-050 (Tall sheet sized with dvh in landscape): md:max-h-[90vh] → 90dvh. Files: ui/BottomSheet.tsx. Findings: NATIVE-ALL-06
- [ ] NP-105 (Sheet gesture: a cancelled drag doesn't close the sheet): cancelDrag on pointercancel resets offset and height. Files: ui/BottomSheet.tsx. Findings: IMP-A-G2-02
- [ ] NP-106 (Sheet gesture: a quick flick closes): detentAfterDrag takes release velocity. Files: ui/BottomSheet.tsx, ui/detents.ts. Findings: INT-G2-06
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-050, NP-105, NP-106`

### US-B13: NP-108 + NP-109: Sheet gesture: rubber band past the top; Sheet content fades at the edges instead of a hard cut
**Description:** Code the backlog item(s) NP-108, NP-109 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-108 (Sheet gesture: rubber band past the top): rubberband(overshoot) instead of a hard stop. Files: ui/BottomSheet.tsx. Findings: INT-G2-08
- [ ] NP-109 (Sheet content fades at the edges instead of a hard cut): A one-step mask at the edge that has more content. Files: ui/BottomSheet.tsx. Findings: ELEV-G2-02
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-108, NP-109`

### US-B14: NP-107: Sheet gesture: drag from the header and title too
**Description:** Code the backlog item(s) NP-107 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-107 (Sheet gesture: drag from the header and title too): Bind the handle's pointer handlers to the header/title row, ignoring controls. Files: ui/BottomSheet.tsx. Findings: INT-G2-07
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-107`

### US-B15: NP-114 + NP-115: Year chart: tooltip only on a tap, cleared on scroll; Year chart label stays inside the plot, 0 reads 'אף תינוק'
**Description:** Code the backlog item(s) NP-114, NP-115 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-114 (Year chart: tooltip only on a tap, cleared on scroll): onPointerCancel clears active; touch shows on tap only. Files: detail/YearChart.tsx. Findings: IMP-A-G2-03, ND-UX-001
- [ ] NP-115 (Year chart label stays inside the plot, 0 reads 'אף תינוק'): Clamp the label to the plot area; zero wording. Files: detail/YearChart.tsx. Findings: ND-UX-003
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-114, NP-115`

### US-B16: NP-116: Numbers section: the rank as 'מקום 148', 2024 said once
**Description:** Code the backlog item(s) NP-116 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-116 (Numbers section: the rank as 'מקום 148', 2024 said once): 'מקום 148' with 'בדירוג 2024'; the chart line without the second year. Files: detail/NumbersSection.tsx, detail/ (facts). Findings: IMP-C-G2-19, COPY-G2-02
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-116`

### US-B17: NP-127 + NP-143 + NP-144: Chosen banner looks tappable and says it opens a dialog; Loved label sits on the name's baseline; Lists at 320 px: title and row trend don't wrap alon
**Description:** Code the backlog item(s) NP-127, NP-143, NP-144 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-127 (Chosen banner looks tappable and says it opens a dialog): Directional chevron at the end; aria-haspopup='dialog'. Files: ListsScreen.tsx (ChosenBanner). Findings: IMP-C-G3-22, A11Y-G3-05
- [ ] NP-143 (Loved label sits on the name's baseline): items-baseline on the name line; heart self-center. Files: ListsScreen.tsx. Findings: ELEV-G3-04
- [ ] NP-144 (Lists at 320 px: title and row trend don't wrap alone): Action pair wraps or 'הוספת שם' icon-only under 22.5rem; drop min-w-max. Files: ListsScreen.tsx. Findings: IMP-C-G3-10
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-127, NP-143, NP-144`

### US-B18: NP-130: Survey prompt: a real question that looks tappable
**Description:** Code the backlog item(s) NP-130 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-130 (Survey prompt: a real question that looks tappable): 'אפשר לשאול 5 שאלות קצרות על בחירת השם?' with an underline or chevron; lead '5 שאלות, כולן לא חובה.'. Files: swipe/SurveyPrompt.tsx, SurveySheet.tsx. Findings: COPY-G2-04, CRIT-G2-04
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-130`

### US-B19: NP-131: Survey sheet copy: empty-submit line, submit label, 'אחרי הלידה'
**Description:** Code the backlog item(s) NP-131 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-131 (Survey sheet copy: empty-submit line, submit label, 'אחרי הלידה'): Three strings; the stored value stays 'born'. Files: SurveySheet.tsx, lib/names/survey.ts. Findings: COPY-G2-05, IMP-C-G2-16, COPY-G2-06
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-131`

### US-B20: NP-133 + NP-134: Filters copy: 'אפשר לבחור', 'אדמה ויבשה', 'כל האורכים'; Filters can't be applied with 0 results
**Description:** Code the backlog item(s) NP-133, NP-134 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-133 (Filters copy: 'אפשר לבחור', 'אדמה ויבשה', 'כל האורכים'): Three labels; theme ids unchanged. Files: FiltersSheet.tsx, lib/names/themes.ts. Findings: COPY-G2-08, COPY-G2-09, IMP-C-G2-09
- [ ] NP-134 (Filters can't be applied with 0 results): At n = 0 the apply button says 'אין שמות שמתאימים' and is aria-disabled. Files: FiltersSheet.tsx. Findings: IMP-C-G2-12
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-133, NP-134`

### US-B21: NP-145: Add-name and settings field errors as full sentences
**Description:** Code the backlog item(s) NP-145 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-145 (Add-name and settings field errors as full sentences): Full sentences ('השם הזה כבר ברשימה ״שמרתי״.'). Files: lib/names/custom.ts, SettingsScreen.tsx. Findings: COPY-G3-03, IMP-C-G3-17
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-145`

### US-B22: NP-079: Counts: thousands separators and tabular digits
**Description:** Code the backlog item(s) NP-079 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-079 (Counts: thousands separators and tabular digits): formatCount everywhere, no-break space after '·', tabular-nums on numbers that change. Files: lib/names/card.ts (formatCount), swipe/, FiltersSheet.tsx, ListsScreen.tsx, lists/DuelScreen.tsx. Findings: BREAK-G2-03, BREAK-G3-02, PRO-G2-04
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-079`

### US-B23: NP-080 + NP-063 + NP-081: Deck end and recap name lists: not button-styled, say how many more; Deck end and pause titles keep text-title's weight; Deck end with nothing saved: 
**Description:** Code the backlog item(s) NP-080, NP-063, NP-081 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-080 (Deck end and recap name lists: not button-styled, say how many more): Plain ' · ' text (or a flat tag) and a trailing 'ועוד {n}'. Files: swipe/EmptyDeck.tsx, swipe/PausePanel.tsx. Findings: CRIT-G2-03, BREAK-G2-04
- [ ] NP-063 (Deck end and pause titles keep text-title's weight): Drop font-bold on the four headings; guard against heading-role weight overrides. Files: swipe/EmptyDeck.tsx, swipe/PausePanel.tsx, tests/names/designGuard.test.ts. Findings: DS-ALL-10
- [ ] NP-081 (Deck end with nothing saved: no 'הפעם', the list button secondary): 'לא נשמרו שמות.' and secondary variant in that branch. Files: swipe/EmptyDeck.tsx. Findings: CRIT-G2-02
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-080, NP-063, NP-081`

### US-B24: NP-093: Swipe stamp: opaque, painted by refs
**Description:** Code the backlog item(s) NP-093 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-093 (Swipe stamp: opaque, painted by refs): bg-surface stamp; set opacity on the three stamp spans directly instead of inherited CSS variables. Files: card/NameCard.tsx, swipe/useSwipeDrag.ts. Findings: ELEV-G2-03, MOT-G2-09
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-093`

### US-B25: NP-096: Toasts: enter and exit, timer pauses in the background
**Description:** Code the backlog item(s) NP-096 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-096 (Toasts: enter and exit, timer pauses in the background): @starting-style entrance, a short exit, timer paused on visibilitychange. Files: lib/names/toast.ts, ui/ToastRegion.tsx, names.css. Findings: INT-G2-10, MOT-G2-08
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-096`

### US-B26: NP-128: One wording for vote, hide and 'don't show again' messages
**Description:** Code the backlog item(s) NP-128 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-128 (One wording for vote, hide and 'don't show again' messages): Toasts use the status sentences; 'לא להציג שוב' and 'השם {name} לא יוצג שוב' everywhere. Files: lib/names/a11y.ts, lists/RowMenu.tsx, ListsScreen.tsx. Findings: COPY-G2-03, IMP-C-G2-13, COPY-G3-04
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-128`

### US-B27: NP-132: Background sheet copy: the privacy note and a save failure that blames storage
**Description:** Code the backlog item(s) NP-132 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-132 (Background sheet copy: the privacy note and a save failure that blames storage): Rewritten privacy note; separate the decode and save failures in the message. Files: BackgroundSheet.tsx. Findings: COPY-G2-07, ND-UX-005
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-132`

### US-B28: NP-136 + NP-118: Offline lines: one icon and wording, matches announces the change; 'הוספת שם משפחה' as a small link
**Description:** Code the backlog item(s) NP-136, NP-118 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-136 (Offline lines: one icon and wording, matches announces the change): wifi-off icon + 'אין חיבור לאינטרנט…' in both; matches line inside an always-mounted role=status. Files: detail/ (offline line), ListsScreen.tsx (MatchesPanel), ConnectionNote.tsx. Findings: IMP-C-G2-15, IMP-C-G3-18, A11Y-G3-03
- [ ] NP-118 ('הוספת שם משפחה' as a small link): text-caption medium ink-soft underline, ≥ 44 px through padding. Files: detail/ (surname line). Findings: CRIT-G2-05
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-136, NP-118`

### US-B29: NP-155 + NP-150 + NP-151 + NP-153: Opt-in switch: label read once, every tap counts; Delete confirm looks like the row that opened it; Leave row marked like the other destructive row; S
**Description:** Code the backlog item(s) NP-155, NP-150, NP-151, NP-153 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-155 (Opt-in switch: label read once, every tap counts): aria-labelledby the title; keep the last asked value and resend, show busy. Files: SettingsScreen.tsx. Findings: A11Y-G3-06, INT-G3-07
- [ ] NP-150 (Delete confirm looks like the row that opened it): Secondary pill with text-urgent and the trash icon. Files: SettingsScreen.tsx, ui/Dialog.tsx. Findings: IMP-C-G3-15
- [ ] NP-151 (Leave row marked like the other destructive row): text-urgent title on the leave row. Files: SettingsScreen.tsx. Findings: PRO-G3-02
- [ ] NP-153 (Settings: long Latin names read from the start, email wraps whole): dir='auto' on the name inputs; wrap-anywhere on the email bdi. Files: SettingsScreen.tsx, Onboarding.tsx. Findings: BREAK-G3-06
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-155, NP-150, NP-151, NP-153`

### US-B30: NP-162 + NP-097 + NP-163 + NP-164: Duel picks: press feedback and a step transition; Duel stop toast doesn't cover the result's link; Duel has its own page title; Duel card details read
**Description:** Code the backlog item(s) NP-162, NP-097, NP-163, NP-164 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-162 (Duel picks: press feedback and a step transition): PRESS at 0.97; keyed names with a 150–200 ms fade, progress bar transition; reduced version. Files: lists/DuelScreen.tsx. Findings: IMP-C-G3-12, MOT-G13-06
- [ ] NP-097 (Duel stop toast doesn't cover the result's link): Dismiss the toast when the duel reopens. Files: lists/DuelScreen.tsx. Findings: NP-UX-008
- [ ] NP-163 (Duel has its own page title): Set document.title while mounted, restore on unmount. Files: lists/DuelScreen.tsx. Findings: A11Y-G3-04
- [ ] NP-164 (Duel card details read once): hidden instead of sr-only on the description span. Files: lists/DuelScreen.tsx. Findings: A11Y-G3-07
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-162, NP-097, NP-163, NP-164`

### US-B31: NP-165 + NP-166 + NP-168 + NP-161: Duel counter: no shift, gone when done; Duel's top-five chips aren't toggles; Duel blob only behind cards; Duel: a double tap records one pick
**Description:** Code the backlog item(s) NP-165, NP-166, NP-168, NP-161 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-165 (Duel counter: no shift, gone when done): Hide when done; estimate while the total can change. Files: lists/DuelScreen.tsx. Findings: IMP-C-G3-11
- [ ] NP-166 (Duel's top-five chips aren't toggles): hintChipClass look. Files: lists/DuelScreen.tsx. Findings: IMP-C-G3-13
- [ ] NP-168 (Duel blob only behind cards): Render the blob only with a pair or result. Files: lists/DuelScreen.tsx. Findings: ELEV-G3-03
- [ ] NP-161 (Duel: a double tap records one pick): Ignore a pick within ~300 ms or key by pair. Files: lists/DuelScreen.tsx. Findings: IMP-A-G3-03
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-165, NP-166, NP-168, NP-161`

### US-B32: NP-167 + NP-169: Duel result: #1 stands out, names open their sheet; Duel in landscape shows both names
**Description:** Code the backlog item(s) NP-167, NP-169 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-167 (Duel result: #1 stands out, names open their sheet): RowName buttons; #1 in text-section; tighter gaps. Files: lists/DuelScreen.tsx. Findings: IMP-C-G3-14
- [ ] NP-169 (Duel in landscape shows both names): Two columns under a short-height query. Files: lists/DuelScreen.tsx. Findings: PRO-G3-03
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-167, NP-169`

### US-B33: NP-006 + NP-034 + NP-007: Fields are read-only while their request is in flight; Sign-in copy: 'מייל' everywhere, a clear lead, a true invalid-address line; Back from the code 
**Description:** Code the backlog item(s) NP-006, NP-034, NP-007 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-006 (Fields are read-only while their request is in flight): readOnly={busy} on the email input and the code input. Files: EmailSignIn.tsx, auth/CodeInput.tsx. Findings: INT-G1-02
- [ ] NP-034 (Sign-in copy: 'מייל' everywhere, a clear lead, a true invalid-address line): 'מייל' only; lead with an unambiguous verb; empty vs incomplete address messages. Files: EmailSignIn.tsx, lib/names/authErrors.ts, SurveySheet.tsx. Findings: COPY-G1-02, COPY-G1-03, COPY-G1-04
- [ ] NP-007 (Back from the code step returns to the email step): On the code step the back control runs changeAddress(). Files: EmailSignIn.tsx, auth/AuthLayout.tsx. Findings: IMP-C-G1-17
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-006, NP-034, NP-007`

### US-B34: NP-102: Email step turns into the code step with a short transition
**Description:** Code the backlog item(s) NP-102 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-102 (Email step turns into the code step with a short transition): Key by step; names-step-in 200 ms with a reduced version. Files: EmailSignIn.tsx, names.css. Findings: MOT-G13-07
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-102`

### US-B35: NP-013: Closed sign-ups notice says who the buttons below are for
**Description:** Code the backlog item(s) NP-013 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-013 (Closed sign-ups notice says who the buttons below are for): Add the clause that existing accounts can still sign in. Files: lib/names/auth.ts (SIGNUPS_CLOSED_MESSAGE). Findings: CRIT-G1-04
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-013`

### US-B36: NP-016 + NP-017: Google sign-in says it's moving on while Google loads; Welcome Google failure offers the next step
**Description:** Code the backlog item(s) NP-016, NP-017 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-016 (Google sign-in says it's moving on while Google loads): Busy label 'מעבירים ל־Google…' with the G mark and the shared disabled opacity. Files: WelcomeActions.tsx. Findings: INT-G1-04
- [ ] NP-017 (Welcome Google failure offers the next step): Failure line followed by 'אפשר לנסות שוב או להיכנס עם קוד במייל'. Files: WelcomeActions.tsx. Findings: COPY-G1-07
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-016, NP-017`

### US-B37: NP-032 + NP-033: Surname field purpose in its hint, not its placeholder; Intro copy: the solo privacy line and the third point
**Description:** Code the backlog item(s) NP-032, NP-033 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-032 (Surname field purpose in its hint, not its placeholder): Drop the placeholder; hint 'כדי לראות את השם המלא על הכרטיס. נשמר רק במכשיר הזה.'. Files: Intro.tsx. Findings: COPY-G1-11
- [ ] NP-033 (Intro copy: the solo privacy line and the third point): One-fact privacy line; impersonal third point. Files: Intro.tsx. Findings: COPY-G1-09, COPY-G1-10
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-032, NP-033`

### US-B38: NP-037 + NP-149 + NP-156: Goodbye copy without 'מהשרת'; Delete dialog copy: says what's deleted and that it can't be undone, a true 429 line; Settings confirms have a deadline 
**Description:** Code the backlog item(s) NP-037, NP-149, NP-156 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-037 (Goodbye copy without 'מהשרת'): DELETED_LEAD = 'כל הבחירות שלך נמחקו מ־Nest ומהמכשיר הזה.'. Files: lib/names/accountDeletion.ts. Findings: COPY-G1-14
- [ ] NP-149 (Delete dialog copy: says what's deleted and that it can't be undone, a true 429 line): DELETE_BODY and DELETE_WAIT_TEXT rewritten. Files: lib/names/accountDeletion.ts. Findings: COPY-G3-07, COPY-G3-08
- [ ] NP-156 (Settings confirms have a deadline and can't lose their result): AbortSignal.timeout(15000); no dismiss while the request runs. Files: lib/names/accountDeletion.ts, lib/names/ (leave), SettingsScreen.tsx. Findings: IMP-A-G3-04
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-037, NP-149, NP-156`

### US-B39: NP-041: Unconfigured notice has a way out
**Description:** Code the backlog item(s) NP-041 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-041 (Unconfigured notice has a way out): Wordmark, a 'try later' line and a link to /. Files: Unconfigured.tsx. Findings: IMP-C-G1-12
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-041`

### US-B40: NP-042 + NP-043 + NP-046 + NP-044: Invite screen: both sections built the same way; Invite expiry as one sentence; A message shown as a toast isn't also written to a status; Invite link
**Description:** Code the backlog item(s) NP-042, NP-043, NP-046, NP-044 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-042 (Invite screen: both sections built the same way): Both headings above their cards; member rows text-card-title. Files: InviteScreen.tsx. Findings: CRIT-G1-05
- [ ] NP-043 (Invite expiry as one sentence): 'הקישור בתוקף עד … ועובד פעם אחת.' (bdi kept). Files: InviteScreen.tsx. Findings: ELEV-G1-06
- [ ] NP-046 (A message shown as a toast isn't also written to a status): Drop the local sr status where a toast already announces; check ToastRegion re-announces a repeat. Files: InviteScreen.tsx, ListsScreen.tsx, SettingsScreen.tsx. Findings: A11Y-G1-07, A11Y-G3-02
- [ ] NP-044 (Invite link wraps so the code shows): Read-only wrapping text block (sand well, ltr, wrap-anywhere, select-all) instead of a clipped field. Files: InviteScreen.tsx. Findings: BREAK-G1-03
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-042, NP-043, NP-046, NP-044`

### US-B41: NP-045: 'הקישור הועתק' shows at the button that copied
**Description:** Code the backlog item(s) NP-045 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-045 ('הקישור הועתק' shows at the button that copied): Swap the copy button to a check + 'הקישור הועתק' for 2 s. Files: InviteScreen.tsx. Findings: INT-G1-05
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-045`

### US-B42: NP-051: Name fields: no autocorrect, return-key labels
**Description:** Code the backlog item(s) NP-051 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-051 (Name fields: no autocorrect, return-key labels): autoCorrect='off' spellCheck={false}, enterKeyHint on the five name fields. Files: lists/AddNameSheet.tsx, Intro.tsx, Onboarding.tsx, SettingsScreen.tsx. Findings: NATIVE-ALL-07
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-051`

### US-B43: NP-052: Android keyboard resizes content, not covers buttons
**Description:** Code the backlog item(s) NP-052 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-052 (Android keyboard resizes content, not covers buttons): interactiveWidget: 'resizes-content'. Files: app/names/layout.tsx (viewport). Findings: NATIVE-ALL-08
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-052`

### US-B44: NP-067: Layout spacing on the documented scale
**Description:** Code the backlog item(s) NP-067 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-067 (Layout spacing on the documented scale): Snap the half steps to the scale, checked against each board. Files: files with gap-2.5/3.5/4.5, px-5.5, py-7, p-3.5. Findings: DS-ALL-16
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-067`

### US-B45: NP-078: Offline pending text says what happens next
**Description:** Code the backlog item(s) NP-078 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-078 (Offline pending text says what happens next): 'החלטה אחת תישלח כשהחיבור יחזור' / '{n} החלטות יישלחו…'. Files: lib/names/offline.ts. Findings: COPY-G2-01
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-078`

### US-B46: NP-083: Recap with no saves: neutral full sentence
**Description:** Code the backlog item(s) NP-083 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-083 (Recap with no saves: neutral full sentence): 'עברת על 30 שמות ועוד לא שמרת אף אחד בסבב הזה.'. Files: lib/names/launch.ts. Findings: COPY-G2-10
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-083`

### US-B47: NP-084: Nest card button doesn't compete with the screen's main action
**Description:** Code the backlog item(s) NP-084 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-084 (Nest card button doesn't compete with the screen's main action): Opt-in as secondary md. Files: NestCard.tsx. Findings: PRO-G2-05
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-084`

### US-B48: NP-090: Next card follows a drag that starts during its entrance
**Description:** Code the backlog item(s) NP-090 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-090 (Next card follows a drag that starts during its entrance): Finish the enter animation when a drag starts. Files: swipe/useSwipeDrag.ts. Findings: INT-G2-09
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-090`

### US-B49: NP-092 + NP-091: Voting on another name in the sheet doesn't replay the card entrance; Undo brings the card back from where it left
**Description:** Code the backlog item(s) NP-092, NP-091 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-092 (Voting on another name in the sheet doesn't replay the card entrance): Drop setEntered(true) from decideOther. Files: swipe/SwipeScreen.tsx. Findings: MOT-G2-06
- [ ] NP-091 (Undo brings the card back from where it left): Pass the undone kind; play the reverse of its fling. Files: swipe/SwipeScreen.tsx, swipe/CardStack.tsx, swipe/useSwipeDrag.ts. Findings: MOT-G2-05
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-092, NP-091`

### US-B50: NP-087: 200 % zoom: the card scrolls by itself and the bar stays reachable
**Description:** Code the backlog item(s) NP-087 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-087 (200 % zoom: the card scrolls by itself and the bar stays reachable): Cap the card at the viewport in the h-auto fallback so pan-y applies. Files: swipe/SwipeScreen.tsx, swipe/useSwipeDrag.ts. Findings: NP-UX-011, ND-UX-007
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-087`

### US-B51: NP-112: Source line isn't a contentinfo landmark
**Description:** Code the backlog item(s) NP-112 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-112 (Source line isn't a contentinfo landmark): div instead of footer. Files: detail/SourceSection.tsx. Findings: A11Y-G2-05
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-112`

### US-B52: NP-113: Report sheet opens without the keyboard
**Description:** Code the backlog item(s) NP-113 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-113 (Report sheet opens without the keyboard): Drop data-autofocus on the textarea. Files: about/ReportSheet.tsx. Findings: IMP-A-G2-05
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-113`

### US-B53: NP-121 + NP-123: Long custom names wrap anywhere on match, decision, duel; Match sheet shows niqqud like the decision sheet
**Description:** Code the backlog item(s) NP-121, NP-123 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-121 (Long custom names wrap anywhere on match, decision, duel): wrap-anywhere instead of break-words. Files: MatchSheet.tsx, DecisionSheet.tsx, lists/DuelScreen.tsx. Findings: BREAK-G2-05, BREAK-G3-03
- [ ] NP-123 (Match sheet shows niqqud like the decision sheet): Pass the card and show its niqqud. Files: MatchSheet.tsx, ListsScreen.tsx. Findings: IMP-C-G2-14
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-121, NP-123`

### US-B54: NP-135: 'אנשים מוכרים' in the about text too
**Description:** Code the backlog item(s) NP-135 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-135 ('אנשים מוכרים' in the about text too): One term; drop the unused branch. Files: about/AboutContent.tsx, card/CardPeople.tsx. Findings: COPY-G2-12
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-135`

### US-B55: NP-140 + NP-141 + NP-142: Row menu: a divider before the removals; A tap outside the row menu only closes it; Row menu trigger without a glass disc in list cards
**Description:** Code the backlog item(s) NP-140, NP-141, NP-142 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-140 (Row menu: a divider before the removals): border-t border-line between choose and the two removals. Files: lists/RowMenu.tsx. Findings: IMP-C-G3-20
- [ ] NP-141 (A tap outside the row menu only closes it): One-shot capture click that swallows the tap that closed the menu. Files: lists/RowMenu.tsx. Findings: INT-G3-05
- [ ] NP-142 (Row menu trigger without a glass disc in list cards): Transparent 44 × 44 trigger at rest, pressed fill. Files: lists/RowMenu.tsx. Findings: ELEV-G3-01
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-140, NP-141, NP-142`

### US-B56: NP-147: One sentence for 'skips stay private'
**Description:** Code the backlog item(s) NP-147 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-147 (One sentence for 'skips stay private'): 'על מה דילגת נשאר רק אצלך.' in the four places. Files: lib/names/matches.ts, ListsScreen.tsx. Findings: COPY-G3-06
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-147`

### US-B57: NP-148 + NP-152: Leave-done line with a verb; Leave dialog names at most three members, isolated
**Description:** Code the backlog item(s) NP-148, NP-152 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-148 (Leave-done line with a verb): '…השמות ששמרת נשארו אצלך.'. Files: lib/names/ (LEAVE_DONE). Findings: COPY-G3-05
- [ ] NP-152 (Leave dialog names at most three members, isolated): FSI/PDI around each name, 3 names + 'ועוד {n}'. Files: lib/names/ (leaveBody). Findings: BREAK-G3-05
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-148, NP-152`

### US-B58: NP-158: Install steps use Hebrew quotes
**Description:** Code the backlog item(s) NP-158 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-158 (Install steps use Hebrew quotes): ״הוספה למסך הבית״. Files: pwa/ (INSTALL_STEPS). Findings: COPY-G3-11
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-158`

### US-B59: NP-159: Operator name doesn't break in the legal intro
**Description:** Code the backlog item(s) NP-159 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-159 (Operator name doesn't break in the legal intro): whitespace-nowrap on the operator bdi (frame only). Files: legal/LegalScreen.tsx. Findings: IMP-C-G3-19
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-159`

### US-B60: NP-023: Join's outcome is announced once, from a region mounted on first render
**Description:** Code the backlog item(s) NP-023 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-023 (Join's outcome is announced once, from a region mounted on first render): One always-mounted sr-only role=status whose text changes with the outcome. Files: JoinScreen.tsx. Findings: A11Y-G1-06
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-023`

### US-B61: NP-040: The 404 keeps its own page title
**Description:** Code the backlog item(s) NP-040 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-040 (The 404 keeps its own page title): Find why the title is replaced on the client (Next 16 docs) and keep the not-found metadata. Files: app/names/not-found.tsx, [...missing]/page.tsx. Findings: IMP-A-G1-04
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-040`

### US-B62: NP-064: Content width as a token
**Description:** Code the backlog item(s) NP-064 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-064 (Content width as a token): New --nest-content-max: 480px with max-w-content; replace max-w-[480px]. Files: tokens.json → nest-tokens.css, app/names/names.css, 14 files. Findings: DS-ALL-12
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-064`

### US-B63: NP-070: DESIGN.md documents the type roles and the shared patterns
**Description:** Code the backlog item(s) NP-070 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-070 (DESIGN.md documents the type roles and the shared patterns): Type roles as used; component entries for the patterns the DS items add. Files: DESIGN.md. Findings: DS-ALL-11, DS-ALL-18
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-070`

### US-B64: NP-100: Add-name sheet slides in on Safari
**Description:** Code the backlog item(s) NP-100 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-100 (Add-name sheet slides in on Safari): Focus a text field after the panel's animationend. Files: ui/useModal.ts. Findings: MOT-G13-01
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-100`

### US-B65: NP-103: Background change crossfades
**Description:** Code the backlog item(s) NP-103 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-103 (Background change crossfades): Keep the old layer for a 200 ms opacity crossfade. Files: ScreenBackground.tsx. Findings: MOT-G2-10
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-103`

### US-B66: NP-104: First save shows where the name went
**Description:** Code the backlog item(s) NP-104 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-104 (First save shows where the name went): A ≤ 300 ms count pulse on the pill on save, none under reduced motion. Files: swipe/SwipeHeader.tsx, names.css. Findings: JRN-ALL-08
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-104`

### US-B67: NP-119: Sparkline spans the trend tile
**Description:** Code the backlog item(s) NP-119 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-119 (Sparkline spans the trend tile): h-auto w-full on the sparkline, keep viewBox. Files: card/CardStats.tsx. Findings: ELEV-G2-04
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-119`

### US-B68: NP-120: The girls' share stays visible on the sex bar in Safari
**Description:** Code the backlog item(s) NP-120 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-120 (The girls' share stays visible on the sex bar in Safari): A track or edge from an existing token. Files: card/CardSexBar.tsx. Findings: IMP-C-G1-21
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-120`

### US-B69: NP-146: One term per thing: the app, the shared choice, the invite
**Description:** Code the backlog item(s) NP-146 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-146 (One term per thing: the app, the shared choice, the invite): 'בחירת שם' for the app, 'הבחירה המשותפת', 'הזמנה לבחירה משותפת' everywhere. Files: HiddenScreen.tsx, lists/AddNameSheet.tsx, SettingsScreen.tsx, swipe/EmptyDeck.tsx. Findings: COPY-G3-01, COPY-G3-09
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-146`

### US-B70: NP-061: One shared Icon with named glyphs
**Description:** Code the backlog item(s) NP-061 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-061 (One shared Icon with named glyphs): Icon({size}) stroke 2 round caps; CloseIcon, ChevronIcon, CheckIcon …; one check mark. Files: ui/icons.tsx (new), 34 files. Findings: DS-ALL-08
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-061`

### US-B71: NP-065: Match and decision sheets share one MomentSheet
**Description:** Code the backlog item(s) NP-065 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-065 (Match and decision sheets share one MomentSheet): One component with eyebrow/name/line/meta/actions; same DOM and classes. Files: MomentSheet.tsx (new), MatchSheet.tsx, DecisionSheet.tsx. Findings: DS-ALL-14
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-065`

### US-B72: NP-101: Name sheet's slide-in isn't eaten by the mount
**Description:** Code the backlog item(s) NP-101 in one go, fast, without verification.

**Acceptance criteria:**
- [ ] Skip any item whose row in `scripts/ralph/qa/name-polish-2/backlog.md` is already `done` or `dropped` (an earlier iteration did it); if all are, set `passes: true` with notes 'already done' and stop
- [ ] NP-101 (Name sheet's slide-in isn't eaten by the mount): Render the shell and first section first; defer chart and similar names. Files: detail/NameDetailSheet.tsx. Findings: MOT-G2-04
- [ ] Code only: no screenshots, browsers, Simulator, tests, build or QA. If an item is already fixed, would need the owner, or would touch name data, set it `dropped` with a one-line reason and move on
- [ ] Set each item's row `done` (or `dropped`) in `scripts/ralph/qa/name-polish-2/backlog.md`
- [ ] `npx tsc --noEmit` passes (the only check; fix type errors you caused)
- [ ] Committed once: `polish(names): NP-101`

### US-END: Lint, build and push
**Description:** As the owner, I want the branch to build and be pushed, so I can verify it myself.

**Acceptance criteria:**
- [ ] `npm run lint` (0 errors) and `npm run build` pass; fix only what breaks them, one commit `fix(names): lint and build after the second polish run` if anything changed
- [ ] `scripts/ralph/qa/name-polish-2/SUMMARY.md`: items done and dropped (each drop with its reason), from `backlog.md`; nothing is claimed as verified
- [ ] Committed: `docs(names): second polish run summary`; `git push -u origin ralph/name-polish-2` (never main)
