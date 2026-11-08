# Name swiper polish: QA bugs

One entry per bug, IDs `NP-BUG-001` on, newest last. Written by `US-QA{N}-{X}` stories; fixed by `US-FIX{N}` (PRD §11).

Browser: `webkit-iphone` · `chromium-pixel` · `sim-safari` · `desktop`. Status: `open` · `fixed` · `blocked` · `wontfix-owner`.

| ID | Cycle | Story | Browser | Screen | Status | Summary |
|---|---|---|---|---|---|---|
| NP-BUG-001 | R1 | US-R1 | webkit-iphone, sim-safari | welcome, join invited | open | The welcome preview card's peek cuts the intro line through its letters at 375 px and in Safari |
| NP-BUG-002 | R2 | US-R2 | webkit-iphone, chromium-pixel | deck offline pending | open | The offline sync line now sits on the card's bottom edge and, at 320 px, covers its "לכל הפרטים" row |

### NP-BUG-001: The welcome preview card's peek cuts the intro line through its letters

- **Cycle found:** R1 (re-score, before QA) · **QA story:** US-R1 · **Browser:** webkit-iphone (375 × 667), sim-safari · **Screen:** `/names/welcome` (default), `/names/join/[code]` signed out
- **Steps:** Open `/names/welcome` signed out in WebKit at 375 × 667 or in Simulator Safari (iPhone 17 Pro).
- **Expected:** The capped preview card (NP-001, US-P04) ends on a whole part of the card. It shows the tag and name, or the name and its intro line, and never a line sliced through its glyphs.
- **Actual:** The card's bottom edge (with the `mask-b-from-60%` fade) runs through the intro line "זיו הוא אור, זוהר וברק…": the tops of the letters show as a faint half-line under "זִיו" (WebKit 375). In Safari the second line "ולבנות." is half faded at the edge. At 393 × 659 the card shows only the tag and the name on an empty glass slab. Before polish the full card showed and the buttons were below the fold. The fold fix is right; the slice through the text is a regression it brought (IMP-C-G1-22 / OD-007, the owner's mask question, is related but separate).
- **Screenshot:** `scripts/ralph/qa/name-polish/shots/after/G1/welcome-default-webkit375.png`, `welcome-default-sim.png`, `welcome-default-webkit.png`; before: `shots/baseline/G1/welcome-default-webkit375.png`
- **Status:** open
- **Fix note:** Suggested inside §3.1: in `PreviewCard.tsx`, also hide the intro line (and the chips and bar) with container height queries below the height each one needs, the way the whole card already hides under 8rem, so the peek ends after the name or after a whole line. Keep both sign-in buttons above the fold (`shots/p04-probe.mjs`).
- **Cycle fixed:** …

### NP-BUG-002: The offline sync line sits on the card and covers "לכל הפרטים" at 320 px

- **Cycle found:** R2 (re-score, before QA) · **QA story:** US-R2 · **Browser:** webkit-iphone (393 × 659 and 320 × 568), chromium-pixel · **Screen:** `/names`, offline with a decision waiting to sync
- **Steps:** Open the deck, go offline, tap "שמירה" (`us006-g2.mjs` state `deck-offline-pending`).
- **Expected:** The line "אין חיבור · בחירה אחת ממתינה לסנכרון" shows without moving anything (NP-077's aim, CLS 0) and without covering any part of the card.
- **Actual:** The line is pinned just above the action bar, so it overlaps the bottom edge of the card. At 320 × 568 it covers the card's "לכל הפרטים" row (the button shows only as a sliver above the pill). Before polish, the line sat under the action bar and pushed the bar up (the layout shift NP-077 removed). The CLS fix is right; covering the card is a regression it brought.
- **Screenshot:** `scripts/ralph/qa/name-polish/shots/after/G2/deck-offline-pending-webkit320.png`, `deck-offline-pending-webkit.png`, `deck-offline-pending-chromium.png`; before: `shots/baseline/G2/deck-offline-pending-webkit320.png`
- **Status:** open
- **Fix note:** Suggested inside §3.1, in `swipe/SwipeFooter.tsx`: keep the line out of the flex flow, but reserve its height under the action bar always (an empty slot with the line's min-height), or place it in the space under the bar. Then it never moves the bar and never overlaps the card. Check CLS = 0 again with the NP-077 probe.
- **Cycle fixed:** …

<!--
### NP-BUG-000: summary

- **Cycle found:** N · **QA story:** US-QA{N}-{X} · **Browser:** webkit-iphone · **Screen:** …
- **Steps:** …
- **Expected:** …
- **Actual:** …
- **Screenshot:** `scripts/ralph/qa/name-polish/shots/…`
- **Status:** open
- **Fix note:** …
- **Cycle fixed:** …
-->
