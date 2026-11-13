# MOT · G13: Entry (G1) and Lists and settings (G3)

Skills: `find-animation-opportunities`, `review-animations` (+ `STANDARDS.md`), `animation-performance`, `animation-vocabulary`, `improve-animations`, `remove-animations`, `animate` (SKILL.md each). All read-only: `remove-animations` only lists here, `improve-animations` writes no `plans/` (triage turns findings into backlog items), and `animate` is used only for its build order and values.

**Assumptions where a skill would ask or wait:** the skills' "Initial Response" greetings are skipped. `improve-animations` effort `standard`, all eight categories, run in-thread with no subagents. Without a user to pick plans, every vetted finding goes to triage. Values come from `STANDARDS.md`, as in MOT-G2: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` and `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`. They are written as the new tokens `--nest-ease-out`/`--nest-ease-drawer`/`--nest-duration-*` proposed in **MOT-G2-03**, which is a prerequisite for every fix here (§3.1.2 allows new tokens). §3.1.6 applies to every suggestion: ≤ 300 ms, a reduced-motion version for each, no layout properties, no bounce on errors, no confetti. §3.1.7 applies too: CSS and WAAPI only, no dependency. Personality: a calm consumer app (PRODUCT.md, BRAND.md). Mode Operate, except welcome, which is Persuade within the existing look.

**Skipped:** the Chrome DevTools Animations panel (no MCP in the loop): `document.getAnimations()` sampled every frame plays that role. Real-device recording: the iOS Simulator stands in (§10). **Criterion "a swipe fling":** G1 and G3 have no card fling (MOT-G2 traced it). The gesture traced here is the sheet's handle-drag dismiss from the lists screen.

## How it was checked

- **Code inventory:** grep for `transition|animate|animation|@keyframes|duration-|ease-|reduced-motion|motion-safe|scale-|translate-|will-change|data-motion|PRESS|setTimeout` over `src/components/names` (minus `swipe/`, `card/`, `detail/` and the deck sheets, which MOT-G2 covered) and `src/app/names`. Every hit in a G1/G3 screen or a shared `ui/` component they use was then read.
- **WebKit iPhone 15 (dev :3000, every backend call mocked):** `shots/mot-g13-probe.mjs webkit inventory`, then again with `MOT_REDUCED=1`. G1 runs signed out and as QA user 1 (break-g1 mocks). G3 runs as QA user 1 with 6 saved names and 4 matches in a shared space (break-g3 mocks). The probe records every running animation per frame (type, target, duration, easing, iterations) for these triggers: welcome load and press, email page, email → code step, wrong code, callback spinner, join spinner, invite wait, intro, onboarding, 404, offline, tab switches, row menu press/open/close, row removal, name sheet open/close from a row, add-name sheet open/close, add-name → toast, toast fade-out, duel press and pick, delete dialog open/close, opt-in switch, about, privacy and the matches skeleton. It also takes mid-animation shots, saved as `shots/audit/MOT-G13/<trigger>[-rm]-<ms>ms-webkit.png`. Page loads are polled every 30 ms from Node, so animations during hydration are caught.
- **Chromium Pixel 7 traces:** `shots/mot-g13-probe.mjs chromium trace` runs at CPU 1× and 4× for the **sheet open** (row → name sheet), the **sheet handle-drag dismiss**, a **toast** (add a name) and the **delete dialog**. Traces are in `shots/audit/MOT-G13/trace-*.json`, summarised by `shots/mot-trace.py`: cc `PipelineReporter` `frame_reporter.state` plus main-thread `FunctionCall`/`EventDispatch` > 8 ms.
- **Simulator, Mobile Safari (iPhone 17 Pro, iOS 26.5, real backend, no writes):** `shots/mot-g13-sim.mjs <tag>` records `simctl io recordVideo`. Signed in on :3000 (QA user 1, empty lists) it covers the add-name sheet opening and closing from the scrim, three tab switches, the delete dialog opened by URL and closed from the scrim. Signed out on :3100 it covers the welcome load and the auth callback, which ends in an error. `shots/mot-frames.mjs` extracts the motion windows into `audit/MOT-G13/simframes/{normal,reduced}-w<n>-<i>.png`. For the reduced run, Reduce Motion was switched on with `defaults write com.apple.Accessibility ReduceMotionEnabled`, Safari restarted, and the setting switched back off afterwards.
- **Harness artefact:** the mocked `PUT /auth/v1/user` returns a user without onboarding metadata, so the opt-in switch tap re-renders settings as the auth skeleton about 100 ms later (`settings-toggle-60ms-webkit.png`). The switch's transitions were recorded before that, and INT-G3-07 measured the switch itself. This is not an app bug.

### Chromium trace results

| Trace | CPU | Presented / dropped / partial | Main-thread tasks > 8 ms (ms from the first frame → length) |
|---|---|---|---|
| Sheet open (row → name sheet) | 1× | 19 / 3 / 0 | tap 14 + 10, React 29 before the slide, 21 later |
| Sheet open | 4× | 18 / **18** / 3 | tap 55 + 37, React **123** before the slide (≈ 215 ms tap → motion), then 30, 29 and 43 during it |
| Handle-drag dismiss | 1× | 24 / 1 / 1 | 27 at release |
| Handle-drag dismiss | 4× | 24 / 5 / 1 | 67 at release, then the exit runs clean |
| Toast (add a name) | 1× | 15 / 1 / 1 | submit 31 (nested dispatch), React 12 + 14 |
| Toast | 4× | 15 / 6 / 1 | submit **87**, React 35 + 42 + 26 before and while the toast fades in |
| Delete dialog | 1× | 14 / 0 / 0 | tap 22, React 16 |
| Delete dialog | 4× | 16 / 3 / 2 | tap 57, React 8 + 44 |

Every animation here runs on the compositor (13–22 `has_compositor_animation` frames per trace), and none animates a layout property except the opt-in switch (-04). The name sheet opened from a list row has the same mount cost as from the deck (**MOT-G2-04** reproduced: one 123 ms task at 4× before the slide). Headless Chromium paces at ~30 fps, so absolute drop counts are partly the harness (see MOT-G2).

## Inventory: every animation and transition in G1 and G3

| # | Where | Trigger | Property | Duration | Easing | Reduced motion | Measured |
|---|---|---|---|---|---|---|---|
| S1 | `names.css:259-265` `.names-sheet-in` / `.names-scrim-in` (`ui/BottomSheet.tsx:253,278`) | add-name, install, decision, about, report sheets in G3; the name sheet from a row | `transform: translateY(100%)→none`; scrim `opacity` | 260 / 200 ms | `cubic-bezier(0.2, 0.8, 0.2, 1)` / `ease-out` | fade 160 ms ease-out (`names.css:294`) | WebKit ✓ both. **Safari: add-name sheet paints in place in its first frame, normal and reduced (-01)** |
| S2 | `names.css:273,277` `.names-sheet-out` / `.names-scrim-out` | tall (name) sheet closes | `transform →translateY(100%)`, `opacity →0` | 200 ms | **`ease-in`** (= MOT-G2-02) | fade-out 160 ms ease-in | WebKit ✓ |
| S3 | `ui/BottomSheet.tsx:278` `transition-transform duration-200` | non-tall sheet released short of close | `transform` | 200 ms | Tailwind default `cubic-bezier(0.4, 0, 0.2, 1)` | 0.01 ms | = MOT-G2 A5 |
| S4 | — | non-tall sheet closes (add-name, install, decision, about, report) | **none**: unmounts in one frame | — | — | — | Safari `simframes/normal-w1-01`: sheet and scrim gone in one frame (-02) |
| D1 | `ui/Dialog.tsx:43` `names-scrim-in` + `:53` `names-dialog-in` (`names.css:251,268`) | settings "יציאה מהבחירה המשותפת", "מחיקת החשבון" | scrim `opacity`; panel `opacity 0→1` + `scale(0.96)→none` | 200 ms | `ease-out` (built-in) | scrim fades 160 ms; **panel 0.01 ms** (-03) | WebKit ✓; Safari `normal-w4-02…08` fades in ✓ |
| D2 | — | dialog closes (ביטול, scrim, Escape, Back, confirm) | **none**: dialog and scrim unmount in one frame | — | — | — | Safari `normal-w5-01` (-02) |
| M1 | `lists/RowMenu.tsx:98-100` `names-toast-in` + `data-motion="fade"` | row "⋮" | `opacity 0→1` only, no origin | 200 ms | `ease-out` | 200 ms fade kept | WebKit ✓; exit: one frame (-02, -05) |
| T1 | `ui/ToastRegion.tsx:26` `names-toast-in` | toasts in G3 (added a name, a vote from the sheet, duel/settings messages) and invite (link copied) | `opacity` keyframe | 200 ms | `ease-out` | **0.01 ms** | = MOT-G2-08 / -07; exit one frame |
| P1 | `ui/classes.ts:14` `PRESS` (Button, IconButton, Chip, shared pills), `about/AboutContent.tsx:61` | `:active` | `scale 1→0.95` | 150 ms | Tailwind default | `motion-safe:` (none) | WebKit ✓ (row "⋮": `transition scale 150ms`) |
| P2 | — | `:active` on hand-rolled pills: `WelcomeActions.tsx:72,82`, `EmailSignIn.tsx:24` `primaryButton`, `Onboarding.tsx:237`, `AuthCallback.tsx:63`, duel cards `DuelScreen.tsx:249-254`, settings rows `SettingsScreen.tsx:45` `rowAction`, list rows, tabs | **none** | — | — | — | welcome-press and duel-press recorded no transition (-08) |
| W1 | `SettingsScreen.tsx:330` `transition-colors` | opt-in switch | `background-color`, 4 × `border-*-color` | 150 ms | Tailwind default | 0.01 ms | ✓ |
| W2 | `SettingsScreen.tsx:332` `transition-[inset-inline-start]` | opt-in switch thumb | **`right`** (layout; `inset-inline-start` resolves to `right` in RTL) | 150 ms | Tailwind default | 0.01 ms | -04 (= INT-G3-07) |
| L1 | `AuthCallback.tsx:74`, `JoinScreen.tsx:139` `animate-spin` | callback / join waiting | `transform: rotate` infinite | 1000 ms | `linear` | **frozen**: 0.01 ms × 1 iteration, a static ¾ ring | -09 (= IMP-A-G1-03) |
| L2 | `AuthGuard.tsx:12` `AuthSkeleton`, `InviteScreen.tsx:210`, `ListsScreen.tsx:249,323,505`, `DuelScreen.tsx:203` | loading | none (static placeholders, no shimmer) | — | — | — | ✓ kept static (Part 2) |
| R1 | `names.css:64-84` reduced-motion switch-off | `prefers-reduced-motion` | `transition-duration: 0.01ms` on every element (property `all`) | — | — | — | reduced inventory: 0.01 ms transitions on tab `color`, input borders/outline, button `opacity`, the duel bar `width`, the toast region `padding-bottom`, the h1 focus outline (= MOT-G2-07) |
| — | Email ↔ code step (`EmailSignIn.tsx:146`), tab panels, duel pair (`DuelScreen.tsx:237`), duel progress bar (`:227` inline `width`), row removal (`ListsScreen.tsx:239`), page loads (welcome, intro, onboarding, about, privacy, terms, 404, offline, goodbye) | — | none: swap in one frame | — | — | — | -06, -07; the rest in Part 2 |

There is no `transition: all` in the code (only the reduced-motion reset makes one, R1). There is no `scale(0)`, no hover motion (Tailwind 4 `hover:` is already `@media (hover: hover)`), no `will-change`, no animated `blur()`, and no infinite loop except the two spinners.

## Findings

### MOT-G13-01: In Safari the add-name sheet's slide never shows: it appears in place in its first frame

- **Screen and state:** `/names/lists` → "הוספת שם" (also `?sheet=add-name`).
- **Browser:** sim-safari (normal and reduced). In webkit-iphone the 260 ms slide is recorded and the mid shot shows it moving, so headless WebKit doesn't reproduce it.
- **What's wrong:** The first recorded frame after the tap (`simframes/normal-w0-01`) already shows the whole sheet at rest, with the scrim at full strength. No in-between frame shows it lower. With Reduce Motion the 160 ms fade doesn't show either (`reduced-w0-01`). The delete dialog, which focuses a *button*, visibly fades in, in the same recording (`normal-w4-02`). Likely cause: `useModal.ts:49-50` focuses `[data-autofocus]` in the opening commit, and here that is the text field (`AddNameSheet.tsx:78`). Focusing an input inside a `position: fixed` layer makes iOS Safari bring up the input accessory bar and scroll the field into view (the bar is in `normal-w0-04`). That cancels or finishes the composited entrance. The cause is inferred from the dialog/sheet contrast, not proven. The fix must be verified in the Simulator.
- **Rule it breaks:** `review-animations` · Standard 5 / escalation "comes-from-nowhere"; `animation-performance` · Hard Rule 3 "Never conclude 'it's fine' from a fast machine"; `find-animation-opportunities` · "Missing spatial story".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** in `ui/useModal.ts`, when the autofocus target is a text field (`input:not([type=checkbox],[type=radio]), textarea`), move focus on the panel's `animationend` (`names-sheet-in`/`names-fade-in`), with a 300 ms timer fallback, instead of in the opening commit. Until then, focus the panel itself (`el.focus({ preventScroll: true })`), so screen readers still land in the dialog. Buttons keep focusing immediately. Then record `mot-g13-sim.mjs normal|reduced` again: the slide (or fade) should show ≥ 4 in-between frames. If it still doesn't, file it as an owner note: a sheet with a keyboard can't animate in on iOS.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/MOT-G13/simframes/normal-w0-00.png`, `normal-w0-01.png`, `reduced-w0-01.png`; contrast `normal-w4-02.png`

### MOT-G13-02: Dialogs, the row menu and the short sheets fade or slide in but vanish in one frame

- **Screen and state:** settings confirm dialogs (leave, delete): ביטול, scrim, Escape, Back. Row menu "⋮" (`lists/RowMenu.tsx`): pick, tap outside, Escape. Non-tall sheets in G3: add-name, install, decision, about, report.
- **Browser:** webkit-iphone (dialog-close, rowmenu-close, addname-close: no animation recorded) · sim-safari (`normal-w1-01` sheet, `normal-w5-01` dialog: gone in one frame)
- **What's wrong:** Each surface enters with motion and leaves with none. The dialog fades and scales in over 200 ms, then on "ביטול" the panel and the dim scrim disappear together in one frame, and the whole screen flashes from dimmed to bright. The add-name sheet and its scrim do the same. Only the tall name sheet has an exit (S2). This is the motion side of INT-G3-06 and INT-G2-05.
- **Rule it breaks:** `find-animation-opportunities` · Missing spatial story "Dismissable surfaces … that exit a different way than they entered → symmetric paths"; `animate` · §6 "Exit the way it entered"; `review-animations` · Standard 10 cohesion.
- **Severity:** P3
- **Effort:** M (shared components, three surfaces)
- **Proposed change:** one shared "closing" state, reusing the tall sheet's path (`BottomSheet.tsx:202` `EXIT_MS` + `onClosed`):
  - **BottomSheet (non-tall):** on close set `closing`, apply the existing `names-sheet-out` / `names-scrim-out` (200 ms, curve per MOT-G2-02 `--nest-ease-drawer`), and unmount on `animationend` (timer fallback). Focus returns to the opener at close time, not after the exit (`remove-animations` hazard "focus timed after motion").
  - **Dialog:** a `names-dialog-out` keyframe `to { opacity: 0; transform: scale(0.98) }`, 150 ms `var(--nest-ease-out)`. The scrim reuses `names-scrim-out` at 150 ms. Unmount after it. The confirm action runs at once; only the visual exit is delayed.
  - **RowMenu:** `names-fade-out` 120 ms before unmount (menu-item actions run immediately).
  - **Reduced motion:** opacity only, 160 ms (the existing reduced block already maps `-out` classes to `names-fade-out`; add `.names-dialog-out` there).
  - Inert, scroll lock and URL `?sheet=`/`?dialog=` state change at close time as now, so Back/history behaviour doesn't change. Merge with INT-G3-06, INT-G2-05 and MOT-G2-11 in triage.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/MOT-G13/simframes/normal-w1-00.png`, `normal-w1-01.png`, `normal-w5-01.png`; `dialog-close-40ms-webkit.png`

### MOT-G13-03: With reduced motion the confirm dialog pops in while its scrim fades, and toasts lose their fade

- **Screen and state:** settings → "מחיקת החשבון" / "יציאה מהבחירה המשותפת" with `prefers-reduced-motion: reduce`; any toast in G3/invite.
- **Browser:** webkit-iphone (`-rm` inventory: `names-dialog-in` 0.01 ms, `names-scrim-in` 160 ms; toast `names-fade-in` 0.01 ms)
- **What's wrong:** The reduced block at `names.css:294-303` gives sheets and scrims a 160 ms fade but leaves out `.names-dialog-in`. The global switch-off then sets the dialog panel to 0.01 ms. With Reduce Motion on, the scrim fades in under a panel that is already there, and the alertdialog appears abruptly. That is the opposite of "gentler, not zero". The toast has the same gap (MOT-G2-07).
- **Rule it breaks:** `review-animations` · Standard 8 "`prefers-reduced-motion` is honored (gentler, not zero — keep opacity/color, drop movement)"; `animate` · Hard Rule 4.
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `names.css`, add `.nest-names .names-dialog-in` to the reduced block's first selector list (`animation: names-fade-in 160ms ease-out !important`), and `.names-dialog-out` to the second if -02 lands. The toast's fix is in MOT-G2-07 (`data-motion="fade"` on the pill). Check with `MOT_REDUCED=1 … mot-g13-probe.mjs webkit inventory --only g3`: `dialog-open` should list `names-fade-in 160`.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/MOT-G13/dialog-open-rm-80ms-webkit.png` (panel fully opaque at 80 ms under a half-faded scrim)

### MOT-G13-04: The opt-in switch slides its thumb by animating `inset-inline-start` (= `right` in RTL) with the weak default curve

- **Screen and state:** `/names/settings` → "עדכון כש־Nest יוצאת לחנויות".
- **Browser:** webkit-iphone (inventory: `CSSTransition right 150ms cubic-bezier(0.4, 0, 0.2, 1)` on the thumb)
- **What's wrong:** `SettingsScreen.tsx:332` transitions `inset-inline-start` between `start-0.5` and `start-[calc(100%-26px)]`, a layout property re-laid-out every frame. It also hard-codes 26 px. The track's color change (`:330`) uses Tailwind's default curve. The cost is small (one absolutely positioned 24 px element), but a `translate` looks identical and can't regress (INT-G3-07 found the same).
- **Rule it breaks:** `animation-performance` · Hard Rule 1 "`transform` and `opacity` by default … If a cheaper property produces the same visual, use it"; `review-animations` · Standard 7 "GPU-only properties"; Standard 3 "Built-in CSS easings are too weak".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** keep the thumb at `start-0.5` and move it with `translate`: `transition-transform duration-(--nest-duration-press) ease-(--nest-ease-out)`, on → `translate-x-5 rtl:-translate-x-5` (track `w-13` 52 px − 2 × 2 px border − 24 px thumb − 2 × 2 px inset = 20 px = `5`). Track `transition-colors` on the same token curve. Reduced motion: the global reset already stops the slide; the color change is allowed to stay (opacity/color). Merge with INT-G3-07 (which also covers the double tap and busy state).
- **Guardrail:** polish
- **Screenshot:** n/a (code + inventory JSON; `settings-toggle-60ms-webkit.png` shows the harness re-render, see "Harness artefact")

### MOT-G13-05: The row menu fades in from nowhere instead of growing from its "⋮" button

- **Screen and state:** `/names/lists` saved or matches row → "⋮".
- **Browser:** webkit-iphone (`rowmenu-open-60ms-webkit.png`: the menu is a faint full-size ghost over the rows)
- **What's wrong:** `RowMenu.tsx:100` reuses `.names-toast-in` (opacity only, no transform). The menu doesn't scale from the button it belongs to, so for a moment it reads as text floating over the rows below it. This is the same gap as the deck's skip menu (MOT-G2-11).
- **Rule it breaks:** `review-animations` · Standard 5 "Popovers/dropdowns … scale from their trigger (`transform-origin`) … start from `scale(0.9–0.97)` + opacity"; escalation "pure-fade entrances with no initial transform".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** one `names-menu-in` keyframe for both menus (`names.css`): `from { opacity: 0; transform: scale(0.97) }`, 150 ms `var(--nest-ease-out)`. Here use `transform-origin` at the top end corner (`top-full end-0`, so `ltr:origin-top-right rtl:origin-top-left`). The skip menu (MOT-G2-11) uses the bottom end corner. Keep `data-motion="fade"`; under reduced motion add `.names-menu-in` to the reduced block as `names-fade-in`. Do it with -02's menu exit.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/MOT-G13/rowmenu-open-60ms-webkit.png`

### MOT-G13-06: A duel pick swaps both names in one frame and the progress bar jumps, so a pick isn't felt as a step

- **Screen and state:** `/names/lists?tab=duel` → tap one of the two names (each round).
- **Browser:** webkit-iphone (`duel-press` and `duel-pick`: no animation; `duel-pick-40ms-webkit.png` already shows the next pair) · code
- **What's wrong:** A tap gives no press response (P2), and 40 ms later both cards show new names with identical layout. On a pick where one name stays (the winner moves on), only one word changes, which reads as "nothing happened" or "the tap missed". That links to INT-G3-08 (no undo) and IMP-A-G3-03 (a double tap records two picks). The bar's `width` (`DuelScreen.tsx:227`) jumps one step.
- **Rule it breaks:** `find-animation-opportunities` · Teleporting state "Content that swaps … instantly → fade"; gate: **frequency** tens per duel (≈ 3 rounds per name, BREAK-G3-07) → near-imperceptible only; **purpose** state indication (a new round) + feedback; **speed** ≤ 150 ms; **function** the names are what the user reads, so motion must not delay them.
- **Severity:** P3
- **Effort:** S
- **Proposed change:** in `DuelScreen.tsx`: (1) add the shared `PRESS` (`ui/classes.ts`) to the two pick buttons, but at `active:scale-[0.97]` since they are large cards. (2) Key the name `<span>`s by round (`key={`${p.round}-${i}`}`) and give them `names-fade-in` at 120 ms `var(--nest-ease-out)` with `data-motion="fade"`, opacity only, no movement. (3) Optional: replace the bar's inline `width` with `transform: scaleX(p)` and `origin-left rtl:origin-right`, 200 ms `var(--nest-ease-out)`. Taps stay live the whole time; nothing waits for the fade. Reduced motion: the 120 ms opacity fade stays, the bar jumps.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/MOT-G13/duel-pick-40ms-webkit.png`, `duel-press-100ms-webkit.png`

### MOT-G13-07: The email step turns into the code step in one frame

- **Screen and state:** `/names/sign-in/email` → "שליחת קוד" → "מה הקוד?" (and "שינוי כתובת" back).
- **Browser:** webkit-iphone (`email-to-code`: no animation, `email-to-code-60ms-webkit.png` already shows the code step)
- **What's wrong:** The panel's title, text, field and button all change at once in the same place. Only the title change shows that the step moved on. It is a once-per-sign-in moment, so it has room for a short bridge, and focus jumping into the new field without one is abrupt.
- **Rule it breaks:** `find-animation-opportunities` · Teleporting state "Content that swaps … instantly"; gate: **frequency** rare (per sign-in), **purpose** preventing a jarring change / state indication, **speed** 200 ms, **function** form, so it mustn't delay input.
- **Severity:** P3
- **Effort:** S
- **Proposed change:** in `EmailSignIn.tsx`, key the panel content by `step` and give the new step's wrapper a `names-step-in` keyframe (`from { opacity: 0; transform: translateY(8px) }`), 200 ms `var(--nest-ease-out)`. Opacity + transform only, so no layout shift. The panel box itself doesn't move. Focus moves to the code field at once (don't wait for the animation). Reduced motion: opacity only, 160 ms (`data-motion="fade"`). The same class could serve the onboarding success → next screen, but only on these two auth steps for now.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/MOT-G13/email-to-code-60ms-webkit.png`

### MOT-G13-08: Entry CTAs, the duel cards and settings rows have no press response (motion values for PRO-G1-03 / PRO-G3-01 / IMP-A-G1-08)

- **Screen and state:** welcome "כניסה עם Google" / "כניסה עם קוד במייל" (`WelcomeActions.tsx:72,82`), sign-in "שליחת קוד"/"כניסה" (`EmailSignIn.tsx:24`), onboarding submit (`Onboarding.tsx:237`), callback "חזרה לכניסה" (`AuthCallback.tsx:63`); duel cards; settings rows (`SettingsScreen.tsx:45`).
- **Browser:** webkit-iphone (welcome-press, duel-press: no transition recorded while held)
- **What's wrong:** These hand-rolled pills and rows skip the shared `PRESS`. The app's own icon buttons and chips shrink to 0.95 on touch, but the main buttons of the entry flow don't react, so the two families of buttons feel different. Already filed by PRO-G1-03, PRO-G3-01 and IMP-A-G1-08. This entry only adds the motion spec so triage can merge.
- **Rule it breaks:** `find-animation-opportunities` · Feedback gaps "Pressable elements with no `:active` state → `scale(0.97)` … 160ms ease-out"; `review-animations` · Standard 10 cohesion.
- **Severity:** P3
- **Effort:** S
- **Proposed change:** use `buttonClass("primary"|"secondary")` from `ui/classes.ts` (it carries `PRESS` + `touch-manipulation`), or append `PRESS` where the shape must stay. Large surfaces (duel cards, full-width settings rows): `active:scale-[0.98]` or, for rows, a background tint `active:bg-sand` with no scale (rows sit in a card; scaling one row reads wrong). Re-time `PRESS` on the token curve (`--nest-duration-press` 150 ms, `--nest-ease-out`) per MOT-G2-03. Reduced motion: `motion-safe:` already drops the scale; the row tint stays.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/MOT-G13/welcome-press-120ms-webkit.png`, `duel-press-100ms-webkit.png`

### MOT-G13-09: Reduced motion freezes the two loading spinners into a static ring (motion values for IMP-A-G1-03)

- **Screen and state:** `/names/auth/callback` "מתחברים…", `/names/join/<code>` "רק רגע, מצטרפים לבחירה" with `prefers-reduced-motion: reduce`.
- **Browser:** webkit-iphone (`callback-spinner-rm-300ms-webkit.png`: a still ¾ ring; the reduced inventory saw no running animation)
- **What's wrong:** The reset sets `animation-iteration-count: 1` and 0.01 ms on `animate-spin`, so the indicator stops. A still ring looks like a stuck screen, and these waits can take seconds on a slow network (BREAK-G1). The text next to it ("רק רגע…") carries the meaning, so it is not a WCAG failure, but "gentler, not zero" applies.
- **Rule it breaks:** `review-animations` · Standard 8 "gentler, not zero"; `remove-animations` · "Infinite loop … on a persistent element" doesn't apply (it's a loading indicator, kept, Part 2).
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** a `names-spinner` class for both spans: normal `animation: spin 1000ms linear infinite` (as now). Reduced, unlayered after the switch-off: `animation: names-pulse 1600ms ease-in-out infinite alternate !important` with `@keyframes names-pulse { from { opacity: 0.35 } to { opacity: 1 } }`. That is opacity only, slow, no movement. Merge with IMP-A-G1-03.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/MOT-G13/callback-spinner-rm-300ms-webkit.png`, `join-spinner-600ms-webkit.png`

## Already filed, seen again here (no new entry)

- **Name sheet opened from a list row** loses its first frames to the mount work: 123 ms task at 4× before the slide, 18 of 39 frames dropped (`trace-sheet-open-x4.json`) = **MOT-G2-04**.
- **Toast** (G3 add-name, invite copy): opacity-only keyframe, no exit, 0.01 ms under reduced motion = **MOT-G2-08**, **MOT-G2-07**. At 4× the add-name submit runs an 87 ms handler before the fade starts (sheet unmount + list re-render). That is in budget and needs no separate fix.
- **Tall sheet exit `ease-in`**, built-in curves everywhere, no motion tokens = **MOT-G2-02**, **MOT-G2-03** (the prerequisite for every fix above).
- **Reduced-motion reset makes everything a 0.01 ms `all` transition** (tabs, inputs, duel bar, toast region padding, focus outline in the G1/G3 reduced inventory) = **MOT-G2-07**.
- **Removed/hidden rows vanish in one frame and the rows below jump** = **INT-G3-02** (IMP-C-G3-01). The motion spec for triage: an exit of `opacity → 0` over 150 ms `var(--nest-ease-out)`, then the remaining rows close the gap with no height animation (accepted instant collapse), or `grid-template-rows: 1fr → 0fr` 200 ms if the owner wants the collapse animated (`animate` allows height-like motion only for accordions). Reduced: opacity only. Occasional frequency, purpose "preventing a jarring change".

## Part 2: Kept, and rejected candidates (required by the skills)

**Kept (`remove-animations`):**
- S1 sheet slide + scrim (add-name, install, decision, about, report, name sheet): occasional; they show where the sheet comes from (spatial consistency). Only the curve (MOT-G2-02) and Safari's add-name case (-01) change.
- D1 dialog `scale(0.96)` + fade 200 ms: occasional, a modal, so it stays centered (`transform-origin: center` is right for modals, STANDARDS "Modals are exempt"). Only the curve token changes.
- P1 press `scale(0.95)` 150 ms on shared buttons: feedback, within 100–160 ms, `motion-safe` gated.
- L1 spinners: loading indicators for waits that can last seconds (callback, join); they aren't decoration. Only their reduced version changes (-09).
- L2 static skeletons (`AuthSkeleton`, invite, lists, duel): no shimmer, which is right. The waits are usually under 300 ms, and a shimmer would flash (`remove-animations` · "Skeleton shimmer on content that loads in under 300ms").

**Rejected (`find-animation-opportunities` gate):**
- **Tab switches** "שמרתי / התאמות / דו־קרב" (Safari: one frame, `normal-w0`): **Frequency**, tens a session, core navigation → no animation. Correct as is.
- **Page transitions** between lists, settings, about, privacy, terms, hidden (route changes inside the app): **Frequency** → no animation (`remove-animations` · "Route or page transitions inside the app").
- **Welcome hero entrance** (staggered wordmark, card and actions; Persuade mode): **Function**. It's the first paint of the entry screen, seen at every sign-in, and an entrance would hold back LCP and the sign-in buttons. The delight budget isn't worth delaying the primary action.
- **Counts in the tabs ("שמרתי · 6") and the duel's "סיבוב 2 מתוך 11" ticking:** **Function**, numbers the user reads.
- **Staggered list rows** on `/names/lists` and `/names/hidden`: **Frequency**, opened tens of times; content to read (`remove-animations` · "Staggered entrances on lists the user loads many times a day").

## Verdict

G1 and G3 are close to right on motion. They animate little, everything that does runs on the compositor (13–22 compositor-animation frames per trace), and the high-frequency surfaces (tabs, routes, rows) are correctly instant. The gaps are symmetry and fidelity, not excess:
- surfaces enter with motion and leave in one frame (-02);
- Safari never shows the add-name sheet's entrance (-01);
- reduced motion is uneven: the dialog pops, toasts lose their fade, spinners freeze (-03, -09);
- the opt-in switch animates a layout property (-04).

Nothing should be deleted. The highest-leverage item is **-02** (one shared exit in `BottomSheet`/`Dialog`/`RowMenu`). It fixes INT-G3-06 and INT-G2-05 too, and should land right after the motion tokens (MOT-G2-03). Feel checks that need a device after the fixes: the Safari recording for -01, and the duel fade's speed over a 50-round duel (-06). Handoff: triage turns these into backlog items; in `improve-animations` terms, `plan <finding>` per row.
