# Names PWA: QA bugs

One entry per bug, newest last. Written by `US-QA{N}-{X}` stories; fixed by `US-FIX{N}`.

| ID | Cycle | Story | Screen | Severity | Status | Summary |
|---|---|---|---|---|---|---|
| NP-BUG-001 | 1 | US-QA1-A | welcome | low | fixed | Inline links on welcome are 18–20 px tall (< 44 px touch target) |
| NP-BUG-002 | 1 | US-QA1-C | swipe (`/names`) | medium | fixed | At 200% zoom the card is ~57 px tall and the header/action rows overflow sideways |
| NP-BUG-003 | 1 | US-QA1-C | swipe (`/names`) | low | fixed | Peeking cards' names overlap each other and show through the glass card |
| NP-BUG-004 | 1 | US-QA1-E | swipe (`/names`) | low | fixed | With reduced transparency the near back card stays 30% white instead of solid |
| NP-BUG-005 | 1 | US-QA1-H | swipe, lists | medium | fixed | A screen opened while solo never learns a partner joined: no match sheet, no "התאמות" until a reload |
| NP-BUG-006 | 1 | US-QA1-I | duel, lists | low | fixed | On a device with no votes cache, the duel flashes "לדו־קרב צריך לפחות שני שמות" (and lists "שמרתי · 0") for ~100 ms before the real list |
| NP-BUG-007 | 1 | US-QA1-J | privacy, terms | low | fixed | The contact email link on both legal pages is 154 × 20 px (< 44 px touch target) |
| NP-BUG-008 | 1 | US-QA1-K | manifest, service worker | low | fixed | Manifest `scope` and worker scope are `/names`, not FR-W26/W28's `/names/`; the deviation is only in story notes, not in §3 |
| NP-BUG-009 | 1 | US-QA1-K | intro, welcome (offline) | medium | fixed | Offline, the precached `/names/intro` (and `/names/welcome` when signed in) crash to "משהו השתבש" with a ChunkLoadError: the HTML is precached, its route JS isn't |
| NP-BUG-010 | 1 | US-QA1-K | welcome → sign-in/email (offline) | low | fixed | Signed out and offline, "כניסה עם קוד במייל" lands on Chrome's offline error page instead of the email screen with "הכניסה צריכה חיבור" |
| NP-BUG-011 | 1 | US-QA1-L | background sheet | medium | fixed | Tab from the selected background option leaves the sheet: focus lands on the page body behind it once per cycle |
| NP-BUG-012 | 1 | US-QA1-L | lists, intro, privacy, terms | medium | fixed | At 200% zoom (195 px) the lists header covers its title and cuts off "הוספת שם"; intro and the legal pages scroll sideways |

### NP-BUG-001: welcome inline links below the 44 px touch target

- **Cycle found:** 1 · **QA story:** US-QA1-A · **Screen:** `/names/welcome` (and `/names/welcome?closed=1`) · **Viewport:** 390 × 844
- **Steps:** prod build on 3100, fresh profile, open `/names/welcome`; measure link boxes (`shots/qa1-a-targets.mjs`). Also open `/names/welcome?closed=1`.
- **Expected:** every touch target ≥ 44 × 44 px (PRD §8 Accessibility: "touch targets ≥ 44 × 44 px").
- **Actual:** "תנאי השימוש" 72 × 18 px and "מדיניות הפרטיות" 87 × 18 px in the legal line, separated only by "ו", so they are easy to mis-tap; on `?closed=1` the notice's "להשארת אימייל" link is 94 × 20 px. (WCAG 2.2's inline-link exception would allow it, but §8 sets 44 px with no exception.) Every other control on welcome, email steps 1–2 and the callback error is ≥ 44 px.
- **Screenshot:** `scripts/ralph/qa/names-pwa/shots/qa1-a-welcome-390.png`, `shots/qa1-a-closed.png`
- **Status:** fixed
- **Fix note:** the legal links on welcome and the closed notice's link are `-my-3 inline-flex min-h-11` (44 px tall, same line spacing); verified with `shots/fix1-check.mjs` on prod 3100 (`shots/fix1-welcome-closed.png`).
- **Cycle fixed:** fixed in cycle 1

### NP-BUG-002: at 200% zoom the swipe card is a 57 px strip and the page scrolls sideways

- **Cycle found:** 1 · **QA story:** US-QA1-C · **Screen:** `/names` (swipe) · **Viewport:** 195 × 422 CSS px (a 390 × 844 phone at 200% zoom)
- **Steps:** prod build on 3100, user 1 onboarded, intro seen, votes wiped; open `/names` at 195 × 422 (`shots/qa1-c.mjs`, `shots/qa1-c-overflow.mjs`).
- **Expected:** checklist C / FR-W12: long content at 200% zoom scrolls inside the card and the buttons stay reachable, without the page itself overflowing sideways (PRD §8 accessibility; WCAG 1.4.4/1.4.10).
- **Actual:** the card does scroll inside itself (scrollHeight 566 in a 55 px client box), but only 57 px of it is visible (top 205 – bottom 262): the header, chips, action row and footer take the rest of the 422 px, so reading a card means scrolling a 2-line window. The document is 257 px wide in a 195 px viewport: the "השמות שלי" counter link (left −48 px), the "שמירה" button (right edge 257 px) and the "דילוג" wrapper (left −62 px) are outside the screen, and the header title wraps to two lines ("בחירת / שם") under the icon buttons. All three action buttons can still be clicked (keep advanced the deck), and at 320 × 568 there is no overflow (card 279 px visible).
- **Screenshot:** `scripts/ralph/qa/names-pwa/shots/qa1-c-zoom200.png` (320 px for comparison: `shots/qa1-c-zoom320.png`)
- **Status:** fixed
- **Seen again in cycle 1** (US-QA1-L, `shots/qa1-l.mjs`): `/names` at 195 × 422 is 257 px wide, "השמות שלי: 3 נשמרו" at −48 px, "שמירה לרשימה" to 257 px, "דילוג, לא בשבילנו" at −62 px. Every sheet and the skip menu opened over the swipe screen (filters, background, about, report, match) inherits the 257 px page width. Screenshot `shots/qa1-l-z200-names.png`.
- **Fix note:** below 320 px (`max-[20rem]:`) the swipe screen stops fitting itself into 100dvh: the page scrolls vertically, the card area has a 400 px minimum, the header and action rows wrap, the title keeps one line. 195 × 422: page 195 px wide, nothing off screen, card readable; 320 and 390 unchanged; verified with `shots/fix1-check.mjs` on prod 3100 (`shots/fix1-z200-names.png`).
- **Cycle fixed:** fixed in cycle 1

### NP-BUG-003: peeking cards' names overlap and show through the glass card

- **Cycle found:** 1 · **QA story:** US-QA1-C · **Screen:** `/names` (swipe, fabric background) · **Viewport:** 390 × 844
- **Steps:** prod build on 3100, user 1, open `/names` with at least 3 cards left; look at the bottom edge of the card stack (zoomed crop `shots/qa1-c-peek-crop.png`).
- **Expected:** checklist C: the peeking cards show the next two names, each readable at its own card's bottom edge (the demo's `.nd-back`/`.nd-back.n1`: the near name sits ~14 px above the far one, both below the front card). Board 8 shows the stack under the glass card with no text bleeding through it.
- **Actual:** the near name ("תמר", `text-card-title`, `pb-3` on a back card inset 14 px from the bottom) and the far name ("אריאל", `text-peek`, `pb-3.5`, bottom 0) are only ~12 px apart vertically, so the two words overlap each other. The near name also sits above the front card's bottom edge and is visible through the translucent glass card, just under "על הנתונים". The DOM order is right (C5 checks pass: near = next card, far = the one after), but neither name is readable.
- **Screenshot:** `scripts/ralph/qa/names-pwa/shots/qa1-c-card-2.png`, `shots/qa1-c-peek-crop.png`
- **Status:** fixed
- **Fix note:** the peeking strips are taller than a line now (near card 22 px below the front card, far 44 px; the boards' 14/28 px strips can't hold a name) and the names use `leading-none`, so each name sits in its own strip below the card above it (deliberate 16 px difference from Main.dc.html); verified with `shots/fix1-check.mjs` on prod 3100 (`shots/fix1-peek-crop.png`).
- **Cycle fixed:** fixed in cycle 1

### NP-BUG-004: with reduced transparency the near back card stays translucent

- **Cycle found:** 1 · **QA story:** US-QA1-E · **Screen:** `/names` (swipe) on "בדים", "מחברת" and "חדר תינוק" · **Viewport:** 390 × 844
- **Steps:** prod build on 3100, user 1, background set to a photo; emulate `prefers-reduced-transparency: reduce` (CDP `Emulation.setEmulatedMedia`); open `/names` with at least 2 cards left; read the computed background of every `.names-glass` / `.names-glass-soft` element (`shots/qa1-e.mjs`, section E4).
- **Expected:** checklist E / PRD §3 glass fallback: under reduced transparency the cards are solid white (`--nest-surface`) with no blur.
- **Actual:** the front card, the far back card, chips, header and action buttons all turn `rgb(255, 255, 255)` with `backdrop-filter: none`, but the near back card (`.names-back-near`) stays `rgba(255, 255, 255, 0.3)` with no blur: a see-through sheet with the photo showing through its edges under the front card. Cause: `.nest-names .names-back-near { background-color: var(--nest-white-30) }` in `src/app/names/names.css` (line ~265) is not overridden in the `@media (prefers-reduced-transparency: reduce)` block (nor, likely, in the `@supports not (backdrop-filter…)` block).
- **Screenshot:** `scripts/ralph/qa/names-pwa/shots/qa1-e-rt-fabric.png` (also `qa1-e-rt-notebook.png`, `qa1-e-rt-nursery.png`)
- **Status:** fixed
- **Fix note:** `.names-back-near` turns `--nest-surface` under `prefers-reduced-transparency: reduce` and without backdrop-filter support (names.css); verified with `shots/fix1-check.mjs` on prod 3100 (`shots/fix1-rt-fabric.png`).
- **Cycle fixed:** fixed in cycle 1

### NP-BUG-005: a screen opened while solo never learns that a partner joined

- **Cycle found:** 1 · **QA story:** US-QA1-H · **Screen:** `/names` (swipe) and `/names/lists` · **Viewport:** 390 × 844
- **Steps:** prod build on 3100. User 1 is solo. (a) User 1 opens `/names/lists` and leaves it open; user 2 joins with user 1's invite (through the UI). (b) User 1 opens `/names` while solo; user 2 joins over REST (`names_invite` / `names_join`); user 1 taps "שמירה" on the top card and user 2 keeps the same name over REST. Wait 65 s, then dispatch `visibilitychange` and `focus`. Scripts: `shots/qa1-h.mjs` (H2), `shots/qa1-h-stale.mjs`.
- **Expected:** checklist H / FR-W19, W20: once user 2 joins, "התאמות" appears for both, and the match sheet shows on user 1's swipe screen within 60 s (PRD 3.2.10: Realtime plus a refetch on focus).
- **Actual:** (a) user 1's open lists screen keeps "שמרתי · n | דו־קרב" for 60 s and after a focus event. "התאמות" shows only after a reload. (b) the match sheet never shows on the open swipe screen, not after 65 s and not after focus or visibility events. It shows right away after a reload. Opened after the join, the same screen gets the sheet in 1.2 s. Cause: `useSpace` reads the member list once (and from `lastSpace`), and `useMatches(…, isShared, …)` only creates the matches store when `isShared` is true. Nothing refreshes the members on focus or through Realtime, except the invite screen's `visibilitychange` handler. So a device that loaded while solo gets no matches until a reload. This is the usual case: the inviter sends the link and keeps swiping.
- **Screenshot:** `scripts/ralph/qa/names-pwa/shots/qa1-h-stale-swipe.png` (swipe after 65 s, no sheet)
- **Status:** fixed
- **Fix note:** while solo, `useSpace` re-reads the members on focus, on visibility and every 60 s (the matches cadence), so an open screen turns shared and `useMatches` starts. Lists showed "התאמות" 0.5 s after a focus event; the swipe screen got the match sheet without a reload (`shots/qa1-h-stale.mjs`: 57 s with no focus event); verified with `shots/fix1-check.mjs` on prod 3100 (`shots/fix1-lists-joined.png`).
- **Cycle fixed:** fixed in cycle 1

### NP-BUG-006: with no votes cache, the duel and lists show "no names" before the real list loads

- **Cycle found:** 1 · **QA story:** US-QA1-I · **Screen:** `/names/lists?tab=duel` (and `/names/lists`) · **Viewport:** 390 × 844
- **Steps:** prod build on 3100. User 1 has 6 kept names on the server. In a fresh browser profile (no IndexedDB votes cache, as on a new device or right after signing in), open `/names/lists?tab=duel&from=saved` and watch the DOM from load (`shots/qa1-i-flash.mjs`, MutationObserver).
- **Expected:** checklist I / FR-W21: "fewer than 2 names explains" only when the list really has fewer than 2 names. Until the votes are read, the screen shows its loading state (it has one: the `aria-busy` placeholder). PRD §11.2: wrong data blocks.
- **Actual:** 3 of 3 cold loads go loading (73 ms), then "לדו־קרב צריך לפחות שני שמות ברשימה." with the "לבחירת שמות" link (~320–430 ms), then the duel pair ~100 ms later. A tap in that window lands on "לבחירת שמות" and leaves the duel. Screen readers can also read the wrong message. `/names/lists` does the same: it shows "שמרתי · 0" with the empty state, then the rows. A warm reload (cache present) goes straight from loading to the pair. Cause: `createVoteStore` sets `ready = true` right after the (possibly empty) cache read and before `readServer()` (`src/lib/names/voteStore.ts` ~l. 474), and ListsScreen/DuelScreen treat `state.ready` as "votes loaded". The QA script's first `waitDuel` matched the flash, so its first pass made no pick (`shots/qa1-i.mjs` I1b now waits for the pair).
- **Screenshot:** `scripts/ralph/qa/names-pwa/shots/qa1-i-flash.png`
- **Status:** fixed
- **Fix note:** with no cached copy on the device the vote store stays not ready until the server read finishes (`voteStore.ts`, new Vitest case). `shots/qa1-i-flash.mjs`: 3/3 cold duel loads go loading → pair, the saved tab loading → rows, no "צריך לפחות שני שמות" or "שמרתי · 0" in between.
- **Cycle fixed:** fixed in cycle 1

### NP-BUG-007: the contact email link on the legal pages is below the 44 px touch target

- **Cycle found:** 1 · **QA story:** US-QA1-J · **Screen:** `/names/privacy`, `/names/terms` · **Viewport:** 390 × 844
- **Steps:** prod build on 3100, signed out. Open `/names/privacy` and `/names/terms` and measure every link and button in `main` (`shots/qa1-j.mjs`, legal block).
- **Expected:** PRD §8 Accessibility: touch targets ≥ 44 × 44 px. The same class of issue as NP-BUG-001 (welcome), on a different screen.
- **Actual:** the `mailto:` link to the contact address (from `PREGNANCY_CONTACT_EMAIL`) is an inline link in a paragraph, 154 × 20 px. Privacy has it twice ("הזכויות שלך" and "שינויים ויצירת קשר"), terms once ("יצירת קשר"). Every other control on both pages (the "חזרה" button) is ≥ 44 px. axe reports nothing because WCAG 2.2 exempts inline links, but §8 has no exception. The about page's source links use `-my-1.5 min-h-11 inline-flex` to get 44 px without changing the spacing; the same would work here.
- **Screenshot:** `scripts/ralph/qa/names-pwa/shots/qa1-j-privacy-390.png` (the underlined address at the bottom of the "הזכויות שלך" and "שינויים ויצירת קשר" sections), `shots/qa1-j-terms-390.png`
- **Status:** fixed
- **Fix note:** the contact `mailto:` links are `-my-3 inline-flex min-h-11` with `max-w-full break-all` (44 px tall, and the address can break at 200% zoom); verified with `shots/fix1-check.mjs` on prod 3100 (`shots/fix1-privacy.png`).
- **Cycle fixed:** fixed in cycle 1

### NP-BUG-008: manifest and worker scope are `/names`, not the `/names/` FR-W26 and FR-W28 require

- **Cycle found:** 1 · **QA story:** US-QA1-K · **Screen:** `/names/manifest.webmanifest`, service worker registration · **Viewport:** n/a
- **Steps:** prod build on 3100; fetch `/names/manifest.webmanifest`; open `/names` signed in and read `navigator.serviceWorker.ready` (`shots/qa1-k.mjs`, K1/K2).
- **Expected:** FR-W26 `scope` "/names/"; FR-W28 "registered … with `scope: '/names/'`"; checklist K "The worker is registered with scope `/names/`". §3.1.1 also says "scoped to `/names/`".
- **Actual:** manifest `scope` is "/names" and the worker's scope is `http://localhost:3100/names` (served with `Service-Worker-Allowed: /names`). The reason is sound and recorded in the notes of US-063 and US-064: `/names` (the swipe screen, and `start_url` "/names?source=pwa") is outside a "/names/" scope, so with the spec's value the main screen would be neither installable-in-scope nor offline. But §11.2 counts a difference from an FR that §3 doesn't explain, and §3 still says "/names/". Side effect of "/names": the scope also prefix-matches any future `/names…` path outside the app (e.g. `/names-old`). Everything else in K1/K2 passes: Chromium reports no manifest or installability errors, one registration, `public/sw.js` unchanged.
- **Suggested fix:** record the decision in the PRD (§3.2, and FR-W26/W28 / checklist K) rather than change the code; the spec's value would break offline `/names`.
- **Screenshot:** n/a (values from the script output)
- **Status:** fixed
- **Fix note:** owner decision recorded: PRD §3.2.22 says the scope is `/names` and why; FR-W26, FR-W28 and checklist K now point to it (docs/names-pwa/README.md already said `/names`). No code change.
- **Cycle fixed:** fixed in cycle 1

### NP-BUG-009: offline, the precached intro (and the signed-in welcome) crash with a ChunkLoadError

- **Cycle found:** 1 · **QA story:** US-QA1-K · **Screen:** `/names/intro`, `/names/welcome` · **Viewport:** 390 × 844
- **Steps:** prod build on 3100, fresh profile, user 1 onboarded, intro seen. Open `/names` online once and let the worker take control (reload). Go offline (`context.setOffline(true)`) and open `/names/intro` (`shots/qa1-k-offline-pages.mjs`, `qa1-k-probe2.mjs`, `qa1-k-probe3.mjs`). Same with `/names/welcome` while signed in.
- **Expected:** FR-W28 precaches the app shell routes `/names`, `/names/welcome`, `/names/lists`, `/names/intro` so they open offline (FR-W29 "the app opens"). The welcome, signed in, sends to `/names` as it does online.
- **Actual:** the route HTML comes from the precache, but the page's own JS chunk (e.g. `/_next/static/chunks/3rud-qj4yb4f2.js` for welcome) was never fetched online, so it isn't in the cache: `ChunkLoadError: Failed to load chunk …`, and the error boundary shows "משהו השתבש / אפשר לנסות שוב, או לחזור לבחירת שם." "ניסיון חוזר" fails the same way. `/names/lists` happens to work (its chunks are shared with `/names`). Intro is reached offline when a device has no `introSeen` pref (it is per device and cleared on sign-out). The worker only caches `/_next/static/*` on use; precaching each shell route's chunks at install (e.g. read the `<script src>` list from each precached HTML) would close the gap. A precached route that crashes offline is worse than not precaching it.
- **Screenshot:** `scripts/ralph/qa/names-pwa/shots/qa1-k-offline-unvisited-intro.png`, `shots/qa1-k-offline-in-welcome-error.png`
- **Status:** fixed
- **Fix note:** the worker (VERSION v2) precaches every `/_next/static/*` file each shell page's HTML references, including chunks named in the RSC payload. Offline, a never-visited `/names/intro` opens with no errors and the signed-in welcome goes on to `/names`; verified with `shots/fix1-check.mjs` on prod 3100 (`shots/fix1-offline-intro.png`), Vitest case added.
- **Cycle fixed:** fixed in cycle 1

### NP-BUG-010: offline, "כניסה עם קוד במייל" opens Chrome's offline page instead of the email screen

- **Cycle found:** 1 · **QA story:** US-QA1-K · **Screen:** `/names/welcome` → `/names/sign-in/email` · **Viewport:** 390 × 844
- **Steps:** prod build on 3100, fresh profile, signed out. Open `/names/welcome` online, let the worker take control (reload). Go offline, reload welcome (it opens, with the "אין חיבור לאינטרנט. הכניסה צריכה חיבור." note), tap "כניסה עם קוד במייל" (`shots/qa1-k-probe4.mjs`).
- **Expected:** FR-W29 "Sign-in screens say a connection is needed": the email screen opens and shows the same note (as it does when it goes offline after loading, US-065).
- **Actual:** Next logs "Failed to fetch RSC payload for …/names/sign-in/email. Falling back to browser navigation", the navigation goes to the worker, `/names/sign-in/email` isn't precached and has no cached copy, and the tab shows `chrome-error://chromewebdata/` (the browser's own offline page, `net::ERR_FAILED`). The worker has no offline fallback for uncached `/names*` navigations, so `/names/settings` opened offline without an earlier visit does the same. Either precache `/names/sign-in/email` (it is part of the signed-out shell) or serve a cached shell page as the navigation fallback.
- **Screenshot:** `scripts/ralph/qa/names-pwa/shots/qa1-k-offline-out-email-click.png` (blank: the error page)
- **Status:** fixed
- **Fix note:** `/names/sign-in/email` is precached, and a `/names` navigation with no cached copy gets the new `/names/offline` page ("אין חיבור לאינטרנט", link to /names) instead of the browser error. Offline signed out, "כניסה עם קוד במייל" opens the email screen with "הכניסה צריכה חיבור"; uncached `/names/settings` shows the offline page; verified with `shots/fix1-check.mjs` on prod 3100 (`shots/fix1-offline-email.png`, `shots/fix1-offline-settings.png`).
- **Cycle fixed:** fixed in cycle 1

### NP-BUG-011: Tab from the selected background option leaves the background sheet

- **Cycle found:** 1 · **QA story:** US-QA1-L · **Screen:** `/names?sheet=background` · **Viewport:** 390 × 844
- **Steps:** prod build on 3100, user 1 onboarded. Open `/names`, focus "בחירת רקע" and press Enter (or click it). Press Tab repeatedly (`shots/qa1-l.mjs` "focus stays inside sheet background", `shots/qa1-l-probe.mjs`).
- **Expected:** PRD §8 Accessibility: "dialogs and sheets trap focus". Tab cycles סגירה → the selected option → back to סגירה without leaving the sheet, as in every other sheet (filters, about, report, add-name, match, install, delete dialog all pass the same walk).
- **Actual:** the order is "סגירה" (drag handle) → "סגירה" (X) → the selected option ("בדים") → **`<body>`** (the page behind the sheet; `document.activeElement` is body, outside `[role=dialog]`) → "סגירה" … , once per round. Shift+Tab from "סגירה" goes to "תמונה משלי", a `tabIndex=-1` option. A screen reader loses its place in the sheet on every round. Cause: `useModal`'s `FOCUSABLE` selector (`src/components/names/ui/useModal.ts` l. 5–6) includes `button:not([disabled])`, so it counts the radiogroup's roving `tabIndex={-1}` options (`BackgroundSheet.tsx` l. 186) as tab stops. Its `last` is "תמונה משלי" (never focused by Tab), so Tab from the real last stop isn't wrapped and the browser moves focus out of the panel. The same happens in any sheet whose last DOM button has `tabIndex=-1`.
- **Screenshot:** n/a (focus order from the script output; the sheet: `shots/qa1-l-bg-focus.png`)
- **Status:** fixed
- **Fix note:** `useModal` only counts elements with `tabIndex >= 0` as Tab stops, so roving `tabIndex=-1` radios no longer become `last`. `shots/qa1-l-probe.mjs`: סגירה → סגירה → בדים → סגירה … with focus always inside the sheet, both click- and Enter-opened; us070-keyboard 19/19.
- **Cycle fixed:** fixed in cycle 1

### NP-BUG-012: at 200% zoom the lists header hides its title and cuts off "הוספת שם"; intro and legal pages scroll sideways

- **Cycle found:** 1 · **QA story:** US-QA1-L · **Screen:** `/names/lists` (both tabs), `/names/intro`, `/names/privacy`, `/names/terms` · **Viewport:** 195 × 422 CSS px (a 390 × 844 phone at 200% zoom)
- **Steps:** prod build on 3100, user 1 onboarded; open each route at 195 × 422 and compare `scrollWidth` with the viewport and every control's box (`shots/qa1-l.mjs`, `shots/qa1-l-probe.mjs`, `shots/qa1-l-probe-legal.mjs`). Same class as NP-BUG-002 (swipe), on other screens.
- **Expected:** checklist L: "200% zoom and 320 px width: no horizontal scroll, nothing cut off" (WCAG 1.4.4 / 1.4.10). At 320 × 568 and at 640 px (1280 at 200%) every route passes.
- **Actual:** `/names/lists` and `?tab=matches` are 222 px wide: the header's invite button and "הוספת שם" button sit on top of the "השמות שלי" title (only fragments of it show) and "הוספת שם" starts at −27 px, off screen. `/names/intro` is 214 px wide: the tilted preview cards (`absolute start-8.5 … w-37.5 -rotate-8` and `start-10 … rotate-4`) reach −16/−19 px. `/names/privacy` and `/names/terms` are 198 px wide (3 px of sideways scroll; no element box sticks out, most likely the unbreakable `mailto:` address in the narrow card). The duel, hidden, settings, invite, join, welcome, sign-in, about, 404 and goodbye pages fit at 195 px.
- **Screenshot:** `scripts/ralph/qa/names-pwa/shots/qa1-l-z200-probe-names-lists.png`, `shots/qa1-l-z200-probe-names-intro.png`, `shots/qa1-l-z200-names-privacy.png`
- **Status:** fixed
- **Fix note:** below 320 px the lists header wraps (the title keeps its width instead of shrinking under the buttons) and the intro illustration scales to 75%; the legal pages' address can break. At 195 × 422 lists (saved, duel), intro, privacy and terms are 195 px wide with nothing off screen or covered; verified with `shots/fix1-check.mjs` on prod 3100 (`shots/fix1-z200-names-lists.png`, `-names-intro.png`, `-names-privacy.png`); us070-axe 92/92.
- **Cycle fixed:** fixed in cycle 1
