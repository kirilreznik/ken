# Ralph Agent Instructions

You are an autonomous coding agent working on `kirilreznik/ken`: the Nest landing page (Next.js 16, React 19, Tailwind 4) and, in this run, the second polish of the name swiper PWA at `/names`.

## Current Run: second polish of the name swiper (the 117 queued P3 items) + 3 QA cycles in mobile browsers

This run executes `tasks/prd-name-polish-2.md` via `scripts/ralph/prd.json` (installed from `scripts/ralph/prd-name-polish-2.json` by `scripts/ralph/run-name-polish-2.sh`). **Read `tasks/prd-name-polish-2.md` first, every iteration.** It builds on the first polish run's PRD, `tasks/prd-name-polish.md`: its §3.1 guardrails, §6 screens, §7 record formats, §8 rules, §10 browser check and §11 QA all apply, with this run's branch and record folder `scripts/ralph/qa/name-polish-2/`. The earlier PRDs `tasks/prd-names-pwa.md` and `tasks/prd-name-detail.md` describe everything already built and every owner decision; read the parts your story touches. Accounts and settings are the owner's (`docs/names-pwa/SETUP.md`); never change them.

**What this run does:** no audits. The backlog is already written (`scripts/ralph/qa/name-polish-2/backlog.md`, 117 rows from the first run). Each item has its own story `US-NP0xx`: check it still applies, fix it, verify it in three mobile browsers, commit once. Its findings are in the first run's `scripts/ralph/qa/name-polish/findings/`; read the skill rule they cite from `.claude/skills/<name>/`.

**Never touch the name data:** `data/names/**`, `scripts/names-content/**`, `scripts/build-names-data.mjs` and generated names JSON belong to another piece of work. An item that would need them is dropped with the reason.

**Branch:** `ralph/name-polish-2`, created by the owner's start command from `origin/claude/project-thread-79v2l8` (this PRD on top of `main`). If you're not on it, check it out. Never commit to or push `main`.

**Design source of truth:** the app's tokens (`src/styles/nest-tokens.css`, from `docs/names-pwa/brand/tokens.json`), its components (`src/components/names/ui/`, `card/`, `swipe/`, `detail/`), `docs/names-pwa/brand/BRAND.md`, the boards in `docs/names-pwa/design/`, and `PRODUCT.md` and `DESIGN.md` at the repo root. Existing token values are the owner's. There is no claude.ai access here; don't try to open canvas or artifact links.

**Backend:** the Supabase project in `.env.local` ("Nest (EU)"). This run needs no backend change. Never apply SQL, change auth settings or deploy functions. `names_leave` (migration 0011) is deployed, so leaving a shared choice works; QA area F tests it and restores the shared space.

**Secrets:** `.env.local` and `scripts/ralph/.env.test.local` are gitignored. Never print, log or commit their values, codes, tokens or phone numbers. Refer to them by key name only.

**Dependencies and lockfile:** install with `npm ci`, never a bare `npm install`. On this Mac (npm 11) `npm install` drops the `@esbuild/*` platform entries from `package-lock.json`, and Vercel's Linux build needs them. This run adds no dependency, even when a skill suggests one. Next 16's dev server writes `AGENTS.md` and `CLAUDE.md` into the repo root; they are gitignored, never commit them.

**Commits:** US-001 and US-002 commit as their criteria say. Each item story (`US-NP0xx`) commits once (or only records when it drops the item). QA stories (`US-QA{N}-{X}`) never commit and never fix; they only write to `scripts/ralph/qa/name-polish-2/` and `progress.txt`. `US-FIX{N}` commits once per cycle. `US-FINAL` makes one docs commit and pushes the branch. Never `git stash`, `git clean`, `git checkout .` or `git reset --hard`: uncommitted QA records must survive between iterations.

**QA loop (hard cap of 3):** QA cycle N (10 stories, A–J, run in full every cycle, in real mobile browsers) → `US-FIX{N}`. A FIX story whose cycle found zero `open` bugs marks every remaining QA/FIX story `passes: true` with "skipped: QA clean after cycle N" and lets `US-FINAL` run. `US-FIX3` is the last fix pass. `US-FINAL` reports the true state and never rounds up.

**US-000 runs first and gates everything.** If it can't pass (a browser, the Simulator, `cliclick`, the QA users or the skills folder), it writes the missing prerequisite at the top of `progress.txt` and stops. Don't start other stories.

## Your Task

1. Read the PRD at `scripts/ralph/prd.json` (in the same directory as this file)
2. Read the progress log at `scripts/ralph/progress.txt` (check the Codebase Patterns section first)
3. Check you're on the branch from PRD `branchName` (see **Branch** above)
4. Pick the **highest priority** user story where `passes: false` (lowest `priority` number)
5. Implement that single user story, following `tasks/prd-name-polish.md` §8 (with this run's branch and records)
6. If the story changes code, run the checks: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`
7. For UI stories, do the browser check (below) until it matches
8. If checks pass, commit as the story's criteria say (short imperative subject, e.g. `polish(names): NP-004 align the sheet header`)
9. Update `scripts/ralph/prd.json`: set `passes: true` for the story, and put anything notable in its `notes`
10. Append your progress to `scripts/ralph/progress.txt`

## Next.js and libraries have changed. Don't trust memory.

Before using a Next.js API, read the matching guide in `node_modules/next/dist/docs/` if it exists, otherwise https://nextjs.org/docs (version 16). For Supabase auth, read the `@supabase/supabase-js` / `@supabase/auth-js` source in `node_modules` or https://supabase.com/docs. Heed deprecation notices.

## Mobile browser check (required for UI stories)

The full recipe is `tasks/prd-name-polish.md` §10. In short, every UI story is checked in three mobile browsers, with the detail run's helpers:

1. `curl -s -o /dev/null -w '%{http_code}' localhost:3000/names/welcome`; if it doesn't answer, start `nohup npm run dev > /tmp/names-dev.log 2>&1 &` and wait for it. Service worker, performance and QA stories use a production build on port 3100.
2. Playwright WebKit as an iPhone 15 and Chromium as a Pixel 7, both with touch and a signed-in QA user: `scripts/ralph/qa/name-detail/mobile.mjs`. Taps with the touchscreen, drags with its touch `drag()` helper.
3. Mobile Safari in the iOS Simulator: `scripts/ralph/qa/name-detail/sim.mjs` and the notes in `scripts/ralph/qa/name-detail/SIMULATOR.md`.
4. Save screenshots to `scripts/ralph/qa/name-polish-2/shots/` (the helpers' `QA_SHOTS_DIR` option), read each PNG and compare it with the board PNG, its `.dc.html`, the tokens and the item's before screenshot.
5. Fix and repeat until it matches. Not "close enough". Deliberate differences go in the story's `notes`.

A frontend story is not complete until this loop finds a clean match in all three. If a browser or the Simulator can't run, write that in `progress.txt` as a blocker; never skip the check.


## Progress Report Format

APPEND to `scripts/ralph/progress.txt` (never replace):
```
## [Date/Time] - [Story ID]
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered
  - Gotchas encountered
  - Useful context
---
```

## Consolidate Patterns

Reusable learnings go in a `## Codebase Patterns` section at the TOP of `scripts/ralph/progress.txt` (create it if missing). Only general, reusable patterns, not story details.

## Quality Requirements

- ALL commits pass `npm run lint` (0 errors), `npx tsc --noEmit`, `npm test` and `npm run build`
- Don't commit broken code
- Keep changes focused and minimal
- Design tokens only, RTL logical properties, ≥ 44 px targets, Hebrew `aria-label`s, status never by color alone, gender-neutral Hebrew, no due date anywhere

## Stop Condition

After completing a story, check whether ALL stories have `passes: true`. If so, reply with:
<promise>COMPLETE</promise>

Otherwise end your response normally (another iteration picks up the next story).

## Important

- ONE story per iteration
- Read Codebase Patterns in progress.txt before starting
- Never hard-code hex colors or font sizes outside `src/styles/nest-tokens.css`
