# PRD: Design polish run for the name swiper, using every available design skill

Status: ready for a Ralph run. Owner: Kiril. Written 2026-11-07, after the name detail run (`ralph/name-detail`, ken PR #17) finished clean.

Stories: `scripts/ralph/prd-name-polish.json` (installed as `scripts/ralph/prd.json` by `scripts/ralph/run-name-polish.sh`). Branch: `ralph/name-polish`, which starts from the commit that added this PRD (it sits on top of `ralph/name-detail`).

## 1. Introduction

The name swiper at `nestjourney.app/names` is built and QA-clean: sign-in, onboarding, the swipe deck, the name detail sheet, lists, duel, matches, invite and join, settings, about and legal pages. Each run so far built features and then fixed bugs. Nobody has yet gone over the whole app only to make it feel finished: consistent spacing and type, clear states, calm motion, sharp Hebrew copy, strong accessibility, and the small details that make a web app feel native on a phone.

This run does that. It is a **polish run, not a redesign**. It audits every screen through the design skills committed in `.claude/skills/` (§5), merges the findings into one ranked backlog, fixes the backlog one small item at a time, re-scores the screens, and then runs the usual three QA cycles in real mobile browsers.

## 2. Goals

- Every screen and state of `/names` is audited through every skill lens in §5, with findings written down and backed by a rule from the skill that found them.
- One deduplicated, ranked backlog. Up to 50 items fixed in this run, each one small, verified in three mobile browsers with before and after screenshots, and committed on its own.
- The heuristic score of every screen group (impeccable `critique`) goes up from the baseline, and no screen scores lower.
- Accessibility: zero serious or critical axe issues on every screen and sheet, and every text style at ≥ 4.5:1 contrast on every background.
- Nothing that worked before breaks (full regression QA), the first-load JS of `/names` grows by at most 3 KB gzipped, and no dependency is added.
- Items that need the owner's call are collected in one file, not acted on.

## 3. Decisions

### 3.1 Guardrails (don't break these)

1. **Refine, don't redesign.** Keep the Nest brand and the look the owner approved: the palette and type in `docs/names-pwa/brand/tokens.json`, the logo and wordmark, the Heebo type family, the liquid-glass panels, the photo backgrounds and the layouts of boards 1–15. In impeccable's words: "Refinement preserves; redesign replaces." This run only refines.
2. **Token values are the owner's.** Changing the value of an existing color, font, type size or radius token is an owner item (§3.2). Adding a new token (a motion duration, an easing, a spacing step, a shadow) is allowed when a fix needs it: add it to `tokens.json`, run `npm run tokens:css`, never inline a value.
3. **Every earlier owner decision stays.** Read §3 of `tasks/prd-names-pwa.md` and `tasks/prd-name-detail.md`, and the launch pack notes in `tasks/prd-name-detail.md` §3.3. Among them: no due date anywhere; a partner's non-mutual votes are never shown; matches are never green and never get confetti; the deck order, filters and matching rules don't change; the card never scrolls on a 390 × 844 phone.
4. **No new features.** No new screens, flows, settings, data, analytics events, backend calls or content. A missing empty, loading or error state for something that already exists is polish and is allowed.
5. **Copy.** Fixing grammar, clarity, consistency, gender-neutral wording and explicit action labels is allowed. Not allowed: changing the meaning of a message, the privacy policy or terms text (`/names/privacy`, `/names/terms`), the name content (intros, stories, verses, people), or inventing facts. No exclamation marks.
6. **Motion** is calm and short (≤ 300 ms for UI, springs allowed for gestures), every animation has a `prefers-reduced-motion` version, and nothing animates layout properties that cause layout shift. No confetti, no bounce on errors.
7. **No dependencies.** Skills may suggest libraries (motion, sonner, Radix…): don't add them. Use CSS and the code that exists.
8. **Performance budget:** `/names` first-load JS ≤ +3 KB gzipped against the start of the run (measured in US-004), CLS stays 0 on the swipe screen, the detail sheet still opens in < 150 ms.
9. **Scope:** only `/names` (routes `src/app/names/`, UI `src/components/names/`, logic `src/lib/names/`, `src/styles/nest-tokens.css`, `docs/names-pwa/`). The landing page and the rest of the repo stay as they are.

### 3.2 What goes to the owner

A finding goes to `scripts/ralph/qa/name-polish/owner-decisions.md` (with the evidence and a recommendation) and is **not** acted on when it would: change an existing token value, a logo, a font, a photo or a board layout; change a §3.1 decision or an earlier owner decision; add a feature, setting, screen or event; change legal text or name content; need a backend, Supabase or Vercel change (e.g. ND-UX-008, `names_leave`); or take more than one iteration even after splitting.

### 3.3 Decisions made for this run

1. **Skills are files in the repo.** The skills live in `.claude/skills/` (§5). Claude Code may load them by itself, but stories always name the skill and the files to read, so the run works either way. Read the skill's `SKILL.md` and only the reference files the story names (or that the SKILL.md routes the task to), not the whole folder.
2. **Skills that ask questions.** Ralph can't ask the owner. When a skill says to ask the user, show a menu or wait for a choice, take the documented default (or the most conservative option), write the assumption in the findings file, and go on.
3. **Skill steps that need a service** (Figma, PluginOS, Superdesign, an MCP server, a claude.ai canvas) are skipped and noted. impeccable's launcher (`.claude/skills/impeccable/scripts/impeccable context`) downloads a small binary on first run; if it fails, follow the skill's "Launcher unavailable" path.
4. **Product and design context files.** US-003 writes `PRODUCT.md` and `DESIGN.md` at the repo root for impeccable (and any skill that looks for a DESIGN.md), scoped to the name swiper, built only from what's already decided: `docs/names-pwa/brand/BRAND.md`, `tokens.json`, `docs/names-pwa/README.md`, the boards and the two earlier PRDs. They describe, they don't decide. The landing page is listed as out of scope in both.
5. **impeccable mode** for every `/names` screen is **Operate** (the visitor completes a task), except the welcome screen, which is **Persuade** within the existing look.
6. **Audits never change code.** Audit stories only write findings. Triage stories only write the backlog. Polish stories change code, one backlog item each (or up to three `XS` items in the same component).
7. **Before and after.** Every polish story saves a before and an after screenshot of the item in each browser it touches and adds a row to `polish-log.md`.
8. **Ranking.** Backlog order: severity first (P1 before P2 before P3), then the number of lenses that found it, then smaller effort first. Items in the same component are grouped next to each other to avoid churn.
9. **Earlier UX ideas.** The ideas in `scripts/ralph/qa/names-pwa/ux-insights.md` and `scripts/ralph/qa/name-detail/ux-insights.md` are inputs to triage. Each becomes a backlog item only if it is pure polish under §3.1; otherwise it goes to `owner-decisions.md` with its old ID.

## 4. Before the run (owner)

Nothing new is needed. The run uses what the detail run used: `~/Ken-names`, `.env.local`, `scripts/ralph/.env.test.local` with the QA users, Playwright WebKit and Chromium, Xcode with an iOS Simulator, and `cliclick`. To start (one command, safe to re-run):

```
cd ~/Ken-names && git fetch origin && (git switch ralph/name-polish 2>/dev/null || git switch -c ralph/name-polish origin/claude/project-thread-79v2l8) && ./scripts/ralph/run-name-polish.sh
```

To resume later: `cd ~/Ken-names && ./scripts/ralph/run-name-polish.sh`.

After the run: read `scripts/ralph/qa/name-polish/SUMMARY.md` (scores before and after, what changed, open bugs) and `owner-decisions.md`, then open a PR from `ralph/name-polish`.

## 5. Design skills (read the ones each story names)

All skills are in `.claude/skills/<name>/`. Paths written `${CLAUDE_PLUGIN_ROOT}/…` in older copies were rewritten to `.claude/skills/…`. `.claude/skills/shared/` holds the data and knowledge files used by `design`, `design-review` and `creative`; it's not a skill on its own.

| Lens (story prefix) | Skills | What it looks for |
|---|---|---|
| `IMP-C` critique | `impeccable` → `reference/critique.md` | Heuristic UX review with scores per screen (the baseline and the final re-score use this) |
| `IMP-A` technical audit | `impeccable` → `reference/audit.md`, `reference/craft-floor.md`, `reference/polish.md` | Craft floor, a11y, responsive, performance, states, the "polish" checklist |
| `PRO` checklist | `ui-ux-pro-max` (`SKILL.md`, `references/`, `scripts/search.py` with `python3`) | Typography, color, spacing, touch, states, mobile UX rules and its pre-delivery checklist |
| `CRIT` critique | `design-critique` (with its `references/`), `design-critique-quick` | Hierarchy, clarity, consistency, visual weight, a second critique method |
| `ELEV` visual quality | `design-review`, `design-elevation`, `frontend-design`, `product-taste`, `creative` (only its visual-quality and typography knowledge files) | Visual craft and finish within the existing look, what separates "fine" from "finished" |
| `A11Y` accessibility | `accessibility-audit`, `accessibility-review` | WCAG 2.2 AA, Hebrew screen reader text, focus, targets, contrast on glass and photos |
| `INT` interaction | `interaction-design`, `apple-design`, `emil-design-eng` | Gestures, sheets, feedback, pressed and disabled states, timing, interruptible motion |
| `COPY` microcopy | `ux-writing`, `ux-copy` | Hebrew labels, errors, empty states, buttons, toasts, consistency of terms |
| `BREAK` worst case | `break-ui` | Long names, long surnames, long display names, zero and huge counts, empty lists, slow and failed loads |
| `NATIVE` feels native | `mobile-native` | Tap highlight, hover on touch, 100vh, input zoom, overscroll, safe areas, PWA standalone details |
| `DS` system consistency | `design-systems`, `design-system`, `design` | Token and component use across all code: one-offs, near-duplicates, missing variants |
| `MOT` motion | `find-animation-opportunities`, `review-animations`, `animation-performance`, `animation-vocabulary`, `improve-animations`, `remove-animations`, `animate` | Where motion helps or hurts, timing and easing, performance, reduced motion |
| `JRN` journeys | `journey-mapping`, `ux-strategy` | Friction across flows, not screens: first run to first save, invite to first match, return visit to "בחרנו שם" |

**Not used, and why:** `design-drift` (it locks one of 121 public brands, and Nest isn't one), `superdesign` (needs its online canvas and a login), `ds-make` / `ds-manage` / `ds-producer` / `ds-consumer` / `figma-setup` (Figma and enterprise design-system workflows), `map-design` (maps), `expo-design-system` / `expo-native-ui` / `expo-animation` / `animate-expo` / `write-swift` (React Native and Swift; this is a Next.js web app), `ux-research` / `user-research` / `research-synthesis` (need real users), `design-ops` / `design-handoff` (team process), `prototype` / `pick-ui-library` / `ask-sonner` (manual-only or add libraries, §3.1.7).

## 6. Screens and groups

Audit stories take one **group** at a time. Every screen in the group is opened in WebKit iPhone 15 at 390 × 844 and the states listed are checked.

**Group 1, Entry** (`G1`): `/names/welcome`, `/names/sign-in/email` (email step, code step, wrong code, resend timer), `/names/auth/callback` (loading, error), `/names/onboarding`, `/names/intro` (incl. the surname step), `/names/join/[code]` (valid, expired, closed), `/names/invite`, `/names/offline`, `/names/goodbye`, the 404 page `/names/[...missing]`, and the unconfigured notice.

**Group 2, Deck** (`G2`): `/names` swipe screen (card, peeking cards, action bar, position line, status footer, undo, deck end, empty filter result, session pause, survey prompt), the name detail sheet (both heights, a similar name, the surname line, the together badge, offline details), and the sheets that open over the deck: filters, background (none, three photos, own photo), match, decision ("בחרנו שם"), survey, about and report, and toasts.

**Group 3, Lists and settings** (`G3`): `/names/lists` (saved, matches incl. the solo empty state and the chosen banner, duel, row menu), `/names/hidden`, `/names/settings` (incl. leaving a shared choice and deleting the account, display only), `/names/about`, `/names/privacy`, `/names/terms`.

Use the backgrounds fabric and "ללא רקע" for every screen, and all four backgrounds plus an own photo for the card and the detail sheet.

## 7. Records

All in `scripts/ralph/qa/name-polish/` (`shots/` and `.auth/` gitignored):

- `findings/<LENS>-<group>.md` (e.g. `findings/A11Y-G2.md`): one entry per finding, IDs `<LENS>-<group>-NN`. Fields: screen and state, browser, what's wrong, the skill rule it breaks (skill name + file + the rule's words, short), severity (`P1` broken, inaccessible or clearly off-brand; `P2` noticeable; `P3` refinement), effort (`XS` < 15 min, `S` < 45 min, `M` one iteration, `L` more), proposed change (files, component, token), guardrail (`polish` or `owner` with the §3.2 reason), screenshot path. A file with no findings says so and lists what was checked.
- `scores.md`: impeccable critique scores per screen and heuristic. The baseline table (from the `IMP-C` audits) and the after table (from US-R1…R3).
- `backlog.md`: written by triage. One table, ordered (§3.3.8), IDs `NP-001` on. Columns: id, title, group, screen, severity, effort, lenses (finding IDs it merges), files, the change in one line, how to verify, slot (`US-P01`…), status (`todo`, `done`, `next-run`, `dropped` with reason).
- `owner-decisions.md`: items for the owner (§3.2), IDs `OD-001` on, each with evidence, options and a recommendation.
- `polish-log.md`: one row per polish story: slot, backlog IDs, commit, files, before and after screenshot paths per browser, notes.
- `bugs.md` (IDs `NP-BUG-001` on), `ux-insights.md` (IDs `NP-UX-001` on), `SUMMARY.md`: as in the detail run (`tasks/prd-name-detail.md` §11.1).

## 8. Rules for every story

These hold for every story and are not repeated in each story's criteria.

- **Read first:** this PRD's §3, the skill files the story names (§5), `docs/names-pwa/README.md` ("Code layout", "Design tokens"), `docs/names-pwa/brand/BRAND.md`, `PRODUCT.md` and `DESIGN.md` (once US-003 wrote them), and the files the story touches. Next.js 16 and libraries have changed: read `node_modules/next/dist/docs/` or https://nextjs.org/docs before using a Next API.
- **Design tokens only, RTL-first:** colors, type, radii, glass and spacing from `src/styles/nest-tokens.css` and its Tailwind names (`tasks/prd-name-detail.md` §5 lists them). No hex, rgb or px font size in names code; `tests/names/designGuard.test.ts` enforces it, keep it green. Logical properties only (`ms-/me-/ps-/pe-/start-/end-`), mirror only directional icons, numbers and years in `<bdi dir="ltr">`.
- **Reuse components:** `src/components/names/ui/` (`BottomSheet`, `Button`, `IconButton`, `Chip`, `Glass`, `ToastRegion`, `layers`), `DecisionButtons`, `card/`, `swipe/`, `detail/`. Fix a pattern in the shared component, not in each screen.
- **Accessibility (WCAG 2.2 AA):** targets ≥ 44 × 44 px, a Hebrew `aria-label` on every icon-only control, visible focus, status never by color alone, contrast ≥ 4.5:1 on glass and every background photo, dialogs keep their semantics.
- **Copy:** gender-neutral Hebrew, explicit action labels, no exclamation marks, no medical advice, no invented facts (§3.1.5).
- **Privacy:** never send a name, surname, vote, display name or email to analytics or logs. Surname and photos never leave the device.
- **Checks:** every story that changes code ends with `npm run lint` (0 errors), `npx tsc --noEmit`, `npm test` and `npm run build` green.
- **Dependencies:** none (§3.1.7). Install with `npm ci`, never a bare `npm install` (it breaks the lockfile for Vercel).
- **Commits:** setup stories commit as their criteria say; audit and triage stories commit only the records (`docs(names): …`); polish stories commit once each (`polish(names): NP-0xx …`); QA stories never commit and never fix; FIX stories commit once per cycle. Never `git stash`, `git clean`, `git checkout .` or `git reset --hard`.
- **Never** change Supabase or Vercel settings, apply SQL, push to `main` or deploy. Push only `ralph/name-polish`.
- **Secrets:** `.env.local` and `scripts/ralph/.env.test.local` are gitignored; never print, log or commit their values, codes or tokens.

## 9. Story order

1. Gate, helpers, skills check, context files, performance baseline, baseline screenshots (US-000…US-007).
2. Audits: 32 stories, each one lens on one group (or on the whole app for `NATIVE`, `DS` and `JRN`). Order: `IMP-C` first (it sets the baseline scores), then `IMP-A`, `PRO`, `CRIT`, `ELEV`, `A11Y`, `INT`, `COPY`, `BREAK`, `MOT`, `NATIVE`, `DS`, `JRN`.
3. Triage (US-T1, US-T2): merge, dedupe, rank, split, pick up to 50 items, write `owner-decisions.md`.
4. Polish: US-P01…US-P50, one backlog item each.
5. Re-review per group (US-R1…R3), docs (US-D1), self-audit (US-SA).
6. QA: US-QA0, then cycles 1–3 (10 areas each) with US-FIX1–3, then US-FINAL.

## 10. Mobile browser check (every UI story)

Reuse the helpers from the detail run, don't rebuild them: `scripts/ralph/qa/name-detail/mobile.mjs` (Playwright WebKit as an iPhone 15 and Chromium as a Pixel 7, both with touch, `he-IL`, signed-in QA user) and `scripts/ralph/qa/name-detail/sim.mjs` (Mobile Safari in the iOS Simulator with `xcrun simctl` and `cliclick`). Read `scripts/ralph/qa/name-detail/SIMULATOR.md` before the first Simulator step. US-001 adds a shots-folder option so this run's screenshots go to `scripts/ralph/qa/name-polish/shots/`.

1. Dev server on port 3000 (`curl -s -o /dev/null -w '%{http_code}' localhost:3000/names/welcome`; start `nohup npm run dev > /tmp/names-dev.log 2>&1 &` if it doesn't answer). Service worker, performance and QA stories use a production build on port 3100.
2. Check in all three: WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari. Audit stories use WebKit iPhone 15 for every screen and add the other two for anything that depends on the browser (gestures, safe areas, inputs, scrolling, the keyboard).
3. Save screenshots, **read each PNG**, compare with the board PNG and its `.dc.html` (`docs/names-pwa/design/`) and the tokens. Fix and repeat until it matches; not "close enough".
4. Also check 375 × 667 and 320 px width for layout changes, and desktop 1280 × 800 in Chromium for sheets.

If a browser or the Simulator can't run, write it at the top of `progress.txt` as a blocker; never skip the check.

## 11. QA

### 11.1 The loop (3 cycles, hard cap)

As in the detail run (`tasks/prd-name-detail.md` §11.3), with this run's records (§7) and 10 areas:

1. **US-QA0** (once): production build on port 3100, QA users 1–3 signed in over REST, their votes reset, users 1 and 2 share one space, user 3 solo, Simulator Safari signed in as user 1, all three browsers verified.
2. **Cycle N:** `US-QA{N}-A` … `US-QA{N}-J`, each area in full every cycle.
3. **US-FIX{N}:** zero `open` bugs → mark every remaining QA and FIX story `passes: true` with `skipped: QA clean after cycle N`. Otherwise fix every open bug, verify it in the browser it failed in, one commit `fix(names): resolve the {k} bugs found in polish QA cycle {N}`.
4. **US-FIX3 is the last fix pass.** No cycle 4; what it can't fix stays `open`.
5. **US-FINAL** reports the true state and never rounds up.

What counts as a bug: everything in `tasks/prd-name-detail.md` §11.2, plus a polish item marked `done` that doesn't look or behave as its backlog row says, a screen that scores lower than its baseline, and anything that breaks a §3.1 guardrail.

### 11.2 Checklists

"All three" = WebKit iPhone, Chromium Pixel, Simulator Safari. In every area, first check each `done` backlog item of that area against its "how to verify" column, then the regression list.

**A: Entry screens (all three):** welcome, email sign-in with one real send to a Resend test address per cycle, wrong code, resend timer, sign out, onboarding for a reset user, intro and surname, join (valid, expired, closed), invite, offline, goodbye, 404. No due date anywhere. Regression detail: `tasks/prd-names-pwa.md` §11.4 A and B.

**B: Swipe screen and card (all three):** swipes (keep, skip, love, short snap-back), buttons, keyboard, undo (10), hide via long-press "דילוג", peeking cards, position line, status footer, deck end, empty filter result, session pause and survey prompt, tap opens the detail sheet, the card never scrolls at 390 × 844 and 375 × 667 (5 longest cards from the detail run's Codebase Patterns), every background incl. own photo.

**C: Detail sheet (all three):** `tasks/prd-name-detail.md` §11.4 B, D, E, H in full, plus F (surname) and G (together) light.

**D: Other sheets (all three):** filters (themes, letter range, origins), background picker, match sheet once per match, decision ("בחרנו שם") and recap, survey never over another sheet, about and report, toasts. One layer at a time; Back closes each.

**E: Lists, duel, hidden (all three):** saved and matches tabs, solo empty state, chosen banner, row menu actions, opening a name's sheet from a row and changing the vote, duel, hidden list and unhide. Regression detail: `tasks/prd-names-pwa.md` §11.4 G, H, I.

**F: Settings, legal, account (WebKit + Chromium):** settings (display name, surname, background, leave a shared choice: the error copy from ND-UX-008 is expected and not a bug), about, privacy, terms, account deletion only on a throwaway user from the admin API.

**G: Accessibility, RTL, design system (WebKit + desktop Chromium):** axe on every screen and every sheet (no serious or critical issues); keyboard order, focus traps and return; 200% zoom and 320 px with no horizontal scroll; contrast ≥ 4.5:1 for every text style on each background; code check of every file changed in this run (no hex, rgb, px font sizes, physical left/right, unlabeled icon buttons, green); `designGuard` green.

**H: Motion and gestures (all three):** every animation added or changed in this run (list them from `polish-log.md`) at normal speed and with reduced motion (fade or none); no layout shift; gestures still feel the same as before (compare with baseline notes); nothing animates on a toast or error that shouldn't.

**I: PWA, offline, performance (production build 3100, Chromium Pixel + Simulator):** offline deck and detail sheet, votes queue and flush, "עדכון זמין" flow, `/names` first-load JS within the +3 KB budget against US-004 (record both), CLS 0, detail sheet open < 150 ms.

**J: Analytics and privacy (Chromium, network log):** the events in `docs/names-pwa/ANALYTICS.md` still fire as documented, no new event, no name, surname, vote or display name in any analytics or Clarity request, Clarity still masks the app.

## 12. Non-goals

- A redesign, a new visual direction, new brand assets or new photos.
- New features, screens, settings, events or content; the landing page; the native app.
- Any backend, Supabase, Vercel or auth change.
- Acting on owner items (§3.2).

## 13. Success

- All stories pass; QA clean or bugs listed honestly in `SUMMARY.md`.
- Every group's critique score is higher than its baseline and no screen is lower; zero serious or critical axe issues; the performance budget holds.
- `owner-decisions.md` gives the owner a short, clear list to decide.

## 14. User stories

The full stories with every acceptance criterion are generated below from the same source as `scripts/ralph/prd-name-polish.json`. The JSON is what Ralph runs; if the two ever differ, the JSON wins.

### US-000: Gate: branch, browsers, Simulator, QA users and skills folder
**Description:** As the run, I need every tool working before any other story, so nothing is marked done without a real mobile check.

**Acceptance criteria:**
- [ ] On branch `ralph/name-polish`; `git log --oneline -1` and `git merge-base --is-ancestor 5a400a4 HEAD` (the detail run is included) recorded in `progress.txt`; record whether ken PR #17 is merged into `origin/main`
- [ ] `npm ci` done; `npx playwright install chromium webkit` done or already installed; `node scripts/ralph/qa/name-detail/mobile.mjs webkit /names/welcome gate-webkit` and the same for chromium save screenshots that you read
- [ ] `xcrun simctl list devices available` shows an iPhone with a home indicator; it boots, `open -a Simulator` shows it, `xcrun simctl openurl booted http://localhost:3000/names/welcome` loads in Mobile Safari with `npm run dev` running; a screenshot shows the welcome page; one `cliclick` tap is shown to land
- [ ] `scripts/ralph/.env.test.local` has `NAMES_QA_EMAIL_1`..`3`; `node scripts/ralph/qa/names-pwa/login.mjs 1` and `2` succeed (key names only in logs, never values)
- [ ] `.claude/skills/` exists with the 30 skills listed in PRD §5 (each has a `SKILL.md`) plus `shared/`; the list is written under Codebase Patterns in `progress.txt`
- [ ] If any item fails: write the missing prerequisite at the top of `progress.txt` under `## BLOCKED`, leave `passes: false`, and stop without starting other stories
- [ ] No commit in this story

### US-001: Polish run records and shots folder for the helpers
**Description:** As the audits and QA, I need this run's record files and a screenshots folder, reusing the detail run's mobile helpers.

**Acceptance criteria:**
- [ ] `scripts/ralph/qa/name-detail/mobile.mjs` and `sim.mjs` take an optional shots folder (an option or `QA_SHOTS_DIR` env), defaulting to their current folder so the detail run's scripts still work
- [ ] Creates `scripts/ralph/qa/name-polish/` with `findings/`, `scores.md`, `backlog.md`, `owner-decisions.md`, `polish-log.md`, `bugs.md`, `ux-insights.md`, each with the headers and fields from PRD §7
- [ ] Adds `scripts/ralph/qa/name-polish/shots/` and `scripts/ralph/qa/name-polish/.auth/` to `.gitignore`
- [ ] Self-test: `QA_SHOTS_DIR=scripts/ralph/qa/name-polish/shots node scripts/ralph/qa/name-detail/mobile.mjs webkit /names us001` writes into the new folder
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `chore(names): records for the polish run`

### US-002: Skills smoke test
**Description:** As the audits, I need to know each skill can be read and its tools run here, so audit stories don't stall on a broken skill.

**Acceptance criteria:**
- [ ] Reads the `SKILL.md` of every skill in PRD §5 (front matter and the first section only) and writes a table in `progress.txt` Codebase Patterns: skill, what it needs (files, scripts, services), any step this run must skip (§3.3.3)
- [ ] Runs `.claude/skills/impeccable/scripts/impeccable context --target src/app/names` from the repo root; writes whether it worked, and if not, that the 'Launcher unavailable' path will be used
- [ ] Runs `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "mobile swipe app hebrew rtl" --domain ux` (or the closest documented domain) and writes whether it worked
- [ ] Confirms every `.claude/skills/...` path quoted inside `design`, `design-review` and `creative` resolves to a file (`shared/…`); writes any that don't
- [ ] No code change; no commit

### US-003: PRODUCT.md and DESIGN.md for the name swiper
**Description:** As every design skill, I need the product and design context written down once, so audits judge the app against what was decided and not against generic taste.

**Acceptance criteria:**
- [ ] Follows impeccable `reference/init.md` (PRODUCT.md) and `reference/document.md` (DESIGN.md) without asking questions (§3.3.2), from `docs/names-pwa/brand/BRAND.md`, `docs/names-pwa/brand/tokens.json`, `src/styles/nest-tokens.css`, `docs/names-pwa/README.md`, the boards and `tasks/prd-names-pwa.md` §3 and `tasks/prd-name-detail.md` §3
- [ ] `PRODUCT.md` (repo root): who it's for (gender-neutral, whoever manages the pregnancy, solo or shared), what a visit is for, the modes from §3.3.5, the owner decisions as constraints, Hebrew-only and RTL, privacy rules; the landing page marked out of scope
- [ ] `DESIGN.md` (repo root): tokens by name with their roles, type scale, glass panels, backgrounds, components in `src/components/names/ui/` and when to use each, motion as it is today, accessibility rules; it describes what exists and decides nothing new
- [ ] Every value in DESIGN.md is a token name or quoted from tokens.json; no new value
- [ ] Committed once: `docs(names): product and design context for the polish run`

### US-004: Performance baseline
**Description:** As the budget in §3.1.8, I need the starting numbers measured on the production build.

**Acceptance criteria:**
- [ ] `npm run build`; record the first-load JS of `/names`, `/names/lists`, `/names/welcome` (gzipped, the same method as the detail run's `shots/us072-size.mjs` if it exists, else from the build output) in `scores.md` under 'Baseline performance'
- [ ] On the production build (port 3100), Chromium Pixel 7: CLS during 5 swipes, and tap to sheet visible for 3 opens, recorded the same way
- [ ] No code change; commits only the records: `docs(names): performance baseline for the polish run`

### US-005: Baseline screenshots: Entry
**Description:** As the before-and-after comparison, I need screenshots of entry as it is before any polish.

**Acceptance criteria:**
- [ ] Screenshots of every screen and state of group 1 (PRD §6) in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari, saved to `scripts/ralph/qa/name-polish/shots/baseline/G1/` (gitignored), named `<screen>-<state>-<browser>.png`
- [ ] Also 375 × 667 and 320 px width in WebKit for each screen of G1
- [ ] An inventory in `scores.md` under 'Screens G1': each screen and state with its screenshot names, so audits and QA use the same list
- [ ] No code change; commits only `scores.md`: `docs(names): baseline inventory G1`

### US-006: Baseline screenshots: Deck
**Description:** As the before-and-after comparison, I need screenshots of deck as it is before any polish.

**Acceptance criteria:**
- [ ] Screenshots of every screen, sheet and state of group 2 (PRD §6), the card and detail sheet on all four backgrounds plus an own photo in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari, saved to `scripts/ralph/qa/name-polish/shots/baseline/G2/` (gitignored), named `<screen>-<state>-<browser>.png`
- [ ] Also 375 × 667 and 320 px width in WebKit for each screen of G2
- [ ] An inventory in `scores.md` under 'Screens G2': each screen and state with its screenshot names, so audits and QA use the same list
- [ ] No code change; commits only `scores.md`: `docs(names): baseline inventory G2`

### US-007: Baseline screenshots: Lists and settings
**Description:** As the before-and-after comparison, I need screenshots of lists and settings as it is before any polish.

**Acceptance criteria:**
- [ ] Screenshots of every screen and state of group 3 (PRD §6) in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari, saved to `scripts/ralph/qa/name-polish/shots/baseline/G3/` (gitignored), named `<screen>-<state>-<browser>.png`
- [ ] Also 375 × 667 and 320 px width in WebKit for each screen of G3
- [ ] An inventory in `scores.md` under 'Screens G3': each screen and state with its screenshot names, so audits and QA use the same list
- [ ] No code change; commits only `scores.md`: `docs(names): baseline inventory G3`

### US-A-IMP-C-G1: Audit G1 Entry: impeccable critique
**Description:** As the owner, I want the entry screens reviewed through the impeccable critique lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `impeccable`: `SKILL.md`, `reference/critique.md`, and `reference/operate.md` (Persuade for the welcome screen: `reference/mode-persuade.md`); follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G1 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/IMP-C-G1/`
- [ ] Scores every screen with the critique heuristics and writes them as the baseline table in `scores.md` (screen × heuristic, plus the total)
- [ ] Writes `scripts/ralph/qa/name-polish/findings/IMP-C-G1.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): IMP-C audit G1`

### US-A-IMP-C-G2: Audit G2 Deck: impeccable critique
**Description:** As the owner, I want the deck screens reviewed through the impeccable critique lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `impeccable`: `SKILL.md`, `reference/critique.md`, and `reference/operate.md` (Persuade for the welcome screen: `reference/mode-persuade.md`); follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G2 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/IMP-C-G2/`
- [ ] Scores every screen with the critique heuristics and writes them as the baseline table in `scores.md` (screen × heuristic, plus the total)
- [ ] Writes `scripts/ralph/qa/name-polish/findings/IMP-C-G2.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): IMP-C audit G2`

### US-A-IMP-C-G3: Audit G3 Lists and settings: impeccable critique
**Description:** As the owner, I want the lists and settings screens reviewed through the impeccable critique lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `impeccable`: `SKILL.md`, `reference/critique.md`, and `reference/operate.md` (Persuade for the welcome screen: `reference/mode-persuade.md`); follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G3 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/IMP-C-G3/`
- [ ] Scores every screen with the critique heuristics and writes them as the baseline table in `scores.md` (screen × heuristic, plus the total)
- [ ] Writes `scripts/ralph/qa/name-polish/findings/IMP-C-G3.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): IMP-C audit G3`

### US-A-IMP-A-G1: Audit G1 Entry: impeccable technical audit
**Description:** As the owner, I want the entry screens reviewed through the impeccable technical audit lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `impeccable`: `reference/audit.md`, `reference/craft-floor.md`, `reference/polish.md`, `reference/harden.md`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G1 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/IMP-A-G1/`
- [ ] Writes `scripts/ralph/qa/name-polish/findings/IMP-A-G1.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): IMP-A audit G1`

### US-A-IMP-A-G2: Audit G2 Deck: impeccable technical audit
**Description:** As the owner, I want the deck screens reviewed through the impeccable technical audit lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `impeccable`: `reference/audit.md`, `reference/craft-floor.md`, `reference/polish.md`, `reference/harden.md`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G2 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/IMP-A-G2/`
- [ ] Writes `scripts/ralph/qa/name-polish/findings/IMP-A-G2.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): IMP-A audit G2`

### US-A-IMP-A-G3: Audit G3 Lists and settings: impeccable technical audit
**Description:** As the owner, I want the lists and settings screens reviewed through the impeccable technical audit lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `impeccable`: `reference/audit.md`, `reference/craft-floor.md`, `reference/polish.md`, `reference/harden.md`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G3 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/IMP-A-G3/`
- [ ] Writes `scripts/ralph/qa/name-polish/findings/IMP-A-G3.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): IMP-A audit G3`

### US-A-PRO-G1: Audit G1 Entry: ui-ux-pro-max checklist
**Description:** As the owner, I want the entry screens reviewed through the ui-ux-pro-max checklist lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `ui-ux-pro-max`: `SKILL.md` (its rules and pre-delivery checklist), the `references/` files it routes mobile and RTL work to, and `scripts/search.py` for the rules it cites; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G1 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/PRO-G1/`
- [ ] Writes `scripts/ralph/qa/name-polish/findings/PRO-G1.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): PRO audit G1`

### US-A-PRO-G2: Audit G2 Deck: ui-ux-pro-max checklist
**Description:** As the owner, I want the deck screens reviewed through the ui-ux-pro-max checklist lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `ui-ux-pro-max`: `SKILL.md` (its rules and pre-delivery checklist), the `references/` files it routes mobile and RTL work to, and `scripts/search.py` for the rules it cites; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G2 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/PRO-G2/`
- [ ] Writes `scripts/ralph/qa/name-polish/findings/PRO-G2.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): PRO audit G2`

### US-A-PRO-G3: Audit G3 Lists and settings: ui-ux-pro-max checklist
**Description:** As the owner, I want the lists and settings screens reviewed through the ui-ux-pro-max checklist lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `ui-ux-pro-max`: `SKILL.md` (its rules and pre-delivery checklist), the `references/` files it routes mobile and RTL work to, and `scripts/search.py` for the rules it cites; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G3 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/PRO-G3/`
- [ ] Writes `scripts/ralph/qa/name-polish/findings/PRO-G3.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): PRO audit G3`

### US-A-CRIT-G1: Audit G1 Entry: design critique
**Description:** As the owner, I want the entry screens reviewed through the design critique lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `design-critique` (`SKILL.md` and its `references/`) and `design-critique-quick`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G1 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/CRIT-G1/`
- [ ] Writes `scripts/ralph/qa/name-polish/findings/CRIT-G1.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): CRIT audit G1`

### US-A-CRIT-G2: Audit G2 Deck: design critique
**Description:** As the owner, I want the deck screens reviewed through the design critique lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `design-critique` (`SKILL.md` and its `references/`) and `design-critique-quick`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G2 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/CRIT-G2/`
- [ ] Writes `scripts/ralph/qa/name-polish/findings/CRIT-G2.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): CRIT audit G2`

### US-A-CRIT-G3: Audit G3 Lists and settings: design critique
**Description:** As the owner, I want the lists and settings screens reviewed through the design critique lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `design-critique` (`SKILL.md` and its `references/`) and `design-critique-quick`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G3 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/CRIT-G3/`
- [ ] Writes `scripts/ralph/qa/name-polish/findings/CRIT-G3.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): CRIT audit G3`

### US-A-ELEV-G1: Audit G1 Entry: visual quality and elevation
**Description:** As the owner, I want the entry screens reviewed through the visual quality and elevation lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `design-review`, `design-elevation` (and its references), `frontend-design`, `product-taste`, plus `.claude/skills/shared/knowledge/visual-quality.md` and `typography.md`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G1 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/ELEV-G1/`
- [ ] Writes `scripts/ralph/qa/name-polish/findings/ELEV-G1.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): ELEV audit G1`

### US-A-ELEV-G2: Audit G2 Deck: visual quality and elevation
**Description:** As the owner, I want the deck screens reviewed through the visual quality and elevation lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `design-review`, `design-elevation` (and its references), `frontend-design`, `product-taste`, plus `.claude/skills/shared/knowledge/visual-quality.md` and `typography.md`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G2 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/ELEV-G2/`
- [ ] Writes `scripts/ralph/qa/name-polish/findings/ELEV-G2.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): ELEV audit G2`

### US-A-ELEV-G3: Audit G3 Lists and settings: visual quality and elevation
**Description:** As the owner, I want the lists and settings screens reviewed through the visual quality and elevation lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `design-review`, `design-elevation` (and its references), `frontend-design`, `product-taste`, plus `.claude/skills/shared/knowledge/visual-quality.md` and `typography.md`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G3 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/ELEV-G3/`
- [ ] Writes `scripts/ralph/qa/name-polish/findings/ELEV-G3.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): ELEV audit G3`

### US-A-A11Y-G1: Audit G1 Entry: accessibility
**Description:** As the owner, I want the entry screens reviewed through the accessibility lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `accessibility-audit` (and its references) and `accessibility-review`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G1 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/A11Y-G1/`
- [ ] Runs axe (`@axe-core/playwright` via `mobile.mjs` `axe(page)`) on every screen and sheet of the group and checks contrast of every text style on each background
- [ ] Writes `scripts/ralph/qa/name-polish/findings/A11Y-G1.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): A11Y audit G1`

### US-A-A11Y-G2: Audit G2 Deck: accessibility
**Description:** As the owner, I want the deck screens reviewed through the accessibility lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `accessibility-audit` (and its references) and `accessibility-review`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G2 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/A11Y-G2/`
- [ ] Runs axe (`@axe-core/playwright` via `mobile.mjs` `axe(page)`) on every screen and sheet of the group and checks contrast of every text style on each background
- [ ] Writes `scripts/ralph/qa/name-polish/findings/A11Y-G2.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): A11Y audit G2`

### US-A-A11Y-G3: Audit G3 Lists and settings: accessibility
**Description:** As the owner, I want the lists and settings screens reviewed through the accessibility lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `accessibility-audit` (and its references) and `accessibility-review`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G3 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/A11Y-G3/`
- [ ] Runs axe (`@axe-core/playwright` via `mobile.mjs` `axe(page)`) on every screen and sheet of the group and checks contrast of every text style on each background
- [ ] Writes `scripts/ralph/qa/name-polish/findings/A11Y-G3.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): A11Y audit G3`

### US-A-INT-G1: Audit G1 Entry: interaction
**Description:** As the owner, I want the entry screens reviewed through the interaction lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `interaction-design` (and its references), `apple-design`, `emil-design-eng`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G1 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/INT-G1/`
- [ ] Checks gestures, pressed/disabled/loading states, sheet physics and feedback in all three browsers, not only WebKit
- [ ] Writes `scripts/ralph/qa/name-polish/findings/INT-G1.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): INT audit G1`

### US-A-INT-G2: Audit G2 Deck: interaction
**Description:** As the owner, I want the deck screens reviewed through the interaction lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `interaction-design` (and its references), `apple-design`, `emil-design-eng`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G2 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/INT-G2/`
- [ ] Checks gestures, pressed/disabled/loading states, sheet physics and feedback in all three browsers, not only WebKit
- [ ] Writes `scripts/ralph/qa/name-polish/findings/INT-G2.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): INT audit G2`

### US-A-INT-G3: Audit G3 Lists and settings: interaction
**Description:** As the owner, I want the lists and settings screens reviewed through the interaction lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `interaction-design` (and its references), `apple-design`, `emil-design-eng`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G3 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/INT-G3/`
- [ ] Checks gestures, pressed/disabled/loading states, sheet physics and feedback in all three browsers, not only WebKit
- [ ] Writes `scripts/ralph/qa/name-polish/findings/INT-G3.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): INT audit G3`

### US-A-COPY-G1: Audit G1 Entry: microcopy
**Description:** As the owner, I want the entry screens reviewed through the microcopy lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `ux-writing` (and its references) and `ux-copy`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G1 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/COPY-G1/`
- [ ] Lists every visible string of the group in the findings file (from the code) and reviews each; legal text and name content are out of scope (§3.1.5)
- [ ] Writes `scripts/ralph/qa/name-polish/findings/COPY-G1.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): COPY audit G1`

### US-A-COPY-G2: Audit G2 Deck: microcopy
**Description:** As the owner, I want the deck screens reviewed through the microcopy lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `ux-writing` (and its references) and `ux-copy`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G2 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/COPY-G2/`
- [ ] Lists every visible string of the group in the findings file (from the code) and reviews each; legal text and name content are out of scope (§3.1.5)
- [ ] Writes `scripts/ralph/qa/name-polish/findings/COPY-G2.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): COPY audit G2`

### US-A-COPY-G3: Audit G3 Lists and settings: microcopy
**Description:** As the owner, I want the lists and settings screens reviewed through the microcopy lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `ux-writing` (and its references) and `ux-copy`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G3 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/COPY-G3/`
- [ ] Lists every visible string of the group in the findings file (from the code) and reviews each; legal text and name content are out of scope (§3.1.5)
- [ ] Writes `scripts/ralph/qa/name-polish/findings/COPY-G3.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): COPY audit G3`

### US-A-BREAK-G1: Audit G1 Entry: worst-case data
**Description:** As the owner, I want the entry screens reviewed through the worst-case data lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `break-ui`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G1 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/BREAK-G1/`
- [ ] Uses real worst cases, never committed to the app: the longest deck names, a 30-character surname, a long display name, 0 and 999+ saves and matches, an empty deck, slow network (Playwright throttling) and a failed request
- [ ] Writes `scripts/ralph/qa/name-polish/findings/BREAK-G1.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): BREAK audit G1`

### US-A-BREAK-G2: Audit G2 Deck: worst-case data
**Description:** As the owner, I want the deck screens reviewed through the worst-case data lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `break-ui`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G2 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/BREAK-G2/`
- [ ] Uses real worst cases, never committed to the app: the longest deck names, a 30-character surname, a long display name, 0 and 999+ saves and matches, an empty deck, slow network (Playwright throttling) and a failed request
- [ ] Writes `scripts/ralph/qa/name-polish/findings/BREAK-G2.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): BREAK audit G2`

### US-A-BREAK-G3: Audit G3 Lists and settings: worst-case data
**Description:** As the owner, I want the lists and settings screens reviewed through the worst-case data lens, so the backlog holds every real problem with a reason.

**Acceptance criteria:**
- [ ] Reads `break-ui`; follows the skill's review method on the group's screens from PRD §6 and the baseline inventory in `scores.md`
- [ ] Opens every screen and state of G3 in WebKit iPhone 15 (and the other two browsers where the PRD §10.2 says so) on the dev server; screenshots in `scripts/ralph/qa/name-polish/shots/audit/BREAK-G3/`
- [ ] Uses real worst cases, never committed to the app: the longest deck names, a 30-character surname, a long display name, 0 and 999+ saves and matches, an empty deck, slow network (Playwright throttling) and a failed request
- [ ] Writes `scripts/ralph/qa/name-polish/findings/BREAK-G3.md` with one entry per finding in the PRD §7 format (rule cited from the skill, severity, effort, proposed change, guardrail); a group with no findings says so and lists what was checked
- [ ] Findings that need the owner are marked `owner` with the §3.2 reason; nothing is fixed in this story
- [ ] No code change; commits only the findings: `docs(names): BREAK audit G3`

### US-A-MOT-G2: Audit Deck: motion
**Description:** As the owner, I want every animation in the deck, the card, the detail sheet and every sheet over the deck reviewed, and the places where motion would help found.

**Acceptance criteria:**
- [ ] Reads `find-animation-opportunities`, `review-animations`, `animation-performance`, `animation-vocabulary`, `improve-animations`, `remove-animations` and `animate` (SKILL.md each)
- [ ] Lists every animation and transition in the deck, the card, the detail sheet and every sheet over the deck from the code (file, property, duration, easing, reduced-motion behaviour) in the findings file
- [ ] Watches each at normal speed and with reduced motion in WebKit and the Simulator; records frame drops in Chromium performance traces for the sheet open, a swipe fling and a toast
- [ ] Writes `scripts/ralph/qa/name-polish/findings/MOT-G2.md` (PRD §7 format); suggestions respect §3.1.6 and §3.1.7
- [ ] No code change; commits only the findings: `docs(names): motion audit G2`

### US-A-MOT-G13: Audit Entry, lists and settings: motion
**Description:** As the owner, I want every animation in groups 1 and 3 reviewed, and the places where motion would help found.

**Acceptance criteria:**
- [ ] Reads `find-animation-opportunities`, `review-animations`, `animation-performance`, `animation-vocabulary`, `improve-animations`, `remove-animations` and `animate` (SKILL.md each)
- [ ] Lists every animation and transition in groups 1 and 3 from the code (file, property, duration, easing, reduced-motion behaviour) in the findings file
- [ ] Watches each at normal speed and with reduced motion in WebKit and the Simulator; records frame drops in Chromium performance traces for the sheet open, a swipe fling and a toast
- [ ] Writes `scripts/ralph/qa/name-polish/findings/MOT-G13.md` (PRD §7 format); suggestions respect §3.1.6 and §3.1.7
- [ ] No code change; commits only the findings: `docs(names): motion audit G13`

### US-A-NATIVE: Audit the whole app: feels native on a phone
**Description:** As the owner, I want the small web-on-phone tells found everywhere: tap flashes, sticky hover, 100vh, input zoom, overscroll, safe areas.

**Acceptance criteria:**
- [ ] Reads `mobile-native` (SKILL.md and its files)
- [ ] Checks every item of the skill on every route of PRD §6 in the Simulator and WebKit iPhone, including the installed-PWA view (Simulator: Add to Home Screen) for safe areas and status bar
- [ ] Writes `scripts/ralph/qa/name-polish/findings/NATIVE-ALL.md` (PRD §7 format)
- [ ] No code change; commits only the findings: `docs(names): native-feel audit`

### US-A-DS: Audit the whole app: design system consistency
**Description:** As the owner, I want one-off styles, near-duplicate components and missing variants found across all names code.

**Acceptance criteria:**
- [ ] Reads `design-systems` (and its references), `design-system` and `design` (with `.claude/skills/shared/maturity-detection.md`)
- [ ] Code scan of `src/components/names/**` and `src/app/names/**`: repeated class strings that should be a shared class or component, buttons or chips not built on `Button`/`Chip`, spacing values off the rhythm, type styles used outside their role in DESIGN.md, icons drawn in more than one way
- [ ] Writes `scripts/ralph/qa/name-polish/findings/DS-ALL.md` (PRD §7 format) with file and line for each
- [ ] No code change; commits only the findings: `docs(names): design system audit`

### US-A-JRN: Audit the journeys
**Description:** As the owner, I want friction found across whole flows, which screen audits miss.

**Acceptance criteria:**
- [ ] Reads `journey-mapping` (and its references) and `ux-strategy` (and its references)
- [ ] Walks three journeys end to end in the Simulator and WebKit with QA users: (1) first visit to first save (reset user 3), (2) invite a partner to the first match (users 1 and 2), (3) a return visit to 'בחרנו שם' (user 1); screenshots per step
- [ ] Writes `scripts/ralph/qa/name-polish/findings/JRN-ALL.md`: a short map per journey (steps, what the person sees, where it slows or confuses) and findings in the PRD §7 format; anything that would change a flow is `owner`
- [ ] No code change; commits only the findings: `docs(names): journey audit`

### US-T1: Triage: merge and dedupe the findings
**Description:** As the polish stories, I need one list where each problem appears once, with every lens that found it.

**Acceptance criteria:**
- [ ] Reads every file in `scripts/ralph/qa/name-polish/findings/` and the earlier ideas (`scripts/ralph/qa/names-pwa/ux-insights.md`, `scripts/ralph/qa/name-detail/ux-insights.md`, §3.3.9)
- [ ] Merges findings that describe the same problem into one item and keeps the list of finding IDs it came from; the highest severity among them wins
- [ ] Checks each item against §3.1 and §3.2 again; owner items go to `owner-decisions.md` as `OD-` entries with evidence, options and a recommendation
- [ ] Writes the merged polish items to `scripts/ralph/qa/name-polish/backlog.md` with ids `NP-001` on (not yet ordered or assigned to slots), and the totals (findings read, items, owner items) at the top
- [ ] No code change; commits only the records: `docs(names): polish triage, merge`

### US-T2: Triage: rank, split and assign slots
**Description:** As the polish stories, I need the backlog ordered and every item small enough for one iteration.

**Acceptance criteria:**
- [ ] Splits every `L` item into `S`/`M` items (or moves it to `owner-decisions.md` if it can't be split); every remaining item has files, a one-line change and a 'how to verify'
- [ ] Orders the backlog by §3.3.8; groups items in the same component next to each other
- [ ] Assigns the first 50 items to slots `US-P01`…`US-P50` (up to three `XS` items in the same component may share a slot); the rest are `next-run`
- [ ] Writes at the top of `backlog.md`: counts per severity, per group and per lens, and the number in slots vs `next-run`
- [ ] No code change; commits only the records: `docs(names): polish backlog`

### US-P01: Polish slot 01
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P01` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P01/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P02: Polish slot 02
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P02` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P02/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P03: Polish slot 03
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P03` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P03/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P04: Polish slot 04
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P04` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P04/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P05: Polish slot 05
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P05` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P05/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P06: Polish slot 06
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P06` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P06/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P07: Polish slot 07
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P07` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P07/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P08: Polish slot 08
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P08` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P08/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P09: Polish slot 09
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P09` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P09/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P10: Polish slot 10
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P10` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P10/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P11: Polish slot 11
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P11` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P11/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P12: Polish slot 12
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P12` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P12/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P13: Polish slot 13
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P13` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P13/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P14: Polish slot 14
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P14` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P14/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P15: Polish slot 15
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P15` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P15/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P16: Polish slot 16
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P16` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P16/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P17: Polish slot 17
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P17` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P17/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P18: Polish slot 18
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P18` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P18/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P19: Polish slot 19
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P19` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P19/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P20: Polish slot 20
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P20` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P20/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P21: Polish slot 21
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P21` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P21/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P22: Polish slot 22
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P22` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P22/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P23: Polish slot 23
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P23` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P23/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P24: Polish slot 24
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P24` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P24/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P25: Polish slot 25
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P25` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P25/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P26: Polish slot 26
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P26` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P26/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P27: Polish slot 27
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P27` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P27/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P28: Polish slot 28
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P28` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P28/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P29: Polish slot 29
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P29` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P29/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P30: Polish slot 30
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P30` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P30/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P31: Polish slot 31
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P31` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P31/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P32: Polish slot 32
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P32` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P32/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P33: Polish slot 33
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P33` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P33/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P34: Polish slot 34
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P34` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P34/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P35: Polish slot 35
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P35` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P35/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P36: Polish slot 36
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P36` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P36/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P37: Polish slot 37
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P37` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P37/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P38: Polish slot 38
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P38` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P38/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P39: Polish slot 39
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P39` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P39/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P40: Polish slot 40
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P40` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P40/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P41: Polish slot 41
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P41` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P41/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P42: Polish slot 42
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P42` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P42/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P43: Polish slot 43
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P43` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P43/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P44: Polish slot 44
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P44` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P44/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P45: Polish slot 45
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P45` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P45/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P46: Polish slot 46
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P46` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P46/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P47: Polish slot 47
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P47` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P47/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P48: Polish slot 48
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P48` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P48/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P49: Polish slot 49
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P49` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P49/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-P50: Polish slot 50
**Description:** As the owner, I want the next backlog item fixed, verified in mobile browsers and committed on its own.

**Acceptance criteria:**
- [ ] Takes the backlog item(s) assigned to `US-P50` in `scripts/ralph/qa/name-polish/backlog.md`; if the slot is empty or the backlog has no `todo` item left, set `passes: true` with notes 'skipped: backlog empty' and stop (no commit)
- [ ] Before editing: reads the skill rule each of the item's findings cites, `DESIGN.md`, and impeccable `reference/craft-floor.md`; saves before screenshots in each browser the item touches
- [ ] Makes the change in the shared component when the pattern repeats (PRD §8); stays inside §3.1 (no token value changes, no new feature, no dependency); a new token only through `tokens.json` + `npm run tokens:css`
- [ ] Verifies with the item's 'how to verify' in WebKit iPhone 15, Chromium Pixel 7 and Simulator Safari (and 375 × 667 / 320 px for layout items); after screenshots in `scripts/ralph/qa/name-polish/shots/polish/US-P50/`; reads each PNG
- [ ] If the change can't be done inside the guardrails, sets the item `dropped` with the reason (or moves it to `owner-decisions.md`), commits nothing, and passes
- [ ] Sets the item `done` in `backlog.md` and adds a row to `polish-log.md` (slot, ids, files, before/after paths)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `polish(names): NP-0xx <short title>` (the ids of the item(s) in the slot)

### US-R1: Re-score G1 Entry
**Description:** As the owner, I want proof that entry got better and nothing got worse.

**Acceptance criteria:**
- [ ] Re-runs impeccable `reference/critique.md` on every screen of G1 with the same method as `US-A-IMP-C-G1`; writes the after table next to the baseline in `scores.md` with the change per screen
- [ ] Screenshots of every screen and state of G1 in all three browsers to `scripts/ralph/qa/name-polish/shots/after/G1/`; reads each and compares with `shots/baseline/G1/`
- [ ] Any screen that scores lower than its baseline, or any visible regression, is filed in `bugs.md` (it will be handled by QA FIX stories)
- [ ] No code change; commits only the records: `docs(names): re-score G1`

### US-R2: Re-score G2 Deck
**Description:** As the owner, I want proof that deck got better and nothing got worse.

**Acceptance criteria:**
- [ ] Re-runs impeccable `reference/critique.md` on every screen of G2 with the same method as `US-A-IMP-C-G2`; writes the after table next to the baseline in `scores.md` with the change per screen
- [ ] Screenshots of every screen and state of G2 in all three browsers to `scripts/ralph/qa/name-polish/shots/after/G2/`; reads each and compares with `shots/baseline/G2/`
- [ ] Any screen that scores lower than its baseline, or any visible regression, is filed in `bugs.md` (it will be handled by QA FIX stories)
- [ ] No code change; commits only the records: `docs(names): re-score G2`

### US-R3: Re-score G3 Lists and settings
**Description:** As the owner, I want proof that lists and settings got better and nothing got worse.

**Acceptance criteria:**
- [ ] Re-runs impeccable `reference/critique.md` on every screen of G3 with the same method as `US-A-IMP-C-G3`; writes the after table next to the baseline in `scores.md` with the change per screen
- [ ] Screenshots of every screen and state of G3 in all three browsers to `scripts/ralph/qa/name-polish/shots/after/G3/`; reads each and compares with `shots/baseline/G3/`
- [ ] Any screen that scores lower than its baseline, or any visible regression, is filed in `bugs.md` (it will be handled by QA FIX stories)
- [ ] No code change; commits only the records: `docs(names): re-score G3`

### US-D1: Docs
**Description:** As the next person working on the swiper, I want the docs to match what the polish changed.

**Acceptance criteria:**
- [ ] Updates `DESIGN.md` for every pattern, token or component variant this run added or changed (from `polish-log.md`)
- [ ] Updates `docs/names-pwa/README.md` ('Design tokens' and component notes) where they changed; adds new tokens to the tokens section
- [ ] No product decision is written as if the owner made it
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `docs(names): document the polish run`

### US-SA: Self-audit before QA
**Description:** As the QA cycles, I want the obvious problems in this run's diff gone first.

**Acceptance criteria:**
- [ ] Reviews the full diff of this run (`git diff <US-000 commit>..HEAD -- src`) against §3.1 and §8: no hex, rgb or px font size, no physical left/right, no new dependency, no green, labelled icon buttons, reduced motion for every new animation, no new analytics event
- [ ] Re-measures the first-load JS of `/names` and checks it against the US-004 baseline (+3 KB budget); writes both numbers in `scores.md`
- [ ] Fixes what it finds (or files it in `bugs.md` if it's large)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once if anything changed: `fix(names): polish run self-audit`

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
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 A, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area A checklist run in full, even if it passed in an earlier cycle

### US-QA1-B: QA cycle 1: Swipe screen and card
**Description:** As the owner, I want area B (Swipe screen and card) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 B, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area B checklist run in full, even if it passed in an earlier cycle

### US-QA1-C: QA cycle 1: Detail sheet
**Description:** As the owner, I want area C (Detail sheet) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 C, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area C checklist run in full, even if it passed in an earlier cycle

### US-QA1-D: QA cycle 1: Other sheets
**Description:** As the owner, I want area D (Other sheets) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 D, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area D checklist run in full, even if it passed in an earlier cycle

### US-QA1-E: QA cycle 1: Lists, duel, hidden
**Description:** As the owner, I want area E (Lists, duel, hidden) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 E, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area E checklist run in full, even if it passed in an earlier cycle

### US-QA1-F: QA cycle 1: Settings, legal, account
**Description:** As the owner, I want area F (Settings, legal, account) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 F, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area F checklist run in full, even if it passed in an earlier cycle

### US-QA1-G: QA cycle 1: Accessibility, RTL, design system
**Description:** As the owner, I want area G (Accessibility, RTL, design system) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 G, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area G checklist run in full, even if it passed in an earlier cycle

### US-QA1-H: QA cycle 1: Motion and gestures
**Description:** As the owner, I want area H (Motion and gestures) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 H, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area H checklist run in full, even if it passed in an earlier cycle

### US-QA1-I: QA cycle 1: PWA, offline, performance
**Description:** As the owner, I want area I (PWA, offline, performance) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 I, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area I checklist run in full, even if it passed in an earlier cycle

### US-QA1-J: QA cycle 1: Analytics and privacy
**Description:** As the owner, I want area J (Analytics and privacy) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 J, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area J checklist run in full, even if it passed in an earlier cycle

### US-FIX1: Fix the bugs from QA cycle 1
**Description:** As the owner, I want every open bug from cycle 1 fixed and verified, or the loop to stop when QA is clean.

**Acceptance criteria:**
- [ ] If cycle 1 filed zero `open` bugs: mark every remaining `US-QA*` and `US-FIX*` story `passes: true` with notes 'skipped: QA clean after cycle 1', no commit, and let US-FINAL run
- [ ] Otherwise: fix every `open` bug, verify each fix in the browser it failed in (screenshot), set `status: fixed` with a fix note and the cycle
- [ ] A bug that can't be fixed without breaking a §3.1 guardrail is set `wontfix-owner` with the reason and added to `owner-decisions.md`
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `fix(names): resolve the {k} bugs found in polish QA cycle 1`

### US-QA2-A: QA cycle 2: Entry screens
**Description:** As the owner, I want area A (Entry screens) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 A, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area A checklist run in full, even if it passed in an earlier cycle

### US-QA2-B: QA cycle 2: Swipe screen and card
**Description:** As the owner, I want area B (Swipe screen and card) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 B, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area B checklist run in full, even if it passed in an earlier cycle

### US-QA2-C: QA cycle 2: Detail sheet
**Description:** As the owner, I want area C (Detail sheet) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 C, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area C checklist run in full, even if it passed in an earlier cycle

### US-QA2-D: QA cycle 2: Other sheets
**Description:** As the owner, I want area D (Other sheets) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 D, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area D checklist run in full, even if it passed in an earlier cycle

### US-QA2-E: QA cycle 2: Lists, duel, hidden
**Description:** As the owner, I want area E (Lists, duel, hidden) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 E, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area E checklist run in full, even if it passed in an earlier cycle

### US-QA2-F: QA cycle 2: Settings, legal, account
**Description:** As the owner, I want area F (Settings, legal, account) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 F, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area F checklist run in full, even if it passed in an earlier cycle

### US-QA2-G: QA cycle 2: Accessibility, RTL, design system
**Description:** As the owner, I want area G (Accessibility, RTL, design system) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 G, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area G checklist run in full, even if it passed in an earlier cycle

### US-QA2-H: QA cycle 2: Motion and gestures
**Description:** As the owner, I want area H (Motion and gestures) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 H, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area H checklist run in full, even if it passed in an earlier cycle

### US-QA2-I: QA cycle 2: PWA, offline, performance
**Description:** As the owner, I want area I (PWA, offline, performance) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 I, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area I checklist run in full, even if it passed in an earlier cycle

### US-QA2-J: QA cycle 2: Analytics and privacy
**Description:** As the owner, I want area J (Analytics and privacy) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 J, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area J checklist run in full, even if it passed in an earlier cycle

### US-FIX2: Fix the bugs from QA cycle 2
**Description:** As the owner, I want every open bug from cycle 2 fixed and verified, or the loop to stop when QA is clean.

**Acceptance criteria:**
- [ ] If cycle 2 filed zero `open` bugs: mark every remaining `US-QA*` and `US-FIX*` story `passes: true` with notes 'skipped: QA clean after cycle 2', no commit, and let US-FINAL run
- [ ] Otherwise: fix every `open` bug, verify each fix in the browser it failed in (screenshot), set `status: fixed` with a fix note and the cycle
- [ ] A bug that can't be fixed without breaking a §3.1 guardrail is set `wontfix-owner` with the reason and added to `owner-decisions.md`
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `fix(names): resolve the {k} bugs found in polish QA cycle 2`

### US-QA3-A: QA cycle 3: Entry screens
**Description:** As the owner, I want area A (Entry screens) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 A, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area A checklist run in full, even if it passed in an earlier cycle

### US-QA3-B: QA cycle 3: Swipe screen and card
**Description:** As the owner, I want area B (Swipe screen and card) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 B, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area B checklist run in full, even if it passed in an earlier cycle

### US-QA3-C: QA cycle 3: Detail sheet
**Description:** As the owner, I want area C (Detail sheet) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 C, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area C checklist run in full, even if it passed in an earlier cycle

### US-QA3-D: QA cycle 3: Other sheets
**Description:** As the owner, I want area D (Other sheets) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 D, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area D checklist run in full, even if it passed in an earlier cycle

### US-QA3-E: QA cycle 3: Lists, duel, hidden
**Description:** As the owner, I want area E (Lists, duel, hidden) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 E, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area E checklist run in full, even if it passed in an earlier cycle

### US-QA3-F: QA cycle 3: Settings, legal, account
**Description:** As the owner, I want area F (Settings, legal, account) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 F, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area F checklist run in full, even if it passed in an earlier cycle

### US-QA3-G: QA cycle 3: Accessibility, RTL, design system
**Description:** As the owner, I want area G (Accessibility, RTL, design system) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 G, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area G checklist run in full, even if it passed in an earlier cycle

### US-QA3-H: QA cycle 3: Motion and gestures
**Description:** As the owner, I want area H (Motion and gestures) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 H, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area H checklist run in full, even if it passed in an earlier cycle

### US-QA3-I: QA cycle 3: PWA, offline, performance
**Description:** As the owner, I want area I (PWA, offline, performance) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 I, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area I checklist run in full, even if it passed in an earlier cycle

### US-QA3-J: QA cycle 3: Analytics and privacy
**Description:** As the owner, I want area J (Analytics and privacy) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] First checks every `done` backlog item of this area against its 'how to verify' column, then runs every item of PRD §11.2 J, in the browsers it names, on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-polish/bugs.md` (fields as in `tasks/prd-name-detail.md` §11.1, next free `NP-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area J checklist run in full, even if it passed in an earlier cycle

### US-FIX3: Fix the bugs from QA cycle 3
**Description:** As the owner, I want every open bug from cycle 3 fixed and verified, or the loop to stop when QA is clean.

**Acceptance criteria:**
- [ ] If cycle 3 filed zero `open` bugs: mark every remaining `US-QA*` and `US-FIX*` story `passes: true` with notes 'skipped: QA clean after cycle 3', no commit, and let US-FINAL run
- [ ] Otherwise: fix every `open` bug, verify each fix in the browser it failed in (screenshot), set `status: fixed` with a fix note and the cycle
- [ ] A bug that can't be fixed without breaking a §3.1 guardrail is set `wontfix-owner` with the reason and added to `owner-decisions.md`
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `fix(names): resolve the {k} bugs found in polish QA cycle 3`
- [ ] This is the last fix pass: anything still broken stays `open`

### US-FINAL: Summary and push
**Description:** As the owner, I want an honest summary and the branch pushed, so I can review and open a PR.

**Acceptance criteria:**
- [ ] Re-checks every bug fixed in the last cycle that ran, in its browser
- [ ] `scripts/ralph/qa/name-polish/SUMMARY.md`: stories done; the score table before and after per screen and group; polish items done, dropped and `next-run` (counts and list); the owner decisions with their one-line recommendations; 'clean after cycle N' or 'stopped after 3 cycles, {k} bugs open for the owner's review' with the list; performance before and after; skills that couldn't run and checks that were blocked; never rounds up
- [ ] Notes that `shots/` is gitignored and lists the before/after screenshot folders on this Mac
- [ ] Committed once: `docs(names): polish run summary`; `git push -u origin ralph/name-polish` (never main)
