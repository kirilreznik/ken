# JRN · ALL: three journeys across the whole app

Skills: `journey-mapping` (`SKILL.md`, references read: `customer-journey-maps.md`, `flow-diagramming-visual-vocabulary.md`, `service-blueprints.md`, `experience-maps-and-models.md`, `alignment-workshops.md`) and `ux-strategy` (`SKILL.md`, references read: `jobs-to-be-done.md`, `metrics-and-measurement.md`, `outcomes-and-opportunities.md`, `value-proposition.md`, `competitive-analysis.md`).

Assumptions where the skills would ask: one persona per journey (journey-mapping "one persona, one scenario"): (1) a first-time parent alone on a phone, (2) the partner who receives the link and the person who sent it, (3) a returning person in a shared choice. Current state only (journey-mapping "always map current state first"). Feelings are inferred from what the screens show and when, not from interviews: these are proto-maps (journey-mapping: "If you haven't talked to users, label it…"). The opportunities stay inside the PRD's guardrails; anything that changes a flow is `owner`.

Skipped steps (need people or services): interviews, analytics review, alignment workshop, competitive research (journey-mapping Phase 2/4, ux-strategy Discover/Analyze). The `names_events` analytics exist but reading them is out of scope (no backend access in this run).

**How it was walked (2026-11-08, real backend "Nest (EU)", dev server :3000 for Playwright, production :3100 for Safari).** Scripts (gitignored): `shots/jrn-j1.mjs` (journey 1), `jrn-j2.mjs a|b|c|c2` (journey 2), `jrn-j3.mjs` (journey 3), `jrn-state.mjs` (votes, matches, onboarding per QA user; `--delete-since`), `jrn-u3.mjs save|clear|restore|meta [n]` (onboarding metadata), `jrn-sim-signin.mjs send|code` (Safari sign-in, 1 email each). Playwright WebKit iPhone 15 for every step; the OTP send was answered in the page (no email) and the code came from admin `generate_link`. Simulator Mobile Safari (iPhone 17 Pro, iOS 26.5) for every journey: user 3 on `127.0.0.1:3100` (its own storage), user 1 on `localhost:3100`; two real code emails to the QA addresses. Shots: `scripts/ralph/qa/name-polish/shots/audit/JRN/j1-*`, `j1s-*`, `j2*-*`, `j2s-*`, `j3-*`, `j3s-*`.

**Clean-up (verified with `jrn-state.mjs`):** all test votes deleted (user 3 "רחל", users 1 and 2 "אליעזר"), user 3's onboarding metadata restored from `/tmp/jrn-meta3.json`, user 2's back to none (it had none before), the chosen name cleared in Safari through the banner's "ביטול". All three users are back at 0 votes and 0 matches. Safari's `127.0.0.1:3100` is now signed in as user 3 (it was signed out), and `localhost:3100` is signed in as user 1 again (its session had lapsed).

## Journey 1: first visit to first save (QA user 3, onboarding cleared)

Scope: "A first-time parent, alone, trying to find out whether this is worth their time, from opening the link to the first saved name."

| Phase → | Arrive | Sign in | Set up | Learn | First card | First save |
|---|---|---|---|---|---|---|
| Screen | `/names/welcome` | `/names/sign-in/email` (email step, code step) | `/names/onboarding` | `/names/intro` | `/names` | `/names` → `/names/lists` |
| Actions | Reads the sample card "זיו", picks a sign-in | Types the email, opens the mail app, types 6 digits (auto-submits) | Types a name, ticks 18+ and terms | Reads 3 points, skips the optional surname, taps "התחלת בחירה" | Reads "רחל" | Taps "שמירה"; opens "השמות שלי" |
| Thinking | "Is this the real thing or a sign-up wall?" | "Why do I need an account to look at names?" | "Who sees this name?" ("השם יוצג בבחירה משותפת.") | "Didn't I just press 'התחלת בחירה'?" | "Ah, real numbers." | "Where did it go?" |
| Feeling | 🙂 curious (the sample card is the product) | 😐 patient | 😐 dutiful | 😟 delayed | 😄 rewarded | 🙂 / 😐 unsure it counted |
| Pain points | Email option under Google, below the fold on short screens (IMP-C-G1 lists it) | Switching apps for the code | Two consent boxes in a row before any value | Pressing the same "התחלת בחירה" twice (IMP-C-G1-13); in Safari the pinned button sat under the toolbar (JRN-ALL-04) | none | Only the pill's count changes 0 → 1 (JRN-ALL-08) |
| Taps / time (WebKit) | 0 | 2 taps + typing | 3 taps | 1 tap | 0 | 1 tap |

Measured: 6 screens and 7 taps (plus the email, the code and a display name) from the welcome screen to the first card; 15.8 s end to end in automation. Moment of truth: the first card (deck order and the card are owner decisions; the card earns it). The time to the first value is the longest stretch with no names: three form screens and the intro.

Safari notes: the welcome screen showed both sign-in buttons above Safari's toolbar on the 402 × 874 iPhone 17 Pro; after typing the display name, the first two taps on the checkboxes landed on nothing while the keyboard closed and the card moved down ~37 pt (not filed: cliclick taps, recheck by hand in QA); the intro arrived with its pinned button under the toolbar (JRN-ALL-04).

## Journey 2: invite a partner to the first match (QA users 1 and 2, already in one space; user 2 not onboarded)

Scope: "Two parents, from one sending the link to both seeing the first name they agree on." User 2 already was a member, so the join ended on "כבר משתתפים בבחירה הזו." instead of "הצטרפת"; the joined state is in the G1 baseline shots (mocked).

| Phase → | Find the invite | Send | Receive | Sign in and set up | Start choosing | First match |
|---|---|---|---|---|---|---|
| Who | Sender (user 1) | Sender | Partner (user 2) | Partner | Partner | Sender |
| Screen | deck → "השמות שלי" → header icon "הזמנה לבחירה משותפת" | `/names/invite` | `/names/join/<code>` signed out | email, code, onboarding, join outcome | `/names/intro` → `/names` | name sheet → `?sheet=match` → `/names/lists?tab=matches` |
| Actions | Taps the pill, then an icon-only button | "שליחת קישור הזמנה" or "העתקת הקישור" | Reads "קיבלת הזמנה לבחור שם ביחד ב־Nest" over the sample card | Same as journey 1 | "להמשיך לבחור" → intro → "התחלת בחירה" | Saves the partner's name from its sheet, closes the sheet, sees "יש התאמה" |
| Thinking | "Where do I invite?" | "One use only, OK." | "Who sent this?" (CRIT-G1-06) | "Again a form." | "Wasn't I continuing?" | "Did that just match?" |
| Feeling | 😐 searching | 🙂 | 🙂 invited | 😐 | 😟 delayed | 😐 then 😄 |
| Pain points | Invite is 2 taps deep or waits for the deck's invite pause (after 5 saves) | none | No inviter's name | 4 screens before the space | The join outcome's button leads to the intro, whose button says "התחלת בחירה" again (JRN-ALL-05) | The match waits for the sheet to close (JRN-ALL-03) |

Measured: sender 2 taps to the invite link. Partner: 7 screens and 8 taps (plus email, code, name) from the link to the first card; 14.8 s in automation. Moment of truth: "יש התאמה". It is calm and on-brand (no green, no confetti), but when the match is made from the name sheet it comes only after the sheet is closed, by any route.

## Journey 3: a return visit to "בחרנו שם" (QA user 1, one match)

Scope: "A parent in a shared choice comes back later, ready to settle on the name they both saved."

| Phase → | Come back | Find the matches | Decide | After |
|---|---|---|---|---|
| Screen | `/names` (new page load) | "השמות שלי" → tab "התאמות" | row "⋮" → "בחרנו בשם אליעזר" → `?sheet=decision` | `/names/lists` banner "השם שבחרנו"; `/names` |
| Actions | Sees the next card "זלמן" | Taps the pill, then the tab | Opens the row menu, picks the only item | Taps "חזרה לרשימה"; later opens the app again |
| Thinking | "Where are our names?" | "There it is." | "How do I mark this as the one?" | "Does my partner see it? Why is it still asking me to swipe?" |
| Feeling | 😐 | 🙂 | 😟 hunting, then 😄 | 🙂 then 😐 |
| Pain points | The deck shows the saved count only; the match is 2 taps away (JRN-ALL-09) | Lists open on "שמרתי" | The decision hides behind "⋮" (JRN-ALL-01) | The deck carries no trace of the choice (JRN-ALL-02); the choice is on this device only (CRIT-G3-02) |

Measured: 4 taps from the deck to the decision sheet (pill, tab, ⋮, item), 11.9 s in automation. The decision sheet has 5 ways out ("סגירה", Nest's opt-in, "מה זה Nest?", "חזרה לרשימה", "לשנות את הבחירה"); its own words carry an exclamation mark (IMP-C-G2-03). In Safari the decision sheet scrolls: "לשנות את הבחירה" is below the fold, and the Nest card's ink button is the heaviest control on the first screen (its contrast and placement are A11Y-G2's and IMP-C-G2-08's). Signing in again on Safari as user 1, who finished onboarding long ago, showed the first-time intro (JRN-ALL-06).

## Findings

### JRN-ALL-01: Choosing the name, the app's end goal, sits behind a row's "⋮" menu

- **Screen and state:** `/names/lists?tab=matches` (and "שמרתי"), shared space with a match; return visit
- **Browser:** webkit-iphone · sim-safari
- **What's wrong:** a returning person who wants to mark "the one" has no visible action on the rows: the row is a plain card with an outlined "⋮", and the menu's only item is "בחרנו בשם אליעזר". The other way is to finish a duel. From the deck: pill → tab → ⋮ → item, 4 taps, the last two behind an icon with no label on screen.
- **Rule it breaks:** `journey-mapping` · `SKILL.md` Moments of Truth · "Flag moments of truth on every diagram — They should be the most visually prominent elements"; `ux-strategy` · `references/jobs-to-be-done.md` job map · "Conclude — End the process, follow up" (the job is to settle on a name; its last step is the least visible).
- **Severity:** P2
- **Effort:** M
- **Proposed change:** options for the owner: (a) a visible text action on each match row ("בחרנו בשם הזה") instead of the menu; (b) on the match sheet and the name sheet of a match, a secondary "בחרנו בשם הזה"; (c) keep as is and only label the "⋮" ("עוד") so it reads as a menu. Recommendation: (a) on the matches tab only. Related: IMP-C-G3-20 (menu order), IMP-C-G3-22 (chosen banner).
- **Guardrail:** owner (§3.2: changes a flow and adds an entry point)
- **Screenshot:** `audit/JRN/j3-04-row-menu-webkit.png`, `audit/JRN/j3s-01-matches-sim.png`, `audit/JRN/j3s-02-row-menu-sim.png`

### JRN-ALL-02: After choosing, the deck and the next visit show no trace of the choice

- **Screen and state:** `/names` after "בחרנו בשם אליעזר"; a later page load
- **Browser:** webkit-iphone
- **What's wrong:** the decision sheet says "השם נשמר כאן, ואפשר לשנות אותו בכל רגע", then the deck opens on the next card ("זלמן") with the same header and pill as before. The choice lives only as a banner at the top of "השמות שלי". The ending of the whole journey isn't designed: the next visit starts as if nothing was decided.
- **Rule it breaks:** `journey-mapping` · `SKILL.md` Moments of Truth · "Peak-End Rule — People remember the peak emotional moment and the ending. Design both deliberately"; `references/customer-journey-maps.md` · "Include pre-product and post-product phases (what happens … after they stop using you)".
- **Severity:** P3
- **Effort:** M
- **Proposed change:** options for the owner: (a) a quiet line or chip on the deck header when a name is chosen ("בחרנו: אליעזר"), opening the decision sheet; (b) open `/names` on the lists screen when a name is chosen; (c) leave it (choosing can be undone and the deck stays useful). Recommendation: (a), no new screen. Related: CRIT-G3-02 (the choice is stored on this device only, so the partner doesn't see it either).
- **Guardrail:** owner (§3.2: adds UI to the deck and changes what a return visit shows)
- **Screenshot:** `audit/JRN/j3-06-after-decision-webkit.png`, `audit/JRN/j3-07-deck-after-choice-webkit.png`

### JRN-ALL-03: A first match made from the name sheet is announced only after the sheet is closed

- **Screen and state:** `/names?sheet=name&n=אליעזר`, shared space, the partner already saved the name; "שמירה" in the sheet footer
- **Browser:** webkit-iphone · sim-safari
- **What's wrong:** saving shows the toast "נשמר: אליעזר" and the pressed "שמירה". The match itself (`MatchSheet.tsx` `MatchGate`) waits while any other sheet is open ("Waits for any other sheet or dialog to close"), and the matches refetch comes 2 s after the vote (`useMatches.ts`). At 4 s the sheet still looks like a plain save in Safari (`j2s-06`). "יש התאמה" appears only when the person closes the sheet, which they may do much later, or navigate away from. The partner's journey ends in its biggest moment, and that moment comes late and detached from the action that caused it.
- **Rule it breaks:** `journey-mapping` · `SKILL.md` Time as a Design Object · "Timing … Flag moments where bad timing creates pain"; Moments of Truth · "Look for high emotional intensity".
- **Severity:** P2
- **Effort:** M
- **Proposed change:** options for the owner: (a) when a save from the sheet completes a match, close the name sheet and let the match sheet open (the existing gate then runs); (b) keep the sheet open and change its toast to name the match once the refetch finds it ("יש התאמה: אליעזר"), with the match sheet still shown on close; (c) leave it. Recommendation: (a), it reuses the existing match sheet and keeps "shown once". Files: `detail/` sheet save handler, `MatchSheet.tsx`, `swipe/SwipeScreen.tsx`. Check with INT-G2 (sheet close motion) and MOT-G2 (sheet-to-sheet).
- **Guardrail:** owner (§3.2: changes when the match moment happens in a flow)
- **Screenshot:** `audit/JRN/j2c-03-match-webkit.png`, `audit/JRN/j2s-05-saved-1s-sim.png`, `audit/JRN/j2s-06-saved-4s-sim.png`, `audit/JRN/j2s-07-match-sim.png`

### JRN-ALL-04: In Safari, the intro's pinned "התחלת בחירה" arrived under the toolbar after onboarding

- **Screen and state:** `/names/intro` right after onboarding (client navigation, after the keyboard was used on the name field), Safari's bottom bar expanded
- **Browser:** sim-safari (not in Playwright)
- **What's wrong:** the intro's sticky footer (`Intro.tsx:152`, `sticky bottom-0 … pb-[max(16px,env(safe-area-inset-bottom))]`) showed only its top edge above Safari's floating toolbar, so a tap at the usual place (201, 731) hit nothing; one small scroll collapsed the toolbar and the button showed (`j1s-10`). Reaching the same intro from the sign-in callback (user 1, full page load) showed the button whole above the toolbar (`jrn-signin-after-u1.png`). The cause isn't pinned down: the difference is the arrival route and the keyboard before it. The first-run person, at the step with the most friction, has the only button hidden.
- **Rule it breaks:** `journey-mapping` · `references/customer-journey-maps.md` Actions · "Include workarounds and unexpected behaviors, not just the happy path"; `mobile-native` (named for the fix) · "bottom-pinned UI … test on real hardware".
- **Severity:** P2
- **Effort:** S
- **Proposed change:** reproduce in the Simulator (onboarding with the keyboard → intro), then in `src/components/names/Intro.tsx` (and `Onboarding.tsx`'s submit): scroll the window to the top before `router.replace` to the intro, and/or blur the active field first so Safari returns the viewport before the route changes. Verify the button is fully visible on arrival in Safari, WebKit and Chromium at 390 × 844, 375 × 667 and 320. Merge with IMP-C-G1-08 (same footer) and NATIVE-ALL-08 in triage.
- **Guardrail:** polish
- **Screenshot:** `audit/JRN/j1s-08-intro-sim.png`, `audit/JRN/j1s-10-intro-scrolled-sim.png`, `audit/JRN/jrn-signin-after-u1.png`

### JRN-ALL-05: An invited partner passes 7 screens before the first card, and two buttons in a row promise to start

- **Screen and state:** `/names/join/<code>` signed out → email → code → onboarding → join outcome → intro → deck
- **Browser:** webkit-iphone
- **What's wrong:** after onboarding, the partner lands on the join outcome ("כבר משתתפים בבחירה הזו." / "הצטרפת…") with one button, "להמשיך לבחור" (or "להתחיל לבחור"). It doesn't continue: it opens the intro, whose button is "התחלת בחירה". The onboarding button before them also says "התחלת בחירה" (IMP-C-G1-13). Three consecutive "start/continue choosing" buttons, the first two of which lead to more reading. A first-time person sees the same pair (onboarding → intro).
- **Rule it breaks:** `journey-mapping` · `SKILL.md` Types of Service Experience · "Transactional: Map the fewest possible steps. Every extra step is excise"; Expectation Gap · "Where does reality fall short?"
- **Severity:** P3
- **Effort:** S (labels) · M (flow)
- **Proposed change:** polish part (labels only, no flow change): the join outcome's button says where it goes, e.g. "המשך" for the outcome screen, with "התחלת בחירה" kept only on the intro, the one that starts; merge with IMP-C-G1-13 and COPY-G1's label set in triage. Owner part: for a partner who just finished onboarding through an invite, skip the separate join outcome and show "הצטרפת לבחירה של …" as a line on the intro (fewer screens).
- **Guardrail:** polish (labels) · owner (§3.2: removing a screen from a flow)
- **Screenshot:** `audit/JRN/j2b-05-after-onboarding-webkit.png`, `audit/JRN/j2b-06-next-0-webkit.png`, `audit/JRN/j2b-07-next-1-webkit.png`

### JRN-ALL-06: Signing in again on a new device shows the first-time intro to someone who has been choosing for weeks

- **Screen and state:** Safari `localhost:3100`, QA user 1 (onboarded, in a shared space), signed in again after the session lapsed
- **Browser:** sim-safari
- **What's wrong:** the intro is marked seen per device (`nest-names:<user>:introSeen` in local storage), so a returning person on a new phone or after clearing the browser gets "שם אחד בכל פעם", the three points and the surname field before their deck. It also says "שם ששניכם שמרתם יופיע בהתאמות" to someone who already has matches.
- **Rule it breaks:** `journey-mapping` · `SKILL.md` Time as a Design Object · "Frequency … Routine needs efficiency; rare needs guidance"; `ux-strategy` · `references/jobs-to-be-done.md` Circumstances · "Temporal — first time vs. repeat".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** options for the owner: (a) skip the intro when the account already has votes in its space (the votes are read on the deck anyway); (b) keep it (the surname field lives there and the surname is per device). Recommendation: (a), and leave the surname to settings for returning people.
- **Guardrail:** owner (§3.2: changes when a flow step shows)
- **Screenshot:** `audit/JRN/jrn-signin-after-u1.png`

### JRN-ALL-07: The rate-limit line stays on the email step after the wait is over and says "minutes" for a one-minute wait

- **Screen and state:** `/names/sign-in/email`, a second send for the same address within 60 s (going back to fix the address, or a second device)
- **Browser:** sim-safari
- **What's wrong:** Supabase refused the send ("נשלחו יותר מדי קודים. אפשר לנסות שוב בעוד כמה דקות."). After 70 s the line was still on screen and pushed the button 87 pt down; the next send worked at once. So the message overstates the wait, and stays after it's over. (The wording itself is COPY-G1-05.)
- **Rule it breaks:** `journey-mapping` · `SKILL.md` Time as a Design Object · "Duration … Flag steps where perceived wait exceeds actual wait".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `src/components/names/EmailSignIn.tsx` clear the rate-limit error when the address changes or on the next tap of "שליחת קוד" (before the request), and in `src/lib/names/authErrors.ts` say "בעוד דקה" for the send limit (the per-address window is 60 s); keep COPY-G1-05's wording for the rest. Update the test that pins the message.
- **Guardrail:** polish
- **Screenshot:** `audit/JRN/j1s-04-code-sim.png`, `audit/JRN/jrn-signin-send2-u3.png`

### JRN-ALL-08: The first save gives no visible sign of where the name went

- **Screen and state:** `/names`, first ever "שמירה" (solo or shared)
- **Browser:** webkit-iphone · sim-safari
- **What's wrong:** the card moves on and the header pill's number changes from 0 to 1, with no motion; a screen reader hears "השם רחל נשמר. השם הבא: אלמה". The intro promised that saved names can be narrowed down in a duel, but the first save doesn't point at the pill where they wait. Saves from the name sheet get a toast; deck saves don't (by design, they'd be noisy on every swipe).
- **Rule it breaks:** `journey-mapping` · `SKILL.md` Moments of Truth · "Look for first impressions — first use"; `ux-strategy` · `SKILL.md` North Star · "Users reaching 'aha moment'".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** a short count change on the pill (`swipe/` header pill: the number scales 1 → 1.15 → 1 over ≤ 300 ms with a motion token, none under reduced motion) on every save, which reads as "it went here". No new copy, no new element. Check with MOT-G2 (motion tokens, MOT-G2-03) before building.
- **Guardrail:** polish
- **Screenshot:** `audit/JRN/j1-09-deck-webkit.png`, `audit/JRN/j1-10-after-save-webkit.png`, `audit/JRN/j1s-12-after-save-sim.png`

### JRN-ALL-09: In a shared choice, every return visit opens on "שמרתי", one more tap from the matches

- **Screen and state:** `/names/lists` from the deck pill, shared space with matches
- **Browser:** webkit-iphone · sim-safari
- **What's wrong:** the pill reads "השמות שלי: 1 נשמרו" and opens the saved tab; the matches, the shared result both people came back for, need one more tap. Nothing on the deck says how many matches there are.
- **Rule it breaks:** `journey-mapping` · `references/customer-journey-maps.md` Pain Points · "Navigating …"; `ux-strategy` · `SKILL.md` HEART · "Task success: completion rate, time-on-task".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** options for the owner: (a) open lists on "התאמות" when the space is shared and has at least one match; (b) leave "שמרתי" as the default (it holds everything the person saved, matches included). Recommendation: (b) unless the owner sees people looking for matches; low value against changing a default.
- **Guardrail:** owner (§3.2: changes navigation in a flow)
- **Screenshot:** `audit/JRN/j3-01-return-deck-webkit.png`, `audit/JRN/j2c2-03-matches-tab-webkit.png`

## Re-seen, not re-filed

CRIT-G1-06 (join never names the inviter), IMP-C-G1-13 and CRIT-G1-02 (button labels), IMP-C-G1-04 (intro X drops the surname), CRIT-G3-02 (the choice is on this device only), IMP-C-G2-03 (exclamation mark on the decision sheet), A11Y-G2 eyebrow contrast on the match and decision sheets, COPY-G2-11 ("לשנות את הבחירה" clears the choice), COPY-G1-05 (rate-limit wording), IMP-C-G3-20 and -22 (row menu order, chosen banner), A11Y-G2's pause invite description.
