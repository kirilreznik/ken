# Nest site

The public site at https://nestjourney.app: the landing page and the name swiper PWA at `/names`.
Next.js 16 · React 19 · Tailwind 4. Deploys to Vercel from `main`.

- `/` (and `/pregnancy`): the landing page, a standalone HTML document from `src/lib/pregnancy-landing.mjs`
  with the name swipe demo from `src/lib/pregnancy-names-demo.mjs`. Waitlist sign-ups go to `/api/pregnancy-waitlist`.
- `/names`: the name swiper, an installable Hebrew PWA on the Nest Supabase project (sign-in, swipe deck, lists, partner
  matches by invite link, offline). How it works, env vars, running it and QA helpers: [`docs/names-pwa/README.md`](docs/names-pwa/README.md).
- `public/sw.js`: a self-removing service worker that clears the old Ken PWA from phones that installed it.

## Status (2026-11-13)

- `/names` is live. ken PR #17 (name detail sheet) and PR #18 (polish run) are merged and deployed.
- The polish run did 132 of 132 stories: 54 of 171 polish items fixed (every P1 and P2), 117 P3 items queued for a next run
  (`scripts/ralph/qa/name-polish/backlog.md`), all 12 QA bugs fixed, design scores up on every screen
  (`scripts/ralph/qa/name-polish/SUMMARY.md`).
- Analytics, the launch pack (decision moment, recap, invite prompt, leave a shared list, beta survey) and real name content are live.
  Migration 0011 (leave a list + survey) is applied to the EU Supabase project. Optional fix: `analytics.names_survey` has no RLS.
- **Sign-ups are closed:** only the owner and 3 QA test users can sign in.
- **Waiting on the owner:** the 26 decisions in `scripts/ralph/qa/name-polish/owner-decisions.md`, a check on a real phone
  (`docs/names-pwa/SETUP.md` §13), and yes or no on public SEO per-name pages.
- **Next:** the decisions and the phone check, then open sign-ups to a small beta and watch the survey and analytics.
  After that, work returns to the Nest app (paused since 2026-11-04); its status is in pregnancy-manager `docs/prd/migration/HANDOFF.md` §0.

The old Ken PWA that lived here was removed in November 2026; it is in git history before that change.
The Nest app and its database live in https://github.com/kirilreznik/pregnancy-manager.

```bash
npm ci
npm run names:data   # once: builds public/names/data/ for /names
npm run dev
npm test
npm run lint
```
