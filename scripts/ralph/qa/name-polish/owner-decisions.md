# Name swiper polish: owner decisions

Findings that are not acted on in this run because they cross a PRD §3.2 line (an existing token value, a logo, font, photo or board layout; a §3.1 or earlier owner decision; a new feature, setting, screen or event; legal text or name content; a backend, Supabase or Vercel change; more than one iteration even after splitting). IDs `OD-001` on, newest last. Earlier UX ideas keep their old ID (e.g. `ND-UX-008`).

| ID | Title | Source (finding / UX IDs) | §3.2 reason | Recommendation |
|---|---|---|---|---|
| OD-001 | Consent and opt-in wording (slash gender forms, 'בחנויות') | COPY-G1-01, COPY-G2-13 | stored consent statements: their wording is close to legal text (§3.1.5, §3.2 legal text) | Option 1, with the consent version bumped so stored consents stay traceable. |
| OD-002 | Duel over a long list takes hundreds of rounds | BREAK-G3-07 | changes an earlier owner decision (the duel runs over the whole list) | Option 1: it keeps the duel short with no new screen. |
| OD-003 | Join never names who invited you | CRIT-G1-06 | needs a backend change (inviter name before sign-in) and new data (§3.1.4) | Option 1 in a backend run; it's the strongest trust cue on the join screen. |
| OD-004 | 'בחרנו בשם' in a shared choice is stored on this device only | CRIT-G3-02 | changes the launch pack's device-only decision; a shared version needs a backend column | Option 2 now (copy only, a polish item once approved), option 1 with the next backend run. |
| OD-005 | Onboarding has no way out | IMP-C-G1-10 | adds a control to a screen (§3.1.4) | Option 1: it reuses sign-out and removes a dead end. |
| OD-006 | A closed sign-up from an invite loses the invitation | IMP-C-G1-18 | changes what the waitlist tells invitees, an earlier owner decision | Option 1 wording only, once the owner confirms what invitees are promised. |
| OD-007 | The welcome preview's mask fades out the CBS numbers | IMP-C-G1-22 | changes the composition of an approved screen (board layout) | Leave as is in this run; revisit with the welcome fit fix. |
| OD-008 | Theme 'יוניסקס' duplicates the sex chip 'מתאים לכולם' | IMP-C-G2-10 | the filters don't change (§3.1.3) | Rename or drop in a content run; it's a filter decision. |
| OD-009 | The filters sheet is a wall of options | IMP-C-G2-11 | changes the layout of board 3 | Option 1 in a later design run. |
| OD-010 | A refused survey is shown as sent | IMP-C-G2-18 | an earlier deliberate decision, tied to the survey backend | Option 1 if the survey answers matter for research; otherwise keep. |
| OD-011 | Leaving a shared choice always fails (names_leave not deployed) | IMP-C-G3-09, ND-UX-008, NP-UX-007 | needs a Supabase change (deploy migration 0011) or hiding a shipped row | Option 1 before launch; it's the only way to undo a join. |
| OD-012 | Type sizes under the skills' floors (body 13.5 px, tags 11 px, labels 10.5 px) | IMP-C-G3-24, PRO-G1-06, PRO-G2-06 | changes existing type token values and the board layouts (§3.1.2) | Raise tag and label to 12 px in a next run with a layout pass; body can stay. |
| OD-013 | 'דו־קרב' is a tab that removes the tabs | IMP-C-G3-25 | changes a board layout (board 5) | Leave as is in this run. |
| OD-014 | Matches copy and the matching rule for 3+ members | IMP-C-G3-26 | the matching rule is an earlier owner decision | Confirm option 1; the polish backlog already moves the copy to 'every member'. |
| OD-015 | Long legal pages have no section index | IMP-C-G3-27 | adds navigation to the legal pages, close to a new feature | Option 1 later; the text stays untouched. |
| OD-016 | A wrong duel pick can't be taken back | INT-G3-08 | adds a control and an action to the duel (§3.1.4) | Option 1: one step back, no new screen. |
| OD-017 | Choosing the name sits behind a row's '⋮' menu | JRN-ALL-01 | changes a flow and adds an entry point | Option 2: it puts the choice where the match moment already is. |
| OD-018 | After choosing, the deck and the next visit show no trace | JRN-ALL-02 | adds UI to the deck and changes what a return visit shows | Option 1. |
| OD-019 | A first match made from the name sheet shows only after the sheet closes | JRN-ALL-03 | changes when the match moment happens | Option 1. |
| OD-020 | A new device shows the first-time intro to a long-time user | JRN-ALL-06 | changes when a flow step shows | Option 1 (the surname field also lives in settings). |
| OD-021 | Lists always open on 'שמרתי' | JRN-ALL-09 | changes navigation in a flow | Option 1. |
| OD-022 | No way to remove an own background photo | NP-UX-003 | adds a control (§3.1.4) | Option 1: a private photo on a shared device should be removable. |
| OD-023 | 'בעלייה' never shows a name with the current data | NP-UX-005 | name content and filters (§3.1.3, §3.1.5) | Wait for more names; the data is right. |
| OD-024 | 'Did you mean …' for one-letter-off custom names | NP-UX-006 | a new feature | Later run. |
| OD-025 | Root-sharing and biblical-spelling 'similar names' | ND-UX-002, ND-UX-004 | name content (§3.1.5) | Owner spot check in a content pass. |
| OD-026 | Service worker network-first fetches have no timeout | ND-UX-006 | public/sw.js is outside this run's scope (§3.1.9) and changes the earlier caching rule | Option 1 in a later run; the deck's new data-failure state covers the visible part. |

### OD-001: Consent and opt-in wording (slash gender forms, 'בחנויות')

- **Source:** COPY-G1-01, COPY-G2-13
- **Why it's the owner's:** §3.2: stored consent statements: their wording is close to legal text (§3.1.5, §3.2 legal text)
- **Evidence:**
  - `COPY-G1-01` (P2, `/names/onboarding`, default): - "אני בן/בת 18 ומעלה" and "קראתי ואני מסכים/ה ל…" are the only slash forms in G1. Every other G1 string reaches gender neutrality by wording (impersonal plural, first-person past), so these two read like a form. - Gender-neutral wording is available with the same meaning: "מלאו לי 18" and "קראתי והסכמתי ל…" (first-person past is the same for everyone). - "אשמח לקבל עדכון כש־Nest יוצאת לחנויות": "לחנויות" means the … Screenshot: `shots/audit/COPY-G1/onboarding-default-full-webkit.png`, `onboarding-default-chromium.png`
  - `COPY-G2-13` (P3, Nest card on the deck end, the pause recap and the decision sheet): this is the same opt-in as onboarding's line in COPY-G1-01, with the same two problems: - "היא עוד לא בחנויות" is insider shorthand for the app stores. - "נעדכן אותך כש־Nest יוצאת" and the button "לעדכן אותי כשהיא יוצאת" use the present tense, so they read as if the launch is happening now. Screenshot: `shots/audit/COPY-G2/deck-end-solo-webkit.png`, `deck-pause-recap-webkit.png`, `decision-solo-webkit.png`
- **Options:**
  1. Approve the proposed gender-neutral lines (and record the new wording version with the consent)
  2. Keep the current lines
- **Recommendation:** Option 1, with the consent version bumped so stored consents stay traceable.

### OD-002: Duel over a long list takes hundreds of rounds

- **Source:** BREAK-G3-07
- **Why it's the owner's:** §3.2: changes an earlier owner decision (the duel runs over the whole list)
- **Evidence:**
  - `BREAK-G3-07` (P3, duel between saved names (or matches) with a realistic list: 20 names → 53 rounds, 40 → 11): the duel inserts every name of the list into a top five (E16 FR-13), so its length grows linearly (about 3 picks per name). A couple who saved 40 names is told "סיבוב 1 מתוך 113" on entry, which reads as a chore; "עצירה, אפשר להמשיך אחר כך" helps but doesn't change the scale. Nothing breaks visually. Screenshot: `audit/BREAK-G3/duel-1284-webkit.png`, `…/duel-1284-zoom150.png`
- **Options:**
  1. Above 20 names start on loved + most recent saves up to 20, and say so
  2. Let the person pick up to 20 names first
  3. Leave as is
- **Recommendation:** Option 1: it keeps the duel short with no new screen.

### OD-003: Join never names who invited you

- **Source:** CRIT-G1-06
- **Why it's the owner's:** §3.2: needs a backend change (inviter name before sign-in) and new data (§3.1.4)
- **Evidence:**
  - `CRIT-G1-06` (P3, `/names/join/[code]` signed out (invited) and joined): the invitation reads "קיבלת הזמנה לבחור שם ביחד ב־Nest" with no inviter, and the success state reads "הצטרפת." / "עכשיו שמות ששניכם שמרתם יופיעו בהתאמות." with no one named. For a relative opening a link from a message thread, the name of the person is the trust signal and the emotional peak of the flow; the invite screen already shows "מי כבר כאן", so the data exists, just not here. Screenshot: `audit/CRIT-G1/join-invited-full-webkit.png`, `audit/CRIT-G1/join-joined-webkit.png`
- **Options:**
  1. Return the inviter's display name from the invite RPC and show it
  2. Leave as is
- **Recommendation:** Option 1 in a backend run; it's the strongest trust cue on the join screen.

### OD-004: 'בחרנו בשם' in a shared choice is stored on this device only

- **Source:** CRIT-G3-02
- **Why it's the owner's:** §3.2: changes the launch pack's device-only decision; a shared version needs a backend column
- **Evidence:**
  - `CRIT-G3-02` (P3, `/names/lists` row menu, duel result and decision sheet in a shared space; the chosen bann): in a shared space the action reads "בחרנו בשם X" (`launch.ts:84`) and the banner then says the name was chosen, but `useChosen` keeps it in a device pref (`useChosen.ts:11` "device only"). The partner sees no banner, no mark, nothing; the same person on their other device sees nothing either. The words describe a joint decision; the system records a private note. At the product's most important moment (Peak-End), … Screenshot: `audit/CRIT-G3/lists-chosen-banner-webkit.png`, `audit/CRIT-G3/duel-done-webkit.png`
- **Options:**
  1. Store the chosen name on the space so the partner sees it
  2. Keep device-only and say so in the copy ('סימנתי כאן')
- **Recommendation:** Option 2 now (copy only, a polish item once approved), option 1 with the next backend run.

### OD-005: Onboarding has no way out

- **Source:** IMP-C-G1-10
- **Why it's the owner's:** §3.2: adds a control to a screen (§3.1.4)
- **Evidence:**
  - `IMP-C-G1-10` (P2, `/names/onboarding`): no back and no sign-out; someone signed in with the wrong Google account is stuck on the form (Back to welcome would bounce straight back, since they are signed in). Screenshot: `audit/IMP-C-G1/onboarding-default-full-webkit.png`
- **Options:**
  1. A quiet 'יציאה מהחשבון' link under the form using the existing sign-out
  2. Leave as is
- **Recommendation:** Option 1: it reuses sign-out and removes a dead end.

### OD-006: A closed sign-up from an invite loses the invitation

- **Source:** IMP-C-G1-18
- **Why it's the owner's:** §3.2: changes what the waitlist tells invitees, an earlier owner decision
- **Evidence:**
  - `IMP-C-G1-18` (P3, `/names/welcome?closed=1&join=…`): the generic welcome with the closed notice; nothing says an invitation was received. Screenshot: `audit/IMP-C-G1/join-closed-full-webkit.png`
- **Options:**
  1. Acknowledge the invite in the closed notice and keep the code
  2. Leave as is
- **Recommendation:** Option 1 wording only, once the owner confirms what invitees are promised.

### OD-007: The welcome preview's mask fades out the CBS numbers

- **Source:** IMP-C-G1-22
- **Why it's the owner's:** §3.2: changes the composition of an approved screen (board layout)
- **Evidence:**
  - `IMP-C-G1-22` (P3, `/names/welcome`): `mask-b-from-60%` hides the stat tiles, the one thing only this product can prove on the Persuade surface. Screenshot: `audit/IMP-C-G1/welcome-default-webkit.png`
- **Options:**
  1. Show the numbers unmasked (decide with NP item for the short-phone fit)
  2. Leave as is
- **Recommendation:** Leave as is in this run; revisit with the welcome fit fix.

### OD-008: Theme 'יוניסקס' duplicates the sex chip 'מתאים לכולם'

- **Source:** IMP-C-G2-10
- **Why it's the owner's:** §3.2: the filters don't change (§3.1.3)
- **Evidence:**
  - `IMP-C-G2-10` (P3, filters (default)): "מתאים לכולם" under "לבן או לבת" (`FiltersSheet.tsx:44`) and "יוניסקס" under "נושאים" (`src/lib/names/themes.ts:31`): one idea, two words, two controls. Screenshot: `audit/IMP-C-G2/filters-default-webkit.png`
- **Options:**
  1. Drop the theme
  2. Rename it
  3. Leave as is
- **Recommendation:** Rename or drop in a content run; it's a filter decision.

### OD-009: The filters sheet is a wall of options

- **Source:** IMP-C-G2-11
- **Why it's the owner's:** §3.2: changes the layout of board 3
- **Evidence:**
  - `IMP-C-G2-11` (P3, filters (default, scrolled)): "נושאים" alone is 15 chips (`FiltersSheet.tsx:150–153`); the sheet shows 32 chips before the tiles. "כל השמות" repeats as the first chip of five groups, and popularity, trend and origin sit below the themes. Screenshot: `audit/IMP-C-G2/filters-default-webkit.png`, `audit/IMP-C-G2/filters-scrolled-chromium.png`
- **Options:**
  1. Put themes behind a tile like 'אות ראשונה'
  2. Leave as is
- **Recommendation:** Option 1 in a later design run.

### OD-010: A refused survey is shown as sent

- **Source:** IMP-C-G2-18
- **Why it's the owner's:** §3.2: an earlier deliberate decision, tied to the survey backend
- **Evidence:**
  - `IMP-C-G2-18` (P3, survey sheet, submit when `names_survey` errors): `SurveySheet.tsx:113–118`. On `result === "error"` it logs, shows "תודה! התשובות נשלחו." and never asks again; the open answers are lost. Screenshot: none (code path; Playwright can force it by routing `names_survey` to 500)
- **Options:**
  1. Show an error with a retry
  2. Keep the silent path
- **Recommendation:** Option 1 if the survey answers matter for research; otherwise keep.

### OD-011: Leaving a shared choice always fails (names_leave not deployed)

- **Source:** IMP-C-G3-09, ND-UX-008, NP-UX-007
- **Why it's the owner's:** §3.2: needs a Supabase change (deploy migration 0011) or hiding a shipped row
- **Evidence:**
  - `IMP-C-G3-09` (P2, settings → leave dialog → "יציאה"): the dialog promises a clear outcome, but `names_leave` isn't deployed on the EU backend (ND-UX-008), so `confirmLeave` always ends in "היציאה לא הצליחה. אפשר לנסות שוב." (`src/lib/names/leave.ts:16`). Trying again can never work. Screenshot: `audit/IMP-C-G3/settings-leave-dialog-webkit.png`, `audit/IMP-C-G3/settings-leave-dialog-sim.png`
  - `ND-UX-008`: name-detail ux-insights (QA1-O): `POST /rest/v1/rpc/names_leave` → 404 PGRST202 on 'Nest (EU)'; every confirm ends in 'היציאה לא הצליחה'. Shot: `scripts/ralph/qa/name-detail/shots/qa1-o-lp-webkit-leave-failed.png`.
  - `NP-UX-007`: names-pwa ux-insights (QA1-H): a join was irreversible. The settings row now exists, but it depends on `names_leave` (see ND-UX-008).
- **Options:**
  1. Apply migration 0011 before launch
  2. Hide the row until the RPC exists
  3. Leave as is
- **Recommendation:** Option 1 before launch; it's the only way to undo a join.

### OD-012: Type sizes under the skills' floors (body 13.5 px, tags 11 px, labels 10.5 px)

- **Source:** IMP-C-G3-24, PRO-G1-06, PRO-G2-06
- **Why it's the owner's:** §3.2: changes existing type token values and the board layouts (§3.1.2)
- **Evidence:**
  - `IMP-C-G3-24` (P3, settings, "החשבון", "בחירה ביחד", "מידע"): the headings are `<h2 class="text-label text-stone">` (`SettingsScreen.tsx:78`). `--nest-text-label` is 10.5 px (`nest-tokens.css:68`), under the detector's 11 px floor, and it's the smallest type on the screen doing heading work. Screenshot: `audit/IMP-C-G3/overlay-settings.png`
  - `PRO-G1-06` (P3, every G1 screen (welcome pitch, offline, closed/expired notices, onboarding; hints and the): the `body` token is 13.5 px / 22 px and `caption` is 12 px (`nest-tokens.css:62–67`, from the owner's `tokens.json`). Measured lines are short (20–41 characters), with comfortable line-height (1.47–1.63), and contrast is high on the glass. That's why this reads fine in the shots, but it's below the skill's base size for mobile body text. Inputs at 15 px (iOS zoom) are the separate, fixable IMP-A-G1-02. Screenshot: `audit/PRO-G1/welcome-webkit.png`, `audit/PRO-G1/offline-webkit.png`
  - `PRO-G2-06` (P3, - the card's sex tag ("בן") and its "ב־2024" caption - the name sheet's section eyebrows (): these use the `tag` token (11 px / 700) and the `label` token (10.5 px / 700) (`nest-tokens.css:68–80`, from the owner's `tokens.json`). They're bold, short (1–4 words) and high in contrast: 4.6–9.8:1 measured on all four backgrounds. They read well in every shot, including Safari's. But the skill lists "Text < 12px" among its typography anti-patterns, and `readable-font-size` asks for more on mobile. Same family of … Screenshot: `audit/PRO-G2/detail-70-webkit.png`, `audit/PRO-G2/deck-webkit.png`, `audit/PRO-G2/background-webkit.png`
- **Options:**
  1. Raise body toward 15–16 px and tag/label to 12 px with a full layout pass
  2. Leave the owner's tokens
- **Recommendation:** Raise tag and label to 12 px in a next run with a layout pass; body can stay.

### OD-013: 'דו־קרב' is a tab that removes the tabs

- **Source:** IMP-C-G3-25
- **Why it's the owner's:** §3.2: changes a board layout (board 5)
- **Evidence:**
  - `IMP-C-G3-25` (P3, lists tabs → duel): the "דו־קרב" `role="tab"` (`ListsScreen.tsx:83–87`) doesn't show a panel. It swaps in a full page with its own back button (`:125–144`), and the tablist is gone. The same destination is also the peach `DuelLink` card under the list (`:455–477`). Screenshot: `audit/IMP-C-G3/lists-saved-default-full-webkit.png`, `audit/IMP-C-G3/duel-round-1-webkit.png`
- **Options:**
  1. Keep the segment
  2. Make the duel a link only
- **Recommendation:** Leave as is in this run.

### OD-014: Matches copy and the matching rule for 3+ members

- **Source:** IMP-C-G3-26
- **Why it's the owner's:** §3.2: the matching rule is an earlier owner decision
- **Evidence:**
  - `IMP-C-G3-26` (P3, matches intro and empty, 3+ members): `matches.ts:256` "שמות שלפחות שניים מכם שמרו." and `ListsScreen.tsx:365` "שם ששניים מכם שמרו" say 2+. PRODUCT.md says "every member kept or loved", and the code comment (`ListsScreen.tsx:304`) says 2+. Screenshot: none (code only)
- **Options:**
  1. Confirm 'every member' (PRODUCT.md) so the copy item aligns
  2. Change the rule
  3. Leave as is
- **Recommendation:** Confirm option 1; the polish backlog already moves the copy to 'every member'.

### OD-015: Long legal pages have no section index

- **Source:** IMP-C-G3-27
- **Why it's the owner's:** §3.2: adds navigation to the legal pages, close to a new feature
- **Evidence:**
  - `IMP-C-G3-27` (P3, privacy (about 2,600 CSS px tall), terms): one long card with `h2`s and no jump links. Finding a section (e.g. "מחיקה") means scrolling the whole page. Screenshot: `audit/IMP-C-G3/privacy-default-full-webkit.png`
- **Options:**
  1. In-page anchors from the section titles
  2. Leave as is
- **Recommendation:** Option 1 later; the text stays untouched.

### OD-016: A wrong duel pick can't be taken back

- **Source:** INT-G3-08
- **Why it's the owner's:** §3.2: adds a control and an action to the duel (§3.1.4)
- **Evidence:**
  - `INT-G3-08` (P3, `/names/lists?tab=duel`, any round after the first): - Each pick is final and saved at once (`DuelScreen.choose` → `setPref("duelState")`). The next pair replaces the cards in the next frame (`duelPickFrames`). - **A mis-tap stays.** Picking the wrong card, or a second tap landing on the next pair (IMP-A-G3-03), is permanent. The only recovery is "דו־קרב חדש" at the end, which drops every pick. - **The stakes:** with 8 names a duel is 17 rounds, and the result feeds … Screenshot: `audit/INT-G3/duel-after3-webkit.png`
- **Options:**
  1. A quiet 'ביטול הבחירה האחרונה' link after the first pick
  2. Leave as is
- **Recommendation:** Option 1: one step back, no new screen.

### OD-017: Choosing the name sits behind a row's '⋮' menu

- **Source:** JRN-ALL-01
- **Why it's the owner's:** §3.2: changes a flow and adds an entry point
- **Evidence:**
  - `JRN-ALL-01` (P2, `/names/lists?tab=matches` (and "שמרתי"), shared space with a match; return visit): a returning person who wants to mark "the one" has no visible action on the rows: the row is a plain card with an outlined "⋮", and the menu's only item is "בחרנו בשם אליעזר". The other way is to finish a duel. From the deck: pill → tab → ⋮ → item, 4 taps, the last two behind an icon with no label on screen. Screenshot: `audit/JRN/j3-04-row-menu-webkit.png`, `audit/JRN/j3s-01-matches-sim.png`, `audit/JRN/j3s-02-row-menu-sim.png`
- **Options:**
  1. A visible text action on match rows
  2. A secondary action on the match sheet
  3. Leave as is
- **Recommendation:** Option 2: it puts the choice where the match moment already is.

### OD-018: After choosing, the deck and the next visit show no trace

- **Source:** JRN-ALL-02
- **Why it's the owner's:** §3.2: adds UI to the deck and changes what a return visit shows
- **Evidence:**
  - `JRN-ALL-02` (P3, `/names` after "בחרנו בשם אליעזר"; a later page load): the decision sheet says "השם נשמר כאן, ואפשר לשנות אותו בכל רגע", then the deck opens on the next card ("זלמן") with the same header and pill as before. The choice lives only as a banner at the top of "השמות שלי". The ending of the whole journey isn't designed: the next visit starts as if nothing was decided. Screenshot: `audit/JRN/j3-06-after-decision-webkit.png`, `audit/JRN/j3-07-deck-after-choice-webkit.png`
- **Options:**
  1. A quiet chip on the deck header
  2. Open lists on a return visit
  3. Leave as is
- **Recommendation:** Option 1.

### OD-019: A first match made from the name sheet shows only after the sheet closes

- **Source:** JRN-ALL-03
- **Why it's the owner's:** §3.2: changes when the match moment happens
- **Evidence:**
  - `JRN-ALL-03` (P2, `/names?sheet=name&n=אליעזר`, shared space, the partner already saved the name; "שמירה" in): saving shows the toast "נשמר: אליעזר" and the pressed "שמירה". The match itself (`MatchSheet.tsx` `MatchGate`) waits while any other sheet is open ("Waits for any other sheet or dialog to close"), and the matches refetch comes 2 s after the vote (`useMatches.ts`). At 4 s the sheet still looks like a plain save in Safari (`j2s-06`). "יש התאמה" appears only when the person closes the sheet, which they may do much … Screenshot: `audit/JRN/j2c-03-match-webkit.png`, `audit/JRN/j2s-05-saved-1s-sim.png`, `audit/JRN/j2s-06-saved-4s-sim.png`, `audit/JRN/j2s-07-match-sim.png`
- **Options:**
  1. Close the sheet and open the match
  2. Keep the sheet and show the match on close
- **Recommendation:** Option 1.

### OD-020: A new device shows the first-time intro to a long-time user

- **Source:** JRN-ALL-06
- **Why it's the owner's:** §3.2: changes when a flow step shows
- **Evidence:**
  - `JRN-ALL-06` (P3, Safari `localhost:3100`, QA user 1 (onboarded, in a shared space), signed in again after t): the intro is marked seen per device (`nest-names:<user>:introSeen` in local storage), so a returning person on a new phone or after clearing the browser gets "שם אחד בכל פעם", the three points and the surname field before their deck. It also says "שם ששניכם שמרתם יופיע בהתאמות" to someone who already has matches. Screenshot: `audit/JRN/jrn-signin-after-u1.png`
- **Options:**
  1. Skip the intro when the space already has votes
  2. Leave as is
- **Recommendation:** Option 1 (the surname field also lives in settings).

### OD-021: Lists always open on 'שמרתי'

- **Source:** JRN-ALL-09
- **Why it's the owner's:** §3.2: changes navigation in a flow
- **Evidence:**
  - `JRN-ALL-09` (P3, `/names/lists` from the deck pill, shared space with matches): the pill reads "השמות שלי: 1 נשמרו" and opens the saved tab; the matches, the shared result both people came back for, need one more tap. Nothing on the deck says how many matches there are. Screenshot: `audit/JRN/j3-01-return-deck-webkit.png`, `audit/JRN/j2c2-03-matches-tab-webkit.png`
- **Options:**
  1. Open on 'התאמות' when shared with ≥ 1 match
  2. Leave as is
- **Recommendation:** Option 1.

### OD-022: No way to remove an own background photo

- **Source:** NP-UX-003
- **Why it's the owner's:** §3.2: adds a control (§3.1.4)
- **Evidence:**
  - `NP-UX-003`: names-pwa ux-insights (QA1-E): once an own photo is saved the background sheet offers 'החלפת התמונה' but no way to remove it; the Blob stays in IndexedDB. Still true (no 'הסרת התמונה' in `src/`). Shot: `scripts/ralph/qa/names-pwa/shots/qa1-e-own-sheet-dark.png`.
- **Options:**
  1. A 'הסרת התמונה' link next to 'החלפת התמונה'
  2. Leave as is
- **Recommendation:** Option 1: a private photo on a shared device should be removable.

### OD-023: 'בעלייה' never shows a name with the current data

- **Source:** NP-UX-005
- **Why it's the owner's:** §3.2: name content and filters (§3.1.3, §3.1.5)
- **Evidence:**
  - `NP-UX-005`: names-pwa ux-insights (QA1-F): none of the content names is rising, so 'בעלייה' always leads to the empty-filter state. The data is right.
- **Options:**
  1. Wait for more names
  2. Hide a filter value with zero names
  3. Leave as is
- **Recommendation:** Wait for more names; the data is right.

### OD-024: 'Did you mean …' for one-letter-off custom names

- **Source:** NP-UX-006
- **Why it's the owner's:** §3.2: a new feature
- **Evidence:**
  - `NP-UX-006`: names-pwa ux-insights (QA1-G): 'נֹעַם' strips to a new custom name 'נעם' instead of the data name נועם.
- **Options:**
  1. Suggest the data name when the stripped name is one vav/yod away
  2. Leave as is
- **Recommendation:** Later run.

### OD-025: Root-sharing and biblical-spelling 'similar names'

- **Source:** ND-UX-002, ND-UX-004
- **Why it's the owner's:** §3.2: name content (§3.1.5)
- **Evidence:**
  - `ND-UX-002`: name-detail ux-insights (QA1-C): מוחמד lists אחמד, מחמוד, מחמד; אריאל lists אריה (root siblings). Shot: `scripts/ralph/qa/name-detail/shots/qa1-c-sim-muhammad-3.png`.
  - `ND-UX-004`: name-detail ux-insights (QA1-E): אראל next to אריאל is a form only by a biblical spelling. Shot: `scripts/ralph/qa/name-detail/shots/qa1-e-sim-ariel-similar.png`.
- **Options:**
  1. Owner spot check: keep, relabel 'שמות מאותו מקור', or drop the pairs
  2. Leave as is
- **Recommendation:** Owner spot check in a content pass.

### OD-026: Service worker network-first fetches have no timeout

- **Source:** ND-UX-006
- **Why it's the owner's:** §3.2: public/sw.js is outside this run's scope (§3.1.9) and changes the earlier caching rule
- **Evidence:**
  - `ND-UX-006`: name-detail ux-insights (QA1-K): with a proxy that resets every connection the deck showed no card for 18+ s; real offline works. Shot: `scripts/ralph/qa/name-detail/shots/qa1-k-sim-offline-tamar2.png`.
- **Options:**
  1. A 3 s timeout before the cache
  2. Leave as is
- **Recommendation:** Option 1 in a later run; the deck's new data-failure state covers the visible part.

<!--
### OD-000: title

- **Source:** finding IDs / earlier UX IDs
- **Why it's the owner's:** §3.2 …
- **Evidence:** what was seen, screenshot paths
- **Options:** 1. … 2. … 3. leave as is
- **Recommendation:** …
-->
