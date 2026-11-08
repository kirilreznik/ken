# Name swiper polish: impeccable critique scores

Per screen and heuristic, from impeccable's critique (`.claude/skills/impeccable/`). The baseline table is filled by the `US-A-IMP-C-G1…G3` audits; the after table by `US-R1…R3` (PRD §7). Use the same screens, heuristics and scale in both, so the rows compare.

## Baseline (before polish)

One matrix per group: screens as rows, Nielsen's heuristics H1–H10 as columns (impeccable `reference/critique.md` "Heuristics Scoring Guide", 0–4 each). `n/a` follows the skill's mode-applicability rule (H7/H10 on Persuade surfaces, or a heuristic the screen gives nothing to judge), and the total is renormalized to the applicable maximum; the band reads off the percentage (90 %+ Excellent, 70 %+ Good, 50 %+ Acceptable, 30 %+ Poor). The re-score (US-R1…R3) uses the same rows and columns.

H1 system status · H2 match with the real world · H3 user control and freedom · H4 consistency and standards · H5 error prevention · H6 recognition over recall · H7 flexibility and efficiency · H8 aesthetic and minimalist design · H9 error recovery · H10 help and documentation.

### G1 Entry (US-A-IMP-C-G1, 2026-11-07, at `132b981`; findings `findings/IMP-C-G1.md`)

| Screen (states) | H1 | H2 | H3 | H4 | H5 | H6 | H7 | H8 | H9 | H10 | Total | Band | Notes (finding IDs) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| welcome (default, closed, expired), Persuade | 3 | 3 | 3 | 3 | 3 | 3 | n/a | 3 | 2 | n/a | 23/32 (72 %) | Good | H9: expired notice gives no reason (-05), Google error looks like body text (-14); H8 kept at 3 but the action is below the fold on short phones (-01, P1); -22 (owner) |
| sign-in, email step (valid, invalid) | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 30/40 (75 %) | Good | -06 placeholder contrast |
| sign-in, code step (timer, wrong, resend) | 3 | 3 | 2 | 3 | 3 | 4 | 3 | 3 | 2 | 3 | 29/40 (73 %) | Good | H9: wrong-code advice vs locked resend (-02); H3: Back skips the email step (-17); -16 |
| auth callback (loading, error) | 3 | 3 | 3 | 3 | n/a | 3 | n/a | 3 | 3 | n/a | 21/28 (75 %) | Good | -20 |
| onboarding | 3 | 3 | 2 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 29/40 (73 %) | Good | H3: no way out (-10, owner); -13, -19 |
| intro (top, surname) | 3 | 2 | 3 | 3 | 2 | 3 | 3 | 3 | n/a | 3 | 25/36 (69 %) | Acceptable | H5: X drops the surname (-04); H2: "שניכם" (-03); -08 |
| join, invited (signed out) | 3 | 2 | 3 | 2 | 3 | 3 | n/a | 3 | 3 | 3 | 25/36 (69 %) | Acceptable | H4: legal line (-07); H2: "שניכם" (-03); -01 |
| join outcomes (joined, expired, closed) | 3 | 2 | 3 | 3 | n/a | 3 | n/a | 3 | 2 | 2 | 21/32 (66 %) | Acceptable | H9/H10: no one named to ask (-09); H2: "שניכם" (-03); -18 (owner), -19 |
| invite (link ready, link failed) | 3 | 2 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 29/40 (73 %) | Good | H2: "שניכם" (-03) |
| offline | 3 | 3 | 3 | 2 | n/a | 3 | n/a | 3 | 3 | n/a | 20/28 (71 %) | Good | H4: off-brand system screen (-11) |
| goodbye | 3 | 3 | 3 | 3 | n/a | 3 | n/a | 3 | n/a | n/a | 18/24 (75 %) | Good | -19 (no wordmark) |
| 404 | 2 | 3 | 3 | 2 | n/a | 3 | n/a | 3 | 2 | n/a | 18/28 (64 %) | Acceptable | -11 |
| unconfigured notice | 1 | 2 | 1 | 2 | n/a | 2 | n/a | 3 | 1 | n/a | 12/28 (43 %) | Poor | -12 (an operator-only state) |
| **G1 (sum of the rows)** | 36 | 34 | 35 | 35 | 20 | 39 | 15 | 39 | 27 | 20 | **300/432 (69 %)** | **Acceptable** | |

How the scores were made: design-review sub-agent (A) scored each screen from the shots and the source; the parent adjusted H2 to 2 where the "שניכם" copy shows (A listed it as a finding but scored H2 3; the skill's H2 criterion "domain-appropriate language" fails for a third member) and the code step's H3 to 2 for -17. The detector sub-agent (B) found no source issues and one real browser issue (-06); it didn't change a score.


### G2 Deck (US-A-IMP-C-G2, 2026-11-07, at `b4d2f04`; findings `findings/IMP-C-G2.md`)

| Screen (states) | H1 | H2 | H3 | H4 | H5 | H6 | H7 | H8 | H9 | H10 | Total | Band | Notes (finding IDs) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| deck: card + backgrounds (none, fabric, notebook, nursery, own), drag, peeking | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | n/a | 3 | 27/36 (75 %) | Good | H8: back-card edges through the glass (-02). H9 n/a: no error path on the card (own-photo failure scored in the background sheet) |
| deck: decisions (after vote, undo, skip long-press menu, offline pending footer, surname line) | 3 | 3 | 4 | 3 | 3 | 2 | 3 | 3 | 3 | 2 | 29/40 (73 %) | Good | H6/H10: hide and shortcuts can't be found (-07); -13 |
| deck: filtered + empty filter result | 3 | 3 | 4 | 3 | 3 | 3 | 3 | 3 | 3 | n/a | 28/36 (78 %) | Good | -12. H10 n/a: the empty panel explains itself |
| deck: end (solo, shared, nothing saved) | 3 | 3 | 3 | 2 | n/a | 3 | n/a | 2 | n/a | n/a | 16/24 (67 %) | Acceptable | H4: squashed "לשמות שלי" in WebKit (-01, P1); H8: the Nest card outweighs the panel's own action |
| deck: pauses (invite prompt, round recap) + survey prompt | 3 | 2 | 3 | 3 | n/a | 3 | 3 | 3 | n/a | n/a | 20/28 (71 %) | Good | H2: "שניכם" (-17, merge with IMP-C-G1-03) |
| name sheet (70 %, full, surname, similar section/opened, together, loading, offline) + toast | 3 | 3 | 2 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 29/40 (73 %) | Good | H3: no way back from a similar name (-05); -15, -19 |
| filters sheet (default, selected, scrolled) | 4 | 3 | 3 | 2 | 3 | 3 | 3 | 2 | n/a | 3 | 26/36 (72 %) | Good | H4: no close, two words for unisex (-06, -10, owner); H8: 32 chips (-11, owner); -09, -12 |
| background sheet (default, own saved) | 4 | 3 | 3 | 3 | 3 | 4 | 3 | 3 | 3 | 3 | 32/40 (80 %) | Good | the saved toast covers the privacy note while it shows (minor, no finding) |
| match sheet | 3 | 3 | 3 | 3 | n/a | 3 | n/a | 3 | n/a | n/a | 18/24 (75 %) | Good | -14 |
| decision sheet (solo, shared) | 3 | 2 | 3 | 2 | 2 | 3 | n/a | 2 | n/a | n/a | 17/28 (61 %) | Acceptable | H2: "מזל טוב!" (-03); H5/H4: one-tap clear, no undo (-04); H8: main action below the fold (-08); -14 |
| survey sheet | 3 | 3 | 2 | 2 | 3 | 3 | n/a | 3 | 3 | 3 | 25/36 (69 %) | Acceptable | H3/H4: no close while the error says "או לסגור" (-06); -03, -16, -18 (owner) |
| about sheet | n/a | 3 | 4 | 3 | n/a | 3 | n/a | 3 | n/a | 4 | 20/24 (83 %) | Good | static text sheet |
| report sheet | 4 | 3 | 3 | 3 | 3 | 4 | 3 | 3 | 4 | 3 | 33/40 (83 %) | Good | -06 (no close on the form) |
| **G2 (sum of the rows)** | 39 | 37 | 40 | 35 | 26 | 40 | 24 | 36 | 19 | 24 | **320/432 (74 %)** | **Good** | |

`n/a` reasons, by row: no input or destructive action (H5 on end, pauses, match, about), a single path (H7 on end, match, decision, survey, about), no error state (H9 on end, pauses, match, decision, about), a moment panel with nothing to document (H10 on end, pauses, match, decision), a static sheet with no status (H1 on about), no failure path in the sheet (H9 on filters).

How the scores were made: the design-review sub-agent (A) scored each row from the shots and the source; the parent checked every row sum (A had row 2 as 30/40 and the group as 326/444; the cells give 29/40 and 320/432) and verified the P1/P2 findings against the shots and code. The detector sub-agent (B) found nothing in the source or in the overlay on 5 views, so no score moved.

### G3 Lists and settings (US-A-IMP-C-G3, 2026-11-07, at `e3faaee`; findings `findings/IMP-C-G3.md`)

| Screen (states) | H1 | H2 | H3 | H4 | H5 | H6 | H7 | H8 | H9 | H10 | Total | Band | Notes (finding IDs) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| lists "שמרתי" (rows, empty, chosen banner) | 3 | 3 | 2 | 2 | 2 | 2 | 2 | 3 | n/a | 2 | 21/36 (58 %) | Acceptable | H3/H5: one-tap clear of the chosen name (-07); H4/H10: empty state doesn't teach, three patterns (-02); H6: banner doesn't look tappable (-22); -10 |
| lists row menu | 2 | 3 | 1 | 2 | 2 | 2 | 3 | 3 | n/a | 2 | 20/36 (56 %) | Acceptable | H3/H1: remove and hide are silent, no undo (-01, P1); H6: hidden names can't be found again (-05); -20 |
| add-name sheet (default, error) | 3 | 3 | 2 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 29/40 (73 %) | Good | H3: no close button (-06); -17 |
| lists "התאמות" (solo, empty, rows, offline) | 3 | 2 | 3 | 2 | 3 | 3 | 2 | 3 | 2 | 3 | 26/40 (65 %) | Acceptable | H2: "שניכם" (-08); H9/H1: bare offline timestamp (-18); -26 (owner) |
| duel (few, round 1, mid-way, done, between matches) | 2 | 3 | 3 | 2 | 3 | 3 | 2 | 3 | 3 | 3 | 27/40 (68 %) | Acceptable | H1: round total shifts, stays after the end (-11), no press feedback (-12); H4: chips look selected (-13), result names don't open (-14); -25 (owner) |
| hidden (list, empty) | 2 | 3 | 3 | 2 | 3 | 2 | 2 | 3 | n/a | 3 | 23/36 (64 %) | Acceptable | H1: restore is silent (-01); H4: third empty pattern (-02); H6: only reachable from filters (-05) |
| settings (solo, shared) | 3 | 3 | 3 | 2 | 3 | 3 | 2 | 3 | 3 | 3 | 28/40 (70 %) | Good | H4: legal rows open a new tab (-03), name field off-spec (-16); -04, -24 (owner) |
| settings dialogs (delete, leave) | 3 | 3 | 4 | 2 | 3 | 3 | n/a | 3 | 2 | 3 | 26/36 (72 %) | Good | H9: leave always fails (-09, owner); H4: delete confirm looks like any primary (-15) |
| about page | n/a | 3 | 3 | 3 | n/a | 3 | n/a | 3 | n/a | 4 | 19/24 (79 %) | Good | -21, -23 |
| privacy + terms (frame only; the text is the owner's) | 3 | 3 | 2 | 3 | n/a | 2 | 2 | 3 | n/a | 3 | 21/32 (66 %) | Acceptable | H3: opened in a new tab, back lands on the deck (-03); H6/H7: no section index (-27, owner); -19, -23 |
| **G3 (sum of the rows)** | 24 | 29 | 26 | 23 | 22 | 26 | 18 | 30 | 13 | 29 | **240/360 (67 %)** | **Acceptable** | |

`n/a` reasons, by row: no input or failing action of its own (H9 on saved, where add-name is scored in its own row); local writes with no failure path in the UI (H9 on row menu and hidden); single-decision confirm dialogs, Esc and Enter are the only accelerators (H7 on dialogs); a static page with no async state, no input, nothing to speed up and no error (H1, H5, H7, H9 on about); read-only pages with no error path (H5, H9 on privacy and terms).

How the scores were made: the design-review sub-agent (A) scored each row from the shots and the source; the parent checked every row sum and the column sums, and verified the P1/P2 findings against the shots and code. The parent changed the row menu's H1 from 1 to 2 (the row does disappear, so there is visible feedback, just no confirmation) and its H5 from 1 to 2 (removal takes two taps through a menu), making that row 20/36 instead of A's 18/36. The parent also moved A's 320 px header finding from P2 to P3 (-10): the shot shows crowding, not overlap. The detector sub-agent (B) found 3 `undersized-ui-text` (an owner token, -24) and 8 `straggler` (-23) in the browser and nothing in the source; neither moved a score.


## After (re-score)

Same method, rows, columns, n/a rule and bands as the baseline (US-R1…R3, PRD §7). Each group has the after matrix, then the change per screen against its baseline row. Findings, finding status and new issues per group: `findings/R<n>-G<n>.md`.

### G1 Entry (US-R1, 2026-11-08, at `f404077`; findings `findings/R1-G1.md`)

| Screen (states) | H1 | H2 | H3 | H4 | H5 | H6 | H7 | H8 | H9 | H10 | Total | Band | Notes (backlog IDs) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| welcome (default, closed, expired), Persuade | 3 | 3 | 3 | 3 | 3 | 3 | n/a | 3 | 3 | n/a | 24/32 (75 %) | Good | H9 up: expired notice with a clock note (NP-012), Google error as an alert note (NP-011); buttons above the fold (NP-001); preview peek cuts the intro line at 375 px and in Safari (NP-BUG-001); -22 owner (OD-007) |
| sign-in, email step (valid, invalid) | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 30/40 (75 %) | Good | placeholder 5.7:1 (was 2.2:1, NP-053); error line with icon |
| sign-in, code step (timer, wrong, resend) | 3 | 3 | 2 | 3 | 3 | 4 | 3 | 3 | 3 | 3 | 30/40 (75 %) | Good | H9 up: wrong-code copy matches the locked resend (NP-004); H3 still 2: Back skips the email step (NP-007, next-run) |
| auth callback (loading, error) | 3 | 3 | 3 | 3 | n/a | 3 | n/a | 3 | 3 | n/a | 21/28 (75 %) | Good | -20 one action on error (NP-019, next-run) |
| onboarding | 3 | 3 | 2 | 3 | 4 | 3 | 3 | 3 | 3 | 3 | 30/40 (75 %) | Good | H5 up: names what's missing, optional box apart, stays busy (NP-026, NP-028); button says "שמירה והמשך" (NP-024); H3 still 2: no way out (OD-005, owner) |
| intro (top, surname) | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | n/a | 3 | 27/36 (75 %) | Good | H5 up: X keeps a typed surname (NP-029); H2 up: no "שניכם" (NP-025); field clear of the pinned button (NP-030) |
| join, invited (signed out) | 3 | 3 | 3 | 3 | 3 | 3 | n/a | 3 | 3 | 3 | 27/36 (75 %) | Good | H4 up: shared legal line (NP-014); H2 up: copy (NP-025); buttons above the fold (NP-001) |
| join outcomes (joined, expired, closed) | 3 | 3 | 3 | 3 | n/a | 3 | n/a | 3 | 3 | 3 | 24/32 (75 %) | Good | H9/H10 up: expired says who to ask (NP-022); H2 up (NP-025); -18 owner (OD-006) |
| invite (link ready, link failed) | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 30/40 (75 %) | Good | H2 up: copy (NP-025) |
| offline | 3 | 3 | 3 | 3 | n/a | 3 | n/a | 4 | 3 | n/a | 22/28 (79 %) | Good | H4/H8 up: wordmark, display title, primary button (NP-039) |
| goodbye | 3 | 3 | 3 | 3 | n/a | 3 | n/a | 4 | n/a | n/a | 19/24 (79 %) | Good | H8 up: wordmark (NP-038) |
| 404 | 3 | 3 | 3 | 3 | n/a | 3 | n/a | 4 | 3 | n/a | 22/28 (79 %) | Good | H1/H4/H8/H9 up: photo, glass panel, lead and button (NP-039) |
| unconfigured notice | 1 | 2 | 1 | 2 | n/a | 2 | n/a | 3 | 1 | n/a | 12/28 (43 %) | Poor | unchanged (NP-041, next-run); baseline row held, see below |
| **G1 (sum of the rows)** | 37 | 38 | 35 | 38 | 22 | 39 | 15 | 42 | 31 | 21 | **318/432 (74 %)** | **Good** | |

Change per screen (after − baseline):

| Screen | Baseline | After | Change | Heuristics that moved |
|---|---|---|---|---|
| welcome | 23/32 (72 %) | 24/32 (75 %) | +1 | H9 2→3 |
| sign-in, email step | 30/40 (75 %) | 30/40 (75 %) | 0 | none |
| sign-in, code step | 29/40 (73 %) | 30/40 (75 %) | +1 | H9 2→3 |
| auth callback | 21/28 (75 %) | 21/28 (75 %) | 0 | none |
| onboarding | 29/40 (73 %) | 30/40 (75 %) | +1 | H5 3→4 |
| intro | 25/36 (69 %) | 27/36 (75 %) | +2 | H2 2→3, H5 2→3 |
| join, invited | 25/36 (69 %) | 27/36 (75 %) | +2 | H2 2→3, H4 2→3 |
| join outcomes | 21/32 (66 %) | 24/32 (75 %) | +3 | H2 2→3, H9 2→3, H10 2→3 |
| invite | 29/40 (73 %) | 30/40 (75 %) | +1 | H2 2→3 |
| offline | 20/28 (71 %) | 22/28 (79 %) | +2 | H4 2→3, H8 3→4 |
| goodbye | 18/24 (75 %) | 19/24 (79 %) | +1 | H8 3→4 |
| 404 | 18/28 (64 %) | 22/28 (79 %) | +4 | H1 2→3, H4 2→3, H8 3→4, H9 2→3 |
| unconfigured notice | 12/28 (43 %) | 12/28 (43 %) | 0 | none |
| **G1** | **300/432 (69 %), Acceptable** | **318/432 (74 %), Good** | **+18** | no screen lower than its baseline |

How the scores were made: as the baseline. The design-review sub-agent (A) scored each screen fresh from the after shots and the source, before reading the baseline findings; the detector sub-agent (B) ran `impeccable detect` on 31 G1 files (exit 0, `[]`) and the overlay on 8 signed-out pages (4 items, all false positives; the one real baseline item, the placeholder, now 5.69:1). Parent adjustment: A scored the unconfigured notice 11 (H4 1, H8 2, H6 2); `Unconfigured.tsx` and its evidence are byte-for-byte the baseline's, so the baseline row (12) is held: a 1-point move on unchanged code is scorer variance, not a regression. A read the Simulator shots of the signed-out states before they were retaken (see `findings/R1-G1.md`); its Safari-only items were dropped and the retaken shots were read by the parent.

### G2 Deck (US-R2, 2026-11-08, at `f404077`; findings `findings/R2-G2.md`)

| Screen (states) | H1 | H2 | H3 | H4 | H5 | H6 | H7 | H8 | H9 | H10 | Total | Band | Notes (backlog IDs) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| deck: card + backgrounds (none, fabric, notebook, nursery, own), drag, peeking | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | n/a | 3 | 27/36 (75 %) | Good | back-card edges gone from the glass (NP-076); H8 held at 3: peeking cards still read as a double frame, "לכל הפרטים" cut at 320 with a two-line intro (existing) |
| deck: decisions (after vote, undo, skip long-press menu, offline pending footer, surname line) | 3 | 3 | 4 | 3 | 3 | 2 | 3 | 3 | 3 | 2 | 29/40 (73 %) | Good | H6/H10 still 2: hide is long-press only, shortcuts screen-reader only (-07 partly, NP-129); the offline sync pill now sits on the card's edge (NP-077, NP-BUG-002) |
| deck: filtered + empty filter result | 3 | 3 | 4 | 3 | 3 | 3 | 3 | 3 | 3 | n/a | 28/36 (78 %) | Good | unchanged; -12 (0-result apply) next-run (NP-134); A's H5 2 not taken, see below |
| deck: end (solo, shared, nothing saved) | 3 | 3 | 3 | 3 | n/a | 3 | n/a | 2 | n/a | n/a | 17/24 (71 %) | Good | H4 up: "לשמות שלי" full height (NP-075); H8 still 2: the Nest card's ink button competes, cut at 320 |
| deck: pauses (invite prompt, round recap) + survey prompt | 3 | 3 | 3 | 3 | n/a | 3 | 3 | 3 | n/a | n/a | 21/28 (75 %) | Good | H2 up: no "שניכם" (NP-025); A's H8 2 not taken, see below |
| name sheet (70 %, full, surname, similar section/opened, together, loading, offline) + toast | 3 | 3 | 4 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 31/40 (78 %) | Good | H3 up: "חזרה ל־{name}" from a similar name (NP-117); -15 offline line, -19 "#148" next-run (NP-136, NP-116) |
| filters sheet (default, selected, scrolled) | 4 | 3 | 4 | 3 | 3 | 3 | 3 | 2 | n/a | 3 | 28/36 (78 %) | Good | H3/H4 up: close button (NP-110); hidden-names hint (NP-129); H8 still 2: 32 chips (-11, owner); -09, -10, -12 open |
| background sheet (default, own saved) | 4 | 3 | 3 | 3 | 3 | 4 | 3 | 3 | 3 | 3 | 32/40 (80 %) | Good | unchanged; the saved toast still covers the privacy note while it shows |
| match sheet | 3 | 3 | 3 | 3 | n/a | 3 | n/a | 3 | n/a | n/a | 18/24 (75 %) | Good | copy without "שניכם" (NP-025); -14 niqqud next-run (NP-123) |
| decision sheet (solo, shared) | 3 | 3 | 4 | 3 | 3 | 3 | n/a | 3 | n/a | n/a | 22/28 (79 %) | Good | H2 up: no "!" (NP-125); H3/H4/H5 up: "ביטול הבחירה בשם…" with an undo toast (NP-126); H8 up: actions above the Nest card (NP-124) |
| survey sheet | 3 | 3 | 3 | 3 | 3 | 3 | n/a | 3 | 3 | 3 | 27/36 (75 %) | Good | H3/H4 up: close button (NP-110); -16 "שליחה" next-run (NP-131), -18 owner |
| about sheet | n/a | 3 | 4 | 3 | n/a | 3 | n/a | 3 | n/a | 4 | 20/24 (83 %) | Good | unchanged |
| report sheet | 4 | 3 | 3 | 3 | 3 | 4 | 3 | 3 | 4 | 3 | 33/40 (83 %) | Good | unchanged score; close button (NP-110); at 320 the title wraps the name onto its own line |
| **G2 (sum of the rows)** | 39 | 39 | 45 | 39 | 27 | 40 | 24 | 37 | 19 | 24 | **333/432 (77 %)** | **Good** | |

Change per screen (after − baseline):

| Screen | Baseline | After | Change | Heuristics that moved |
|---|---|---|---|---|
| deck: card + backgrounds | 27/36 (75 %) | 27/36 (75 %) | 0 | none |
| deck: decisions | 29/40 (73 %) | 29/40 (73 %) | 0 | none |
| deck: filtered + empty | 28/36 (78 %) | 28/36 (78 %) | 0 | none |
| deck: end | 16/24 (67 %) | 17/24 (71 %) | +1 | H4 2→3 |
| deck: pauses + survey prompt | 20/28 (71 %) | 21/28 (75 %) | +1 | H2 2→3 |
| name sheet + toast | 29/40 (73 %) | 31/40 (78 %) | +2 | H3 2→4 |
| filters sheet | 26/36 (72 %) | 28/36 (78 %) | +2 | H3 3→4, H4 2→3 |
| background sheet | 32/40 (80 %) | 32/40 (80 %) | 0 | none |
| match sheet | 18/24 (75 %) | 18/24 (75 %) | 0 | none |
| decision sheet | 17/28 (61 %) | 22/28 (79 %) | +5 | H2 2→3, H3 3→4, H4 2→3, H5 2→3, H8 2→3 |
| survey sheet | 25/36 (69 %) | 27/36 (75 %) | +2 | H3 2→3, H4 2→3 |
| about sheet | 20/24 (83 %) | 20/24 (83 %) | 0 | none |
| report sheet | 33/40 (83 %) | 33/40 (83 %) | 0 | none |
| **G2** | **320/432 (74 %), Good** | **333/432 (77 %), Good** | **+13** | no screen lower than its baseline |

How the scores were made: as the baseline. The design-review sub-agent (A) scored each screen fresh from the after shots (`shots/after/G2/`: 45 states in webkit, chromium, webkit375, webkit320; 25 in sim) and the source, before reading the baseline findings; the parent checked every row and column sum (A's were right). The detector sub-agent (B) ran `impeccable detect` on 58 G2 files (exit 0, `[]`, also with `--no-config`) and the overlay on the same 5 views as the baseline (0 items). Parent adjustments, by the US-R1 rule that a move on unchanged code is scorer variance: A scored H5 2 on "deck: filtered + empty" and on the filters sheet for -12 (0-result apply) and H8 2 on the pauses, each marked by A as calibration with the screen unchanged; the baseline cells (3) are held. A's sum was 330/432; held cells make it 333/432.

## Baseline performance

Measured by US-004 on 2026-11-07, `npm run build` at `b6ab9ca` (no code change since the detail run), production server `next start -p 3100`. Budget (PRD §3.1.8): `/names` first-load JS ≤ baseline + 3 KB gzipped, CLS 0 on the swipe screen, detail sheet open < 150 ms.

**First-load JS** (every `/_next/static/*.js` referenced by the prerendered HTML, each gzipped at level 9 and summed; same method as the detail run's `us072-size.mjs`; script `shots/us004-size.mjs`, run as `node scripts/ralph/qa/name-polish/shots/us004-size.mjs`):

| Route | Files | Raw (B) | Gzipped (B) |
|---|---|---|---|
| `/names` | 14 | 995,574 | **301,489** |
| `/names/lists` | 14 | 964,554 | 290,498 |
| `/names/welcome` | 12 | 906,268 | 271,504 |

`/names` budget ceiling for the run: 301,489 + 3,072 = **304,561 B gzipped**.

**Interaction** (Chromium as Pixel 7 with touch, QA user 1, no CPU throttle, service workers blocked, votes/matches/track mocked so nothing is written; script `shots/us004.mjs`, run as `QA_SHOTS_DIR=scripts/ralph/qa/name-polish/shots node scripts/ralph/qa/name-polish/shots/us004.mjs`; two runs):

| Measure | Method | Run 1 | Run 2 |
|---|---|---|---|
| CLS during 5 swipes (keep, skip, love, keep, skip, touch `drag()`) | `PerformanceObserver` `layout-shift`, entries without `hadRecentInput` summed | 0 (0 entries) | 0 (0 entries) |
| Tap → sheet visible, 3 opens (ms) | `performance.measure` from the `pointerup` timestamp to the frame after `section[role=dialog] h2` is in the DOM (as `qa1-q.mjs`); 1st open loads the sheet chunk | 51, 50, 42 | 61, 50, 43 |
| CLS over the whole run (swipes + 3 opens/closes) | same observer | 0 | 0 |

## Screens G1

Baseline inventory of group 1 (Entry, PRD §6), taken by US-005 on 2026-11-07 before any polish, at `f9bedbe` (no app code change since the detail run). Audits and QA use this list of screens and states and these names.

**Where:** `scripts/ralph/qa/name-polish/shots/baseline/G1/` (gitignored), named `<screen>-<state>-<browser>.png`. Browsers: `webkit` (Playwright WebKit, iPhone 15, 393 × 659), `chromium` (Playwright Chromium, Pixel 7, 412 × 839), `webkit375` (WebKit 375 × 667), `webkit320` (WebKit 320 × 568), `sim` (Mobile Safari, iOS Simulator iPhone 17 Pro, production build on :3100). A page taller than the viewport also has `<screen>-<state>-full-<browser>.png` (full page; Playwright only).

**How (re-run for the after shots):**
- Playwright, dev server :3000: `QA_SHOTS_DIR=scripts/ralph/qa/name-polish/shots node scripts/ralph/qa/name-polish/shots/us005-g1.mjs [webkit|chromium|webkit375|webkit320]`. QA user 1 for signed-in screens. Every write is mocked: OTP send (200) and verify (403 `otp_expired`), `names_join` (space id, or `invalid_code`), `names_invite` (a fixed code, or 500); no email goes out and no row changes.
- Simulator: `QA_SHOTS_DIR=… node scripts/ralph/qa/name-polish/shots/us005-sim.mjs <out|email|code|callbackLoading|inside|unconfigured>`. Signed out on `http://127.0.0.1:3100` (own storage; the dev server doesn't hydrate on 127.0.0.1), QA user 1 on `http://localhost:3100`. `code` sends one real code email to QA email 3 (Resend test address) and types a wrong code. `inside` calls the real `names_invite` for user 1's space.
- Unconfigured notice: the layout picks `Unconfigured` on the server from missing env, which can't be switched per request, so both scripts serve `/names/offline`'s HTML with its `<main>` replaced by `Unconfigured`'s markup (same classes) and scripts stripped (`/names/__unconfigured`, through a route in Playwright and a proxy on :3198 for Safari).

| Screen | State | How it's reached | Shots (`-<browser>.png`) | Browsers |
|---|---|---|---|---|
| `/names/welcome` | default | signed out | `welcome-default` (+ `-full` webkit/375/320) | all 5 |
| `/names/welcome` | sign-ups closed | `?closed=1` | `welcome-closed` (+ `-full`) | all 5 |
| `/names/welcome` | session expired | `?expired=1` | `welcome-expired` (+ `-full`) | all 5 |
| `/names/sign-in/email` | email step | open | `signin-email` | all 5 |
| `/names/sign-in/email` | invalid address | "abc" + שליחת קוד | `signin-email-invalid` | all 5 |
| `/names/sign-in/email` | code step, resend timer running | valid address + שליחת קוד | `signin-code` | all 5 |
| `/names/sign-in/email` | wrong code | 6 digits, verify 403 | `signin-code-wrong` (+ `-full` webkit/375/320) | all 5 |
| `/names/sign-in/email` | resend available | code step + 61 s (Playwright clock) | `signin-code-resend` | all 5 |
| `/names/auth/callback` | loading | expired stored session, refresh held | `callback-loading` | Playwright 4 (Safari routes on before it paints: a blank frame at 300 ms, the deck at 700 ms) |
| `/names/auth/callback` | error | `?error_description=x` | `callback-error` | all 5 |
| `/names/onboarding` | default (empty form) | user 1's session with the onboarding metadata removed in the browser only | `onboarding-default` (+ `-full`) | Playwright 4 (Safari needs a not-onboarded account: an auth data change) |
| `/names/intro` | top | user 1 | `intro-top` (+ `-full`) | all 5 |
| `/names/intro` | surname step | field scrolled into view and focused (Safari: drag up; Safari holds a saved surname from earlier runs) | `intro-surname` (+ `-full`) | all 5 |
| `/names/join/[code]` | valid, signed out | `/names/join/QAPOLISH` signed out | `join-invited` (+ `-full`) | all 5 |
| `/names/join/[code]` | valid, joined | user 1, `names_join` mocked | `join-joined` | Playwright 4 (a real join moves user 1 into another space) |
| `/names/join/[code]` | expired / used | user 1, `invalid_code` (Safari: the real RPC rejects `QAPOLISH`) | `join-expired` | all 5 |
| `/names/join/[code]` | sign-ups closed | `/names/welcome?closed=1&join=QAPOLISH` (where a closed sign-up from a join lands) | `join-closed` (+ `-full`) | all 5 |
| `/names/invite` | link ready | user 1 (Playwright mocked; Safari real) | `invite-link` (+ `-full` 320) | all 5 |
| `/names/invite` | link failed | `names_invite` 500 | `invite-error` | Playwright 4 (Safari can't mock Supabase) |
| `/names/offline` | default | open | `offline-default` | all 5 |
| `/names/goodbye` | default (signed out) | open signed out | `goodbye-default` | all 5 |
| `/names/[...missing]` | 404 | `/names/no-such-page` | `404-default` | all 5 |
| unconfigured notice | default | see above | `unconfigured-default` | all 5 |

23 states: 23 shots each in webkit, chromium, webkit375 and webkit320; 19 in sim (the 4 gaps above, each with its reason). 147 PNGs with the full-page ones.

**Seen while taking them** (for the audits to judge; not findings yet):
- `intro-surname`: in Chromium and WebKit the focused surname field sits partly under the sticky "התחלת בחירה" button.
- `intro-top-webkit320`: the lead paragraph runs behind the first feature card at 320 px.
- `welcome-*`: below the fold in WebKit 393 × 659 (email button and legal line need a scroll); fits on Pixel 7. In Safari the bottom toolbar covers the legal line until scrolled.
- `signin-code-wrong`: the resend line drops below the card's fold at 375 and 320.
- `offline`, `404`, `unconfigured`: plain canvas, no background photo or glass, unlike the other entry screens.

## Screens G2

Baseline inventory of group 2 (Deck, PRD §6), taken by US-006 on 2026-11-07 before any polish, at `b1e8771` (no app code change since the detail run). Audits and QA use this list of screens and states and these names.

**Where:** `scripts/ralph/qa/name-polish/shots/baseline/G2/` (gitignored), named `<screen>-<state>-<browser>.png`. Browsers as in G1: `webkit` (iPhone 15, 393 × 659), `chromium` (Pixel 7, 412 × 839), `webkit375` (375 × 667), `webkit320` (320 × 568), `sim` (Mobile Safari, iPhone 17 Pro). No G2 page is taller than its viewport, so there are no `-full` shots.

**How (re-run for the after shots):**
- Playwright, production build :3100, QA user 1: `QA_SHOTS_DIR=scripts/ralph/qa/name-polish/shots node scripts/ralph/qa/name-polish/shots/us006-g2.mjs [webkit|chromium|webkit375|webkit320] [--only backgrounds,actions,ends,pauses,detail,sheets]`. Every backend call the deck makes is mocked: `names_space` (a fixed space id), `space_members` (solo, or a pair with "עומר"), `name_votes` (GET a list made for the state; writes echoed, never sent), `name_matches`, `names_track` / `client_log` / `names_survey`. Device prefs are set per state (background, surname, filters, seen matches, `invitePromptShown`, `sessions`, `survey`, `chosen`). Some states limit the deck to 2 names by rewriting `content.*.json`.
- Simulator: `QA_SHOTS_DIR=… node scripts/ralph/qa/name-polish/shots/us006-sim.mjs <bg <name> [full 291] | url <shot> <path> | tap x y | drag … | shot <name>>` on `http://localhost:3100` with QA user 1 and the real backend, so only states that need no write. Safari holds the surname "רזניק" and an own photo from earlier runs; the run ends on "בדים", as it was.

| Screen | State | How it's reached | Shots (`-<browser>.png`) | Browsers |
|---|---|---|---|---|
| `/names` deck | card + peeking cards, each background | background pref `none` / `fabric` / `notebook` / `nursery`; own photo uploaded through the background sheet | `deck-bg-none`, `deck-bg-fabric`, `deck-bg-notebook`, `deck-bg-nursery`, `deck-bg-own` | all 5 (`deck-bg-own-webkit*`: see gaps) |
| `/names` deck | drag held towards skip / save (swipe label) | touch pointerdown + moves, no pointerup, 32 % of the card width | `deck-drag-start`, `deck-drag-end` | Playwright 4 |
| `/names` deck | after a decision (status line, undo on, position 2) | "שמירה" (Safari: "דילוג") | `deck-after-vote` | all 5 |
| `/names` deck | after undo | "ביטול ההחלטה האחרונה" | `deck-after-undo` | all 5 |
| `/names` deck | skip long-press menu ("דילוג ולא להציג שוב") | touch pointerdown held 900 ms on "דילוג" | `deck-skip-menu` | Playwright 4 |
| `/names` deck | offline, a decision waiting to sync (status footer) | `setOffline` + "שמירה" | `deck-offline-pending` | Playwright 4 |
| `/names` deck | surname set (card line) | surname pref "כהן-לוינסון" (Safari: "רזניק") | `deck-surname` | all 5 |
| `/names` deck | filtered (header dot, 518 names) | filters sheet → "בת" → "הצגת 518 שמות" | `deck-filtered` | Playwright 4 |
| `/names` deck | empty filter result | 2-name deck of girls' names, filter "בן" | `deck-empty-filter` | Playwright 4 |
| `/names` deck | deck end, solo (saved list + invite link) | 2-name deck: save one, skip one | `deck-end-solo` | Playwright 4 |
| `/names` deck | deck end, shared (no invite link) | same, pair space | `deck-end-shared` | Playwright 4 |
| `/names` deck | deck end, nothing saved | 2-name deck, both skipped | `deck-end-none-saved` | Playwright 4 |
| `/names` deck | pause: invite prompt after the 5th save | 4 saves, `invitePromptShown` false, save one more | `deck-pause-invite` | Playwright 4 |
| `/names` deck | pause: round recap (30 decisions) | 29 votes in this session (8 saved), one more | `deck-pause-recap` | Playwright 4 |
| `/names` deck | survey prompt above the card | 60 votes, `sessions.count` 3, `survey` null | `deck-survey-prompt` | Playwright 4 |
| name sheet | 70 % height, each background | card tap | `detail-70-bg-none` … `detail-70-bg-own` | all 5 |
| name sheet | full height | handle dragged up 300 px (Safari: (201,291) → (201,60)) | `detail-full-bg-none`, `detail-full-bg-fabric` | all 5 |
| name sheet | surname line ("עם שם המשפחה") | surname pref + card tap | `detail-surname` | Playwright 4 (Safari's `detail-70-bg-*` show it too) |
| name sheet | similar names section | scrolled into view (Safari: full + 3 drags) | `detail-similar-section` | all 5 |
| name sheet | a similar name opened (גבריאלה) | tap on its chip | `detail-similar-opened` | all 5 |
| toast | vote on a similar name in the sheet ("נשמר: גבריאלה") | "שמירה" in the sheet on the similar name | `toast-sheet-vote` | Playwright 4 |
| name sheet | together badge ("התאמה · שניכם שמרתם…") | pair space, match on נועם (seen), `?sheet=name&n=נועם`, full | `detail-together` | Playwright 4 |
| name sheet | details loading (skeleton lines) | `details.*.json` never answers | `detail-loading` | Playwright 4 |
| name sheet | details offline line | `details.*.json` aborted | `detail-offline` | Playwright 4 |
| filters sheet | default | `?sheet=filters` | `filters-default` | all 5 |
| filters sheet | a chip chosen ("בת", count 518) | tap | `filters-selected` | all 5 |
| filters sheet | scrolled to the end (popularity, trend, origin, length, letter, hidden) | sheet body scrolled | `filters-scrolled` | Playwright 4 |
| background sheet | default (בדים chosen) | `?sheet=background` | `background-default` | all 5 |
| background sheet + toast | own photo saved ("התמונה נשמרה במכשיר הזה.") | file input with `name-detail/shots/qa-own-bg.jpg` | `background-own-saved` | Playwright 4 (WebKit: error toast, see gaps) |
| about sheet | default | `?sheet=about` | `about-default` | all 5 |
| report sheet | default (about the top card) | `?sheet=report` (Safari focuses the field: keyboard bar) | `report-default` | all 5 |
| survey sheet | default | `?sheet=survey` | `survey-default` | all 5 |
| match sheet | new match (נועם) | pair space, `name_matches` → נועם, not seen | `match-default` | Playwright 4 |
| decision sheet ("בחרנו שם", over lists) | solo ("בחרתי שם") / shared ("בחרנו שם") | `chosen` pref = נועם, `/names/lists?sheet=decision` | `decision-solo`, `decision-shared` | Playwright 4 |

45 states: 45 shots each in webkit, chromium, webkit375 and webkit320; 23 in sim. 203 PNGs.

**Gaps (with reasons):**
- Simulator Safari (22 states not shot): it runs against the real backend and Safari can't route Supabase, so states that need made-up votes, a pair space, a match, a chosen name, offline or a blocked data file (`deck-drag-*` too: cliclick can't hold a drag for a screenshot) are Playwright only. The one write it did (an accidental "דילוג" on גבריאל, kept as `deck-after-vote-sim`) was undone with "ביטול" right away; after a reload גבריאל is card 1 of 1295 again.
- Own photo in Playwright WebKit: the upload fails ("אי אפשר לפתוח את התמונה הזו…", the WebKit-driver limit found in the detail run, `name-detail/shots/qa1-j-idb.mjs`), so `background-own-saved-webkit*` show the error toast and `deck-bg-own-webkit*` / `detail-70-bg-own-webkit*` show the fabric fallback. The own photo is real in Chromium and in Safari.

**Seen while taking them** (for the audits to judge; not findings yet):
- `webkit320`: the header drops the "בחירת שם" title and the action bar drops its icons (narrow-screen rules); the recap panel cuts the Nest card at the bottom (the panel scrolls).
- `deck-end-solo`: "לשמות שלי" is a small pill in the solo state and a full button in the shared one (the invite link sits under it).
- `report-default-sim`: the textarea takes focus on open, so the keyboard bar covers the lower sheet in Safari.
- `detail-similar-section-sim`: a drag over the year chart leaves its tooltip on.
- Pause, end and empty panels repeat the Nest app card (`deck-end-*`, `deck-pause-recap`, `decision-*`).

## Screens G3

Baseline inventory of group 3 (Lists and settings, PRD §6), taken by US-007 on 2026-11-07 before any polish, at `f513415` (no app code change since the detail run). Audits and QA use this list of screens and states and these names.

**Where:** `scripts/ralph/qa/name-polish/shots/baseline/G3/` (gitignored), named `<screen>-<state>-<browser>.png`. Browsers as in G1/G2: `webkit` (iPhone 15, 393 × 659), `chromium` (Pixel 7, 412 × 839), `webkit375` (375 × 667), `webkit320` (320 × 568), `sim` (Mobile Safari, iPhone 17 Pro). Pages taller than the viewport also have a `<screen>-<state>-full-<browser>.png` (full page): `lists-saved-default`, `lists-chosen-banner`, `settings-shared`, `privacy-default`, `terms-default` in every Playwright variant, plus `settings-solo`, `duel-done`, `duel-midway` where they overflow, and at 320 also `lists-matches-default`, `lists-matches-offline`, `duel-round-1`, `duel-matches`, `about-default`.

**How (re-run for the after shots):**
- Playwright, production build :3100, QA user 1: `QA_SHOTS_DIR=scripts/ralph/qa/name-polish/shots node scripts/ralph/qa/name-polish/shots/us007-g3.mjs [webkit|chromium|webkit375|webkit320] [--only saved,matches,duel,hidden,settings,pages]`. Same mocks as `us006-g2.mjs` (`names_space`, `space_members` solo or a pair with "עומר", `name_votes` GET a list made for the state with writes echoed and never sent, `name_matches`, tracking). The saved list is 8 rows: 2 loved, 5 kept, 1 custom ("זוהרית"); hidden adds 4 hidden names; matches are 3 (one new and loved). Settings dialogs are opened by URL (`?dialog=delete-account`, `?dialog=leave-space`) and never confirmed.
- Simulator: `QA_SHOTS_DIR=… node scripts/ralph/qa/name-polish/shots/us007-sim.mjs url <shot> <path>` on `http://localhost:3100` with QA user 1 and the real backend, by URL only (no taps, no writes). QA user 1 is really in a shared space (with QA2) with nothing saved or hidden, so Safari shows the empty and shared states.

| Screen | State | How it's reached | Shots (`-<browser>.png`) | Browsers |
|---|---|---|---|---|
| `/names/lists` "שמרתי" | rows: loved first with "אהבתי מאוד", a custom name ("שם שהוספתי"), meta line, duel link | 8 saved votes | `lists-saved-default` (+ `-full`) | Playwright 4 |
| `/names/lists` "שמרתי" | empty ("עוד לא נשמרו שמות.") | no votes | `lists-saved-empty` | all 5 |
| `/names/lists` row menu | open on the first row ("בחרתי בשם…", "הסרה מהרשימה", "לא להציג יותר") | tap "אפשרויות עבור אריאל" | `lists-row-menu` | Playwright 4 |
| `/names/lists` chosen banner | "השם שבחרתי · מוחמד" above the tabs | `chosen` pref | `lists-chosen-banner` (+ `-full`) | Playwright 4 |
| add-name sheet | default (empty field, hint) | "הוספת שם" (Safari: `?sheet=add-name`, keyboard up) | `add-name-default` | all 5 |
| add-name sheet | error "כבר ברשימה" | a saved name typed + "הוספה לרשימה" (nothing written) | `add-name-error` | Playwright 4 |
| `/names/lists` "התאמות" | solo: "בוחרים ביחד?" invite card | solo space, `?tab=matches` | `lists-matches-solo` | Playwright 4 |
| `/names/lists` "התאמות" | shared, none yet ("עוד אין התאמות.") | pair space, no matches | `lists-matches-empty` | all 5 |
| `/names/lists` "התאמות" | shared rows ("חדש", loved mark, meta), duel link | pair space, 3 matches, 2 seen | `lists-matches-default` | Playwright 4 |
| `/names/lists` "התאמות" | offline: "עודכן לאחרונה ב־…" line | same, then `setOffline` | `lists-matches-offline` | Playwright 4 |
| duel | too few names ("לדו־קרב צריך לפחות שני שמות ברשימה.") | 1 saved, `?tab=duel&from=saved` | `duel-few` | all 5 |
| duel | round 1 (progress bar, two name cards, "או", "עצירה…") | 8 saved | `duel-round-1` | Playwright 4 |
| duel | mid-way ("החמישייה עד עכשיו" chips) | 4 picks of the first card | `duel-midway` | Playwright 4 |
| duel | done (ranked five, "בחרתי בשם…", "דו־קרב חדש") | first card picked until the end | `duel-done` | Playwright 4 |
| duel | between matches (source toggle "בין: שמרתי · התאמות") | pair space, 3 matches, `from=matches` | `duel-matches` | Playwright 4 |
| `/names/hidden` | list with "החזרה" buttons | 4 hidden votes | `hidden-default` | Playwright 4 |
| `/names/hidden` | empty ("אין שמות מוסתרים") | no hidden votes | `hidden-empty` | all 5 |
| `/names/settings` | solo (no leave row) | solo space | `settings-solo` (+ `-full`) | Playwright 4 |
| `/names/settings` | shared (with "יציאה מהבחירה המשותפת") | pair space | `settings-shared` (+ `-full`) | all 5 |
| `/names/settings` dialog | delete account ("למחוק את החשבון?"), display only | `?dialog=delete-account` | `settings-delete-dialog` | all 5 |
| `/names/settings` dialog | leave shared choice ("לצאת מהבחירה המשותפת?"), display only | pair space, `?dialog=leave-space` | `settings-leave-dialog` | all 5 |
| `/names/about` | default | direct | `about-default` | all 5 |
| `/names/privacy` | default (draft banner) | direct | `privacy-default` (+ `-full`) | all 5 |
| `/names/terms` | default (draft banner) | direct | `terms-default` (+ `-full`) | all 5 |

24 states: 24 shots each in webkit, chromium, webkit375 and webkit320, plus 33 `-full` shots; 11 in sim. 140 PNGs.

**Gaps (with reasons):**
- Simulator Safari (13 states not shot): it runs against QA user 1's real data (shared space, nothing saved or hidden) and Safari can't route Supabase, so states that need saved, hidden or matched names, a solo space, a chosen name, offline, or a submit/tap that could write are Playwright only. Its full-page settings, privacy and terms are not taken (Safari screenshots are the visible screen).
- The settings screens show QA user 1's sign-in email; the shots stay in the gitignored folder.

**Seen while taking them** (for the audits to judge; not findings yet):
- `webkit375` / `webkit320`: the "השמות שלי" title wraps to two lines beside the invite and "הוספת שם" buttons; at 320 a saved row's meta line wraps ("יציב" alone on the second line).
- Chromium has no "התקנה למסך הבית" row in settings (the install mode differs), WebKit and Safari do.
- The duel's empty "too few" card sits over the blurred peach blob, the rest of the screen is blank.
- Empty states in lists, matches and hidden use three different patterns (card with a link, card with a title + line + link, plain centered line).
