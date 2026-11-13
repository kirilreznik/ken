# PRO · G1: Entry (welcome, sign-in, callback, onboarding, intro, join, invite, offline, goodbye, 404, unconfigured)

Run 2026-11-07 by US-A-PRO-G1 at `54fa47a` (no app code change since the baselines).

Skill: `ui-ux-pro-max` (`.claude/skills/ui-ux-pro-max/SKILL.md`, references read: `references/quick-reference.md` (all 10 categories, the rule IDs cited below) and `references/pro-rules.md` (the professional-UI tables and the canonical Pre-Delivery Checklist); `scripts/search.py` with `python3` for the rules cited: `"text contrast glass background" --domain ux`, `"touch target spacing" --domain ux`, `"press feedback active state" --domain ux`, `"heading hierarchy" --domain ux`, `"cursor pointer clickable" --domain ux`, `"tabular numbers timer" --domain ux`, `"button cursor pointer" --stack html-tailwind`).

Assumptions where the skill would ask: the stack is detected, not asked (Next.js 16 + Tailwind 4, `--stack html-tailwind`). The skill's review method for an existing UI is "follow priority 1→10, then run the Pre-Delivery Checklist". Step 2 (`--design-system`, `--persist`) only applies to new pages and would replace the owner's look, so it was not run (PRD §3.1.1–2), and no palette, font or GSAP preset from the skill is proposed. Two searches returned off-topic rows (`cursor pointer` returned the drag and target-size rows; `tabular numbers` returned number formatting). Following the skill's "retry once, then fall back", those two findings cite the static rule in `quick-reference.md` (`cursor-pointer`, `number-tabular`). Skipped: nothing needed a service. The checklist's dark-mode items are n/a: the app is light only by design (PRODUCT.md, DESIGN.md).

## Method and evidence

- **Probe** `shots/pro-g1-probe.mjs` (gitignored). It covers 22 G1 states (the `scores.md` "Screens G1" inventory). Every write is mocked and answered, and the sign-out is answered locally. For each state it measures:
  - every target's size, the gap to its nearest other target (`touch-spacing` ≥ 8 px), computed `cursor` and `touch-action`, whether it has an `active:` press state, and how it looks disabled
  - the smallest visible text, the line-height ratio and characters per line of multi-line paragraphs
  - every input's type, `inputMode`, `autocomplete`, height, font size, label, `aria-describedby` and required state
  - the countdown's `font-variant-numeric`, heading order, horizontal overflow and scroll height

  It ran in four modes: WebKit iPhone 15 (portrait and landscape 844 × 390) and Chromium Pixel 7 (portrait, 200 % zoom as a halved 206 × 420 viewport, and desktop 1280 × 800).
- **Rendered contrast** `shots/pro-g1-contrast.mjs`: the text's computed color against the median pixel of its own box, shot with that text made transparent, so the glass over the photo is measured as it renders.
- **Simulator** (Mobile Safari, iPhone 17 Pro, `127.0.0.1:3100`, signed out): `welcome-sim.png` and `welcome-sim-landscape.png` (rotated with ⌘←, then back). The code step's countdown was judged on `baseline/G1/signin-code-sim.png` (US-005, real code email). No new code email was sent.
- **Shots:** `scripts/ralph/qa/name-polish/shots/audit/PRO-G1/`. Names are `<state>-<webkit|chromium>[-landscape|-zoom200|-desktop].png`, plus the `us005-g1.mjs` set (`-webkit` partial, `-chromium` complete, `-webkit375` partial: WebKit was interrupted at `/names/offline` → `/names/goodbye`, a known harness race) and the two `-sim` shots.
- **Gaps:** `invite` (link ready) failed in the WebKit portrait run (interrupted by a redirect to `/names/intro` in a context that had just opened intro). It passed in Chromium portrait, WebKit landscape, zoom200 and desktop. Onboarding rendered in every mode this time.

## Checklist results (priority order, then Pre-Delivery Checklist)

| # | Category | Result |
|---|---|---|
| 1 | Accessibility | Labels, `aria-describedby` errors, live status and focus handling are good (see IMP-A-G1). The welcome preview's `h2` comes before the page `h1` but sits in `aria-hidden`, so heading order is fine. **Contrast fail:** the resend countdown (-01). Placeholder contrast is already IMP-C-G1-06 |
| 2 | Touch & Interaction | All targets ≥ 44 px except join's inline legal links (already IMP-C-G1-07) and onboarding's consent links (-02). Loading buttons swap their label ("שולחים…", "נכנסים…") and are disabled with `aria-busy`. **Press feedback:** the tap highlight is off globally (`names.css:45`), and several non-primary controls have no `:active` state (-03); primary pills are IMP-A-G1-08 |
| 3 | Performance | CLS and images were covered by IMP-A-G1 and US-004. Welcome's skeleton-only HTML is IMP-A-G1-01 |
| 4 | Style | One icon family (stroke 2, 20 px), no emoji icons, Google's official G mark, one primary CTA per screen (`primary-action`: each state has exactly one `bg-ink` control or none) |
| 5 | Layout & Responsive | No horizontal overflow in any state at 390, 375, 320, landscape, 200 % zoom or desktop. Landscape scrolls everywhere (WebKit and Safari). The viewport allows zoom. `min-h-dvh` everywhere. Safe areas are honored in `AuthLayout`, intro and invite |
| 6 | Typography & Color | Tokens only. Line-height ratios run from 1.38 to 1.63 on multi-line text, and lines are 20–41 characters on a phone. The smallest visible G1 text is 12 px. Body 13.5 px and inputs 15 px are under the skill's 16 px base (-06 owner; inputs are IMP-A-G1-02). Countdown digits aren't tabular (-05) |
| 7 | Animation | Only spinners and press scale. Reduced motion freezing the spinners is IMP-A-G1-03 |
| 8 | Forms & Feedback | Semantic `type="email"`, `inputMode="numeric"`, `autocomplete` `email` / `one-time-code` / `given-name` / `family-name`. Paste and password managers work (`accessible-authentication`). Errors sit next to the field and are tied to it, except onboarding's terms checkbox (IMP-A-G1-07). Required fields are explained by the line under onboarding's button (no asterisks; it reads well, kept) |
| 9 | Navigation | Back is predictable, except that back from the code step skips the email step (IMP-C-G1-17). Onboarding has no way out (IMP-C-G1-10) |
| 10 | Charts | Only the decorative preview's share bar (`aria-hidden`). Its fade is IMP-C-G1-22 |
| — | `cursor-pointer` (web) | Buttons show the arrow on desktop, links the hand (-04) |

**Checked and not kept:**
- Welcome's two legal links are 7 px apart, against the 8 px `touch-spacing` rule. Each has a 44 px tall hit area and they're separated by "ו". That's 1 px under a spacing guideline, and WCAG 2.5.8's 24 px rule passes, so it isn't a real problem.
- At 200 % zoom the welcome preview clamps its meaning text ("…"). The preview is a decorative `aria-hidden` example and the full card is in the app, so `truncation-strategy` doesn't apply.
- The disabled "שליחה חוזרת" is `stone` at 1.9:1 on glass. Inactive controls are exempt from contrast, and the countdown under it carries the meaning, which is why -01 matters.
- The wrong-code error (`urgent` on glass) measures 4.5:1 at the median of its box: a pass, with no margin.

**Seen for other lenses:** onboarding's "קראתי ואני מסכים/ה" uses the slash form (COPY). Callback and join have no timeout (IMP-A-G1-06).

## Findings

Severity is the PRD's scale (§7): P1 broken, inaccessible or clearly off-brand · P2 noticeable · P3 refinement. Shot paths are relative to `scripts/ralph/qa/name-polish/shots/`.

### PRO-G1-01: The resend countdown is grey on glass over the orange photo (2.2:1)

- **Screen and state:** `/names/sign-in/email`, code step while the resend timer runs (also after a wrong code)
- **Browser:** webkit-iphone, chromium-pixel, sim-safari (all; the glass sits over the photo's deep orange folds at the card's bottom)
- **What's wrong:** "אפשר לשלוח שוב בעוד 60 שניות" is `text-caption text-stone` (`auth/ResendTimer.tsx:47`). Measured against the glass as rendered, it's 2.2:1 at the median of its box and 1.5:1 at the worst pixel. The disabled "שליחה חוזרת" above it is exempt from contrast, so this 12 px line is the only place that says when a new code can be sent. It's the moment people need it most: after a wrong code (IMP-C-G1-02). Intro already solves the same case with `text-ink-soft in-data-[names-bg=none]:text-stone` (`Intro.tsx:146`). On this background `ink-soft` computes to about 3.8:1, though, so the countdown needs `ink`.
- **Rule it breaks:** `ui-ux-pro-max` · `references/quick-reference.md` §1 `color-contrast` "Minimum 4.5:1 ratio for normal text"; `pro-rules.md` "Text contrast (light) · Maintain body text contrast >=4.5:1 against light surfaces"; search `ux` "Color Contrast · Don't: Low contrast text"
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** `src/components/names/auth/ResendTimer.tsx`: the countdown span → `text-ink` on photos, `in-data-[names-bg=none]:text-stone` kept for the plain background. Then re-measure with `shots/pro-g1-contrast.mjs` in WebKit, Chromium and the Simulator (≥ 4.5:1 at the median). Do it with -05 (same span).
- **Guardrail:** polish (class change, no token value)
- **Screenshot:** `audit/PRO-G1/signin-code-webkit.png`, `audit/PRO-G1/signin-wrong-webkit.png`, `baseline/G1/signin-code-sim.png`

### PRO-G1-02: Onboarding's consent links are 20 px tall text inside the checkbox labels

- **Screen and state:** `/names/onboarding`, default
- **Browser:** webkit-iphone, chromium-pixel (same in landscape and at 200 %)
- **What's wrong:** "תנאי השימוש" (80 × 20) and "מדיניות הפרטיות" (98 × 20, or 266 × 42 when it wraps) are inline links inside the terms checkbox's `<label>`. Their boxes touch the label (gap 0), so a tap a few pixels off a link ticks the consent instead of opening the terms in a new tab. A tap meant to tick the box can also open a tab and leave the app. Welcome and the legal pages already give inline links a 44 px tall hit area (`-my-3 inline-flex min-h-11 items-center`, `welcome/page.tsx:37`). Onboarding's `legalLink` (`Onboarding.tsx:33`) doesn't. Join's legal links are the same problem (IMP-C-G1-07).
- **Rule it breaks:** `ui-ux-pro-max` · `quick-reference.md` §2 `touch-target-size` "Min 44×44pt … extend hit area beyond visual bounds if needed" and `no-precision-required` "Avoid requiring pixel-perfect taps on small icons or thin edges"; `pro-rules.md` "Gesture conflict prevention · Keep one primary gesture per region and avoid nested tap/drag conflicts"
- **Severity:** P3
- **Effort:** S
- **Proposed change:** `src/components/names/Onboarding.tsx` `legalLink`: the welcome pattern (`-my-3 inline-flex min-h-11 items-center`) so each link owns a 44 px tall area. Check that the label still wraps cleanly at 320 px and 200 %, and that the checkbox's own tap area (the rest of the label) stays ≥ 44 px. Merge with IMP-C-G1-07 (one shared inline legal-link class for welcome, join and onboarding).
- **Guardrail:** polish
- **Screenshot:** `audit/PRO-G1/onboarding-webkit.png`, `audit/PRO-G1/onboarding-chromium-zoom200.png`

### PRO-G1-03: Secondary controls on entry screens give no feedback on tap

- **Screen and state:** welcome "כניסה עם קוד במייל"; the sign-in "חזרה" circle; "שינוי כתובת" and "שליחה חוזרת"; "לבחירת שם" on 404 and offline; the legal links
- **Browser:** webkit-iphone, chromium-pixel, sim-safari
- **What's wrong:** `names.css:45` turns off `-webkit-tap-highlight-color`, so a control without its own `:active` style shows nothing when touched. The probe found no `active:` state and `touch-action: auto` on:
  - `WelcomeActions.tsx:80` (the glass email pill)
  - `auth/AuthLayout.tsx:39` (the back circle, hand-rolled instead of `iconButtonClass()`, which has PRESS)
  - `ResendTimer.tsx:42` and the change-address button (the `link` style)
  - `not-found.tsx:12` and `offline/page.tsx:20`

  IconButtons on intro, invite and join do press. On a phone, the email link waits for the sign-in route to load, and nothing confirms the tap meanwhile.
- **Rule it breaks:** `ui-ux-pro-max` · `quick-reference.md` §2 `press-feedback` "Visual feedback on press" and §3 `tap-feedback-speed` "Provide visual feedback within 100ms of tap"; `pro-rules.md` "Tap feedback · Provide clear pressed feedback … within 80-150ms · Don't: No visual response on tap"; search `ux` "Active States · Code Example Good: active:scale-95"
- **Severity:** P3
- **Effort:** S
- **Proposed change:** reuse the shared classes:
  - `AuthLayout` back → `iconButtonClass()`
  - welcome email pill → the same PRESS string (export it from `ui/classes.ts` or use `buttonClass("secondary")` if the board allows the stronger glass)
  - the `link` variant in `classes.ts`, which the text links adopt → `touch-manipulation` plus a non-scaling pressed state (e.g. `active:opacity-60`, no layout change)

  Merge with IMP-A-G1-08 / IMP-C-G1-15 (primary pills), which fixes the same thing for the ink buttons.
- **Guardrail:** polish
- **Screenshot:** `audit/PRO-G1/welcome-webkit.png`, `audit/PRO-G1/signin-code-webkit.png`, `audit/PRO-G1/404-webkit.png`

### PRO-G1-04: Buttons show the arrow cursor on desktop while links show the hand

- **Screen and state:** every G1 screen with a `<button>` (welcome Google, sign-in send/verify/resend/change address, onboarding, intro, invite, join)
- **Browser:** chromium desktop 1280 × 800 (WebKit reports `auto`/`default` the same way)
- **What's wrong:** Tailwind 4's preflight resets `button` to `cursor: default`, and the names layer doesn't restore it, so `<button>`s show the arrow while `<Link>`s show the hand. Side by side on welcome, "כניסה עם Google" (button) and "כניסה עם קוד במייל" (link) look like the same kind of control and behave differently under the pointer. Only the sheet handle sets a cursor (`BottomSheet.tsx:289`). This affects the desktop sheets and pages too (G2/G3).
- **Rule it breaks:** `ui-ux-pro-max` · `quick-reference.md` §2 `cursor-pointer` "Add cursor-pointer to clickable elements (Web)"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `src/app/names/names.css`, next to the existing `.nest-names :where(button, input, select, textarea)` rule: `.nest-names :where(button, [role=button], summary):not(:disabled, [aria-disabled=true]) { cursor: pointer }`. One rule, the whole app.
- **Guardrail:** polish
- **Screenshot:** `audit/PRO-G1/welcome-chromium-desktop.png`

### PRO-G1-05: The countdown's digits aren't tabular, so the line's end moves every second

- **Screen and state:** `/names/sign-in/email`, code step while the timer runs
- **Browser:** all
- **What's wrong:** `resendWaitText(left)` re-renders every second with Heebo's proportional digits (`font-variant-numeric: normal`). The line is start-aligned, so "שניות" shifts at its end as the digits change width (e.g. 11 → 10). It's small, but it's the only moving text on the screen.
- **Rule it breaks:** `ui-ux-pro-max` · `quick-reference.md` §6 `number-tabular` "Use tabular/monospaced figures for data columns, prices, and timers to prevent layout shift"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `src/components/names/auth/ResendTimer.tsx:47`: add `tabular-nums` (do it with -01, same span).
- **Guardrail:** polish
- **Screenshot:** `audit/PRO-G1/signin-code-webkit.png`

### PRO-G1-06: Body text is 13.5 px, under the skill's 16 px mobile base

- **Screen and state:** every G1 screen (welcome pitch, offline, closed/expired notices, onboarding; hints and the legal line are 12 px captions)
- **Browser:** all
- **What's wrong:** the `body` token is 13.5 px / 22 px and `caption` is 12 px (`nest-tokens.css:62–67`, from the owner's `tokens.json`). Measured lines are short (20–41 characters), with comfortable line-height (1.47–1.63), and contrast is high on the glass. That's why this reads fine in the shots, but it's below the skill's base size for mobile body text. Inputs at 15 px (iOS zoom) are the separate, fixable IMP-A-G1-02.
- **Rule it breaks:** `ui-ux-pro-max` · `SKILL.md` priority 6 "Base 16px" and `quick-reference.md` §5 `readable-font-size` "Minimum 16px body text on mobile"
- **Severity:** P3
- **Effort:** M (a token value plus a re-check of every board layout, including the card's no-scroll rule on 390 × 844)
- **Proposed change:** none in this run. Ask the owner whether `--nest-text-body` should move toward 15–16 px. If yes, it's a next-run item with a full layout pass.
- **Guardrail:** owner (§3.2: changes an existing type-size token value and the board layouts)
- **Screenshot:** `audit/PRO-G1/welcome-webkit.png`, `audit/PRO-G1/offline-webkit.png`

## Summary

6 findings: 0 P1, 1 P2 (-01 countdown contrast), 5 P3 (-02 consent links, -03 press feedback, -04 cursor, -05 tabular countdown, -06 body size, owner). -01 and -05 are one XS edit in `ResendTimer.tsx`. -03 merges with IMP-A-G1-08 / IMP-C-G1-15, and -02 with IMP-C-G1-07. The rest of the skill's checklist passes on G1 (see the table). Most of what it would flag on this group was already found by IMP-C and IMP-A and is cross-referenced, not duplicated.
