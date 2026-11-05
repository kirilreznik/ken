# Name swiper PWA (`/names`)

## Design tokens

`src/styles/nest-tokens.css` is generated from `docs/names-pwa/brand/tokens.json` by `scripts/build-nest-tokens.mjs`. **Never edit it by hand**: change the tokens (or the glass and scrim values at the top of the script) and run

```sh
npm run tokens:css
```

The file defines every value as a `--nest-*` CSS variable on `:root` and exposes them to Tailwind 4 through `@theme` (`bg-ink`, `text-stone`, `rounded-lg`, `shadow-card`, `text-title`, `font-nest`, …). It is imported once, from `src/app/names/layout.tsx`; the landing page doesn't load it. `tests/nest-tokens.test.ts` checks the generated file against `tokens.json`.

## Performance

Measured 2026-11-05 on a local production build (`next build && next start -p 3100`, Next 16.3.8 Turbopack), Playwright Chromium, 390 × 844 at DPR 3, signed in with a full deck, empty HTTP cache, no service worker. Script: `scripts/ralph/qa/names-pwa/shots/us072-perf.mjs [port] [--cpu N]` (gitignored QA helper).

Next 16 no longer prints "First Load JS" in `next build` output (see the Next 16 upgrade guide), so the number below is what the browser actually downloads for `/names`.

| What | Result |
| --- | --- |
| `/names` JS on first load | 16 files, 267 KB compressed (largest chunks 70, 70 and 43 KB) |
| All same-origin bytes on first load | 547 KB compressed (JS, CSS, fonts, data, background) |
| Names data | `manifest.json` 0.4 KB, `content.<hash>.json` 1.8 KB, `names.<hash>.json` 185 KB gzip (1.0 MB raw); each fetched once per page load, kept in memory across in-app navigation |
| Data on reload | hashed files from the HTTP cache with no request (`Cache-Control: public, max-age=31536000, immutable`, set in `next.config.ts`); only `manifest.json` revalidates. With the service worker, from its cache |
| Background photo | `next/image`, `sizes="100vw"`, `priority`, blur placeholder; served at the 415 × 900 source size (25 KB webp) |
| FCP / LCP, cold | 104–180 ms / 490–1070 ms (no throttle); 350–530 ms / 940–960 ms (4× CPU) |
| LCP, warm (service worker) | 290–380 ms |
| CLS on the swipe screen | 0.0000 on load, after a reload, with the worker, and through four swipes (layout-shift entries without recent input) |

Not changed: the swipe screen loads the full CBS `names.json` (185 KB gzip) although it shows ten cards: each card's popularity rank is computed across all names, and the lists (custom names, match rows) read every name's births from the same in-memory load. Precomputing ranks into the content file would cut the swipe screen's first load but adds a second copy of the data. The background photos are 415 px wide, so on a DPR 3 phone they're upscaled (soft, but they sit behind a blur/scrim).
