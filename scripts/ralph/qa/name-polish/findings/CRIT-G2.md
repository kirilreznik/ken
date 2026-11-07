# CRIT · G2: Deck (swipe screen, name sheet, filters, background, match, decision, survey, about, report, toasts)

Run 2026-11-07 by US-A-CRIT-G2 at `e13be06` (no app code change since the baselines).

Skill: `design-critique` (`.claude/skills/design-critique/SKILL.md`; references read: `references/heuristics-and-laws.md`, `references/interaction-design-principles.md` (work types, excise, orchestration, direct manipulation), `references/visual-design-principles.md` (hierarchy, consistency, state design), `references/design-patterns-catalog.md` (search filter, cards, blank slate, feedback, undo vs confirm, favorites, anti-patterns)) and `design-critique-quick` (`SKILL.md`, its five-part framework as a second pass). Method: the skill's 9 steps, then the quick framework on every state.

Assumptions where the skill would ask: as in CRIT-G1. The design is the live app, the stage is "live product" (full heuristic evaluation). Severity 0–4 is mapped to the PRD's scale: 4 → P1, 3 → P2, 1–2 → P3. Skipped (need a service): the Figma pull and the `~~design tool` / `~~user feedback` connectors (`CONNECTORS.md` doesn't exist). One evaluator; IMP-C-G2, IMP-A-G2 and PRO-G2 stand in as the other evaluators and are cross-referenced, not repeated.

Evidence: `scripts/ralph/qa/name-polish/shots/audit/CRIT-G2/`.
- `-webkit` (Playwright WebKit iPhone 15) and `-chromium` (Pixel 7): all 45 G2 states from `scores.md` "Screens G2", taken today on the dev server with `us006-g2.mjs` (`G2_OUT` = this folder, `G2_PORT=3000`). 89 of 90: `survey-default-webkit` didn't save this run; `baseline/G2/survey-default-webkit.png` is the same code.
- `-sim`: the US-006 Safari set (same app code). `deck-fresh-sim.png`: Safari today on :3100 is signed out and shows welcome, so no fresh signed-in Safari state could be taken without signing in the Simulator.
- `probe-filter-done-*.png`: `shots/crit-g2-probe.mjs` (gitignored; same mocks as us006, nothing written): a 3-name deck, both girls' names already decided, filter "בת".

## Critique summary

**Context (step 1).** Who: an expecting parent (or a partner they invited), on a phone, one-handed, in short sessions over weeks. What: decide on names fast, keep the good ones, and look deeper at a name before deciding. Where: daily use, the core loop of the product. Constraints: the owner's boards and brand, the card never scrolls, matches are never green and never celebrated, a partner's non-mutual votes are never shown.

**First impression (step 2, 5 seconds).** The deck passes: the name in display type is the focal point, the three decisions sit under the thumb with "שמירה" as the one ink pill. The sheets pass too (one title, the decision row at the bottom). The weaker 5-second moments are the end and pause panels, where the panel's button, the disabled bar and the Nest card's ink button compete (already PRO-G2-03, -05).

**Posture and excise (step 5).** Transient, high-frequency: the deck is right for it (direct manipulation by swipe, the same three buttons for those who don't swipe, undo instead of confirm). Excise is low: one gesture per decision, filters one sheet away, details one tap away. The excise spots are the ones already filed: no way back from a similar name (IMP-C-G2-05), the filters wall (IMP-C-G2-11).

**Patterns (step 6).** Undo vs confirm is used right (every decision undoable, nothing confirmed). Search filter: a live count on the apply button, a reset, the hidden names one row away; 0-result apply is filed (IMP-C-G2-12). Blank slate: the empty filter result offers both ways out. Favorites: the saved count in the header is always visible. Two misapplications found: an end state that tells the user something false (-01), and non-interactive name lists styled like buttons (-03).

**IA and labels (step 7).** Sheet titles match their triggers ("סינון", "רקע למסך", "על הנתונים", "דיווח על טעות בשם …"). Label slips already filed: "קצר וארוך", "יוניסקס" vs "מתאים לכולם", the hide toast saying "דילוג", "שליחה".

**Content (step 8).** Warm and plain; the slips are -01 and -02 (both say something that isn't true about the user's names), plus the copy already filed (exclamation marks IMP-C-G2-03, "שניכם" IMP-C-G2-17, "#148" IMP-C-G2-19).

**What works well (quick framework).**
- One ink primary per screen on the deck and in every sheet; decisions keep the same order and labels in the bar and in the sheet (Law of Similarity, H4).
- The decided state in the sheet is shown by a check icon and a ring, not color alone; the toast names the name ("נשמר: שלמה") (H1).
- Offline is modeless: a glass line under the bar with an icon and the number of waiting decisions (H1, "Modeless feedback").
- The pause panels each have a clear way back to the deck ("להמשיך לבחור", "אחר כך, להמשיך לבחור"), and the invite prompt comes after the 5th save, not on entry (no "dark pattern modal").
- The survey prompt doesn't cover the card or the buttons and has its own dismiss.

**Accessibility (quick framework).** Covered in depth by IMP-A-G2 and PRO-G2 (contrast on all backgrounds clean, 11 px tags PRO-G2-06, inputs under 16 px IMP-A-G2-04, zoom PRO-G2-01). Nothing new here.

## Findings

### CRIT-G2-01: When every name in a filter is already decided, the deck says no names match the filter

- **Screen and state:** `/names`, filters on, every matching name already decided (and undecided names left outside the filter)
- **Browser:** webkit-iphone · chromium-pixel (probe); same logic in Safari
- **What's wrong:** `buildDeck` returns `"empty-filter"` whenever the filtered deck is empty and undecided names exist anywhere (`src/lib/names/deck.ts:71`), and `EmptyDeck` then says "אין שמות שמתאימים לסינון הזה" (`swipe/EmptyDeck.tsx:50`). So someone who filters (say "בת" + a first letter) and goes through all of those names is told that nothing matches, when in fact they finished them. The probe (3-name deck, both girls' names decided, filter "בת") shows that heading in both engines. The moment that should read as "done" reads as an error in the filter, right at the end of a session.
- **Rule it breaks:** `design-critique` · `references/heuristics-and-laws.md` H1 "Visibility of system status" and H2 (the message doesn't match what happened); `SKILL.md` Content "Usable … Users hesitate, misinterpret"; UX laws "Peak-End Rule — Is the ending designed well?"
- **Severity:** P2
- **Effort:** S
- **Proposed change:** tell the two cases apart with data the deck already has. In `deck.ts`, return a third state (or a flag) when some cards match the filters but all of them have votes, e.g. `"filter-done"`; `EmptyDeck` shows "עברת על כל השמות בסינון הזה." with the same two buttons ("איפוס סינון", "שינוי הסינון"). Keep the `deck_exhausted` / empty-filter tracking events as they are (map the new state to the empty-filter event). Unit tests in `tests/names/deck.test.ts` for the three cases (there is no EmptyDeck test; the Playwright check is the 3-name probe above).
- **Guardrail:** polish (a missing state of an existing screen; no new data or call)
- **Screenshot:** `audit/CRIT-G2/probe-filter-done-webkit.png`, `audit/CRIT-G2/probe-filter-done-chromium.png`

### CRIT-G2-02: "לא נשמרו שמות הפעם" at the deck end, then the primary button opens an empty list

- **Screen and state:** `/names`, deck end, nothing saved
- **Browser:** all (source + shots)
- **What's wrong:** `saved` is every saved name the user has (`SwipeScreen.tsx:107`), not this visit's. So when it's empty, nothing was ever saved, but the line says "לא נשמרו שמות הפעם." ("this time"), which suggests there are saved names from before. The ink "לשמות שלי" then opens a list that is empty. The panel's only strong action leads to a dead end.
- **Rule it breaks:** `design-critique` · `SKILL.md` Content Critique Checklist "Empty states guide next action"; `references/design-patterns-catalog.md` Blank Slate "Misapplication: Just showing 'No items' without guidance"; Orchestration "Design for the probable".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `EmptyDeck.tsx`, "לא נשמרו שמות." (drop "הפעם"), and in that branch render "לשמות שלי" as `variant="secondary"`, so the button isn't styled as the one obvious next step into an empty list. Keep the invite link and the Nest card.
- **Guardrail:** polish (copy made accurate; same buttons)
- **Screenshot:** `audit/CRIT-G2/deck-end-none-saved-webkit.png`

### CRIT-G2-03: The name lists on the deck end and the round recap are styled like buttons but do nothing

- **Screen and state:** `/names` deck end (solo, shared) and the pause "סיכום הסבב"
- **Browser:** all
- **What's wrong:** the saved names are `li` items with `names-glass-soft rounded-pill px-3 py-1` (`EmptyDeck.tsx:73`, `PausePanel.tsx:87`). That's the same glass pill as the tappable "לכל הפרטים", the secondary "לשמות שלי" next to them in the recap, and the filter chips. A tap on "יעל" or "אביגיל" does nothing. On the end panel, the "יעל" pill sits right above the ink "לשמות שלי" and reads as a second button.
- **Rule it breaks:** `design-critique` · `SKILL.md` UX laws "Law of Similarity — Different-function elements styled the same"; `references/interaction-design-principles.md` "Stylistic excise — Decoding which elements are clickable vs. decorative"; Krug test "Is it obvious what's clickable vs. what's not?"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** give the two lists a non-button look with existing tokens. Either plain text joined by " · " in `text-card-title text-ink`, or a flat tag (`bg-peach-soft text-clay-deep rounded-pill` as the card's sex tag) without the glass border and padding of a button. Same in both components (extract one small `NameList` if it stays shared). No new tap behaviour.
- **Guardrail:** polish
- **Screenshot:** `audit/CRIT-G2/deck-end-solo-chromium.png`, `audit/CRIT-G2/deck-end-shared-webkit.png`, `audit/CRIT-G2/deck-pause-recap-webkit.png`

### CRIT-G2-04: The survey prompt doesn't look tappable on a phone

- **Screen and state:** `/names`, survey prompt above the card
- **Browser:** all touch browsers
- **What's wrong:** the prompt is a sentence in a glass pill, "5 שאלות קצרות כדי לשפר את האפליקציה?", with an X. The whole sentence is the button that opens the survey, but its only affordance is `hover:underline` (`swipe/SurveyPrompt.tsx:24`), which never shows on touch. So it reads as a note with a close button, and the X is the only control that looks like one.
- **Rule it breaks:** `design-critique` · `references/interaction-design-principles.md` Direct manipulation "Pliancy — Static affordances: the element looks interactive by default"; Quick Critique Checklist "Interactive elements look interactive — (Clickable principle)".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `SurveyPrompt.tsx`, a static cue: underline always (`underline underline-offset-4`, as the `link` variant) or a trailing chevron (the "לכל הפרטים" chevron, mirrored for RTL) inside the button. Copy and size stay. Pair with PRO-G2-02 (press states) when the press state is added.
- **Guardrail:** polish
- **Screenshot:** `audit/CRIT-G2/deck-survey-prompt-webkit.png`

### CRIT-G2-05: "הוספת שם משפחה" is the second strongest line of every name sheet

- **Screen and state:** name sheet, 70 % and full, no surname saved
- **Browser:** all
- **What's wrong:** with no surname, `SurnameSection` renders `Button variant="link" size="md"` (`detail/SurnameSection.tsx:16`): bold, underlined, in card-title size, right under the name and above "מה השם אומר". On every name the eye goes name → "הוספת שם משפחה" → meaning. The spec asks for "a small link" (`tasks/prd-name-detail.md` §3 decision 8 and FR-D8), and it's a one-time setting, not part of the name's content.
- **Rule it breaks:** `design-critique` · `references/visual-design-principles.md` "Content hierarchy contradicts importance"; `SKILL.md` Orchestration "Design for the probable — Equal prominence for 80% use case and 2% edge case"; UX laws "Serial Position Effect".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** make it the small link the spec describes: `text-caption` (or `text-person`) weight medium, `text-ink-soft`, underlined, still ≥ 44 px tall through padding. Its place in the sheet stays (board 15's order). Check the four backgrounds don't matter (the sheet is opaque).
- **Guardrail:** polish (matches the owner's spec FR-D8; layout order unchanged)
- **Screenshot:** `audit/CRIT-G2/detail-70-bg-fabric-webkit.png`, `audit/CRIT-G2/detail-full-bg-none-webkit.png`

## Seen again, already filed (not repeated)

| What the critique found | Filed as |
|---|---|
| "לשמות שלי" squashed on the solo deck end | IMP-C-G2-01 |
| Back cards show through the glass card | IMP-C-G2-02 |
| Exclamation marks ("מזל טוב!") | IMP-C-G2-03 |
| "לשנות את הבחירה" clears the choice with no undo | IMP-C-G2-04 |
| No way back from a similar name | IMP-C-G2-05 |
| Filters, survey and report sheets without a close button | IMP-C-G2-06 |
| "דילוג ולא להציג שוב" only on long press | IMP-C-G2-07 |
| Decision sheet's action below the fold | IMP-C-G2-08 |
| Filter labels ("קצר וארוך", "יוניסקס"), filters wall, 0-result apply | IMP-C-G2-09, -10, -11, -12 |
| Hide toast says "דילוג"; survey "שליחה"; refused survey shown as sent | IMP-C-G2-13, -16, -18 |
| Niqqud in match sheet but not decision sheet; offline line wording | IMP-C-G2-14, -15 |
| "שניכם" / masculine generic in the invite pause | IMP-C-G2-17 |
| "#980" rank format | IMP-C-G2-19 |
| Offline sync line shifts the screen; handle drag closes the sheet; chart tooltip stays | IMP-A-G2-01, -02, -03 |
| Report field under 16 px and opens with the keyboard | IMP-A-G2-04, -05 |
| Disabled bar competes with the panel's button; Nest card's ink button competes | PRO-G2-03, -05 |
| No press feedback on secondary controls; non-tabular numbers; 11 px tags; 200 % zoom pills | PRO-G2-02, -04, -06, -01 |

## Checked and clean

Every decision has feedback within the Doherty threshold (the card leaves, the saved count changes, the sr-only status says which name; in the sheet a check + ring + a toast); undo is always one tap and disabled when there's nothing to undo; every sheet title matches its trigger; the empty filter result offers both reset and change; the match sheet is calm (no green, no confetti) with one primary and a way back to the deck; the invite pause comes after the 5th save, with a plain "later"; the undo arrow points to the start side (right), correct for RTL; no dark patterns (no confirm-shaming on the survey or invite, the survey can be dismissed in one tap); the 320 px and 375 px layouts were judged from `baseline/G2/*-webkit320.png` / `*-webkit375.png` (the narrow-screen rules drop the title and the bar icons, nothing overlaps beyond what's filed).
