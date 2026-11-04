# Ralph Agent Instructions

You are an autonomous coding agent working on `kirilreznik/ken`: the Nest landing page (Next.js 16, React 19, Tailwind 4) and, in this run, the name swiper PWA at `/names`.

## Current Run: name swiper PWA, build + 3 QA cycles

This run executes `tasks/prd-names-pwa.md` via `scripts/ralph/prd.json` (installed from `scripts/ralph/prd-names-pwa.json` by `scripts/ralph/run-names-pwa.sh`). **Read `tasks/prd-names-pwa.md` first, every iteration**: §3 (decisions, don't reopen them), §8 (rules for every story), §10 (browser check) and, for QA stories, §11. The product spec for cards, deck, lists and duel is `docs/names-pwa/E16-name-swipe-spec.md`; read the sections your story cites. Accounts and settings are the owner's (`docs/names-pwa/SETUP.md`); never change them.

**Branch:** `ralph/names-pwa`, from `origin/main`. Never commit to or push `main`.

**Design source of truth:** `docs/names-pwa/design/screens/*.png` (how it looks) and `docs/names-pwa/design/source/*.dc.html` (exact sizes, colors, radii, copy), the brand in `docs/names-pwa/brand/`, and the landing demo `src/lib/pregnancy-names-demo.mjs` for interactions. There is no claude.ai access here; don't try to open canvas or artifact links.

**Backend:** the Supabase project in `.env.local` ("Nest (EU)", `hkoumskvmkqqnwhnizbq`). Migrations 0001–0009 are applied by the owner. Never apply SQL, change auth settings or deploy functions. A needed backend change goes into `docs/names-pwa/backend-requests.md` and the dependent part is marked blocked in the story notes.

**Secrets:** `.env.local` and `scripts/ralph/.env.test.local` are gitignored. Never print, log or commit their values, OTPs, tokens or phone numbers. Refer to them by key name only.

**Commits:** build stories (US-001…US-074) commit once each when done, if their criteria say so. QA stories (`US-QA{N}-{X}`) never commit and never fix; they only write to `scripts/ralph/qa/names-pwa/` and `progress.txt`. `US-FIX{N}` commits once per cycle. `US-FINAL` makes one docs commit and pushes the branch. Never `git stash`, `git clean`, `git checkout .` or `git reset --hard`: uncommitted QA records must survive between iterations.

**QA loop (hard cap of 3):** QA cycle N (12 stories, A–L, run in full every cycle) → `US-FIX{N}`. A FIX story whose cycle found zero `open` bugs marks every remaining QA/FIX story `passes: true` with "skipped: QA clean after cycle N" and lets `US-FINAL` run. `US-FIX3` is the last fix pass. `US-FINAL` reports the true state and never rounds up.

**US-000 runs first and gates everything.** If it can't pass, it writes the missing prerequisites at the top of `progress.txt` and stops. Don't start other stories.

## Your Task

1. Read the PRD at `scripts/ralph/prd.json` (in the same directory as this file)
2. Read the progress log at `scripts/ralph/progress.txt` (check the Codebase Patterns section first)
3. Check you're on the branch from PRD `branchName`. If not, check it out or create it from `origin/main`.
4. Pick the **highest priority** user story where `passes: false` (lowest `priority` number)
5. Implement that single user story, following `tasks/prd-names-pwa.md` §8
6. Run the checks: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`
7. For UI stories, do the browser check (below) until it matches
8. If checks pass, commit as the story's criteria say (short imperative subject, e.g. `feat(names): add the duel`)
9. Update `scripts/ralph/prd.json`: set `passes: true` for the story, and put anything notable in its `notes`
10. Append your progress to `scripts/ralph/progress.txt`

## Next.js and libraries have changed. Don't trust memory.

Before using a Next.js API, read the matching guide in `node_modules/next/dist/docs/` if it exists, otherwise https://nextjs.org/docs (version 16). For Supabase auth, read the `@supabase/supabase-js` / `@supabase/auth-js` source in `node_modules` or https://supabase.com/docs. Heed deprecation notices.

## Browser check (required for UI stories)

The full recipe is `tasks/prd-names-pwa.md` §10. In short:

1. `curl -s -o /dev/null -w '%{http_code}' localhost:3000/names/welcome`; if it doesn't answer, start `nohup npm run dev > /tmp/names-dev.log 2>&1 &` and wait for it. Service worker and QA stories use a production build on port 3100.
2. Signed-in pages: `node scripts/ralph/qa/names-pwa/login.mjs 1` writes a storageState; pass `--state 1` to `shot.mjs`.
3. `node scripts/ralph/qa/names-pwa/shot.mjs /names out.png --state 1` (390 × 844, he-IL, Asia/Jerusalem). Read the PNG and compare it with the board PNG and its `.dc.html`.
4. Script interactions with Playwright (`page.mouse`, `page.touchscreen`, `page.keyboard`, `setInputFiles`, `context.setOffline`, `page.emulateMedia`).
5. Fix and repeat until it matches. Not "close enough". Deliberate differences go in the story's `notes`.

A frontend story is not complete until this loop finds a clean match. If Playwright can't run, write that in `progress.txt` as a blocker; never skip the check.

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
