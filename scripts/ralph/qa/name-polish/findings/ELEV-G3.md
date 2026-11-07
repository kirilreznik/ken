# ELEV · G3: Lists and settings (saved, row menu, chosen banner, add-name, matches, duel, hidden, settings and its dialogs, about, privacy, terms)

Run 2026-11-07 by US-A-ELEV-G3 at `3fd3d89` (no app code change since the baselines).

Skills read: `design-review` (`SKILL.md`, Visual Quality Inspector sub-agent; `art-direction.md` not loaded because G3 has no photos, every screen is `data-names-bg="none"`), `design-elevation` (`SKILL.md`, `references/elevation-protocol.md` phases 6–8, `references/design-interrogation.md`, `references/technique-catalog.md` "Visual Hierarchy", "Polish"), `frontend-design` (`SKILL.md`), `product-taste` (`SKILL.md`), `.claude/skills/shared/knowledge/visual-quality.md` and `typography.md`. Method as in ELEV-G1/G2: the Visual Quality Inspector workflow (squint, 3-second and grayscale tests; alignment, spacing, rhythm, balance; anti-patterns; inspection checklist) on every G3 state of `scores.md` "Screens G3", plus the loading states, which the baseline doesn't have. Then design-elevation's interrogation checklist and frontend-design's "restraint and self-critique" as a second pass. Every candidate was checked against boards 5, 6 and 7 (`05-lists.png`, `06-duel.png`, `07-about.png` and their `.dc.html`) and against the 39 G3 findings already filed (IMP-C, IMP-A, PRO, CRIT) before filing.

Assumptions and skips (same as ELEV-G1/G2): the artifact is the live app, stage "final"; maturity L2, the DS lens is left to US-A-DS. `design-elevation`'s Tailwind palette, exemplar overrides and its shadow recipes are not applied (Nest tokens are the owner's, PRD §3.1.2). `frontend-design`'s "brainstorm a token system and confirm with the client" is for new work: BRAND.md and the boards are the confirmed brief, nothing is redesigned (§3.1.1). Figma adapter and font-availability steps skipped. Severity: design-review P0/P1 → P1, P2 → P2, P3 → P3.

Evidence: `scripts/ralph/qa/name-polish/shots/audit/ELEV-G3/` (gitignored).
- `-webkit` (Playwright WebKit iPhone 15) and `-chromium` (Pixel 7): all 24 G3 states plus the `-full` pages, taken today on the dev server with `us007-g3.mjs` (`G3_OUT` = this folder, `G3_PORT=3000`).
- `loading-{saved,matches,duel,hidden}-{webkit,chromium}`: the loading placeholders, with `shots/elev-g3-loading.mjs` (QA user 1, real data; Supabase GETs held 4 s and then continued, nothing written).
- `elev-g3-tap-{delete,leave}-*`: the settings confirms opened with a real touch tap, with `shots/elev-g3-probe.mjs` (dialogs only opened).
- `-sim`: the US-007 Safari set (same app code), copied in. Narrow widths judged from `baseline/G3/*-webkit375.png` and `*-webkit320.png`.
- Numbers: pixel samples of the PNGs (3×) with PIL.

## Visual quality summary

**Squint / 3-second / grayscale.** Lists, hidden and the duel pass: the title, then the ink segment ("שמרתי · 8"), then the names at `row-name`, then the stone meta lines; hierarchy holds in grayscale (size, weight, ink vs stone). The duel is the strongest screen of the group: two names at `duel-name`, one "או" disc, one clay progress bar, nothing else. Settings passes (row labels, captions, one urgent row). In the lists squint, the second thing seen after the names is the column of eight ringed circles on the end edge (-01).

**What's working (≥3).**
- One list grammar across saved, matches, hidden, settings and the duel result: a white `radius-lg` card with `shadow-card`, `line` hairlines between rows, 14 px row padding, `row-name` over a `caption` meta line in stone. It's board 5's row, and it's the same in all five places.
- Restraint in color: the canvas, white cards, ink, and the peach family used only for "this is yours / this is next" (the chosen banner, the duel link, the "חדש" badge, the loved heart in clay). Nothing is green; the destructive "מחיקת החשבון" is the only `urgent` text.
- Segmented controls are one component in two places (lists tabs and the duel's "בין:" toggle): white pill track with a `line` border and the ink thumb, same 44 px height.
- Real content throughout: CBS counts, years and trends in every meta line, the CBS attribution in a `canvas` well on the about page, the legal pages' draft banner in the `caution` pair with an icon (status not by color alone).
- Confirm dialogs opened by a real tap don't draw the focus ring on "ביטול" (probe: `:focus-visible` false in WebKit and Chromium); the ring only shows when opened by URL or keyboard, which is right.

## Findings

### ELEV-G3-01: Every saved and matched row carries its own ringed circle

- **Screen and state:** `/names/lists` "שמרתי" (8 rows) and "התאמות" (3 rows), every width
- **Browser:** webkit-iphone · chromium-pixel (same markup in Safari; QA user 1 has no saved rows there)
- **What's wrong:** the row menu button uses `iconButtonClass()` (`RowMenu.tsx:84`), the glass round button of the headers. On the "ללא רקע" canvas `names-glass-soft` turns into a white disc with a `line` border (`names.css:148`), so inside a white list card every row ends in a 44 px outlined ring: eight rings stacked down the end edge of "שמרתי" (`lists-saved-default-webkit.png`). The rings are the second-heaviest shape on the screen after the names, heavier than the meta lines and the loved label, for a secondary control (the menu). The ring also sits 8 px from the card edge (`pe-2`, `ListsScreen.tsx:388`, `:529`) while the name starts 16 px from the other edge, and the hidden screen's row action and the duel result sit 16 px in, so the end inset differs between lists that share one row design. Board 5 has no control in the row at all (its end side holds "2 שמרו" / "אהבו מאוד"), so the ring is not the board's look.
- **Rule it breaks:** `visual-quality.md` · Craft & anti-slop "Decoration noise: … status dots before every item" and Craft moves "Separate without borders where possible"; `design-elevation` · `references/design-interrogation.md` · Reduction test "Is every element earning its space?" and Consistency "Are similar elements treated identically?".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** in `RowMenu.tsx`, draw the row trigger without the glass disc inside list cards: same 44 × 44 hit area and `rounded-pill`, transparent at rest, `text-ink-soft` dots, `active:bg-sand` / `aria-expanded:bg-sand` for the pressed and open states (keep `PRESS` from `classes.ts`, e.g. a small `iconButtonClass("plain")` variant so it isn't hand-rolled). The `pe-2` inset then puts the dots about 20 px from the edge, in line with the start side. Header round buttons keep their glass. Check focus stays visible (the global `:focus-visible` ring) and the open menu still anchors to the button.
- **Guardrail:** polish (existing tokens, shared component variant; board 5 row kept)
- **Screenshot:** `audit/ELEV-G3/lists-saved-default-webkit.png`, `audit/ELEV-G3/lists-matches-default-chromium.png`

### ELEV-G3-02: The loading placeholders are blank white boxes that don't match the list they turn into

- **Screen and state:** `/names/lists` "שמרתי" and "התאמות", the duel, `/names/hidden`, while votes, space or matches load (slow network, a cold start)
- **Browser:** webkit-iphone · chromium-pixel
- **What's wrong:** each loading state is one empty white card (`h-[78px]` at `ListsScreen.tsx:249`, `:323`, `:505` and `HiddenScreen.tsx:75`; `h-[180px]` at `DuelScreen.tsx:203`). It has no row shape, no text bars and no divider, so it reads as an empty card or a rendering gap, not "loading" (`loading-saved-webkit.png`, `loading-hidden-webkit.png`). When the data arrives a 78 px box becomes an 8-row list of about 620 px, or an empty-state card of another height, so the screen jumps; the duel's 180 px box becomes two 180 px cards with the "או" disc. Four copies of the same markup, none of them shaped like their result.
- **Rule it breaks:** `visual-quality.md` · Craft moves "Design every state: loading (skeleton matching final shape, not a generic spinner)"; `design-elevation` · `references/elevation-protocol.md` · Phase 6 Details and Polish "Loading states (skeleton, progress)".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** one small `ListSkeleton` (in `lists/`, used by saved, matches and hidden) in the list card's look: three rows of the row's real height (`py-3.5`, `line` dividers) each with a `bg-sand rounded-pill` bar for the name (`h-4`, about a third of the width) and a shorter one for the meta line, `aria-busy` and the "בטעינה" sr-only text kept. For the duel, two `rounded-xl bg-surface` boxes at the card's `min-h-[180px]` with the "או" disc between them. Static (no shimmer), so nothing new for reduced motion. No new token.
- **Guardrail:** polish (a missing state for something that exists, §3.1.4)
- **Screenshot:** `audit/ELEV-G3/loading-saved-webkit.png`, `audit/ELEV-G3/loading-duel-webkit.png`, `audit/ELEV-G3/loading-hidden-chromium.png`

### ELEV-G3-03: The duel's peach glow shows on its own when there are no cards

- **Screen and state:** duel "לדו־קרב צריך לפחות שני שמות ברשימה." (and the matches variant), and the duel while loading
- **Browser:** webkit-iphone · chromium-pixel · sim
- **What's wrong:** the blurred peach blob (`DuelScreen.tsx:157`, from board 6, `top: 260px`) is placed to sit behind the two name cards. When there's no pair, the only card is a short message at the top, and the glow sits alone in the empty canvas under it, a soft orange stain in the middle of a blank screen (`duel-few-sim.png`, `duel-few-webkit.png`, `loading-duel-webkit.png`). Without the cards it has nothing to light, and it's the only colored thing on the screen.
- **Rule it breaks:** `design-elevation` · `references/design-interrogation.md` · Red flags "Decorative elements without function" and Reduction test "What happens if I remove this element?".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `DuelScreen.tsx`, render the blob only when a pair or the result is on screen (`ready && duel && p`), so the few-names and loading states are plain canvas like lists and hidden. The board 6 look of the duel itself is unchanged.
- **Guardrail:** polish (board 6 kept for the state it draws)
- **Screenshot:** `audit/ELEV-G3/duel-few-sim.png`, `audit/ELEV-G3/duel-few-webkit.png`, `audit/ELEV-G3/loading-duel-webkit.png`

### ELEV-G3-04: The name and its "אהבתי מאוד" label are centered, not on one baseline

- **Screen and state:** `/names/lists` "שמרתי" loved rows, "התאמות" rows with `סומן ״אהבתי מאוד״`
- **Browser:** webkit-iphone (measured) · chromium-pixel (same markup)
- **What's wrong:** the name line is `flex flex-wrap items-center` (`ListsScreen.tsx:390`, `:531`), so the 17 px `row-name` and the 12 px bold caption are centered on each other. Their baselines miss by about 1.3 CSS px (row "מוחמד", 3× shot: name glyphs end at y 853, the label's at y 849; neither has descenders), so the label floats a little above the name it qualifies. Small, but it repeats on every loved row.
- **Rule it breaks:** `visual-quality.md` · Alignment "Baseline alignment: for mixed type sizes or icon+text pairs, align to the text baseline, not the bounding box" and "Alignment tolerance: 0px"; `typography.md` · Hierarchy "When aligning text of mixed sizes on one line, align by baseline".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `items-baseline` on that name line in both panels; the heart keeps `self-center` inside its own `flex items-center` label, and the "חדש" pill gets `self-center` so it stays centered. Re-check at 320 px where the label wraps under the name.
- **Guardrail:** polish
- **Screenshot:** `audit/ELEV-G3/lists-saved-default-webkit.png`, `audit/ELEV-G3/lists-matches-default-webkit.png`

## Considered and not filed

| Seen | Why not filed |
|---|---|
| Meta lines break inside a unit at 320 px: "→" / "יציב" (lists, matches), "ניתן ל־740" / "ב־2024" (hidden), and the matches loved label wraps under the name | Covered by IMP-C-G3-10's `whitespace-nowrap` on the trend; triage should widen it to every " · " segment of `rowMeta` lines (lists, matches, hidden, duel result) so wraps only fall between segments |
| Settings "שמירה" at rest is the glass pill at 60 % opacity | Same `DISABLED` rule as ELEV-G1-01 (`buttonClass`); on the canvas it reads as disabled, not muddy; one fix covers it |
| The add-name field's focus ring floats outside its border (also with the "כבר ברשימה" error) | ELEV-G1-02 (text fields), IMP-C-G3-16 (settings field spec) |
| Settings section headings at 10.5 px, the switch's faint "off" track | IMP-C-G3-24, IMP-C-G3-04 |
| Three empty-state patterns; the duel's few-names card is start-aligned | IMP-C-G3-02 |
| One-word last lines in intros and legal items ("יודע.", "שוב.", "נתונים.") | IMP-C-G3-23 |
| The duel's "top five so far" ink chips; round counter | IMP-C-G3-13, IMP-C-G3-11 |
| About's hand-rolled report button | IMP-C-G3-21 |
| Ink focus ring on "ביטול" in the settings confirms | Only when opened by URL or keyboard; a real tap gives no ring (probe), which is right |
| Loved label and kept count placed differently from board 5 (board: at the row's end) | The end side now holds the row menu (detail run, FR-W18); not a craft defect. -01 keeps the end side quiet |
| " · " meta joins, the clay dot in the chosen banner | Boards 5 and 6 draw both; the clay dot means "chosen / now" as everywhere else (ELEV-G2 summary) |
| Header with three round/pill controls (back, invite, "הוספת שם") | The invite button is a detail-run decision; at 320 px it's IMP-C-G3-10 |

## What was checked

All 24 G3 states of `scores.md` "Screens G3" in WebKit and Chromium (plus `-full` pages), the 11 Safari states, the narrow widths (375 × 667, 320 × 568) from the baseline, the four loading states, and the two settings confirms after a real tap. Per screen: squint / 3-second / grayscale; edge alignment of titles, intros, cards and row content; spacing on the token scale (all values are `spacing-*` steps; arbitrary values are only the skeleton heights, `max-w-[480px]` and the switch knob offset); radius use (`lg` for list cards, `xl` for duel cards, `md` for wells and fields, `pill` for controls: consistent); shadows (`shadow-card` for lists and settings, `shadow-hero` for the duel cards only); icon set (one 24-unit stroke-2 family in G3); type sizes per view (≤ 4 roles on every screen except the about page, which mirrors board 7).
