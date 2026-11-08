# Name swiper polish: UX insights

Non-blocking ideas found during QA, IDs `NP-UX-001` on, newest last. Never acted on in this run (PRD §11).

| ID | Cycle | Story | Browser | Screen | Idea |
|---|---|---|---|---|---|
| NP-UX-001 | 1 | US-QA1-J | Chromium + WebKit | /names (analytics) | `first_vote` fires again when the space's first decision is undone and another is made (`votes.size === 0` again), so a device can send two per space; the funnel views should count the first one per space or the client should send it once per space (code unchanged since before this run, not a regression). Log: `shots/qa1/J/events-chromium.log` |

<!--
### NP-UX-000: idea

- **Cycle found:** N · **QA story:** US-QA{N}-{X} · **Browser:** … · **Screen:** …
- **Observation:** …
- **Suggestion:** …
- **Screenshot:** `scripts/ralph/qa/name-polish/shots/…`
-->
