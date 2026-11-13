# PRO · G2: Deck (swipe screen, name sheet, filters, background, match, decision, survey, about, report, toasts)

Run 2026-11-07 by US-A-PRO-G2 at `e0ec531` (no app code change since the baselines).

Skill: `ui-ux-pro-max` (`.claude/skills/ui-ux-pro-max/SKILL.md`). References read: `references/quick-reference.md` (all 10 categories, the rule IDs cited below) and `references/pro-rules.md` (the professional-UI tables and the canonical Pre-Delivery Checklist). `scripts/search.py` was run with `python3` for the rules cited: `"text grows zoom truncation" --domain ux`, `"press feedback active state" --domain ux`, `"disabled state opacity" --domain ux`, `"primary call to action single" --domain ux`, `"small text minimum size" --domain ux`, `"timer numbers shift" --domain ux`.

Assumptions where the skill would ask: the stack is detected, not asked (Next.js 16 + Tailwind 4, `--stack html-tailwind`). The skill's review method for an existing UI is "follow priority 1→10, then run the Pre-Delivery Checklist". Step 2 (`--design-system`, `--persist`) is for new pages and would replace the owner's look, so it wasn't run (PRD §3.1.1–2). No palette, font or GSAP preset from the skill is proposed. Dark-mode checklist items are n/a: the app is light only by design (PRODUCT.md, DESIGN.md). As in PRO-G1, searches that returned off-topic rows fall back to the static rule in `quick-reference.md` (the skill's "retry once, then fall back"): `primary call to action single` returned "Dragging Movements", and `timer numbers shift` returned "Number Formatting", so -05 and -04 cite `primary-action` and `number-tabular` directly.

## Method and evidence

- **All 45 G2 states** (the `scores.md` "Screens G2" inventory) were shot in WebKit iPhone 15 and Chromium Pixel 7 on the dev server: `G2_OUT=…/audit/PRO-G2 G2_PORT=3000 node shots/us006-g2.mjs webkit chromium`. That's 89 PNGs. `survey-default-webkit` failed on the known `?sheet=survey` redirect race, and the probe covers that state.
- **Probe** `shots/pro-g2-probe.mjs` (gitignored). It uses the IMP-A-G2 mocks (votes echoed, never sent, sign-out answered locally) and the PRO-G1 measures. It covers 19 states: deck on fabric and none, after a vote, offline with a pending decision, survey prompt, deck end, invite pause, name sheet (70 % and at the similar names), together badge, filters (top and end), background, about, report, survey, match, decision solo and shared. For each state it measures:
  - target sizes, gaps (`touch-spacing`), press classes, `cursor`, `touch-action` and disabled opacity
  - the smallest text, line-height ratios and characters per line
  - input semantics
  - which changing numbers are tabular
  - dialog labels, close controls and scroll containers
  - chart labels and focusability, the toast text and primary (`bg-ink`) controls
  - overflow and scroll height

  Modes: WebKit portrait, landscape 844 × 390 and 320 × 568; Chromium portrait, 200 % zoom (206 × 420) and desktop 1280 × 800.
- **Rendered contrast** `shots/pro-g2-contrast.mjs`: the text's computed color against the median and the worst pixel of its own box, shot with the text made transparent. It measured the deck card's small text on all four backgrounds, plus the sheet's eyebrow and caption.
- **Landscape sheets** `shots/pro-g2-landscape.mjs`: the match and decision sheets are taller than 390 px, so it scrolls them to check that their buttons can be reached. **200 % zoom bar** `shots/pro-g2-zoombar.mjs`: the decision buttons' widths against their label widths.
- **Simulator** (Mobile Safari, iPhone 17 Pro): Safari is now signed out on `localhost:3100` (`audit/PRO-G2/deck-sim.png` shows welcome), and a new sign-in needs a code email. The Safari judgement therefore uses the US-006 Safari set `baseline/G2/*-sim.png` (23 states, no app code change since). Rotating with ⌘← opened Safari's tab overview (`deck-sim-landscape.png`), which isn't useful. Landscape was judged in Playwright WebKit instead.
- **Shots:** `scripts/ralph/qa/name-polish/shots/audit/PRO-G2/`. The full set is named `<state>-<webkit|chromium>.png` (us006 names). Probe shots are named `<state>-<engine>[-landscape|-zoom200|-desktop|-w320].png`, plus `deck-bar-chromium-zoom200.png`.
- **Harness noise:** every probe context logs one `pageerror` ("The operation is insecure" in WebKit, "Access is denied … sessionStorage" in Chromium). It comes from the probe's own init script running on `about:blank` (it sets prefs through `sessionStorage`), not from the app.

## Checklist results (priority order, then Pre-Delivery Checklist)

| # | Category | Result |
|---|---|---|
| 1 | Accessibility | **Contrast passes everywhere measured.** On fabric, notebook and nursery the position line and the card's year caption are 7.2–8.8:1 at the worst pixel, the sex tag 4.6–5.1:1, the sheet eyebrow 9.8:1 and the caption 17:1. On "ללא רקע", 5.1–5.7:1. Every dialog is `aria-modal` with a name ("גבריאל", "סינון", "יש התאמה: נועם", "בחרתי שם: נועם"…). Charts are `role=img` with full sentences ("מספר התינוקות בכל שנה, 2000 עד 2024…"). The sheet's chart is focusable with arrow keys and an `aria-live` readout (`tooltip-keyboard`). Swipe has visible buttons (`dragging-alternative`). Heading order is sequential (h1 → h2 → h3). Text at 200 % zoom is -01 |
| 2 | Touch & Interaction | All targets ≥ 44 px in portrait, landscape and 320. Exceptions: the deck-end "לשמות שלי" pill in WebKit (96 × 22, already IMP-C-G2-01) and the decision buttons at 200 % zoom (40 px wide, -01). `touch-action: manipulation` on the deck controls, `none` on the card and the handle. **Press feedback:** -02. The disabled bar under the end/pause panels: -03 |
| 3 | Performance | CLS from the sync line is IMP-A-G2-01, images and the sheet's open time are IMP-A-G2 / US-004. Skeletons for details loading (`progressive-loading`) are in place |
| 4 | Style | One icon family, no emoji icons. **`primary-action`:** the deck has one ink CTA ("שמירה") besides the saved-count pill. The deck end, the decision sheet and the recap stack the Nest card's ink button on top of the screen's own primary (-05) |
| 5 | Layout & Responsive | No horizontal overflow in any state or mode. Landscape: the deck scrolls (540/390) to its action bar. The match (552 px) and decision (763 px) sheets scroll in their wrapper, and their buttons come into view. 320 px drops the header title and the bar's icons as designed. `min-h-dvh` and the safe areas are honored (US-006 Safari set) |
| 6 | Typography & Color | Tokens only. Paragraph line-heights are 1.38–1.63 and lines are 24–53 characters on a phone (`line-length-control` 35–60). Changing numbers aren't tabular (-04). 11 px tag and 10.5 px label tokens are under the skill's 12 px floor (-06, owner) |
| 7 | Animation | Card fly-off, sheet slide and press scale. Reduced motion and interrupted gestures were covered by IMP-A-G2 (-02, -03) and go to MOT |
| 8 | Forms & Feedback | Report: labelled textarea with a length hint and "שליחת דיווח". Survey: each radio sits in a 44 px label inside a `fieldset`/`legend`. Field sizes under 16 px are IMP-A-G2-04, the report autofocus IMP-A-G2-05. Toasts are `role=status` `aria-live=polite`, 4 s, or 8 s with an action (`toast-dismiss`, `toast-accessibility`). Undo exists for every decision (`undo-support`). A refused survey shown as sent is IMP-C-G2-18 |
| 9 | Navigation | Every sheet is a deep link (`?sheet=…&n=…`, `deep-linking`), and back closes the sheet. Every sheet has a named close control: either the handle "סגירה" or an X. The visible-X gap on filters, survey and report is IMP-C-G2-06, and the way back from a similar name is IMP-C-G2-05 |
| 10 | Charts | Labelled, keyboard reachable, with a legend in words ("בנים 97% · בנות 3%"), so meaning doesn't depend on color alone. The sticky touch tooltip is IMP-A-G2-03 |
| — | `cursor-pointer` (web) | Same as G1: `<button>`s show the arrow on desktop (PRO-G1-04, one rule for the whole app) |

**Checked and not kept:**
- **Survey options are 6 px apart** (`gap-1.5`) against the 8 px `touch-spacing` rule. Each option is a full-width, 44 px tall label with its own border, and WCAG 2.5.8 passes. A 2 px shortfall on a guideline isn't a real problem (same call as PRO-G1's 7 px legal links).
- **The probe's "0 px gaps"** (filter chips against "הצגת 1295 שמות", the sheet chart against the sheet's decision buttons, chips against the handle at the end of the filters) are content scrolled under the sheet's sticky header and footer. At the end of each scroll, the last rows clear the footer (`filters-end`, `detail-similar`), so `fixed-element-offset` passes.
- **"על הנתונים" is 32 × 32,** but it has a `before:-inset-1.5` hit area of 44 px (known since IMP-A-G2).
- **At 200 % zoom the saved-count pill wraps to its own row** and the position line wraps under "שם 1 מתוך". Both stay readable and nothing is cut off.

**Seen for other lenses:** on the invite pause, the toast still reads "השם זלמן נשמר. השם הבא: איילת" while the pause panel hides איילת (COPY/INT). The repeated Nest card on end, pause and decision screens is also in the US-006 notes (CRIT/ELEV).

## Findings

Severity is the PRD's scale (§7): P1 broken, inaccessible or clearly off-brand · P2 noticeable · P3 refinement. Shot paths are relative to `scripts/ralph/qa/name-polish/shots/`.

### PRO-G2-01: At 200 % zoom the decision buttons are 40 px wide and "שמירה" / "אהבתי" spill out of them

- **Screen and state:** `/names` swipe screen, the action bar (also the name sheet's decision row, which uses the same `DecisionButtons`)
- **Browser:** chromium-pixel at 200 % zoom (206 × 420 CSS px). The same happens at any width under about 14 rem (large-text settings, split-screen).
- **What's wrong:** below `22.5rem` the pills drop their icons and padding (`DecisionButtons.tsx:12`, `max-[22.5rem]:px-2 [&>svg]:hidden`). That's enough at 320 px. At 206 px, though, the row still holds undo (44) plus three `w-full min-w-0` pills, so each pill is **40 px wide**:
  - "שמירה" needs 45 px and "אהבתי" 42 px (`whitespace-nowrap`), so both overflow. In the shot, "שמירה" runs past the ink pill onto the photo, and the two labels touch.
  - The three main actions of the app fall under the 44 px target.

  Everything else on the deck reflows at this zoom (the header wraps, the card scrolls). The bar is the one part that doesn't.
- **Rule it breaks:** `ui-ux-pro-max` · `quick-reference.md` §1 `dynamic-type` "Support system text scaling; avoid truncation as text grows" and §2 `touch-target-size` "Min 44×44pt"; §6 `truncation-strategy` "Prefer wrapping over truncation"; Pre-Delivery Checklist "Reduced motion and dynamic text size are supported without layout breakage"; search `ux` "Text Reflow and Spacing · Don't: Clip text in fixed-width or fixed-height boxes"
- **Severity:** P2
- **Effort:** S
- **Proposed change:** `src/components/names/DecisionButtons.tsx` (and the bar wrapper in `swipe/ActionBar.tsx`): add one narrower step (e.g. `max-[15rem]`) where the row wraps instead of shrinking. Two options: `flex-wrap` with the three pills at `basis-[calc(50%-…)]`, or undo moves to its own line so each pill gets ≥ 44 px. Labels stay whole (no ellipsis). Check:
  - 200 % zoom in Chromium and WebKit (`pro-g2-zoombar.mjs`: every pill ≥ 44 px and `scrollWidth ≤ clientWidth`)
  - 320 and 390 px unchanged (no wrap)
  - the card still doesn't scroll on 390 × 844
- **Guardrail:** polish (a breakpoint below every board's width; the 390 px layout and the order of the buttons don't change)
- **Screenshot:** `audit/PRO-G2/deck-bar-chromium-zoom200.png`, `audit/PRO-G2/deck-chromium-zoom200.png`

### PRO-G2-02: Secondary deck controls give no feedback on tap

- **Screen and state:**
  - background sheet tiles ("ללא רקע", "בדים", "מחברת", "חדר תינוק", "תמונה משלי")
  - filters sheet: the picker rows "אות ראשונה" and "אורך", "שמות שהסתרתי" and "איפוס"
  - the name sheet's "הוספת שם משפחה" and "דיווח על טעות"
  - the survey prompt's link
  - "להזמין מישהו לבחור ביחד" on the deck end, "אחר כך, להמשיך לבחור" on the invite pause, and "לשנות את הבחירה" in the decision sheet
- **Browser:** webkit-iphone, chromium-pixel, sim-safari
- **What's wrong:** the tap highlight is off app-wide (`names.css:45`). These controls have no `active:` state, and the probe found no press class on any of them. The tiles are `BackgroundSheet.tsx:191`, the rows `FiltersSheet.tsx:239` and `:315`, "איפוס" `:256`, and the `link` variant `ui/classes.ts` that the text links use. A tile tap writes a device pref and the background changes behind the sheet, so the result does show. A picker row opens a second level, and a link navigates (the invite route has to load first). Nothing confirms the touch itself. The pills, IconButtons and chips do press (`PRESS`, scale 0.95), so the sheet mixes controls that respond with controls that don't.
- **Rule it breaks:** `ui-ux-pro-max` · `quick-reference.md` §2 `press-feedback` "Visual feedback on press" and §3 `tap-feedback-speed` "Provide visual feedback within 100ms of tap"; `pro-rules.md` "Tap feedback · Provide clear pressed feedback (ripple/opacity/elevation) within 80-150ms · Don't: No visual response on tap"; §4 `state-clarity`; search `ux` "Active States · Do: Add pressed/active state visual change"
- **Severity:** P3
- **Effort:** S
- **Proposed change:** one shared press style, no new token:
  - the `link` variant in `ui/classes.ts` gets `touch-manipulation` and a pressed opacity (e.g. `active:opacity-60`); "איפוס" and the survey-prompt link move to it
  - the tiles and the two row styles get `touch-manipulation` and a non-scaling pressed fill (`active:bg-sand` or the existing `PRESS` without the scale on the large rows, `Stable Interaction States`)

  Merge with PRO-G1-03 (the same fix on the entry screens) and IMP-A-G1-08 / IMP-C-G1-15.
- **Guardrail:** polish
- **Screenshot:** `audit/PRO-G2/background-webkit.png`, `audit/PRO-G2/filters-end-webkit.png`, `audit/PRO-G2/deck-end-webkit.png`

### PRO-G2-03: The disabled action bar under the end and pause panels is almost as strong as the panel's own button

- **Screen and state:** `/names` deck end (solo and shared), the invite pause and the round recap
- **Browser:** webkit-iphone, chromium-pixel (Playwright-only states: Safari can't reach them without writes, see US-006 gaps)
- **What's wrong:** while a panel replaces the card, all four bar buttons are `aria-disabled` at **opacity 0.6** (`DecisionButtons.tsx:9`, `ui/classes.ts:15`). The ink "שמירה" pill at 60 % is still the darkest shape at the bottom of the screen. It competes with the panel's real action ("הזמנה לבחירה משותפת", "לשמות שלי"), and it looks tappable while it does nothing. Opacity 0.6 sits above the skill's disabled range. Disabled controls are exempt from contrast, so nothing stops it from going lower.
- **Rule it breaks:** `ui-ux-pro-max` · `quick-reference.md` §8 `disabled-states` "Disabled elements use reduced opacity (0.38–0.5) + cursor change + semantic attribute"; `pro-rules.md` "Disabled state clarity · reduced emphasis, and no tap action · Don't: Controls that look tappable but do nothing"; search `ux` "Disabled States · Don't: Confuse disabled with normal state"; §4 `primary-action` "secondary actions visually subordinate"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `DecisionButtons.tsx` `DISABLED` → `aria-disabled:opacity-40`. That's the deck's bar only, where a whole row goes inert behind a panel. The shared `DISABLED` in `classes.ts` stays at 60, because a single disabled button (e.g. a loading "שליחה") should stay readable. Check the undo button's disabled look on the first card (it's the same class), on all four backgrounds.
- **Guardrail:** polish (a class value, not a token)
- **Screenshot:** `audit/PRO-G2/deck-end-webkit.png`, `audit/PRO-G2/pause-invite-webkit.png`, `audit/PRO-G2/deck-pause-recap-webkit.png`

### PRO-G2-04: Numbers that change in place use proportional digits

- **Screen and state:**
  - the card's "שם {n} מתוך {total}" (changes on every decision)
  - the header's saved count (changes on every save)
  - the filters sheet's "הצגת {n} שמות" (changes on every chip tap)
- **Browser:** all
- **What's wrong:** all three are `font-variant-numeric: normal` (Heebo's proportional figures):
  - `card/CardHeader.tsx:33`
  - `swipe/SwipeHeader.tsx:67`
  - `FiltersSheet.tsx:264`

  The position line ends where the "על הנתונים" button begins. As "1" becomes "2" or "9" becomes "10", the line's start edge moves by a few px on every decision. The apply button's label re-centres on each chip tap. Small shifts, but they happen in exactly the places people look while they work through the deck. Only the sign-in code input uses `tabular-nums` today.
- **Rule it breaks:** `ui-ux-pro-max` · `quick-reference.md` §6 `number-tabular` "Use tabular/monospaced figures for data columns, prices, and timers to prevent layout shift"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** add `tabular-nums` to the three spans or labels above. Do it together with PRO-G1-05 (the resend countdown), which uses the same utility.
- **Guardrail:** polish
- **Screenshot:** `audit/PRO-G2/deck-webkit.png`, `audit/PRO-G2/deck-after-vote-webkit.png`, `audit/PRO-G2/filters-selected-webkit.png`

### PRO-G2-05: The Nest card's ink button competes with the screen's own main action

- **Screen and state:** deck end (solo and shared), the round recap, and the decision sheet ("בחרתי שם" / "בחרנו שם")
- **Browser:** webkit-iphone, chromium-pixel
- **What's wrong:** `NestCard.tsx:76` renders "לעדכן אותי כשהיא יוצאת" as a primary ink `Button`. On these screens it sits next to the screen's own primary, so each one has two or three ink buttons:
  - the solo deck end has "לשמות שלי", the Nest button and the disabled "שמירה"
  - in the decision sheet the Nest button is above the fold, while the sheet's own "חזרה לרשימה" is under it (IMP-C-G2-08)

  The skill's rule is one primary per screen. The Nest card is a side offer, from the same team, about a different app, yet it carries the heaviest style on the screen.
- **Rule it breaks:** `ui-ux-pro-max` · `quick-reference.md` §4 `primary-action` "Each screen should have only one primary CTA; secondary actions visually subordinate (Apple HIG)"; §5 `visual-hierarchy` "Establish hierarchy via size, spacing, contrast"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `NestCard.tsx`: the opt-in becomes `variant="secondary"` (the glass pill) at `size="md"`, so the screen's own action stays the only ink button. Copy, behavior and the opt-in stay as they are. Fix the decision sheet's order first (IMP-C-G2-08), then re-check its shot. If the owner wants the launch opt-in to stay the strongest button, this becomes an owner item (product review step 4 placed the card; no board specifies its button style).
- **Guardrail:** polish (button variant; the card, its text and where it appears don't change)
- **Screenshot:** `audit/PRO-G2/deck-end-webkit.png`, `audit/PRO-G2/decision-solo-webkit.png`

### PRO-G2-06: The deck's tags and section labels are 11 px, under the skill's 12 px floor

- **Screen and state:**
  - the card's sex tag ("בן") and its "ב־2024" caption
  - the name sheet's section eyebrows ("מה השם אומר", "מהתנ״ך", "שמות קרובים"…)
  - the background tile captions ("כרטיסים לבנים", "נבחר")
- **Browser:** all
- **What's wrong:** these use the `tag` token (11 px / 700) and the `label` token (10.5 px / 700) (`nest-tokens.css:68–80`, from the owner's `tokens.json`). They're bold, short (1–4 words) and high in contrast: 4.6–9.8:1 measured on all four backgrounds. They read well in every shot, including Safari's. But the skill lists "Text < 12px" among its typography anti-patterns, and `readable-font-size` asks for more on mobile. Same family of issue as PRO-G1-06 (body 13.5 px).
- **Rule it breaks:** `ui-ux-pro-max` · `SKILL.md` priority 6 anti-pattern "Text < 12px body"; `quick-reference.md` §5 `readable-font-size` "Minimum 16px body text on mobile"; §6 `font-scale` "Consistent type scale (e.g. 12 14 16 18 24 32)"; search `ux` "Readable Font Size · Don't: Tiny text on mobile"
- **Severity:** P3
- **Effort:** M (two token values and a re-check of the card's no-scroll rule on 390 × 844 and every board)
- **Proposed change:** none in this run. Ask the owner, together with PRO-G1-06, whether `--nest-text-tag` and `--nest-text-label` should move to 12 px. If yes, it's a next-run item with a full layout pass.
- **Guardrail:** owner (§3.2: changes existing type-size token values and the board layouts)
- **Screenshot:** `audit/PRO-G2/detail-70-webkit.png`, `audit/PRO-G2/deck-webkit.png`, `audit/PRO-G2/background-webkit.png`

## Summary

6 findings: 0 P1, 1 P2, 5 P3.
- **P2 -01:** the decision buttons break at 200 % zoom.
- **P3 -02:** press feedback, merged with PRO-G1-03.
- **P3 -03:** the disabled bar is too strong under panels.
- **P3 -04:** tabular numbers, done with PRO-G1-05.
- **P3 -05:** the Nest card's ink button competes with each screen's primary.
- **P3 -06:** 11 px tags (owner), with PRO-G1-06.

-03, -04 and -05 are XS class changes. Contrast on glass and photos passes on every background measured. Landscape, 320 px and desktop have no overflow or unreachable controls. The rest of the skill's checklist passes on G2 (see the table). What it would also flag here was already found by IMP-C-G2 and IMP-A-G2 and is cross-referenced, not repeated.
