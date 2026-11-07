# IMP-A · G3: Lists and settings (saved, row menu, chosen banner, add-name, matches, duel, hidden, settings and its dialogs, about, privacy, terms)

Run 2026-11-07 by US-A-IMP-A-G3 at `d836768` (no app code change since the baselines).

Skill: `impeccable` (`.claude/skills/impeccable/SKILL.md`, references read: `reference/audit.md`, `reference/craft-floor.md`, `reference/polish.md`, `reference/harden.md`). Setup: `sh .claude/skills/impeccable/scripts/impeccable context --target src/components/names/lists/ListsScreen.tsx` ran (PRODUCT.md + DESIGN.md loaded). Mode Operate for every G3 screen (PRD §3.3.5). This is the code-level audit: what can be measured in the code and the rendered page. Design judgment is IMP-C-G3's.

Assumptions where the skill would ask: the closing "run these one at a time or all at once" is skipped (Ralph can't ask, PRD §3.3.2). Every finding goes to triage and nothing is fixed here. audit.md's "Suggested command" maps to the PRD §7 "Proposed change", so commands are only named in the summary. `critique-storage latest` wasn't read: IMP-C-G3 wrote no snapshot. No step needed a service.

## Method and evidence

- **Code read:** `lists/` (`ListsScreen`, `RowMenu`, `DuelScreen`, `AddNameSheet`), `HiddenScreen`, `SettingsScreen`, `ui/Dialog`, `legal/LegalScreen`, `about/AboutScreen`, `useMatches`, `lib/names/matches.ts` (store), `lib/names/voteStore.ts` (load), `lib/names/accountDeletion.ts`, `lib/names/leave.ts`, `AuthProvider.signOut`, the `link` variant in `ui/classes.ts`, and the reduced-motion rules in `names.css`. Every G3 listener (`RowMenu`'s outside `pointerdown`, `useOnline`, the matches store's focus/interval) is removed on cleanup.
- **Detector:** `sh .claude/skills/impeccable/scripts/impeccable detect --json` on 33 G3 sources (`lists/`, `legal/`, `about/`, `SettingsScreen`, `HiddenScreen`, `ui/`, `DecisionSheet`, `BackButton`, `pwa/`, the six `page.tsx`, `names.css`), run under `bash`: exit 0, `[]`.
- **Rendered probe** (`shots/imp-a-g3-probe.mjs`, gitignored), dev server :3000, QA user 1, every backend call mocked as in `us007-g3.mjs` (writes echoed, never sent):
  - **States, in WebKit iPhone 15, Chromium Pixel 7 and WebKit 320 × 568:** 17 states: saved, row menu, add-name, duel round 1, saved empty, hidden empty, chosen banner, matches solo, settings solo, matches (shared), hidden, settings shared, the leave and delete dialogs, about, privacy, terms.
  - **Recorded per state:** axe-core violations, targets under 44 px, input font sizes and `maxLength`, horizontal overflow and overflowing elements, headings, `<main>` count, title, focused element, console errors.
  - **harden.md error scenarios:** `name_matches` answering 500 with no cache (8 s), and the effect on the duel; `GET name_votes` answering 500 on a fresh device (no IndexedDB cache); `DELETE /api/names/account` held for 10 s, then Escape mid-request, then a 500 that arrives after the dialog closed.
  - **Concurrency:** two touch taps 90 ms apart on a duel card (WebKit and Chromium).
  - **Large data:** 400 saved names (render, tab switch, duel link).
  - **Row menu on the last rows:** opened and scrolled to the bottom; its box stays inside the viewport (left 28, right 204 of 393; nothing clipped).
  - **Motion:** the settings switch thumb's computed transition.
- **Shots:** `scripts/ralph/qa/name-polish/shots/audit/IMP-A-G3/`: `probe-<state>-<webkit|chromium|webkit320>.png` (17 × 3), `probe-matches-error-*`, `probe-duel-saved-matches-error-*`, `probe-votes-error-*`, `probe-delete-hang-webkit.png`, `probe-last-row-menu-webkit.png`, plus the 24 G3 states from `us007-g3.mjs` in `-chromium` and 22 in `-webkit` on :3000 (WebKit's privacy and terms navigation was interrupted by a redirect to about; `probe-privacy-webkit.png` and `probe-terms-webkit.png` cover them).
- **Gaps:** the Simulator wasn't driven: Safari runs on the real backend, and every finding here needs a mocked failure or a state QA user 1 doesn't have. Gestures are synthesized Playwright touch, not hardware. iOS input zoom wasn't reproduced (see -05).
- **Incident during this audit (not a finding about the app):** the first version of the probe held `DELETE /api/names/account` with a route handler that never answered. When the WebKit browser closed, the held request reached the dev server and deleted QA user 1 (Supabase auth log, 2026-11-07 18:02:58 UTC, service role, from this Mac). QA user 1 was signed in again (which re-created the account), onboarded through the app, and joined QA user 2's space through the app's join page, so it is back to "shared space with QA2, nothing saved". The probe now answers every held write before closing. Details in `progress.txt`.

## Audit health score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | axe found 0 violations in 17 states × 3 viewports. Tabs, the radiogroup, the menu and the switch carry the right roles and keys; dialogs focus "ביטול". Gaps: the chosen banner's "ביטול" is 39 px wide (-06); fields under 16 px (-05) |
| 2 | Performance | 4 | 400 saved rows render in 373 ms from load and switch tabs in 87 ms (Chromium, dev). No images on G3. The only layout-property animation is the switch thumb (`inset-inline-start`, 150 ms, 24 px): not kept, see below |
| 3 | Theming | 4 | Tokens only (detector clean, `designGuard`). Light only by design (PRODUCT.md). Arbitrary values are sizes only (`h-[78px]` skeletons, `max-w-[480px]`) |
| 4 | Responsive design | 3 | No overflow at 320 px in any state, every target ≥ 44 px tall. Gaps: a double tap records two duel picks (-03); add-name and settings fields under 16 px (-05) |
| 5 | Implementation integrity | 3 | Shared `Dialog`, `BottomSheet`, `Button`, `IconButton`, list rows built the same way in saved, matches, hidden and the duel result. Gap: two server failures turn into misleading states, an endless skeleton (-01) and "nothing saved" (-02) |
| **Total** | | **17/20** | **Good** (address weak dimensions) |

**Implementation integrity verdict: pass.** G3 is one system: one header pattern (back `IconButton`, `text-title` h1), one list card (`rounded-lg bg-surface shadow-card`, `border-line` rows), one `Dialog` for both confirms, the shared toast store and `Button` variants. The detector found nothing in 33 sources. What fails is resilience, not drift: the two data stores have no "failed" state, so a server error reads as "loading" or "empty" (-01, -02).

**Executive summary.** 17/20 (Good). 6 findings: 0 P0, 0 P1, 2 P2, 4 P3.
- Top issues:
  - -01: a failed matches request leaves the matches tab, and the whole duel in a shared space, on a skeleton forever
  - -02: a failed votes read on a new device says "עוד לא נשמרו שמות." and "אין שמות מוסתרים"
  - -03: a double tap on a duel card records two picks
- Recommended next steps:
  - `harden` for -01, -02, -03, -04, -05
  - `polish` for -06

**Patterns.**
1. **No failed state in the data stores.** `matches.ts` `fetchOnce` and `voteStore.ts` `readServer` swallow errors ("keep the last result"), which is right with a cache and wrong without one: the UI can only show loading or empty (-01, -02).
2. **Fields use body-size type tokens** (add-name 15 px, settings name 13.5 px): the same cause as IMP-A-G1-02 and IMP-A-G2-04 (-05).
3. **Requests without a deadline** (account deletion here; callback and join in IMP-A-G1-06).

**Positive findings.**
- **Focus is managed everywhere a row disappears:** removing or hiding a saved row, or restoring a hidden one, focuses the next row's button (or the title); leaving the duel focuses the lists title; the duel result focuses its heading.
- **Keyboard models are complete:** the lists tabs (arrows mirrored for RTL, Home/End), the duel source radiogroup, the row menu (arrows, Home/End, Escape back to its button, Tab closes).
- **Dialogs:** `role=alertdialog`, labelled and described, focus on "ביטול", Escape, Back and the scrim cancel; the busy confirm is `aria-disabled` + `aria-busy`, so a second tap does nothing.
- **Settings writes are guarded:** offline checks before each write, optimistic opt-in with rollback, errors in `role=alert` next to their control, client logs without personal data.
- **Large lists hold up:** 400 rows render and switch tabs quickly without virtualization.
- **Status isn't told by color alone:** "אהבתי מאוד" and "חדש" are words, the switch has "פעיל / כבוי", the delete row is red and says "מחיקת החשבון".
- **Legal pages** are server-rendered, the mailto link is 44 px tall inline, and long Latin values break (`break-all`).

**Checked and not kept:**
- Switch thumb animates `inset-inline-start` (`SettingsScreen.tsx:332`, 150 ms over 24 px): audit.md's "casual layout-property animation", but one small element on a tap, no measurable cost. Left to the MOT lens (already noted by IMP-C-G3).
- Under reduced motion the confirm dialog appears without its fade (its `names-dialog-in` falls under the global kill while the scrim keeps a 160 ms fade). The state change stays clear; no finding.
- A React dev warning ("Can't perform a React state update on a component that hasn't mounted yet") showed once on settings (WebKit) and once on about (Chromium), not reproducible per state. Dev-only, no visible effect; left for QA to watch.
- WebKit's "access control checks" error on an `_rsc` fetch after opening `?sheet=add-name` by URL: a dev-server artefact of the harness.

## Findings

Severity is the PRD's scale (§7): P1 broken, inaccessible or clearly off-brand · P2 noticeable · P3 refinement. Shot paths are relative to `scripts/ralph/qa/name-polish/shots/`.

### IMP-A-G3-01: A failed matches request leaves "התאמות" and the duel on a skeleton forever

- **Screen and state:** `/names/lists?tab=matches` and `/names/lists?tab=duel` (any source) in a shared space, online, no matches cache on the device, `name_matches` answering an error
- **Browser:** webkit-iphone and chromium-pixel (mocked 500)
- **What's wrong:** `matches.ts:134-151` `fetchOnce` returns on `error` without changing the state, so `fetchedAt` stays `null`. `MatchesPanel` (`ListsScreen.tsx:319`) shows the skeleton while `fetchedAt === null && online`, so after 8 s the tab still shows the intro and an empty white card, the tab label has no count, and there is no message or retry. The store retries every 60 s and on focus, so it heals only if the server does. The same flag gates the duel: `matchesLoaded` (`ListsScreen.tsx:121`) is false, so in a shared space even "דו־קרב בין השמות ששמרתי" stays on its skeleton (no round counter, no cards) although the saved names are there.
- **Rule it breaks:** `impeccable` · `reference/harden.md` Error Handling · "Network errors: Show clear error messages, Provide retry button, Explain what happened"; "Block entire interface when one component errors" (Avoid); `reference/polish.md` §3 · "broken or blocked tasks … misleading state"
- **Severity:** P2 (a server error blocks the duel from saved names, and the user can't tell loading from failure)
- **Effort:** M
- **Proposed change:**
  - `src/lib/names/matches.ts`: add `failed: boolean` to `MatchesState`; `fetchOnce` sets it when the request errors and clears it on success; export `refresh` through `useMatches` (`src/components/names/useMatches.ts`).
  - `ListsScreen.tsx` `MatchesPanel`: when `failed && fetchedAt === null`, show the empty-card pattern with "לא הצלחנו לטעון את ההתאמות." and a `Button variant="link"` "לנסות שוב" that calls `refresh`.
  - `matchesLoaded` counts a failed first fetch as loaded with no matches, so the duel from "שמרתי" works and the source toggle simply doesn't appear.
  - A unit test in `tests/names/` for the store's `failed` flag.
- **Guardrail:** polish (new error state with existing patterns; copy follows §3.1.5)
- **Screenshot:** `audit/IMP-A-G3/probe-matches-error-webkit.png`, `audit/IMP-A-G3/probe-matches-error-chromium.png`, `audit/IMP-A-G3/probe-duel-saved-matches-error-webkit.png`

### IMP-A-G3-02: A failed votes read on a new device says nothing was saved

- **Screen and state:** `/names/lists` "שמרתי" and `/names/hidden`, no vote cache in IndexedDB (a new device, a cleared browser, private mode), `GET name_votes` answering an error
- **Browser:** webkit-iphone, chromium-pixel, webkit 320 (mocked 500; the mock had 8 saved names behind it)
- **What's wrong:** `voteStore.ts:488-492` sets `ready = true` after `readServer()` whether or not it worked. With no cache the lists then show "עוד לא נשמרו שמות." with "לבחירת שמות", the tab reads "שמרתי · 0", and hidden shows "אין שמות מוסתרים". The user's names are safe on the server, but the screen states they don't exist, and a person who believes it may start again or add names by hand. With a cache the store keeps working offline as designed; only the no-cache case is wrong.
- **Rule it breaks:** `impeccable` · `reference/harden.md` Error Handling · "API errors … 500: Show generic error"; Avoid · "Leave error messages generic"; `reference/polish.md` §3 · "misleading state"; `reference/audit.md` Implementation Integrity · "misleading … content"
- **Severity:** P2 (misleading state on a new device; rare, but it tells the user their work is gone)
- **Effort:** M
- **Proposed change:** in `src/lib/names/voteStore.ts`, add `failed: boolean` to `VoteStoreState`, set when the first server read fails and nothing came from the cache, cleared on the next successful read (the store already re-reads on focus and `online`). In `ListsScreen.tsx` `SavedPanel` and `HiddenScreen.tsx`, show "לא הצלחנו לטעון את הרשימה." with "לנסות שוב" in the empty card instead of the empty state, and keep the tab label without a count (`ready && !failed`). The deck's own behavior on the same failure is out of G3; triage should check `/names` with the same mock. Add a store test.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-A-G3/probe-votes-error-webkit.png` (and `-chromium`, `-webkit320`)

### IMP-A-G3-03: A double tap on a duel card records two picks

- **Screen and state:** `/names/lists?tab=duel`, any round
- **Browser:** webkit-iphone and chromium-pixel (two touch taps 90 ms apart on card A)
- **What's wrong:** the two pick buttons are keyed by position (`DuelScreen.tsx:241`, `key={i}`) and the next pair renders in the same place at once, so the second tap of a double tap lands on the next pair's card. The probe went from "סיבוב 1" to "סיבוב 3" with `picks: 2` in the saved `duelState`. The extra pick is a comparison the user never saw, it changes the ranking, and there is no undo. A quick double tap on a 180 px card is an easy accident on a phone.
- **Rule it breaks:** `impeccable` · `reference/harden.md` Concurrent operations · "Prevent double-submission (disable button while loading)"; Verify · "Concurrent actions: Click submit 10 times rapidly"
- **Severity:** P3 (needs an accidental double tap; costs one silent comparison)
- **Effort:** S
- **Proposed change:** in `src/components/names/lists/DuelScreen.tsx` `choose`, ignore a pick that arrives within ~300 ms of the previous one (a `useRef` timestamp), or key the buttons by the pair (`key={`${pair.a}|${pair.b}|${i}`}`) and ignore clicks whose `event.timeStamp` is earlier than the pair's mount time. If the MOT/INT lenses add a pick transition (IMP-C-G3-12), the same guard covers it. Add a behavioral test that two quick `pick`s through the component make one.
- **Guardrail:** polish
- **Screenshot:** none (state read from `duelState`; `audit/IMP-A-G3/duel-round-1-webkit.png` is the start)

### IMP-A-G3-04: The settings confirms have no deadline and can be dismissed mid-request, losing the result

- **Screen and state:** `/names/settings` "מחיקת החשבון" confirm (and "יציאה מהבחירה המשותפת" by the same code), the request slow or failing
- **Browser:** webkit-iphone (request held 10 s, then Escape, then a 500 after the dialog closed)
- **What's wrong:**
  - **No deadline:** `requestAccountDeletion` (`accountDeletion.ts:20`) and `leaveSpace` (`leave.ts:42`) have no timeout, so on a stalled connection the button says "מוחקים…" indefinitely (10 s measured, no message).
  - **Dismissable while busy:** `Dialog` closes on Escape, Back and the scrim regardless of state. Closing it mid-request leaves the request running; when it fails, `deleteError` is set inside a dialog that's gone, so the user sees nothing (`dialogOpen: 0`, no alert, no toast). Reopening the dialog clears the error and shows "מוחקים…" again if the request is still going.
- **Rule it breaks:** `impeccable` · `reference/harden.md` Error Handling · "Handle timeout scenarios"; Concurrent operations · "Handle race conditions"; `reference/polish.md` §4 Interaction and state · "Every control needs appropriate … loading, error, and success behavior"
- **Severity:** P3 (needs a stalled network at the moment of a rare action; nothing is lost, the outcome is unclear)
- **Effort:** S
- **Proposed change:**
  - `src/lib/names/accountDeletion.ts`: pass `signal: AbortSignal.timeout(15000)` to the fetch (an abort reads as `"error"`, which already has a message). `src/lib/names/leave.ts`: `.abortSignal(AbortSignal.timeout(15000))` on the rpc.
  - `src/components/names/ui/Dialog.tsx`: an optional `busy` prop; while true, Escape, Back and the scrim don't close it. `SettingsScreen.tsx` passes `busy={deleting}` / `busy={leaving}`.
  - Same timeout pattern as IMP-A-G1-06 (callback, join): triage can merge them into one "requests get a deadline" item.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-A-G3/probe-delete-hang-webkit.png`

### IMP-A-G3-05: G3's text fields are under 16 px, and add-name has no length limit (merge with IMP-A-G1-02, IMP-A-G2-04)

- **Screen and state:** add-name sheet (`#add-name`, 15 px, `text-intro`), settings "השם שלי" (`#settings-name`, 13.5 px, `text-body`)
- **Browser:** webkit-iphone, chromium-pixel, webkit 320 (computed sizes from the probe)
- **What's wrong:** iOS Safari zooms the page when a focused field's font is under 16 px; the add-name field autofocuses as the sheet opens, so the zoom would come with every "הוספת שם". The settings field is the smallest field in the app. Separately, `#add-name` has no `maxLength` (`maxLength: -1`) while the rule is 20 characters: a longer name can be typed and is refused only on submit. Settings' field does set `maxLength={DISPLAY_NAME_MAX}`.
- **Rule it breaks:** `impeccable` · `reference/harden.md` · "iOS Safari force-zooms focused inputs under 16px, which breaks form layouts"; Input Validation · "Set clear constraints … maxlength"
- **Severity:** P3 (rule-based; zoom not reproduced in the Simulator, as in IMP-A-G1-02)
- **Effort:** XS on top of the G1 token
- **Proposed change:** use the 16 px form-field token proposed in IMP-A-G1-02 on `lists/AddNameSheet.tsx:86` and `SettingsScreen.tsx:285`; add `maxLength={CUSTOM_NAME_MAX}` to `#add-name` (the hint already says "עד 20 תווים").
- **Guardrail:** polish (new token); owner only if triage reads 15 → 16 px as a type change, as in G1
- **Screenshot:** `audit/IMP-A-G3/probe-add-name-webkit.png`, `audit/IMP-A-G3/probe-settings-shared-webkit.png`

### IMP-A-G3-06: The `link` button has no minimum width: the chosen banner's "ביטול" is 39 px wide (merge with IMP-C-G3-07)

- **Screen and state:** `/names/lists` with a chosen name, the banner's "ביטול"
- **Browser:** webkit-iphone, chromium-pixel, webkit 320 (39 × 44 px in all three)
- **What's wrong:** `ui/classes.ts:40-44` gives `variant="link"` `min-h-11` but no minimum width and only `px-1`, so a short label makes a narrow target. "ביטול" (clears the chosen name in one tap, IMP-C-G3-07) measures 39 × 44 px. It passes WCAG 2.5.8 (24 px) but not the project's 44 × 44 rule (PRD §8). Other `link` uses in G3 have longer labels ("לבחירת שמות", "חזרה לרשימה") and pass.
- **Rule it breaks:** `impeccable` · `reference/audit.md` Responsive · "Touch targets: Interactive elements < 44x44px"; `reference/craft-floor.md` Verify · "States … working controls"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** add `min-w-11 justify-center` to the `link` case in `src/components/names/ui/classes.ts` (fixes every short link at once), then re-run the probe's `small` list.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-A-G3/probe-chosen-webkit320.png`

## Recommended actions

1. [P2] `/impeccable harden`: IMP-A-G3-01 (matches failed state, duel unblocked), -02 (votes failed state).
2. [P3] `/impeccable harden`: IMP-A-G3-03 (duel double tap), -04 (deadline and busy dialog), -05 (16 px fields, maxLength).
3. [P3] `/impeccable polish`: IMP-A-G3-06 (link minimum width), then a final `polish` pass.
