# Name swiper PWA (`/names`)

## Design tokens

`src/styles/nest-tokens.css` is generated from `docs/names-pwa/brand/tokens.json` by `scripts/build-nest-tokens.mjs`. **Never edit it by hand**: change the tokens (or the glass and scrim values at the top of the script) and run

```sh
npm run tokens:css
```

The file defines every value as a `--nest-*` CSS variable on `:root` and exposes them to Tailwind 4 through `@theme` (`bg-ink`, `text-stone`, `rounded-lg`, `shadow-card`, `text-title`, `font-nest`, …). It is imported once, from `src/app/names/layout.tsx`; the landing page doesn't load it. `tests/nest-tokens.test.ts` checks the generated file against `tokens.json`.
