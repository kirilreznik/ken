# Ralph Agent Instructions

You are an autonomous coding agent working on `kirilreznik/ken`: the Nest landing page (Next.js 16, React 19, Tailwind 4) and, in this run, the name detail sheet of the name swiper PWA at `/names`.

## Current Run: name detail sheet, build + content + 3 QA cycles in mobile browsers

This run executes `tasks/prd-name-detail.md` via `scripts/ralph/prd.json` (installed from `scripts/ralph/prd-name-detail.json` by `scripts/ralph/run-name-detail.sh`). **Read `tasks/prd-name-detail.md` first, every iteration**: §3 (decisions, don't reopen them, including §3.3 on the launch pack), §5 (design system and the components to reuse, for every UI story), §6 (content rules, for content stories), §8 (rules for every story), §10 (mobile browser check) and, for QA stories, §11. The previous run's PRD `tasks/prd-names-pwa.md` and the spec `docs/names-pwa/E16-name-swipe-spec.md` describe everything already built; read the parts your story touches. Accounts and settings are the owner's (`docs/names-pwa/SETUP.md`); never change them.

**Branch:** `ralph/name-detail`, from `origin/main`. Never commit to or push `main`.

**Design source of truth:** the app's tokens (`src/styles/nest-tokens.css`) and components (`src/components/names/ui/`, `card/`, `swipe/`) for every value and building block; boards `docs/names-pwa/design/screens/12-detail-card.png` … `15-detail-extras.png` (source `docs/names-pwa/design/source/NameDetail.dc.html`) for layout, order and copy of the new sheet; the older boards 1–11 for everything else. Boards 12–15 are brainstorm sketches: where their colors or sizes differ from the tokens, the tokens win; their placeholder surname, story and similar names never ship. There is no claude.ai access here; don't try to open canvas or artifact links.

**Backend:** the Supabase project in `.env.local` ("Nest (EU)"). This run needs no backend change. Never apply SQL, change auth settings or deploy functions.

**Secrets:** `.env.local` and `scripts/ralph/.env.test.local` are gitignored. Never print, log or commit their values, codes, tokens or phone numbers. Refer to them by key name only.

**Dependencies and lockfile:** install with `npm ci`, never a bare `npm install`. On this Mac (npm 11) `npm install` drops the `@esbuild/*` platform entries from `package-lock.json`, and Vercel's Linux build needs them. This run should add no dependency; Playwright's WebKit browser is installed with `npx playwright install webkit` (no lockfile change). Next 16's dev server writes `AGENTS.md` and `CLAUDE.md` into the repo root; they are gitignored, never commit them.

**Commits:** build and content stories (US-001…US-074) commit once each when their criteria say so. QA stories (`US-QA{N}-{X}`) never commit and never fix; they only write to `scripts/ralph/qa/name-detail/` and `progress.txt`. `US-FIX{N}` commits once per cycle. `US-FINAL` makes one docs commit and pushes the branch. Never `git stash`, `git clean`, `git checkout .` or `git reset --hard`: uncommitted QA records must survive between iterations.

**QA loop (hard cap of 3):** QA cycle N (17 stories, A–Q, run in full every cycle, in real mobile browsers) → `US-FIX{N}`. A FIX story whose cycle found zero `open` bugs marks every remaining QA/FIX story `passes: true` with "skipped: QA clean after cycle N" and lets `US-FINAL` run. `US-FIX3` is the last fix pass. `US-FINAL` reports the true state and never rounds up.

**US-000 runs first and gates everything.** If it can't pass (a browser, the Simulator, `cliclick`, the QA users, or the launch pack not merged), it writes the missing prerequisite at the top of `progress.txt` and stops. Don't start other stories.

## Your Task

1. Read the PRD at `scripts/ralph/prd.json` (in the same directory as this file)
2. Read the progress log at `scripts/ralph/progress.txt` (check the Codebase Patterns section first)
3. Check you're on the branch from PRD `branchName`. If not, check it out or create it from `origin/main`.
4. Pick the **highest priority** user story where `passes: false` (lowest `priority` number)
5. Implement that single user story, following `tasks/prd-name-detail.md` §8
6. Run the checks: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`
7. For UI stories, do the browser check (below) until it matches
8. If checks pass, commit as the story's criteria say (short imperative subject, e.g. `feat(names): add the duel`)
9. Update `scripts/ralph/prd.json`: set `passes: true` for the story, and put anything notable in its `notes`
10. Append your progress to `scripts/ralph/progress.txt`

## Next.js and libraries have changed. Don't trust memory.

Before using a Next.js API, read the matching guide in `node_modules/next/dist/docs/` if it exists, otherwise https://nextjs.org/docs (version 16). For Supabase auth, read the `@supabase/supabase-js` / `@supabase/auth-js` source in `node_modules` or https://supabase.com/docs. Heed deprecation notices.

## Mobile browser check (required for UI stories)

The full recipe is `tasks/prd-name-detail.md` §10. In short, every UI story is checked in three mobile browsers:

1. `curl -s -o /dev/null -w '%{http_code}' localhost:3000/names/welcome`; if it doesn't answer, start `nohup npm run dev > /tmp/names-dev.log 2>&1 &` and wait for it. Service worker and QA stories use a production build on port 3100.
2. Playwright WebKit as an iPhone 15 and Chromium as a Pixel 7, both with touch and a signed-in QA user: `scripts/ralph/qa/name-detail/mobile.mjs` (US-001). Taps with the touchscreen, drags with its touch `drag()` helper.
3. Mobile Safari in the iOS Simulator: `scripts/ralph/qa/name-detail/sim.mjs` and the notes in `SIMULATOR.md` (US-002).
4. Save screenshots to `scripts/ralph/qa/name-detail/shots/`, read each PNG and compare it with the board PNG, its `.dc.html` and the tokens (PRD §5).
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
