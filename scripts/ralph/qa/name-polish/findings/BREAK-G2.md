# BREAK · G2: Deck (swipe screen, name sheet, filters, background, match, decision, survey, about, report, toasts)

Skill: `break-ui` (`.claude/skills/break-ui/SKILL.md`, `CATALOG.md`). Phases 1, 2, 4 and 5 followed. Phase 3 (the "Demo data / Worst case" toggle) is replaced by a probe outside the app: the worst cases come in through the same boundary as the real data (the static data files, Supabase responses, device prefs) via Playwright routes, so nothing is committed to the app (PRD §3.1.4, story criteria). Phase 6 (fix) is not part of an audit. Assumptions: none needed; the skill asks nothing before its report. Skipped: nothing that needs a service. Dark mode isn't supported by `/names`, so it isn't checked. Browser zoom 200 % is replaced by Safari's real "Page Zoom" at 150 %, a 262 × 439 WebKit viewport (`zoom150`), as in BREAK-G1.

**How:** `shots/break-g2-probe.mjs [webkit|chromium|webkit320|zoom150] [--only long,counts,ends,match,sync,loads,sheets]` (dev server :3000, QA user 1, gitignored). Every backend call is answered in the probe: `names_space`, `space_members` (1, 2 or 12 members), `name_votes` GET (0, 1, 40, 999, 1,284 saved; 500; network failure; 6 s) and writes (echoed, 500, RLS `42501`, network failure; never sent), `name_matches`, the static `content`/`names`/`details` files (cut to the state's names; 500; network failure; 6 s). Slow answers are awaited before the browser closes. Per state it records horizontal overflow, boxes past the viewport and clipped text (`report-<browser>.json`). WebKit ran every state; Chromium the loads, counts and match states (same results); webkit320 and zoom150 the layout states. Simulator: `shots/break-g2-sim.mjs`, Safari signed in on localhost:3000 with QA user 1's real data (no write; it reads the real deck's numbers). Shots: `scripts/ralph/qa/name-polish/shots/audit/BREAK-G2/<state>-<browser>.png`.

## Phase 1: what G2 renders from data

| Field | Source | Limit | Optional? |
|---|---|---|---|
| Name with niqqud (card `h2`, sheet title, match/decision `h2`) | `content.*.json` `niqqud`, else the name | data: longest deck name "איילת השחר" (10), longest one-word "זינאלדין"/"כריסטיאן"/"אלכסנדרה" (8); a match or a chosen name can be a custom name, `CUSTOM_NAME_MAX` 20 (`src/lib/names/custom.ts:3`), Hebrew letters, `'`, `"`, inner space or hyphen | No |
| Intro (card, 2 lines clamped) | `content` `intro` | data max 93 chars (מאיה, עבד) | No (every name has one) |
| Hint chips, Bible note, known people | `content` `bible`, `people` (≤ 2 shown) | Bible text max 88 (רות), ref 21 (תמר), people max 2 (אריאל, נועם) | Yes (870 names have no Bible note, 1,290 no people) |
| Surname line (card, sheet "עם שם המשפחה") | device pref | `SURNAME_MAX` 30 (`Intro.tsx:12`) | Yes |
| Sex tag, band, trend word | derived, fixed enums | — | No |
| Births tile, sheet numbers, rank | `names.*.json` counts | max 130,505 all-time (מוחמד); `Intl.NumberFormat("he-IL")` (`card.ts:66`) | Yes (no recent years → "מאז 1949") |
| Position "שם {n} מתוך {total}" | `deckProgress` | deck 1,295 | No |
| Saved count pill and its label | votes | ≤ 1,295 + custom names (unbounded) | No |
| Sync line "{n} בחירות ממתינות לסנכרון" | outbox length | unbounded | Yes |
| Recap line and names | this session's votes (≥ 30), `RECAP_NAMES` 8 | — | Yes |
| Deck-end saved names | every saved name, `SAVED_SHOWN` 10 | unbounded | Yes |
| Match line "{n} שמרו את השם הזה." | `kept_by_count` | space size (no cap found in this repo) | No |
| Together badge | `togetherFor()` from the match | same | Yes |
| Story, similar names | `details.*.json` | story max 256 (אמיליה), similar max 6 (אורי) | Yes |
| Filters apply label "הצגת {n} שמות" | `applyLabel()` | 1,295 | No |
| Toast "נשמר: {name}" | a similar name | data name ≤ 10 | — |
| Async states | data files, votes read, vote writes, details, matches | — | — |

## Findings

### BREAK-G2-01: When the names data fails to load, the deck stays blank, with no message and no way to retry

- **Screen and state:** `/names`, the static `content.*.json` / `names.*.json` answering 500 or failing at the network level (flaky mobile data on first open, a deploy that changed the hashed file names under an old page); also while they load slowly
- **Browser:** webkit-iphone · chromium-pixel (both: after 8.5 s the swipe area is empty glass-less background, the action bar is `aria-disabled`, `main` contains only "שמירה / אהבתי / דילוג"; nothing is announced). With a 6 s load the same empty screen shows for the whole wait.
- **What's wrong:** `useCards()` returns `{ cards, error }` (`src/components/names/useCards.ts:32`), but `SwipeScreen` reads only `cards` (`swipe/SwipeScreen.tsx:59`), and its card slot renders `null` when there's no deck (`SwipeScreen.tsx:252-279`). So a failed load looks exactly like a slow one, and both look like a broken app: no card, no skeleton, no error line, no retry. The loader already clears its cached promise on failure (`useCards.ts:13-29`), so a retry would work; nothing asks for one except a reload.
- **Rule it breaks:** `break-ui` · `CATALOG.md` States · "Loading | Skeletons that don't match final layout…" and "Error from the API | No error state"; `SKILL.md` severity "Broken (content unreadable, action unreachable…)"
- **Severity:** P1
- **Effort:** S
- **Proposed change:** in `SwipeScreen.tsx`, take `error` from `useCards()` and give the card slot two more states, both in the existing `Glass` panel shape that `EmptyDeck` uses: while `cards` is null and there's no error, a card-shaped skeleton (the `names-glass` card outline with sand lines, like `detail/DetailsPending.tsx`, `aria-busy`); on error, "לא הצלחנו לטעון את השמות." + `Button` "ניסיון חוזר" that re-runs the load (a `retry()` from `useCards` that bumps an effect key). Same wording pattern as join's "ההצטרפות לא הצליחה." + "ניסיון חוזר" (`JoinScreen`). A unit test for the error branch.
- **Guardrail:** polish (missing loading and error states of an existing flow, §3.1.4; existing copy pattern)
- **Screenshot:** `audit/BREAK-G2/data-500-webkit.png`, `…/data-abort-chromium.png`, `…/data-slow-2s-webkit.png`

### BREAK-G2-02: On a new device, a failed read of the votes shows "0" saved and starts the deck over, silently

- **Screen and state:** `/names` on a device with no vote cache (new phone, cleared Safari data, a second browser), the `name_votes` read answering 500 or failing at the network level; QA user 1 had 40 saved names on the "server"
- **Browser:** webkit-iphone · chromium-pixel (both: pill "0", "שם 1 מתוך 1295", the sync line empty, no message)
- **What's wrong:** the store marks itself ready after the first read even when it failed and nothing was cached (`src/lib/names/voteStore.ts:488-492`; `readServer()` returns false and the state stays empty). The deck then shows every name as undecided and the header says nothing is saved. It re-reads only on focus, visibility or a Realtime join, so on a bad connection the user can work through names they already decided, and each new vote is queued and later wins over the older server vote (newest `updated_at`), so a name saved earlier can quietly become a skip.
- **Rule it breaks:** `break-ui` · `CATALOG.md` States · "Error from the API | No error state"; `SKILL.md` severity "Broken (… wrong data shown)"
- **Severity:** P2
- **Effort:** S
- **Proposed change:** in `voteStore.ts`, add `loadFailed` to the state (true when there was no cache and the first `readServer()` failed; false after any successful read) and retry the read on the existing `FLUSH_INTERVAL_MS` timer while it's true. In `useSyncStatus` / `SwipeFooter`, show it in the sync line (the same pill and icon as offline): "לא הצלחנו לטעון את הבחירות שלך. מנסים שוב." Recommendation: keep the deck usable (offline-first), only say it. Store unit test (no cache + read error → `loadFailed`, cleared by the next good read).
- **Guardrail:** polish (a missing error state; one new status line in the existing footer pattern)
- **Screenshot:** `audit/BREAK-G2/votes-500-webkit.png`, `…/votes-abort-chromium.png`

### BREAK-G2-03: Counts of 1,000 and more have no thousands separator, next to tiles that do

- **Screen and state:** the header pill (1,284 saved → "1284"), the card's position ("שם 1285 מתוך 1295", on every card of the real deck), the filters button ("הצגת 1295 שמות"), the match line ("1284 שמרו את השם הזה."); and the pill's label for one save, "השמות שלי: 1 נשמרו"
- **Browser:** webkit-iphone · chromium-pixel · sim-safari (`deck-real-numbers-sim.png`: "שם 1 מתוך 1295" under the real data) · webkit320 · zoom150
- **What's wrong:** these strings interpolate raw numbers (`card.ts:39` `positionText`, `swipe/SwipeHeader.tsx:67` `<bdi>{saved}</bdi>`, `filters.ts:158` `applyLabel`, `matches.ts:250` `matchSheetLine`), while the same card's tiles and the sheet format with `Intl.NumberFormat("he-IL")` ("2,099", "#1,363", "4,524"). A card can show "1295" and "2,099" a few lines apart. `savedLabel` (`a11y.ts:72-73`) reads "1 נשמרו" for one name. Nothing overflows (the pill grows from 59 to 82 px and fits at 262 px).
- **Rule it breaks:** `break-ui` · `SKILL.md` Failure signatures · "`1284` … Raw number rendered | `Intl.NumberFormat` with the user's locale"; "'1 members' | Hardcoded plural"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** export the existing `fmt` from `src/lib/names/card.ts` as `formatCount(n)` and use it in `positionText`, the header pill, `applyLabel` and `matchSheetLine` (and `syncStatusText` for consistency); `savedLabel(1)` → "השמות שלי: שם אחד נשמר". Update the unit tests that assert these strings. Do it with PRO-G2-04 (`tabular-nums` on the same three spans).
- **Guardrail:** polish
- **Screenshot:** `audit/BREAK-G2/deck-saved-1284-webkit.png`, `…/match-zina-webkit.png`, `…/filters-all-webkit.png`, `…/deck-real-numbers-sim.png`

### BREAK-G2-04: The deck end and the recap show the first 10 (8) saved names and don't say there are more

- **Screen and state:** deck end with 1,284 saved; round recap with 30 saves in the round
- **Browser:** webkit-iphone · webkit320 · zoom150
- **What's wrong:** "השמות ששמרת:" is followed by 10 name chips (`SAVED_SHOWN`, `swipe/EmptyDeck.tsx:22`); the recap says "ושמרת 30." and shows 8 (`RECAP_NAMES`, `launch.ts:18`). Nothing says the list is cut, so the panel reads as if these are all the saved names. "לשמות שלי" is the way to the rest, but it doesn't say so.
- **Rule it breaks:** `break-ui` · `CATALOG.md` Collections · "1,000+ items … also 'Showing 40 of 1,284' copy"; Labels · "Tag rows that wrap into a wall; needs a `+8` overflow"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** when the list is cut, end it with a plain text item "ועוד {formatCount(rest)}" (same `text-card-title`, `text-ink-soft`, no pill, so it isn't a fake button; see CRIT-G2-03) in `EmptyDeck.tsx` and `PausePanel.tsx`. Merge with CRIT-G2-03 in triage (both change these chip lists).
- **Guardrail:** polish
- **Screenshot:** `audit/BREAK-G2/end-1284-saved-webkit.png`, `…/recap-30long-webkit.png`

### BREAK-G2-05: A long custom name on the match and decision sheets runs past the panel and off the screen at large text

- **Screen and state:** match sheet (and the decision sheet, same markup) for a custom name such as "שלומציון-אביגיל רות" (19 chars, valid for `validateCustomName`), Safari Page Zoom 150 %
- **Browser:** zoom150 (the 60 px `h2`'s first word "שלומציון-" spans −3…265 px in a 262 px viewport, over the glass panel's edge). Fits at 393 and 320.
- **What's wrong:** the `h2` has `break-words` (`overflow-wrap: break-word`), which breaks a word only after layout has sized the box; in the centred flex column (`items-center`) the heading's min-content is its widest word, so a word wider than the panel pushes the box out instead of breaking. Data names are at most 8 letters and fit; custom names can be longer words.
- **Rule it breaks:** `break-ui` · `SKILL.md` Failure signatures · "Text overflows its box instead of wrapping … `min-width: 0` … `overflow-wrap: anywhere` breaks only when it has to"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `wrap-anywhere` instead of `break-words` on the name `h2` in `MatchSheet.tsx:128` and `DecisionSheet.tsx:72` (Tailwind 4, `overflow-wrap: anywhere`, which lowers min-content); the same on the card's `h2` (`card/CardHeader.tsx:42`) for parity, so a future longer data name can't do it either.
- **Guardrail:** polish
- **Screenshot:** `audit/BREAK-G2/match-custom-zoom150.png` (compare `match-custom-webkit.png`)

## Decisions for the owner

- **A vote the server refuses for good (RLS `42501`, membership gone) stays "saved" on this device with no message.** The store drops it and reports it (`voteStore.ts:312-315`); the pill keeps counting it. It happens only when the membership changed, and the closed/left space flow (`ClosedNotice`, the space reload) takes the user out of that space. Recommendation: no change. Not filed.

## What held up (checked, no finding)

- **Longest deck names on the card:** "איילת השחר" (wraps to 2 lines at zoom150, the card scrolls inside itself as designed), "זינאלדין", "כריסטיאן", "אלכסנדרה" stay on one line at 393, 320 and 262; niqqud isn't clipped (no `overflow: hidden` on the name).
- **28-char Hebrew surname with maqafs** (`בן־שושן־אבוטבול־רוזנבלום־כהן`) on the card wraps at a maqaf to two lines at 320/262, one line at 393; in the sheet's "עם שם המשפחה" well it wraps at maqafs (2–3 lines), no overflow.
- **Most content at once:** אריאל (2 people, 3 themes, Bible note), רות (longest verse), מאיה (longest intro, clamped to 2 lines), אמיליה (256-char story), אורי (6 similar names) all lay out in the card and the sheet in every width.
- **Counts:** saved 0/1/999/1,284 and position 1,291 of 1,295 fit the header and the card at every width (the pill grows to 82 px; the title is screen-reader-only under 360 px by design). Recap "שם אחד" / "אחד" / "30" (no "1 שמות"); sync line "בחירה אחת ממתינה לסנכרון" vs "12 בחירות…" (12 offline votes fit on one line at 320).
- **Match with 12 members** ("12 שמרו את השם הזה.") and the together badge with 12; a custom-name match with no stats shows no count line (no "undefined").
- **Vote write failing while online** (500, network): the card still moves, the pill counts it, and after 5 s the footer says "בחירה אחת ממתינה לסנכרון" (retried by the outbox).
- **Details file failing:** the sheet shows the card data and "הפרטים האלה יופיעו כשיהיה חיבור לאינטרנט" in place of the story (`details-fail-webkit.png`).
- **Deck end with exactly 1 saved, 0 saved, empty filter:** lay out (copy issues are CRIT-G2-02).
- **Horizontal overflow:** `scrollWidth == clientWidth` in every state and browser; the only box past the viewport in the whole run is -05's heading.

Not re-filed (other lenses have them): tabular digits for the same counts (PRO-G2-04, merged into -03), the deck-end/recap chips looking like buttons (CRIT-G2-03, merged into -04), the offline line's wording (COPY-G2-01), sheet content cut under the pinned bar at zoom (ELEV-G2-02), the details loading skeleton announcement (IMP-C-G2 / A11Y).
