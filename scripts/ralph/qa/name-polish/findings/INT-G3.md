# INT · G3: Lists and settings (`/names/lists` saved, matches, duel, row menu, add-name, `/names/hidden`, `/names/settings` with its dialogs, `/names/about`, `/names/privacy`, `/names/terms`)

Skills: `interaction-design` (`SKILL.md`, references `error-prevention.md`, `state-and-transitions.md`, method of `examples/interaction-audit-walkthrough.md`), `apple-design` (`SKILL.md`), `emil-design-eng` (`SKILL.md`: Review Format, Animation Decision Framework, Component Building Principles, Touch device hover states, Sonner Principles, Asymmetric enter/exit timing, Review Checklist).

**Method** (the audit walkthrough's):
1. **Catalog every control on the G3 screens:**
   - **Lists:** the tabs, row names (open the name sheet), the row menu and its items, the chosen banner, the duel link and "הוספת שם" with its sheet.
   - **Duel:** the source toggle, the two pick cards, "עצירה", and the result buttons.
   - **Hidden:** "החזרה".
   - **Settings:** the name field and "שמירה", the opt-in switch, link rows, "יציאה מהחשבון", and the two confirm dialogs.
   - The about, privacy and terms pages are reading only (back button and links).
2. **A state inventory per control** (default, pressed, busy, disabled, during a transition, after the action), measured in the browsers.
3. **Rules and recovery:** what a tap changes, whether it can be taken back, and whether anything visible confirms it.
4. **Motion:** the menu and dialog enter and exit, a row leaving, and a duel pick, frame by frame.

The `emil-design-eng` Before/After table is at the end.

**How it was checked:**
- **Probe:** `shots/int-g3-probe.mjs [webkit|chromium] [lists|duel|hidden|settings|add]`.
  - Setup: dev server :3000, Playwright WebKit iPhone 15 and Chromium Pixel 7, QA user 1.
  - Mocks and states come from `a11y-g3-probe.mjs` / `us007-g3.mjs`: 8 saved, 4 hidden, 3 matches in a pair space. Every write is answered locally and never sent.
  - The settings run answers `auth/v1/user` PUT after 800 ms with the stored user's own metadata, so a slow save can be seen.
  - Sampling: per-frame samplers (`requestAnimationFrame` + `getBoundingClientRect` / `getComputedStyle` / `getAnimations()`) run inside one `page.evaluate` around a `click()`.
  - Output: `audit/INT-G3/probe-<engine>.json`.
- **Simulator, Mobile Safari** (real touch, dev server :3000, QA user 1 with the real backend):
  - `shots/int-g3-sim.mjs <url> <x> <y> <name> [holdMs]` holds a cliclick touch for 900 ms, takes a screenshot, then slides 200 pt off before lifting, so nothing fires.
  - Held targets: the "דו־קרב" tab on `/names/lists`, the opt-in switch, and the "יציאה מהבחירה המשותפת" row on `/names/settings`. The third aim was "על הנתונים", but it landed on the leave row: the Safari page sits lower than the WebKit layout used to locate it.
  - Nothing was written. Safari was left on `/names/settings`.
- Shots: `scripts/ralph/qa/name-polish/shots/audit/INT-G3/` (gitignored).

**Assumptions and skips:**
- None of the three skills asks questions during a review. The "Initial Response" greetings are skipped.
- **Safari coverage is partial.** QA user 1's real data has nothing saved or hidden, and Safari can't route Supabase. So the row menu, removals, the duel and "החזרה" were measured in Playwright only (both engines agree on every number). In Safari, only the press mechanics were checked, on controls built the same way.
- Synthetic `click()` doesn't focus a button in WebKit, so the probe can't judge focus return after a dialog. A11Y-G3 checked focus by keyboard.
- Haptics: out of reach on iOS web, as in INT-G2. Not filed.

## What passes (checked)

- **Tabs** switch in 39–53 ms after the tap: the selected tab and the panel change in the same frame, in both engines. That's under the 100 ms "instantaneous" band, so no feedback is needed beyond the change (`interaction-design` Responsiveness Thresholds). The tabs don't animate, which is right for a control used many times a session (emil §1).
- **Row menu:**
  - It opens with a 200 ms fade (emil: small popovers 125–200 ms).
  - Focus goes to the first item. Arrows, Home/End, Escape and Tab behave as in the skip menu.
  - After a removal, focus moves to the next row's menu button. That's correct, and better than losing focus.
- **Hover:** Tailwind 4's `hover:` is behind `@media (hover: hover)`, so the `hover:bg-sand` on tabs, the source toggle and menu items never sticks after a tap (emil "Touch device hover states").
- **Add-name sheet:**
  - The field gets focus on open.
  - Return submits, and "כבר ברשימה" shows inline and keeps the sheet open with focus in the field.
  - A valid name closes the sheet in 2–3 frames, and "השם … נוסף לרשימה" shows as a toast in the same frame.
  - The new row lands at the top of the kept group, under the loved names, so it's in view with a short list.
- **Confirm dialogs:**
  - They enter over 200 ms with opacity plus scale 0.96 → 1 and ease-out (emil: never from scale(0), dialogs stay centered).
  - "ביטול" carries `data-autofocus`.
  - The destructive actions use a confirmation, not an undo, which is the case `error-prevention.md` reserves it for: "Truly irreversible … Affect others".
- **Busy labels:** "שמירה" → "שומרים…", "יוצאים…", "מוחקים…" with `aria-busy`. The name save keeps the button in its busy state for the whole 2 s request.
- **Opt-in switch:** it's optimistic. It flips in the first frame after the tap and settles when the server answers, so it doesn't wait on the network (apple §1 "Respond on pointer-down").
- **Duel:** the round counter, the bar and the next pair update in the next frame (5–8 ms). "עצירה" saves and says so with a toast.
- **About, privacy, terms:** reading pages with a back button and links. Nothing interactive to file. Their navigation is IMP-C-G3-03.

Already filed by other lenses and not repeated here:
- No press state on hand-rolled controls: PRO-G3-01.
- Remove and hide can't be undone: IMP-C-G3-01. INT-G3-02 adds the motion and the hidden screen.
- The chosen banner's one-tap "ביטול": IMP-C-G3-07.
- A double tap on a duel card records two picks: IMP-A-G3-03.
- Duel picks have no press feedback and the next pair snaps in: IMP-C-G3-12.
- The settings confirms can be dismissed mid-request: IMP-A-G3-04.
- The fields stay editable while saving: same pattern as INT-G1-02. The name field isn't read-only during "שומרים…" (`nameSaving.inputDisabled: false`).

### INT-G3-01: Switching the duel between "שמרתי" and "התאמות" silently throws away a duel in progress

- **Screen and state:** `/names/lists?tab=duel`, pair space with 2+ matches (source toggle visible), a duel over "שמרתי" a few picks in
- **Browser:** webkit-iphone · chromium-pixel (probe, identical)
- **What's wrong:**
  - **The steps:** after 3 picks over "שמרתי" (round 4 of 16, top three shown), one tap on "התאמות" starts a matches duel. One pick there, then a tap back on "שמרתי", shows **round 1 of 17**: the three picks are gone. After a reload it's still round 1 (`duelBackToSaved`, `duelSavedAfterReload`).
  - **Nothing warns:** no toast, and no "הדו־קרב מתחיל מחדש" line (`restartedLine: 0`). That line exists for a changed list, but it's only shown when the saved duel has the same source.
  - **Why:**
    - `duelState` holds a single duel.
    - The first pick in the other source overwrites it (`DuelScreen.save`).
    - `resumeOrStart` then sees a different source and starts fresh with `restarted: false`.
  - **The tap is easy to make:** the toggle is a radio pair right above the cards, it looks like a filter, and nothing on it says that a pick in the other list ends the first duel.
- **Rule it breaks:**
  - `interaction-design` · `references/error-prevention.md` · Error Prevention Hierarchy: "Never design at Level 5-6 when you could design at Level 1-2" (level 1 "Eliminate": "Auto-save eliminates 'forgot to save'"). The duel promises it is saved ("עצירה, אפשר להמשיך אחר כך") but loses it.
  - `interaction-design` · `SKILL.md` Rules · "Define every edge case … Interrupted actions?"
  - `apple-design` · `SKILL.md` §16 Agency · "Back it with forgiveness — easy undo for slips"
- **Severity:** P2
- **Effort:** S
- **Proposed change:** keep one saved duel per source.
  - `duelState` becomes `{ saved?: DuelState, matches?: DuelState }`, read and written in `src/lib/names/duel.ts` (`resumeOrStart`, `deserialize`) and `src/components/names/lists/DuelScreen.tsx` (`useSavedDuel`, `save`).
  - `deserialize` must still read today's single-duel value as the duel of its `source`.
  - Switching then only changes which duel is on screen, and each one resumes where it stopped.
  - The data stays in the local pref; there's no server change.
  - Add the case to `tests/names/duel.test.ts`.
- **Guardrail:** polish. A local pref shape and existing behavior ("every pick is saved"); no new screen, setting or backend.
- **Screenshots:** `audit/INT-G3/duel-after3-webkit.png` (round 4, top three) → `duel-switched-webkit.png` → `duel-back-to-saved-webkit.png` (round 1 of 17), and the `-chromium` versions

### INT-G3-02: A removed, hidden or restored row disappears in one frame, the rows below jump, and only a screen reader hears it (extends IMP-C-G3-01)

- **Screen and state:** `/names/lists` "שמרתי", row menu → "הסרה מהרשימה" / "לא להציג יותר"; `/names/hidden` → "החזרה"
- **Browser:** webkit-iphone · chromium-pixel (probe)
- **What's wrong:**
  - **Lists:** after "הסרה מהרשימה", the next frame (9–16 ms) has 7 rows and the list is 73 px shorter. In WebKit the row under it jumps from y 187 to 260 with no animation (`removeFrames`, `anims: 0`).
  - **Hidden:** "החזרה" does the same: 4 → 3 rows in one frame, 73 px (`hiddenRestoreFrames`).
  - **No visible confirmation:** in both places the only confirmation is the `sr-only` status ("השם אורי הוסר מהרשימה", "השם איתי יחזור לבחירה").
  - **What a sighted user sees:** a list that changed under the finger, with nothing saying which name went or where.
  - **Not consistent:** the same app confirms a vote in the name sheet with a toast, and "דילוג" on a saved name there gets a "ביטול" toast (`ListsScreen.decideInSheet`). A removal from the row menu gets neither.
  - IMP-C-G3-01 filed the missing undo for the lists. This adds the jump, the missing visible confirmation, and the hidden screen's "החזרה". A mis-tapped "החזרה" sends the name back into the deck, and the only way to hide it again is to meet it there.
- **Rule it breaks:**
  - `interaction-design` · `references/error-prevention.md` Undo Patterns · "Delete immediately. Show 'Undo' toast"
  - `interaction-design` · `SKILL.md` Common Mistakes · "Identical feedback for different outcomes"
  - `emil-design-eng` · `SKILL.md` §2 · "Preventing jarring changes: elements appearing or disappearing without transition feel broken"
  - `apple-design` · `SKILL.md` §16 · "Confirm meaningful actions"
- **Severity:** P2
- **Effort:** S
- **Proposed change:**
  - **Toast:** in `ListsScreen` `onAction` and `HiddenScreen.restore`, show the existing toast with the status text and a "ביטול" action that puts the old vote back. Reuse the `restore` pattern of `decideInSheet` (`store.setVote(name, previous.vote, previous.custom)`). Keep the focus move.
  - **Motion:** optionally, a ≤ 200 ms collapse of the leaving row (opacity, then height via `grid-template-rows: 1fr → 0fr`), only when motion isn't reduced. Rows are rare actions, so a short exit fits emil's "Occasional" band.
  - Merge with IMP-C-G3-01 in triage. CRIT-G3-01 (hide on a custom name) touches the same handler.
- **Guardrail:** polish. The existing toast and votes store; no new feature.
- **Screenshots:** `audit/INT-G3/lists-after-remove-webkit.png`, `-chromium.png`, `hidden-after-restore-webkit.png`, `-chromium.png`

### INT-G3-03: The row menu of a lower row opens below the screen, hiding "הסרה מהרשימה" and "לא להציג יותר"

- **Screen and state:** `/names/lists` "שמרתי" with 8 rows, scrolled so the last row sits at the bottom edge, its "אפשרויות עבור …" tapped
- **Browser:** webkit-iphone (393 × 659: 95 px of the 146 px menu below the viewport) · chromium-pixel (412 × 839: 62 px below)
- **What's wrong:**
  - The menu always opens under its button (`top-full mt-1.5`).
  - **Last row:** only the first item ("בחרתי בשם יוסף") is on screen. The two removals are below the fold, and the page has to be scrolled with the menu open to reach them (`lastRowMenu`).
  - **Other rows:** the same happens for any row in the bottom ~150 px of the screen.
  - **On a phone:** the thumb rests near the bottom, which is where this happens most.
- **Rule it breaks:**
  - `interaction-design` · `SKILL.md` Harmonious Interaction Principles · "Keep tools close at hand"
  - `interaction-design` · `SKILL.md` Excise · physical excise, "repeated scrolling"
  - `apple-design` · `SKILL.md` §7 · "Anchor interactions to their source"
- **Severity:** P2
- **Effort:** S
- **Proposed change:** in `src/components/names/lists/RowMenu.tsx`, measure on open (layout effect).
  - If the button's bottom plus the menu height plus the safe-area inset is more than `innerHeight`, open upward (`bottom-full mb-1.5` instead of `top-full mt-1.5`).
  - Set the fade's `transform-origin` to the button's side.
  - No library; the menu stays in place.
- **Guardrail:** polish
- **Screenshots:** `audit/INT-G3/lists-menu-lastrow-webkit.png`, `-chromium.png`

### INT-G3-04: Held tabs, toggles, the switch and settings rows select their words in Safari (extends INT-G2-02)

- **Screen and state:** `/names/lists` tabs, held 900 ms; `/names/settings` opt-in switch and the "יציאה מהבחירה המשותפת" row, held 900 ms
- **Browser:** sim-safari (iPhone 17 Pro, iOS 26.5)
- **What's wrong:**
  - **What Safari does:** a held press starts a text selection with the loupe and the blue handles. It selects "דו־קרב" on the tab, "לחנויות" on the switch, and "אצלך" on the leave row (`sim-tab-hold-held.png`, `sim-switch-hold-held.png`, `sim-aboutrow-hold-held.png`).
  - **Which controls:** the lists tabs, the duel source toggle, the switch, the settings row buttons and the duel pick cards. All are hand-rolled `<button>`s with text and without `select-none`. The duel pick computes `user-select: text` in WebKit (`duelPickStyle`).
  - **When it happens:** someone resting a thumb on a duel card while deciding gets a selection instead of a pick. Those are the controls people hold longest.
  - INT-G2-02 filed the same for "שמירה" / "אהבתי" on the deck. G3 has more of these controls.
- **Rule it breaks:**
  - `apple-design` · `SKILL.md` §10 · "Tap: highlight on touch-down (instant), commit on touch-up … allow cancel-by-dragging-away"
  - `interaction-design` · `SKILL.md` Trigger design · "Consistent behavior — A trigger must initiate the same action every time"
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** add `select-none [-webkit-touch-callout:none]` once, where these classes come from:
  - a shared class in `src/components/names/ui/classes.ts`, used by the tab and toggle buttons in `ListsScreen` / `DuelScreen`;
  - `rowAction` and the switch in `SettingsScreen`;
  - the duel pick buttons and `RowName`.
  - Text inputs are untouched.
  - Merge with INT-G2-02 (Button pill/undo) and INT-G1-03 (link callout) into one shared-class item.
- **Guardrail:** polish
- **Screenshots:** `audit/INT-G3/sim-tab-hold-held.png`, `sim-switch-hold-held.png`, `sim-aboutrow-hold-held.png` (rest: `-rest.png`)

### INT-G3-05: A tap outside the open row menu also lands on what's under it

- **Screen and state:** `/names/lists` "שמרתי", a row menu open, then a tap on another row's name
- **Browser:** webkit-iphone · chromium-pixel (probe)
- **What's wrong:**
  - The tap closes the menu and also opens that name's sheet (`?sheet=name&n=…`, a dialog on screen, `tapThroughWhileMenuOpen`).
  - **Why:** `RowMenu` closes on a capture-phase `pointerdown` outside, but doesn't stop the click that follows.
  - **Platform convention:** iOS and Android menus treat the tap outside as "dismiss" only.
  - **Where it bites:** with a menu open, a reach for the empty space to dismiss it easily lands on the next row and opens a sheet nobody asked for. Worse, it can land on another row's menu button or the duel link.
- **Rule it breaks:**
  - `apple-design` · `SKILL.md` §16 Familiarity · "Be consistent … so people can predict what happens next"
  - `interaction-design` · `SKILL.md` Gesture Design Rules · "Respect the platform"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `RowMenu`'s outside `pointerdown` handler, when it closes the menu, add a one-shot capture `click` listener on `document` that calls `preventDefault()` and `stopPropagation()`, removed after the next click or 400 ms. The skip menu already swallows its follow-up click (`SkipButton.swallowClick`).
- **Guardrail:** polish
- **Screenshots:** `audit/INT-G3/lists-menu-tapthrough-webkit.png`, `-chromium.png`

### INT-G3-06: The row menu and the confirm dialogs fade in but vanish in one frame (extends INT-G2-05)

- **Screen and state:** row menu closed by a tap outside or by an item; `/names/settings` delete and leave dialogs closed by "ביטול", the scrim or Escape
- **Browser:** webkit-iphone · chromium-pixel (probe)
- **What's wrong:**
  - **Row menu:** fades in over 200 ms. On close it's gone 2–11 ms after the tap (`menuCloseOutside`).
  - **Dialogs:** enter over 200 ms (opacity 0 → 1, scale 0.96 → 1). On "ביטול" the dialog and its scrim are gone in the next frame, 8–12 ms (`dialogCloseFrames`).
  - **Why:** `Dialog` and `RowMenu` unmount as soon as `?dialog=` / `open` changes. Only BottomSheet's tall detent has a closing state.
  - INT-G2-05 filed the same for the deck's sheets without detents. It's one pattern across `ui/`.
- **Rule it breaks:**
  - `apple-design` · `SKILL.md` §7 · "Enter and exit along the same path … If something disappears one way, we expect it to emerge from where it came"
  - `emil-design-eng` · `SKILL.md` Asymmetric enter/exit timing · exit faster than enter, "release should always be snappy (200ms ease-out)": faster, not zero
- **Severity:** P3
- **Effort:** S
- **Proposed change:**
  - Give `src/components/names/ui/Dialog.tsx` a short closing state like BottomSheet's: keep it mounted 150 ms with `names-fade-out` on the panel and `names-scrim-out` on the scrim, then call `closeDialog`.
  - Do the same in `RowMenu` (`names-fade-out` 150 ms).
  - Reduced motion: the existing 160 ms fade or nothing.
  - Merge with INT-G2-05 in triage as one shared exit.
- **Guardrail:** polish. Existing keyframes; it may add one duration token if 150 ms isn't one yet (§3.1.2).
- **Screenshots:** frame data in `audit/INT-G3/probe-webkit.json` / `probe-chromium.json` (`menuCloseOutside`, `dialogOpenFrames`, `dialogCloseFrames`); a one-frame exit doesn't show in a still

### INT-G3-07: The opt-in switch drops a second tap while it saves, looks idle meanwhile, and slides its thumb with a layout property

- **Screen and state:** `/names/settings`, "עדכון כש־Nest יוצאת לחנויות", two taps 150 ms apart with an 800 ms server answer
- **Browser:** webkit-iphone · chromium-pixel (probe)
- **What's wrong:**
  - **The second tap is lost:** the first tap flips the switch to on at once, which is right. The second tap, meant to turn it back off, is ignored (`if (savingOptIn) return`). It ends **on** after one request (`switchDoubleTap: puts 1`, `switchEnd: checked true`).
  - **Nothing shows it's busy:** for those 800 ms the switch only has `aria-busy`. It doesn't dim and its thumb doesn't change, so it looks ready for the tap it will drop.
  - **The thumb animates a layout property:** it moves by animating `inset-inline-start` (150 ms, `transition-[inset-inline-start]`), which runs layout on every frame instead of a transform.
- **Rule it breaks:**
  - `apple-design` · `SKILL.md` §3 · "Never lock out input during a transition"
  - `interaction-design` · `SKILL.md` Trigger design · "Communicate state — Triggers have states … Each state must be visually distinct"
  - `emil-design-eng` · `SKILL.md` Performance Rules · "Only animate transform and opacity"
- **Severity:** P3
- **Effort:** S
- **Proposed change:** in `src/components/names/SettingsScreen.tsx` `toggleOptIn`:
  - **Keep the last value asked for:** set `optIn` on every tap, and after the request returns send once more if the wanted value differs from the one saved, rather than ignoring taps while saving.
  - **Thumb:** move it with `translate` (`translate-x-…` plus `rtl:` for the mirrored side) instead of `inset-inline-start`.
- **Guardrail:** polish
- **Screenshots:** frame data in `audit/INT-G3/probe-webkit.json` (`switchStyle`, `switchDoubleTap`, `switchEnd`)

### INT-G3-08: A wrong pick in the duel can't be taken back

- **Screen and state:** `/names/lists?tab=duel`, any round after the first
- **Browser:** webkit-iphone · chromium-pixel (probe), by the code path
- **What's wrong:**
  - Each pick is final and saved at once (`DuelScreen.choose` → `setPref("duelState")`). The next pair replaces the cards in the next frame (`duelPickFrames`).
  - **A mis-tap stays.** Picking the wrong card, or a second tap landing on the next pair (IMP-A-G3-03), is permanent. The only recovery is "דו־קרב חדש" at the end, which drops every pick.
  - **The stakes:** with 8 names a duel is 17 rounds, and the result feeds the decision ("בחרתי בשם …").
- **Rule it breaks:**
  - `interaction-design` · `references/error-prevention.md` Undo Patterns · "Undo is almost always better" / "Multi-level undo … Steps back through action history"
  - `apple-design` · `SKILL.md` §16 Agency · "easy undo for slips"
- **Severity:** P3
- **Effort:** S
- **Proposed change:** two options for the owner:
  - **(a)** A quiet "ביטול הבחירה האחרונה" link next to "עצירה", shown after the first pick. It steps the saved `DuelState` back one pick: keep the previous state in memory, or add `pick` history to `src/lib/names/duel.ts`.
  - **(b)** Leave it as is, and rely on IMP-A-G3-03's double-tap guard to remove most accidental picks.
  - Recommendation: (b) now, (a) if the owner wants it.
- **Guardrail:** owner. It adds a control and an action to the duel (§3.1.4 "No new features", §3.2 "add a feature").
- **Screenshots:** `audit/INT-G3/duel-after3-webkit.png`

## Before / After (emil-design-eng Review Format)

| Before | After | Why |
| --- | --- | --- |
| `duelState` = one duel; a pick in the other source overwrites it (`DuelScreen.save`) | `duelState` = `{ saved, matches }`, each resumed on its own | One tap on the toggle shouldn't erase three picks without a word (INT-G3-01) |
| Row menu remove/hide and "החזרה": `setStatus(...)` only, row unmounts | `showToast(text, { action: { label: "ביטול", onAction: restore } })` + ≤ 200 ms row collapse | Confirm and allow undo like the sheet's skip toast; no 73 px jump (INT-G3-02) |
| Menu `absolute top-full mt-1.5` always | Measure on open; `bottom-full mb-1.5` when it would cross `innerHeight` | 62–95 px of the menu, the two removals, are off-screen on the last row (INT-G3-03) |
| Tabs, toggle, switch, `rowAction`, duel picks: text selectable | `select-none [-webkit-touch-callout:none]` from one shared class | A held press selects words with the loupe in Safari (INT-G3-04) |
| Outside `pointerdown` closes the menu; the click goes on | Swallow the next click once after an outside close | Dismissing a menu shouldn't open a name sheet (INT-G3-05) |
| `Dialog` / `RowMenu` unmount on close (exit 0 ms, enter 200 ms) | 150 ms `names-fade-out` + `names-scrim-out`, then unmount | Exit faster than enter, not instant (INT-G3-06) |
| `if (savingOptIn) return`; `transition-[inset-inline-start]` | Queue the last wanted value; thumb on `translate` | Don't drop input; animate transform, not layout (INT-G3-07) |
