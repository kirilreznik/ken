# Names data

Copied from `kirilreznik/pregnancy-manager` `assets/data/` (main @ 794d063) on 2026-11-04. That repo's `scripts/build-names.mjs` builds `names.json`; regenerate there and copy here, don't edit by hand.

- `names.json`: 19,884 names from CBS release 391/2025 (newborn names 1949–2024) via the CC0 package babynamesIL. Per name: births by sex since 1949 (`m`, `f`), sectors (`s`), births per year 2000–2024 (`y`, when present). About 1 MB raw, about 190 KB gzipped. Attribution to CBS is required (see `tasks/prd-names-pwa.md`, "על הנתונים").
- `name-content.json`: card content (niqqud, intro, Bible, people), built from `content-src/` by `scripts/names-content/build-content.mjs` (E16b). Do not edit by hand; see `content-src/README.md`.

The PWA build copies these into `public/names/data/` with a content hash in the file name (story US-010).
