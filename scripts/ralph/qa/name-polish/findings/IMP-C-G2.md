# IMP-C · G2: Deck (swipe screen, name sheet, filters, background, match, decision, survey, about and report sheets, toasts)

Method: dual-agent (A: design review sub-agent · B: detector + browser sub-agent), run 2026-11-07 by US-A-IMP-C-G2 at `b4d2f04` (no app code change since the baselines).

Skill: `impeccable` (`.claude/skills/impeccable/SKILL.md`, references read: `reference/critique.md`, `reference/operate.md`; `reference/mode-persuade.md` doesn't apply, G2 has no Persuade surface). Setup: `sh .claude/skills/impeccable/scripts/impeccable context --target src/app/names/page.tsx` ran (PRODUCT.md + DESIGN.md loaded, platform web). Mode Operate for every screen (PRD §3.3.5).

Assumptions where the skill would ask: the critique's closing "Ask the User" questions were skipped (Ralph can't ask, PRD §3.3.2). The default taken is "all issues go to triage", which ranks them. No structured question tool is exposed for impeccable's autonomy probe, so the brief (PRODUCT.md, DESIGN.md, the PRDs) stands in for the answers.

Skipped steps:
- The `.impeccable/critique/` snapshot and trend (`critique-storage write/trend`) were not written. This run keeps its records in `scripts/ralph/qa/name-polish/` (PRD §7), and audit stories commit only their findings.
- The live overlay was shown in Playwright, since an unattended run has no `[Human]` tab.

Evidence: shots in `scripts/ralph/qa/name-polish/shots/audit/IMP-C-G2/`.
- `-webkit` (iPhone 15) and `-chromium` (Pixel 7) were taken today on the dev server :3000, with `us006-g2.mjs`, `G2_OUT` set to this folder and `G2_PORT=3000`. All 45 states were taken in both.
- `-sim` (23 states) were copied from today's US-006 baseline. The code is the same, and Safari runs on the real backend, so no second set of taps went out.
- `overlay-*.png` and `pre-*.png` come from Assessment B.
- Narrow widths: `shots/baseline/G2/*-webkit375.png` and `*-webkit320.png`.
- Shot paths below are relative to `scripts/ralph/qa/name-polish/shots/`.

Scores: baseline table in `scores.md` ("Baseline (before polish)", G2): **320/432 (74 %, Good)**.

## Combined critique

**Design specificity.** The deck is authored for this product:
- the name set large with its niqqud
- real CBS numbers in glass wells
- a boys/girls bar in ink on peach, never blue and pink
- trend words with an arrow
- the source link on the card
- a single clay dot as the only accent on the match moment
- warm home photos under liquid glass
- privacy reassurance placed where the worry comes up (skips, surname, photo)

The interchangeable parts:
- the filters sheet (a wall of 32 white pills)
- the stock radio-list survey
- the Nest app card, repeated on 5 surfaces (three deck ends, recap, decision), which turns the product's ending moments into a promo slot

**Deterministic scan.** Assessment B found nothing:
- **CLI:** `impeccable detect --json` on all G2 markup (37 files in `swipe/`, `card/`, `detail/`, `ui/` and `page.tsx`, plus 13 sheet and helper files) exited 0 with `[]`. It also returned `[]` with `--no-config`. A first run under zsh passed the targets as one string and scanned nothing; it was discarded and re-run under bash.
- **Browser overlay:** WebKit iPhone 15, QA user 1, injection preflight passed. Each of `/names`, `?sheet=filters`, `?sheet=background`, `?sheet=about` and `?sheet=name&n=גבריאל` logged only "No anti-patterns found". A second `impeccableScanAsync()` confirmed the empty result.
- **Coverage limit:** the visual-contrast pass analysed 0 image-backed elements, so glass text over the photos got no pixel contrast reading from the detector. That is left to the A11Y audit.
- **No false positives this time.** The back cards aren't `inert`, so the G1 `text-occlusion` false positive didn't fire.
- **Where the review and the detector meet:** -02 (back-card edges) and -01 (squashed button) are visual and layout faults no rule in the detector covers. The review caught them from the shots.

**Cognitive load:** moderate, 3 checklist failures.
- Minimal choices and chunking fail on the filters sheet (15 themes, 32 chips, -11).
- Single focus fails on the end, recap and decision panels, where the Nest card competes with the panel's own action.
- Decision points with more than 4 visible options:
  - filters (32 chips)
  - decision sheet (5)
  - solo deck end (5, plus 3 greyed-out buttons)
  - deck screen (9 controls, grouped by zone, acceptable)

**Emotional journey.**
- **Peaks:**
  - the drag stamps
  - the calm match sheet (one clay dot, the name large)
  - the round recap with name chips
- **Valleys:**
  - "שם 1 מתוך 1295" on the very first card
  - the deck end ("לא נשמרו שמות הפעם." followed by an app ad, and in WebKit solo a visibly broken button, -01)
  - "לשנות את הבחירה", which silently erases the chosen name (-04)
- **Reassurance** is strong at the privacy moments:
  - "על מה דילגת נשאר רק אצלך."
  - the surname note
  - the photo lock note
  - the report's "נשלח בלי פרטים עליך"
- **The one voice break** is "מזל טוב!" (-03).

**What's working.**
1. **One set of decision buttons everywhere.** `DecisionButtons` serves the deck and the sheet, and shows the current vote with a ring and a check, not by color.
2. **Honest, accessible status:**
   - polite live regions for every decision
   - the offline footer with an icon and a count
   - the filter dot plus "סינון, פעיל"
   - a live "הצגת 518 שמות" count on the apply button
   - focus that follows into the pause and end panels
3. **Brand discipline on the color-critical moments:**
   - matches use the clay dot and ink, never green
   - the bar is ink and peach
   - the together badge holds on all five backgrounds, including a hostile own photo

**Priority issues:** IMP-C-G2-01 (P1), -02, -06, -05, -03/-04/-08 (the decision sheet).

**Persona red flags.**
- **Alex (power user):**
  - K/L/S/Z and Shift+F10 exist only in a hidden description (`SwipeKeys.tsx:32`).
  - Hiding a name takes a 500 ms hold every time.
  - Popularity, trend and origin sit below 15 theme chips.
- **Sam (screen reader, low vision):**
  - The squashed "לשמות שלי" target in WebKit (-01).
  - The sheet's loading skeleton is `aria-hidden` and nothing is announced while it loads (`detail/DetailsPending.tsx:14`, left for the A11Y audit).
  - The hint and recap chips look like toggle chips but aren't controls.
- **Casey (one hand, interrupted):**
  - Lists, filters, background and settings are all in the top row.
  - The decision sheet's "חזרה לרשימה" needs a scroll at 393 × 659 (-08).
  - In the installed app there is no route back after a similar-name hop (-05).
  - Dismissing filters drops the draft silently.
- **Ruti, a grandmother invited by link (PRODUCT.md "a partner, relative or friend joins"):**
  - The first card reads "שם 1 מתוך 1295".
  - The bookmark pill shows only "0", with no word.
  - The Nest card is pitched at the pregnant parent and repeats at every end and recap.
  - A solo space's pause still says "שם ששניכם שמרתם" (-17).
  - "בחרנו שם" is stored on one device only.

**Questions to consider.**
- What would the deck end feel like as a peak: the saved names as the hero, one next step, and the Nest card once, quietly?
- Does "שם 1 מתוך 1295" help anyone decide? (An owner decision, FR-W12; not a finding.)
- Is "בחרנו" honest when the choice is a device pref (`useChosen.ts:26`) the other person never sees?
- Should the themes sit behind a tile like "אות ראשונה" (-11)?

Questions skipped: unattended run with no structured question tool (PRD §3.3.2); the 5 priority issues go straight to triage.

## Findings

Severity is the PRD's scale (§7): P1 broken, inaccessible or clearly off-brand · P2 noticeable · P3 refinement. Browsers: webkit-iphone · chromium-pixel · sim-safari.

### IMP-C-G2-01: "לשמות שלי" is squashed on the solo deck end in WebKit

- **Screen and state:** `/names` deck end, solo (and the same risk in the pause panels)
- **Browser:** webkit-iphone (393, 375, 320). Chromium keeps 44 px. sim-safari wasn't shot for this state (Playwright-only, see "Screens G2").
- **What's wrong:**
  - `swipe/EmptyDeck.tsx:42–45` renders a `Glass` that is `flex flex-col … overflow-y-auto`, and its children have no `shrink-0`.
  - When the content (title, "השמות ששמרת:", chip, button, invite link, Nest card) is taller than the panel, WebKit shrinks the `h-11` button (`:83`) to about 20 px, and the name chip with it.
  - The main action of the screen looks broken and fails the 44 px target.
  - The shared state (no invite link) fits.
  - `swipe/PausePanel.tsx:46` uses the same pattern.
- **Rule it breaks:** `impeccable` · `reference/operate.md` · "Consistent affordances across the surface. Same button shape."; `reference/critique.md` H4 "Visual consistency"; PRODUCT.md targets ≥ 44 × 44 px.
- **Severity:** P1 (inaccessible target, visibly broken primary action)
- **Effort:** XS
- **Proposed change:** `shrink-0` on the panel's children (`[&>*]:shrink-0` on the `Glass`) in `EmptyDeck.tsx` and `PausePanel.tsx`, so the panel scrolls as intended.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G2/deck-end-solo-webkit.png` vs `audit/IMP-C-G2/deck-end-solo-chromium.png`, `baseline/G2/deck-end-solo-webkit375.png`, `baseline/G2/deck-end-solo-webkit320.png`

### IMP-C-G2-02: Back-card edges show through the current card's glass

- **Screen and state:** `/names` card on fabric, notebook, nursery and own photo; drag
- **Browser:** all
- **What's wrong:**
  - `card/CardStack.tsx:27–28` places the back cards inside the current card's area (`inset-x-3 top-3 bottom-1.5`, `inset-x-6 top-6 bottom-0`).
  - The back cards are bordered `names-glass-soft` (`.names-back-near` `--nest-white-30`, `names.css:326`), and the top card's glass is translucent.
  - So their 1 px borders show as ghost rectangles inside the card: one crosses the sex tag, and three stack at the bottom by "לכל הפרטים".
  - "ללא רקע" (solid card) is clean.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H8 "No decorative clutter competing for attention".
- **Severity:** P2
- **Effort:** S
- **Proposed change:** in `src/app/names/names.css`, clip the photo-background back cards (`clip-path: inset(…)` from the top, with the spacing CardStack already uses) so only the strip below the current card paints. The "ללא רקע" variant stays, and no token value changes.
- **Guardrail:** polish (the stack and its look stay; only the hidden part stops showing through)
- **Screenshot:** `audit/IMP-C-G2/deck-bg-fabric-webkit.png`, `audit/IMP-C-G2/deck-bg-nursery-webkit.png`, `audit/IMP-C-G2/deck-drag-start-webkit.png`, `audit/IMP-C-G2/deck-bg-fabric-sim.png`

### IMP-C-G2-03: Exclamation marks in system copy

- **Screen and state:** decision sheet (solo, shared); survey "sent" toast
- **Browser:** all
- **What's wrong:** `DecisionSheet.tsx:77` "מזל טוב! השם נשמר כאן, ואפשר לשנות אותו בכל רגע."; `SurveySheet.tsx:118` "תודה! התשובות נשלחו."
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H4 consistent voice; PRD §3.1.5 and BRAND.md "no exclamation marks"; PRODUCT.md "nothing … celebrates loudly".
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** "מזל טוב. השם נשמר כאן, ואפשר לשנות אותו בכל רגע." and "תודה, התשובות נשלחו." (the second matches `REPORT_SENT` "תודה, הדיווח נשלח"). Update the tests that pin them.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G2/decision-solo-webkit.png`, `audit/IMP-C-G2/decision-shared-webkit.png`

### IMP-C-G2-04: "לשנות את הבחירה" clears the chosen name in one tap, with no undo

- **Screen and state:** decision sheet (solo, shared)
- **Browser:** all
- **What's wrong:**
  - `DecisionSheet.tsx:86–95` calls `onClear()` and closes; `useChosen.ts:33–38` removes the pref at once.
  - The label promises "change", but the action removes.
  - The lists banner calls the same act "ביטול" (`lists/ListsScreen.tsx:616`).
  - No toast or undo follows.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H5 "Confirmation before destructive actions"; H4 "Consistent terminology throughout the interface".
- **Severity:** P2
- **Effort:** S
- **Proposed change:** label "ביטול הבחירה" (as the banner's `aria-label` "ביטול הבחירה בשם …"); after clearing, `showToast` with the existing `action` ("ביטול") restoring the pref. Uses `ToastRegion` and `src/lib/names/toast.ts` as they are.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G2/decision-solo-webkit.png`

### IMP-C-G2-05: No visible way back from a similar name

- **Screen and state:** name sheet, a similar name opened
- **Browser:** all; worst in the installed iOS PWA (`display: standalone` has no Back button)
- **What's wrong:**
  - `detail/NameDetailSheet.tsx:33–38` `openSimilar` pushes a history entry.
  - The header X (`:205`) closes the whole stack (`closeNameIn`).
  - History Back is the only route to the first name.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H3 "Clear navigation back to safety (home, previous)".
- **Severity:** P2
- **Effort:** S
- **Proposed change:** when the sheet shows a name pushed over another name entry, a start-side `IconButton` (chevron, `aria-label` "חזרה ל־{name}") in the sheet header calling `history.back()`. The URL layer already tracks the pushed entries.
- **Guardrail:** polish (a control for an existing history flow). Triage may send it to the owner if it judges it new UI (§3.1.4).
- **Screenshot:** `audit/IMP-C-G2/detail-similar-section-webkit.png` → `audit/IMP-C-G2/detail-similar-opened-webkit.png`, `audit/IMP-C-G2/detail-similar-opened-sim.png`

### IMP-C-G2-06: Filters, survey and report sheets have no close button

- **Screen and state:** filters (default, selected, scrolled), survey, report (form)
- **Browser:** all
- **What's wrong:**
  - These sheets have no close button: `FiltersSheet.tsx:249–260` has only "איפוס" as `headerEnd`, and `SurveySheet.tsx:122–125` and `about/ReportSheet.tsx:124–131` have none.
  - Background, about and name sheets do have one, an `IconButton aria-label="סגירה"` (e.g. `BackgroundSheet.tsx:88–95`).
  - The survey's own error says "אפשר לענות על שאלה אחת לפחות, או לסגור." (`:102`) with nothing to tap.
  - The filters and survey sheets are nearly full height, leaving only a thin backdrop strip.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H3 "Cancel buttons on forms and modals"; H4 "Same actions produce same results everywhere".
- **Severity:** P2
- **Effort:** S
- **Proposed change:** the shared "סגירה" `IconButton` with `closeInHeader` in `SurveySheet.tsx` and `ReportSheet.tsx`; in `FiltersSheet.tsx` the X next to "איפוס" in `headerEnd`.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G2/filters-default-webkit.png`, `audit/IMP-C-G2/survey-default-webkit.png`, `audit/IMP-C-G2/survey-default-sim.png`, `audit/IMP-C-G2/report-default-webkit.png`; compare `audit/IMP-C-G2/about-default-webkit.png`

### IMP-C-G2-07: Hiding a name can't be discovered

- **Screen and state:** deck decisions (skip long-press menu); filters "שמות שהסתרתי"
- **Browser:** all
- **What's wrong:**
  - "דילוג ולא להציג שוב" opens only on a 500 ms hold, a right-click or Shift+F10 (`swipe/SkipButton.tsx:20–24`), and no copy teaches it.
  - The filters sheet links "שמות שהסתרתי (0)" (`FiltersSheet.tsx:313–322`) without saying how a name gets there.
  - K/L/S/Z live only in the hidden `SWIPE_KEYS_HINT` (`swipe/SwipeKeys.tsx:32`).
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H6 "Visible options (not buried in hidden menus)"; H10 "Contextual help (tooltips, inline hints)".
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** one `text-caption text-stone` line under the hidden-names row: "לחיצה ארוכה על ״דילוג״ מסתירה שם, והוא יופיע כאן." (UI copy, not name content).
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G2/deck-skip-menu-webkit.png`, `audit/IMP-C-G2/filters-scrolled-webkit.png`

### IMP-C-G2-08: The decision sheet's main action is below the fold

- **Screen and state:** decision sheet (solo, shared)
- **Browser:** webkit-iphone (393 × 659, 375, 320); fits on chromium-pixel
- **What's wrong:** `DecisionSheet.tsx:69–96` puts `<NestCard placement="decision" />` (`:81`) between the name panel and the actions, so "חזרה לרשימה" starts at the bottom edge and needs a scroll.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H8 "Clear visual hierarchy directing attention"; persona Casey "important actions … unreachable".
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** move `NestCard` after the actions `div` (`:84–96`): name, its actions, then the card.
- **Guardrail:** polish. The decision sheet has no board among 1–15; triage should check `docs/names-pwa/design/` before acting, and send it to the owner if a board fixes the order.
- **Screenshot:** `audit/IMP-C-G2/decision-solo-webkit.png`, `audit/IMP-C-G2/decision-shared-webkit.png`, `baseline/G2/decision-shared-webkit320.png`

### IMP-C-G2-09: The length filter's "all" reads "קצר וארוך"

- **Screen and state:** filters (scrolled), the "אורך" tile
- **Browser:** all
- **What's wrong:** `src/lib/names/filters.ts:137` returns "קצר וארוך" for no length filter, but "all" also includes 4-letter names (short ≤ 3, long ≥ 5). The custom range calls the same state "כל האורכים" (`:143`).
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H2 "Familiar terminology"; H4 "Consistent terminology throughout the interface".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** "כל האורכים" for `null`; update the test that pins it.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G2/filters-scrolled-webkit.png`

### IMP-C-G2-10: Theme "יוניסקס" duplicates the sex chip "מתאים לכולם"

- **Screen and state:** filters (default)
- **Browser:** all
- **What's wrong:** "מתאים לכולם" under "לבן או לבת" (`FiltersSheet.tsx:44`) and "יוניסקס" under "נושאים" (`src/lib/names/themes.ts:31`): one idea, two words, two controls.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H4 "Users shouldn't wonder whether different words … mean the same thing".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** owner to decide whether to drop or rename the theme.
- **Guardrail:** owner (§3.2: the filters don't change, §3.1.3)
- **Screenshot:** `audit/IMP-C-G2/filters-default-webkit.png`

### IMP-C-G2-11: The filters sheet is a wall of options

- **Screen and state:** filters (default, scrolled)
- **Browser:** all
- **What's wrong:** "נושאים" alone is 15 chips (`FiltersSheet.tsx:150–153`); the sheet shows 32 chips before the tiles. "כל השמות" repeats as the first chip of five groups, and popularity, trend and origin sit below the themes.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · Cognitive Load "Minimal choices (≤4 visible options at any decision point)", "The Wall of Options".
- **Severity:** P3
- **Effort:** M
- **Proposed change:** themes behind a tile like "אות ראשונה" (the existing picker pattern, value "כל הנושאים" / "{n} נושאים" from `themes.ts:67`).
- **Guardrail:** owner (§3.2: changes the layout of board 3)
- **Screenshot:** `audit/IMP-C-G2/filters-default-webkit.png`, `audit/IMP-C-G2/filters-scrolled-chromium.png`

### IMP-C-G2-12: Filters can be applied with 0 results

- **Screen and state:** filters → deck empty-filter result
- **Browser:** all (from code; no shot of a 0 count)
- **What's wrong:** `applyLabel(0)` gives "הצגת 0 שמות" (`src/lib/names/filters.ts:157–159`); the button stays enabled and leads to "אין שמות שמתאימים לסינון הזה".
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H5 "Constraints preventing invalid input".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** at `n === 0`, label "אין שמות שמתאימים" and `aria-disabled` on the apply button in `FiltersSheet.tsx`.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G2/deck-empty-filter-webkit.png` (the result)

### IMP-C-G2-13: The toast after hiding a name in the sheet says "דילוג"

- **Screen and state:** name sheet → long-press "דילוג" → "דילוג ולא להציג שוב"; the toast
- **Browser:** all (from code)
- **What's wrong:** `src/lib/names/a11y.ts:66–67` maps `hidden` to "דילוג: {name}", while the screen-reader status for the same act says "השם {name} לא יוצג שוב" (`:48–49`).
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H1 "Confirmation of user actions".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `לא יוצג שוב: ${name}`; update its test.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G2/toast-sheet-vote-webkit.png` (the toast format)

### IMP-C-G2-14: The match sheet shows niqqud, the decision sheet doesn't

- **Screen and state:** match sheet; decision sheet
- **Browser:** webkit-iphone, chromium-pixel
- **What's wrong:** `MatchSheet.tsx:104` shows `card.content.niqqud` ("נֹעַם"); `DecisionSheet.tsx:72–74` shows the plain name ("נועם") in the same layout.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H4 "Visual consistency".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** pass the card (ListsScreen already has `useCards`) and show its niqqud when the name has one.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G2/match-default-webkit.png` vs `audit/IMP-C-G2/decision-shared-webkit.png`

### IMP-C-G2-15: The sheet's offline line has no icon and different wording

- **Screen and state:** name sheet, details offline
- **Browser:** webkit-iphone, chromium-pixel
- **What's wrong:**
  - `detail/DetailsPending.tsx:4,12` is a plain caption, "הפרטים האלה יופיעו כשיהיה חיבור לאינטרנט", with no period and no icon.
  - The deck footer pairs a wifi-off icon with the word (`swipe/SwipeFooter.tsx:35–48`).
  - The sheet-level copy says "אין חיבור לאינטרנט. …".
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H4 "Consistent terminology"; PRODUCT.md "status is never told by color alone; a word and an icon go with it".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** the same wifi-off icon and "אין חיבור לאינטרנט. הפרטים יופיעו כשהחיבור יחזור."
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G2/detail-offline-webkit.png`

### IMP-C-G2-16: The survey's submit button says only "שליחה"

- **Screen and state:** survey sheet
- **Browser:** all
- **What's wrong:** `SurveySheet.tsx:133`; the report sheet next to it says "שליחת דיווח".
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H4; BRAND.md "explicit action labels".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** "שליחת התשובות".
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G2/survey-default-webkit.png`

### IMP-C-G2-17: "שניכם" and masculine generic copy in the invite pause (merge with IMP-C-G1-03)

- **Screen and state:** deck pause, invite prompt after the 5th save
- **Browser:** all
- **What's wrong:** `swipe/PausePanel.tsx:54`, "…את מי שבוחר איתך: כל אחד בוחר בטלפון שלו, ושם ששניכם שמרתם הופך להתאמה.", assumes two people, and "מי שבוחר" / "כל אחד" are masculine generic.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H2 "Domain-appropriate language for the target audience"; BRAND.md gender-neutral Hebrew, never assume a partner.
- **Severity:** P3 (P2 as part of IMP-C-G1-03)
- **Effort:** XS
- **Proposed change:** one wording with IMP-C-G1-03, e.g. "…אפשר להזמין עוד מישהו: הבחירה נעשית בנפרד, בכל טלפון, ושם שכולם שמרו הופך להתאמה."
- **Guardrail:** polish. **Merge with IMP-C-G1-03.**
- **Screenshot:** `audit/IMP-C-G2/deck-pause-invite-webkit.png`

### IMP-C-G2-18: A refused survey is shown as sent

- **Screen and state:** survey sheet, submit when `names_survey` errors
- **Browser:** all (from code)
- **What's wrong:** `SurveySheet.tsx:113–118`. On `result === "error"` it logs, shows "תודה! התשובות נשלחו." and never asks again; the open answers are lost.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H1 "Confirmation of user actions"; H9 "Actionable recovery suggestions".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** owner to decide between keeping the deliberate silent path (the comment at `:113`) and an error with a retry.
- **Guardrail:** owner (§3.2: an earlier deliberate decision, tied to the survey backend)
- **Screenshot:** none (code path; Playwright can force it by routing `names_survey` to 500)

### IMP-C-G2-19: The rank shows as "#148"

- **Screen and state:** name sheet, facts tiles
- **Browser:** all
- **What's wrong:** `src/lib/names/detail.ts:80` (`#${…}`) and `:40` ("#2 בשנת 2024") use the English "#" for a Hebrew rank.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H2 "Domain-appropriate language for the target audience".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** "מקום 148" with the label "בדירוג 2024", the number kept in `<bdi dir="ltr">`; update the tests.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G2/detail-similar-section-webkit.png`, `audit/IMP-C-G2/detail-similar-section-sim.png`

## Minor observations (not findings; for the other lenses)

- **Skip button icon order.** "דילוג" puts its icon after the word (`DecisionButtons.tsx:106–107`); keep and love put it first.
- **Empty band on tall phones.** On Pixel 7 the card has a large empty band between the hint chips and the sex bar (`audit/IMP-C-G2/deck-bg-own-chromium.png`).
- **"הוספת שם משפחה" is the first thing in the name sheet** when no surname is set, above "מה השם אומר".
- **Facts tiles have no section label.** They are the only sheet block without one (`detail/NameDetailSheet.tsx:142`).
- **Greyed-out decision buttons stay under end, pause and empty panels.** The ink "שמירה" turns muddy brown at 60 % on the photos.
- **The background "saved" toast covers the sheet's privacy note** while it shows.
- **The sync line shifts the layout.** When it appears, the card shrinks and the action bar moves up about 36 px (`audit/IMP-C-G2/deck-offline-pending-webkit.png` vs `deck-after-vote-webkit.png`). This is a layout shift for the MOT/INT audits; CLS was measured 0 online (US-004).
- **The year chart's tooltip stays on after a touch drag** in Safari (`audit/IMP-C-G2/detail-similar-section-sim.png`).
- **At 320 px, "לכל הפרטים" scrolls out of the card's view.** The survey prompt plus the surname line push it there (the card may scroll under 390 px).
- **Survey Q1 "איך זה ירגיש?" is a calque.** It is survey wording, so it is an owner call if anything.
- **"שם 1 מתוך 1295" on the first card** is an owner decision (FR-W12), not a finding.

## Detector findings not kept

None: the CLI scan and the overlay on 5 views reported nothing.

## What was checked

- **States and browsers:**
  - All 45 G2 states from `scores.md` "Screens G2" in WebKit iPhone 15 and Chromium Pixel 7, on the dev server.
  - The 23 Safari states.
  - 375 and 320 widths for layout.
- **Source:** every G2 route and component: deck, card, swipe, detail, ui, the sheets, and the copy in `src/lib/names/`. Checked for copy, aria, states, focus, and error and offline paths.
- **Detector:** run over all G2 markup, plus an overlay on 5 views.
- **Verification:** the parent checked findings -01, -03, -06, -08, -09 and -13 against the shots and the code before writing them here.
