# Nest site

The public site at https://nestjourney.app: the landing page and, soon, the name swiper PWA at `/names`.
Next.js 16 · React 19 · Tailwind 4. Deploys to Vercel from `main`.

- `/` (and `/pregnancy`): the landing page, a standalone HTML document from `src/lib/pregnancy-landing.mjs`
  with the name swipe demo from `src/lib/pregnancy-names-demo.mjs`. Waitlist sign-ups go to `/api/pregnancy-waitlist`.
- `public/sw.js`: a self-removing service worker that clears the old Ken PWA from phones that installed it.

The old Ken PWA that lived here was removed in November 2026; it is in git history before that change.
The Nest app and its database live in https://github.com/kirilreznik/pregnancy-manager.

```bash
npm install
npm run dev
npm test
npm run lint
```
