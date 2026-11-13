# IMP-C · G1: Entry (welcome, sign-in, callback, onboarding, intro, join, invite, offline, goodbye, 404, unconfigured)

Method: dual-agent (A: design review sub-agent · B: detector + browser sub-agent), run 2026-11-07 by US-A-IMP-C-G1 at `132b981` (no app code change since the baselines).

Skill: `impeccable` (`.claude/skills/impeccable/SKILL.md`, references read: `reference/critique.md`, `reference/operate.md`, `reference/mode-persuade.md`). Setup: `sh .claude/skills/impeccable/scripts/impeccable context --target src/app/names` ran (PRODUCT.md + DESIGN.md loaded, platform web). Mode Operate for every screen, Persuade for `/names/welcome` (PRD §3.3.5).

Assumptions where the skill would ask: the critique's closing "Ask the User" questions were skipped (Ralph can't ask, PRD §3.3.2); the default taken is "all issues go to triage", which ranks them. The impeccable `AUTONOMY_DIRECTIVE_CHECK` asks to probe once with a structured question tool; none is exposed in this run, so the brief (PRODUCT.md, DESIGN.md, the PRDs) stands in for the answers.

Skipped steps: the `.impeccable/critique/` snapshot and trend (`critique-storage write/trend`) were not written. This run keeps its records in `scripts/ralph/qa/name-polish/` (PRD §7), and audit stories commit only their findings. The live overlay was shown in Playwright (no `[Human]` tab exists in an unattended run). `/names/onboarding`, `/names/intro` and `/names/invite` need a session, so they had no overlay; the CLI scan covers their source.

Evidence: shots in `scripts/ralph/qa/name-polish/shots/audit/IMP-C-G1/` (`-webkit` iPhone 15 and `-chromium` Pixel 7 taken today with `us005-g1.mjs`, `G1_OUT` set to this folder; `-sim` copied from today's US-005 baseline, same code, so no second real code email went out; `overlay-*.png` from Assessment B). Narrow widths: `shots/baseline/G1/*-webkit375.png`, `*-webkit320.png`. `onboarding-default-chromium.png` is the baseline copy: the Chromium onboarding step redirected to the deck twice today (the trimmed session didn't hold in Chromium); WebKit took it fresh.

Scores: baseline table in `scores.md` ("Baseline (before polish)", G1).

## Combined critique

**Design specificity.** The happy path is authored for this product: the fabric photo, the real זיו card as a preview with its boys/girls split, the clay-dot wordmark, liquid glass, ink pill buttons, and copy that names the CBS data and the privacy promise. The system states are not: offline, 404 and the unconfigured notice are centred text on grey with an underlined link and no wordmark. Goodbye drops the wordmark too.

**Deterministic scan.** `impeccable detect --json` on all G1 source (27 targets): exit 0, `[]`, also with `--no-config`. Browser overlay (WebKit iPhone 15, 8 signed-out pages): 21 findings on 3 pages.
- 9 × `text-occlusion` per preview-card page (welcome, welcome closed, join invited): **false positive**. The front `NameCard` is `inert`, so hit-testing skips it and reads the rotated back card; the front card paints on top, and the preview is `aria-hidden` decoration.
- 1 × `straggler` per preview page ("ולבנות." alone on line 2): real, cosmetic, in decorative data copy. Not a finding.
- 1 × `low-contrast` on `/names/sign-in/email`: the placeholder at 2.2:1. **Agrees with the design review** (IMP-C-G1-06).

**Cognitive load:** low, 1 checklist failure (single focus / visual hierarchy on welcome and join-invited at short heights). No decision point has more than 4 options.

**Emotional journey.** Peaks: the welcome card, the intro's three promises, "הצטרפת." Valleys: the wrong code (told to request a new one while resend is locked), the expired session (one quiet grey line), the expired invite (no one named to ask), and the system states that drop the brand where reassurance matters most. Entering the email is well reassured (address echoed back, spam hint, "שינוי כתובת").

**What's working.** (1) Sign-in is well built: `inputMode`, `one-time-code`, auto-submit on the 6th digit, LTR field, `aria-describedby` errors, a resend timer announced every 15 s. (2) Onboarding uses `aria-disabled`, focuses the first missing field and says why. (3) Explicit action labels and privacy copy where it matters ("נשמר רק במכשיר הזה.").

**Priority issues:** IMP-C-G1-01, -02, -03, -04, -05 (below).

**Persona red flags.**
- Jordan (first-timer): at 320 × 568 the welcome screen shows a card and no button; the wrong-code message points at a disabled button; 404 says only "העמוד לא נמצא".
- Casey (one-handed, interrupted): Safari's toolbar hides the join legal line; the intro's sticky button sits over the focused surname field; Back from the code step goes to welcome and the address is typed again; the intro's X drops a typed surname.
- Sam (screen reader, low vision): email placeholder 2.2:1; join's legal links under 44 px; the Google error on welcome isn't styled as an error.
- Noa, an invited relative (PRODUCT.md "a partner, relative or friend joins"): the invitation says "שניכם" though Noa is the third member; a used link reads as "expired" with nobody named to ask.

**Questions to consider.** Should the welcome preview prove "מספרים אמיתיים" instead of fading the numbers out? What should welcome say to a returning person (`?expired=1`) versus a new one? Should 404 and offline get the wordmark and glass like goodbye?

Questions skipped: unattended run with no structured question tool (PRD §3.3.2); five priority issues go straight to triage.

## Findings

Severity is the PRD's scale (§7): P1 broken, inaccessible or clearly off-brand · P2 noticeable · P3 refinement. Browsers: webkit-iphone · chromium-pixel · sim-safari. Shot paths are relative to `scripts/ralph/qa/name-polish/shots/`.

### IMP-C-G1-01: Welcome's sign-in buttons are below the fold on short phones

- **Screen and state:** `/names/welcome` (default, closed, expired) and `/names/join/[code]` invited
- **Browser:** webkit-iphone (393 × 659: email button and legal line below the fold; 320 × 568 and 375 × 667: no button visible at all), sim-safari (toolbar covers the legal line). Pixel 7 fits.
- **What's wrong:** the decorative `PreviewCard` (`max-h-[300px]`), the wordmark and `gap-6` fill the first viewport, so the one action the screen exists for is not visible on a small phone.
- **Rule it breaks:** `impeccable` · `reference/mode-persuade.md` · "the opening must make the offer intelligible and desirable, expose a clear action"; `critique.md` cognitive load "Single focus" / "Visual hierarchy".
- **Severity:** P1 (Persuade surface with no visible action at 320 and 375)
- **Effort:** S
- **Proposed change:** `src/components/names/PreviewCard.tsx`: cap the card on short or narrow viewports the way `Intro` already scales its card (`max-[20rem]:scale-75`, plus a height-based `max-h` variant); optionally a tighter hero gap in `src/app/names/welcome/page.tsx` and `JoinScreen.tsx`. No reorder, no new layout.
- **Guardrail:** polish (the order and look stay; only the card's size on short screens changes)
- **Screenshot:** `baseline/G1/welcome-default-webkit320.png`, `audit/IMP-C-G1/welcome-default-webkit.png`, `audit/IMP-C-G1/welcome-default-sim.png`

### IMP-C-G1-02: Wrong-code message says to request a new code while resend is locked

- **Screen and state:** `/names/sign-in/email`, code step, wrong code
- **Browser:** all
- **What's wrong:** `WRONG_CODE_MESSAGE` = "הקוד לא נכון או שפג תוקפו. אפשר לבקש קוד חדש." while "שליחה חוזרת" is disabled ("…בעוד 59 שניות"); at 375 and 320 the resend line is below the fold. The wrong six digits stay in the field.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H9 "Actionable recovery suggestions"; H4 "Same actions produce same results everywhere".
- **Severity:** P2
- **Effort:** S
- **Proposed change:** copy in `src/lib/names/authErrors.ts` that matches the timer, e.g. "הקוד לא נכון או שפג תוקפו. אפשר להקליד אותו שוב, או לבקש קוד חדש כשהשליחה החוזרת תיפתח."; in `src/components/names/auth/CodeInput.tsx`, select the field's text when it turns invalid so new digits replace the wrong ones. Update the tests that pin the message.
- **Guardrail:** polish (clarity, meaning unchanged)
- **Screenshot:** `audit/IMP-C-G1/signin-code-wrong-full-webkit.png`, `baseline/G1/signin-code-wrong-webkit320.png`, `audit/IMP-C-G1/signin-code-wrong-sim.png`

### IMP-C-G1-03: "שניכם" assumes exactly two people; members are unlimited

- **Screen and state:** `/names/intro` (shared), `/names/join/[code]` invited and joined, `/names/invite`
- **Browser:** all
- **What's wrong:** "שם ששניכם שמרתם יופיע בהתאמות" in `Intro.tsx:114`, `InviteScreen.tsx:155`, `src/lib/names/join.ts:77` (`JOIN_INVITED_LEAD`) and `:79` (`JOIN_COPY.joined`). A match means every member kept the name, and `src/lib/names/matches.ts:250/256` already switches wording by member count, so G1 disagrees with the rest of the app. The same phrase is in G2/G3 (`swipe/PausePanel.tsx:54`, `lists/ListsScreen.tsx:366, 597`): triage should merge them into one item.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H2 "Domain-appropriate language for the target audience"; H4 "Consistent terminology throughout the interface". Also BRAND.md voice (never assume a couple).
- **Severity:** P2
- **Effort:** XS (G1 strings) / S (with G2/G3)
- **Proposed change:** one wording for "every member kept it" that works for two or more, e.g. "שם שכל מי שבבחירה שמר יופיע בהתאמות"; apply to the strings above and their tests.
- **Guardrail:** polish (wording consistency; the matching rule doesn't change)
- **Screenshot:** `audit/IMP-C-G1/join-invited-full-webkit.png`, `audit/IMP-C-G1/join-joined-webkit.png`, `audit/IMP-C-G1/invite-link-webkit.png`

### IMP-C-G1-04: The intro's X throws away a typed surname

- **Screen and state:** `/names/intro`, surname step
- **Browser:** all
- **What's wrong:** the "סגירה" `IconButton` calls `finish(false)` (`Intro.tsx:73`), which marks the intro as seen and drops whatever is in the surname field, with no warning. The intro doesn't come back, so the surname has to be found again in settings.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H5 "Autosave and draft recovery"; H3 "User Control and Freedom".
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** `src/components/names/Intro.tsx`: X calls `finish(surname.trim() !== "")`, so a typed surname is kept (not `finish(true)`: `finish` saves the trimmed value as is, and an empty one would overwrite a surname saved earlier, e.g. when the intro opens from the name sheet). Device-only, so the privacy rule holds.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G1/intro-surname-webkit.png`

### IMP-C-G1-05: The session-expired notice is easy to miss and says nothing about why

- **Screen and state:** `/names/welcome?expired=1`
- **Browser:** all
- **What's wrong:** `ExpiredNotice` is a bare `text-body text-ink-soft` line "צריך להיכנס שוב" between the pitch and the buttons. A returning person gets the new-visitor sales page with no visible sign that it's about them; the closed notice next to it has a peach container.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H1 "Partial; some states communicated"; H9 "Specific problem identification".
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** `src/components/names/ExpiredNotice.tsx`: the same container as `ClosedNotice` (`rounded-md bg-peach-pale p-3 text-ink`), copy like "החיבור פג. צריך להיכנס שוב כדי להמשיך." (no promise about saved data beyond what's true: votes live on the server, so "השמות שלך שמורים" may be added only after checking).
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G1/welcome-expired-full-webkit.png`

### IMP-C-G1-06: Input placeholders use `faint` (2.2:1)

- **Screen and state:** `/names/sign-in/email` email step; also the code field and the onboarding name field
- **Browser:** all (detector: `low-contrast`, `#b5aca6` on `#ffffff`, 2.2:1)
- **What's wrong:** `placeholder:text-faint` in `EmailSignIn.tsx:174`, `auth/CodeInput.tsx:73` and `Onboarding.tsx:166`. DESIGN.md says inputs use `stone` placeholders (5.7:1 on surface) and `faint` is never readable text. The label carries the meaning, so the example text is the only loss.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · Sam: "Is color contrast WCAG AA compliant (4.5:1 for text)?"; detector `low-contrast`.
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** `placeholder:text-stone` on the three inputs (one shared input class if one exists).
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G1/signin-email-webkit.png`, `audit/IMP-C-G1/overlay-sign-in-email.png`

### IMP-C-G1-07: Join's legal line differs from welcome's and has small targets

- **Screen and state:** `/names/join/[code]` invited, signed out
- **Browser:** all, worst in sim-safari (under the toolbar)
- **What's wrong:** `legalFooter` in `JoinScreen.tsx:32` is `text-caption text-ink-soft` straight on the photo, with no glass pill and links without `min-h-11`; welcome's identical line has both.
- **Rule it breaks:** `impeccable` · `reference/operate.md` · "Consistent affordances across the surface"; `critique.md` H4 "Visual consistency".
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** one shared legal-line element used by `welcome/page.tsx` and `JoinScreen.tsx`.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G1/join-invited-full-webkit.png`, `audit/IMP-C-G1/join-invited-sim.png`

### IMP-C-G1-08: Intro's sticky button covers the focused surname field and paints a canvas band on the photo

- **Screen and state:** `/names/intro` surname step; top at 320
- **Browser:** webkit-iphone, chromium-pixel (field under the button), sim-safari (band), webkit320 (lead runs behind the first card)
- **What's wrong:** the sticky footer's `bg-linear-to-t from-(--nest-canvas)` overlays the input when it's focused and draws a grey strip across the photo under the button.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · Casey "Are primary actions in the thumb zone" / fields visible while typing; H8 "No decorative clutter competing for attention".
- **Severity:** P2
- **Effort:** S
- **Proposed change:** `src/components/names/Intro.tsx`: a `scroll-mb-*` (spacing token) on the surname input so focus scrolls it clear of the button; the canvas fade only when there's no photo (`in-data-[names-bg=none]`), the existing scrim or a transparent fade on photos.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G1/intro-surname-webkit.png`, `audit/IMP-C-G1/intro-surname-sim.png`, `baseline/G1/intro-top-webkit320.png`

### IMP-C-G1-09: An expired or used invite gives no real way forward

- **Screen and state:** `/names/join/[code]` expired / used
- **Browser:** all
- **What's wrong:** `JOIN_COPY.invalid` (`src/lib/names/join.ts:81`) "הקישור כבר לא בתוקף. / אפשר לבקש קישור חדש." doesn't say from whom, and a used single-use link reads as "expired".
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H9 "Actionable recovery suggestions"; H10 "Contextual help".
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** e.g. "הקישור כבר לא בתוקף, או שכבר השתמשו בו." / "אפשר לבקש קישור חדש ממי ששלח את ההזמנה." and the tests.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G1/join-expired-webkit.png`

### IMP-C-G1-10: Onboarding has no way out

- **Screen and state:** `/names/onboarding`
- **Browser:** all
- **What's wrong:** no back and no sign-out; someone signed in with the wrong Google account is stuck on the form (Back to welcome would bounce straight back, since they are signed in).
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H3 "Clear navigation back to safety".
- **Severity:** P2
- **Effort:** S
- **Proposed change:** a quiet "יציאה מהחשבון" link under the form using the existing sign-out.
- **Guardrail:** owner (§3.2: adds a control to a screen, i.e. new behaviour)
- **Screenshot:** `audit/IMP-C-G1/onboarding-default-full-webkit.png`

### IMP-C-G1-11: 404 and offline are off-brand, and 404 explains nothing

- **Screen and state:** `/names/no-such-page`, `/names/offline`
- **Browser:** all
- **What's wrong:** a centred `h1` and an underlined link on bare canvas, no wordmark; 404 has no line saying what happened. Every sibling entry screen uses `AuthLayout` with an ink button.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H4 "Visual consistency (colors, typography, spacing, components)"; H9 "Specific problem identification"; `operate.md` "Empty states that teach the interface, not 'nothing here.'"
- **Severity:** P2
- **Effort:** S
- **Proposed change:** wordmark, a one-line lead on 404 (e.g. "אולי הקישור השתנה."), and `buttonClass("primary", "lg")` for the link; offline stays on canvas (it's a precached light page).
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G1/404-default-webkit.png`, `audit/IMP-C-G1/offline-default-webkit.png`

### IMP-C-G1-12: The unconfigured notice is a dead end

- **Screen and state:** unconfigured notice
- **Browser:** all
- **What's wrong:** only "השירות לא מוגדר": no explanation, no action, no wordmark. Only a misconfigured deploy shows it.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H9 "Cryptic errors"; H3 "Users get trapped".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `src/components/names/Unconfigured.tsx`: wordmark, "בחירת שם לא זמינה כרגע. אפשר לנסות שוב מאוחר יותר.", a link to `/`.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G1/unconfigured-default-webkit.png`

### IMP-C-G1-13: Onboarding's button repeats the intro's "התחלת בחירה" but leads to the intro

- **Screen and state:** `/names/onboarding` → `/names/intro`
- **Browser:** all
- **What's wrong:** two consecutive screens with the same primary label; only the second starts choosing.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H4 "Consistent terminology"; BRAND.md "explicit action labels that say what happens".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** onboarding button "שמירה והמשך" (and its tests).
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G1/onboarding-default-full-webkit.png`, `audit/IMP-C-G1/intro-top-webkit.png`

### IMP-C-G1-14: The Google error on welcome looks like body text

- **Screen and state:** `/names/welcome` after a failed Google start
- **Browser:** all (source)
- **What's wrong:** `WelcomeActions` renders it `text-body text-ink`; the email flow's errors are `font-medium text-urgent`.
- **Rule it breaks:** `impeccable` · `reference/operate.md` · "State-rich semantic vocabulary … error … Standardize these."
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** the same classes as `EmailSignIn`'s error line.
- **Guardrail:** polish
- **Screenshot:** none (source: `src/components/names/WelcomeActions.tsx`)

### IMP-C-G1-15: Entry screens hand-roll the primary button

- **Screen and state:** welcome, sign-in, callback, onboarding
- **Browser:** n/a (source)
- **What's wrong:** each screen has its own primary-button class string instead of `buttonClass` from `ui/classes.ts`; disabled opacity is 70 % on welcome and 60 % elsewhere.
- **Rule it breaks:** `impeccable` · `reference/operate.md` · "Inconsistent component vocabulary across screens. If the 'save' button looks different in two places, one is wrong."
- **Severity:** P3
- **Effort:** S
- **Proposed change:** use `buttonClass("primary", "lg")` (or `Button`) in `WelcomeActions.tsx`, `EmailSignIn.tsx`, `AuthCallback.tsx`, `Onboarding.tsx`.
- **Guardrail:** polish
- **Screenshot:** none (source)

### IMP-C-G1-16: A long email breaks at its hyphen in the code-step lead

- **Screen and state:** `/names/sign-in/email` code step
- **Browser:** sim-safari
- **What's wrong:** the `<bdi>` address wraps at "-", and "ל־" ends up next to the break.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H8 "Clear visual hierarchy"; DESIGN.md "Own Direction Rule".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** keep the address whole (`whitespace-nowrap`, falling back to `break-all` only when it can't fit) or on its own line.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G1/signin-code-wrong-sim.png`

### IMP-C-G1-17: Back from the code step skips the email step

- **Screen and state:** `/names/sign-in/email` code step
- **Browser:** all
- **What's wrong:** the back control goes to welcome, so the address has to be typed again; "שינוי כתובת" exists but Back is what people reach for.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H3 "Escape from long or multi-step processes".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** `EmailSignIn.tsx`: on the code step, the back control runs `changeAddress()`.
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G1/signin-code-webkit.png`

### IMP-C-G1-18: A closed sign-up from an invite loses the invitation

- **Screen and state:** `/names/welcome?closed=1&join=…`
- **Browser:** all
- **What's wrong:** the generic welcome with the closed notice; nothing says an invitation was received.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · cognitive load "The Memory Bridge".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** wording that acknowledges the invite in `ClosedNotice` when `join` is present. The code is only kept in sessionStorage and a closed sign-up can't use it later, so any promise ("ההזמנה שמורה") would be untrue; what to tell invitees during the waitlist is a product call.
- **Guardrail:** owner (§3.2: changes what the waitlist tells invitees, an earlier owner decision on closed sign-ups)
- **Screenshot:** `audit/IMP-C-G1/join-closed-full-webkit.png`

### IMP-C-G1-19: Small consistency slips in titles and alignment

- **Screen and state:** onboarding, join outcomes, goodbye
- **Browser:** all
- **What's wrong:** onboarding's missing-fields hint is `text-center` while the panel is start-aligned; titles mix periods ("הצטרפת.", "הקישור כבר לא בתוקף.") and none ("רגע לפני שמתחילים", "החשבון נמחק"); goodbye has no wordmark unlike its siblings.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H4 "Visual consistency"; H8.
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `text-start` for the hint; one title style (no period); the wordmark on goodbye (`GoodbyeScreen.tsx`).
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G1/onboarding-default-full-webkit.png`, `audit/IMP-C-G1/join-joined-webkit.png`, `audit/IMP-C-G1/goodbye-default-webkit.png`

### IMP-C-G1-20: Callback error mentions the email code but only offers "חזרה לכניסה"

- **Screen and state:** `/names/auth/callback` error
- **Browser:** all
- **What's wrong:** the lead says "או להיכנס עם קוד במייל" and the only action goes back to welcome, two taps from the code flow.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · H9 "Actionable recovery suggestions".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** a secondary link to `/names/sign-in/email` (keeping `join`) with `buttonClass("secondary", "lg")`.
- **Guardrail:** polish (an existing route, not a new flow)
- **Screenshot:** `audit/IMP-C-G1/callback-error-webkit.png`

### IMP-C-G1-21: The girls' share disappears on the preview card in Safari

- **Screen and state:** welcome / join preview card
- **Browser:** sim-safari
- **What's wrong:** the `peach` segment of `CardSexBar` blends into the peach-tinted glass; the "29% בנות" label stays, so no data is lost.
- **Rule it breaks:** `impeccable` · `reference/critique.md` · Sam "Meaning conveyed by color alone".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** a track or edge on the bar from an existing token in `card/CardSexBar` (a G2 component: triage merges it with the G2 card findings).
- **Guardrail:** polish
- **Screenshot:** `audit/IMP-C-G1/welcome-default-sim.png`

### IMP-C-G1-22: The preview's mask fades out the CBS numbers

- **Screen and state:** `/names/welcome`
- **Browser:** all
- **What's wrong:** `mask-b-from-60%` hides the stat tiles, the one thing only this product can prove on the Persuade surface.
- **Rule it breaks:** `impeccable` · `reference/mode-persuade.md` · "demonstrate something only this product can prove".
- **Severity:** P3
- **Effort:** M
- **Proposed change:** decide together with IMP-C-G1-01 whether the preview shows the numbers instead of fading them.
- **Guardrail:** owner (§3.2: changes the composition of an approved screen)
- **Screenshot:** `audit/IMP-C-G1/welcome-default-webkit.png`

## Detector findings not kept

- `text-occlusion` ×27 (9 per preview page): false positive, explained above.
- `straggler` ×3 ("ולבנות." in the preview's meaning line): decorative data copy, `line-clamp-2`, under a mask; not worth a change.

## What was checked

All 23 G1 states from `scores.md` "Screens G1" in WebKit iPhone 15 and Chromium Pixel 7, the Safari shots of the browser-dependent ones (welcome, sign-in email and code, wrong code, intro top and surname, join invited, invite), and 375/320 widths for layout. Source of every G1 route and component (copy, aria, states, focus, error paths). Detector over all G1 source and an overlay on 8 signed-out pages.
