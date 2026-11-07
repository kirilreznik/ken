# IMP-C · G3: Lists and settings (lists "שמרתי" / "התאמות" / duel, row menu, add-name sheet, hidden, settings and its dialogs, about, privacy, terms)

Method: dual-agent (A: design review sub-agent · B: detector + browser sub-agent), run 2026-11-07 by US-A-IMP-C-G3 at `e3faaee` (no app code change since the baselines).

Skill: `impeccable` (`.claude/skills/impeccable/SKILL.md`, references read: `reference/critique.md`, `reference/operate.md`; `reference/mode-persuade.md` doesn't apply, because G3 has no Persuade surface). Setup: `sh .claude/skills/impeccable/scripts/impeccable context --target src/components/names/lists` ran (PRODUCT.md + DESIGN.md loaded, platform web). Mode Operate for every screen; privacy and terms are read as Read surfaces inside Operate (operate.md "Read surfaces … take this file's typography and consistency rules").

Assumptions where the skill would ask: the critique's closing "Ask the User" questions were skipped (Ralph can't ask, PRD §3.3.2). The default taken is "all issues go to triage", which ranks them. impeccable's autonomy probe has no structured question tool here, so the brief (PRODUCT.md, DESIGN.md, the PRDs) answers in its place.

Skipped steps:
- The `.impeccable/critique/` snapshot and trend (`critique-storage write/trend`) were not written: this run keeps its records in `scripts/ralph/qa/name-polish/` (PRD §7), and audit stories commit only their findings.
- The live overlay was shown in Playwright; an unattended run has no `[Human]` tab.
- Backgrounds: G3 screens draw on the canvas with the blurred blob only (no photo background behind lists, settings or legal pages), so the fabric / "ללא רקע" pair of PRD §6 renders the same; one set was taken.

Evidence: shots in `scripts/ralph/qa/name-polish/shots/audit/IMP-C-G3/`.
- `-webkit` (iPhone 15) and `-chromium` (Pixel 7) were taken today on the dev server :3000 with `us007-g3.mjs` (`G3_OUT` set to this folder, `G3_PORT=3000`): all 24 states plus 13 full-page shots in both (61 PNGs).
- `-sim` (11 states) were copied from today's US-007 baseline: same code, and Safari runs on the real backend, so no second set of taps went out.
- `overlay-*.png` and `pre-*.png` come from Assessment B (script `shots/imp-c-g3-overlay.mjs`).
- Narrow widths: `shots/baseline/G3/*-webkit375.png` and `*-webkit320.png`.
- Shot paths below are relative to `scripts/ralph/qa/name-polish/shots/`.

Scores: baseline table in `scores.md` ("Baseline (before polish)", G3): **240/360 (67 %, Acceptable)**.

## Combined critique

**Design specificity.** G3 is the most category-interchangeable part of the app. In Operate mode that is mostly earned familiarity: settings, hidden, about and the legal pages are an iOS-style grouped list on canvas (white rounded cards, chevron rows, small stone section labels).

What is authored for this product:
- the CBS meta line on every row ("בן · ניתן ל־2,257 ב־2024 · → יציב")
- the clay heart with the word "אהבתי מאוד"
- the peach duel card and the ink "או" disc between the two duel names
- the warm `peach-soft` chosen-name banner
- privacy reassurance placed where the worry comes up (matches intro, solo invite card, leave dialog)

The biggest missed chance is the duel's end. It is where a name gets chosen, yet the ranked five render as an ordinary row card with a small ink "1" (-14). The deck's match moment has its own type size; this moment doesn't.

**Deterministic scan.** Assessment B:
- **CLI:** `impeccable detect --json` on 21 G3 files (`lists/*.tsx`, `HiddenScreen`, `SettingsScreen`, `about/AboutScreen` + `AboutContent`, `legal/LegalScreen`, the six route pages, `ui/*.tsx`) exited 0 with `[]`. It ran under `bash`, and the count was confirmed. The detector warns that `.tsx` gets regex rules only, so this is not a full clean bill.
- **Browser overlay:** WebKit iPhone 15, QA user 1, injection preflight passed on all 7 views (`/names/lists` empty and with 4 mocked saved names, `?tab=matches`, `/names/hidden`, `/names/settings`, `/names/about`, `/names/privacy`). It found 11 issues on 5 views:
  - 3 `undersized-ui-text`: the settings section headings "החשבון", "בחירה ביחד", "מידע" render at 10.5 px (`SettingsScreen.tsx:78`, `text-label` = owner token `--nest-text-label`). → -24.
  - 8 `straggler`: one-word last lines: "יודע." (matches intro), "שוב." (hidden intro), "Wikidata." (about), and five legal list items ("השני.", "ומועדיהן.", "הבחירות.", "האירופי.", "הברית."). → -23.
  - `/names/lists` (empty and populated) was clean.
- **Not run:** `/names/terms` in the browser (same `LegalScreen` as privacy, covered by the CLI). Nothing was written to the backend: non-GET `name_votes` was blocked, `names_track`/`client_log` were answered locally, and no settings dialog was confirmed.
- **No false positives:** every flagged element was visible, not `inert`, not `aria-hidden`.
- **Where the review and the detector meet:** the review also noted the orphaned words ("יודע.", "שוב.", "נתונים.") and the 10.5 px section labels as minor observations. The detector made them concrete and found the legal-list cases the review missed. Everything else in the review (missing undo, empty states, a new tab out of the app, the switch's contrast) is behaviour or state that no detector rule covers.

**Cognitive load:** moderate, 3 checklist failures of 8.
- **Single focus** fails on lists. The header has back, invite (icon only) and "הוספת שם". Then come the chosen banner with two targets, three tabs, rows with two targets each, and the duel card.
- **Minimal choices** fails on lists: 6 targets before any content (back, invite, add, three tabs), 8 with the chosen banner.
- **Working memory** fails as "The Memory Bridge": a name hidden from a row menu goes to "שמות שהסתרתי", which can only be reached from the filters sheet (-05).
- Passes: chunking (settings groups hold ≤ 4 rows), grouping, hierarchy, one thing at a time (the duel is exemplary) and progressive disclosure (row menu, sheets).
- Decision points with more than 4 options: the lists header and tabs (6, or 8 with the banner); settings (9–10 rows, but chunked by section, acceptable).

**Emotional journey.**
- **Peaks:**
  - a new match with "חדש" and a clay heart, warm and never green
  - the duel's steady rhythm ("איזה מהשניים?", the top five so far growing)
  - "בחרתי בשם אורי" as the duel's primary action
  - the leave dialog naming the other person ("ההתאמות עם עומר יימחקו")
- **Valleys:**
  - a saved name vanishes from a three-item menu with no message and no undo (-01)
  - the duel's end is flat for the product's peak-end moment (-14)
  - leaving a shared choice always ends in "היציאה לא הצליחה" (-09, owner)
  - privacy and terms open in a new tab whose back arrow lands on the deck (-03)
  - empty states say "nothing here" without teaching (-02)
- **Reassurance** is good on delete and leave: both bodies spell out the consequences. It is missing on remove and hide from a list.

**What's working.**
1. **Privacy copy where the worry comes up:** "על מה כל אחד דילג נשאר פרטי. השמות ששמרת עוברים איתך." on the solo card, "על שמות שדילגתם עליהם אף אחד לא יודע." above matches, and "השמות ששמרת יישארו אצלך" under the leave row.
2. **The duel is "one thing at a time":** two big pick targets and one question, progress shown in words and as a bar, "עצירה, אפשר להמשיך אחר כך" saves and resumes (with a toast), and a changed list is announced ("הרשימה השתנתה מאז…").
3. **Careful accessibility engineering:** RTL arrow keys on the tabs (`ListsScreen.tsx:91–103`), focus moved to the next row after a removal (`:494–501`), screen-reader meta text instead of arrow glyphs, the alertdialog autofocuses the safe "ביטול", and status regions are always mounted.

**Priority issues:** IMP-C-G3-01 (P1), -02, -03, -05, -04.

**Persona red flags.**
- **Jordan (first-timer):**
  - The lists header's invite control is a person-plus icon with no visible word.
  - "עוד לא נשמרו שמות." doesn't say how to save.
  - After "לא להציג יותר" the name is gone, with no message and no visible place to find it.
  - "דו־קרב" is both a tab and a card, and tapping the tab drops the tabs.
- **Casey (one hand, interrupted):**
  - Every list action lives in a kebab at the row's far edge.
  - One mis-tap on "הסרה מהרשימה" can't be undone (-01).
  - At 320 the duel's "בחרתי בשם…" starts below the fold (-14).
  - Good: "עצירה, אפשר להמשיך אחר כך" survives interruptions.
- **Sam (screen reader, low vision):**
  - Strong: the tablist arrows, focus restored after a removal, and the screen-reader meta.
  - Weak: the off switch's outline fails 3:1 (-04), the duel's round total changes under the user (-11), and sighted keyboard users get no visible confirmation of a restore on the hidden screen (-01).
- **The invited chooser** (joins by link, may be one of three or more, cares that skips stay private, PRODUCT.md "Users"):
  - Reads "שם ששניכם שמרתם" while being one of three (-08).
  - Removing a kept name silently erases a match the others were looking at (-01).
  - "יציאה מהבחירה המשותפת" fails every time and suggests trying again (-09).
  - Privacy and terms take them out of the installed app (-03).

**Questions to consider.**
- The duel's end is where a name gets chosen. Why does it look like a settings list when the match moment gets its own type size?
- Does the duel need to be both a segment and a card (-25, owner)?
- Should anything in an installed app ever leave it? If privacy and terms can't open inside the app, what is the new tab protecting?

Questions skipped: unattended run with no structured question tool (PRD §3.3.2); the 5 priority issues go straight to triage.

## Findings

Severity is the PRD's scale (§7): P1 broken, inaccessible or clearly off-brand · P2 noticeable · P3 refinement. Browsers: webkit-iphone · chromium-pixel · sim-safari.

### IMP-C-G3-01: Remove and hide from a list are silent and can't be undone

- **Screen and state:** `/names/lists` row menu ("הסרה מהרשימה", "לא להציג יותר"); `/names/hidden` "החזרה"
- **Browser:** all
- **What's wrong:**
  - `lists/ListsScreen.tsx:236–241` runs `store.removeVote` / `setVote("hidden")` and only sets an sr-only status. Nothing visible confirms it and there is no undo; the row just disappears.
  - On the same screen, a "דילוג" from the name sheet on a saved name gets a toast with "ביטול" (`:158–165`), so the same kind of act behaves two ways.
  - In a shared space, removing a kept name can dissolve a match the others see.
  - `HiddenScreen.tsx:47–52` "החזרה" is just as silent visually: the row leaves, and the user isn't told the name went back to the deck.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H3 "Undo/redo functionality"; H1 "Confirmation of user actions (save, submit, delete)"; H4 "Same actions produce same results everywhere". Severity tip: "Would a user contact support about this?" Yes: "a name disappeared".
- **Severity:** P1
- **Effort:** S
- **Proposed change:** in `ListsScreen.tsx` `onAction`, keep `previous = state.votes.get(name)` and call `showToast(rowActionText(name, action), { action: { label: "ביטול", onAction: () => store.setVote(name, previous.vote, previous.custom) } })`, the same pattern as the sheet's skip. In `HiddenScreen.tsx` `restore`, call `showToast(restoredText(name))`. `ToastRegion` and `src/lib/names/toast.ts` are used as they are.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/lists-row-menu-webkit.png`, `audit/IMP-C-G3/hidden-default-webkit.png`

### IMP-C-G3-02: Empty states say "nothing here", in three different patterns

- **Screen and state:** saved empty, matches empty (shared), hidden empty, duel "too few"
- **Browser:** all
- **What's wrong:**
  - Saved: "עוד לא נשמרו שמות." is a card with a link (`ListsScreen.tsx:511–519`) and doesn't say how a name gets saved.
  - Matches: a title, a line and a link (`:357–378`).
  - Hidden: a single centred line with no period, "אין שמות מוסתרים" (`HiddenScreen.tsx:79`), with nothing about how names get hidden.
  - Duel "few": a start-aligned card (`DuelScreen.tsx:207`) alone over the blob, with the rest of the screen blank.
- **Rule it breaks:** `impeccable` · `reference/operate.md` · "Empty states that teach the interface, not 'nothing here.'"; `reference/critique.md` · "The Inconsistent Pattern".
- **Severity:** P2
- **Effort:** S
- **Proposed change:** one shared empty card (centred, `text-card-title` title, one `text-person text-ink-soft` teaching line, then the link) used by the four states. Saved: a line saying names saved from the deck appear here. Hidden: the IMP-C-G2-07 line about holding "דילוג". Duel "few": a link to "הוספת שם" when one name is saved. The wording is for the COPY audit.
- **Guardrail:** polish (UI copy and an existing state; merge the hidden line with IMP-C-G2-07)
- **Screenshot:** `audit/IMP-C-G3/lists-saved-empty-webkit.png`, `audit/IMP-C-G3/lists-matches-empty-webkit.png`, `audit/IMP-C-G3/hidden-empty-webkit.png`, `audit/IMP-C-G3/duel-few-webkit.png`

### IMP-C-G3-03: Privacy and terms open in a new tab, and their back arrow lands on the deck

- **Screen and state:** settings → "תנאי שימוש" / "מדיניות פרטיות"
- **Browser:** all; worst in the installed PWA, where `_blank` leaves the app window
- **What's wrong:**
  - `SettingsScreen.tsx:376–379` passes `newTab` to `LinkRow` (`:55–63`, `target="_blank"`).
  - In the new tab `hasAppEntry()` is false, so `BackButton` replaces to `/names` and the user lands on the deck with two app instances open.
  - The rows' chevron is the same as the in-app "על הנתונים" row, so nothing signals the jump.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H3 "Clear navigation back to safety (home, previous)"; H4 "Platform conventions followed".
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** drop `newTab` on these two rows in settings so they behave like "על הנתונים". The onboarding consent links (where a form is in progress) keep theirs.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/settings-shared-full-webkit.png`, `audit/IMP-C-G3/privacy-default-webkit.png`

### IMP-C-G3-04: The opt-in switch's "off" track has almost no outline

- **Screen and state:** settings, "עדכון כש־Nest יוצאת לחנויות", off
- **Browser:** all
- **What's wrong:** `SettingsScreen.tsx:330` draws the off track as `border-line bg-sand` on a `surface` card, about 1.3:1 against white. The word "כבוי" carries the state, so status isn't by colour alone, but the control's own boundary fails the 3:1 non-text contrast.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · Personas, Sam: "Needs adequate color contrast"; H8 "Purposeful use of color"; PRODUCT.md "WCAG 2.2 AA".
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** `border-stone` (an existing token) on the off track. The A11Y audit measures the final pair.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/settings-solo-webkit.png`, `audit/IMP-C-G3/settings-shared-sim.png`

### IMP-C-G3-05: "שמות שהסתרתי" can only be found from the filters sheet (merge with IMP-C-G2-07)

- **Screen and state:** lists after "לא להציג יותר"; settings
- **Browser:** all
- **What's wrong:**
  - The only link to `/names/hidden` is in `FiltersSheet.tsx:314`.
  - Settings ("מידע", "בחירה ביחד") and lists don't mention it.
  - A name hidden from a list row has no visible way back.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H6 "Visible options (not buried in hidden menus)"; Cognitive load "The Memory Bridge" / "The Hidden Navigation".
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** a "לשמות שהסתרתי" action on the hide toast from -01 (preferred, since it is shown at the moment it's needed), or a `LinkRow href="/names/hidden"` in settings "מידע".
- **Guardrail:** polish (a link to an existing screen, no new screen). Triage should confirm it isn't read as a feature (§3.1.4).
- **Screenshot:** `audit/IMP-C-G3/settings-shared-full-webkit.png`, `audit/IMP-C-G3/hidden-default-webkit.png`

### IMP-C-G3-06: The add-name sheet has no visible close button (merge with IMP-C-G2-06)

- **Screen and state:** add-name sheet, default and error
- **Browser:** all
- **What's wrong:** `lists/AddNameSheet.tsx:56–64` passes only `title` to `BottomSheet`. The handle is the only close control, and it doesn't look like one.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H3 "Cancel buttons on forms and modals".
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** the shared "סגירה" `IconButton` in `headerEnd` (`closeInHeader`), as IMP-C-G2-06 proposes for the other sheets.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/add-name-default-webkit.png`, `audit/IMP-C-G3/add-name-default-sim.png`

### IMP-C-G3-07: The chosen banner's "ביטול" clears the chosen name in one tap, with no undo (merge with IMP-C-G2-04)

- **Screen and state:** lists, chosen banner
- **Browser:** all
- **What's wrong:** `ListsScreen.tsx:616` calls `clear("lists")`, which removes the pref at once (`useChosen.ts:33–37`). No confirmation or toast follows. The decision sheet calls the same act "לשנות את הבחירה".
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H3 "Undo/redo functionality"; H5 "Confirmation before destructive actions".
- **Severity:** P2
- **Effort:** XS (shares the IMP-C-G2-04 fix)
- **Proposed change:** after clearing, the IMP-C-G2-04 toast with "ביטול" restoring the pref.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/lists-chosen-banner-webkit.png`

### IMP-C-G3-08: "שניכם" and masculine generic copy in matches (merge with IMP-C-G1-03, IMP-C-G2-17)

- **Screen and state:** matches solo invite card, matches empty, matches intro line
- **Browser:** all
- **What's wrong:**
  - `ListsScreen.tsx:366` "שם ששניכם שמרתם יופיע כאן."
  - `:597` "אפשר להזמין את מי שבוחר איתך. כל אחד בוחר בטלפון שלו, ושם ששניכם שמרתם…"
  - `src/lib/names/matches.ts:256` "שמות ששניכם שמרתם." (seen in `lists-matches-offline-webkit.png`)
  - Members are unlimited, and "מי שבוחר" / "כל אחד" are masculine generic.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H2 "Domain-appropriate language for the target audience"; BRAND.md gender-neutral voice.
- **Severity:** P2 (as part of IMP-C-G1-03)
- **Effort:** XS
- **Proposed change:** the single wording chosen for IMP-C-G1-03, applied here too.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/lists-matches-solo-webkit.png`, `audit/IMP-C-G3/lists-matches-empty-webkit.png`, `audit/IMP-C-G3/lists-matches-offline-webkit.png`

### IMP-C-G3-09: Leaving a shared choice always fails

- **Screen and state:** settings → leave dialog → "יציאה"
- **Browser:** all
- **What's wrong:** the dialog promises a clear outcome, but `names_leave` isn't deployed on the EU backend (ND-UX-008), so `confirmLeave` always ends in "היציאה לא הצליחה. אפשר לנסות שוב." (`src/lib/names/leave.ts:16`). Trying again can never work.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H9 "Actionable recovery suggestions".
- **Severity:** P2
- **Effort:** L
- **Proposed change:** deploy the `names_leave` migration (ND-UX-008), or hide the row until it is deployed. Both are the owner's call.
- **Guardrail:** owner (§3.2: needs a backend/Supabase change; hiding the row changes a shipped feature)
- **Screenshot:** `audit/IMP-C-G3/settings-leave-dialog-webkit.png`, `audit/IMP-C-G3/settings-leave-dialog-sim.png`

### IMP-C-G3-10: Lists at 320 px: the title wraps beside two buttons and a row's trend wraps alone

- **Screen and state:** lists, every tab, at 320 (the title also wraps at 375)
- **Browser:** webkit320, webkit375
- **What's wrong:**
  - `ListsScreen.tsx:182–202` puts back, the title, invite and "הוספת שם" in one row. At ≤ 20rem `h1` gets `max-[20rem]:min-w-max` (`:188`), so "השמות שלי" breaks into two lines squeezed between back and the invite circle. It doesn't overlap, but the header doubles in height.
  - In the first row the meta line wraps with "יציב" alone on the second line, split from its "→" arrow.
- **Rule it breaks:** `impeccable` · `reference/operate.md` · "Responsive behavior is structural"; `reference/critique.md` · H8 "Focused, uncluttered layouts".
- **Severity:** P3 (A rated it P2 for an overlap; the shot shows crowding, not overlap)
- **Effort:** XS
- **Proposed change:** under `max-[22.5rem]`, let the action pair wrap to a second row (or render "הוספת שם" icon-only with its existing `aria-label`), and drop `min-w-max`. Keep the arrow and trend word together (`whitespace-nowrap` on the trend part of the meta line).
- **Guardrail:** polish
- **Screenshot:** `baseline/G3/lists-saved-default-webkit320.png`, `baseline/G3/lists-matches-default-webkit320.png`, `baseline/G3/lists-saved-default-webkit375.png`

### IMP-C-G3-11: The duel's round counter shifts and stays after the end

- **Screen and state:** duel round 1, mid-way, done
- **Browser:** all
- **What's wrong:** the same 8 names read "סיבוב 1 מתוך 17", then "סיבוב 5 מתוך 16", and end at "סיבוב 14 מתוך 14": the total is an estimate shown as exact. After the end the header still shows "סיבוב 14 מתוך 14" above "הדו־קרב הסתיים." (`lists/DuelScreen.tsx:171`, `src/lib/names/duel.ts:223`).
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H1 "Progress indicators for multi-step processes".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** hide the round text once `done`; while the total can still change, show it as an estimate ("מתוך כ־16").
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/duel-round-1-webkit.png`, `audit/IMP-C-G3/duel-midway-webkit.png`, `audit/IMP-C-G3/duel-done-webkit.png`

### IMP-C-G3-12: Duel picks have no press feedback and the next pair snaps in

- **Screen and state:** duel, any round
- **Browser:** all
- **What's wrong:** the pick buttons (`DuelScreen.tsx:250–256`) lack the shared `PRESS` classes (`ui/classes.ts:14`), and both names are replaced instantly, so it's hard to see that the pick registered.
- **Rule it breaks:** `impeccable` · `reference/operate.md` · Motion: "Motion conveys state … State change, feedback"; `reference/critique.md` · H1.
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** add `PRESS`, and a 150–200 ms opacity fade on the new pair with its reduced-motion version (the MOT audit sets the values).
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/duel-midway-webkit.png`

### IMP-C-G3-13: The duel's "top five so far" chips look like selected toggle chips

- **Screen and state:** duel mid-way
- **Browser:** all
- **What's wrong:** `DuelScreen.tsx:279` draws static `<li>`s as ink pills with white text, which is DESIGN.md's `chip-selected` look, but they aren't controls.
- **Rule it breaks:** `impeccable` · `reference/operate.md` · "Consistent affordances across the surface"; `reference/critique.md` · H4.
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** the non-interactive hint-chip look (`hintChipClass`: sand / ink-soft) for these items.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/duel-midway-webkit.png`

### IMP-C-G3-14: The duel result is flat, and its names can't be opened

- **Screen and state:** duel done
- **Browser:** all; at 320 the primary action starts below the fold
- **What's wrong:**
  - The ranked five (`DuelScreen.tsx:303–328`) are plain spans, while every list row opens "פרטי השם".
  - The winner differs from the rest only by an ink "1" disc.
  - At 320 × 568, "בחרתי בשם…" starts below the fold.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H4 "Same actions produce same results everywhere"; Emotional journey "peak-end rule".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** wrap the names that have cards in the lists' `RowName` button (opens the sheet); set #1's name one step up the existing type scale (`text-section`); tighten the gaps so the primary shows at 568 px tall.
- **Guardrail:** polish (existing tokens and components; no layout change to board 5's duel)
- **Screenshot:** `audit/IMP-C-G3/duel-done-webkit.png`, `baseline/G3/duel-done-webkit320.png`

### IMP-C-G3-15: The delete confirm looks like any primary button

- **Screen and state:** settings, delete dialog
- **Browser:** all
- **What's wrong:** the settings row is `text-urgent` (`SettingsScreen.tsx:392`), but the irreversible "מחיקה לצמיתות" is a plain ink primary (`:423`). With the focus ring on the autofocused "ביטול", the two pills weigh about the same.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H5 "Clear labels that prevent misunderstanding"; H4 "Visual consistency".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** give the confirm the row's `text-urgent` and its trash icon, as a secondary pill. That keeps BRAND's "no coloured primary buttons" and matches the row that opened it.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/settings-delete-dialog-webkit.png`

### IMP-C-G3-16: The settings name field doesn't follow the input spec

- **Screen and state:** settings, "השם שלי"
- **Browser:** all
- **What's wrong:** `SettingsScreen.tsx:285` uses `bg-sand`, `min-h-11` and `text-body`. DESIGN.md's input is `surface` + `line`, 48 px, `text-intro`, as add-name does (`AddNameSheet.tsx:86`).
- **Rule it breaks:** `impeccable` · `reference/operate.md` · "Same form-control vocabulary"; `reference/critique.md` · H4.
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `bg-surface border-line h-12 text-intro` on that input.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/settings-solo-webkit.png` vs `audit/IMP-C-G3/add-name-default-webkit.png`

### IMP-C-G3-17: "כבר ברשימה" names the problem but not where

- **Screen and state:** add-name error
- **Browser:** all
- **What's wrong:** the messages in `src/lib/names/custom.ts:7–12` are fragments with no period ("כבר ברשימה", "עד 20 תווים"), while the hint under the field is a full sentence.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H9 "Specific problem identification … Actionable recovery suggestions".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** full sentences with the same meaning, e.g. "השם הזה כבר ברשימה ״שמרתי״." (COPY audit sets the wording; update the tests that pin them).
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/add-name-error-webkit.png`

### IMP-C-G3-18: The matches offline line is a bare timestamp (merge with IMP-C-G2-15)

- **Screen and state:** matches, offline
- **Browser:** webkit-iphone, chromium-pixel
- **What's wrong:** `ListsScreen.tsx:313–316` shows only "עודכן לאחרונה ב־19:26" as a stone caption, with no wifi-off icon and no "אין חיבור", unlike the deck footer.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H1 "Keep users informed about what's happening"; H4 "Consistent terminology".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** the deck footer's icon and wording before the timestamp, shared with the IMP-C-G2-15 fix.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/lists-matches-offline-webkit.png`

### IMP-C-G3-19: The operator's Latin name breaks across lines in the legal intro

- **Screen and state:** privacy, terms
- **Browser:** all
- **What's wrong:** "…ומופעלת על ידי Kiril / Reznik." splits, and the bidi run starts the next line with "Reznik.". `legal/LegalScreen.tsx:9` renders a bare `<bdi>`.
- **Rule it breaks:** DESIGN.md "The Own Direction Rule"; `impeccable` · `reference/critique.md` · H8.
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `className="whitespace-nowrap"` on the operator `<bdi>`. This changes the frame only; the legal text is unchanged.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/privacy-default-webkit.png`, `audit/IMP-C-G3/terms-default-webkit.png`

### IMP-C-G3-20: The row menu puts the decision next to the removals with no separation

- **Screen and state:** lists row menu
- **Browser:** all
- **What's wrong:** in `lists/RowMenu.tsx:102–127`, "בחרתי בשם מוחמד" (the product's end goal), "הסרה מהרשימה" and "לא להציג יותר" share one style with no divider.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · Cognitive load "Grouping: Are related items visually grouped together"; H5 "Clear labels that prevent misunderstanding".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** a `border-t border-line` divider between the choose item and the two removal items.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/lists-row-menu-webkit.png`, `audit/IMP-C-G3/lists-row-menu-chromium.png`

### IMP-C-G3-21: About's report button is hand-rolled (merge with IMP-C-G1-15)

- **Screen and state:** `/names/about`
- **Browser:** all
- **What's wrong:** `about/AboutContent.tsx:58–62` builds a 52 px (`h-13`) bordered pill instead of `Button variant="secondary"` (44 or 56 px), with its own press classes.
- **Rule it breaks:** `impeccable` · `reference/operate.md` · "Same button shape".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `<Button variant="secondary">` with the icon.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/about-default-webkit.png`

### IMP-C-G3-22: The chosen banner doesn't look tappable, and the chosen row isn't marked

- **Screen and state:** lists, chosen banner
- **Browser:** all
- **What's wrong:** the label and name are a button that reopens the decision sheet (`ListsScreen.tsx:612`), but nothing shows it can be tapped. "מוחמד" appears in the list below with no chosen mark.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H6 "Visible options".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** the directional chevron (mirrored like the other rows) at the banner button's end. A chosen mark on the row is optional; triage weighs it against §3.1.4.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/lists-chosen-banner-webkit.png`

### IMP-C-G3-23: One-word last lines in intros and legal list items (detector `straggler`)

- **Screen and state:** matches intro ("יודע."), hidden intro ("שוב."), add-name hint ("נתונים."), about ("Wikidata."), privacy list items ("השני.", "ומועדיהן.", "הבחירות.", "האירופי.", "הברית.")
- **Browser:** webkit-iphone (393 px); it depends on the width
- **What's wrong:** short paragraphs and list items end with a single word on their own line. The detector found 8; the review saw 3 more.
- **Rule it breaks:** `impeccable` detector `straggler`; `reference/critique.md` · H8 "Focused, uncluttered layouts".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `text-wrap: pretty` (Tailwind `text-pretty`) on the intro paragraphs in `ListsScreen`, `HiddenScreen`, `AddNameSheet`, `AboutContent`, and on `LegalScreen`'s list items. CSS only; the text is unchanged.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G3/overlay-matches.png`, `audit/IMP-C-G3/overlay-hidden.png`, `audit/IMP-C-G3/overlay-about.png`, `audit/IMP-C-G3/overlay-privacy.png`

### IMP-C-G3-24: Settings section headings render at 10.5 px (detector `undersized-ui-text`)

- **Screen and state:** settings, "החשבון", "בחירה ביחד", "מידע"
- **Browser:** all
- **What's wrong:** the headings are `<h2 class="text-label text-stone">` (`SettingsScreen.tsx:78`). `--nest-text-label` is 10.5 px (`nest-tokens.css:68`), under the detector's 11 px floor, and it's the smallest type on the screen doing heading work.
- **Rule it breaks:** `impeccable` detector `undersized-ui-text`; `reference/operate.md` · Typography "Tighter scale ratio … exaggerated contrast creates noise".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** keep `text-label` (the owner's token, BRAND's label style). Raising its value is the owner's choice; mapping these headings to another existing token would change the board's look.
- **Guardrail:** owner (§3.2: changes an existing type token value)
- **Screenshot:** `audit/IMP-C-G3/overlay-settings.png`

### IMP-C-G3-25: "דו־קרב" is a tab that removes the tabs, and is reached two ways

- **Screen and state:** lists tabs → duel
- **Browser:** all
- **What's wrong:** the "דו־קרב" `role="tab"` (`ListsScreen.tsx:83–87`) doesn't show a panel. It swaps in a full page with its own back button (`:125–144`), and the tablist is gone. The same destination is also the peach `DuelLink` card under the list (`:455–477`).
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H4 "Same actions produce same results everywhere"; "The Inconsistent Pattern".
- **Severity:** P3
- **Effort:** M
- **Proposed change:** none in this run. The owner decides whether the duel stays a segment (board 5) or becomes a link only.
- **Guardrail:** owner (§3.2: changes a board layout)
- **Screenshot:** `audit/IMP-C-G3/lists-saved-default-full-webkit.png`, `audit/IMP-C-G3/duel-round-1-webkit.png`

### IMP-C-G3-26: The matches copy says "two of you" while PRODUCT.md says "every member"

- **Screen and state:** matches intro and empty, 3+ members
- **Browser:** all (code only; no 3-member state was shot)
- **What's wrong:** `matches.ts:256` "שמות שלפחות שניים מכם שמרו." and `ListsScreen.tsx:365` "שם ששניים מכם שמרו" say 2+. PRODUCT.md says "every member kept or loved", and the code comment (`ListsScreen.tsx:304`) says 2+.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H4 "Consistent terminology throughout the interface".
- **Severity:** P3
- **Effort:** XS once decided
- **Proposed change:** the owner confirms the rule; then align the copy or PRODUCT.md.
- **Guardrail:** owner (§3.2: the matching rule is an earlier owner decision)
- **Screenshot:** none (code only)

### IMP-C-G3-27: The long legal pages have no section index

- **Screen and state:** privacy (about 2,600 CSS px tall), terms
- **Browser:** all
- **What's wrong:** one long card with `h2`s and no jump links. Finding a section (e.g. "מחיקה") means scrolling the whole page.
- **Rule it breaks:** `impeccable` · `reference/operate.md` · Read surfaces: "their prose measure and navigation matter more"; `reference/critique.md` · H7.
- **Severity:** P3
- **Effort:** S
- **Proposed change:** in-page anchors built from the section titles above the article. The text stays untouched.
- **Guardrail:** owner (§3.2: adds navigation to the legal pages, close to a new feature)
- **Screenshot:** `audit/IMP-C-G3/privacy-default-full-webkit.png`

## Minor observations (no finding)

- Eight bordered kebab circles per list screen add visual noise; a borderless row-menu variant would be quieter (for the ELEV/DS audits).
- "יציאה מהבחירה המשותפת" looks like a navigation row without its chevron, placed between "הזמנה" and "מידע".
- The settings switch thumb animates `inset-inline-start` with an arbitrary `calc(100%-26px)` (`SettingsScreen.tsx:332`): a layout property and a px value, for the MOT and DS audits.
- Chromium has no "התקנה למסך הבית" row in settings: expected, the install mode differs.
- The draft banner ("טיוטה, ממתינה לבדיקה משפטית") correctly pairs an icon and a word on `caution-bg`.
