# Name swiper polish: UX insights

Non-blocking ideas found during QA, IDs `NP-UX-001` on, newest last. Never acted on in this run (PRD §11).

| ID | Cycle | Story | Browser | Screen | Idea |
|---|---|---|---|---|---|
| NP-UX-001 | 1 | US-QA1-J | Chromium + WebKit | /names (analytics) | `first_vote` fires again when the space's first decision is undone and another is made (`votes.size === 0` again), so a device can send two per space; the funnel views should count the first one per space or the client should send it once per space (code unchanged since before this run, not a regression). Log: `shots/qa1/J/events-chromium.log` |
| NP-UX-002 | 3 | US-QA3-E | Simulator Safari | /names/lists (tab "התאמות · N") | Removing a name that is a match, then "ביטול", leaves the count one step behind for ~2 s: 3 right after the remove, 2 right after the undo, then 3 (`useMatches` refetches `name_matches` 2 s after the user's own votes change, by design, PRD 3.2.10). The tab count could follow the user's own vote at once (drop/restore the name locally until the refetch). Shots: `shots/qa3/E/sim/e3-removed.png`, `e3-undo.png`, `e3-undo-later.png` |
| NP-UX-003 | 3 | US-QA3-I | Simulator Safari + Chromium | /names (update available) | Since US-FIX2 the sticky "עדכון זמין" toast sits above "לכל הפרטים" (as fixed for NP-BUG-011), so on a card with a trend tile it covers the trend word and most of the sparkline ("יציב לאחרונה" → "…חרונה") until "רענון" is tapped. Nothing tappable is covered and the same data is in the detail sheet, so not a bug; the toast could be narrower or the deck could show the update line in the header strip instead. Shots: `shots/qa3/I/sim/sim-update-toast.png`, `shots/qa3/I/qa3-k-chromium-update-toast.png` |

<!--
### NP-UX-000: idea

- **Cycle found:** N · **QA story:** US-QA{N}-{X} · **Browser:** … · **Screen:** …
- **Observation:** …
- **Suggestion:** …
- **Screenshot:** `scripts/ralph/qa/name-polish/shots/…`
-->
