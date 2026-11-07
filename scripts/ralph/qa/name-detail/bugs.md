# Name detail sheet: QA bugs

One entry per bug, IDs `ND-BUG-001` on, newest last. Written by `US-QA{N}-{X}` stories; fixed by `US-FIX{N}` (PRD §11).

Browser: `webkit-iphone` · `chromium-pixel` · `sim-safari` · `desktop`. Status: `open` · `fixed` · `blocked` · `wontfix-owner`.

| ID | Cycle | Story | Browser | Screen | Status | Summary |
|---|---|---|---|---|---|---|
| ND-BUG-001 | 1 | US-QA1-A | webkit-iphone, chromium-pixel | /names (swipe deck) | fixed | A quick double tap on the card opens the name sheet and closes it again |
| ND-BUG-002 | 1 | US-QA1-B | webkit-iphone, chromium-pixel | /names (swipe deck) | fixed | From the 2nd tap-open on, focus leaves the name sheet (lands on the page body) and Escape no longer closes it |
| ND-BUG-003 | 1 | US-QA1-E | webkit-iphone, chromium-pixel, sim-safari | /names, name sheet | fixed | A year picked on one name's chart stays picked when a similar name's sheet opens (and after Back) |
| ND-BUG-004 | 1 | US-QA1-H | chromium-pixel | /names (swipe deck) | fixed | Intermittent: undo after a "דילוג" from the name sheet cleared the vote but left the next card on top (1 of ~30 tries) |
| ND-BUG-005 | 1 | US-QA1-M | chromium-pixel (Clarity loaded by hand; webkit-iphone same code path) | /names, name sheet | fixed | Clarity records the sheet URL `?sheet=name&n=<name>`, so every opened baby name reaches Clarity |
| ND-BUG-006 | 1 | US-QA1-M | chromium-pixel, webkit-iphone | /names, name sheet → surname link | fixed | Leaving the sheet through "להוסיף שם משפחה" sends no `detail_closed` (the visit never ends) |

<!--
### ND-BUG-000: summary

- **Cycle found:** N · **QA story:** US-QA{N}-{X} · **Browser:** webkit-iphone · **Screen:** …
- **Steps:** …
- **Expected:** …
- **Actual:** …
- **Screenshot:** `scripts/ralph/qa/name-detail/shots/…`
- **Status:** open
- **Fix note:** …
- **Cycle fixed:** …
-->

### ND-BUG-001: A quick double tap on the card opens the name sheet and closes it again

- **Cycle found:** 1 · **QA story:** US-QA1-A · **Browser:** webkit-iphone, chromium-pixel (same result in both) · **Screen:** /names, swipe deck, top card (גבריאל), :3100 production build
- **Steps:** Tap the card body twice, the second touch ~40–70 ms after the first (`page.touchscreen.tap` at the card's center x, 45% height; `node scripts/ralph/qa/name-detail/shots/qa1-a-double.mjs <webkit|chromium> 40 2`). Three taps 40 ms apart: `... 40 3`.
- **Expected:** PRD §11.4 A "Fast repeated taps open one sheet": the sheet opens once and stays open; one history entry.
- **Actual:** Two taps: the first opens the sheet (pushState `?sheet=name&n=גבריאל`); the second lands on the scrim (`DIV`, outside the dialog) while the sheet is still sliding up, and closes it. End state: URL `/names`, 0 dialogs, no sheet. Three taps: open → close → open again (two `pushState`s, two opens, the sheet flickers). With 120 ms or 250 ms between taps the second tap lands on the sheet and it stays open (pass). The tap swallow in useSwipeDrag only drops the click of the same tap; the next touch's pointerdown/click hits the scrim during the open animation.
- **Screenshot:** `scripts/ralph/qa/name-detail/shots/qa1-a-webkit-taps2-gap40.png` (after the double tap: no sheet), `qa1-a-chromium-taps2-gap40.png`; open state for comparison `qa1-a-webkit-tap-body.png`
- **Simulator:** cliclick needs ~130 ms per press/release in the Simulator, so its fastest double tap is ~260 ms apart; that one opened one sheet (`qa1-a-sim-dbl.png`, `qa1-a-sim-triple.png`). The 40–70 ms case can't be produced there.
- **Status:** fixed
- **Fix note:** The sheet's layer (BottomSheet) ignores clicks for 350 ms after it opens (capture phase on the layer: scrim, handle, ✕ and the decision buttons), longer than the 260 ms slide-in, so the quick taps that follow a tap-open can't close it or decide. Verified on :3100 with `qa1-a-double.mjs <engine> 40 2`, `40 3` and `70 2` in WebKit iPhone 15 and Chromium Pixel 7: the sheet stays open, one pushState. Not reproducible in the Simulator (fastest double tap ~260 ms), as found.
- **Cycle fixed:** 1

### ND-BUG-002: From the 2nd tap-open on, focus leaves the name sheet and Escape no longer closes it

- **Cycle found:** 1 · **QA story:** US-QA1-B · **Browser:** webkit-iphone, chromium-pixel (same in both) · **Screen:** /names, swipe deck, name sheet, :3100 production build
- **Steps:** Tap the card body (sheet opens, focus on the sheet's h2: fine). Close it any way (✕, handle tap, scrim tap, Back). Tap the card body again. Press Escape (`node scripts/ralph/qa/name-detail/shots/qa1-b-seq.mjs <webkit|chromium> x`; also `handle`, `scrim`, `back`).
- **Expected:** PRD FR-D5 / §11.4 B: every open moves focus into the dialog; Escape closes it and focus returns to the card. A modal dialog must keep focus inside.
- **Actual:** On every open after the first, `document.activeElement` is `BODY` once the sheet is up, and Escape does nothing (sheet stays, URL keeps `?sheet=name&n=גבריאל`). Event log of the 2nd open: pointerdown/touchstart/pointerup on the card's `P` → the sheet opens and focuses its h2 (≈10 ms after pointerup) → touchend → the tap's compatibility `mousedown` lands on the scrim `DIV`, now under the finger → `focusout` from the h2, focus goes to body. The 1st open isn't affected because the lazy chunk is still loading, so the sheet appears after the mousedown. Same family as ND-BUG-001 (the sheet opens on pointerup, before the tap's own mouse/click events finish, and they hit the new scrim). Mouse click and Enter on desktop are fine every time (`qa1-b-focus.mjs <engine> desktop`). The Simulator can't show it: Safari there ignores hardware keys without a focused text field and there's no focus readout.
- **Screenshot:** `scripts/ralph/qa/name-detail/shots/qa1-b-webkit-seq-x.png`, `qa1-b-chromium-seq-x.png` (sheet still open after Escape)
- **Status:** fixed
- **Fix note:** The scrim's mousedown is preventDefault-ed, so the tap's compatibility mousedown no longer moves focus out of the dialog (the scrim only closes on click). Verified with `qa1-b-seq.mjs <engine> x|handle|scrim|back` in WebKit and Chromium: on the 2nd open focus is on the sheet's h2 and Escape closes it (URL clean), all 8 runs.
- **Cycle fixed:** 1

### ND-BUG-003: A year picked on one name's chart stays picked when a similar name's sheet opens

- **Cycle found:** 1 · **QA story:** US-QA1-E · **Browser:** webkit-iphone, chromium-pixel, sim-safari · **Screen:** /names, name sheet (אריאל → similar chip ארי), :3100 production build
- **Steps:** Open `/names?sheet=name&n=אריאל`. Tap the year chart near 2009 (label "ב־2009: 1,174 תינוקות"). Scroll to "שמות קרובים" and tap "ארי · בן" (`node scripts/ralph/qa/name-detail/shots/qa1-e-chart.mjs <webkit|chromium>`). Simulator: content drags that start on אריאל's chart pick a year (ND-UX-001); then tap the ארי chip and Back.
- **Expected:** FR-D13 / §3.2.9: the chart shows a year's label when the user taps or hovers it. A newly opened name's sheet starts with nothing picked (as on any first open: only the 2024 dot), and its label only ever shows a year the user picked on that name.
- **Actual:** ארי's sheet opens with 2009 already picked: the cursor line and "ב־2009: 66 תינוקות" show on ארי's chart without any tap on it (the aria-live label reads it too). Back to אריאל keeps whatever year is picked. Simulator: ארי opened with "ב־2011: 79 תינוקות", and after Back אריאל showed the 2011 label too. The sheet reuses one `YearChart` across names (no `key` on the name), so its `active` year state survives the name change.
- **Screenshot:** `scripts/ralph/qa/name-detail/shots/qa1-e-webkit-chart-carry.png`, `qa1-e-chromium-chart-carry.png`, `qa1-e-sim-to-ari.png`, `qa1-e-sim-back1.png`
- **Status:** fixed
- **Fix note:** `YearChart` is keyed by the name in NumbersSection, so each name starts with no year picked. Verified: `qa1-e-chart.mjs` WebKit + Chromium (ארי opens with only the 2024 line, `shots/qa1-e-*-chart-carry.png`), Simulator Safari (2009 picked on אריאל → ארי chip → Back: no cursor or label on either, `shots/fix1-sim-m1.png`, `fix1-sim-m2.png`, `fix1-sim-m3.png`).
- **Cycle fixed:** 1

### ND-BUG-004: Undo after a sheet "דילוג" cleared the vote but didn't bring the card back (intermittent)

- **Cycle found:** 1 · **QA story:** US-QA1-H · **Browser:** chromium-pixel · **Screen:** /names, swipe deck, top card גבריאל (QA user 1, 0 votes), :3100 production build
- **Steps:** `node scripts/ralph/qa/name-detail/shots/qa1-h.mjs chromium` (first run of the cycle). In order on גבריאל: bar "שמירה" → undo; tap card → sheet "שמירה" → undo; the same for "אהבתי"; bar "דילוג" → undo (restored); tap card → sheet "דילוג" (sheet closed, שאדי on top, REST `skip`, vote event `method: "detail"`) → analytics flush (visibilitychange hidden → visible, ~4 s) → tap "ביטול ההחלטה האחרונה" → read 1.8 s later.
- **Expected:** PRD §11.4 H "undo restores it": גבריאל back on top and no vote on the server.
- **Actual:** The server row was gone (REST: no vote on גבריאל), but שאדי stayed on top. In the deck's seeded order גבריאל is the first undecided name, so with no vote it must be on top, so the screen and the store disagreed. Not reproduced since: 3 more full runs of qa1-h.mjs in Chromium, 2 in WebKit, and 26 focused sheet-decision + undo tries (`shots/qa1-h-stall.mjs <engine> ss,ss,…`, with and without the flush) all restored. Filed because the state was observed; the fix pass should look for a race between the sheet path (history back → popstate → `drag.fly`) and undo or the vote write.
- **Screenshot:** none of the failing state (the script didn't shoot on failure; it does now). Normal end state for comparison: `shots/qa1-h-chromium-top-keep-after.png`.
- **Status:** fixed
- **Fix note:** Cause found in the vote store: a server read sent before the undo (here the re-read on visibilitychange → visible) could answer after the undo's delete had landed and left the outbox, and `mergeRemote` put the stale skip back locally (server: no vote; deck: card gone). `mergeRemote` now skips a server vote the user removed on this device after it was written (`removedAt`). New test in tests/names/voteRealtime.test.ts reproduces it (fails without the fix). Rerun on :3100: `qa1-h.mjs` Chromium ×2 and WebKit, all pass; `qa1-h-stall.mjs chromium ss×6`, every undo restored.
- **Cycle fixed:** 1

### ND-BUG-005: Clarity records the sheet URL `?sheet=name&n=<name>`, so every opened baby name reaches Clarity

- **Cycle found:** 1 · **QA story:** US-QA1-M · **Browser:** chromium-pixel · **Screen:** /names, name sheet, :3100 production build
- **Steps:** `NEXT_PUBLIC_CLARITY_PROJECT_ID` isn't set locally, so the script loads clarity.js 0.8.77 (Microsoft's current build, saved as `shots/clarity-0.8.77.js`) on `/names`, a URL `clarityAllowed()` accepts, the same as the app's loader does in production. Then tap "לכל הפרטים" on the top card (גבריאל), wait, Escape. Every `*.clarity.ms/collect` upload is caught and gunzipped (`node scripts/ralph/qa/name-detail/shots/qa1-m-clarity.mjs chromium 3100`; payload dump `shots/qa1-m-clarity-chromium.txt`).
- **Expected:** PRD §8 Privacy / §11.4 M: no name, surname or vote text in any analytics or Clarity request. `src/lib/names/clarity.ts` keeps Clarity off URLs with params outside SAFE_PARAMS for exactly this reason.
- **Actual:** clarity-js hooks `history.pushState` and starts a new page with the new URL. Opening the sheet pushes `?sheet=name&n=%D7%92%D7%91%D7%A8%D7%99%D7%90%D7%9C`, and that URL is in the upload (`"http://localhost:3100/names?sheet=name&n=%D7%92…"`, decoded `…&n=גבריאל`). `clarityAllowed()` only runs before Clarity loads, so it doesn't help once Clarity is running. The same happens for each similar name, Lists entries and the about/report sheets opened from the name sheet (they keep `n`). The rest is masked: the only Hebrew in the uploads is the title "בחירת שם" and the unmasked labels "שמירה", "אהבתי", "דילוג"; the name, the surname and the story aren't in them. names_track (path is the pathname only) and Vercel Analytics (`scrubAnalyticsUrl` keeps only source/tab) are clean. Regression from this run: origin/main put no name in any URL. WebKit: the same script caught no Clarity upload at all (Playwright WebKit's beacon path), so it isn't verified there, but the URL comes from the same pushState in every browser.
- **Screenshot:** `scripts/ralph/qa/name-detail/shots/qa1-m-clarity-chromium-sheet.png` (the open sheet whose URL was uploaded); evidence in `shots/qa1-m-clarity-chromium.txt`
- **Status:** fixed
- **Fix note:** The Clarity loader's queue stub adds `drop: ["n"]` to the tag's `clarity("start", config)` (clarity-js runs every uploaded URL through `drop`, value → `*na*`). Confirmed against Microsoft's live tag (it calls `a[c]("start", config)` through the page's stub). Verified with a build that had NEXT_PUBLIC_CLARITY_PROJECT_ID=qa1mtest01 and the app's own loader (`shots/fix1-clarity.mjs chromium`, tag shaped like the live one, clarity.js 0.8.77): uploads hold `/names?sheet=name&n=*na*`, the name in no upload. 3100 rebuilt without the id afterwards. WebKit still uploads nothing in Playwright, as in QA.
- **Cycle fixed:** 1

### ND-BUG-006: Leaving the sheet through "להוסיף שם משפחה" sends no `detail_closed`

- **Cycle found:** 1 · **QA story:** US-QA1-M · **Browser:** chromium-pixel, webkit-iphone · **Screen:** /names, name sheet with no surname set → /names/intro, :3100 production build
- **Steps:** Open the sheet ("לכל הפרטים"), tap the surname link, wait 1.5 s, flush analytics (visibilitychange) (`node scripts/ralph/qa/name-detail/shots/qa1-m-sources.mjs <chromium|webkit>`).
- **Expected:** PRD §3.2.10 / US-071: `detail_closed {seconds, full}` on every close path, so every `detail_opened` that isn't a similar-name open ends with one close.
- **Actual:** Events: `detail_opened {button}`, `detail_section_seen {story}`, `detail_surname_add`, then nothing. The link goes to /names/intro and the sheet unmounts; `createDetailVisits` only ends a visit when the URL loses `n` while the sheet is mounted, so the visit is dropped and the open is never closed. Every other close path passes (✕, Escape, scrim, handle tap, handle drag, Back, Back through a similar name, a decision on the current card, a decision from Lists).
- **Screenshot:** none: no visual state, the bug is the missing event (logged by the script).
- **Status:** fixed
- **Fix note:** The sheet ends its visit when it unmounts with the name still in the URL (`DetailVisits.end()`, run from an unmount timer so Strict Mode's remount doesn't end it). Verified with `qa1-m-sources.mjs` Chromium + WebKit: surname link → `detail_surname_add` then one `detail_closed`; every other source still passes (0 FAIL).
- **Cycle fixed:** 1
