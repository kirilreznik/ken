# INT · G2: Deck (swipe screen, name sheet, filters, background, about, report, survey, match, decision, toasts)

Skills: `interaction-design` (`SKILL.md`, references `state-and-transitions.md`, `microinteractions.md`, `motion-principles.md`, `error-prevention.md`, `product-behavior.md`, example `interaction-audit-walkthrough.md`), `apple-design` (`SKILL.md`), `emil-design-eng` (`SKILL.md`: Review Format, Animation Decision Framework §4, Spring Animations, Component Building Principles, Gesture and Drag Interactions, Touch device hover states, Sonner Principles, Asymmetric timing).

**Method** (the audit walkthrough's):
1. Catalog every control and gesture on the G2 screens: the card (drag sideways and up, tap), the action bar (שמירה, אהבתי, דילוג with its long-press menu, ביטול), header buttons, the sheet handle, scrim, ✕ and footers, chips and pickers, and toasts.
2. A state inventory per control (default, pressed, disabled, busy, during a transition), measured in the browsers.
3. Gesture physics, measured frame by frame: tracking, thresholds, release velocity, interruption, sheet drag up, drag down and flick, and exits.

The `emil-design-eng` Before/After table is at the end.

**How it was checked:**
- **Probe:** `shots/int-g2-probe.mjs [webkit|chromium] [--only card,sheets]` on the dev server :3000, Playwright WebKit iPhone 15 and Chromium Pixel 7, QA user 1. Every backend call is mocked as in `us006-g2.mjs` (votes echoed, never sent). It uses scripted touch pointer events and samples `getBoundingClientRect` / `getAnimations()` on each step and each animation frame.
  - **Card:** a drag during the next card's enter animation vs. on a settled card; a 60 px flick and the frames after release; a release past the threshold while moving back; two taps on "דילוג" 150, 250 and 400 ms apart; "ביטול" 100 ms after "דילוג"; "דילוג" held (scale and menu over time).
  - **Sheets (filters, about, name):** scrim close and handle drag-close frame by frame; a 60 px / 40 ms flick on the handle; a drag on the title; a 700 px drag up; the toast after a vote on a similar name; a vote from the sheet on the current card.
  - Output: `audit/INT-G2/probe-<engine>.json`, `probe-sheets-<engine>.json`.
- **Simulator, Mobile Safari (real touch, dev server :3000):**
  - QA user 1 signed in again through the documented email-code steps (`shots/int-g2-signin.mjs`, one email). Safari had been signed out on both origins.
  - `shots/int-g2-sim.mjs <url> <name> <n> x,y …` holds a cliclick touch path and takes a screenshot mid-gesture: a card drag that comes back (snaps back, no vote), "שמירה" held then slid off (no vote), the filters sheet dragged by its title, and the name sheet's content pulled down at the top.
  - The run left Safari on the deck at "זלמן" (1 of 1295), with nothing voted.
- Shots: `scripts/ralph/qa/name-polish/shots/audit/INT-G2/` (gitignored).

**Assumptions and skips:**
- None of the three skills asks questions during a review. The "Initial Response" greetings are skipped.
- Chrome DevTools slow-motion and the Animations panel are skipped. Timing comes from per-frame samples instead.
- Synthetic pointer events don't set `:active` or start Safari's text selection, so press visuals and selection were judged in the Simulator.
- cliclick can't set an exact release speed, so velocity (flicks) is measured in Playwright only.
- Haptics are out of reach: the web has no Vibration API in iOS Safari, and no feedback sound is in scope. Not filed.

## What passes (checked)

- **Card drag (FR-W11), both engines and Safari:**
  - It starts after 8 px, stays 1:1 with the finger from where it was grabbed, and takes pointer capture. A second pointer is ignored (`pointerId` check).
  - The stamps grow with distance (`sim-carddrag-held.png`: "דילוג" stamp, card tilted).
  - Below the threshold it snaps back in 220 ms ease-out from where it is, not from a target (`sim-carddrag-after.png`).
  - Release decides past 100 px, or past 40 px at more than 0.6 px/ms. A flick is enough, as emil's "Momentum-based dismissal" asks. Cancel and blur reset (IMP-A-G2 checked them).
- **Buttons and keys** send the card off on the same path as a drag. With reduced motion, every decision is a 160 ms fade.
- **Press states:** the decision pills, "ביטול" and the header IconButtons scale to 0.95 over 150 ms (emil: 0.95–0.98, 100–160 ms). On the disabled bar, `aria-disabled` turns the scale off. The controls with no press state at all are PRO-G2-02 and aren't repeated here.
- **"דילוג" long press:** the menu opens at 500 ms (10 px slop), and in both engines the press holds 0.95 until then. The menu fades in over 200 ms, takes focus, and swallows the click that follows. The button is `select-none` with no touch callout. That the menu can't be discovered is IMP-C-G2-07.
- **Name sheet (tall):**
  - The handle drag follows the finger 1:1 in both directions.
  - A release settles in 200 ms from the live height (`SETTLE`).
  - A drag-close slides out from where the finger left it (`names-sheet-out` has only a `to` keyframe): 12–19 frames, 230–330 ms.
  - A vote from the sheet on the current card: the sheet slides out (≈ 300 ms) and the next card mounts 390–414 ms after the tap. Both engines.
  - A vote on a similar name keeps the sheet open and confirms it with a toast ("נשמר: גבריאלה").
- **Guards:** the open guard (350 ms) and the select guard (600 ms) stop the taps that opened a sheet from landing in it. A handle drag isn't also a click. The sheet open time is IMP-A-G2 `sheetOpenMs`, and the cancelled handle drag is IMP-A-G2-02.

### INT-G2-01: Taps on the action bar during the 300 ms fling are dropped, including "ביטול"

- **Screen and state:** `/names` deck, action bar, while the card is flying off (300 ms)
- **Browser:** webkit-iphone · chromium-pixel (probe, identical results)
- **What's wrong:**
  - **Fast taps are lost.** Two taps on "דילוג" decided one name when they came 150 or 250 ms apart. At 400 ms apart they decided two (`doubleSkip150: 1`, `doubleSkip250: 1`, `doubleSkip400: 2`).
  - **Undo is lost.** "ביטול" tapped 100 ms after "דילוג" did nothing: the skip stayed and the status line kept "דילוג על מאזן. השם הבא: פרל" (`undoDuringFling`).
  - **Why:** `useSwipeDrag.fly()` and `SwipeScreen.undo()` both return early while `busy()` is set, for the whole fling.
  - **Nothing shows it.** The second button still presses to 0.95, so it looks taken.
  - Skipping fast through 1295 names is the core loop, and "ביטול" right after a wrong tap is exactly when undo is needed.
- **Rule it breaks:**
  - `interaction-design` · `SKILL.md` Common Mistakes · "Animations that block interaction … Never block input"
  - `apple-design` · `SKILL.md` §3 · "Never lock out input during a transition"
  - `emil-design-eng` · Sonner Principles · "Transitions retarget smoothly" (interruptible, not keyframes that must finish)
- **Severity:** P2
- **Effort:** M
- **Proposed change:** in `src/components/names/swipe/useSwipeDrag.ts`, keep a reference to the running fling `Animation`:
  - When `fly()` is called while busy, `finish()` the running fling. That commits the current decision at once. Store the new decision as `pending`, and run it from `ref` when the next card mounts.
  - When `undo()` comes while busy, finish the fling first, then undo it.
  - Add a unit test for the queue (two `fly` calls give two decisions).
- **Guardrail:** polish (same decisions, no new behavior; deck order untouched)
- **Screenshot:** `shots/audit/INT-G2/card-after-webkit.png`, `card-after-chromium.png`; numbers in `probe-webkit.json` / `probe-chromium.json` → `card`

### INT-G2-02: Holding "שמירה" or "אהבתי" in Safari selects the button's word, with the loupe, and the selection stays

- **Screen and state:** `/names` action bar (the name sheet's footer uses the same pills), a touch held about 300 ms
- **Browser:** sim-safari (real touch)
- **What's wrong:**
  - A held touch on "שמירה" starts iOS text selection: blue handles around "שמירה" and the magnifier loupe over the bar (`sim-keephold-held.png`). After the finger slides off and lifts, the word stays selected (`sim-keephold-after.png`).
  - **Why:** `SkipButton` already has `select-none [-webkit-touch-callout:none]`, but the `PILL` class in `DecisionButtons.tsx` (used for "שמירה" and "אהבתי") and `UNDO` in `ActionBar.tsx` don't.
  - Hesitating on the main action is common, and the result looks broken.
- **Rule it breaks:**
  - `apple-design` · `SKILL.md` §10 · "Tap: highlight on touch-down … allow cancel-by-dragging-away"
  - `interaction-design` · `SKILL.md` Triggers · "Communicate state … Each state must be visually distinct": the pressed state turns into a text-selection state
- **Severity:** P2
- **Effort:** XS
- **Proposed change:**
  - Add `select-none [-webkit-touch-callout:none]` to `PILL` in `src/components/names/DecisionButtons.tsx` and to `UNDO` in `swipe/ActionBar.tsx`.
  - Better still, put it in the shared `PRESS` constant, so every pressable that uses it gets it.
  - Merge with INT-G1-03 (the link-lift platter on held links; same cause and fix family).
- **Guardrail:** polish
- **Screenshot:** `shots/audit/INT-G2/sim-keephold-held.png`, `sim-keephold-after.png`

### INT-G2-03: A flicked card slows almost to a stop when the finger lifts, then speeds up

- **Screen and state:** `/names` card, a fast swipe released past 40 px
- **Browser:** webkit-iphone · chromium-pixel (probe)
- **What's wrong:**
  - The finger moved at about 0.8 px/ms, about 13 px per frame.
  - **WebKit:** in the frames after release the card moved 2, 7, 10, 12, 17 px, and only then got faster (`flick.after`: −76, −78, −85, −95, −107, −124 …).
  - **Chromium:** 3, 19, 35 px.
  - **Why:** `fling()` always runs a 300 ms `ease-in` from the release point, whatever the finger's speed. A quick flick therefore stalls for 30–50 ms at the seam between drag and animation, then accelerates away. That's the "brick wall" the skill describes.
- **Rule it breaks:**
  - `apple-design` · `SKILL.md` §5 · "When a gesture ends, the animation must continue at the finger's exact velocity, so there's no visible seam between dragging and animating"
  - `emil-design-eng` · Animation Decision Framework · "`ease-in` … feels sluggish"
- **Severity:** P3
- **Effort:** S
- **Proposed change:** in `src/components/names/swipe/useSwipeDrag.ts`:
  - Keep the last 2–3 pointer moves to get the release speed.
  - Run the fling with an ease-out curve. Set its duration from the remaining distance divided by that speed, clamped to 180–300 ms, so the first frame moves about as far as the finger's last one. Buttons and keys keep 300 ms.
  - If the curve or durations are shared, add them as motion tokens (`tokens.json` → `npm run tokens:css`).
  - Coordinate with US-A-MOT-G2.
- **Guardrail:** polish (no new dependency; a curve, not a spring library)
- **Screenshot:** none (the seam lasts 2–3 frames); evidence in `probe-webkit.json` / `probe-chromium.json` → `card.flick`

### INT-G2-04: A swipe that is being pulled back still decides, if it ends past 100 px

- **Screen and state:** `/names` card, dragged to 140 px, then pulled back toward the centre and released at 104 px
- **Browser:** webkit-iphone · chromium-pixel (probe)
- **What's wrong:**
  - The card was skipped (`reverseDecided: true`) although the finger was moving back toward the centre when it lifted, which is the gesture for "I changed my mind".
  - The same drag released at 90 px snapped back (`reverse2Decided: false`).
  - **Why:** `dragOutcome()` uses only the position at release, so the 100 px line is a hard edge that a hesitating finger can't feel.
- **Rule it breaks:**
  - `apple-design` · `SKILL.md` Quick Reference · "Decide reverse vs. commit | Use velocity **sign**, not position | at release"
  - `state-and-transitions.md` Swipe Action Patterns · "Allow the user to cancel by reversing the swipe before releasing"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:**
  - In `src/lib/names/gesture.ts`, pass the release velocity to `dragOutcome()`, from the last moves kept for INT-G2-03. When the card is moving back toward the centre faster than a small threshold (e.g. 0.2 px/ms), return `null` (snap back).
  - Add cases to the gesture unit tests.
  - Do it with INT-G2-03 (same history buffer).
- **Guardrail:** polish (the thresholds of PRD FR-W11 stay; only a reversing release changes)
- **Screenshot:** none; `probe-*.json` → `card.reverse`, `card.reverse2`

### INT-G2-05: Filters, background, about, report and survey sheets vanish in one frame when they close

- **Screen and state:** every bottom sheet without detents; closed by the scrim, ✕, Back, Escape, "הצגת … שמות", or a handle drag past 96 px
- **Browser:** webkit-iphone · chromium-pixel (probe)
- **What's wrong:**
  - **Scrim close:** the filters and about sheets are gone by the first frame (0 frames visible; `filtersScrimClose`, `aboutScrimClose`).
  - **Drag close:** after a handle drag-close they show 4–5 frames of the drag (top 40 → 130 px), then vanish from mid-screen (`filtersDragClose`, `aboutDragClose`).
  - **Contrast:** they slide up over 260 ms when they open, and the name sheet slides back down in 200 ms from wherever it was let go.
  - **Why:** `SheetGate` (`ui/BottomSheet.tsx`) keeps a sheet mounted for its exit only `if (props.detents …)`. The full-screen match and decision layers likewise slide in (`names-sheet-in`) and unmount at once.
- **Rule it breaks:**
  - `apple-design` · `SKILL.md` §7 · "If something disappears one way, we expect it to emerge from where it came … Enter and exit along the same path"
  - `motion-principles.md` Timing · "Modal close 150–200ms ease-in"
- **Severity:** P3
- **Effort:** S
- **Proposed change:**
  - In `src/components/names/ui/BottomSheet.tsx`, give every sheet the `closing` state, not only tall ones: drop the `props.detents &&` condition and keep `!otherLayerOpen(search)`. The existing `names-sheet-out` (200 ms, `to` only, so it leaves from the dragged offset) and `names-scrim-out` then apply. Reduced motion already maps them to a 160 ms fade.
  - Check the sheet-to-sheet hand-offs: the about → report link and filters → hidden names.
  - The match and decision layers are optional, under the same rule.
- **Guardrail:** polish (existing keyframes, ≤ 200 ms)
- **Screenshot:** none (the sheet is gone in the next frame); `probe-sheets-webkit.json` / `probe-sheets-chromium.json`

### INT-G2-06: A quick flick down on a sheet's handle doesn't close it; only 96 px of travel does

- **Screen and state:** every bottom sheet's handle (filters, about, name sheet at 70 %)
- **Browser:** webkit-iphone · chromium-pixel (probe: 60 px in 40 ms, about 1.5 px/ms)
- **What's wrong:**
  - The flick snapped back on all three sheets (`filtersFlickClosed`, `aboutFlickClosed`, `nameFlickClosed`: false).
  - **Why:** `onPointerEnd` and `detentAfterDrag()` look only at distance (`DETENT_DRAG` 96 px). A short, fast throw is the natural way to toss a sheet away, and the card swipe already accepts one (40 px at 0.6 px/ms), so the two gestures in one screen disagree.
- **Rule it breaks:**
  - `emil-design-eng` · Gesture and Drag Interactions · "Momentum-based dismissal: Don't require dragging past a threshold … If velocity exceeds ~0.11, dismiss regardless of distance. A quick flick should be enough."
  - `apple-design` · `SKILL.md` §6 · "Use velocity to project the resting position"
- **Severity:** P3
- **Effort:** S
- **Proposed change:**
  - In `ui/BottomSheet.tsx`, keep the last moves' time and position in `drag.current`.
  - Give `detentAfterDrag(from, dy, threshold, velocity)` in `ui/detents.ts` a velocity rule mirroring the card's: past 30 px at more than 0.6 px/ms counts as a full drag, in either direction (up from 70 % → full).
  - Add unit cases in the detents tests.
- **Guardrail:** polish
- **Screenshot:** none; `probe-sheets-*.json` → `*FlickClosed`

### INT-G2-07: Only the 96 × 44 px handle moves a sheet; pulling its title or its content down does nothing

- **Screen and state:** every bottom sheet; a downward drag on the title row (filters "סינון") or on the content at scroll top (the name sheet)
- **Browser:** sim-safari (real touch) · webkit-iphone · chromium-pixel (probe: `*BodyDrag`, `mid: none`)
- **What's wrong:**
  - **Safari:** pulling the filters title down 160 px rubber-bands the chips inside the sheet while the panel stays (`sim-filterstitle-held.png`). The name sheet's content does the same (`sim-namebody-held.png`). Both settle back.
  - **Playwright:** the panel doesn't move at all.
  - **Why it matters:**
    - On iOS, people pull a sheet down by its header or by its content when that content is at the top.
    - Here the only grip is the small handle (the probe's own first Safari attempt landed on it by chance: `sim-filtersbody-*` closed).
    - On a tall name sheet, the handle sits 600 px above the decision buttons the thumb is near.
- **Rule it breaks:**
  - `apple-design` · `SKILL.md` §16 Familiarity · "Build on what people already know … honor their physics"
  - `SKILL.md` §2 · "Touch and content should move together"
  - `interaction-design` · `SKILL.md` Gesture Design Rules · "Respect the platform"
- **Severity:** P3
- **Effort:** M
- **Proposed change:** in `ui/BottomSheet.tsx`:
  1. Bind the handle's pointer handlers to the pinned `header` slot and the title row too. Ignore drags that start on a control, the way `useSwipeDrag` checks `CONTROLS`.
  2. On the scroller, start a sheet drag when `scrollTop === 0` and the first move is downward. Use `touch-action: pan-y` with a pointer handoff, or a `touchmove` that `preventDefault`s only in that case.
  
  Do step 1 first (S). Step 2 needs care with nested scrolling and the year chart, so measure it in Safari.
- **Guardrail:** polish (the existing close gesture reaches more of the sheet; no new action)
- **Screenshot:** `shots/audit/INT-G2/sim-filterstitle-rest.png`, `sim-filterstitle-held.png`, `sim-namebody-held.png`

### INT-G2-08: Dragging a sheet up hits a hard wall

- **Screen and state:** the handle dragged upward: a sheet without detents (filters, about), and the name sheet at full height
- **Browser:** webkit-iphone · chromium-pixel (probe)
- **What's wrong:**
  - **Sheets without detents:** a 700 px pull up moves the filters and about sheets 0 px (`filtersUpDrag`, `aboutUpDrag`: `moved: 0` at every step). `onPointerMove` clamps `offset` at 0.
  - **The name sheet:** it follows 1:1 and then stops dead at full height (198 / 252 px, then no more movement).
  - Nothing tells the finger "there's no more here". It reads as frozen.
- **Rule it breaks:**
  - `apple-design` · `SKILL.md` §9 · "At an edge, resist progressively instead of stopping hard. A hard stop reads as 'frozen'"
  - `emil-design-eng` · Friction instead of hard stops · "allow it with increasing friction"
- **Severity:** P3
- **Effort:** S
- **Proposed change:**
  - In `ui/BottomSheet.tsx`, past the limit (0 for a sheet without detents, `FULL_HEIGHT` for a tall one), move the panel by `rubberband(overshoot, viewportHeight)` from apple-design §9, as a small `translateY` up or a few extra px of height.
  - On release it settles back with the existing transition / `SETTLE`.
- **Guardrail:** polish
- **Screenshot:** none; `probe-sheets-*.json` → `*UpDrag`

### INT-G2-09: The next card lags the finger if it is dragged during its 280 ms entrance

- **Screen and state:** `/names`, a drag started right after a decision, while `names-card-enter` still runs
- **Browser:** webkit-iphone · chromium-pixel (probe)
- **What's wrong:**
  - `names-card-in` has only a `from` keyframe, so it interpolates toward the inline drag transform.
  - **The lag:** for the first ~100 ms the card covers 0–50 % of the finger's travel. At −10 px of finger, the card moved −5 px in WebKit and 0 px in Chromium; a settled card moves −13 / −14 px. At −30 px: −25 / −21 px vs −38 / −41 px. It catches up near the end of the animation.
  - **Opacity:** it is still fading in from 0.5 while being dragged.
  - Fast swipers start the next drag within that window.
- **Rule it breaks:**
  - `apple-design` · `SKILL.md` §2 · "Touch and content should move together"
  - `SKILL.md` §3 · "Always animate from the presentation (current) value … A user must be able to grab a moving element mid-flight"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:**
  - In `src/components/names/swipe/useSwipeDrag.ts` `onPointerMove`, when a drag starts (`s.mode` set), finish the card's CSS enter animation (`e.currentTarget.getAnimations().forEach((a) => a.finish())`). The card is then fully opaque and tracks 1:1 from the first move.
  - The same applies to `fly()` from the buttons.
- **Guardrail:** polish
- **Screenshot:** none; `probe-*.json` → `card.enterDrag` vs `card.settledDrag`

### INT-G2-10: Toasts disappear in one frame, and their timer runs while the app is in the background

- **Screen and state:** the toast ("נשמר: גבריאלה" after a vote on a similar name in the sheet; the same `ToastRegion` for every toast)
- **Browser:** webkit-iphone · chromium-pixel (probe: no opacity below 1 seen before removal; gone 3.1–3.4 s after the check started, at the 4 s `TOAST_DURATION`)
- **What's wrong:**
  - **No exit.** The toast fades in over 200 ms (`names-toast-in`) but is unmounted on dismiss.
  - **The timer.** `src/lib/names/toast.ts` runs a plain `setTimeout`, with no pause on `visibilitychange`. A toast shown as the person switches apps is gone when they come back. That matters for toasts with an action: the 8 s undo toast on the lists (G3).
- **Rule it breaks:**
  - `motion-principles.md` Timing · "Notification exit 150–200ms ease-in"
  - `emil-design-eng` · Sonner Principles · "Handle edge cases invisibly. Pause toast timers when the tab is hidden."
- **Severity:** P3
- **Effort:** S
- **Proposed change:**
  - **Timer:** in `toast.ts`, on `visibilitychange` → hidden, clear the timer and keep the remaining time. Restart it on visible.
  - **Exit:** in `ui/ToastRegion.tsx`, keep the leaving toast mounted for 160 ms with the existing `names-fade-out`, `aria-hidden` while it leaves, so the live region doesn't repeat it.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/INT-G2/toast-webkit.png`, `toast-chromium.png`

## Before / After (emil-design-eng review format)

| Before | After | Why |
| --- | --- | --- |
| `fly()` / `undo()` return while `busy()` (300 ms fling) | finish the running fling, queue the new decision; undo after finish | Never block input during a transition (INT-G2-01) |
| `PILL` / `UNDO` without `select-none` | `select-none [-webkit-touch-callout:none]` (in `PRESS`) | A held button must not turn into a text selection (INT-G2-02) |
| fling `300ms ease-in` from release | ease-out, duration from release speed (180–300 ms) | Hand off the finger's velocity; no seam (INT-G2-03) |
| `dragOutcome` by position only | snap back when the release moves toward the centre | Velocity sign decides commit vs reverse (INT-G2-04) |
| `if (props.detents && …) setClosing(true)` | every sheet gets `closing` → `names-sheet-out` 200 ms | Exit along the entry path (INT-G2-05) |
| handle closes at `dy ≥ 96` only | `dy ≥ 96` or `dy > 30 && v > 0.6 px/ms` | A flick should be enough (INT-G2-06) |
| only the handle starts a sheet drag | header / title row too; content when at scroll top | Familiar sheet physics, grip near the thumb (INT-G2-07) |
| `setOffset(Math.max(0, dy))` | rubber-band past the limit | Friction, not a wall (INT-G2-08) |
| enter animation runs under the drag | `getAnimations().forEach(a => a.finish())` on drag start | Start from the presentation value (INT-G2-09) |
| toast unmounts at once; timer runs when hidden | 160 ms fade-out; pause on `visibilitychange` | Exit motion; Sonner edge cases (INT-G2-10) |
