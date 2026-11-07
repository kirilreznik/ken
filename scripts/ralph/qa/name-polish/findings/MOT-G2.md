# MOT · G2: Deck (card, fling, undo, name sheet, sheets over the deck, toasts)

Skills: `find-animation-opportunities`, `review-animations` (+ `STANDARDS.md`), `animation-performance`, `animation-vocabulary`, `improve-animations`, `remove-animations`, `animate` (SKILL.md each). Read-only for every skill: `remove-animations` only lists here, `improve-animations` writes no `plans/` (triage turns findings into backlog items), and `animate` is used only for its build order and values.

**Assumptions where a skill would ask or wait:** the skills' "Initial Response" greetings are skipped. `improve-animations` effort `standard`, all eight categories, with no subagents. Without a user to pick plans, every vetted finding goes to triage. Values come from `STANDARDS.md`: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` and `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`. The repo has no motion tokens yet (-03), so suggestions name these as new tokens (§3.1.2 allows new tokens). §3.1.6 applies to every suggestion: ≤ 300 ms for UI, springs only for gestures, a reduced-motion version for each, no layout properties, no bounce on errors and no confetti. §3.1.7 applies too: no dependencies, so CSS and WAAPI only. Personality: a calm consumer app (PRODUCT.md, BRAND.md). Matches stay calm (no delight motion, owner decision).

**Skipped:** Chrome DevTools Animations panel (no MCP in the loop): `document.getAnimations()` sampled every frame plays that role. Real-device recording: the iOS Simulator is the stand-in (§10).

## How it was checked

- **Code inventory:** grep for `transition|animate|animation|@keyframes|duration|ease|reduced-motion|motion-safe|scale-|translate|will-change` over `src/components/names`, `src/app/names/names.css`, the tokens and `src/lib/names/gesture.ts`. Then every hit in G2 was read.
- **WebKit iPhone 15 (dev :3000, QA user 1, every backend call mocked):** `shots/mot-g2-probe.mjs webkit inventory` (`MOT_REDUCED=1` for reduced motion). It records every running animation per frame (type, target, duration, easing, keyframes) and takes mid-animation shots for 16 triggers: press, snap-back, drag fling, button fling, love, undo, skip menu, sheet open/full/close, a vote from the sheet, the toast in and out, filters open/snap/close, and a background change. Shots are in `shots/audit/MOT-G2/<trigger>-<ms>ms-webkit.png`.
- **Chromium Pixel 7 traces:** `shots/mot-g2-probe.mjs chromium trace` runs at CPU 1× and 4× for the **sheet open** (card tap), a **swipe fling** (160 px touch drag) and a **toast** (vote on another name in the sheet). Traces are in `shots/audit/MOT-G2/trace-*.json`. The `-noraf` runs are clean: no in-page rAF recorder, which would itself force main-thread frames. Frame states come from cc `PipelineReporter`, and main-thread tasks over 8 ms from `FunctionCall`/`EventDispatch`.
- **Simulator, Mobile Safari (iPhone 17 Pro, iOS 26.5, :3000, QA user 1, real backend):** `shots/mot-g2-sim.mjs <tag>` records `simctl io recordVideo` while the sheet opens and closes, a card is flung by touch drag, undo runs, and a vote on another name shows a toast. `shots/mot-frames.mjs` extracts each motion window's frames with Playwright WebKit (no ffmpeg) into `audit/MOT-G2/simframes/{normal,reduced}-w<n>-<i>.png`. Reduce Motion was switched on with `defaults write com.apple.Accessibility ReduceMotionEnabled` and Safari restarted, then switched back off.
- **Backend cleanup:** the Simulator's undo taps missed, so the run left three real votes for QA user 1 (זלמן skip, איילת skip, גבריאל keep). They were deleted with `shots/mot-qa1-votes.mjs <iso> --delete` (own rows, the same REST path as the app). After the cleanup QA user 1 has 0 votes, and Safari shows "0" and זלמן 1 of 1295 (`audit/MOT-G2/sim-after-restore.png`).

### Chromium trace results (clean runs)

| Trace | CPU | Frames presented / dropped / partial | Main-thread tasks > 8 ms (ms after first frame → length) |
|---|---|---|---|
| Sheet open | 1× | 15 / 10 / 2 | pointerup+render 27 ms, then 9 ms; slide starts 11 ms after the tap's render |
| Sheet open | 4× | 14 / 17 / 3 | pointerup 30, React 14 + **112** before the slide starts (≈ 94 ms tap → motion); during the 260 ms slide: 27, 29, 38 ms |
| Fling | 1× | 33 / 15 / 0 | one 13 ms React task when the next card mounts |
| Fling | 4× | 33 / 13 / 5 | React 34 + **54** + 16 ms right after the fling ends, while the next card should enter |
| Toast | 1× | 14 / 8 / 2 | click 17, React 16 + 10 ms |
| Toast | 4× | 14 / 10 / 2 | click 54, React 50 + 44 ms before the toast fades in |

The fling at 1× drops ~30 % of frames with almost no JS running. Headless Chromium paces at ~30 fps (IMP-A-G2 saw the same), so the drop counts are partly the harness. The numbers that matter are the main-thread tasks that land *at the start* of an animation, because a CSS/WAAPI transform animation can't start before the commit that follows them (-01, -04). All three animations run on the compositor (`has_compositor_animation` frames: 20, 38, 21), and none animates a layout property.

## Inventory: every animation and transition in G2

| # | Where | Trigger | Property | Duration | Easing | Reduced motion | Measured |
|---|---|---|---|---|---|---|---|
| A1 | `names.css:260` `.names-sheet-in` (BottomSheet panel) | any sheet opens | `transform: translateY(100%)→none` (keyframes) | 260 ms | `cubic-bezier(0.2, 0.8, 0.2, 1)` | `names.css:294` fade 160 ms ease-out | WebKit ✓; Safari: first painted frame already ~90 % up (-04) |
| A2 | `names.css:265` `.names-scrim-in` | sheet opens | `opacity 0→1` | 200 ms | `ease-out` | fade 160 ms | ✓ |
| A3 | `names.css:273` `.names-sheet-out` | tall (name) sheet closes | `transform →translateY(100%)` (`to` only, leaves from a dragged offset) | 200 ms | **`ease-in`** | fade-out 160 ms ease-in | Safari: 10 frames, smooth |
| A4 | `names.css:277` `.names-scrim-out` | tall sheet closes | `opacity →0` | 200 ms | `ease-in` | 160 ms | ✓ |
| A5 | `BottomSheet.tsx:278` `transition-transform duration-200` | non-tall sheet handle released short of close | `transform` (inline `translateY(px)` → none) | 200 ms | Tailwind default `cubic-bezier(0.4, 0, 0.2, 1)` | 0.01 ms (global reset) | ✓ `filters-snap` |
| A6 | `BottomSheet.tsx:62,190` `SETTLE` (WAAPI) | tall sheet handle released (new detent / back) | `height`, `maxHeight`, `transform` | 200 ms | `cubic-bezier(0.2, 0.8, 0.2, 1)` | skipped (`reducedMotion()`) | layout property, accepted by IMP-A-G2 (16.7 ms frames at 4×) |
| A7 | `BottomSheet.tsx:220-221` | tall sheet handle dragged | inline `height` / `transform` set per pointermove through React state | follows finger | n/a | same | IMP-A-G2: 16.7 ms median at 4× |
| A8 | `names.css:283,287` desktop `[data-detent]` | ≥ 768 px only | dialog-in / fade-out | 200 ms | ease-out / ease-in | — | out of scope (phone) |
| — | non-tall sheets (filters, background, about, report, survey, match, decision) | close | **none**: unmount in one frame | — | — | — | = INT-G2-05 |
| B1 | `useSwipeDrag.ts:52,190` `paint()` | card drag | inline `transform` + `--keep/--skip/--love` on the article (stamps read them via `opacity-[var(--keep)]`) | follows finger | n/a | same (drag is direct manipulation) | -09 |
| B2 | `useSwipeDrag.ts:136` snap-back (WAAPI) | drag released short | `transform → none` | 220 ms | `ease-out` (built-in) | skipped | ✓ |
| B3 | `useSwipeDrag.ts:142-147` fling (WAAPI, `fill: forwards`) | drag past threshold, buttons, keys, sheet vote | `transform → flingTo()` (±130 % + 18°, or −120 % Y + scale 0.9) and `opacity → 0.4` | 300 ms | **`ease-in`** | opacity 1→0, 160 ms ease-in | WebKit, Chromium, Safari ✓ |
| B4 | `names.css:318,351` `.names-card-enter` (CardStack, `data-motion="fade"`) | next card mounts after a decision, undo, sheet vote | `translateY(14px) scale(0.96)`, `opacity 0.5` → none | 280 ms | `ease-out` (built-in) | `names-fade-in` capped 200 ms | Safari: starts 4–5 frames after the fling ends (-01) |
| B5 | `DecisionButtons.tsx:8`, `ui/classes.ts:14`, `SwipeHeader.tsx:62`, `FiltersSheet.tsx:85`, `AboutContent.tsx:61` `PRESS` | `:active` on buttons and chips | `scale 1→0.95` | 150 ms | Tailwind default | `motion-safe:` (none) | ✓ symmetric press/release |
| B6 | `NameCard.tsx:75-83` stamps | drag | `opacity` from inherited vars | follows finger | n/a | same | ELEV-G2-03 (look) |
| C1 | `names.css:265` `.names-toast-in` on `ToastRegion.tsx:26` | toast shown | `opacity 0→1` only (keyframes) | 200 ms | `ease-out` | **0.01 ms** (no `data-motion`) | ✓; exit: none (= INT-G2-10) |
| C2 | `.names-toast-in` on the skip menu `SkipButton.tsx:133` (`data-motion="fade"`) | long-press "דילוג" | `opacity` | 200 ms | `ease-out` | 200 ms fade kept | ✓; exits in one frame |
| D1 | `names.css:64-84` reduced-motion switch-off | `prefers-reduced-motion` | `animation-duration` / `transition-duration: 0.01ms` on every element without `data-motion` | — | — | — | -07 |
| — | Background change (`ScreenBackground`) | pick a photo | none: swaps in one frame | — | — | — | -10 |

No `transition: all` in the code, no `scale(0)`, no hover motion (Tailwind 4 `hover:` is already `@media (hover: hover)`), no infinite loops or spinners in G2, no `will-change`, no animated `blur()`.

## Findings

### MOT-G2-01: Every decision runs as three steps in a row: 300 ms ease-in fling, then an empty glass card, then a 280 ms entrance

- **Screen and state:** swipe screen, any decision (drag, buttons, keys, from the sheet).
- **Browser:** webkit-iphone · chromium-pixel · sim-safari
- **What's wrong:** The deck's most frequent action (hundreds per session) holds the card area for about 600–650 ms. First the card flies out for 300 ms. Then `onDecide` runs, React re-renders the deck (Chromium 4×: 34 + 54 + 16 ms of work right after the fling), and only then does the next card mount and play its 280 ms entrance. In Safari, 4–5 recorded frames show only the blank glass stack between the leaving card and the new one (`simframes/normal-w15-05…08`, `normal-w16-00`). Reduced motion has the same gap (`reduced-w15-04…w16-00`). This is the cause behind INT-G2-01 (taps dropped during the fling) and INT-G2-09 (the next card lags the finger during its entrance).
- **Rule it breaks:** `review-animations` · STANDARDS.md "Should it animate? … Tens of times/day → Remove or drastically reduce"; `remove-animations` · Reducing "UI animation over 300ms → 200–250ms, same curve"; `animation-performance` · "Jank only during navigation or loading → … the animation can't run while the main thread is busy".
- **Severity:** P2
- **Effort:** M
- **Proposed change:** In `useSwipeDrag.ts` `fling()`, call `decide.current(decision)` when the fling *starts*, not when it finishes, and let the leaving card finish as a detached overlay. Two ways: (a) keep the node, `cloneNode` it into the CardStack layer before the decision, and remove the clone on `finished`; or (b) call `onDecide` after ~120 ms on a timer. In both, the next card mounts under the flying one, so its entrance overlaps the exit. Cut the fling to 220 ms and the entrance (`names.css:351`) to 200 ms `var(--nest-ease-out)` (-02/-03). Reduced motion: the old card fades out 160 ms while the next fades in (already `data-motion="fade"`). Merge with INT-G2-01 and INT-G2-09 in triage.
- **Guardrail:** polish (deck order, decisions and undo unchanged)
- **Screenshot:** `shots/audit/MOT-G2/simframes/normal-w15-06.png`, `normal-w16-00.png`, `fling-drag-200ms-webkit.png`

### MOT-G2-02: The fling and the sheet exit use `ease-in`, and the other curves are the weak built-ins

- **Screen and state:** card fling (B3), name sheet close (A3/A4), reduced fades (`names.css:302`); snap-back (B2), card entrance (B4), toast and scrim (A2, C1) use built-in `ease-out`; press and filter snap use Tailwind's default.
- **Browser:** webkit-iphone · chromium-pixel · sim-safari
- **What's wrong:** `ease-in` starts slow. After a fast flick, the card visibly slows almost to a stop at release and then speeds away (INT-G2-03 measured it). The name sheet also hesitates before it drops. Built-in `ease-out` on the 280 ms entrance and the 220 ms snap-back reads soft next to the sheet's custom `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- **Rule it breaks:** `review-animations` · Standard 3 "`ease-in` on UI is a block … Built-in CSS easings are too weak"; `animate` · Never Ship "`ease-in` on a UI element → `ease-out` or a strong custom curve".
- **Severity:** P2
- **Effort:** S
- **Proposed change:** fling `useSwipeDrag.ts:147` → `var(--nest-ease-out)` (`cubic-bezier(0.23, 1, 0.32, 1)`), 220 ms. Better still, carry the release velocity: start the WAAPI from the current transform with a matching ease-out (INT-G2-03). Sheet exit `names.css:273,277` → `cubic-bezier(0.32, 0.72, 0, 1)` (`--nest-ease-drawer`), 200 ms. Snap-back `useSwipeDrag.ts:136` and card entrance `names.css:351` → `--nest-ease-out`. Reduced fades stay `ease-out` (drop `ease-in` at `:302`). Read the WAAPI curves from the tokens (`getComputedStyle(document.documentElement).getPropertyValue("--nest-ease-out")`) or from a TS constant generated with them.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/MOT-G2/fling-drag-80ms-webkit.png`, `detail-close-80ms-webkit.png`

### MOT-G2-03: Motion has no tokens: three curves and six durations are inlined in CSS and TS

- **Screen and state:** all G2 motion (and G1/G3: the same classes).
- **Browser:** code
- **What's wrong:** `cubic-bezier(0.2, 0.8, 0.2, 1)` appears in `names.css:260` and `BottomSheet.tsx:62`. Durations 150/160/200/220/260/280/300 ms are spread across `names.css`, `useSwipeDrag.ts`, `BottomSheet.tsx` (where `EXIT_MS = 300` must match the CSS) and Tailwind `duration-150/200` classes. `tokens.json` has none. Every fix in -01/-02 would add more inline values.
- **Rule it breaks:** `improve-animations` · Recon "existing easing tokens, duration scales … plans must extend these, not invent parallel ones"; `animate` · Hard Rule 3 "Extend the codebase's tokens".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** add `motion` to `docs/names-pwa/brand/tokens.json` → `npm run tokens:css`: `--nest-ease-out`, `--nest-ease-drawer`, `--nest-duration-press` 150 ms, `--nest-duration-fast` 200 ms, `--nest-duration-sheet` 260 ms. Use them in `names.css`, `PRESS` (`ease-(--nest-ease-out) duration-(--nest-duration-press)`) and the WAAPI calls. A new token, not a changed value (§3.1.2). Do this first in the motion slots.
- **Guardrail:** polish
- **Screenshot:** n/a (code)

### MOT-G2-04: The name sheet's slide-in loses its first frames to the mount work, so in Safari it appears almost in place

- **Screen and state:** card tap → name sheet (70 %).
- **Browser:** sim-safari · chromium-pixel
- **What's wrong:** In Mobile Safari, the first frame after the tap that shows the sheet already has it ~90 % up (`simframes/normal-w1-01`). Most of the 260 ms slide never paints, so the sheet "jumps" up rather than slides. Chromium at 4× CPU shows why: a 112 ms React task (the full sheet mounting: sections, chart, similar names) runs between `pointerup` and the animation start, and 27–38 ms tasks follow *during* the slide (17 of 34 frames dropped). At 1× it is a 27 ms task. Both runs are on the dev server, so production will be lighter; recheck on :3100 before fixing. The open still meets the < 150 ms budget (US-004).
- **Rule it breaks:** `animation-performance` · "The pattern to watch for is motion that runs while the page is doing heavy work … anything that fires alongside data fetching or hydration"; `review-animations` · Standard 5 / "comes-from-nowhere".
- **Severity:** P3 (P2 if a production Safari recording shows the same)
- **Effort:** M
- **Proposed change:** in `detail/NameDetailSheet.tsx`, render the sheet shell plus the header and first section in the opening commit. Defer the heavy sections (`YearChart`, `SimilarSection`, `NumbersSection`) with `useDeferredValue`/`startTransition`, or until the panel's `animationend`, keeping their space reserved so nothing shifts (CLS 0). The CSS animation itself is already compositor-only, so leave it alone.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/MOT-G2/simframes/normal-w1-00.png`, `normal-w1-01.png`; trace `trace-sheet-open-x4-noraf.json`

### MOT-G2-05: Undo brings the card back rising from the stack, not from where it left

- **Screen and state:** "ביטול ההחלטה האחרונה" after a decision.
- **Browser:** webkit-iphone · sim-safari
- **What's wrong:** The undone card plays the generic entrance (`translateY(14px) scale(0.96)`, 280 ms), the same as a brand-new card. It flew off to a side (or up for "אהבתי מאוד") and comes back from below, so nothing shows that this is the same card returning.
- **Rule it breaks:** `find-animation-opportunities` · Missing spatial story "Dismissable surfaces … that exit a different way than they entered → symmetric paths"; `animate` · §6 "Exit the way it entered".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** `SwipeScreen` knows the undone vote's kind. Pass it to `CardStack` (e.g. `enter="return-keep"`), and have `useSwipeDrag`'s ref play `node.animate([{ transform: flingTo(kind, keepDir()), opacity: 0.4 }, { transform: "none", opacity: 1 }], { duration: 240, easing: var(--nest-ease-out) })` on mount instead of `.names-card-enter`. Reduced motion: the 200 ms fade it has now.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/MOT-G2/undo-100ms-webkit.png`

### MOT-G2-06: Voting on another name in the sheet replays the entrance on the card that didn't change

- **Screen and state:** name sheet showing a similar name (`?sheet=name&n=…` ≠ current card) → "שמירה"/"דילוג" in its footer.
- **Browser:** webkit-iphone · chromium-pixel (seen in both inventories, normal and reduced)
- **What's wrong:** `decideOther` calls `setEntered(true)` (`SwipeScreen.tsx:233`). On the first such vote, this adds `names-card-enter` to the *mounted* top card, which then plays its 280 ms entrance although it stays the same card. The part above the 70 % sheet shows the jump.
- **Rule it breaks:** `review-animations` · Standard 1 "Justified motion" (nothing entered); `remove-animations` · gate "Can you name its purpose? → No → DELETE".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** drop `setEntered(true)` from `decideOther` (`SwipeScreen.tsx:233`). The card on top doesn't change there. Check that undo of that vote still animates the card it brings back.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/MOT-G2/toast-in-150ms-webkit.png`

### MOT-G2-07: The reduced-motion reset makes every style change a 0.01 ms `all` transition and drops the toast's fade

- **Screen and state:** any G2 screen with `prefers-reduced-motion: reduce`.
- **Browser:** webkit-iphone (inventory `-rm`)
- **What's wrong:** `names.css:67-77` sets `transition-duration: 0.01ms !important` on every element without `data-motion`. `transition-property` defaults to `all`, so every style change becomes a running transition. The reduced inventory recorded them on the dragged card's `transform` and the stamps' `opacity` on each drag frame, plus the sheet's `height`/`max-height`, the toast region's `padding-bottom` and the focus `outline`. It is invisible, but it is extra work on every drag frame. And the toast, which has no `data-motion`, loses its fade entirely (0.01 ms), while the skip menu keeps a 200 ms fade. That is backwards from "gentler, not zero".
- **Rule it breaks:** `review-animations` · Escalation "`transition: all` (unbounded property animation)" and Standard 8 "gentler, not zero — keep opacity/color, drop movement"; `animation-performance` · Hard Rule 4 "Never `transition: all`".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in the switch-off block, replace `transition-duration: 0.01ms` / `transition-delay` with `transition-property: none !important`. Keep the `animation-duration` line: sheets get their own fades after it, and `onAnimationEnd` still fires. Add `data-motion="fade"` to the toast pill (`ToastRegion.tsx:26`). Check that the `[data-motion="fade"]` rule doesn't need `transition-property` back (it only animates `animation`).
- **Guardrail:** polish
- **Screenshot:** n/a (reproduce with `MOT_REDUCED=1 … mot-g2-probe.mjs webkit inventory`)

### MOT-G2-08: The toast fades in with no movement and has no exit

- **Screen and state:** any toast over the deck (a vote on another name, an offline sheet, a background photo saved, an update ready).
- **Browser:** webkit-iphone · chromium-pixel · sim-safari
- **What's wrong:** Its entrance is a pure 200 ms opacity keyframe. A new toast replaces the old one by `key` and restarts the keyframe from 0. It leaves in one frame (INT-G2-10). The pill doesn't come from or go to its edge.
- **Rule it breaks:** `review-animations` · Escalation "pure-fade entrances with no initial transform" and "Keyframes on toasts"; `animate` · §6 "Transitions, not keyframes, for anything triggered rapidly — toasts".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** `ToastRegion.tsx` + `names.css`: a transition with `@starting-style { opacity: 0; transform: translateY(8px) }` → settled, `transition: opacity 200ms, transform 200ms var(--nest-ease-out)`. Exit: keep the last toast mounted ~150 ms with `opacity: 0; translateY(8px)` before clearing (`lib/names/toast.ts` dismiss → "leaving" state). Reduced: opacity only (-07). Merge with INT-G2-10.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/MOT-G2/toast-in-60ms-webkit.png`, `toast-gone-4050ms-webkit.png`

### MOT-G2-09: The swipe stamps are driven by CSS variables inherited by the whole card

- **Screen and state:** card drag.
- **Browser:** code; frame cost not separable in headless (IMP-A-G2 drag frames: 33 ms median at 4× on both backgrounds, the harness pacing)
- **What's wrong:** `paint()` (`useSwipeDrag.ts:52-57`) writes `--keep`, `--skip` and `--love` on the `<article>` every pointermove. The three stamps read them through `opacity-[var(--keep,0)]`. Custom properties inherit, so each move restyles every descendant of the card (name, niqqud, sex bar, sparkline SVG, tiles, buttons), not just the three stamps. This is the trap the skill describes from Vaul: it costs nothing on a fast Mac and grows with content on a mid-range phone.
- **Rule it breaks:** `animation-performance` · Two Traps "Inherited CSS variables … Recalculates styles for every descendant, every frame"; `review-animations` · Escalation "Updating a CSS variable on a parent to drive a child transform".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** keep refs to the three stamp spans (`data-stamp="keep|skip|love"` queried once in the `ref` callback) and set `style.opacity` on each in `paint()`. Remove the `opacity-[var(--…)]` classes. Verify on the Simulator that the drag looks the same, and record a Chromium trace with 4× CPU before and after (style recalc time per frame).
- **Guardrail:** polish
- **Screenshot:** n/a (code; verified from code, needs a device recording)

### MOT-G2-10: Changing the background swaps the photo in one frame behind the sheet

- **Screen and state:** background sheet → pick another photo (or "ללא רקע").
- **Browser:** webkit-iphone
- **What's wrong:** The full-screen photo above the sheet changes from one frame to the next (`bg-change` recorded no animation). It is an occasional, deliberate choice, and the hard cut makes the whole screen flash.
- **Rule it breaks:** `find-animation-opportunities` · Teleporting state "Content that swaps … instantly → fade"; gate: frequency occasional, purpose "preventing a jarring change", speed 200 ms, function: decoration only.
- **Severity:** P3
- **Effort:** S
- **Proposed change:** in `ScreenBackground.tsx`, keep the previous layer for one 200 ms opacity crossfade (`transition: opacity 200ms var(--nest-ease-out)`) and then unmount it. Only on a change, never on first load. Reduced motion: 200 ms opacity is allowed (use `data-motion="fade"`). No layout change, the photo layers are `fixed`.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/MOT-G2/bg-change-100ms-webkit.png`

### MOT-G2-11: The long-press skip menu fades in from nowhere and vanishes on close

- **Screen and state:** "דילוג" held 500 ms → menu "הסתרה".
- **Browser:** webkit-iphone
- **What's wrong:** It reuses `.names-toast-in` (opacity only) with no `transform-origin` at the button it grows out of, and it unmounts in one frame.
- **Rule it breaks:** `review-animations` · Standard 5 "Popovers/dropdowns … scale from their trigger … start from `scale(0.9–0.97)` + opacity".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** a `names-menu-in` keyframe in `names.css`: `from { opacity: 0; transform: scale(0.97) }`, 150 ms `var(--nest-ease-out)`, `transform-origin: bottom right` (logical: the end side it's anchored to, `SkipButton.tsx:133` `end-0 bottom-full`). Same for `RowMenu` in G3 (MOT-G13). Reduced motion: opacity only (it keeps `data-motion="fade"`).
- **Guardrail:** polish
- **Screenshot:** `shots/audit/MOT-G2/skip-menu-720ms-webkit.png`

## Part 2: Kept, and rejected candidates (required by the skills)

**Kept (`remove-animations`):**
- A1/A2/A3 sheet slide and scrim: occasional; they show where the sheet comes from and goes ("spatial consistency"). Only the curve changes (-02).
- B3 fling + B4 entrance: they carry the decision ("state indication"). They are high-frequency, which is why -01 shortens and overlaps them rather than deleting them; without the fling a decision would teleport.
- B5 press `scale(0.95)` 150 ms: feedback, within 100–160 ms, `motion-safe` gated. It sits at the edge of the 0.95–0.98 range and is fine for pill buttons.
- A6 settle (animates `height`): a documented trade-off in IMP-A-G2 (16.7 ms frames at 4×, in a fixed layer). Respected, not re-litigated.

**Rejected (`find-animation-opportunities` gate):**
- Saved count pill and the "שם N מתוך M" line ticking on each decision: **Function**, numbers the user reads, changed tens of times a session.
- Staggered entrance of the name sheet's sections: **Frequency**, opened tens of times a session; content to read.
- Any celebration on the match sheet or "בחרנו שם": **owner decision** (no confetti, matches stay calm; tasks/prd-names-pwa.md §3); it opens like the other sheets.
- Keyboard decisions (arrows in `SwipeKeys`): they use the same fling. **Frequency/keyboard** says no animation, but the fling *is* the decision feedback shared with touch, and -01 makes it short. Not filed separately.
- Animated sex bar / year chart on mount: **Function**, data.

## Part 3: Verdict

The deck's motion is close to right in kind: transform/opacity only, compositor-driven, a reduced-motion version for each piece, nothing on hover, nothing infinite. It is wrong in timing on the one thing a user does hundreds of times. The fling, the React re-render and the entrance run one after another, with an `ease-in` start and a blank card between them (-01/-02). That is the highest-leverage fix, and it also clears INT-G2-01, -03 and -09. -03 (tokens) should land first so the other fixes share one vocabulary. Then come the small corrections: -06 (stray entrance), -07 (reduced-motion reset) and the spatial pieces (-05 undo, -08 toast, -11 menu). -04 needs a production Safari recording before it is fixed. **Review decision: Block** (`ease-in` on UI and over-long motion on the most frequent action), with no `transition: all` in source code, no layout animation on the hot path and no `scale(0)`.
