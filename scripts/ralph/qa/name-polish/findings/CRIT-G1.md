# CRIT · G1: Entry (welcome, sign-in, callback, onboarding, intro, join, invite, offline, goodbye, 404, unconfigured)

Run 2026-11-07 by US-A-CRIT-G1 at `b7205f3` (no app code change since the baselines).

Skill: `design-critique` (`.claude/skills/design-critique/SKILL.md`; references read: `references/heuristics-and-laws.md`, `references/interaction-design-principles.md`, `references/visual-design-principles.md`, `references/design-patterns-catalog.md` (input, content, feedback and invite patterns)) and `design-critique-quick` (`SKILL.md`, its five-part framework as a second pass). Method: the skill's 9 steps (context → 5-second scan → Nielsen pass → UX laws → posture/excise/orchestration → patterns → IA → content → synthesis), then the quick framework (first impression, usability, hierarchy, consistency, accessibility) on every state.

Assumptions where the skill would ask: `design-critique-quick` says "ask the user to describe or share their design" and asks for the stage; the design is the live app (screenshots below) and the stage is "live product" (the skill's calibration table: "Everything — full heuristic evaluation"). Its 0–4 severity is mapped to the PRD's scale: 4 → P1, 3 → P2, 1–2 → P3. Skipped steps (need a service): the Figma pull and the `~~design tool` / `~~user feedback` connectors (`CONNECTORS.md` doesn't exist here). The skill's "recruit 3–5 evaluators" is one evaluator here; the earlier G1 lenses (IMP-C, IMP-A, PRO) stand in as the other evaluators, and their findings are cross-referenced instead of repeated.

Evidence: `scripts/ralph/qa/name-polish/shots/audit/CRIT-G1/`.
- `-webkit` (Playwright WebKit iPhone 15) and `-chromium` (Pixel 7), every G1 state from `scores.md` "Screens G1", taken today on the dev server with `us005-g1.mjs` (`G1_OUT` set to this folder). The gitignored script now retries a WebKit `goto` that is "interrupted by another navigation" (offline → goodbye), so the full WebKit set ran, onboarding included.
- `-sim`: the US-005 Safari set (same app code). `-fresh-sim`: 9 signed-out states taken again today in the Simulator on :3100 (`us005-sim.mjs out`); they match the baseline.
- `probe-code-after-paste-*.png` and the numbers in -01: `shots/crit-g1-probe.mjs` (signed out, OTP send and verify mocked, nothing sent).
- Narrow widths: `shots/baseline/G1/*-webkit375.png`, `*-webkit320.png`.

## Critique summary

**Context (step 1).** Who: an expecting parent or a relative they invite, on a phone, one-handed, first visit. What: get in and start choosing in under a minute. Where: the whole entry journey, from first visit and from an invite link, plus error recovery (wrong code, expired invite, offline, 404). Constraints: the owner's brand and boards (PRD §3.1), magic-code and Google sign-in only, sign-ups that can be closed.

**First impression (step 2, 5 seconds).** Welcome: the eye lands on the זיו preview card, then "בחירת שם"; the primary action is below the fold on an iPhone 15 viewport (already IMP-C-G1-01). Sign-in, code, callback, onboarding, join outcomes and goodbye pass the 5-second test: one glass panel, one title, one ink button. Offline, 404 and unconfigured read as "something broke" before they read as Nest (already IMP-C-G1-11/-12).

**Posture and excise (step 5).** Entry is transient: fast in, fast out, which fits the single-task panels. Excise is low (email → 6 digits, auto-submit on the 6th; onboarding is one panel). The two excise spots: recovering from a wrong code (-01) and Back from the code step re-typing the address (IMP-C-G1-17).

**Patterns (step 6).** Account registration is deferred well (a preview card before sign-up, no account data beyond a display name). Wizard: onboarding → intro are two steps with no "steps left", which is fine for two. Invite friends: explicit consent, a share sheet, no contacts access. Undo vs confirm: nothing destructive in G1.

**IA and labels (step 7).** Titles match what was tapped ("כניסה עם קוד במייל" → "כניסה עם קוד במייל"). One labelling slip runs across the group: the deck is reached by five different labels (-02).

**Content (step 8).** Usable, useful and responsible: plain, warm, no blame ("הקוד לא נכון או שפג תוקפו"). Slips: the closed notice next to live sign-in buttons (-04), the onboarding hint that points by position (-03), and the copy issues already filed (IMP-C-G1-02, -03, -05, -09, -20).

**What works well (quick framework).**
- One primary ink action per panel, secondary actions as glass or underlined text: clear Von Restorff hierarchy everywhere except welcome at short heights.
- Sign-in input is forgiving (Postel's Law): spaces and dashes in the code are stripped, the address is trimmed, the code auto-submits.
- Onboarding's disabled button stays focusable and says why (H5 + H9), and the opt-in is unticked and marked "לא חובה" (Good Defaults without the dark-pattern misapplication).
- The invite screen shows the link's expiry and that it works once (H1), and who is already in (H6).

**Accessibility (quick framework).** Contrast, targets and readability are covered in depth by IMP-A-G1 and PRO-G1 (countdown 2.2:1 on the orange photo, PRO-G1-01; placeholders 2.2:1, IMP-C-G1-06; 15 px inputs, IMP-A-G1-02). Nothing new here.

## Findings

### CRIT-G1-01: After a wrong code, a new code typed or pasted into the field is dropped

- **Screen and state:** `/names/sign-in/email`, code step after a wrong code
- **Browser:** webkit-iphone · chromium-pixel (probe); the logic is the same in Safari
- **What's wrong:** after the verify fails, the field keeps the six wrong digits with the caret at the end, and "כניסה" stays enabled for a code already known to be wrong. `cleanCode` keeps the *first* six digits (`src/lib/names/resend.ts:30`), so a typed digit or a pasted new code at the caret is thrown away: the probe typed "7" and then pasted "654321", and the field still read the old code, with no second verify (`verifies: 1` in both engines). To enter the new code from the email, the person has to delete six digits first, and nothing says so. With IMP-C-G1-02 (the message says to request a new code while resend is locked), the recovery path after a wrong code is the weakest moment of sign-in.
- **Rule it breaks:** `design-critique` · `SKILL.md` · Orchestration "Design for the probable — optimize for the 80% case" (the probable next step is typing or pasting the right code); Excise "Physical work" (unnecessary keystrokes); UX laws "Postel's Law — Is input forgiving?"; H9 "One-click recovery".
- **Severity:** P2
- **Effort:** S
- **Proposed change:** in `EmailSignIn.tsx` `verify()`'s failure path, clear the code (`setCode("")`) and keep focus in the field, so typing, pasting or iOS's one-time-code fill starts fresh and "כניסה" is disabled until six new digits are there (the error line stays until the field changes, as now). Alternatively select the field's text on failure (`input.select()` from `CodeInput` when `invalid` turns on). Add a unit test for the clear and a Playwright check of type/paste after a wrong code. Do it with IMP-C-G1-02 (same screen).
- **Guardrail:** polish
- **Screenshot:** `audit/CRIT-G1/signin-code-wrong-webkit.png`, `audit/CRIT-G1/probe-code-after-paste-webkit.png`, `audit/CRIT-G1/probe-code-after-paste-chromium.png`

### CRIT-G1-02: The way into the deck has five different labels

- **Screen and state:** onboarding, intro, join (joined, already a member, expired), offline, 404, the error page
- **Browser:** all (source + shots)
- **What's wrong:** one destination, `/names`, is labelled "התחלת בחירה" (`Onboarding.tsx:239`, `Intro.tsx:154`), "להתחיל לבחור" (`JoinScreen.tsx:173`, joined), "להמשיך לבחור" (`JoinScreen.tsx:173`, already a member), "לבחירת שמות" (`JoinScreen.tsx:110`, expired; also the lists and duel empty states in G3) and "לבחירת שם" (`not-found.tsx:13`, `error.tsx:27`, `offline/page.tsx:21`). Noun and infinitive forms are mixed for the same act, and "לבחירת שם" / "לבחירת שמות" differ by one letter. The first-time vs returning distinction ("להתחיל" / "להמשיך") is useful; the rest is noise.
- **Rule it breaks:** `design-critique` · `references/visual-design-principles.md` · Consistency, "Verbal — Same action = same label"; `references/heuristics-and-laws.md` · H4 "Same action, same label everywhere"; `SKILL.md` Content "Create a controlled vocabulary. One label per concept".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** two labels, by meaning: "התחלת בחירה" for the first entry (intro, join joined) and "לבחירת שמות" for going back to the deck (join already a member and expired, offline, 404, error, and the G3 empty states that already use it). Update `JoinScreen.tsx`, `not-found.tsx`, `error.tsx`, `offline/page.tsx` and their tests. Onboarding's button is IMP-C-G1-13 ("שמירה והמשך"); merge the two in triage. COPY-G1 will see the same set.
- **Guardrail:** polish (§3.1.5: consistency of labels)
- **Screenshot:** `audit/CRIT-G1/join-joined-webkit.png`, `audit/CRIT-G1/join-expired-webkit.png`, `audit/CRIT-G1/offline-default-webkit.png`, `audit/CRIT-G1/404-default-webkit.png`, `audit/CRIT-G1/intro-top-webkit.png`

### CRIT-G1-03: Onboarding's required and optional boxes look the same, and the hint points by position

- **Screen and state:** `/names/onboarding`, empty form
- **Browser:** all
- **What's wrong:** the three checkboxes (age, terms, the store opt-in) sit in one evenly spaced column with the same style. Only the third has "לא חובה" in its small hint; the two required ones aren't marked. The button's hint then says "אפשר להתחיל אחרי שממלאים שם ומאשרים את שני הסעיפים הראשונים." (`Onboarding.tsx:27`), so the person has to count boxes to know which two.
- **Rule it breaks:** `design-critique` · `SKILL.md` Quick Critique Checklist, Forms "Required fields are marked — (H5: Error Prevention)"; H6 "Recognition rather than recall … instructions visible at the point of need"; UX laws "Law of Proximity — Are related items grouped together?"
- **Severity:** P3
- **Effort:** S
- **Proposed change:** in `Onboarding.tsx`, give the optional opt-in its own group (more space above it, or a `border-t border-line` with `pt-4`, existing tokens), and name what's missing in the hint instead of counting, e.g. "אפשר להתחיל אחרי שממלאים שם, מאשרים גיל ומסכימים לתנאים." The checkbox labels and their legal wording don't change. Update the onboarding test that reads the hint.
- **Guardrail:** polish (layout and hint copy only; the consent texts stay as they are)
- **Screenshot:** `audit/CRIT-G1/onboarding-default-webkit.png`, `shots/baseline/G1/onboarding-default-full-webkit.png`

### CRIT-G1-04: "Sign-ups aren't open" sits right above a dominant "כניסה עם Google"

- **Screen and state:** `/names/welcome?closed=1` and `/names/welcome?closed=1&join=…`
- **Browser:** all
- **What's wrong:** the notice appears after Supabase refused a *new* account. It says "ההרשמה עוד לא פתוחה. אפשר להשאיר אימייל בעמוד הבית ונעדכן כשנפתח." plus the link "להשארת אימייל", and directly under it the two sign-in buttons stay as they were, with the ink Google pill as the strongest element on the screen. Nothing says those buttons are for people who already have an account, so the most visible next step is to retry the same sign-up, which fails the same way.
- **Rule it breaks:** `design-critique` · `SKILL.md` Krug test "Satisficing: Will users pick the right thing? Is the primary action the most prominent element?"; `references/visual-design-principles.md` "Content hierarchy contradicts importance"; H9 "How to fix it — specific action to take".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** one clause in `SIGNUPS_CLOSED_MESSAGE` (`src/lib/names/auth.ts:17`, shown by `ClosedNotice.tsx`) that says who the buttons below are for, e.g. "…ונעדכן כשנפתח. כניסה לחשבון קיים עובדת כרגיל." Keep the waitlist link as the notice's action. Update the test that checks the message. (A different button hierarchy in the closed state would change the board's welcome layout, so it isn't proposed.)
- **Guardrail:** polish (clarity, same meaning)
- **Screenshot:** `audit/CRIT-G1/welcome-closed-full-webkit.png`, `audit/CRIT-G1/join-closed-full-webkit.png`

### CRIT-G1-05: The invite screen's two sections are built two ways, and the member names outrank their heading

- **Screen and state:** `/names/invite`, link ready and link failed
- **Browser:** all
- **What's wrong:** "קישור הזמנה" is a heading *inside* its white card, while "מי כבר כאן" is a heading *above* its card (`InviteScreen.tsx:159` vs `:220`). The member rows are `text-row-name` (17 px, weight 800), so the names are larger and heavier than both section headings (`text-card-title`, 15 px, 700) and than the link card's content. The eye goes to "QA (אני)" before the share button's section.
- **Rule it breaks:** `design-critique` · `references/visual-design-principles.md` Consistency "Cards/Containers: Same content order (title, description, metadata)" and Visual hierarchy "Content hierarchy contradicts importance"; UX laws "Law of Common Region — Are groups clearly bounded?"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `InviteScreen.tsx`, place both section headings the same way (both above their card, as settings does with its section labels), and set the member rows to `text-card-title` (or `text-body font-bold`), so the section heading → link → share button order reads first. Tokens only.
- **Guardrail:** polish
- **Screenshot:** `audit/CRIT-G1/invite-link-webkit.png`, `audit/CRIT-G1/invite-error-webkit.png`

### CRIT-G1-06: Join never names a person: not who invited you, not whose choice you joined

- **Screen and state:** `/names/join/[code]` signed out (invited) and joined
- **Browser:** all
- **What's wrong:** the invitation reads "קיבלת הזמנה לבחור שם ביחד ב־Nest" with no inviter, and the success state reads "הצטרפת." / "עכשיו שמות ששניכם שמרתם יופיעו בהתאמות." with no one named. For a relative opening a link from a message thread, the name of the person is the trust signal and the emotional peak of the flow; the invite screen already shows "מי כבר כאן", so the data exists, just not here.
- **Rule it breaks:** `design-critique` · `references/heuristics-and-laws.md` "Peak-End Rule — Peaks and endings define memory"; `SKILL.md` Krug test "Goodwill … Hiding information users want"; H1 "After submission, is there a clear success … message".
- **Severity:** P3
- **Effort:** M
- **Proposed change:** show the inviter's display name on the invitation and the member names on "הצטרפת." This needs the inviter's name before sign-in (a change to the `names_join` / invite RPC or a new read) and a `space_members` read on the join screen, i.e. backend data and a new call.
- **Guardrail:** owner (§3.2: needs a backend change and a new call; §3.1.4 "no new … data, backend calls")
- **Screenshot:** `audit/CRIT-G1/join-invited-full-webkit.png`, `audit/CRIT-G1/join-joined-webkit.png`

## Seen again, already filed (not repeated)

| What the critique found | Filed as |
|---|---|
| Welcome's buttons below the fold on short phones; the decorative card is the focal point | IMP-C-G1-01 |
| Wrong-code message says to request a new code while resend is locked | IMP-C-G1-02 (pair with CRIT-G1-01) |
| "שניכם" on invite, join and intro | IMP-C-G1-03 |
| Intro X drops a typed surname; sticky button over the focused field | IMP-C-G1-04, -08 |
| Expired session notice is one quiet line | IMP-C-G1-05 |
| Expired/used invite with no way forward | IMP-C-G1-09 |
| Onboarding has no way out | IMP-C-G1-10 (owner) |
| Offline, 404, unconfigured off-brand and unexplained; goodbye without wordmark | IMP-C-G1-11, -12, -19 |
| Onboarding's button repeats "התחלת בחירה" | IMP-C-G1-13 (merge with CRIT-G1-02) |
| Back from the code step skips the email step | IMP-C-G1-17 |
| Callback error offers only "חזרה לכניסה" | IMP-C-G1-20 |
| Secondary controls give no press feedback | PRO-G1-03, IMP-A-G1-08 |
| Countdown contrast and non-tabular digits | PRO-G1-01, -05 |

## Checked and clean

Titles match the action that led there on every screen; every panel has one primary action; every flow has a way back except onboarding (filed); system status during sign-in ("שולחים…", "נכנסים…", the callback spinner, the resend countdown) is visible within the Doherty threshold; error lines are plain, specific and blame-free; no dark patterns (unticked opt-in, no confirm-shaming, no contacts access on invite); the 320 and 375 px layouts reflow without overlap beyond what IMP-C filed.
