# ELEV · G1: Entry (welcome, sign-in, callback, onboarding, intro, join, invite, offline, goodbye, 404, unconfigured)

Run 2026-11-07 by US-A-ELEV-G1 at `cc7eb18` (no app code change since the baselines).

Skills read: `design-review` (`SKILL.md`, Visual Quality Inspector sub-agent), `design-elevation` (`SKILL.md`, `references/elevation-protocol.md`, `references/design-interrogation.md`, `references/technique-catalog.md` "Techniques for Visual Hierarchy / Premium Feel"), `frontend-design` (`SKILL.md`), `product-taste` (`SKILL.md`), `.claude/skills/shared/knowledge/visual-quality.md` and `typography.md`. Method: the Visual Quality Inspector workflow (squint, 3-second and grayscale tests; alignment, spacing, rhythm, balance; anti-patterns; inspection checklist) on every G1 state, then design-elevation's interrogation checklist (typography, color, layout, detail, "Red Flags to Fix") and frontend-design's "restraint and self-critique" as a second pass.

Assumptions and skips: `design-review` asks "what is the artifact" and "final or WIP": the artifact is the live app (screenshots below), stage "final" (shipping product). Maturity L2 (DESIGN.md + tokens + components exist), so the DS lens is left to US-A-DS. `design-elevation` maps everything to Tailwind's palette; per US-002 the Nest tokens stand in (token values are the owner's, PRD §3.1.2), so its "use Tailwind gray / blue" advice and its exemplar overrides (Carbon, Polaris, …) are not applied. `frontend-design`'s "brainstorm a token system and confirm with the client" is for new work: the existing brand (BRAND.md, boards) is the confirmed brief and nothing is redesigned (§3.1.1). Figma adapter and font-availability step skipped (no Figma; Heebo is self-hosted). design-review's severity P0–P3 is mapped to the PRD's: P0/P1 → P1, P2 → P2, P3 → P3.

Evidence: `scripts/ralph/qa/name-polish/shots/audit/ELEV-G1/` (gitignored).
- `-webkit` (Playwright WebKit iPhone 15) and `-chromium` (Pixel 7): every G1 state from `scores.md` "Screens G1", taken today on the dev server with `us005-g1.mjs` (`G1_OUT` = this folder).
- `-sim`: the US-005 Safari set (same app code), copied in.
- Numbers below: `shots/elev-g1-probe.mjs` (WebKit, signed out: wordmark and `h1` positions, `text-wrap`) and pixel samples of the PNGs.

## Visual quality summary

**Squint / 3-second / grayscale.** Every auth panel passes: one glass panel, one 800-weight title, one ink pill; hierarchy holds in grayscale (size + weight + ink vs. ink-soft, not color). Welcome's focal point is the preview card rather than the action (already IMP-C-G1-01). Offline, 404 and unconfigured have no focal point beyond a centred title (IMP-C-G1-11/-12).

**What's working (≥3).**
- One radius system on the auth frame: `rounded-xl` panels, `rounded-pill` buttons, `rounded-md` fields, on every screen; one shadow (`shadow-button`) under ink pills. No mixed radii or shadow grammars, and the glass panels use translucency rather than fuzzy drops, which matches the liquid-glass family (`visual-quality.md` "Shadow language follows the style family").
- Restraint in color: ink, ink-soft and one clay accent (the wordmark dot, the preview badge); errors in `urgent` with text, never color alone. Near-black ink on warm surfaces, no pure #000/#fff pairing.
- Typography carries the personality with one family (Heebo) and three working sizes per panel (display title, card-title lead, caption), which is design-elevation's "2–3 type sizes per view".
- The intro and welcome put the subject first (a real name card, real CBS numbers), not a generic hero (`frontend-design` "Ground your designs in the subject matter").

## Findings

### ELEV-G1-01: A disabled ink pill turns photo-coloured instead of reading "not yet"

- **Screen and state:** `/names/sign-in/email` code step (empty code), `/names/onboarding` empty form
- **Browser:** webkit-iphone · chromium-pixel · sim (same in all)
- **What's wrong:** the disabled primary pill is the ink pill at `opacity-60` (`EmailSignIn.tsx:25`, `Onboarding.tsx:237`; 70 % on welcome). On glass over the fabric photo the photo shows through, so the button turns a muddy taupe (sampled rgb 106, 92, 84 on the code step and 104, 88, 79 on onboarding) that changes with the photo under it. It reads as a different, brownish button rather than the same button "not yet available", and its white label drops in contrast with it. Sim shows the same (`signin-code-sim.png`).
- **Rule it breaks:** `design-elevation` · `references/design-interrogation.md` · Color "Is color used consistently across similar elements?" and Detail "Do interactive states feel considered?"; `visual-quality.md` · Craft moves "Design every state … plus tactile active feedback".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** one disabled look for the shared primary button (`buttonClass` in `src/components/names/ui/classes.ts`), opaque and token-based, e.g. `disabled:bg-line disabled:text-stone disabled:shadow-none` (and the same for `aria-disabled:` in onboarding), instead of opacity; then use it from the four hand-rolled copies when IMP-C-G1-15 / IMP-A-G1-08 move them onto `buttonClass`. Check contrast of the disabled label stays ≥ 3:1 (disabled controls are exempt from 4.5:1, but it should still be legible).
- **Guardrail:** polish (existing tokens; merge with IMP-C-G1-15 / IMP-A-G1-08 in triage)
- **Screenshot:** `audit/ELEV-G1/signin-code-webkit.png`, `audit/ELEV-G1/onboarding-default-full-webkit.png`, `audit/ELEV-G1/signin-code-sim.png`

### ELEV-G1-02: A focused text field gets a second, floating ring

- **Screen and state:** `/names/sign-in/email` (email and code fields focused), `/names/intro` surname step, `/names/onboarding` name field focused
- **Browser:** webkit-iphone · chromium-pixel · sim
- **What's wrong:** the global focus style is `outline: 2px solid var(--nest-ink); outline-offset: 2px` (`.nest-names :focus-visible`). Text fields always match `:focus-visible` when tapped, so every focused field shows its own `border-line` edge, a 2 px gap, then a black ring: a heavy double outline that is the darkest element on the panel and rounds differently from the field (`signin-email-webkit.png`, `signin-code-webkit.png`, `intro-surname-webkit.png`, `signin-code-sim.png`). It's the "default software element showing" look on the screen people spend the most time typing on.
- **Rule it breaks:** `design-elevation` · `references/design-interrogation.md` · Red flags "System UI elements showing" and Detail "Are there default software elements showing?"; `visual-quality.md` · Anti-patterns "Fake alignment — visually close but not on the grid" (a ring 2 px off the field's edge).
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** for text fields only, draw focus on the field's own edge: in `names.css` add `.nest-names :is(input[type="text"], input[type="email"], input:not([type]), input[inputmode]):focus-visible { outline-offset: 0; border-color: var(--nest-ink); }` (or `focus-visible:outline-offset-0 focus-visible:border-ink` on the three inputs). Focus stays a 2 px ink outline (≥ 3:1, WCAG 2.4.7 / 2.4.11 kept); buttons and links keep the offset ring.
- **Guardrail:** polish (no token change; focus remains visible)
- **Screenshot:** `audit/ELEV-G1/signin-email-webkit.png`, `audit/ELEV-G1/intro-surname-webkit.png`, `audit/ELEV-G1/signin-code-sim.png`

### ELEV-G1-03: The wordmark jumps 68 px down between welcome and sign-in

- **Screen and state:** `/names/welcome` → `/names/sign-in/email` (both steps)
- **Browser:** webkit-iphone (measured); same layout in all
- **What's wrong:** `AuthLayout` stacks the back link *above* the hero in the same `gap-6` column, so on the one screen with a back link the wordmark starts at 124 px instead of 56 px (welcome, callback, onboarding, join). Tapping "כניסה עם קוד במייל" moves the brand mark down by the back button's height plus a gap, and the back button sits alone in its own row. The anchor that should hold still across the entry flow is the thing that moves.
- **Rule it breaks:** `visual-quality.md` · Alignment "elements sharing a visual relationship should share an edge" and Visual rhythm "consistent left margin … vertical rhythm is what makes a page feel settled"; `design-elevation` · `references/design-interrogation.md` · Consistency "Are similar elements treated identically?"
- **Severity:** P3
- **Effort:** S
- **Proposed change:** in `AuthLayout.tsx`, take the back link out of the flow (`absolute start-5 top-[max(56px,env(safe-area-inset-top))]`, same 44 px glass circle), so the wordmark keeps its 56 px top on every auth screen and the back button sits level with it at the start edge. Check 320 px width that the circle and the centred 85 px wordmark don't touch (they don't: 20 + 44 < (320 − 85) / 2).
- **Guardrail:** polish (same elements, same sizes; no board covers sign-in)
- **Screenshot:** `audit/ELEV-G1/welcome-expired-webkit.png`, `audit/ELEV-G1/signin-email-webkit.png`, `audit/ELEV-G1/callback-error-webkit.png`

### ELEV-G1-04: Panel titles and leads break with one-word widows

- **Screen and state:** `/names/auth/callback` error ("הכניסה עם Google לא / הצליחה"), `/names/join/[code]` invited ("קיבלת הזמנה לבחור שם / ביחד ב־Nest"), sign-in code lead ("… / בתיקיית הספאם."), offline body
- **Browser:** webkit-iphone · chromium-pixel (line breaks differ slightly by width; 375 and 320 baselines show more)
- **What's wrong:** the `AuthLayout` `h1` (`text-display`) and lead use the default `text-wrap: wrap` (probe: `wrap` on every G1 `h1`), so a two-line title often ends with a single word under a full line, which reads as a mistake at display size and makes the panel's top edge look unbalanced.
- **Rule it breaks:** `design-elevation` · `references/design-interrogation.md` · Typography refinement "Are there orphans or widows that break reading flow?"; `typography.md` · Hierarchy "Headings (≥24px) 1.1–1.3 … display, not read in paragraphs".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `text-balance` on the `h1` in `AuthLayout.tsx` (and the `h1` of `offline/page.tsx`, `not-found.tsx`, `GoodbyeScreen.tsx`), `text-pretty` on the `lead` wrapper and the offline paragraph. CSS only, text unchanged. Same fix as IMP-C-G3-23 (one-word last lines in G3, `text-pretty`); merge in triage.
- **Guardrail:** polish
- **Screenshot:** `audit/ELEV-G1/callback-error-webkit.png`, `audit/ELEV-G1/join-invited-full-webkit.png`, `audit/ELEV-G1/signin-code-webkit.png`

### ELEV-G1-05: The closed-sign-ups notice is a third surface inside the glass panel

- **Screen and state:** `/names/welcome?closed=1`, `/names/welcome?closed=1&join=…`
- **Browser:** webkit-iphone · chromium-pixel · sim
- **What's wrong:** `ClosedNotice` is an opaque `bg-peach-pale` box (`rounded-md`, `p-3`) dropped inside the strong glass panel between the lead and the buttons. On the photo it reads as a near-white sticker with a tighter radius and padding than anything around it, and its 13.5 px body is denser than the lead above it. Every other in-panel message in G1 (wrong code, invalid email, expired session, Google error) is a plain line of text in the panel; this one alone gets a box.
- **Rule it breaks:** `visual-quality.md` · Craft moves "Separate without borders where possible (spacing / background shift …); use a card only when elevation communicates real hierarchy" and Anti-patterns "Color for grouping without proximity"; `design-elevation` · Detail "Is there a clear system for variations?"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** render the notice like the other in-panel messages: drop `bg-peach-pale p-3 rounded-md`, keep `role="status"`, set it as `text-body text-ink` with its link, separated from the buttons by the panel's `gap-6` (the info glyph or a `border-s-2 border-clay ps-3` start rule if it needs to stand out, existing tokens). Wording is CRIT-G1-04's; do both in one story.
- **Guardrail:** polish
- **Screenshot:** `audit/ELEV-G1/welcome-closed-full-webkit.png`, `audit/ELEV-G1/join-closed-full-webkit.png`

### ELEV-G1-06: The invite's expiry line joins two facts with a middle dot

- **Screen and state:** `/names/invite`, link ready
- **Browser:** all
- **What's wrong:** "בתוקף עד 14 בנובמבר 2026 · הקישור עובד פעם אחת" (`InviteScreen.tsx:175`) is two separate facts strung on a "·", in caption grey under the link field. It's the "meta strings joined with middle dots" template chrome, and in RTL the dot sits close to the LTR date run so the two facts blur into one line.
- **Rule it breaks:** `frontend-design` · `SKILL.md` · "template chrome …: meta strings joined with middle dots ('A · B · C')"; `visual-quality.md` · Generative tells "Decoration noise".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** write it as one sentence, e.g. "הקישור בתוקף עד 14 בנובמבר 2026 ועובד פעם אחת." (same facts, `<bdi>` kept around the date), and update the invite test that reads it. COPY-G1 may refine the wording.
- **Guardrail:** polish (§3.1.5 clarity, same meaning)
- **Screenshot:** `audit/ELEV-G1/invite-link-webkit.png`

## Seen again, already filed (not repeated)

| What the visual pass found | Filed as |
|---|---|
| Welcome's buttons under the preview card on short phones; card is the focal point | IMP-C-G1-01 |
| Offline, 404, unconfigured: centred title on grey, no wordmark or glass; goodbye without wordmark | IMP-C-G1-11, -12, -19 |
| Titles mix a trailing period ("הצטרפת.") and none | IMP-C-G1-19 |
| Hand-rolled primary pills, 70 % vs 60 % disabled opacity | IMP-C-G1-15, IMP-A-G1-08 (ELEV-G1-01 adds the look) |
| Intro's sticky button paints a canvas band over the photo | IMP-C-G1-08 |
| Invite: member names outrank their section headings; headings inside vs above cards | CRIT-G1-05 |
| Placeholders `faint` 2.2:1; countdown grey on the orange photo | IMP-C-G1-06, PRO-G1-01 |
| Preview card's CBS numbers faded by the mask; girls' share missing in Safari | IMP-C-G1-22, -21 |
| Body 13.5 px; inputs under 16 px | PRO-G1-06, IMP-A-G1-02 |
| Onboarding's optional box grouped with the required ones | CRIT-G1-03 |

## Checked and clean

Radii (`xl` panels, `pill` buttons, `md` fields, `lg` intro rows, `sm` icon tiles) and the one button shadow are used the same on every screen; icons are one stroke family (2 px, round caps) in the back, close, mail, share, copy and intro row icons; panel padding (`p-6`) and the column (`px-5`, max 480 px, `gap-6`) are identical across welcome, sign-in, callback, onboarding, join and goodbye; start edges of title, lead, label and field align at 0 px in every panel; no off-scale spacing or ad-hoc color in G1 code (designGuard green); the clay accent appears only on brand marks; grayscale hierarchy holds on every state; Safari matches the Playwright engines on every state it can reach. Considered and not filed: the intro surname field is `h-12` / `text-intro` while sign-in and onboarding fields are `h-14` / `text-card-title` (board 1 draws the intro field at that size; left to US-A-DS to judge as a variant); the intro drops board 1's clay "בחירת שם" eyebrow (the detail run's layout, and frontend-design counts eyebrows as a tell).
