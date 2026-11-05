# Name swiper PWA (`/names`)

A Hebrew, installable web app for choosing a baby name, alone or with a partner: swipe the cards, keep the names you like, see the names everyone in the space kept. It runs entirely in the browser against the shared Nest Supabase project ("Nest (EU)"). The plan and its decisions are in [`tasks/prd-names-pwa.md`](../../tasks/prd-names-pwa.md); the product spec (cards, deck, lists, duel) is [`E16-name-swipe-spec.md`](E16-name-swipe-spec.md); the owner's account setup is [`SETUP.md`](SETUP.md). Design: `design/screens/*.png` and `design/source/*.dc.html`, brand in `brand/`.

## Code layout

| Where | What |
| --- | --- |
| `src/app/names/` | routes (all client components except the legal pages and the manifest route) |
| `src/app/api/names/account/` | `DELETE` account deletion, the only server code that talks to Supabase |
| `src/lib/names/` | pure logic, data loading, Supabase, local storage; tested in `tests/names/` |
| `src/lib/names/server/` | server-only: the service-role client (`admin.ts`) and the deletion handler |
| `src/components/names/` | UI; shared primitives (`Glass`, `Button`, `BottomSheet`, `Dialog`, toasts) in `ui/` |
| `src/content/names-legal/` | privacy policy and terms text, with their versions in `versions.ts` |
| `data/names/` | source data: `names.json` (CBS births) and `name-content.json` (card content), see its README |
| `public/names/` | `sw.js`, icons, brand SVGs; `data/` is generated at build time (gitignored) |
| `src/styles/nest-tokens.css` | generated design tokens (below) |

## Routes

Every route lives under `src/app/names/`. Signed-out visitors to an app route go to `/names/welcome`; signed-in users who haven't accepted the terms go to `/names/onboarding` (`RequireAuth` in `src/components/names/AuthGuard.tsx`).

| Path | Screen | Needs a session |
| --- | --- | --- |
| `/names` | swipe deck (board 2/8) | yes |
| `/names/welcome` | preview card, Google and email sign-in | no (signed-in users are sent on) |
| `/names/sign-in/email` | email, then the 6-digit code | no |
| `/names/auth/callback` | Google (PKCE) return, then routes on | — |
| `/names/onboarding` | display name, 18+, terms, updates opt-in | yes |
| `/names/intro` | one-time intro, once per device | yes |
| `/names/lists` | `?tab=saved` / `matches` / `duel` | yes |
| `/names/hidden` | names hidden from the deck | yes |
| `/names/invite` | make and share an invite link | yes |
| `/names/join/[code]` | accept an invite; signed out, the code is kept for after sign-in | no to open, yes to join |
| `/names/settings` | surname, members, background, sign-out, account deletion | yes |
| `/names/goodbye` | after account deletion | — |
| `/names/offline` | served by the service worker for a `/names` page that isn't cached yet | no |
| `/names/about`, `/names/privacy`, `/names/terms` | about the data, legal pages (server-rendered with the operator and contact) | no |
| `/names/manifest.webmanifest` | web app manifest (route handler) | no |

Anything else under `/names/` reaches `src/app/names/not-found.tsx` through the catch-all `[...missing]`. Only welcome, about, privacy and terms are indexable; every other route sets `robots: noindex`.

Filters, background, about, match, report, install and add-name are **sheets** over the current screen, opened with `?sheet=<name>` so Back closes them (`src/lib/names/urlLayer.ts`, `SHEETS`); dialogs use `?dialog=`.

## Auth

- One browser client, `getSupabase()` in `src/lib/names/supabase.ts`: `flowType: 'pkce'`, session in `localStorage` under `nest-names-auth`, `detectSessionInUrl`. It is null on the server and when the public variables are missing; the names layout then renders "השירות לא מוגדר" and nothing else. No SSR auth, no cookies.
- `AuthProvider` (`src/components/names/AuthProvider.tsx`) exposes `useAuth()`: session, user, loading, `expired` (the refresh token was rejected, shown as "צריך להיכנס שוב") and `signOut()`.
- **Google:** `signInWithOAuth` with `redirectTo` = `NEXT_PUBLIC_SITE_URL` (or the current origin) + `/names/auth/callback`, plus `?join=` when an invite is pending.
- **Email code:** `signInWithOtp({ shouldCreateUser: true })`, then `verifyOtp({ type: 'email' })` with 6 digits. Turnstile is rendered and its token passed only when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set.
- **Sign-ups switch:** while "Allow new users to sign up" is off in Supabase, a new person gets `/names/welcome?closed=1` with the waitlist link. Error mapping is in `src/lib/names/authErrors.ts`; raw error messages are never shown.
- **Where to go next** (`nextRoute` in `src/lib/names/routing.ts`): onboarding until `user_metadata.terms_accepted_at` is set, then a pending invite, then the intro (once per device), then the swipe screen.
- **Onboarding** writes `display_name`, `age_confirmed_at`, `terms_version`, `privacy_version`, `terms_accepted_at`, `updates_opt_in(_at)` and `signup_source: 'names-pwa'` to `user_metadata` with `auth.updateUser`.
- **Sign-out** clears this user's prefs, own photo, vote cache and outbox, cached matches and space cache (`clearLocalData` in `src/lib/names/auth.ts`). **Account deletion** calls `DELETE /api/names/account` with the access token (the route verifies it, runs `prepare_account_deletion` and deletes the user; 204/401/429/500), then signs out and clears the same data.

## Data flow

- **Static names data.** `scripts/build-names-data.mjs` (runs as `prebuild` and with `npm run names:data`) copies `data/names/names.json` and `name-content.json` into `public/names/data/` as content-hashed files plus `manifest.json`. `src/lib/names/data.ts` reads the manifest, then the hashed files (cached forever, see `next.config.ts`). `useCards()` builds the deck's cards, `useNameStats()` gives every CBS name's births (list rows). Server pages (welcome preview card) import the JSON directly through `staticCards()`.
- **Space.** On every start after onboarding, `useSpace()` calls `rpc('names_space', { p_display_name })`, which returns the active space or creates a solo names space. The last space id is kept per device so the app opens offline. `space_members` gives the member count (shared copy, whether the "התאמות" tab shows) and the member names in settings.
- **Votes** (`createVoteStore` in `src/lib/names/voteStore.ts`, used through `useVotes()`): read own `name_votes` rows (RLS: own rows only), cached in IndexedDB (`nest-names-votes`). Every swipe is applied locally at once and queued in the outbox (below). A Realtime subscription on own rows syncs other devices; Supabase doesn't send filtered DELETE events, so the store also re-reads on focus. Latest `updated_at` wins.
- **Matches** (`src/lib/names/matches.ts`, `useMatches()`): `rpc('name_matches', { p_space })`, cached in IndexedDB (`nest-names-matches`), refetched on focus, 2 s after an own vote changes and every 60 s while the swipe or lists screen is visible. A match not yet in the `seenMatches` pref opens the match sheet once. `name_matches` never returns skips, so nobody sees a partner's skips.
- **Invites.** `rpc('names_invite')` gives an 8-character code, shared as `{site}/names/join/{CODE}` (Web Share, else clipboard); valid 7 days, single use. `rpc('names_join', { p_code, p_display_name })` moves the joiner's solo votes into the shared space. A signed-out visitor's code waits in `sessionStorage` (`nest-names-join`) and the OAuth `?join=` param (`src/lib/names/join.ts`).
- **Local preferences** (surname, filters, background, intro seen, seen matches, duel state, …) live in `localStorage` as `nest-names:{userId}:{key}` (`src/lib/names/prefs.ts`). The own background photo is a resized JPEG in IndexedDB (`src/lib/names/photo.ts`). Surname and photo never leave the device.
- **Reports and errors** go to the `client-log` Edge Function (`src/lib/names/clientLog.ts`) with an area, message, path (invite codes stripped) and app version; never an email, name, surname, photo or vote. Vercel Analytics sees page views only, query strings stripped (`src/lib/names/analytics.ts`).

## Vote outbox

Each decision becomes an outbox item (`upsert` with the vote, or `delete` when undo removes a first vote) stored in IndexedDB with the cached votes, so it survives reloads and being offline. The store flushes the outbox **in order**, one item at a time, on `online`, on window focus, when the page becomes visible and every 30 s (`FLUSH_INTERVAL_MS`). Upserts go to `name_votes` on `(space_id, user_id, name)`. A failed item is retried with backoff (`backoffMs`); a newer change to the same name replaces a queued one (`enqueue`), and the local view is always the server state with the outbox applied on top (`applyOutbox`). The swipe footer shows the sync state (`syncStatusText` in `src/lib/names/offline.ts`).

## Service worker

`public/names/sw.js`, hand-written, no build step. `RegisterWorker` (in the names layout) registers it in production builds only, with scope `/names`; `next.config.ts` sends `Service-Worker-Allowed: /names` so the worker can control `/names` itself. It is separate from `public/sw.js`, the self-removing worker that clears the old Ken PWA.

- Precached on install: the shell pages (`/names`, welcome, lists, intro, sign-in/email, offline) and every `/_next/static/*` file their HTML references (scripts, CSS, and chunks named in the RSC payload), so a shell page never opened online still runs offline; the hashed data files named in `manifest.json`, the background photos, the Heebo fonts and the icons.
- Cache-first: `/_next/static/*`, `/_next/image`, `/landing/*`, `/names/data/*`, `/names/icons/*`, `/names/brand/*`.
- Network-first with cache fallback: `/names*` navigations (a page with no cached copy gets `/names/offline`) and `/names/data/manifest.json`.
- Never cached: `/api/*`, `/names/auth/callback`, other origins (Supabase), non-GET requests.
- Updates: a new worker waits; the page shows "עדכון זמין" with "רענון", which posts `SKIP_WAITING` (`watchForUpdates` in `src/lib/names/serviceWorker.ts`). **Bump `VERSION` in `sw.js` whenever its caching rules change**; activation deletes every cache of other versions.
- Test it on a production build (`npm run build && npm run start -- -p 3100`); `next dev` doesn't register it. `tests/names/serviceWorker.test.ts` runs the worker in `node:vm` with a stub Cache API.

Install prompts (Android `beforeinstallprompt`, iOS "add to home screen" instructions) are in `src/components/names/pwa/Install.tsx`.

## Environment variables

| Name | Where | Used by |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel, `.env.local` | browser client, `client-log` URL, server client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel, `.env.local` | browser client (publishable key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (Sensitive), `.env.local` | `/api/names/account` only, through `src/lib/names/server/admin.ts` (`server-only`) |
| `NEXT_PUBLIC_SITE_URL` | Vercel Production, `.env.local` | invite links, OAuth `redirectTo`; falls back to the current origin |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Vercel, optional | Turnstile on email sign-in when set |
| `PREGNANCY_OPERATOR_NAME`, `PREGNANCY_CONTACT_EMAIL` | Vercel, `.env.local` | legal pages, rendered at build time |
| `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` | set by Vercel | app version in client-log reports (`dev` locally) |
| `NAMES_QA_*` | `scripts/ralph/.env.test.local` | QA helpers only (SETUP §10) |

`NEXT_PUBLIC_*` values are inlined at build time: change them, rebuild. Without the Supabase pair the build and the landing still work and `/names` shows the unconfigured screen (try `NEXT_PUBLIC_SUPABASE_URL= NEXT_PUBLIC_SUPABASE_ANON_KEY= npm run build`).

## Running locally

```sh
npm ci                 # never a bare npm install (it drops @esbuild/* from the lockfile)
npm run names:data     # once on a fresh checkout: builds public/names/data/
npm run dev            # http://localhost:3000/names
npm test               # Vitest, TZ=Asia/Jerusalem
npm run lint && npx tsc --noEmit && npm run build
```

`.env.local` needs the variables above. Sign-in works on `localhost:3000` only if it is in the Supabase redirect URLs (SETUP §3.1). For the service worker, offline mode and install, use a production build on port 3100 and stop any old server on that port first.

`tests/names/designGuard.test.ts` fails `npm test` on hex/rgb colors, literal font sizes, physical `left`/`right` classes and unlabeled icon buttons in names code.

## QA helpers

In `scripts/ralph/qa/names-pwa/` (tracked; `shots/` and `.auth/` are gitignored). They read `scripts/ralph/.env.test.local` through `env.mjs` and never print its values.

- `node login.mjs <1|2|3>`: signs QA user N in over REST (admin `generate_link` + `verify`, no email sent) and writes a Playwright storageState to `.auth/userN.json` for ports 3000 and 3100.
- `node shot.mjs <path> <out.png> [--state N] [--viewport WxH] [--port P] [--reduced-motion] [--offline] [--bg x]`: a 390 × 844, `he-IL`, Asia/Jerusalem screenshot; bare file names land in `shots/`.
- `rest.mjs`: `signIn`, `signInSession`, `sessionFor`, `emailCode` (a real sign-in code without email), `votes`, `matches`, `namesSpace`, admin user get/update/delete, `createThrowawayUser`.
- `bugs.md`, `ux-insights.md`: QA cycle records.
- `shots/us070-axe.mjs` (axe on every route, sheet and dialog), `shots/us070-keyboard.mjs` (keyboard walk) and `shots/us072-perf.mjs` (load and CLS numbers) are local-only scripts kept in the gitignored `shots/`.

QA user 1 is stored un-onboarded: to shoot app pages, set its onboarding `user_metadata` with the admin API, log in again, and reset it afterwards (to clear a key, PUT it as `null`; metadata merges).

## Swapping the card content (E16b)

The deck is "the names that have content": `buildCards` (`src/lib/names/card.ts`) makes a card for each entry in `name-content.json` that also exists in `names.json`, in file order. To ship content for more (or all) names:

1. Replace `data/names/name-content.json`, keeping its shape: `{ "names": { "<name>": { "niqqud", "intro", "bible"?: { "text", "ref" }, "people": [{ "name", "what" }] } } }` (`NameContent` in `src/lib/names/types.ts`). Names must match `names.json` keys exactly; one without CBS births is dropped silently. Key order is the default deck order before the per-user shuffle.
2. Run `npm run names:data` (or just build): a new content hash means browsers and the service worker fetch the new file; nothing else needs a bump.
3. Keep `זיו` in the file, or change `PreviewCard.tsx`: the welcome screen's preview card is that name.
4. Update the tests that read the real file and assume ten names: `tests/names/deck.test.ts`, `filters.test.ts`, `card.test.ts`, `data.test.ts`, `sex.test.ts`, `a11y.test.ts`.
5. Watch the size. The content file is 1.8 KB for ten names and is loaded whole on the swipe screen and precached by the worker; for thousands of entries, split it or load it per card instead.

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
