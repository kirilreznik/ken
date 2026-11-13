# PRD: Second polish run for the name swiper (the 117 queued P3 items)

Status: ready for a Ralph run. Owner: Kiril. Written 2026-11-13, after the first polish run (`ralph/name-polish`, ken PR #18) and ken PR #20 (deck limited to names in use among Jewish Israelis, origin filter removed) were merged to `main`.

Stories: `scripts/ralph/prd-name-polish-2.json` (installed as `scripts/ralph/prd.json` by `scripts/ralph/run-name-polish-2.sh`). Branch: `ralph/name-polish-2`, which starts from the commit that added this PRD (on top of `main` at `dc8dadc`).

## 1. Introduction

The first polish run audited every screen of `/names` through the design skills in `.claude/skills/`, merged 282 findings into 171 backlog items, and fixed the 54 most important (every P1 and P2, plus 8 P3). The other 117, all P3 refinements, were ranked and left as `next-run` in `scripts/ralph/qa/name-polish/backlog.md`.

This run fixes those 117 items. There are no new audits: the findings, the ranking and the reasons already exist. Each item gets **its own story** (`US-NP0xx`), in the first run's order, so a prerequisite lands before the items that build on it (for example NP-055's shared disabled look before NP-058 and NP-162). Then the screens are re-scored, the docs updated, and the usual three QA cycles run in real mobile browsers.

## 2. Goals

- Each of the 117 items is fixed, verified in three mobile browsers with before and after screenshots, and committed on its own, or dropped with a written reason.
- No screen scores lower than after the first run (impeccable `critique`), and no regression (full QA).
- Zero serious or critical axe issues; `/names` first-load JS grows by at most 3 KB gzipped against this run's start; no dependency added.

## 3. Decisions

### 3.1 Guardrails

Everything in `tasks/prd-name-polish.md` §3.1 holds unchanged: refine, never redesign; existing token values are the owner's (new tokens through `tokens.json` + `npm run tokens:css` are allowed); every earlier owner decision stays; no new features; copy fixes keep the meaning and never touch legal text or name content; calm motion with a reduced-motion version; no dependencies; the performance budget; scope limited to `/names`.

Two more for this run:

1. **Don't touch the name data.** Another piece of work is adding card content for 905 names on its own branch. Never edit `data/names/**`, `scripts/names-content/**`, `scripts/build-names-data.mjs` or any generated names JSON, even when an item seems to call for it. Such an item is `dropped` with the reason.
2. **The deck has no origin filter any more** (ken PR #20). Items or checklist lines that mention origins apply to what's left (themes, sex, letter range, length).

### 3.2 What goes to the owner

As in `tasks/prd-name-polish.md` §3.2. The first run's 26 owner decisions are in `scripts/ralph/qa/name-polish/owner-decisions.md`. None of the 117 items depends on one of them (checked when this PRD was written). If an item turns out to need one, it's added to this run's `owner-decisions.md` (IDs `OD-027` on) and not done. OD-011 is settled: migration 0011 (`names_leave`) was applied to the EU project on 2026-11-13, so leaving a shared choice now works.

### 3.3 Decisions made for this run

1. **One item, one story, one commit.** No slots shared between items, so each story stays small and a failure only costs that item.
2. **Stale items.** Some items may already be fixed by a neighbour or made moot by later changes on `main`. US-002 notes which rows' files changed; each item story checks first and drops the item with evidence if there's nothing left to do.
3. **Skills.** Each item story reads the skill rule its findings cite (in the first run's `findings/` files), not the whole skill. The rules of `tasks/prd-name-polish.md` §3.3.1–3.3.3 for skills that ask questions or need a service still hold.

## 4. Before the run (owner)

Nothing new is needed: `~/Ken-names`, `.env.local`, `scripts/ralph/.env.test.local` with the QA users, Playwright WebKit and Chromium, Xcode with an iOS Simulator, and `cliclick`. To start (one command, safe to re-run):

```
cd ~/Ken-names && git fetch origin && (git switch ralph/name-polish-2 2>/dev/null || git switch -c ralph/name-polish-2 origin/claude/project-thread-79v2l8) && ./scripts/ralph/run-name-polish-2.sh
```

To resume later: `cd ~/Ken-names && ./scripts/ralph/run-name-polish-2.sh`. The default is 240 iterations for 160 stories, which leaves room for iterations lost to a usage limit.

After the run: read `scripts/ralph/qa/name-polish-2/SUMMARY.md` and any new `owner-decisions.md` entries, then open a PR from `ralph/name-polish-2`.

## 5. Design skills

The same skills and lenses as `tasks/prd-name-polish.md` §5. An item's lens is the prefix of its finding IDs (`DS`, `A11Y`, `INT`, `COPY`, `BREAK`, `MOT`, `NATIVE`, `ELEV`, `PRO`, `CRIT`, `IMP-C`, `IMP-A`, `JRN`); read the rule the finding quotes from that lens's skill.

## 6. Screens, records, rules, browser check and QA

- **Screens and groups:** `tasks/prd-name-polish.md` §6.
- **Records:** in `scripts/ralph/qa/name-polish-2/` (`shots/` and `.auth/` gitignored): `backlog.md` (already written: the 117 rows, status `todo`, column `slot` = the story id), `owner-decisions.md`, `polish-log.md`, `bugs.md` (`NP2-BUG-001` on), `ux-insights.md` (`NP2-UX-001` on), `scores.md`, `SUMMARY.md`. Formats as in `tasks/prd-name-polish.md` §7.
- **Rules for every story:** `tasks/prd-name-polish.md` §8, with this run's branch (`ralph/name-polish-2`) and record folder.
- **Mobile browser check:** `tasks/prd-name-polish.md` §10 (helpers in `scripts/ralph/qa/name-detail/`, shots folder option from the first run's US-001).
- **QA:** `tasks/prd-name-polish.md` §11 (3 cycles, hard cap, areas A–J), with these changes:
  - **D:** the filters sheet has themes, sex, letter range and length; no origins.
  - **F:** leaving a shared choice now works. Test it once per cycle with QA user 2: leave, check user 2 keeps their saved names in a new solo list and user 1 keeps the shared one, then rejoin with a fresh invite from user 1 so users 1 and 2 share again. Write each step in `progress.txt`.
  - **G:** also check that no file under the name data paths (§3.1.1) changed in this run: `git diff --stat <US-000 commit>..HEAD -- data/names scripts/names-content scripts/build-names-data.mjs` is empty.
  - **H:** compare against the first run's after state (`scripts/ralph/qa/name-polish/polish-log.md` and its notes), not its baseline.

## 7. Story order

1. Gate, records, baseline and stale check (US-000…US-002).
2. The 117 items, `US-NP055` … `US-NP101`, in the backlog's order.
3. Re-score per group (US-R1…R3), docs (US-D1), self-audit (US-SA).
4. QA: US-QA0, cycles 1–3 (10 areas each) with US-FIX1–3, then US-FINAL.

## 8. Non-goals

- New audits, a redesign, new features, screens, settings, events or content.
- The name data and card content (another piece of work owns it).
- Any backend, Supabase, Vercel or auth change.
- Acting on owner items.

## 9. Success

- All stories pass; every item `done` or `dropped` with a reason; QA clean or bugs listed honestly in `SUMMARY.md`.
- No screen scores lower than after the first run; zero serious or critical axe issues; the performance budget holds.

## 10. User stories

### US-000: Gate: branch, browsers, Simulator and QA users
**Description:** As the run, I need every tool working before any other story, so nothing is marked done without a real mobile check.

**Acceptance criteria:**
- [ ] On branch `ralph/name-polish-2`; `git log --oneline -1` recorded in `progress.txt` as the run's start commit; `git merge-base --is-ancestor dc8dadc HEAD` passes (the first polish run and ken PR #20 are included)
- [ ] `npm ci` done; `npx playwright install chromium webkit` done or already installed; `node scripts/ralph/qa/name-detail/mobile.mjs webkit /names/welcome gate-webkit` and the same for chromium save screenshots that you read
- [ ] `xcrun simctl list devices available` shows an iPhone with a home indicator; it boots, `open -a Simulator` shows it, `xcrun simctl openurl booted http://localhost:3000/names/welcome` loads in Mobile Safari with `npm run dev` running; a screenshot shows the welcome page; one `cliclick` tap is shown to land
- [ ] `scripts/ralph/.env.test.local` has `NAMES_QA_EMAIL_1`..`3`; `node scripts/ralph/qa/names-pwa/login.mjs 1` and `2` succeed (key names only in logs, never values)
- [ ] `.claude/skills/` exists (each skill the PRD §5 table names has a `SKILL.md`); `PRODUCT.md` and `DESIGN.md` exist at the repo root
- [ ] If any item fails: write the missing prerequisite at the top of `progress.txt` under `## BLOCKED`, leave `passes: false`, and stop without starting other stories
- [ ] No commit in this story

### US-001: Records for the second polish run
**Description:** As the item stories and QA, I need this run's record files next to the backlog that is already there.

**Acceptance criteria:**
- [ ] `scripts/ralph/qa/name-polish-2/backlog.md` already exists (117 rows, all `todo`); don't reorder or rewrite it
- [ ] Creates in `scripts/ralph/qa/name-polish-2/`: `owner-decisions.md` (IDs continue from the first run: `OD-027` on), `polish-log.md`, `bugs.md` (IDs `NP2-BUG-001` on), `ux-insights.md` (IDs `NP2-UX-001` on) and `scores.md`, each with the headers and fields of the first run's files in `scripts/ralph/qa/name-polish/` (PRD §7)
- [ ] Adds `scripts/ralph/qa/name-polish-2/shots/` and `scripts/ralph/qa/name-polish-2/.auth/` to `.gitignore`
- [ ] Self-test: `QA_SHOTS_DIR=scripts/ralph/qa/name-polish-2/shots node scripts/ralph/qa/name-detail/mobile.mjs webkit /names us001` writes into the new folder
- [ ] Committed once: `chore(names): records for the second polish run`

### US-002: Performance baseline and stale-item check
**Description:** As the budget in PRD §3.1 and the item stories, I need the starting numbers, and to know which items later changes already made moot.

**Acceptance criteria:**
- [ ] `npm run build`; records the first-load JS of `/names`, `/names/lists`, `/names/welcome` (gzipped, the same method as the first run's US-004) in `scores.md` under 'Baseline performance'; on the production build (port 3100), Chromium Pixel 7: CLS during 5 swipes and tap to sheet visible for 3 opens
- [ ] For every backlog row, reads the files it names and checks whether its problem is still in the code. Rows whose files changed since `f430a9c` (`git diff --stat f430a9c HEAD -- <files>`, e.g. `FiltersSheet.tsx` after the origin filter was removed in PR #20) get a note in `scores.md` 'Stale check' saying what changed; nothing is dropped here, each item story decides
- [ ] No code change; commits only the records: `docs(names): baseline for the second polish run`

### US-NP055: NP-055: One opaque disabled look, defined once with PRESS
**Description:** As the owner, I want backlog item NP-055 (ALL, sign-in code, onboarding, deck end/pause bar) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (DS-ALL-03, ELEV-G1-01, ELEV-G2-01, PRO-G2-03; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/classes.ts, DecisionButtons.tsx, swipe/ActionBar.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Export PRESS and DISABLED once; an opaque token-based disabled fill; the deck bar dims further behind panels. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Disabled pills on every background read as 'not yet', not photo-coloured. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP055/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-055 One opaque disabled look, defined once with PRESS`

### US-NP057: NP-057: One link class (inline, standalone, quiet) with a 44 px minimum
**Description:** As the owner, I want backlog item NP-057 (ALL, welcome, join, onboarding, notices, 404, filters, chosen banner) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (DS-ALL-07, IMP-A-G3-06; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/classes.ts, the 14 hand-rolled links
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: linkClass variants; link variant gets min-w-11 justify-center. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Probe: no link under 44 × 44. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP057/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-057 One link class (inline, standalone, quiet) with a 44 px mini`

### US-NP068: NP-068: One skeleton look that matches its list
**Description:** As the owner, I want backlog item NP-068 (G3, lists, hidden, duel, auth, invite loading) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (DS-ALL-17, ELEV-G3-02; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/classes.ts (skeletonClass), lists/ (ListSkeleton)
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: skeletonClass (sand on canvas, well on glass); list skeleton of three real-height rows. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Loading shots look like the list they turn into. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP068/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-068 One skeleton look that matches its list`

### US-NP060: NP-060: One segmented control class
**Description:** As the owner, I want backlog item NP-060 (G3, lists tabs, duel source) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (DS-ALL-05; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/classes.ts, ListsScreen.tsx, lists/DuelScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: segmentGroupClass / segmentClass used by both. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shots unchanged. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP060/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-060 One segmented control class`

### US-NP066: NP-066: Tags, the clay dot and token aliases spelled once
**Description:** As the owner, I want backlog item NP-066 (ALL, card, detail header, lists rows, duel, background, intro) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (DS-ALL-15; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/classes.ts and callers
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: tagClass, dotClass; rounded-full → rounded-pill; aliases through Tailwind names. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Grep rounded-full = 0 in names. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP066/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-066 Tags, the clay dot and token aliases spelled once`

### US-NP056: NP-056: Button gets a 52 px size, no ! overrides
**Description:** As the owner, I want backlog item NP-056 (ALL, match sheet, about, settings, chosen banner) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (DS-ALL-02; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/classes.ts, ui/Button.tsx, MatchSheet.tsx, about/AboutContent.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: ButtonSize 'tall' (h-13 px-6 text-card-title); drop the ! overrides. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Grep '!h-' = 0; heights unchanged in shots. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP056/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-056 Button gets a 52 px size, no ! overrides`

### US-NP059: NP-059: Filters chip comes from chipClass
**Description:** As the owner, I want backlog item NP-059 (G2, filters) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (DS-ALL-04; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/classes.ts, FiltersSheet.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: chipClass(selected, 'md') replaces the local chip. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Filters shots unchanged; grep local chipClass = 0. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP059/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-059 Filters chip comes from chipClass`

### US-NP018: NP-018: Callback: 'נכנסים' wording and the failure screen's own title
**Description:** As the owner, I want backlog item NP-018 (G1, auth/callback loading and error) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G1-08, IMP-A-G1-05; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: AuthCallback.tsx, app/names/auth/callback/page.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Title 'נכנסים…' and tab 'נכנסים'; failed branch sets its own <title>. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: document.title per state. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP018/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-018 Callback: 'נכנסים' wording and the failure screen's own titl`

### US-NP019: NP-019: Callback error offers the email code as a second way
**Description:** As the owner, I want backlog item NP-019 (G1, auth/callback error) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G1-20; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: AuthCallback.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Secondary link to /names/sign-in/email (keeping join). Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Error state shows both actions; join param kept. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP019/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-019 Callback error offers the email code as a second way`

### US-NP020: NP-020: Callback and join stop waiting after a deadline
**Description:** As the owner, I want backlog item NP-020 (G1, auth/callback loading, join joining) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-A-G1-06; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: AuthCallback.tsx, JoinScreen.tsx, lib/names/ (timeout constant)
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: After 15 s show the existing failure branch with its retry. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Hang the request: failure branch after the deadline. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP020/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-020 Callback and join stop waiting after a deadline`

### US-NP021: NP-021: Loading spinners keep a calm reduced-motion version
**Description:** As the owner, I want backlog item NP-021 (G1, auth/callback, join) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-A-G1-03, MOT-G13-09; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: app/names/names.css, AuthCallback.tsx, JoinScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: A names-spinner class; under reduced motion a slow opacity pulse instead of a frozen ring. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Reduced-motion emulation: the spinner pulses, no rotation. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP021/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-021 Loading spinners keep a calm reduced-motion version`

### US-NP095: NP-095: Reduced motion: no 0.01 ms 'all' transitions, dialog and toast keep their fade
**Description:** As the owner, I want backlog item NP-095 (ALL, reduced motion) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (MOT-G2-07, MOT-G13-03; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: app/names/names.css
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: transition-property:none in the switch-off; dialog-in/out and toast fades in the reduced list. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Reduced emulation: dialog and scrim fade together. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP095/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-095 Reduced motion: no 0.01 ms 'all' transitions, dialog and toa`

### US-NP099: NP-099: One menu entrance for both menus
**Description:** As the owner, I want backlog item NP-099 (ALL, row menu, skip long-press menu) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (MOT-G13-05, MOT-G2-11; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: app/names/names.css, lists/RowMenu.tsx, swipe/ActionBar.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: names-menu-in (opacity + scale 0.97, 150 ms) from the trigger's corner. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Frames. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP099/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-099 One menu entrance for both menus`

### US-NP035: NP-035: Rate-limit line: true for sends and tries, cleared when the wait is over
**Description:** As the owner, I want backlog item NP-035 (G1, sign-in both steps (429)) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G1-05, JRN-ALL-07; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lib/names/authErrors.ts, EmailSignIn.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: 'היו יותר מדי ניסיונות…' and clear the error on address change / next send. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Mock 429 then wait: next send clears the line. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP035/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-035 Rate-limit line: true for sends and tries, cleared when the `

### US-NP036: NP-036: 'משהו השתבש' says what failed
**Description:** As the owner, I want backlog item NP-036 (G1, sign-in send/verify failures) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G1-06; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lib/names/authErrors.ts
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Pick the line by the error area (send / verify / callback). Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Mock 500 per area: each line names the step. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP036/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-036 'משהו השתבש' says what failed`

### US-NP062: NP-062: Icons on a 2 px stroke
**Description:** As the owner, I want backlog item NP-062 (ALL, filters themes, card chevron, background tick) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (DS-ALL-09, ELEV-G2-06; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ThemeIcon.tsx, card/NameCard.tsx, BackgroundSheet.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: strokeWidth 2 everywhere. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Grep strokeWidth values. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP062/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-062 Icons on a 2 px stroke`

### US-NP071: NP-071: Titles balance and intros avoid one-word last lines
**Description:** As the owner, I want backlog item NP-071 (ALL, auth panels, offline, 404, goodbye, lists, hidden, add-name, about, legal items) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (ELEV-G1-04, IMP-C-G3-23; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: auth/AuthLayout.tsx, offline/page.tsx, not-found.tsx, GoodbyeScreen.tsx, ListsScreen.tsx, HiddenScreen.tsx, AddNameSheet.tsx, about/AboutContent.tsx, legal/LegalScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: text-balance on titles, text-pretty on leads and intros. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: impeccable detect: no straggler. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP071/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-071 Titles balance and intros avoid one-word last lines`

### US-NP015: NP-015: Sign-in fields are described by the step's lead
**Description:** As the owner, I want backlog item NP-015 (G1, sign-in email and code steps) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (A11Y-G1-05; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: auth/AuthLayout.tsx, EmailSignIn.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: id on the lead; aria-describedby on #email and the code input points to it. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: ariaSnapshot: the field's description includes the lead. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP015/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-015 Sign-in fields are described by the step's lead`

### US-NP008: NP-008: The wordmark doesn't jump between welcome and sign-in
**Description:** As the owner, I want backlog item NP-008 (G1, welcome → sign-in) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (ELEV-G1-03; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: auth/AuthLayout.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Take the back link out of the flow (absolute, same 44 px glass circle) so the wordmark keeps its place. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Welcome and sign-in shots overlaid: wordmark top equal ±2 px. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP008/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-008 The wordmark doesn't jump between welcome and sign-in`

### US-NP058: NP-058: Pressed state for secondary controls: links, rows, tiles
**Description:** As the owner, I want backlog item NP-058 (ALL, entry back circle, background tiles, filter rows, lists rows, settings rows) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (PRO-G1-03, PRO-G2-02, PRO-G3-01; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: auth/AuthLayout.tsx, ui/classes.ts, BackgroundSheet.tsx, FiltersSheet.tsx, ListsScreen.tsx, SettingsScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: iconButtonClass for the back circle; a non-scaling pressed fill (active:bg-sand / opacity) on links, rows and tiles. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Hold each control (mouse.down): visible pressed state. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP058/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-058 Pressed state for secondary controls: links, rows, tiles`

### US-NP111: NP-111: Sheet handle isn't a second 'סגירה' for screen readers
**Description:** As the owner, I want backlog item NP-111 (ALL, sheets with a header close) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (A11Y-G2-04, NP-UX-010; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/BottomSheet.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: aria-hidden and tabIndex -1 on the handle when closeInHeader. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: ariaSnapshot: one 'סגירה'. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP111/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-111 Sheet handle isn't a second 'סגירה' for screen readers`

### US-NP098: NP-098: Sheets, dialogs and menus get a short exit
**Description:** As the owner, I want backlog item NP-098 (ALL, short sheets, dialogs, row menu) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (INT-G2-05, INT-G3-06, MOT-G13-02; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/BottomSheet.tsx, ui/Dialog.tsx, lists/RowMenu.tsx, names.css
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: One closing state (EXIT_MS + onClosed) for every sheet, Dialog and the menu. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Frames after close: panel fades/slides over 150–200 ms. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP098/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-098 Sheets, dialogs and menus get a short exit`

### US-NP050: NP-050: Tall sheet sized with dvh in landscape
**Description:** As the owner, I want backlog item NP-050 (G2, name sheet landscape) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (NATIVE-ALL-06; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/BottomSheet.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: md:max-h-[90vh] → 90dvh. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Simulator landscape: sheet top and close button visible. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP050/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-050 Tall sheet sized with dvh in landscape`

### US-NP105: NP-105: Sheet gesture: a cancelled drag doesn't close the sheet
**Description:** As the owner, I want backlog item NP-105 (ALL, every sheet) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-A-G2-02; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/BottomSheet.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: cancelDrag on pointercancel resets offset and height. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: pointercancel mid-drag: sheet stays. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP105/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-105 Sheet gesture: a cancelled drag doesn't close the sheet`

### US-NP106: NP-106: Sheet gesture: a quick flick closes
**Description:** As the owner, I want backlog item NP-106 (ALL, every sheet) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (INT-G2-06; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/BottomSheet.tsx, ui/detents.ts
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: detentAfterDrag takes release velocity. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Fast 40 px flick closes. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP106/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-106 Sheet gesture: a quick flick closes`

### US-NP108: NP-108: Sheet gesture: rubber band past the top
**Description:** As the owner, I want backlog item NP-108 (ALL, every sheet) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (INT-G2-08; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/BottomSheet.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: rubberband(overshoot) instead of a hard stop. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Drag up past the limit: soft resistance. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP108/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-108 Sheet gesture: rubber band past the top`

### US-NP109: NP-109: Sheet content fades at the edges instead of a hard cut
**Description:** As the owner, I want backlog item NP-109 (G2, name sheet 70 %/full) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (ELEV-G2-02; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/BottomSheet.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: A one-step mask at the edge that has more content. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shots mid-scroll. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP109/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-109 Sheet content fades at the edges instead of a hard cut`

### US-NP107: NP-107: Sheet gesture: drag from the header and title too
**Description:** As the owner, I want backlog item NP-107 (ALL, every sheet) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (INT-G2-07; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/BottomSheet.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Bind the handle's pointer handlers to the header/title row, ignoring controls. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Drag on the title moves the sheet. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP107/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-107 Sheet gesture: drag from the header and title too`

### US-NP114: NP-114: Year chart: tooltip only on a tap, cleared on scroll
**Description:** As the owner, I want backlog item NP-114 (G2, name sheet chart) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-A-G2-03, ND-UX-001; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: detail/YearChart.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: onPointerCancel clears active; touch shows on tap only. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Scroll from the chart: no tooltip left. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP114/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-114 Year chart: tooltip only on a tap, cleared on scroll`

### US-NP115: NP-115: Year chart label stays inside the plot, 0 reads 'אף תינוק'
**Description:** As the owner, I want backlog item NP-115 (G2, name sheet chart) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (ND-UX-003; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: detail/YearChart.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Clamp the label to the plot area; zero wording. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: מוחמד 2003 and בלהה 2010 shots. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP115/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-115 Year chart label stays inside the plot, 0 reads 'אף תינוק'`

### US-NP116: NP-116: Numbers section: the rank as 'מקום 148', 2024 said once
**Description:** As the owner, I want backlog item NP-116 (G2, name sheet facts and numbers) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G2-19, COPY-G2-02; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: detail/NumbersSection.tsx, detail/ (facts)
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: 'מקום 148' with 'בדירוג 2024'; the chart line without the second year. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Strings and tests. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP116/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-116 Numbers section: the rank as 'מקום 148', 2024 said once`

### US-NP127: NP-127: Chosen banner looks tappable and says it opens a dialog
**Description:** As the owner, I want backlog item NP-127 (G3, lists chosen banner) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G3-22, A11Y-G3-05; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ListsScreen.tsx (ChosenBanner)
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Directional chevron at the end; aria-haspopup='dialog'. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shot; ariaSnapshot. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP127/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-127 Chosen banner looks tappable and says it opens a dialog`

### US-NP143: NP-143: Loved label sits on the name's baseline
**Description:** As the owner, I want backlog item NP-143 (G3, lists saved/matches loved rows) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (ELEV-G3-04; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ListsScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: items-baseline on the name line; heart self-center. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shot. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP143/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-143 Loved label sits on the name's baseline`

### US-NP144: NP-144: Lists at 320 px: title and row trend don't wrap alone
**Description:** As the owner, I want backlog item NP-144 (G3, lists every tab at 320) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G3-10; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ListsScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Action pair wraps or 'הוספת שם' icon-only under 22.5rem; drop min-w-max. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: 320 and 375 shots. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP144/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-144 Lists at 320 px: title and row trend don't wrap alone`

### US-NP130: NP-130: Survey prompt: a real question that looks tappable
**Description:** As the owner, I want backlog item NP-130 (G2, /names survey prompt) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G2-04, CRIT-G2-04; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: swipe/SurveyPrompt.tsx, SurveySheet.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: 'אפשר לשאול 5 שאלות קצרות על בחירת השם?' with an underline or chevron; lead '5 שאלות, כולן לא חובה.'. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shot. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP130/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-130 Survey prompt: a real question that looks tappable`

### US-NP131: NP-131: Survey sheet copy: empty-submit line, submit label, 'אחרי הלידה'
**Description:** As the owner, I want backlog item NP-131 (G2, survey sheet) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G2-05, IMP-C-G2-16, COPY-G2-06; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: SurveySheet.tsx, lib/names/survey.ts
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Three strings; the stored value stays 'born'. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Strings and tests. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP131/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-131 Survey sheet copy: empty-submit line, submit label, 'אחרי הל`

### US-NP133: NP-133: Filters copy: 'אפשר לבחור', 'אדמה ויבשה', 'כל האורכים'
**Description:** As the owner, I want backlog item NP-133 (G2, filters) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G2-08, COPY-G2-09, IMP-C-G2-09; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: FiltersSheet.tsx, lib/names/themes.ts
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Three labels; theme ids unchanged. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Strings and tests. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP133/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-133 Filters copy: 'אפשר לבחור', 'אדמה ויבשה', 'כל האורכים'`

### US-NP134: NP-134: Filters can't be applied with 0 results
**Description:** As the owner, I want backlog item NP-134 (G2, filters) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G2-12; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: FiltersSheet.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: At n = 0 the apply button says 'אין שמות שמתאימים' and is aria-disabled. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Pick ת + ארוך. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP134/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-134 Filters can't be applied with 0 results`

### US-NP145: NP-145: Add-name and settings field errors as full sentences
**Description:** As the owner, I want backlog item NP-145 (G3, add-name error, settings name) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G3-03, IMP-C-G3-17; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lib/names/custom.ts, SettingsScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Full sentences ('השם הזה כבר ברשימה ״שמרתי״.'). Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Strings and tests. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP145/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-145 Add-name and settings field errors as full sentences`

### US-NP079: NP-079: Counts: thousands separators and tabular digits
**Description:** As the owner, I want backlog item NP-079 (ALL, header pill, position line, apply label, tabs, duel counter) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (BREAK-G2-03, BREAK-G3-02, PRO-G2-04; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lib/names/card.ts (formatCount), swipe/, FiltersSheet.tsx, ListsScreen.tsx, lists/DuelScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: formatCount everywhere, no-break space after '·', tabular-nums on numbers that change. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: 1,284 everywhere; digits don't shift. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP079/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-079 Counts: thousands separators and tabular digits`

### US-NP080: NP-080: Deck end and recap name lists: not button-styled, say how many more
**Description:** As the owner, I want backlog item NP-080 (G2, deck end, round recap) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (CRIT-G2-03, BREAK-G2-04; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: swipe/EmptyDeck.tsx, swipe/PausePanel.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Plain ' · ' text (or a flat tag) and a trailing 'ועוד {n}'. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: 1,284 saved: list ends with 'ועוד …'; no pill look. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP080/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-080 Deck end and recap name lists: not button-styled, say how ma`

### US-NP063: NP-063: Deck end and pause titles keep text-title's weight
**Description:** As the owner, I want backlog item NP-063 (G2, deck end, empty filter, pause) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (DS-ALL-10; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: swipe/EmptyDeck.tsx, swipe/PausePanel.tsx, tests/names/designGuard.test.ts
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Drop font-bold on the four headings; guard against heading-role weight overrides. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Computed weight 800. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP063/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-063 Deck end and pause titles keep text-title's weight`

### US-NP081: NP-081: Deck end with nothing saved: no 'הפעם', the list button secondary
**Description:** As the owner, I want backlog item NP-081 (G2, deck end, nothing saved) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (CRIT-G2-02; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: swipe/EmptyDeck.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: 'לא נשמרו שמות.' and secondary variant in that branch. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shot. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP081/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-081 Deck end with nothing saved: no 'הפעם', the list button seco`

### US-NP093: NP-093: Swipe stamp: opaque, painted by refs
**Description:** As the owner, I want backlog item NP-093 (G2, /names drag) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (ELEV-G2-03, MOT-G2-09; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: card/NameCard.tsx, swipe/useSwipeDrag.ts
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: bg-surface stamp; set opacity on the three stamp spans directly instead of inherited CSS variables. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Drag shot: stamp covers the position line; no style recalc on the card. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP093/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-093 Swipe stamp: opaque, painted by refs`

### US-NP096: NP-096: Toasts: enter and exit, timer pauses in the background
**Description:** As the owner, I want backlog item NP-096 (ALL, toasts) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (INT-G2-10, MOT-G2-08; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lib/names/toast.ts, ui/ToastRegion.tsx, names.css
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: @starting-style entrance, a short exit, timer paused on visibilitychange. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Frames; background 5 s then return: toast still up. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP096/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-096 Toasts: enter and exit, timer pauses in the background`

### US-NP128: NP-128: One wording for vote, hide and 'don't show again' messages
**Description:** As the owner, I want backlog item NP-128 (ALL, deck status, toasts, row menu) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G2-03, IMP-C-G2-13, COPY-G3-04; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lib/names/a11y.ts, lists/RowMenu.tsx, ListsScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Toasts use the status sentences; 'לא להציג שוב' and 'השם {name} לא יוצג שוב' everywhere. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Strings and tests. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP128/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-128 One wording for vote, hide and 'don't show again' messages`

### US-NP132: NP-132: Background sheet copy: the privacy note and a save failure that blames storage
**Description:** As the owner, I want backlog item NP-132 (G2, background sheet) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G2-07, ND-UX-005; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: BackgroundSheet.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Rewritten privacy note; separate the decode and save failures in the message. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Ephemeral WebKit: the save-failure line. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP132/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-132 Background sheet copy: the privacy note and a save failure t`

### US-NP136: NP-136: Offline lines: one icon and wording, matches announces the change
**Description:** As the owner, I want backlog item NP-136 (ALL, name sheet offline details, matches offline) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G2-15, IMP-C-G3-18, A11Y-G3-03; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: detail/ (offline line), ListsScreen.tsx (MatchesPanel), ConnectionNote.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: wifi-off icon + 'אין חיבור לאינטרנט…' in both; matches line inside an always-mounted role=status. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Offline shots; aria log. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP136/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-136 Offline lines: one icon and wording, matches announces the c`

### US-NP118: NP-118: 'הוספת שם משפחה' as a small link
**Description:** As the owner, I want backlog item NP-118 (G2, name sheet without surname) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (CRIT-G2-05; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: detail/ (surname line)
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: text-caption medium ink-soft underline, ≥ 44 px through padding. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shot; target ≥ 44. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP118/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-118 'הוספת שם משפחה' as a small link`

### US-NP155: NP-155: Opt-in switch: label read once, every tap counts
**Description:** As the owner, I want backlog item NP-155 (G3, settings opt-in) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (A11Y-G3-06, INT-G3-07; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: SettingsScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: aria-labelledby the title; keep the last asked value and resend, show busy. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Two taps 150 ms apart end on the right value. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP155/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-155 Opt-in switch: label read once, every tap counts`

### US-NP150: NP-150: Delete confirm looks like the row that opened it
**Description:** As the owner, I want backlog item NP-150 (G3, settings delete dialog) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G3-15; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: SettingsScreen.tsx, ui/Dialog.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Secondary pill with text-urgent and the trash icon. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shot. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP150/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-150 Delete confirm looks like the row that opened it`

### US-NP151: NP-151: Leave row marked like the other destructive row
**Description:** As the owner, I want backlog item NP-151 (G3, settings shared) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (PRO-G3-02; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: SettingsScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: text-urgent title on the leave row. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shot. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP151/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-151 Leave row marked like the other destructive row`

### US-NP153: NP-153: Settings: long Latin names read from the start, email wraps whole
**Description:** As the owner, I want backlog item NP-153 (G3, settings) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (BREAK-G3-06; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: SettingsScreen.tsx, Onboarding.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: dir='auto' on the name inputs; wrap-anywhere on the email bdi. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: 40-char Latin name shot. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP153/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-153 Settings: long Latin names read from the start, email wraps `

### US-NP162: NP-162: Duel picks: press feedback and a step transition
**Description:** As the owner, I want backlog item NP-162 (G3, duel rounds) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G3-12, MOT-G13-06; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lists/DuelScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: PRESS at 0.97; keyed names with a 150–200 ms fade, progress bar transition; reduced version. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Frames. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP162/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-162 Duel picks: press feedback and a step transition`

### US-NP097: NP-097: Duel stop toast doesn't cover the result's link
**Description:** As the owner, I want backlog item NP-097 (G3, duel → stop → reopen) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (NP-UX-008; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lists/DuelScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Dismiss the toast when the duel reopens. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Stop then reopen within 4 s: link tappable. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP097/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-097 Duel stop toast doesn't cover the result's link`

### US-NP163: NP-163: Duel has its own page title
**Description:** As the owner, I want backlog item NP-163 (G3, duel) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (A11Y-G3-04; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lists/DuelScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Set document.title while mounted, restore on unmount. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: document.title. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP163/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-163 Duel has its own page title`

### US-NP164: NP-164: Duel card details read once
**Description:** As the owner, I want backlog item NP-164 (G3, duel rounds) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (A11Y-G3-07; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lists/DuelScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: hidden instead of sr-only on the description span. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: ariaSnapshot. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP164/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-164 Duel card details read once`

### US-NP165: NP-165: Duel counter: no shift, gone when done
**Description:** As the owner, I want backlog item NP-165 (G3, duel) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G3-11; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lists/DuelScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Hide when done; estimate while the total can change. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shots. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP165/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-165 Duel counter: no shift, gone when done`

### US-NP166: NP-166: Duel's top-five chips aren't toggles
**Description:** As the owner, I want backlog item NP-166 (G3, duel mid-way) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G3-13; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lists/DuelScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: hintChipClass look. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shot. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP166/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-166 Duel's top-five chips aren't toggles`

### US-NP168: NP-168: Duel blob only behind cards
**Description:** As the owner, I want backlog item NP-168 (G3, duel few, loading) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (ELEV-G3-03; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lists/DuelScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Render the blob only with a pair or result. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shots. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP168/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-168 Duel blob only behind cards`

### US-NP161: NP-161: Duel: a double tap records one pick
**Description:** As the owner, I want backlog item NP-161 (G3, duel rounds) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-A-G3-03; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lists/DuelScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Ignore a pick within ~300 ms or key by pair. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Double tap: one round advances. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP161/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-161 Duel: a double tap records one pick`

### US-NP167: NP-167: Duel result: #1 stands out, names open their sheet
**Description:** As the owner, I want backlog item NP-167 (G3, duel done) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G3-14; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lists/DuelScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: RowName buttons; #1 in text-section; tighter gaps. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shot; tap opens the sheet. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP167/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-167 Duel result: #1 stands out, names open their sheet`

### US-NP169: NP-169: Duel in landscape shows both names
**Description:** As the owner, I want backlog item NP-169 (G3, duel landscape) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (PRO-G3-03; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lists/DuelScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Two columns under a short-height query. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Simulator landscape shot. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP169/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-169 Duel in landscape shows both names`

### US-NP006: NP-006: Fields are read-only while their request is in flight
**Description:** As the owner, I want backlog item NP-006 (G1, sign-in email and code steps) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (INT-G1-02; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: EmailSignIn.tsx, auth/CodeInput.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: readOnly={busy} on the email input and the code input. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Slow mocked send: typing in the field does nothing until the answer. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP006/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-006 Fields are read-only while their request is in flight`

### US-NP034: NP-034: Sign-in copy: 'מייל' everywhere, a clear lead, a true invalid-address line
**Description:** As the owner, I want backlog item NP-034 (G1, welcome, sign-in, survey) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G1-02, COPY-G1-03, COPY-G1-04; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: EmailSignIn.tsx, lib/names/authErrors.ts, SurveySheet.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: 'מייל' only; lead with an unambiguous verb; empty vs incomplete address messages. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Grep 'אימייל' = 0; tests updated. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP034/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-034 Sign-in copy: 'מייל' everywhere, a clear lead, a true invali`

### US-NP007: NP-007: Back from the code step returns to the email step
**Description:** As the owner, I want backlog item NP-007 (G1, sign-in code step) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G1-17; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: EmailSignIn.tsx, auth/AuthLayout.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: On the code step the back control runs changeAddress(). Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Code step → back: email step with the address kept. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP007/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-007 Back from the code step returns to the email step`

### US-NP102: NP-102: Email step turns into the code step with a short transition
**Description:** As the owner, I want backlog item NP-102 (G1, sign-in) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (MOT-G13-07; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: EmailSignIn.tsx, names.css
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Key by step; names-step-in 200 ms with a reduced version. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Frames. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP102/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-102 Email step turns into the code step with a short transition`

### US-NP013: NP-013: Closed sign-ups notice says who the buttons below are for
**Description:** As the owner, I want backlog item NP-013 (G1, welcome ?closed=1) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (CRIT-G1-04; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lib/names/auth.ts (SIGNUPS_CLOSED_MESSAGE)
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Add the clause that existing accounts can still sign in. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Closed notice reads as above; test updated. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP013/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-013 Closed sign-ups notice says who the buttons below are for`

### US-NP016: NP-016: Google sign-in says it's moving on while Google loads
**Description:** As the owner, I want backlog item NP-016 (G1, welcome, join, after 'כניסה עם Google') fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (INT-G1-04; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: WelcomeActions.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Busy label 'מעבירים ל־Google…' with the G mark and the shared disabled opacity. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Slow mocked OAuth start: the label changes and the button is disabled. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP016/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-016 Google sign-in says it's moving on while Google loads`

### US-NP017: NP-017: Welcome Google failure offers the next step
**Description:** As the owner, I want backlog item NP-017 (G1, welcome after Google fails) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G1-07; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: WelcomeActions.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Failure line followed by 'אפשר לנסות שוב או להיכנס עם קוד במייל'. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Mock OAuth failure: line shows with the next step. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP017/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-017 Welcome Google failure offers the next step`

### US-NP032: NP-032: Surname field purpose in its hint, not its placeholder
**Description:** As the owner, I want backlog item NP-032 (G1, intro surname step) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G1-11; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: Intro.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Drop the placeholder; hint 'כדי לראות את השם המלא על הכרטיס. נשמר רק במכשיר הזה.'. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Hint visible while typing; test updated. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP032/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-032 Surname field purpose in its hint, not its placeholder`

### US-NP033: NP-033: Intro copy: the solo privacy line and the third point
**Description:** As the owner, I want backlog item NP-033 (G1, intro) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G1-09, COPY-G1-10; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: Intro.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: One-fact privacy line; impersonal third point. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Strings and tests. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP033/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-033 Intro copy: the solo privacy line and the third point`

### US-NP037: NP-037: Goodbye copy without 'מהשרת'
**Description:** As the owner, I want backlog item NP-037 (G1, goodbye) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G1-14; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lib/names/accountDeletion.ts
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: DELETED_LEAD = 'כל הבחירות שלך נמחקו מ־Nest ומהמכשיר הזה.'. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: String and test. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP037/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-037 Goodbye copy without 'מהשרת'`

### US-NP149: NP-149: Delete dialog copy: says what's deleted and that it can't be undone, a true 429 line
**Description:** As the owner, I want backlog item NP-149 (G3, settings delete dialog) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G3-07, COPY-G3-08; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lib/names/accountDeletion.ts
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: DELETE_BODY and DELETE_WAIT_TEXT rewritten. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Strings and tests. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP149/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-149 Delete dialog copy: says what's deleted and that it can't be`

### US-NP156: NP-156: Settings confirms have a deadline and can't lose their result
**Description:** As the owner, I want backlog item NP-156 (G3, settings delete and leave) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-A-G3-04; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lib/names/accountDeletion.ts, lib/names/ (leave), SettingsScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: AbortSignal.timeout(15000); no dismiss while the request runs. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Hang the request: error after 15 s. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP156/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-156 Settings confirms have a deadline and can't lose their resul`

### US-NP041: NP-041: Unconfigured notice has a way out
**Description:** As the owner, I want backlog item NP-041 (G1, unconfigured notice) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G1-12; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: Unconfigured.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Wordmark, a 'try later' line and a link to /. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Render with missing env: shot. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP041/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-041 Unconfigured notice has a way out`

### US-NP042: NP-042: Invite screen: both sections built the same way
**Description:** As the owner, I want backlog item NP-042 (G1, invite) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (CRIT-G1-05; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: InviteScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Both headings above their cards; member rows text-card-title. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shot vs settings sections. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP042/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-042 Invite screen: both sections built the same way`

### US-NP043: NP-043: Invite expiry as one sentence
**Description:** As the owner, I want backlog item NP-043 (G1, invite link ready) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (ELEV-G1-06; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: InviteScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: 'הקישור בתוקף עד … ועובד פעם אחת.' (bdi kept). Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: String and test. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP043/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-043 Invite expiry as one sentence`

### US-NP046: NP-046: A message shown as a toast isn't also written to a status
**Description:** As the owner, I want backlog item NP-046 (ALL, invite copy, lists add, settings name and leave) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (A11Y-G1-07, A11Y-G3-02; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: InviteScreen.tsx, ListsScreen.tsx, SettingsScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Drop the local sr status where a toast already announces; check ToastRegion re-announces a repeat. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: aria log: each message read once. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP046/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-046 A message shown as a toast isn't also written to a status`

### US-NP044: NP-044: Invite link wraps so the code shows
**Description:** As the owner, I want backlog item NP-044 (G1, invite link ready) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (BREAK-G1-03; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: InviteScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Read-only wrapping text block (sand well, ltr, wrap-anywhere, select-all) instead of a clipped field. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: 320 px: the whole link is visible. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP044/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-044 Invite link wraps so the code shows`

### US-NP045: NP-045: 'הקישור הועתק' shows at the button that copied
**Description:** As the owner, I want backlog item NP-045 (G1, invite copy) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (INT-G1-05; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: InviteScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Swap the copy button to a check + 'הקישור הועתק' for 2 s. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Tap copy: the button changes for 2 s, width unchanged. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP045/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-045 'הקישור הועתק' shows at the button that copied`

### US-NP051: NP-051: Name fields: no autocorrect, return-key labels
**Description:** As the owner, I want backlog item NP-051 (ALL, add-name, intro surname, onboarding, settings) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (NATIVE-ALL-07; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lists/AddNameSheet.tsx, Intro.tsx, Onboarding.tsx, SettingsScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: autoCorrect='off' spellCheck={false}, enterKeyHint on the five name fields. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: DOM attributes. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP051/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-051 Name fields: no autocorrect, return-key labels`

### US-NP052: NP-052: Android keyboard resizes content, not covers buttons
**Description:** As the owner, I want backlog item NP-052 (ALL, sheets with fields) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (NATIVE-ALL-08; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: app/names/layout.tsx (viewport)
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: interactiveWidget: 'resizes-content'. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Rendered meta viewport. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP052/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-052 Android keyboard resizes content, not covers buttons`

### US-NP067: NP-067: Layout spacing on the documented scale
**Description:** As the owner, I want backlog item NP-067 (ALL, sheets, dialogs, about, invite, card) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (DS-ALL-16; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: files with gap-2.5/3.5/4.5, px-5.5, py-7, p-3.5
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Snap the half steps to the scale, checked against each board. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shots vs boards. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP067/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-067 Layout spacing on the documented scale`

### US-NP078: NP-078: Offline pending text says what happens next
**Description:** As the owner, I want backlog item NP-078 (G2, /names offline pending) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G2-01; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lib/names/offline.ts
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: 'החלטה אחת תישלח כשהחיבור יחזור' / '{n} החלטות יישלחו…'. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: String and test. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP078/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-078 Offline pending text says what happens next`

### US-NP083: NP-083: Recap with no saves: neutral full sentence
**Description:** As the owner, I want backlog item NP-083 (G2, pause recap) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G2-10; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lib/names/launch.ts
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: 'עברת על 30 שמות ועוד לא שמרת אף אחד בסבב הזה.'. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: String and test. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP083/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-083 Recap with no saves: neutral full sentence`

### US-NP084: NP-084: Nest card button doesn't compete with the screen's main action
**Description:** As the owner, I want backlog item NP-084 (G2, deck end, recap, decision sheet) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (PRO-G2-05; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: NestCard.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Opt-in as secondary md. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shot: one ink button per screen. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP084/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-084 Nest card button doesn't compete with the screen's main acti`

### US-NP090: NP-090: Next card follows a drag that starts during its entrance
**Description:** As the owner, I want backlog item NP-090 (G2, /names right after a decision) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (INT-G2-09; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: swipe/useSwipeDrag.ts
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Finish the enter animation when a drag starts. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Drag at 100 ms after decide: card under the finger. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP090/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-090 Next card follows a drag that starts during its entrance`

### US-NP092: NP-092: Voting on another name in the sheet doesn't replay the card entrance
**Description:** As the owner, I want backlog item NP-092 (G2, name sheet similar name vote) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (MOT-G2-06; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: swipe/SwipeScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Drop setEntered(true) from decideOther. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: getAnimations on the card after the vote = none. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP092/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-092 Voting on another name in the sheet doesn't replay the card `

### US-NP091: NP-091: Undo brings the card back from where it left
**Description:** As the owner, I want backlog item NP-091 (G2, undo) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (MOT-G2-05; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: swipe/SwipeScreen.tsx, swipe/CardStack.tsx, swipe/useSwipeDrag.ts
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Pass the undone kind; play the reverse of its fling. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Video frames of undo. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP091/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-091 Undo brings the card back from where it left`

### US-NP087: NP-087: 200 % zoom: the card scrolls by itself and the bar stays reachable
**Description:** As the owner, I want backlog item NP-087 (G2, /names at 195 × 422) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (NP-UX-011, ND-UX-007; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: swipe/SwipeScreen.tsx, swipe/useSwipeDrag.ts
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Cap the card at the viewport in the h-auto fallback so pan-y applies. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Zoom 200 %: a pan on the card scrolls, bar visible. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP087/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-087 200 % zoom: the card scrolls by itself and the bar stays rea`

### US-NP112: NP-112: Source line isn't a contentinfo landmark
**Description:** As the owner, I want backlog item NP-112 (G2, name sheet bottom) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (A11Y-G2-05; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: detail/SourceSection.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: div instead of footer. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: axe landmarks. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP112/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-112 Source line isn't a contentinfo landmark`

### US-NP113: NP-113: Report sheet opens without the keyboard
**Description:** As the owner, I want backlog item NP-113 (G2, report sheet) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-A-G2-05; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: about/ReportSheet.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Drop data-autofocus on the textarea. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Simulator: opens with the panel focused. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP113/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-113 Report sheet opens without the keyboard`

### US-NP121: NP-121: Long custom names wrap anywhere on match, decision, duel
**Description:** As the owner, I want backlog item NP-121 (ALL, match, decision, duel) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (BREAK-G2-05, BREAK-G3-03; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: MatchSheet.tsx, DecisionSheet.tsx, lists/DuelScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: wrap-anywhere instead of break-words. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: 20-char no-space name at 320 px with large text. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP121/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-121 Long custom names wrap anywhere on match, decision, duel`

### US-NP123: NP-123: Match sheet shows niqqud like the decision sheet
**Description:** As the owner, I want backlog item NP-123 (G2, match sheet) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G2-14; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: MatchSheet.tsx, ListsScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Pass the card and show its niqqud. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Match shot with a niqqud name. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP123/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-123 Match sheet shows niqqud like the decision sheet`

### US-NP135: NP-135: 'אנשים מוכרים' in the about text too
**Description:** As the owner, I want backlog item NP-135 (G2, about sheet, card people) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G2-12; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: about/AboutContent.tsx, card/CardPeople.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: One term; drop the unused branch. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Strings and tests. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP135/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-135 'אנשים מוכרים' in the about text too`

### US-NP140: NP-140: Row menu: a divider before the removals
**Description:** As the owner, I want backlog item NP-140 (G3, lists row menu) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G3-20; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lists/RowMenu.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: border-t border-line between choose and the two removals. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shot. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP140/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-140 Row menu: a divider before the removals`

### US-NP141: NP-141: A tap outside the row menu only closes it
**Description:** As the owner, I want backlog item NP-141 (G3, lists row menu) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (INT-G3-05; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lists/RowMenu.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: One-shot capture click that swallows the tap that closed the menu. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Tap another row while open: no sheet opens. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP141/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-141 A tap outside the row menu only closes it`

### US-NP142: NP-142: Row menu trigger without a glass disc in list cards
**Description:** As the owner, I want backlog item NP-142 (G3, lists rows) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (ELEV-G3-01; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lists/RowMenu.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Transparent 44 × 44 trigger at rest, pressed fill. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shots. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP142/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-142 Row menu trigger without a glass disc in list cards`

### US-NP147: NP-147: One sentence for 'skips stay private'
**Description:** As the owner, I want backlog item NP-147 (G3, matches intro, solo invite card) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G3-06; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lib/names/matches.ts, ListsScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: 'על מה דילגת נשאר רק אצלך.' in the four places. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Strings and tests. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP147/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-147 One sentence for 'skips stay private'`

### US-NP148: NP-148: Leave-done line with a verb
**Description:** As the owner, I want backlog item NP-148 (G3, settings after leaving) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G3-05; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lib/names/ (LEAVE_DONE)
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: '…השמות ששמרת נשארו אצלך.'. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: String and test. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP148/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-148 Leave-done line with a verb`

### US-NP152: NP-152: Leave dialog names at most three members, isolated
**Description:** As the owner, I want backlog item NP-152 (G3, settings leave dialog) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (BREAK-G3-05; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: lib/names/ (leaveBody)
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: FSI/PDI around each name, 3 names + 'ועוד {n}'. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: 12-member mixed-script space. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP152/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-152 Leave dialog names at most three members, isolated`

### US-NP158: NP-158: Install steps use Hebrew quotes
**Description:** As the owner, I want backlog item NP-158 (G3, install sheet) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G3-11; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: pwa/ (INSTALL_STEPS)
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: ״הוספה למסך הבית״. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: String and test. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP158/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-158 Install steps use Hebrew quotes`

### US-NP159: NP-159: Operator name doesn't break in the legal intro
**Description:** As the owner, I want backlog item NP-159 (G3, privacy, terms) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G3-19; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: legal/LegalScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: whitespace-nowrap on the operator bdi (frame only). Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: 320 shot. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP159/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-159 Operator name doesn't break in the legal intro`

### US-NP023: NP-023: Join's outcome is announced once, from a region mounted on first render
**Description:** As the owner, I want backlog item NP-023 (G1, join signed in) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (A11Y-G1-06; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: JoinScreen.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: One always-mounted sr-only role=status whose text changes with the outcome. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: VoiceOver/aria log: outcome read once. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP023/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-023 Join's outcome is announced once, from a region mounted on f`

### US-NP040: NP-040: The 404 keeps its own page title
**Description:** As the owner, I want backlog item NP-040 (G1, 404) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-A-G1-04; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: app/names/not-found.tsx, [...missing]/page.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Find why the title is replaced on the client (Next 16 docs) and keep the not-found metadata. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: document.title after hydration. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP040/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-040 The 404 keeps its own page title`

### US-NP064: NP-064: Content width as a token
**Description:** As the owner, I want backlog item NP-064 (ALL, every page shell and sheet) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (DS-ALL-12; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: tokens.json → nest-tokens.css, app/names/names.css, 14 files
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: New --nest-content-max: 480px with max-w-content; replace max-w-[480px]. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Grep max-w-[480px] = 0. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP064/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-064 Content width as a token`

### US-NP070: NP-070: DESIGN.md documents the type roles and the shared patterns
**Description:** As the owner, I want backlog item NP-070 (ALL, docs) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (DS-ALL-11, DS-ALL-18; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: DESIGN.md
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Type roles as used; component entries for the patterns the DS items add. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Docs review. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP070/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-070 DESIGN.md documents the type roles and the shared patterns`

### US-NP100: NP-100: Add-name sheet slides in on Safari
**Description:** As the owner, I want backlog item NP-100 (G3, add-name sheet) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (MOT-G13-01; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/useModal.ts
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Focus a text field after the panel's animationend. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Simulator frames show the slide. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP100/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-100 Add-name sheet slides in on Safari`

### US-NP103: NP-103: Background change crossfades
**Description:** As the owner, I want backlog item NP-103 (G2, background sheet) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (MOT-G2-10; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ScreenBackground.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Keep the old layer for a 200 ms opacity crossfade. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Frames. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP103/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-103 Background change crossfades`

### US-NP104: NP-104: First save shows where the name went
**Description:** As the owner, I want backlog item NP-104 (G2, /names first save) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (JRN-ALL-08; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: swipe/SwipeHeader.tsx, names.css
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: A ≤ 300 ms count pulse on the pill on save, none under reduced motion. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Frames on save. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP104/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-104 First save shows where the name went`

### US-NP119: NP-119: Sparkline spans the trend tile
**Description:** As the owner, I want backlog item NP-119 (G2, card trend tile) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (ELEV-G2-04; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: card/CardStats.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: h-auto w-full on the sparkline, keep viewBox. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shot: ends on the tile's edges. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP119/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-119 Sparkline spans the trend tile`

### US-NP120: NP-120: The girls' share stays visible on the sex bar in Safari
**Description:** As the owner, I want backlog item NP-120 (G2, card sex bar, welcome preview) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (IMP-C-G1-21; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: card/CardSexBar.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: A track or edge from an existing token. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Safari shot of a 1 % girls name. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP120/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-120 The girls' share stays visible on the sex bar in Safari`

### US-NP146: NP-146: One term per thing: the app, the shared choice, the invite
**Description:** As the owner, I want backlog item NP-146 (ALL, G3 leads, settings, deck end) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (COPY-G3-01, COPY-G3-09; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: HiddenScreen.tsx, lists/AddNameSheet.tsx, SettingsScreen.tsx, swipe/EmptyDeck.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: 'בחירת שם' for the app, 'הבחירה המשותפת', 'הזמנה לבחירה משותפת' everywhere. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Grep and tests. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP146/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-146 One term per thing: the app, the shared choice, the invite`

### US-NP061: NP-061: One shared Icon with named glyphs
**Description:** As the owner, I want backlog item NP-061 (ALL, all) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (DS-ALL-08; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: ui/icons.tsx (new), 34 files
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Icon({size}) stroke 2 round caps; CloseIcon, ChevronIcon, CheckIcon …; one check mark. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Grep local Icon helpers = 0; shots unchanged. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP061/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-061 One shared Icon with named glyphs`

### US-NP065: NP-065: Match and decision sheets share one MomentSheet
**Description:** As the owner, I want backlog item NP-065 (G2, match, decision) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (DS-ALL-14; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: MomentSheet.tsx (new), MatchSheet.tsx, DecisionSheet.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: One component with eyebrow/name/line/meta/actions; same DOM and classes. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Shots identical before/after. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP065/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-065 Match and decision sheets share one MomentSheet`

### US-NP101: NP-101: Name sheet's slide-in isn't eaten by the mount
**Description:** As the owner, I want backlog item NP-101 (G2, card tap → name sheet) fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Reads the item's row in `scripts/ralph/qa/name-polish-2/backlog.md` and the findings it merges (MOT-G2-04; where each lives is written at the top of the backlog), the skill rule each finding cites, `DESIGN.md`, and the files: detail/NameDetailSheet.tsx
- [ ] If the problem is no longer there (fixed by an earlier story or a later change on main), or the item now needs the owner (PRD §3.2: it would change a token value, a board layout, an earlier owner decision, legal text or name content, or add a feature), sets it `dropped` with the evidence (or adds it to `owner-decisions.md`), commits only the records if anything changed, and passes
- [ ] Before editing: saves before screenshots in each browser the item touches
- [ ] Change: Render the shell and first section first; defer chart and similar names. Make it in the shared component when the pattern repeats; stay inside PRD §3.1 (no token value change, no new feature, no dependency, no name data file)
- [ ] Verify: Simulator frames; open < 150 ms kept. In WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish-2/shots/US-NP101/`; reads each PNG
- [ ] Sets the row `done` in `backlog.md` and adds a row to `polish-log.md` (story, id, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-101 Name sheet's slide-in isn't eaten by the mount`

### US-R1: Re-score G1 Entry
**Description:** As the owner, I want proof that entry got better and nothing got worse.

**Acceptance criteria:**
- [ ] Re-runs impeccable `reference/critique.md` on every screen of G1 with the method of the first run's `US-A-IMP-C-G1`; writes the table in `scores.md` next to the first run's after scores (`scripts/ralph/qa/name-polish/scores.md`), with the change per screen
- [ ] Screenshots of every screen and state of G1 in all three browsers to `scripts/ralph/qa/name-polish-2/shots/after/G1/`; reads each
- [ ] A screen that scores lower than the first run's after score, or any visible regression, goes into `bugs.md`
- [ ] No code change; commits only the records: `docs(names): re-score G1 after the second polish run`

### US-R2: Re-score G2 Deck
**Description:** As the owner, I want proof that deck got better and nothing got worse.

**Acceptance criteria:**
- [ ] Re-runs impeccable `reference/critique.md` on every screen of G2 with the method of the first run's `US-A-IMP-C-G2`; writes the table in `scores.md` next to the first run's after scores (`scripts/ralph/qa/name-polish/scores.md`), with the change per screen
- [ ] Screenshots of every screen and state of G2 in all three browsers to `scripts/ralph/qa/name-polish-2/shots/after/G2/`; reads each
- [ ] A screen that scores lower than the first run's after score, or any visible regression, goes into `bugs.md`
- [ ] No code change; commits only the records: `docs(names): re-score G2 after the second polish run`

### US-R3: Re-score G3 Lists and settings
**Description:** As the owner, I want proof that lists and settings got better and nothing got worse.

**Acceptance criteria:**
- [ ] Re-runs impeccable `reference/critique.md` on every screen of G3 with the method of the first run's `US-A-IMP-C-G3`; writes the table in `scores.md` next to the first run's after scores (`scripts/ralph/qa/name-polish/scores.md`), with the change per screen
- [ ] Screenshots of every screen and state of G3 in all three browsers to `scripts/ralph/qa/name-polish-2/shots/after/G3/`; reads each
- [ ] A screen that scores lower than the first run's after score, or any visible regression, goes into `bugs.md`
- [ ] No code change; commits only the records: `docs(names): re-score G3 after the second polish run`

### US-D1: Docs
**Description:** As the next person working on the swiper, I want the docs to match what this run changed.

**Acceptance criteria:**
- [ ] Updates `DESIGN.md` for every pattern, token or component this run added or changed (from `polish-log.md`), e.g. the shared link, skeleton, segmented and Icon pieces if they were built
- [ ] Updates `docs/names-pwa/README.md` ('Design tokens' and component notes) where they changed
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `docs(names): document the second polish run`

### US-SA: Self-audit before QA
**Description:** As the QA cycles, I want the obvious problems in this run's diff gone first.

**Acceptance criteria:**
- [ ] Reviews the full diff of this run (`git diff <US-000 commit>..HEAD -- src`) against PRD §3.1 and the first run's §8: no hex, rgb or px font size, no physical left/right, no new dependency, no green, labelled icon buttons, reduced motion for every new animation, no new analytics event, no name data file touched
- [ ] Re-measures the first-load JS of `/names` against the US-002 baseline (+3 KB budget); writes both numbers in `scores.md`
- [ ] Fixes what it finds (or files it in `bugs.md` if it's large)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once if anything changed: `fix(names): second polish run self-audit`

### US-QA0: QA setup
**Description:** As the QA cycles, I need a clean, known starting state in every browser.

**Acceptance criteria:**
- [ ] Production build on port 3100 (`npm run build && npm run start -- -p 3100`), checked by curl
- [ ] QA users 1–3 signed in over REST (`login.mjs`), their `name_votes` rows deleted through REST as each user, user 1 onboarded; users 1 and 2 share one space, user 3 solo (write what you did in `progress.txt`)
- [ ] Simulator Mobile Safari signed in as user 1 on port 3100 (≤ 2 emails)
- [ ] One screenshot per browser of `/names` proves all three work
- [ ] No commit

### US-QA1-A: QA cycle 1: Entry screens
**Description:** As the owner, I want area A (Entry screens) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 A (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area A checklist run in full, even if it passed in an earlier cycle

### US-QA1-B: QA cycle 1: Swipe screen and card
**Description:** As the owner, I want area B (Swipe screen and card) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 B (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area B checklist run in full, even if it passed in an earlier cycle

### US-QA1-C: QA cycle 1: Detail sheet
**Description:** As the owner, I want area C (Detail sheet) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 C (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area C checklist run in full, even if it passed in an earlier cycle

### US-QA1-D: QA cycle 1: Other sheets
**Description:** As the owner, I want area D (Other sheets) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 D (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area D checklist run in full, even if it passed in an earlier cycle

### US-QA1-E: QA cycle 1: Lists, duel, hidden
**Description:** As the owner, I want area E (Lists, duel, hidden) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 E (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area E checklist run in full, even if it passed in an earlier cycle

### US-QA1-F: QA cycle 1: Settings, legal, account
**Description:** As the owner, I want area F (Settings, legal, account) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 F (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area F checklist run in full, even if it passed in an earlier cycle

### US-QA1-G: QA cycle 1: Accessibility, RTL, design system
**Description:** As the owner, I want area G (Accessibility, RTL, design system) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 G (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area G checklist run in full, even if it passed in an earlier cycle

### US-QA1-H: QA cycle 1: Motion and gestures
**Description:** As the owner, I want area H (Motion and gestures) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 H (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area H checklist run in full, even if it passed in an earlier cycle

### US-QA1-I: QA cycle 1: PWA, offline, performance
**Description:** As the owner, I want area I (PWA, offline, performance) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 I (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area I checklist run in full, even if it passed in an earlier cycle

### US-QA1-J: QA cycle 1: Analytics and privacy
**Description:** As the owner, I want area J (Analytics and privacy) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 J (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area J checklist run in full, even if it passed in an earlier cycle

### US-FIX1: Fix the bugs from QA cycle 1
**Description:** As the owner, I want every open bug from cycle 1 fixed and verified, or the loop to stop when QA is clean.

**Acceptance criteria:**
- [ ] If cycle 1 filed zero `open` bugs: mark every remaining `US-QA*` and `US-FIX*` story `passes: true` with notes 'skipped: QA clean after cycle 1', no commit, and let US-FINAL run
- [ ] Otherwise: fix every `open` bug, verify each fix in the browser it failed in (screenshot), set `status: fixed` with a fix note and the cycle
- [ ] A bug that can't be fixed without breaking a PRD §3.1 guardrail is set `wontfix-owner` with the reason and added to `owner-decisions.md`
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `fix(names): resolve the {k} bugs found in second polish QA cycle 1`

### US-QA2-A: QA cycle 2: Entry screens
**Description:** As the owner, I want area A (Entry screens) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 A (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area A checklist run in full, even if it passed in an earlier cycle

### US-QA2-B: QA cycle 2: Swipe screen and card
**Description:** As the owner, I want area B (Swipe screen and card) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 B (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area B checklist run in full, even if it passed in an earlier cycle

### US-QA2-C: QA cycle 2: Detail sheet
**Description:** As the owner, I want area C (Detail sheet) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 C (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area C checklist run in full, even if it passed in an earlier cycle

### US-QA2-D: QA cycle 2: Other sheets
**Description:** As the owner, I want area D (Other sheets) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 D (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area D checklist run in full, even if it passed in an earlier cycle

### US-QA2-E: QA cycle 2: Lists, duel, hidden
**Description:** As the owner, I want area E (Lists, duel, hidden) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 E (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area E checklist run in full, even if it passed in an earlier cycle

### US-QA2-F: QA cycle 2: Settings, legal, account
**Description:** As the owner, I want area F (Settings, legal, account) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 F (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area F checklist run in full, even if it passed in an earlier cycle

### US-QA2-G: QA cycle 2: Accessibility, RTL, design system
**Description:** As the owner, I want area G (Accessibility, RTL, design system) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 G (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area G checklist run in full, even if it passed in an earlier cycle

### US-QA2-H: QA cycle 2: Motion and gestures
**Description:** As the owner, I want area H (Motion and gestures) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 H (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area H checklist run in full, even if it passed in an earlier cycle

### US-QA2-I: QA cycle 2: PWA, offline, performance
**Description:** As the owner, I want area I (PWA, offline, performance) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 I (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area I checklist run in full, even if it passed in an earlier cycle

### US-QA2-J: QA cycle 2: Analytics and privacy
**Description:** As the owner, I want area J (Analytics and privacy) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 J (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area J checklist run in full, even if it passed in an earlier cycle

### US-FIX2: Fix the bugs from QA cycle 2
**Description:** As the owner, I want every open bug from cycle 2 fixed and verified, or the loop to stop when QA is clean.

**Acceptance criteria:**
- [ ] If cycle 2 filed zero `open` bugs: mark every remaining `US-QA*` and `US-FIX*` story `passes: true` with notes 'skipped: QA clean after cycle 2', no commit, and let US-FINAL run
- [ ] Otherwise: fix every `open` bug, verify each fix in the browser it failed in (screenshot), set `status: fixed` with a fix note and the cycle
- [ ] A bug that can't be fixed without breaking a PRD §3.1 guardrail is set `wontfix-owner` with the reason and added to `owner-decisions.md`
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `fix(names): resolve the {k} bugs found in second polish QA cycle 2`

### US-QA3-A: QA cycle 3: Entry screens
**Description:** As the owner, I want area A (Entry screens) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 A (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area A checklist run in full, even if it passed in an earlier cycle

### US-QA3-B: QA cycle 3: Swipe screen and card
**Description:** As the owner, I want area B (Swipe screen and card) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 B (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area B checklist run in full, even if it passed in an earlier cycle

### US-QA3-C: QA cycle 3: Detail sheet
**Description:** As the owner, I want area C (Detail sheet) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 C (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area C checklist run in full, even if it passed in an earlier cycle

### US-QA3-D: QA cycle 3: Other sheets
**Description:** As the owner, I want area D (Other sheets) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 D (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area D checklist run in full, even if it passed in an earlier cycle

### US-QA3-E: QA cycle 3: Lists, duel, hidden
**Description:** As the owner, I want area E (Lists, duel, hidden) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 E (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area E checklist run in full, even if it passed in an earlier cycle

### US-QA3-F: QA cycle 3: Settings, legal, account
**Description:** As the owner, I want area F (Settings, legal, account) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 F (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area F checklist run in full, even if it passed in an earlier cycle

### US-QA3-G: QA cycle 3: Accessibility, RTL, design system
**Description:** As the owner, I want area G (Accessibility, RTL, design system) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 G (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area G checklist run in full, even if it passed in an earlier cycle

### US-QA3-H: QA cycle 3: Motion and gestures
**Description:** As the owner, I want area H (Motion and gestures) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 H (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area H checklist run in full, even if it passed in an earlier cycle

### US-QA3-I: QA cycle 3: PWA, offline, performance
**Description:** As the owner, I want area I (PWA, offline, performance) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 I (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area I checklist run in full, even if it passed in an earlier cycle

### US-QA3-J: QA cycle 3: Analytics and privacy
**Description:** As the owner, I want area J (Analytics and privacy) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'verify' column, then runs every item of PRD §11.2 J (with the changes in `tasks/prd-name-polish-2.md` §6), in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish-2/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP2-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area J checklist run in full, even if it passed in an earlier cycle

### US-FIX3: Fix the bugs from QA cycle 3
**Description:** As the owner, I want every open bug from cycle 3 fixed and verified, or the loop to stop when QA is clean.

**Acceptance criteria:**
- [ ] If cycle 3 filed zero `open` bugs: mark every remaining `US-QA*` and `US-FIX*` story `passes: true` with notes 'skipped: QA clean after cycle 3', no commit, and let US-FINAL run
- [ ] Otherwise: fix every `open` bug, verify each fix in the browser it failed in (screenshot), set `status: fixed` with a fix note and the cycle
- [ ] A bug that can't be fixed without breaking a PRD §3.1 guardrail is set `wontfix-owner` with the reason and added to `owner-decisions.md`
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `fix(names): resolve the {k} bugs found in second polish QA cycle 3`
- [ ] This is the last fix pass: anything still broken stays `open`

### US-FINAL: Summary and push
**Description:** As the owner, I want an honest summary and the branch pushed, so I can review and open a PR.

**Acceptance criteria:**
- [ ] Re-checks every bug fixed in the last cycle that ran, in its browser
- [ ] `scripts/ralph/qa/name-polish-2/SUMMARY.md`: stories done; items done and dropped (counts and list, with each drop's reason); new owner decisions with their one-line recommendations; the scores per group against the first run's; 'clean after cycle N' or 'stopped after 3 cycles, {k} bugs open for the owner's review' with the list; performance before and after; checks that were blocked; never rounds up
- [ ] Notes that `shots/` is gitignored and lists the before/after screenshot folders on this Mac
- [ ] Committed once: `docs(names): second polish run summary`; `git push -u origin ralph/name-polish-2` (never main)
