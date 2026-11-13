# Ralph Agent Instructions

You are an autonomous coding agent working on `kirilreznik/ken`: the Nest landing page (Next.js 16, React 19, Tailwind 4) and, in this run, a fast code-only polish of the name swiper PWA at `/names`.

## Current Run: second polish of the name swiper, CODE ONLY (the 117 queued P3 items)

This run executes `tasks/prd-name-polish-2.md` via `scripts/ralph/prd.json` (installed from `scripts/ralph/prd-name-polish-2.json` by `scripts/ralph/run-name-polish-2.sh`). **Read `tasks/prd-name-polish-2.md` §2 first, every iteration.** The owner asked for speed: write the code and move on. **No QA, no screenshots, no browsers, no Simulator, no tests, no build, no re-scoring** in item stories. The owner verifies later.

**What each story is:** `US-B01` … `US-B72` each code 1–4 backlog items from `scripts/ralph/qa/name-polish-2/backlog.md` (the row has the files and the one-line change). Skip items already `done`/`dropped`. Read a finding in `scripts/ralph/qa/name-polish/findings/` only if the change isn't clear. Don't open skills. `US-END` runs lint and build once, writes a short summary and pushes.

**Never touch the name data:** `data/names/**`, `scripts/names-content/**`, `scripts/build-names-data.mjs`, generated names JSON. **Don't build anything from ken PR #23** (search, Latin spelling, naming after a relative, twins).

**Branch:** `ralph/name-polish-2`. If you're not on it, check it out. Never commit to or push `main`.

**Guardrails:** refine, never redesign (`tasks/prd-name-polish.md` §3.1). Tokens from `src/styles/nest-tokens.css` only; existing token values are the owner's; a new token goes through `docs/names-pwa/brand/tokens.json` + `npm run tokens:css`. RTL logical properties, Hebrew `aria-label`s, reduced-motion versions for new animations, no dependencies (`npm ci` only, never `npm install`), only `/names` code. Never change Supabase, Vercel or auth; never print secrets from `.env.local` or `scripts/ralph/.env.test.local`. Next 16's dev server writes `AGENTS.md`/`CLAUDE.md` at the repo root; never commit them.

**Commits:** one per story, as its criteria say. Never `git stash`, `git clean`, `git checkout .` or `git reset --hard`.

## Your Task

1. Read `scripts/ralph/prd.json` and the Codebase Patterns at the top of `scripts/ralph/progress.txt`
2. Check you're on the branch from PRD `branchName`
3. Pick the **highest priority** user story where `passes: false`
4. Code it (fast, see above); the only check is `npx tsc --noEmit` (US-END also runs `npm run lint` and `npm run build`)
5. Commit as the story says
6. Update `scripts/ralph/prd.json`: `passes: true`, anything notable in `notes`
7. Append a short entry to `scripts/ralph/progress.txt`

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

- `npx tsc --noEmit` passes on every commit; lint and build are checked once in US-END
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
