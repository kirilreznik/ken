# INT · G1: Entry (welcome, sign-in, callback, onboarding, intro, join, invite, offline, goodbye, 404, unconfigured)

Skills: `interaction-design` (`SKILL.md`, references `microinteractions.md`, `error-prevention.md`, `state-and-transitions.md`, `motion-principles.md`, example `interaction-audit-walkthrough.md`), `apple-design` (`SKILL.md`), `emil-design-eng` (`SKILL.md`: Review Format, Animation Decision Framework, Component Building Principles, Touch hover states, Review Checklist).

**Method** (the audit walkthrough's): (1) catalog every control on each G1 screen; (2) a state inventory per control (default, pressed, disabled, loading/busy, error, success), measured in the browsers; (3) gestures, timing and feedback along the sign-in, invite and join flows. The `emil-design-eng` Before/After table is at the end.

**How it was checked:**
- Probe `shots/int-g1-probe.mjs` on the dev server :3000, Playwright WebKit iPhone 15 and Chromium Pixel 7, every write mocked and answered (OTP send and verify held 1–1.2 s, the Google authorize redirect held 1.5 s, `names_invite`, `names_join`):
  - pressed state: hold each control and read `:active`, computed `scale`, `transform`, `opacity` and background
  - busy states with a double tap; typing during a verify; resend after 61 s (Playwright clock); copy feedback; step-change timing
  - output: `probe-<engine>.json`
- Simulator, Mobile Safari, production :3100 signed out: `shots/int-g1-sim.mjs` holds a real touch on the welcome buttons (cliclick down, screenshot, slide off sideways, up) and diffs rest against held.
- Shots: `scripts/ralph/qa/name-polish/shots/audit/INT-G1/`.

**Assumptions and skips:**
- None of these skills asks questions in a review (apple-design and emil-design-eng have greeting-only "Initial Response" blocks, skipped).
- Chrome DevTools slow-motion and the Animations panel are skipped; timing was read from computed styles.
- A CDP `touchStart` doesn't set `:active` in Chromium, so Playwright presses use a mouse down. Real touch was checked in the Simulator.
- The Simulator uses the Mac's hardware keyboard, so it can't show whether the on-screen keyboard covers a button. Onboarding can't be reached in the harness (see Codebase Patterns), so INT-G1-06 comes from reading the code.

**Sheet physics:** G1 has no sheets, drawers or custom gestures. Its gestures are native scrolling, Safari's back swipe (the code-step case is IMP-C-G1-17) and taps.

## What passes (checked)

- **Double submit:** a double tap on "שליחת קוד" sends one OTP request in both engines (busy guard). Enter submits the email and code forms. A sixth digit auto-submits once.
- **Busy labels** on the main buttons: "שולחים…" while sending, "נכנסים…" while verifying, "שומרים…" during the onboarding save. Each is disabled at opacity 0.6 and `aria-busy`.
- **Step change:** the code step shows 1.26 s (Chromium) and 1.73 s (WebKit) after the tap, with the send held 1.2 s, so the app adds no wait. Focus lands in the code field.
- **Shared press state:** components built on `Button` / `IconButton` (intro ✕ and "התחלת בחירה", invite copy and share, join outcomes) press to `scale: 0.95` on `:active` (150 ms, `touch-manipulation`). It's switched off under reduced motion. Hover styles don't stick on touch (none are used in G1).
- **Errors:** the invalid address and wrong code show inline next to the field, with no shake or bounce (PRD §3.1.6). The send error clears as soon as the field changes.
- **Resend loop:** a count-controlled 60 s wait shown in words, and the button turns into an underlined link when ready (rules-feedback-loops).
- **Invite share:** closing the share sheet (AbortError) is not treated as an error. Without Web Share it falls back to copying.

### INT-G1-01: Resending a code makes the sign-in button say "נכנסים…", and nothing says a new code went out

- **Screen and state:** `/names/sign-in/email`, code step, "שליחה חוזרת" after 60 s
- **Browser:** webkit-iphone · chromium-pixel (probe, send held 1 s); same code in Safari
- **What's wrong:**
  - `EmailSignIn` has one `busy` flag for both requests. While a resend is in flight, the ink submit button switches to "נכנסים…" ("signing in"), though nobody is signing in. The resend link itself only greys out and keeps its label.
  - When the send succeeds, the only change is the countdown coming back ("אפשר לשלוח שוב בעוד 60 שניות"). Nothing near the field says that a new code is on its way, and the wrong-code error has already been cleared. After a wrong code, this is the moment the person most needs to hear "a new code was sent; the old one no longer works".
- **Rule it breaks:**
  - `interaction-design` · `SKILL.md` Common Mistakes · "Identical feedback for different outcomes: User can't tell if their action succeeded, failed, or is still processing"
  - `SKILL.md` Feedback · "Near the trigger"
  - `apple-design` · `SKILL.md` §16 · "Feedback comes in four kinds: status, completion, warning, error. Confirm meaningful actions"
- **Severity:** P2
- **Effort:** S
- **Proposed change:**
  - In `src/components/names/EmailSignIn.tsx`, split `busy` into `sending` and `verifying`. The submit label uses `verifying` only, and both still block each other.
  - `ResendTimer` shows "שולחים…" on the link while `busy`.
  - On a successful resend, add a short line under the field in the existing caption style ("שלחנו קוד חדש. הקוד הקודם כבר לא עובד."), in the same live region the timer uses, so it isn't announced twice (A11Y-G1-07).
  - Do it together with IMP-C-G1-02 and CRIT-G1-01 (same screen, same recovery path).
- **Guardrail:** polish (feedback for an existing action; the new line states what Supabase already does: a new OTP replaces the old one)
- **Screenshot:** `shots/audit/INT-G1/resend-busy-chromium.png` ("נכנסים…" during the resend), `resend-done-chromium.png`, `resend-busy-webkit.png`

### INT-G1-02: Fields stay editable while their request is in flight, so the result lands on a value nobody checked

- **Screen and state:** `/names/sign-in/email`: the email field while "שולחים…", and the code field while "נכנסים…"
- **Browser:** webkit-iphone · chromium-pixel (probe)
- **What's wrong:**
  - **Code step:** the probe typed 123456, which auto-submitted. During the 1.2 s verify it changed the last digit to 9. The verify of the old code failed, and "הקוד לא נכון" then showed under **123459**, which was never sent (`verifies: 1`, and the `busy` guard dropped the second auto-submit).
  - **Email step:** the address can still be edited while the code is being sent. The code step's lead reads the live `email` state ("שלחנו קוד … ל־…"), so it can name an address the code didn't go to.
  - The rules allow a state the state machine should make impossible.
- **Rule it breaks:**
  - `interaction-design` · `SKILL.md` State Machines · "Makes impossible states impossible (you can't delete while loading)"
  - `SKILL.md` Rules · "Prevent errors, don't just catch them — Poka-Yoke"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:**
  - In `EmailSignIn.tsx`, set `readOnly={busy}` on the email input and pass it to `CodeInput` (a new `readOnly` prop next to `disabled`). Use `readOnly`, not `disabled`, so iOS keeps the keyboard and focus.
  - Keep the address the code went to in a `sentTo` state for the lead.
  - Pairs with CRIT-G1-01 (clear the code after a failure).
- **Guardrail:** polish
- **Screenshot:** `shots/audit/INT-G1/busy-verify-chromium.png`, `after-verify-chromium.png`, `after-verify-webkit.png`

### INT-G1-03: Holding a button-styled link in Safari lifts it into iOS's link preview

- **Screen and state:** welcome "כניסה עם קוד במייל" (a `Link` styled as a pill). The same applies to every `Link` button: sign-in back, callback "חזרה לכניסה", join and 404 actions, `Button href`.
- **Browser:** sim-safari (real touch, held 250 ms)
- **What's wrong:**
  - Mobile Safari treats a held `<a>` as a link to preview. It draws its own white "lift" platter with a snapshot of the label (`sim-welcome-email-held.png`), and a longer hold opens the link-preview menu with the URL.
  - On the email pill this shows instead of a pressed state. The app has none there (see the Confirmed section below), and the platter doesn't match the glass pill.
  - On the Google `<button>` next to it, the same hold changes no pixels (`sim-welcome-google-held.png` is identical to rest). So the welcome's two buttons react differently to the same touch.
  - `names.css` turns off the tap highlight but never sets `-webkit-touch-callout`.
- **Rule it breaks:**
  - `apple-design` · `SKILL.md` §16 Familiarity · "things that look the same must behave the same"
  - §10 · "Tap: highlight on touch-down (instant)"
  - `interaction-design` · `SKILL.md` Triggers · "Consistent behavior — A trigger must initiate the same action every time"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:**
  - Add `-webkit-touch-callout: none` to button-styled links: in `names.css`, a rule for `a` elements that carry the shared button classes (`.names-button-*`, or a new `names-pressable` class added by `buttonClass()` / `iconButtonClass()`).
  - Also apply it to `WelcomeActions`' email link and `AuthLayout`'s back link until they adopt the shared classes (IMP-A-G1-08 / PRO-G1-03).
  - Text links in running copy (legal lines) keep the system behaviour.
  - Hand to the NATIVE lens for the whole app.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/INT-G1/sim-welcome-email-rest.png` vs `sim-welcome-email-held.png`; `sim-welcome-google-rest.png` vs `-held.png`

### INT-G1-04: "כניסה עם Google" only dims while Google's page loads

- **Screen and state:** `/names/welcome` and the signed-out join, after tapping "כניסה עם Google"
- **Browser:** webkit-iphone · chromium-pixel (authorize redirect held 1.5 s)
- **What's wrong:**
  - From the tap until Google's page paints, the button keeps its label "כניסה עם Google" and only drops to opacity 0.7. Every other entry button uses 0.6 and a "…ים…" busy label.
  - On a phone this wait is the Supabase authorize hop plus Google's page, often over a second. With no pressed state either (Confirmed section), the first feedback is a slight dim that reads like "disabled".
- **Rule it breaks:**
  - `interaction-design` · `SKILL.md` Responsiveness Thresholds · "100ms-1s … Show the result. Skeleton or subtle indicator if near 1s" and "Never leave users without feedback for more than 1 second"
  - `apple-design` · `SKILL.md` §1 · "Respond on pointer-down, not on release"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `WelcomeActions.tsx`, while `busy` label the button "מעבירים ל־Google…", keep the G mark, and use the shared disabled opacity (0.6). That happens anyway if it adopts `buttonClass("primary")` (IMP-A-G1-08). `busy` already stays true until the page leaves, so the label can't flash back.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/INT-G1/press-welcome-google-webkit.png`, `busy-google-webkit.png`

### INT-G1-05: "הקישור הועתק" appears 250–450 px from the button that copied

- **Screen and state:** `/names/invite`, after "העתקת הקישור"
- **Browser:** webkit-iphone · chromium-pixel
- **What's wrong:**
  - The only visible confirmation is the global toast at the bottom of the screen: 248 px below the button in WebKit (toast y 598 vs button y 350) and 446 px in Chromium.
  - The button keeps its label and icon, so attention stays on the button and sees no change. A second tap just copies again.
  - Copying is the one completion moment of this screen.
- **Rule it breaks:**
  - `interaction-design` · `SKILL.md` Feedback · "Visual: Near the trigger. Brief."
  - `references/microinteractions.md` · bring the data forward / feedback where attention is
  - `emil-design-eng` · "a morphing feedback button shows the state change" (Animation Decision Framework §2, State indication)
- **Severity:** P3
- **Effort:** S
- **Proposed change:**
  - In `InviteScreen.tsx`, after a successful copy, swap the copy button's icon to a check and its label to "הקישור הועתק" for 2 s. The width is unchanged in a full-width pill. Use a 150 ms opacity cross-fade on the icon, or none under reduced motion.
  - Drop the toast for copy (or keep only one announcement, per A11Y-G1-07, which this also resolves).
  - The share path is unchanged.
- **Guardrail:** polish
- **Screenshot:** `shots/audit/INT-G1/invite-copied-chromium.png`, `invite-copied-webkit.png`

### INT-G1-06: After a successful onboarding save the button flips back to "התחלת בחירה" before the next screen

- **Screen and state:** `/names/onboarding`, between "שומרים…" and the next route
- **Browser:** code (onboarding isn't reachable in the harness; Codebase Patterns). The logic is the same in every browser.
- **What's wrong:**
  - `submit()` calls `router.replace(next)` and then, in `finally`, `setBusy(false)`. The button turns active and reads "התחלת בחירה" again for as long as the next route takes to load (the intro, or the deck with its data).
  - It looks as if the save didn't happen, and a second tap runs `ensureSpace` again.
  - `WelcomeActions` already does this right: `busy` is reset only on failure.
- **Rule it breaks:**
  - `interaction-design` · `SKILL.md` State Machines · "Forces you to define every transition explicitly … (what happens on timeout?)"
  - Common Mistakes · "Identical feedback for different outcomes"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `src/components/names/Onboarding.tsx`, reset `busy` only in the failure paths (`fail()` and the early returns), not in `finally`. Check with a Playwright run once the onboarding state in `us005-g1.mjs` works again.
- **Guardrail:** polish
- **Screenshot:** none (code; `Onboarding.tsx:110-135`)

## Confirmed from earlier lenses (no new entry)

- **No pressed state on the hand-rolled controls** (IMP-A-G1-08, IMP-C-G1-15, PRO-G1-03). Measured in all three browsers:
  - `:active` matches, but `scale`, `opacity` and background don't change on the welcome Google button, the welcome email pill and legal links, the sign-in back circle, "שליחת קוד", "שינוי כתובת", the code-step back and the 404 link (`touch-action: auto`).
  - The `Button` / `IconButton` controls do press.
  - In Safari, holding the Google button changes no pixels (`sim-welcome-google-*`).
  - **Rules:** `apple-design` §1 "Respond on pointer-down … Highlight a button the instant it's pressed" and `emil-design-eng` "Buttons must feel responsive … `scale(0.97)` on `:active`".
  - Keep the shared `scale-95`: the skill's range is 0.95–0.98.
- **After a wrong code the field keeps the old digits** (CRIT-G1-01) and the message points to a resend that is still locked (IMP-C-G1-02). INT-G1-01 and -02 cover the same recovery path; fix them together.
- **Callback and join spinners:** freeze under reduced motion and never time out (IMP-A-G1-03, -06): `interaction-design` "Never leave users without feedback for more than 1 second" / "allow cancellation".
- **Intro ✕ discards a typed surname** (IMP-C-G1-04): an "Undo instead of confirmation" case; the cheapest fix is saving the trimmed surname on ✕ too.
- **Safari back gesture from the code step lands on welcome** (IMP-C-G1-17).

## Before / After (`emil-design-eng` review format)

| Before | After | Why |
| --- | --- | --- |
| One `busy` for send, resend and verify → "נכנסים…" during a resend | `sending` / `verifying`; resend link "שולחים…"; "שלחנו קוד חדש" line | Different outcomes need different feedback (INT-G1-01) |
| Inputs editable while their request runs | `readOnly={busy}` on email and code | Make impossible states impossible (INT-G1-02) |
| Held `<a>` pill → iOS link-lift platter | `-webkit-touch-callout: none` on button-styled links | Things that look the same behave the same (INT-G1-03) |
| Google button: same label, `opacity: 0.7` | "מעבירים ל־Google…", shared `opacity: 0.6` | Feedback before the 1 s mark (INT-G1-04) |
| Copy confirmation only in a bottom toast | Button morphs to ✓ "הקישור הועתק" for 2 s | Feedback near the trigger (INT-G1-05) |
| `finally { setBusy(false) }` after `router.replace` | Reset `busy` only on failure | No "undone" flash before navigation (INT-G1-06) |
| Hand-rolled pills without `:active` | `PRESS` from `ui/classes.ts` (`motion-safe:active:scale-95`, 150 ms) | Respond on pointer-down (IMP-A-G1-08) |
