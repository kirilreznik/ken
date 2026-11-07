# Name detail sheet: UX insights

Non-blocking ideas found during QA, IDs `ND-UX-001` on, newest last. Never acted on in this run (PRD §11.1).

| ID | Cycle | Story | Browser | Screen | Idea |
|---|---|---|---|---|---|
| ND-UX-001 | 1 | US-QA1-B | sim-safari | name sheet, chart | A scroll that starts on the chart also shows a year tooltip |
| ND-UX-002 | 1 | US-QA1-C | webkit-iphone, sim-safari | name sheet, similar names | Root-sharing names read as "forms of the same name" |
| ND-UX-003 | 1 | US-QA1-D | sim-safari, webkit-iphone | name sheet, chart | The year label can cover the top tick label; "0 תינוקות" on rare names |
| ND-UX-004 | 1 | US-QA1-E | webkit-iphone, chromium-pixel, sim-safari | name sheet, similar names | אראל next to אריאל is a form only by a biblical spelling |

<!--
### ND-UX-000: idea

- **Cycle found:** N · **QA story:** US-QA{N}-{X} · **Browser:** … · **Screen:** …
- **Observation:** …
- **Suggestion:** …
- **Screenshot:** `scripts/ralph/qa/name-detail/shots/…`
-->

### ND-UX-001: A scroll that starts on the chart also shows a year tooltip

- **Cycle found:** 1 · **QA story:** US-QA1-B · **Browser:** sim-safari · **Screen:** name sheet at full height, numbers section
- **Observation:** Dragging up from the chart scrolls the sheet (fine), but the touch-down also picks a year, so "ב־2011: 150 תינוקות" stays up after the scroll.
- **Suggestion:** Show the year only on a tap (no movement), like the card's tap rule.
- **Screenshot:** `scripts/ralph/qa/name-detail/shots/qa1-b-sim-fullscroll5.png`

### ND-UX-002: Root-sharing names read as "forms of the same name"

- **Cycle found:** 1 · **QA story:** US-QA1-C · **Browser:** webkit-iphone, sim-safari · **Screen:** name sheet, "שמות קרובים"
- **Observation:** מוחמד lists אחמד, מחמוד, מחמד; אריאל lists אריה. §6.3 allows "the same name built on the same word" (אור ↔ אורי), and the stories explain the link (ח־מ־ד; ארי = אריה), so this isn't a rule break. Still, אחמד and מחמוד are separate names more than forms of מוחמד, and a parent might read the section as "spellings".
- **Suggestion:** The owner's spot check could decide whether root-only siblings stay, or whether the label should say something like "שמות מאותו מקור".
- **Screenshot:** `scripts/ralph/qa/name-detail/shots/qa1-c-sim-muhammad-3.png`

### ND-UX-003: The year label can cover the top tick label; "0 תינוקות" on rare names

- **Cycle found:** 1 · **QA story:** US-QA1-D · **Browser:** sim-safari, webkit-iphone · **Screen:** name sheet, numbers section, year chart
- **Observation:** On a high, early point (מוחמד 2003, 3,167 of a 4,000 top tick) the label is clamped to the chart's start edge and covers the "4,000" tick label while it shows. US-050 accepted the same overlap with the 1,200 tick. On rare names a year with no births reads "ב־2010: 0 תינוקות" (בלהה), correct but a little flat.
- **Suggestion:** Clamp the label to the plot area (inside the y labels) instead of the whole chart, and say "ב־2010: אף תינוק" for 0.
- **Screenshot:** `scripts/ralph/qa/name-detail/shots/qa1-d-sim-muhammad-drag.png`, `shots/qa1-d-webkit-bilha-tap.png`

### ND-UX-004: אראל next to אריאל is a form only by a biblical spelling

- **Cycle found:** 1 · **QA story:** US-QA1-E · **Browser:** webkit-iphone, chromium-pixel, sim-safari · **Screen:** name sheet, similar names (אריאל: ארי, אריה, אראל, אריאלה)
- **Observation:** אראל and אריאל are both spellings of the altar hearth in Ezekiel 43:15–16 (הַהַרְאֵל / הָאֲרִיאֵל), so the pair fits §6.3 "other spellings" and isn't logged as a content bug. Most parents know אראל as its own name ("angel", Isaiah 33:7), so it may read as a sound-alike. The 10-name spot-check (מליכה, רוז, ידיד, מאירה, סארה, אווה, פאיזה, אמיליה, פאיז, בניה) found only clear forms.
- **Suggestion:** If the story for אראל or אריאל is ever revised, one clause on the shared verse would explain the link; otherwise drop the pair under "when unsure, leave it out".
- **Screenshot:** `scripts/ralph/qa/name-detail/shots/qa1-e-sim-ariel-similar.png`

### ND-UX-005: "תמונה משלי" can't be saved where IndexedDB refuses Blobs

- **Cycle found:** 1 · **QA story:** US-QA1-J · **Browser:** webkit-iphone (Playwright) · **Screen:** background sheet, "תמונה משלי"
- **Observation:** In Playwright WebKit's ephemeral context, picking a photo shows "אי אפשר לפתוח את התמונה הזו. אפשר לבחור תמונה אחרת." and the background stays "בדים". The image decodes and encodes fine; the IndexedDB `put` of the resized Blob is what fails (`shots/qa1-j-idb.mjs`: a bare Blob put fails there too). Real Simulator Safari saves the photo and applies it (`shots/qa1-j-sim-bg-own.png`), and Chromium does too, so this isn't a bug in this run. Browsers in a private or ephemeral mode can refuse Blobs this way, and then the message blames the photo instead of the storage.
- **Suggestion:** Store the photo as an ArrayBuffer plus its type (rebuild the Blob on read), or word the failure message as "אי אפשר לשמור תמונה במצב הזה של הדפדפן" when the save, not the decode, fails.
- **Screenshot:** `scripts/ralph/qa/name-detail/shots/qa1-j-webkit-bg-own-sheet.png`, `shots/qa1-j-sim-bg-own.png`

### ND-UX-006: On a connection that drops requests (not offline), the deck can stay empty

- **Cycle found:** 1 · **QA story:** US-QA1-K · **Browser:** sim-safari · **Screen:** /names?sheet=name (swipe screen + name sheet)
- **Observation:** With a proxy on :3100 that resets every connection (`shots/qa1-k-proxy.mjs`, mode `offline`), Simulator Safari drew the header and the action bar from the cache but showed no card and no sheet for 18+ s (`shots/qa1-k-sim-offline-tamar2.png`). With the server simply gone (connection refused, what a phone in airplane mode sees), the same link opened the sheet from the cache at once with story, verse and similar names (`shots/qa1-k-sim-offline-shira.png`). So real offline works. The worker's network-first requests (`/names/data/manifest.json`, pages) have no timeout, so a "lie-fi" network that never answers can hold up the deck. This is the previous run's caching rule, not a change in this run.
- **Suggestion:** Give the worker's network-first fetches a short timeout (e.g. 3 s) before falling back to the cache.
- **Screenshot:** `scripts/ralph/qa/name-detail/shots/qa1-k-sim-offline-tamar2.png`, `shots/qa1-k-sim-offline-shira.png`

### ND-UX-007: At 200% zoom the page scrolls, but a pan that starts on the card loves it instead

- **Cycle found:** 1 · **QA story:** US-QA1-L · **Browser:** webkit-iphone, chromium-pixel (Playwright) · **Screen:** /names at 195 × 422 CSS px (iPhone 15 at 200%)
- **Observation:** Below 30rem of height the swipe screen switches to `h-auto` with a 25rem minimum deck (SwipeScreen, same classes as origin/main). The card then grows to its content (477 px, no inner scroll), so `useSwipeDrag` keeps `touch-action: none`, and the document scrolls 265 px with the action bar below the fold (top 623 px). A touch pan up that starts on the card loved גבריאל and moved on to the next name (`shots/qa1-l-zoomcard.mjs`). The bar is still reachable by panning on the header or the 12 px margins, and nothing is cut off horizontally, so this isn't a bug. The pan-y fallback only applies when the card scrolls on its own, which here happens only at 320 × 568.
- **Suggestion:** In the `h-auto` fallback, cap the card at the viewport height (e.g. `max-h-[calc(100dvh-…)]`) so the card scrolls by itself and the existing pan-y fallback applies, or set `pan-y` whenever the document scrolls.
- **Screenshot:** `scripts/ralph/qa/name-detail/shots/qa1-l-webkit-zoom200-swipe.png`, `shots/qa1-l-webkit-zoomcard-195.png`

### ND-UX-008: "יציאה מהבחירה המשותפת" is offered but always fails on the real backend

- **Cycle found:** 1 · **QA story:** US-QA1-O · **Browser:** webkit-iphone, chromium-pixel (Playwright) · **Screen:** /names/settings → leave dialog
- **Observation:** `names_leave` isn't deployed on "Nest (EU)" (`POST /rest/v1/rpc/names_leave` → 404 PGRST202; migration 0011 in pregnancy-manager is still unapplied, as PR #16 says). A shared user sees the settings row and the confirm dialog, and every confirm ends in "היציאה לא הצליחה. אפשר לנסות שוב." with `space_leave_failed {reason: missing_rpc}`; nothing half-changes (still 2 members) (`shots/qa1-o-lp-webkit-leave-failed.png`). Against the mock (`names_leave` answered) the whole flow works: done toast, row gone, together badge and match count gone, also with in-app navigation only (`shots/qa1-o-lp-*-mock-*.png`). Backend changes are out of scope for this run, so this is the owner's step, not a bug.
- **Suggestion:** Apply migration 0011 before launch, or hide the row while the RPC is missing (e.g. a feature flag) so "try again" doesn't promise something that can't work.
- **Screenshot:** `scripts/ralph/qa/name-detail/shots/qa1-o-lp-webkit-leave-failed.png`, `shots/qa1-o-lp-chromium-mock-after-inapp.png`
