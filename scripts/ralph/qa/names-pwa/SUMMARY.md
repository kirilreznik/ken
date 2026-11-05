# Names PWA: QA summary

**Outcome: clean after cycle 2.** 0 bugs open, 0 blocked, 0 wontfix-owner.

Cycle 1 found 12 bugs and US-FIX1 fixed all 12 (commit `4e603f1`). Cycle 2 ran all 12 checklists (A–L) in full on a production build of that commit and found 0 new bugs and reopened none. So US-FIX2, cycle 3 and US-FIX3 were skipped as the PRD says (§11.3). Every fix rests on that cycle 2 pass. US-FIX3 fixed nothing, so there was nothing new for US-FINAL to re-check. It re-ran the cycle 1 fix checks anyway on the same production build (port 3100, 2026-11-05). Everything passed:

- `shots/fix1-check.mjs`: 24/24 pass. Covers touch targets, widths of 195, 320 and 390 px, peek strips, reduced transparency, the lists screen picking up a join on focus, and the offline intro, welcome, settings and email screens.
- `shots/qa1-h-stale.mjs`: the match sheet shows without a reload after 57 s (NP-BUG-005).
- `shots/qa1-i-flash.mjs`: 3 of 3 cold duel loads go loading → pair, and the saved tab goes loading → rows. The "no names" text never shows in between (NP-BUG-006).
- `shots/qa1-l-probe.mjs`: Tab and Shift+Tab stay inside the background sheet. At 195 px, intro, lists and privacy have 0 overflowing elements (NP-BUG-011, NP-BUG-012).

## Per cycle

| Cycle | Checks run | Found | Fixed | Reopened | Blocked |
|---|---|---|---|---|---|
| 1 | 1,139 in A–K, plus L (axe 92, keyboard 19, `qa1-l.mjs` and probes) | 12 | 12 (US-FIX1, `4e603f1`) | 0 | 0 |
| 2 | about 1,470 (A–K 1,168, L about 300, plus fix re-checks) | 0 | — | 0 | 0 |
| 3 | skipped: QA clean after cycle 2 | — | — | — | — |

Per-story counts are in the notes of `scripts/ralph/prd.json` and in `progress.txt`.

## Bugs

All 12 are **fixed**. Full entries are in `bugs.md`.

| ID | Severity | Screen | Summary |
|---|---|---|---|
| NP-BUG-001 | low | welcome | Inline legal links were under 44 px |
| NP-BUG-002 | medium | swipe | At 200% zoom the card was a 57 px strip and the page scrolled sideways |
| NP-BUG-003 | low | swipe | Names on the peeking cards overlapped and showed through the glass |
| NP-BUG-004 | low | swipe | With reduced transparency the near back card stayed translucent |
| NP-BUG-005 | medium | swipe, lists | A screen opened while solo never learned that a partner joined |
| NP-BUG-006 | low | duel, lists | With no votes cache, the screen flashed "no names" before the list loaded |
| NP-BUG-007 | low | privacy, terms | The contact mailto link was under 44 px |
| NP-BUG-008 | low | manifest, SW | Scope `/names` against the spec's `/names/`; the decision is now recorded in PRD §3.2.22 |
| NP-BUG-009 | medium | intro, welcome (offline) | ChunkLoadError on precached routes |
| NP-BUG-010 | low | email sign-in (offline) | Opened Chrome's offline page instead of the email screen |
| NP-BUG-011 | medium | background sheet | Tab left the sheet |
| NP-BUG-012 | medium | lists, intro, legal | Overflow and cut-off header at 200% zoom |

Open: none. Blocked: none. Wontfix-owner: none.

## Backend requests

None. `docs/names-pwa/backend-requests.md` was never created, because no story needed a backend change beyond migrations 0001–0009.

## Still to do by the owner

From `docs/names-pwa/SETUP.md`:

- **§11 Turnstile** (before public launch): create the widget, turn on CAPTCHA in Supabase and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in Vercel. The PWA already renders the widget when the key is set.
- **§12 Legal and launch** (before public launch):
  - Create the `privacy@nestjourney.app` alias and test it.
  - Have a lawyer review both pages, replace the drafts and set `LEGAL_DRAFT = false`.
  - Translate the 4 remaining English Supabase email templates.
  - Set `PREGNANCY_WAITLIST_WEBHOOK_URL` and `PREGNANCY_WAITLIST_WEBHOOK_TOKEN` in Vercel.
  - Then turn on sign-ups.
- **§13 Checks on real phones**, on an iPhone (Safari) and an Android phone (Chrome) at `https://nestjourney.app/names`:
  1. Google sign-in, in the browser and in the installed app. Known iOS risk: storage is split between Safari and the home-screen app.
  2. A real code email: it comes from `no-reply@nestjourney.app`, doesn't land in spam, and the code works.
  3. Install: the icon is right and the app opens full screen at the swipe screen.
  4. Partner invite on two phones: a match shows up within a minute.
  5. Delete a test account: the user is gone from Supabase.

## UX insights

`ux-insights.md` holds 11 observations that aren't bugs (NP-UX-001…011). Examples: there is no way to remove your own photo (003), nothing shows that sheet filters are on (004), "בעלייה" is always empty for the 10 names (005), and every sheet has two "סגירה" Tab stops (010). NP-UX-011 suggests rewording checklist C's 200%-zoom item to match the NP-BUG-002 fix. They are ideas for the owner to triage, not open work.
