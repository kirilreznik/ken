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

The old Ken PWA that lived here was removed in November 2026; it is in git history before that change.
The Nest app and its database live in https://github.com/kirilreznik/pregnancy-manager.

```bash
npm ci
npm run names:data   # once: builds public/names/data/ for /names
npm run dev
npm test
npm run lint
```
