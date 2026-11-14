# Nest site

The public site at https://nestjourney.app: the landing page and the name swiper PWA at `/names`.
Next.js 16 · React 19 · Tailwind 4. Deploys to Vercel from `main`.

- `/` (and `/pregnancy`): the landing page, a standalone HTML document from `src/lib/pregnancy-landing.mjs`
  with the name swipe demo from `src/lib/pregnancy-names-demo.mjs`. Waitlist sign-ups go to `/api/pregnancy-waitlist`.
- `/names`: the name swiper, an installable Hebrew PWA on the Nest Supabase project (sign-in, swipe deck, lists, partner
  matches by invite link, offline). How it works, env vars, running it and QA helpers: [`docs/names-pwa/README.md`](docs/names-pwa/README.md).
- `/baby-names`: public, statically generated name pages for search engines: a hub, one page per deck name
  (`/baby-names/<name>`, a space becomes `_`) and five lists (`girls`, `boys`, `unisex`, `biblical`, `rising`), built at
  build time from `data/names/*.json` by `src/lib/babyNames/`. Only names given to at least 100 babies in 2024 are
  indexed (`INDEX_MIN_2024`, 288 pages); the rest are `noindex, follow`. `/sitemap.xml` and `/robots.txt` come from
  `src/app/sitemap.ts` and `src/app/robots.ts`.
- `public/sw.js`: a self-removing service worker that clears the old Ken PWA from phones that installed it.

## Status (2026-11-14)

- **`/names` is live** at https://nestjourney.app/names (Vercel project `ken`, deploys from `main`). Database: the EU Supabase
  project `hkoumskvmkqqnwhnizbq` (Frankfurt), migrations in pregnancy-manager `supabase/migrations/`.
- **Deck:** 1,937 cards, names in use among Jewish Israelis (PRs #20, #21), Wikidata known people on 1,280 (#22), the 2024
  count on every card (#24), stories and similar names for every card (#26).
- **Features since 2026-11-13:** search, Latin spelling, naming after a relative and twins (#23); gender filter that combines
  מתאים לכולם with בן or בת (#30); public SEO name pages at `/baby-names`, 288 indexed (#27).
- **Sign-in:** guests swipe 100 names before signing in (#28). Sign-ups go through the invite-only Before User Created hook
  (migration 0012, #25); opening sign-ups to everyone means turning that hook off (owner step, `docs/names-pwa/SETUP.md` §3.3.1).
  While it's on, a guest without an invite can't create an account, including from the AI search's sign-in prompt.
- **חיפוש לפי תיאור (AI search, #31 + #32, live 2026-11-14):** a person describes the name they want and Claude picks a deck
  from our cards only. It's a row at the top of סינון that opens its own step. Signed in: 5 searches a calendar month
  (Israel time). Guests: 1 try per device per month, then the sign-in buttons. Only searches that return names count.
  Migrations 0013 and 0014 are applied to the EU project. Setup, limits and env vars: `docs/names-pwa/SETUP.md` §15.
- **Analytics (review 2026-11-14):** every link into the swiper carries `?source=`, `app_open` keeps the referrer type and
  `utm_*`, crawlers and preview builds are left out, guest votes keep their time when moved into an account, and migration
  0015 adds views that count guests beside the North Star. How to read it: `docs/names-pwa/ANALYTICS.md`.
- **Polish runs:** the first (#18) is verified. The second (#29, 116 items) was code-only and not verified on a device; its
  follow-ups are in `scripts/ralph/qa/name-polish-2/SUMMARY.md`.
- **Waiting on the owner:**
  1. Turn off the invite-only sign-up hook when sign-ups should open (see Sign-in above).
  2. `NAMES_AI_IP_SALT` in Vercel (the AI search falls back to the service key to hash IPs and guest device ids), and the
     live AI test (`tests/names/aiDeck.live.test.ts`, needs `ANTHROPIC_API_KEY`).
  3. A real-phone check (`docs/names-pwa/SETUP.md` §13), including the AI search as a guest and signed in.
  4. The 26 decisions from the first polish run, if still open (`scripts/ralph/qa/name-polish/owner-decisions.md`).
  5. Apply migration 0015 (analytics views; paste file in the SQL editor) and open `/names?internal=1` on your own browsers.
  6. Lawyer review of the legal drafts (`src/content/names-legal/`, still `LEGAL_DRAFT`).
- **Next:** open sign-ups to a small beta and watch the survey and analytics. After that, work returns to the Nest app
  (paused since 2026-11-04); its status is in pregnancy-manager `docs/prd/migration/HANDOFF.md` §0.

The old Ken PWA that lived here was removed in November 2026; it is in git history before that change.
The Nest app and its database live in https://github.com/kirilreznik/pregnancy-manager.

```bash
npm ci
npm run names:data   # once: builds public/names/data/ for /names
npm run dev
npm test
npm run lint
```
