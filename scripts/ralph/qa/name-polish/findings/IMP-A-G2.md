# IMP-A · G2: Deck (swipe screen, name sheet, filters, background, match, decision, survey, about and report sheets, toasts)

Run 2026-11-07 by US-A-IMP-A-G2 at `7025646` (no app code change since the baselines).

Skill: `impeccable` (`.claude/skills/impeccable/SKILL.md`, references read: `reference/audit.md`, `reference/craft-floor.md`, `reference/polish.md`, `reference/harden.md`). Setup: `sh .claude/skills/impeccable/scripts/impeccable context --target src/app/names/page.tsx` ran (PRODUCT.md + DESIGN.md loaded, platform web). Mode Operate for every G2 screen (PRD §3.3.5). This is the code-level audit: it checks what can be measured in the code and the rendered page. Design judgment belongs to IMP-C-G2.

Assumptions where the skill would ask: the closing "run these one at a time or all at once" is skipped (Ralph can't ask, PRD §3.3.2). Every finding goes to triage, and nothing is fixed here. audit.md's "Suggested command" maps to the PRD §7 "Proposed change", so the commands are only named in the summary. `critique-storage latest` wasn't read: IMP-C-G2 wrote no snapshot (see IMP-C-G2.md). No step needed a service.

## Method and evidence

- **Code read:** `swipe/` (`SwipeScreen`, `useSwipeDrag`, `ActionBar`, `SkipButton`, `SwipeFooter`, `SwipeHeader`, `AboutLink`), `card/CardStack`, `card/NameCard`, `DecisionButtons`, `ui/BottomSheet`, `ui/useModal`, `ui/detents`, `ui/ToastRegion`, `lib/names/toast.ts`, `ScreenBackground`, `LetterRangeSlider`, `detail/YearChart`, `about/ReportSheet`, the field classes of `SurveySheet`, and `names.css`. A grep of every G2 listener and timer (`addEventListener`, `setTimeout`, `requestAnimationFrame`) found each one removed or cleared.
- **Detector:** `sh .claude/skills/impeccable/scripts/impeccable detect --json` on 52 G2 sources (`swipe/`, `card/`, `detail/`, `ui/`, `about/`, the sheets, `ScreenBackground`, `LetterRangeSlider`, `DecisionButtons`, `NestCard`, `ThemeIcon`, `page.tsx`, `names.css`), run under `bash`: exit 0, `[]`.
- **Rendered probe** (`shots/imp-a-g2-probe.mjs`, gitignored). It ran on the dev server :3000 with QA user 1 and every backend call mocked as in `us006-g2.mjs` (votes echoed, never sent).
  - **States, in WebKit iPhone 15, Chromium Pixel 7 and WebKit 320 × 568:** 12 states. Deck on fabric and on "ללא רקע", deck with the survey prompt, the filters, background, about, report, survey and name sheets, the match sheet, and the solo and shared decision sheets.
  - **Recorded per state:** axe-core violations, targets under 44 px, input font sizes, visible `backdrop-filter` elements, headings, `<main>` count, horizontal overflow, title, focused element, and console errors.
  - **Gestures (both engines), synthesized touch pointer events:**
    - a card drag interrupted by `pointercancel`, and one interrupted by window `blur`, followed by a tap
    - a sheet-handle drag interrupted by `pointercancel`
    - a vertical touch on the year chart that the page takes for a scroll (`pointercancel`)
  - **Timing:** name sheet open time from a card tap, 3 runs per engine.
  - **Sync line:** the action bar's position and Chromium `layout-shift` entries while going offline and saving.
  - **Reduced motion:** the computed card-enter and sheet animations.
  - **Images:** the photo requests.
- **Frame pacing** (Chromium, CPU 1× and 4×, synthesized touch):
  - Card drag (`shots/imp-a-g2-dragfps.mjs`): median 33.2 ms on fabric and on "ללא רקע" alike at 4×. Headless frames are paced at about 30 fps when throttled, so the glass adds no measurable cost.
  - Name-sheet handle dragged up (`shots/imp-a-g2-sheetfps.mjs`): median 16.7 ms and no frame over 50 ms at 1× and 4×, even though the tall sheet sets `height` on every move.
- **Shots:** `scripts/ralph/qa/name-polish/shots/audit/IMP-A-G2/`. All 45 G2 states came from `us006-g2.mjs` in `-webkit` and `-chromium` on :3000. One gap: `survey-default-webkit`. On the dev server WebKit's navigation to `?sheet=survey` is interrupted by a second navigation to `/names` (twice). The probe's `probe-survey-webkit.png` covers that state. The folder also holds the `probe-*` shots (`*-webkit320` at 320 px), `probe-chart-after-cancel-*`, and two Safari shots copied from today's US-006 baseline: `report-default-sim.png` and `detail-similar-section-sim.png`. The code is unchanged since then, and Safari runs on the real backend, so no taps were repeated.
- **Gaps:** the Simulator wasn't driven again, for the reason above. Its two relevant states are the baseline shots named in -03 and -05. Real touch hardware didn't run. Every gesture result comes from synthesized pointer events in Playwright WebKit and Chromium. The iOS input zoom wasn't reproduced (see -04).

## Audit health score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | axe found 0 violations in 12 states × 3 viewports. Focus moves into every sheet and back to the opener, the rest of the page is `inert`, and the live regions stay mounted. Gaps: the year chart's readout is announced after an accidental touch (-03); the report field takes focus on open (-05) |
| 2 | Performance | 3 | Sheet open 37–52 ms (Chromium) and 106–127 ms (WebKit) on dev, under the 150 ms budget. Drag frames are painted without React renders. Gap: the offline sync line shifts the layout, CLS 0.02 against a budget of 0 (-01) |
| 3 | Theming | 4 | Tokens only (detector clean, `designGuard`). Light only by design (PRODUCT.md), so dark mode is n/a. Glass falls back to solid for `prefers-reduced-transparency` and for browsers without `backdrop-filter` |
| 4 | Responsive design | 3 | No overflow at 320 px, and every target is ≥ 44 px. The card drag survives cancel and blur. Gaps: a cancelled handle drag closes the sheet (-02), the chart keeps its touch state (-03), and the report and survey fields are under 16 px (-04) |
| 5 | Implementation integrity | 4 | One shared `BottomSheet`, `DecisionButtons`, `IconButton` and toast store. Glass and press states come from shared classes. The detector found nothing |
| **Total** | | **17/20** | **Good** (address weak dimensions) |

**Implementation integrity verdict: pass.**
- The deck is built from one set of parts:
  - a single `BottomSheet` with detents, the focus trap, the toast lift and the open and select guards, behind all 8 sheets
  - `DecisionButtons`, shared by the action bar and the name sheet
  - `useSwipeDrag` for the card gesture
  - one toast store
- The glass, press and disabled states come from `names.css` and `classes.ts`.
- The detector found nothing in 52 sources.
- Nothing in G2 repeats the G1 pattern of retyped primary pills (IMP-A-G1-08).

**Executive summary.** 17/20 (Good). 5 findings: 0 P0, 0 P1, 1 P2, 4 P3.
- Top issues:
  - -01: the sync line breaks the CLS-0 budget on the swipe screen
  - -02: a cancelled handle drag closes the sheet
  - -03: the year chart's touch state sticks, and its readout is announced
- Recommended next steps:
  - `optimize` for -01
  - `harden` for -02, -03 and -04
  - `polish` for -05

**Patterns.**
1. **Interrupted gestures.** Of the three custom pointer surfaces, only the card drag treats `pointercancel`, `lostpointercapture` and `blur` as "put it back". The sheet handle treats a cancel as a release, and the chart ignores both cancel and release on touch (-02, -03). The card's handling (`useSwipeDrag.ts:117-127, 212-222`) is the model to copy.
2. **Form fields use body-size type tokens.** That puts them under 16 px. This is the same cause as IMP-A-G1-02 (-04).

**Positive findings.**
- **Card drag:**
  - Moves are written straight to the element's `transform` and `--keep` / `--skip` / `--love`, with no React state per frame.
  - `touch-action` switches between `none` and `pan-y` depending on whether the card scrolls (ResizeObserver).
  - Cancel and blur mid-drag snap back in both engines, and the next tap opens the sheet. A tap's follow-up click is swallowed.
- **The name sheet** is loaded lazily and preloaded on the card's `pointerdown` or focus. It opens in 37–127 ms.
- **Reduced motion is designed, not only switched off:**
  - The fling becomes a 160 ms fade.
  - The next card fades in over 200 ms (`data-motion="fade"`, measured `names-fade-in 0.2s`).
  - Sheets fade over 160 ms instead of sliding.
  - The snap-back is skipped.
- **Targets:** every one is ≥ 44 px. The 32 px "על הנתונים" button reaches 44 px through `before:-inset-1.5` (the probe's flag on it is a false positive). The letter-range thumbs are 44 px sliders with `aria-valuetext`.
- **Sheets:**
  - Escape, Back, the handle and the scrim close them.
  - Focus moves to `[data-autofocus]` or the panel and goes back to the opener.
  - The rest of the page is `inert` except the toast region (`data-names-layer-keep`).
  - Toasts sit above a sheet's pinned footer (`--names-toast-lift`).
- **Photos** are `next/image` with `priority` and a blur placeholder, about 17–37 KB each.
- **Status isn't told by color alone:** the decision buttons' pressed state adds a ring and a check, the filter dot changes the label to "סינון, פעיל", and the sync line has an icon and words.
- **Every listener and timer in G2 is cleaned up.**

## Findings

Severity is the PRD's scale (§7): P1 broken, inaccessible or clearly off-brand · P2 noticeable · P3 refinement. Shot paths are relative to `scripts/ralph/qa/name-polish/shots/`.

### IMP-A-G2-01: The offline sync line shifts the swipe screen (CLS 0.02)

- **Screen and state:** `/names` deck, offline with a decision waiting to sync ("אין חיבור · בחירה אחת ממתינה לסנכרון")
- **Browser:** chromium-pixel (layout-shift entries), webkit-iphone (same move)
- **What's wrong:** `SwipeFooter.tsx:23-52` renders the sync `<p>` with no height while it's empty (`empty:m-0 empty:p-0`). When the line appears, shortly after the tap, it takes 35 px. That pushes up the action bar (y 595 → 560 in WebKit, 775 → 740 in Chromium) and shrinks the card above it.
  - Chromium records a layout shift of **0.02** with `hadRecentInput: false`, so it counts toward CLS.
  - The line going away on reconnect should move it back (not measured).
  - The PRD budget is "CLS stays 0 on the swipe screen" (§3.1.8). US-004 measured 0 online only.
  - IMP-C-G2 noted the move as an observation for this lens.
- **Rule it breaks:** `impeccable` · `reference/polish.md` §5 "Verify and finish" · "console errors, layout shift, interaction latency …"; `reference/audit.md` Performance · "Render performance"
- **Severity:** P2 (breaks a stated budget; the user sees the card jump while offline)
- **Effort:** S
- **Proposed change:** in `src/components/names/swipe/SwipeFooter.tsx`, take the sync line out of the flex flow so its arrival moves nothing. Two options:
  - position it absolutely over the gap under the action bar (`absolute inset-x-0` in a `relative` footer, still `role="status"`)
  - always reserve its row (`min-h-` equal to the pill's height, with the content `invisible` when empty)

  The first keeps today's layout online, so it's the default. Re-measure with the probe's `timing` section (`shifts: []`) and check 320 px (the screen is `h-auto` there).
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-A-G2/deck-after-vote-chromium.png` vs `audit/IMP-A-G2/deck-offline-pending-chromium.png` (and the `-webkit` pair); numbers from `imp-a-g2-probe.mjs chromium` (`syncLine`)

### IMP-A-G2-02: A cancelled drag on the sheet handle closes the sheet

- **Screen and state:** any bottom sheet; measured on the name sheet at 70 %
- **Browser:** webkit-iphone and chromium-pixel (synthesized touch: down, move 120 px down, `pointercancel`)
- **What's wrong:**
  - **Cancel counts as a release.** `BottomSheet.tsx:287` wires `onPointerCancel={onPointerEnd}`, and `onPointerEnd` acts on the distance dragged. A gesture the system takes away is treated as a deliberate release: past 96 px (`DETENT_DRAG`) it closes the sheet, and on a tall sheet it changes the detent. In both engines the sheet closed after a cancelled 120 px drag (`sheetOpenAfterCancelledHandleDrag: false`).
  - **Lost capture and blur aren't handled.** Without them, a press that loses its pointer (the app goes to the background mid-drag, or a notification is pulled down) leaves the panel at its dragged `translateY` or `height` until the next press.

  On a phone this is a rare interruption (a call, Control Center), but its result is the opposite of "nothing happened".
- **Rule it breaks:** `impeccable` · `reference/harden.md` · "Interrupted gestures … `pointercancel`, capture is lost (`lostpointercapture`) … or the window loses focus (`blur`) mid-drag: clear the dragging state and release capture"; `reference/audit.md` Responsive · "drag state that nothing clears on cancel, lost capture, or blur"
- **Severity:** P3
- **Effort:** S
- **Proposed change:** in `src/components/names/ui/BottomSheet.tsx`, add a `cancelDrag()` that drops `drag.current` and resets `offset` to 0 and `height` to null, with the existing `SETTLE` ease on a tall sheet and nothing closing. Use it for `onPointerCancel`, for `onLostPointerCapture` (only when `event.target === event.currentTarget`, as in `useSwipeDrag.ts:220`), and for a window `blur` listener while a drag is active. Add a unit or markup test if the test setup can send pointer events. Otherwise cover it with the probe's `gestures` section.
- **Guardrail:** polish
- **Screenshot:** none (the sheet is simply gone); evidence is `imp-a-g2-probe.mjs webkit|chromium --only gestures` (`gestures.sheetOpenAfterCancelledHandleDrag`)

### IMP-A-G2-03: The year chart keeps its touch tooltip and announces it after a scroll

- **Screen and state:** name sheet → "כמה תינוקות קיבלו את השם" chart, after a touch that starts on the chart and scrolls the sheet
- **Browser:** webkit-iphone and chromium-pixel (synthesized touch with `pointercancel`); sim-safari (tooltip still on after a drag over the chart, baseline)
- **What's wrong:**
  - **The tooltip sticks.** `YearChart.tsx:96-98` sets the active year on `pointerdown`, and on `pointermove` while a finger is down. On touch it never clears it: `onPointerLeave` resets only for a mouse, and there's no `onPointerUp` or `onPointerCancel`. The chart is `touch-action: pan-y`, so a vertical scroll that begins on it fires `pointerdown`, picks a year, then `pointercancel`. Both engines kept the tooltip ("ב־2011: 150 תינוקות") after such a scroll.
  - **The readout is announced.** The `aria-live="polite"` readout (`:166`) holds the same text, so a screen reader announces a year the user never asked for.
  - **Lens overlap:** IMP-C-G2 noted the stuck tooltip as an observation for this lens.
- **Rule it breaks:** `impeccable` · `reference/harden.md` · "Interrupted gestures … The browser cancels the gesture to scroll (`pointercancel`) … clear the dragging state"; `reference/audit.md` Responsive · "scrollable control strips … that swallow page scroll or lose the drag to it, or that stay stuck after an interrupted gesture"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `src/components/names/detail/YearChart.tsx`:
  - add `onPointerCancel` that sets `active` to null, so a scroll leaves no tooltip and no readout
  - on `pointerup` for touch and pen, keep the picked year, so a deliberate tap still shows its value
  - optionally only update the live readout when the pick came from a key or a completed tap

  Keyboard behaviour stays as it is.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-A-G2/probe-chart-after-cancel-webkit.png`, `audit/IMP-A-G2/probe-chart-after-cancel-chromium.png`, `audit/IMP-A-G2/detail-similar-section-sim.png`

### IMP-A-G2-04: The report and survey fields are under 16 px (merge with IMP-A-G1-02)

- **Screen and state:**
  - report sheet: `#report-message` 15 px, and `#report-name` 15 px when the sheet has no name (`text-intro`, `ReportSheet.tsx:30`)
  - survey sheet: `#survey-audience` and `#survey-useful` 13.5 px (`text-body`, `SurveySheet.tsx:34`)
- **Browser:** webkit-iphone and chromium-pixel (computed sizes from the probe). sim-safari: the report field is focused with the keyboard bar up (`report-default-sim.png`). The Simulator's page didn't visibly zoom, but it had a hardware keyboard attached, as noted in IMP-A-G1-02.
- **What's wrong:** iOS Safari zooms the page when a focused field's font is under 16 px. The page stays zoomed after the keyboard closes, so the sheet's pinned "שליחת דיווח" / "שליחה" footer and the deck behind it are off-screen until the user pinches back. The survey's 13.5 px fields are the smallest in the app. The report field also takes focus by itself (-05), so the zoom would come without a tap.
- **Rule it breaks:** `impeccable` · `reference/harden.md` · "iOS Safari force-zooms focused inputs under 16px, which breaks form layouts"
- **Severity:** P3 (rule-based, not reproduced)
- **Effort:** XS once IMP-A-G1-02's token exists
- **Proposed change:** use the new 16 px form-field type token from IMP-A-G1-02 (new token in `docs/names-pwa/brand/tokens.json`, then `npm run tokens:css`) on the `field` classes in `about/ReportSheet.tsx:30` and `SurveySheet.tsx:34`. Triage should make one backlog item for every field in G1–G3 (the add-name field in G3 too).
- **Guardrail:** polish (new token); owner only if triage reads 13.5 → 16 px in the survey as a visible type change
- **Screenshot:** `audit/IMP-A-G2/probe-report-webkit.png`, `audit/IMP-A-G2/probe-survey-webkit.png`, `audit/IMP-A-G2/report-default-sim.png`

### IMP-A-G2-05: The report sheet opens with the keyboard up

- **Screen and state:** `?sheet=report` (from "דיווח על טעות" in the about sheet or the name sheet)
- **Browser:** webkit-iphone and chromium-pixel (focus on `textarea#report-message` right after opening); sim-safari (keyboard accessory bar up on open, `report-default-sim.png`)
- **What's wrong:** the textarea carries `data-autofocus` (`ReportSheet.tsx:164`), so `useModal` focuses it as the sheet opens.
  - **Other sheets don't.** Every other G2 sheet focuses its panel or its title (probe: `section`, `h2`), so this one is the exception.
  - **The keyboard covers the sheet.** On a phone the keyboard rises over half the sheet before the user has read the explanation above the field ("אפשר לכתוב מה לא נכון…") or seen the submit button.
  - **It can trigger the zoom.** Together with -04, focusing the 15 px field is what can zoom the page.
  - **Screen reader order is skipped.** The title and explanation are passed over, and the field is announced first.

  Nothing in the earlier PRDs decided on autofocus here (searched `tasks/prd-name-detail.md`, `tasks/prd-names-pwa.md`). It came in with the first build (`34b5444`).
- **Rule it breaks:** `impeccable` · `reference/polish.md` §4 "Flow and hierarchy" · "Match neighboring mental models … disclosure"; `reference/craft-floor.md` "States: … keyboard focus"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** remove `data-autofocus` from the textarea in `src/components/names/about/ReportSheet.tsx`, so the sheet focuses its panel like the others. Keep the focus move to the field on a validation error (`:78`) and the focus on the thanks line. Check in the Simulator that a tap on the field still brings up the keyboard and that the footer stays reachable.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-A-G2/report-default-sim.png`, `audit/IMP-A-G2/probe-report-webkit.png`

## Checked and not kept

- **Drag frame cost of the glass.** At 4× CPU the card drag paced the same on the fabric photo as on "ללא רקע". The deck has 8 visible `backdrop-filter` layers (10 with the survey prompt). This is the owner's liquid glass (§3.1.1). No dropped frames were measured beyond the throttled pacing, so there's no finding. A real-device check stays with the MOT/performance lenses.
- **The tall sheet animates `height`.** The handle sets `height` on every move, and the settle animates `height`/`maxHeight` (`BottomSheet.tsx:190-197, 221`). That's a layout property, but it stays inside a fixed layer (no page shift) and measured 16.7 ms median frames at 4× CPU. It isn't worth an M-sized rewrite to transforms.
- **Background photos** are 415 × 900 WebP (17–37 KB). They're upscaled about 2.8× on a 3× phone, mostly under glass. Replacing a photo is an owner item (§3.2), and the softness isn't visible in the shots, so there's no finding.
- **Toasts** in G2 have no action and last 4 s. They sit in a persistent `role="status"` region that stays outside the sheets' `inert`. The action toasts (8 s, undo) are in G3 and belong to IMP-A-G3.
- **The undo button** keeps focus with `aria-disabled` (not `disabled`) and is announced as "ביטול ההחלטה האחרונה". The skip menu opens on long press, right-click, the menu key and Shift+F10. Escape, Tab and an outside tap close it, and its outside listener is removed.
- **The letter-range slider** handles cancel and lost capture (`LetterRangeSlider.tsx:119-121`), uses `touch-pan-y`, and has keyboard steps with RTL-aware arrows.
