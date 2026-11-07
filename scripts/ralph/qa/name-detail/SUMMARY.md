# Name detail sheet: run summary

Run: `tasks/prd-name-detail.md`, branch `ralph/name-detail` (from origin/main 58dba48, 74 commits ahead). Written by US-FINAL on 2026-11-07.

## Result: clean after cycle 3

- **Stories:** 131 of 131 done. That covers US-000 to US-074 (build, content, docs, self-audit), US-QA0, and the 3 QA cycles: 17 areas (A–Q) each, all run in full. US-FIX1 and US-FIX2 committed fixes. US-FIX3 was skipped because cycle 3 found nothing.
- **QA cycles:** cycle 1 filed 6 bugs, fixed in e366e14. Cycle 2 filed 1 bug, fixed in f9bedbe. Cycle 3 filed 0 bugs.
- **Bugs:** 7 filed, 7 `fixed`, 0 `open`, 0 `blocked`, 0 `wontfix-owner`. Details, steps and screenshots are in [bugs.md](bugs.md).
- **Final re-check:** US-FINAL re-checked ND-BUG-007, the last fixed bug (cycle 2; cycle 3 fixed nothing), in Simulator Safari on the :3100 build of f9bedbe (iPhone 17 Pro, iOS 26.5, QA user 1 with a surname set). A double tap and a triple tap on the card each open one clean sheet, with no text selected and no Copy callout. One Back closes the sheet and Safari's back arrow then greys out. It still holds. Screenshots: `shots/qaF-a-sim-deck.png`, `qaF-a-sim-dbl.png`, `qaF-a-sim-m1.png` (closed + triple), `qaF-a-sim-back.png`.

| ID | Cycle found → fixed | Browser | Summary | Screenshots (`shots/`) |
|---|---|---|---|---|
| ND-BUG-001 | 1 → 1 | webkit-iphone, chromium-pixel | A quick double tap opened the sheet and closed it again | `qa1-a-webkit-taps2-gap40.png`, `qa1-a-chromium-taps2-gap40.png` |
| ND-BUG-002 | 1 → 1 | webkit-iphone, chromium-pixel | From the 2nd tap-open on, focus left the sheet and Escape didn't close it | `qa1-b-webkit-seq-x.png`, `qa1-b-chromium-seq-x.png` |
| ND-BUG-003 | 1 → 1 | all three | A year picked on one chart stayed picked on a similar name's sheet | see bugs.md |
| ND-BUG-004 | 1 → 1 | chromium-pixel | Intermittent: undo after דילוג from the sheet left the next card on top | see bugs.md |
| ND-BUG-005 | 1 → 1 | chromium-pixel (webkit same code) | Clarity recorded `?sheet=name&n=<name>` | see bugs.md |
| ND-BUG-006 | 1 → 1 | chromium-pixel, webkit-iphone | Leaving through the surname link sent no `detail_closed` | see bugs.md |
| ND-BUG-007 | 2 → 2 | sim-safari | A quick double tap opened the sheet with a word selected and Safari's Copy menu over it | `qa2-a-sim-dbl2.png`, fixed: `fix2-m1.png`, `fix2-m2.png`, `fix2-m4.png` |

`shots/` is gitignored, so the screenshots are on this Mac only (`scripts/ralph/qa/name-detail/shots/`).

## UX ideas for the owner (not acted on)

QA logged 8 non-blocking ideas, all in cycle 1. They're in [ux-insights.md](ux-insights.md). One needs a decision:

- **ND-UX-008:** settings offers "יציאה מהבחירה המשותפת", but `names_leave` (migration 0011) isn't on the Nest (EU) backend, so leaving always shows the error copy. The success path was tested only against `mock-supabase.mjs`. To fix it, either apply the migration or hide the action. This run doesn't change the backend.

## Content coverage (from `data/names/content-src/DETAILS-REPORT.md`)

- 1295 of 1295 deck names are covered, in 20 batches.
- 1276 have a story and 19 have none. Each of those 19 has its reason listed in the report: mostly old Arabic or Yiddish names whose meaning isn't well established.
- 548 names list similar names. The symmetry fill added 159 links: if A lists B, B lists A.
- 0 warnings and 0 dropped similar names. 3 lists were cut at the cap of 6, all in the אור family.
- Published file: `public/names/data/details.63dfc2585e97.json`, 492,347 B raw and about 107 KB with gzip -9.

### Spot-check files to read

The index is `data/names/content-src/spot-check-details-INDEX.md`. Each file has 10 seeded random entries; mark each row OK or note a change. Read at least 3:

- `data/names/content-src/spot-check-details-001.md`: the most common names.
- `data/names/content-src/spot-check-details-011.md` or `-019.md`: Arabic and Yiddish names.
- `data/names/content-src/spot-check-details-020.md`: the rarest names.

None has been read by the owner yet.

## Performance (US-072, re-measured in US-QA3-Q)

- **First-load JS, gzipped** (`shots/us072-size.mjs`, :3100 production build):
  - `/names`: 297,197 B on origin/main, 301,489 B on the branch (+4,292 B, within the 5 KB budget).
  - `/names/lists`: 283,179 B on main, 290,498 B on the branch (+7,319 B, no budget set; this is the lists screen's own US-066/067 code).
- **Lazy loading:** the sheet code is a lazy chunk, preloaded on card pointerdown/focus.
- **Tap → sheet visible** (pointerup → dialog heading in the DOM + next frame, localhost):
  - Chromium Pixel 7: first open 99 ms, later 47–48 ms. With 4× CPU throttle: first 84 ms, later 31–52 ms.
  - WebKit iPhone 15 (US-072): first 96 ms, later 78–82 ms.
  - All are under the 150 ms target.
- **Details file:** fetched once over 9 opens, served gzipped and immutable, precached by the service worker (v4).
- **Layout shift:** CLS 0 while the sheet opens and closes.

## Blocked or limited checks

Nothing was blocked. Every QA area ran in all the browsers PRD §11.4 names. These limits of the tools are not covered:

- **Simulator tap speed:** in the Simulator, cliclick can't double tap faster than about 260 ms. The 40–70 ms double tap from ND-BUG-001 was verified in Playwright WebKit and Chromium only.
- **Keyboard in the Simulator:** Safari there ignores hardware keys unless a text field has focus. Keyboard checks (Enter, Space, Escape, Tab, focus return) ran in Playwright WebKit, Playwright Chromium and desktop only.
- **Own photo in Playwright WebKit:** its ephemeral context can't store a Blob in IndexedDB, so "תמונה משלי" was checked in Chromium and the Simulator only (ND-UX-005).
- **Clarity:** no real project id is set locally. The leak checks used a temporary build with a fake id and a local copy of the tag. Uploads were caught in Chromium; Playwright WebKit catches none.
- **Chart with no data:** this line can't be produced in the Simulator (no request routing), so it was checked in Playwright.
- **Leaving a shared choice:** see ND-UX-008. The success path was tested against the mock backend only.
- **Real devices:** no physical iPhone or Android phone was used, only the Simulator and emulated Playwright devices.
- **Known test noise:** some Playwright failures were caused by the scripts, not the app. Example: WebKit's "Fetch API cannot load" when a script navigates away mid-fetch (area N), and fast scripted taps inside BottomSheet's 350 ms open guard (area O). Both were reproduced and explained in `progress.txt`. They are not filed as bugs.
