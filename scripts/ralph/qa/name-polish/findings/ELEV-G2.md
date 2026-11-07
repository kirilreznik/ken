# ELEV · G2: Deck (swipe screen, name sheet, filters, background, match, decision, survey, about, report, toasts)

Run 2026-11-07 by US-A-ELEV-G2 at `64a2d9f` (no app code change since the baselines).

Skills read: `design-review` (`SKILL.md`, Visual Quality Inspector sub-agent, plus `shared/knowledge/art-direction.md` "Imagery Review Checklist" because the deck sits on photos), `design-elevation` (`SKILL.md`, `references/elevation-protocol.md`, `references/design-interrogation.md`, `references/technique-catalog.md` "Visual Hierarchy", "Premium Feel", "Polish"), `frontend-design` (`SKILL.md`), `product-taste` (`SKILL.md`), `.claude/skills/shared/knowledge/visual-quality.md` and `typography.md`. Method as in ELEV-G1: the Visual Quality Inspector workflow (squint, 3-second and grayscale tests; alignment, spacing, rhythm, balance; anti-patterns; inspection checklist) on every G2 state of `scores.md` "Screens G2", then design-elevation's interrogation checklist and frontend-design's "restraint and self-critique" as a second pass, and every candidate checked against boards 2–4, 8–15 before filing.

Assumptions and skips (same as ELEV-G1): the artifact is the live app, stage "final"; maturity L2, the DS lens is left to US-A-DS. `design-elevation`'s Tailwind palette and exemplar overrides are not applied (Nest tokens are the owner's, PRD §3.1.2). `frontend-design`'s "brainstorm a token system and confirm with the client" is for new work: BRAND.md and the boards are the confirmed brief, nothing is redesigned (§3.1.1). Figma adapter and font-availability steps skipped. Severity: design-review P0/P1 → P1, P2 → P2, P3 → P3.

Evidence: `scripts/ralph/qa/name-polish/shots/audit/ELEV-G2/` (gitignored).
- `-webkit` (Playwright WebKit iPhone 15) and `-chromium` (Pixel 7): the G2 states, taken today on the dev server with `us006-g2.mjs` (`G2_OUT` = this folder, `G2_PORT=3000`). `survey-default-webkit` didn't save in this run; the baseline copy is `survey-default-webkit-baseline.png` (same code).
- `-sim`: the US-006 Safari set (same app code), copied in. Narrow widths judged from `baseline/G2/*-webkit375.png` and `*-webkit320.png`.
- Numbers: `shots/elev-g2-probe.mjs` (WebKit, QA user 1, read-only: card tile, sparkline and stamp boxes) and pixel samples of the PNGs (3×).

## Visual quality summary

**Squint / 3-second / grayscale.** The swipe screen passes: the name at `text-name` is the one focal point, the ink "שמירה" pill is the one dark action, the "השמות שלי" ink pill balances it at the top; hierarchy holds in grayscale (size, weight, ink vs ink-soft). The name sheet passes (name, then section labels, then body). End and pause panels pass on their own, but the Nest card's ink button is a second focal point (already PRO-G2-05).

**What's working (≥3).**
- One shape language across the deck: `radius-xl` card and panels, pills for every button, chip and toast, `radius-md` wells and fields; one glass grammar (translucency, a light border and the inset highlight, no fuzzy drop shadows on glass), which is `visual-quality.md`'s "glassmorphism: translucency and specular gloss, not fuzzy drops".
- Restraint in color: ink, ink-soft and peach/clay as the only warms; the clay dot marks "now" in both the sparkline and the year chart, and the match/decision dot, so the accent means one thing. Matches are calm, never green.
- The subject leads: a real name at display size, real CBS numbers, the verse with its reference; no stock imagery, no fabricated numbers (art-direction checklist: photo palette coheres with the product palette, text over photos sits on glass, never white on the photo).
- Real Safari and Chromium render the card glass warm peach (sampled rgb 255, 216, 174 on fabric), matching board 08 (255, 232, 202). Playwright WebKit doesn't apply the backdrop `saturate()`, so its card looks whiter; glass color was judged from `-sim` and `-chromium`.

## Findings

### ELEV-G2-01: The disabled decision bar turns photo-brown under the end and pause panels

- **Screen and state:** `/names` deck end (solo, shared, nothing saved), round recap, invite pause, empty filter result (every state where `ActionBar` is `disabled`)
- **Browser:** webkit-iphone · chromium-pixel (Playwright only: these states need mocked votes)
- **What's wrong:** `DecisionButtons` dims a disabled pill with `aria-disabled:opacity-60` (`DecisionButtons.tsx:9`). Over a photo the glass and the photo show through, so "שמירה" turns from ink (rgb 31, 27, 30) to a muddy brown (sampled rgb 104, 70, 52 on fabric, `deck-end-shared-webkit.png`), "אהבתי" goes beige and "דילוג" grey-orange; the colors change with the photo under them. It reads as a different, brownish bar rather than the same bar "not now", and the white label on the brown pill loses contrast. Same defect as ELEV-G1-01 in the second disabled-style copy (`DecisionButtons` has its own `DISABLED`, separate from `buttonClass`).
- **Rule it breaks:** `design-elevation` · `references/design-interrogation.md` · Color "Is color used consistently across similar elements?" and Detail "Do interactive states feel considered?"; `visual-quality.md` · Craft moves "Design every state".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** one opaque, token-based disabled look for the three pills and the round undo when `aria-disabled` (in `DecisionButtons.tsx` `DISABLED`, mirrored by ELEV-G1-01's `buttonClass` change), e.g. `aria-disabled:bg-line aria-disabled:text-stone aria-disabled:shadow-none aria-disabled:border-transparent` instead of opacity, so the bar goes flat and quiet in every background. This is also the fix PRO-G2-03 asks for (the disabled bar competing with the panel's button); merge ELEV-G1-01, PRO-G2-03 and this one in triage. Check the disabled label stays ≥ 3:1.
- **Guardrail:** polish (existing tokens)
- **Screenshot:** `audit/ELEV-G2/deck-end-shared-webkit.png`, `audit/ELEV-G2/deck-pause-recap-webkit.png`, `audit/ELEV-G2/deck-end-solo-chromium.png`

### ELEV-G2-02: Sheet content is cut off hard under the header and above the pinned buttons

- **Screen and state:** name sheet at 70 % and full (every background), with the together badge scrolled; filters, about and report sheets when their body scrolls
- **Browser:** webkit-iphone · chromium-pixel · sim
- **What's wrong:** `BottomSheet` puts the header and the footer outside the scroller (`BottomSheet.tsx:293–306`) with nothing marking the edge, so content is sliced mid-element: at 70 % the year chart's frame and its "30" axis line end in a straight cut just above the decision pills (`detail-70-bg-fabric-webkit.png`; in Chromium the axis years "2000 2012 2024" are cut in half, `detail-70-bg-fabric-chromium.png`); scrolled, the "מהתנ״ך" label shows as a row of half glyphs under the name header (`detail-together-webkit.png`). On a white sheet it looks like a rendering glitch rather than "there's more".
- **Rule it breaks:** `design-elevation` · `references/design-interrogation.md` · Polish "Does zooming in reveal attention to detail?" and Detail "Do interactive states feel considered?"; `visual-quality.md` · Craft moves "Separate without borders where possible (spacing / background shift / soft shadow)".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** in `BottomSheet`'s scroller, fade the edge that has more content instead of cutting it: a mask of one spacing step at the top and bottom (`mask-image: linear-gradient(to bottom, transparent, black var(--spacing-4), black calc(100% - var(--spacing-4)), transparent)` in `names.css`, applied only while the content overflows, e.g. a `data-scrolled` / `data-more` attribute set from the existing `scroller` ref on scroll), or, if a mask costs too much on WebKit, a `border-line` hairline on the header's bottom / footer's top under the same condition. One change in the shared component covers every sheet. Check reduced transparency (the mask is not transparency of a surface) and that the first line isn't faded at rest.
- **Guardrail:** polish (shared component, spacing token)
- **Screenshot:** `audit/ELEV-G2/detail-70-bg-fabric-webkit.png`, `audit/ELEV-G2/detail-70-bg-fabric-chromium.png`, `audit/ELEV-G2/detail-together-webkit.png`

### ELEV-G2-03: The "שמירה" swipe stamp ghosts over the card's position line

- **Screen and state:** `/names` deck, card dragged towards save (and towards skip on the other corner)
- **Browser:** webkit-iphone · chromium-pixel (Playwright: a held drag); the stamp is the same element in Safari
- **What's wrong:** the keep stamp sits at `top-5.5 end-5` (`NameCard.tsx:24`), which is the header row: its box (probe: top 85–147 px, left 38–141 px) covers the "(i)" button and "שם 1 מתוך 1295" (top 101–118 px, left 71–156 px). Its fill is `--nest-white-75`, so the position line and the icon read through the stamp ("1295" visible behind "שמירה", `deck-drag-end-webkit.png`): two texts layered on each other at the moment the user is deciding. The skip stamp does the same over the sex tag.
- **Rule it breaks:** `visual-quality.md` · Hierarchy verification "Squint test … if nothing stands out → no clear hierarchy" and Craft moves "tactile active feedback"; `design-elevation` · `references/design-interrogation.md` · Detail "Do interactive states feel considered?".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** give the stamp an opaque fill (`bg-surface` instead of `bg-(--nest-white-75)` in the `stamp` class), so it covers the header row cleanly like a real stamp; keep its position, rotation and colors. (Moving it down into the empty band above the name is the alternative, but the band is short on 375 × 667 and 320 px.)
- **Guardrail:** polish (token swap; landing page's `.nd-stamp` untouched)
- **Screenshot:** `audit/ELEV-G2/deck-drag-end-webkit.png`, `audit/ELEV-G2/deck-drag-end-chromium.png`

### ELEV-G2-04: The sparkline floats 11–14 px inside the tile that its label and word align to

- **Screen and state:** `/names` deck card, the trend tile (every name with recent years), all backgrounds
- **Browser:** webkit-iphone (measured) · chromium-pixel · sim (same markup)
- **What's wrong:** the tile's label "2000–2024" and the trend word both span the tile's content box (probe: x 54–178 px), but the line is drawn from x 68 to 164 px: the `<svg width="132" height="28">` is squeezed by `max-w-full` to 124 px while keeping its height, and `preserveAspectRatio` (default `meet`) letterboxes the drawing in the middle. So the chart's "now" end (the clay dot) stops about 11 px short of the start edge the text above and below it shares, and the left end stops 14 px short of the end edge: a centred figure between two start-aligned lines.
- **Rule it breaks:** `visual-quality.md` · Alignment "Alignment tolerance: 0px. There is no 'close enough.'" and Anti-patterns "Fake alignment — visually close but not on the grid".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** in `CardStats.tsx` let the sparkline take the tile's width and scale its height with it (`className="h-auto w-full"`, keep the `viewBox`), so both ends sit on the tile's edges (the viewBox's own 4-unit margin keeps the dot inside). Height grows by about 6 px at 390 px: re-check the card doesn't scroll at 390 × 844 (§3.1.3) and at 375 × 667 / 320 px, and cap with `max-h-8` if it does.
- **Guardrail:** polish (card layout of board 12 kept)
- **Screenshot:** `audit/ELEV-G2/deck-bg-fabric-webkit.png`, `audit/ELEV-G2/deck-bg-none-chromium.png`

### ELEV-G2-05: The report and survey fields show the native resize grip and a floating focus ring

- **Screen and state:** report sheet (`?sheet=report`, field focused on open), survey sheet free-text fields
- **Browser:** webkit-iphone · chromium-pixel · sim
- **What's wrong:** both textareas are `resize-y` (`ReportSheet.tsx:173`, `SurveySheet.tsx:34`), so the browser draws its diagonal resize grip in the bottom start corner, which can't be dragged with a finger in Mobile Safari; and the global `:focus-visible` ring (2 px ink at 2 px offset) draws a second rounded outline outside the field's own `line` border (`report-default-webkit.png`, `report-default-sim.png`). It's the "default software element showing" look on a white sheet that has nothing else in it.
- **Rule it breaks:** `design-elevation` · `references/design-interrogation.md` · Refinement "Are there default software elements showing?" and Red flags "System UI elements showing".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `pointer-coarse:resize-none` on both fields (desktop keeps the grip), and include `textarea` in ELEV-G1-02's text-field focus rule (`outline-offset: 0; border-color: var(--nest-ink)`). Merge with ELEV-G1-02 and IMP-A-G2-04 / -05 (same fields) in triage.
- **Guardrail:** polish (no token change; focus stays visible)
- **Screenshot:** `audit/ELEV-G2/report-default-webkit.png`, `audit/ELEV-G2/report-default-sim.png`

### ELEV-G2-06: Icons on the deck mix 1.8, 2 and 2.5 px strokes

- **Screen and state:** filters sheet "נושאים" chips; the card's "לכל הפרטים" chevron
- **Browser:** webkit-iphone · chromium-pixel · sim
- **What's wrong:** DESIGN.md: "Line icons have a 2 px stroke … the same family as the logo's line", and 30 icons follow it. Two don't: `ThemeIcon` draws every theme chip icon at `strokeWidth="1.8"` (`ThemeIcon.tsx:90`), visibly lighter than the header's filter and background icons right above the sheet; the card's chevron is `strokeWidth="2.5"` (`NameCard.tsx:70`), heavier than the close and skip X. (The 14 px error and check icons in the report sheet use 2.4 as optical compensation at small size; not filed.)
- **Rule it breaks:** `visual-quality.md` · Anti-patterns "Mixed icon stroke widths — 1.5px strokes next to 2px strokes … Use one icon set with one stroke weight per project"; `design-elevation` · Red flags "Icons from different families".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `strokeWidth="2"` in `ThemeIcon.tsx` and in the chevron of `NameCard.tsx`. Check the theme icons at 20 px still read (they are Lucide paths drawn for 2 px).
- **Guardrail:** polish
- **Screenshot:** `audit/ELEV-G2/filters-default-webkit.png`, `audit/ELEV-G2/deck-bg-fabric-webkit.png`

## Seen and already filed

| What the visual pass found | Filed as |
|---|---|
| Back cards' edges show through the current card's glass | IMP-C-G2-02 |
| "לשמות שלי" squashed pill on the solo end; saved-name lists look like buttons | IMP-C-G2-01, CRIT-G2-03 |
| Nest card's ink button is a second focal point on end/pause/decision | PRO-G2-05 |
| Disabled bar competes with the panel's button | PRO-G2-03 (ELEV-G2-01 adds the color) |
| "הוספת שם משפחה" is the sheet's second strongest line | CRIT-G2-05 |
| 11 px section labels and tags | PRO-G2-06 |
| Niqqud on the match card, not on the decision card; "מזל טוב!" | IMP-C-G2-14, IMP-C-G2-03 |
| "#980" rank; proportional digits in changing numbers | IMP-C-G2-19, PRO-G2-04 |
| Offline line in the sheet has no icon; offline sync line shifts the screen | IMP-C-G2-15, IMP-A-G2-01 |
| Year chart tooltip stays on after a drag (sim) | IMP-A-G2-03 |
| Decision sheet's main action below the fold | IMP-C-G2-08 |
| Filters, survey and report sheets without a close button | IMP-C-G2-06 |

## Checked and clean

Radii: `xl` card, panels and sheet tops, `md` wells and fields, `pill` buttons, chips, tags and toast, no stray values. Shadows: `shadow-button` under ink pills only, glass without drop shadows, `shadow-card`/`-raised` on the "ללא רקע" stack. Spacing: card `p-5`/`gap-3`, sheet `px-5`/`gap-5`, action bar `gap-2` (`gap-1.5` under 360 px), identical on every background; the action bar's start edge lines up with the card's (20 px) at 393 and 412 px. Typography: three working sizes per view on the card (name, intro, caption/tag) and in the sheet (name, body, label); line heights within `typography.md`'s ranges; numbers in `bdi`. Grayscale: every state keeps its hierarchy. Art direction: the three photos are warm, quiet and soft-focus, text never sits directly on a photo, own photo gets the stronger glass and scrim (Chromium and Safari), no stock smell.

Considered and not filed:
- Meta strings joined with " · " ("תינוקות · נדיר", "התאמה · שניכם…", the source line, known-people rows, similar-name chips): frontend-design lists them as a template tell, but boards 12–14 draw exactly these joins, so they're the owner's design (ELEV-G1-06 was filed only because the invite screen has no board).
- The card's empty band between the header row and the name, and between the words and the numbers, on tall phones: board 12 places the name block the same way (`justify-center-safe`), and the card must not scroll at 390 × 844.
- The verse well's book icon reads a little like a square: its path is the boards' own (`Main.dc.html`, `GlassFabric.dc.html`).
- The sheet is opaque white over the photos (not glass): board 13 draws it white.
- The skip long-press menu overlaps the "אהבתי" pill and covers "לכל הפרטים": it's a transient menu anchored to the skip pill; nothing it covers is needed while it's open.
- At 320 px the settings gear stands alone at the start of the header (the title is visually hidden there): a deliberate narrow-screen rule (`SwipeHeader.tsx`), the controls keep their 44 px targets.
- Match and decision cards share the same structure and the same `clay-deep` eyebrow.
