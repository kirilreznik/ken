# DS · ALL: design system consistency across all `/names` code

Skills: `design-systems` (`.claude/skills/design-systems/SKILL.md`; references read: `references/component-hierarchy.md`, `references/design-tokens.md` (Token Audit Checklist), `references/perceptual-patterns.md` (Typography Rules, Spacing Systems), `references/pattern-documentation.md` (outline), `references/governance-and-maintenance.md` (outline), `templates/design-system-audit-template.md`), `design-system` (`SKILL.md`, `audit` mode and its "Output — Audit" format), `design` (`SKILL.md`, with `.claude/skills/shared/maturity-detection.md`).

**Maturity detected: L1, design language defined.** There's no `.ds-context.md`, and `DESIGN.md` is at the repo root. In `design-systems` terms the code is at **Level 3, Managed**: a component library exists (`ui/`, `DecisionButtons`, `card/`, `detail/`), and adoption is partial. `design` at L1 says to compose with DESIGN.md's primitives and to send real gaps to /ds-make. This run builds nothing new, so every gap below is written as a proposal: a variant or helper in `ui/classes.ts`, or a doc line in DESIGN.md.

**Assumptions where a skill would ask:**
- `design`'s Component Selector "Ask first" questions are answered from PRODUCT.md and DESIGN.md: mobile first, 390 × 844, AA.
- `design-systems`' interface inventory steps 1, 2 and 4 (team, shared canvas, presenting) don't apply to Ralph. The inventory is a code scan instead, with screenshots from earlier audits where a finding shows on screen.
- "User is the approver" (`design` hard rules): every new variant here is a proposal for triage, not a decision.

**Skipped:** Figma adapter, PluginOS and `CONNECTORS.md` (the `design-system` connectors). /ds-make routing isn't used here (PRD §5).

**No code change.** This is an audit (PRD §3.3.6).

## How it was checked

- Code scan of every `.ts`/`.tsx` file in `src/components/names/**` and `src/app/names/**`: 120 files, about 10,150 lines. A throwaway scanner (`/tmp/ds/scan.py`, not committed) counted:
  - spacing utilities and their steps;
  - arbitrary `[…]` values;
  - `text-<role>` uses and the weight utilities next to them;
  - `rounded-*`, `max-w-*`, `opacity-*` and `(--nest-…)` raw variables.
- Grep of every `<button>`, `<a>` and `<Link>` with its own `className` that doesn't go through `buttonClass`/`iconButtonClass`/`chipClass`, and of every `className` override passed to `Button`/`IconButton`/`Chip`.
- Icons: every `<svg>`, every `<path d>` (grouped by identical path), every local `Icon` helper, every `strokeWidth` and every icon size.
- Inputs: every `<input>`/`<textarea>` class (height, text role, placeholder color, fill, padding).
- Weight check in the compiled CSS (`.next/static`). `.text-title` is `font-weight: var(--tw-font-weight, var(--nest-text-title-weight))`, and `.font-bold` sets `--tw-font-weight`. So `text-title font-bold` renders at 700, not the token's 800.
- Cross-checked against the earlier per-screen findings, so this file names the system-level cause and lists the screen findings it covers (for triage merging).

## Audit summary (`design-system` "Output — Audit")

**Components reviewed:** 14 shared patterns:
- `Button` (4 variants), `IconButton`, `Chip` / `hintChip`, `Glass`, `BottomSheet`, `Dialog` and `ToastRegion`;
- `DecisionButtons`, `BackButton`, `Section` and the name card;
- plus 4 patterns with no shared component: input, segmented control, empty panel, tag.

**Issues found:** 18. **Score: 68/100.** Tokens are strong (0 hex, 0 px font sizes, `designGuard` green). The weak points are components that exist but are bypassed, and patterns that never became components.

### Token coverage

| Category | Defined | Off-token or ad-hoc values found |
|---|---|---|
| Colors | 21 colors + 9 overlays | 0 hex/rgb. 8 raw `(--nest-…)` variable uses, 2 of them where a Tailwind name exists (DS-ALL-15). |
| Type | 24 roles | 0 px sizes. 4 `text-title` overridden to 700 (DS-ALL-10). 3 roles used outside their documented role (DS-ALL-11). |
| Spacing | `space-1…8` (4 px steps, `space-7` missing) | Layout-level half steps: `gap-2.5` ×7, `gap-3.5`/`px-5.5`/`py-7` (deck panels), `gap-4.5`, `p-3.5` (DS-ALL-16). Inside controls, 6/14 px (`gap-1.5`, `px-3.5`) is consistent and kept. |
| Radius | `sm md lg xl pill` | `rounded-full` ×17 next to `rounded-pill` ×52 for the same shape; `rounded-[inherit]` ×1 (DS-ALL-15). |
| Widths and lengths | none | `max-w-[480px]` ×14, `h-[78px]` ×4, `pt-[calc(…+16px)]`/`pb-[calc(…+24px)]` ×7 (DS-ALL-12, -14). |
| Motion | none | See MOT-G2-03 (not repeated here). |

### Component completeness

| Pattern | Shared? | Bypassed in | Variants missing | Score |
|---|---|---|---|---|
| Button | `ui/Button`, `buttonClass` | 6 hand-rolled pills, 2 `!` overrides | 52 px size; secondary-on-canvas "outline" | 6/10 |
| IconButton | yes | `AuthLayout` back link | none | 8/10 |
| Chip | yes | `FiltersSheet` local `chipClass` | 44 px sheet size | 6/10 |
| Text link | `Button variant="link"` | 14 hand-rolled links, 6 looks | an inline link | 4/10 |
| Input | **no** | 9 hand-rolled fields | n/a | 3/10 |
| Segmented control | **no** | 2 identical copies | n/a | 5/10 |
| Icon | **no** (9 local `Icon` helpers) | 34 files draw icons | n/a | 4/10 |
| Empty / end panel | **no** | 6 copies, 3 paddings | n/a | 5/10 |
| Tag / badge | **no** | 4 copies, 2 sizes | n/a | 5/10 |
| Full-screen moment (match, decision) | **no** | 2 near-identical sheets | n/a | 6/10 |
| Page shell | **no** | 7 screens repeat the paddings | n/a | 6/10 |
| Glass, BottomSheet, Dialog, Toast, Section | yes | none | none | 9/10 |

### Priority actions

1. Route every primary/secondary pill through `Button` (DS-ALL-01, -02, -03). It closes four screen findings at once.
2. One `inputClass()` (DS-ALL-06). That's where the 16 px, edge and placeholder fixes from the A11Y and IMP lenses land.
3. One icon module (DS-ALL-08, -09).

---

### DS-ALL-01: Six primary and secondary pills are hand-rolled instead of `Button`

- **Screen and state:** G1 welcome, sign-in (both steps), Google failure, onboarding; G2 deck header; G3 about.
- **Browser:** all (code)
- **What's wrong:** `Button`/`buttonClass("primary","lg")` exists and renders a `Link` when given `href` (`ui/Button.tsx:20`). These rebuild it by hand:
  - `EmailSignIn.tsx:24-25` (`primaryButton`, used at :179, :221);
  - `Onboarding.tsx:237`;
  - `AuthCallback.tsx:63`;
  - `WelcomeActions.tsx:72` (Google);
  - `WelcomeActions.tsx:82` (email: a soft-glass 56 px pill that matches no variant);
  - `AboutContent.tsx:61` (report: surface plus `line` border, 52 px, `text-card-title`, matching no variant);
  - `SwipeHeader.tsx:62` ("השמות שלי": an ink `md` pill with `text-person` instead of `md`'s bold `text-body`).

  The copies drift:
  - none has `touch-manipulation`;
  - only two have the press scale;
  - disabled is `opacity-60` in four, `opacity-70` in `WelcomeActions.tsx:72`, and missing in `AuthCallback.tsx:63`;
  - none gets `names-button-primary`'s glass/no-background shadow switch (`names.css:129`, `:155`).
- **Rule it breaks:** `design-systems` · `SKILL.md` "Keeping the System Alive" · "using the system must be easier than building from scratch". `design` · `SKILL.md` Hard Rules · "Prefer existing patterns over ad-hoc compositions". DESIGN.md · Components · "Fix a pattern in the shared component, never per screen".
- **Severity:** P2
- **Effort:** S
- **Proposed change:** use `Button` (`variant="primary"`, `href` for links) in the 5 ink pills. Give the email sign-in and the report button the `secondary` variant (on "ללא רקע" it's already surface with a `line` border, so the report button keeps its look on about's canvas). Make "השמות שלי" `Button size="md"`, or keep `text-person` as a documented exception in DESIGN.md. Files: `EmailSignIn.tsx`, `Onboarding.tsx`, `AuthCallback.tsx`, `WelcomeActions.tsx`, `AboutContent.tsx`, `SwipeHeader.tsx`.
- **Merges:** IMP-C-G1-15, IMP-A-G1-08, IMP-C-G3-21, MOT-G13-08 (press part), NATIVE-ALL-05 (touch-action part).
- **Guardrail:** polish
- **Screenshot:** code scan; visible states in `shots/baseline/G1/welcome-default-*`, `signin-email-*`, `signin-code-*`, `onboarding-default-*`

### DS-ALL-02: `Button` is missing a 52 px size, so callers force it with `!` overrides

- **Screen and state:** G2 match sheet, decision buttons; G3 about, settings, chosen banner.
- **Browser:** all (code)
- **What's wrong:** `h-13` (52 px) is used for:
  - the three decision pills (`DecisionButtons.tsx:12`);
  - the about report button (`AboutContent.tsx:61`);
  - the match sheet's secondary button, which gets there through `className="h-13! text-card-title"` (`MatchSheet.tsx:143`).

  `ButtonSize` only has `lg` (56) and `md` (44) (`ui/classes.ts:7`, `:18-21`). Other `!` overrides on shared components:
  - `ListsScreen.tsx:616` `text-person!` on `variant="link"`;
  - `SettingsScreen.tsx:355` `items-start! gap-0.5!` on `rowAction`;
  - `ListsScreen.tsx:197` `text-person font-bold` on a `md` secondary.
- **Rule it breaks:** `design` · `SKILL.md` Component Selector step 6 · "If the best-fit component requires an override to work, that is a gap". `design` Hard Rules · "NEVER apply overrides or detach components".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** add `ButtonSize "sm-lg"` (or name it `"tall"`): `h-13 gap-2 px-6 text-card-title`. Use it in `MatchSheet.tsx:143` and `AboutContent.tsx:61`, and drop the `!`. Add a `small` flag to the `link` variant for `text-person` (`ListsScreen.tsx:616`, and it serves DS-ALL-07). File: `ui/classes.ts`.
- **Guardrail:** polish
- **Screenshot:** code scan

### DS-ALL-03: The press and disabled strings are defined twice, with different disabled rules

- **Screen and state:** all screens with buttons.
- **Browser:** all (code)
- **What's wrong:**
  - `PRESS` is declared in `ui/classes.ts:14` and again in `DecisionButtons.tsx:8`.
  - `DISABLED` differs. In `classes.ts:15` it's `disabled:` plus `aria-disabled:opacity-60`. In `DecisionButtons.tsx:9` it's `aria-disabled:` only, plus `cursor-default` and no press scale.
  - `ActionBar.tsx:1-4` imports the DecisionButtons copy for undo.
  - Three more places inline the press string without `touch-manipulation`: `SwipeHeader.tsx:62`, `AboutContent.tsx:61`, `FiltersSheet.tsx:85`.
  - Callers pass `className="aria-disabled:opacity-60"` to `Button`, which already has it: `SettingsScreen.tsx:287`, `:410`, `:423`.
  - So "pressed" and "disabled" look different depending on which file built the button.
- **Rule it breaks:** `design-systems` · `references/component-hierarchy.md` Molecule principles · "Consistent internal spacing: use the same … tokens within a molecule regardless of where it appears". `design-system` · Principles · "Consistency over creativity".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** export `PRESS` and `DISABLED` from `ui/classes.ts` only, and merge in DecisionButtons' `cursor-default` and no-scale-when-disabled rules. Import them in `DecisionButtons.tsx` and `ActionBar.tsx`. Delete the three redundant `aria-disabled:opacity-60` overrides.
- **Merges:** PRO-G1-04 (cursor part).
- **Guardrail:** polish
- **Screenshot:** code scan

### DS-ALL-04: The filters sheet shadows `chipClass` with a second, local chip

- **Screen and state:** G2 filters sheet.
- **Browser:** all (code)
- **What's wrong:** `FiltersSheet.tsx:81-88` declares its own `function chipClass(on)`, with the same name as the shared one in `ui/classes.ts:57`. It's a 44 px chip in `text-person`, surface with a `line` border. It uses `before:-inset-y-0.5`, has no `touch-manipulation`, and has no `DISABLED`. It's used at `:115` and `:139` as raw `<button aria-pressed>` instead of `Chip`. The board-3 sheet chip is a real second variant of the same pattern ("same purpose + same behavior → same pattern"), but the system doesn't know about it.
- **Rule it breaks:** `design-systems` · `SKILL.md` "The Same or Different? Decision" · "Same purpose + same behavior → Same pattern, even if visually different → Consolidate". `design-systems` · Naming Principles · "Use the name everywhere".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** `chipClass(selected, size: "sm" | "md" = "sm")` in `ui/classes.ts`, with `md` = the filters look plus `PRESS`/`DISABLED`, and `Chip size="md"`. Replace the local function and the two raw buttons. Document "Sheet chip (md)" under DESIGN.md Chips.
- **Merges:** NATIVE-ALL-05 (touch-action part), NATIVE-ALL-02 (double-tap selection on chips; the fix lands in the shared class).
- **Guardrail:** polish
- **Screenshot:** code scan; `shots/baseline/G2/filters-*`

### DS-ALL-05: The segmented control is copied in two screens

- **Screen and state:** G3 lists tabs, duel source picker.
- **Browser:** all (code)
- **What's wrong:** `ListsScreen.tsx:209` and `:223` (tablist) and `DuelScreen.tsx:179` and `:192` (radiogroup) repeat the same container and the same selected/unselected classes character for character: `grid … gap-1 rounded-pill border border-line bg-surface p-1`, then `min-h-11 rounded-pill px-2 text-person font-bold ${on ? "bg-ink text-surface" : "text-ink-soft hover:bg-sand"}`. Neither has `PRESS`/`touch-manipulation`.
- **Rule it breaks:** `design-systems` · Governance "Acceptance criteria for new patterns" · "Used (or needed) in 3+ contexts". It's 2 today, so a shared class is enough, not a component. `design-system` · Principles · "Consistency over creativity".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `segmentGroupClass()` and `segmentClass(selected)` in `ui/classes.ts`, used by both. Add a "Segments" line to DESIGN.md Navigation.
- **Guardrail:** polish
- **Screenshot:** code scan; `shots/baseline/G3/lists-*`, `duel-*`

### DS-ALL-06: Nine text fields are hand-rolled, with three heights, five text roles and two placeholder colors

- **Screen and state:** G1 sign-in, code, onboarding, intro surname; G2 report, survey; G3 add-name, settings name, invite link.
- **Browser:** all (code)
- **What's wrong:** DESIGN.md "Inputs": surface, `line` border, `radius-md`, 48 px, `text-intro`, `stone` placeholders. No shared class exists. What the code does:

  | File:line | Height | Text | Placeholder | Fill | Padding |
  |---|---|---|---|---|---|
  | `Intro.tsx:144` | h-12 | intro | stone | surface | px-3.5 |
  | `lists/AddNameSheet.tsx:86` | h-12 | intro | stone | surface | px-3.5 |
  | `about/ReportSheet.tsx:30` | (none) | intro | none | surface | px-3.5 |
  | `Onboarding.tsx:166` | h-14 | card-title | **faint** | surface | **px-4** |
  | `EmailSignIn.tsx:174` | h-14 | card-title | **faint** | surface | px-3.5 |
  | `auth/CodeInput.tsx:73` | h-14 | title (centered) | **faint** | surface | px-3.5 |
  | `SurveySheet.tsx:34` | min-h-22 | **body** | none | surface | px-3.5 py-3 |
  | `SettingsScreen.tsx:285` | min-h-11 | **body** | none | **sand** | **px-3** |
  | `InviteScreen.tsx:172` | min-h-11 | **caption** | none | **sand** | **px-3** |

  `aria-invalid:border-urgent` is on 5 of the 9. The code field is a deliberate variant. The invite link is read-only, so it's arguably a different pattern ("same appearance, different purpose").
- **Rule it breaks:** `design-systems` · `SKILL.md` "Signals You Need One" · "Visual audit reveals … 5+ type scales". `design-systems` · `references/component-hierarchy.md` · "Form field (label + input + helper text + error message)" is a core molecule. DESIGN.md · Inputs (stone placeholders).
- **Severity:** P2
- **Effort:** S
- **Proposed change:** `inputClass({ multiline?, code? })` in `ui/classes.ts` with DESIGN.md's spec plus `aria-invalid:border-urgent`, used in the 7 editable fields. The settings and invite `sand` fills become `surface`, or are documented as "read-only field". The ≥ 16 px font-size fix (IMP-A) and the visible-edge fix (A11Y) are then made once, in this class. Changing the `text-intro` value would be a token change (owner, §3.2); a new `text-input` token is allowed.
- **Merges:** IMP-C-G1-06, IMP-C-G3-16, IMP-A-G1-02, IMP-A-G2-04, IMP-A-G3-05, A11Y-G1-01, A11Y-G2-02, A11Y-G3-01, ELEV-G1-02, ELEV-G2-05.
- **Guardrail:** polish
- **Screenshot:** code scan; per-screen shots in the merged findings

### DS-ALL-07: Text links come in six looks, and `Button variant="link"` is used for only some of them

- **Screen and state:** G1 welcome, join, onboarding, closed notice, offline, 404, error; G2 filters, detail source, about; G3 legal, duel.
- **Browser:** all (code)
- **What's wrong:** links built by hand, grouped by look:
  - (a) `font-bold underline underline-offset-2`, inheriting size: `welcome/page.tsx:37`, `:41`, `JoinScreen.tsx:35`, `:39`, `Onboarding.tsx:33`, `ClosedNotice.tsx:19`, `legal/LegalScreen.tsx:11`. Some have `-my-3 inline-flex min-h-11`, some don't.
  - (b) `text-card-title underline-offset-4`, no bold: `not-found.tsx:12`, `error.tsx:26`, `offline/page.tsx:20`. Three identical copies of "back to /names".
  - (c) `text-person font-bold underline-offset-2 -my-1.5`: `AboutContent.tsx:5`, `SourceSection.tsx:7`. Two identical constants.
  - (d) `text-person font-bold text-ink-soft underline-offset-4`: `FiltersSheet.tsx:256`.
  - (e) `text-person font-bold text-ink-soft underline`, no offset: `DuelScreen.tsx:290`.
  - (f) `text-card-title font-bold underline-offset-4`: `EmailSignIn.tsx:230`. This one matches `variant="link"` but is hand-built.
- **Rule it breaks:** `design-systems` · Interface Inventory · "The inconsistencies sell themselves". `design-system` · Naming Consistency.
- **Severity:** P3
- **Effort:** S
- **Proposed change:** `linkClass("inline" | "standalone" | "quiet")` in `ui/classes.ts`:
  - `inline`: inherit size, bold, offset 2, `-my-3 min-h-11`;
  - `standalone`: `Button variant="link"`;
  - `quiet`: `text-person`, `ink-soft`, offset 4.

  Replace the 14 sites. Make `not-found`/`error`/`offline` share one "back to the app" link.
- **Guardrail:** polish
- **Screenshot:** code scan

### DS-ALL-08: Icons are drawn inline in 34 files through 9 local `Icon` helpers, and the check mark is drawn two ways

- **Screen and state:** all.
- **Browser:** all (code)
- **What's wrong:**
  - **No shared icon module.** Local `Icon` wrappers, each with its own defaults:
    - `Intro.tsx:14`, `BackgroundSheet.tsx:33`, `DecisionButtons.tsx:28` (exported);
    - `lists/DuelScreen.tsx:28`, `lists/ListsScreen.tsx:42`, `lists/RowMenu.tsx:18`;
    - `swipe/SwipeHeader.tsx:8`, `pwa/Install.tsx:41`.
  - The same glyph is pasted again and again:
    - close "M6 6l12 12M18 6L6 18" ×10, at 20 px except `SurveyPrompt.tsx:33` at 16 px;
    - chevron "M9 6l6 6-6 6" ×7 and "M15 6l-6 6 6 6" ×4;
    - heart ×4, bookmark ×3, eye-off ×2, wifi-off ×2.
  - **The check mark is two different shapes:** "M5 12.5l4.5 4.5L19 7.5" (`DecisionButtons.tsx:52`, `ReportSheet.tsx:115`, `RowMenu.tsx:105`) and "M5 12l5 5 9-10" with stroke 3 (`BackgroundSheet.tsx:219`).
  - **The back button is built twice.** `BackButton.tsx` uses `IconButton`. `auth/AuthLayout.tsx:39-47` rebuilds it as a `Link` with `names-glass-soft size-11`, with no press state and no `touch-manipulation`.
- **Rule it breaks:** `design-systems` · Audit categories checklist · "Icon styles". `design-systems` · `references/component-hierarchy.md` Atoms · "icon … appears as a building block inside multiple larger patterns". DESIGN.md · Shapes · "Line icons have a 2 px stroke … Feather/Lucide style".
- **Severity:** P3
- **Effort:** M
- **Proposed change:** `ui/icons.tsx` with one `Icon({ size = 20 })` (stroke 2, round caps and joins, `aria-hidden`) and named glyphs: `CloseIcon`, `ChevronIcon` (mirrored via `ltr:-scale-x-100`), `HeartIcon`, `BookmarkIcon`, `CheckIcon` (one path), `EyeOffIcon`, `WifiOffIcon`. Replace the local helpers. Make `AuthLayout`'s back an `IconButton` with `href`, or reuse `BackButton` with an `href` prop. It's mechanical, but spread over many files: split it per group in triage.
- **Guardrail:** polish
- **Screenshot:** code scan

### DS-ALL-09: Five icons are off the 2 px stroke

- **Screen and state:** G2 filters (theme icons), card's "לכל הפרטים" chevron, background tick; G3 add-name error; G2 report error and thanks.
- **Browser:** all (code)
- **What's wrong:** DESIGN.md: "Line icons have a 2 px stroke". Off it:
  - `ThemeIcon.tsx:90` 1.8;
  - `card/NameCard.tsx:70` 2.5;
  - `lists/AddNameSheet.tsx:90`, `about/ReportSheet.tsx:35`, `:114` 2.4;
  - `BackgroundSheet.tsx:218` 3.

  30 other icons use 2.
- **Rule it breaks:** `design-systems` · `references/perceptual-patterns.md` · iconography is a perceptual pattern applied the same everywhere. DESIGN.md · Shapes.
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** set all to 2. At 14 px, if 2 reads thin, use a documented "small icon" stroke in the shared `Icon` (DS-ALL-08) rather than per-file values.
- **Merges:** ELEV-G2-06.
- **Guardrail:** polish
- **Screenshot:** code scan; `shots/baseline/G2/deck-bg-*`, `filters-default-*`, `background-default-*`

### DS-ALL-10: The deck's end and pause titles drop `text-title` from 800 to 700

- **Screen and state:** G2 deck end, empty filter result, pause (invite and survey).
- **Browser:** all (verified in the compiled CSS)
- **What's wrong:** `swipe/EmptyDeck.tsx:49`, `:64` and `swipe/PausePanel.tsx:50`, `:80` write `text-title font-bold`. In Tailwind 4, `.text-title` reads `font-weight: var(--tw-font-weight, var(--nest-text-title-weight))` and `.font-bold` sets `--tw-font-weight: 700`. So these four titles render at 700, while the other `text-title` headings (screen and sheet titles) render at the token's 800. Same role, two weights.
- **Rule it breaks:** DESIGN.md · Typography · "Each token sets size, line height and weight together". `design-systems` · `references/perceptual-patterns.md` Typography Rules · "Don't use more than 4 weights" (consistency of a role's weight).
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** remove `font-bold` from the four headings, and change the two `font-normal` spans to `font-medium` (see Checked and held). Add a `designGuard` assertion that a heading role (`text-title|section|display|row-name`) isn't combined with a weight utility.
- **Guardrail:** polish
- **Screenshot:** code scan; `shots/baseline/G2/deck-end-*`, `deck-empty-filter-*`, `deck-pause-*`

### DS-ALL-11: Some type roles are used outside the job DESIGN.md gives them, and section labels come in two looks

- **Screen and state:** all.
- **Browser:** all (code)
- **What's wrong:**
  - **`text-person`** is documented for "a known-person row" and "the השמות שלי pill", but it's used 36 times as the app's general small bold label: segment tabs, field labels (`AddNameSheet.tsx:67`), eyebrows ("יש התאמה", `MatchSheet.tsx:126`, `DecisionSheet.tsx:70`), links, filter chips and list metadata.
  - **`text-peek`** ("the name on the farther peeking card") sets the filters sheet's letter-range row (`FiltersSheet.tsx:315`).
  - **`text-ref`** ("the verse's reference") sets the card's stat and bar labels (`CardSexBar.tsx:15`, `CardStats.tsx:28`, `:55`) and the background sheet's credit (`BackgroundSheet.tsx:224`).
  - **Section labels:** the detail sheet's are `text-tag text-ink-soft` (`detail/Section.tsx:11`), settings' are `text-label text-stone` (`SettingsScreen.tsx:78`). DESIGN.md lists both tag and label for section labels.

  Values match (person 13/18/500, ref 12/16/500), so nothing looks broken. The names just don't tell the next developer which role to pick.
- **Rule it breaks:** `design-systems` · Naming Principles · "Name by structure, not content: … 'Badge' not 'Status badge'". Also the Naming Test: "The name works across all contexts where the pattern appears".
- **Severity:** P3
- **Effort:** XS (docs) / S (aliases)
- **Proposed change:** document what's actually done in DESIGN.md Typography:
  - `text-person` = "small label (13)", for controls, eyebrows and field labels;
  - `text-ref` = "small meta (12)", also stat labels;
  - one section-label style: tag in `ink-soft` for sheets, label in `stone` for settings groups. Or pick one.

  Optionally add alias tokens `text-small-label` / `text-meta` in the token script, pointing at the same values (a new token is allowed; existing values don't change). Move `FiltersSheet.tsx:315` to `text-card-title` or `text-person font-extrabold`.
- **Guardrail:** polish (docs and aliases only; no token value changes)
- **Screenshot:** code scan

### DS-ALL-12: Content width is `max-w-[480px]` in 14 places, while DESIGN.md says `max-w-md`

- **Screen and state:** every page shell, every sheet panel on desktop, background blobs.
- **Browser:** all (code)
- **What's wrong:**
  - `max-w-[480px]` (an arbitrary px) is repeated in `AuthLayout.tsx:37`, `HiddenScreen.tsx:61`, `InviteScreen.tsx:145`, `SettingsScreen.tsx:254`, `ListsScreen.tsx:181`, `DuelScreen.tsx:156` (blob), `:161`, `AboutScreen.tsx:15`, `LegalScreen.tsx:25`, `ScreenBackground.tsx:133`, `:139`, `:145`, `:182` and `BottomSheet.tsx:318`.
  - DESIGN.md Layout says "Content is capped at `max-w-md`" (448 px), which only `ToastRegion.tsx:26` and `Dialog.tsx:53` use.
  - The page-shell paddings `pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+24px)]` are repeated in 7 screens (`InviteScreen.tsx:145`, `SettingsScreen.tsx:254`, `HiddenScreen.tsx:61`, `DuelScreen.tsx:161`, `ListsScreen.tsx:181`, `AboutScreen.tsx:15`, `LegalScreen.tsx:25`), with px literals where `space-4`/`space-6` exist.
- **Rule it breaks:** `design-systems` · `SKILL.md` Design Tokens · "Never use raw hex codes, pixel values, or magic numbers in component code". `design-systems` · `references/component-hierarchy.md` Templates · a page layout is a pattern of its own.
- **Severity:** P3
- **Effort:** S
- **Proposed change:** add a `--nest-content-max: 480px` token (new token, allowed) with a Tailwind `max-w-content` name. Add a `names-page` class (or a `PageShell` component) in `names.css` for the `mx-auto w-full max-w-content px-5` plus safe-area paddings, using `var(--spacing)` steps. Correct DESIGN.md's "max-w-md" to the token.
- **Guardrail:** polish
- **Screenshot:** code scan

### DS-ALL-13: Empty and end panels are copied six times with three different paddings

- **Screen and state:** G2 deck end, empty filter, pause; G3 empty saved, empty matches, solo matches, empty hidden.
- **Browser:** all (code)
- **What's wrong:**
  - `swipe/EmptyDeck.tsx:41-45` and `swipe/PausePanel.tsx:42-46` are character-identical shells (`pb-7`, `Glass … gap-3.5 rounded-xl px-5.5 py-7`), with off-rhythm 14/22/28 px.
  - The list empty cards use `rounded-lg bg-surface px-4 py-6 shadow-card` (`HiddenScreen.tsx:79`, `ListsScreen.tsx:359`, `:513`).
  - The solo-matches card uses `px-5 py-7 gap-3` (`ListsScreen.tsx:588`), with an icon well (`:589`) that no other empty state has.
- **Rule it breaks:** `design-systems` · Audit categories · "Loading and empty states". `design-systems` · `references/perceptual-patterns.md` Spacing · "Consistency: All cards in a grid use the same gap".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** one `emptyPanelClass("glass" | "card")` in `ui/classes.ts`: gap 3, padding `px-5 py-6` (or `py-8`), radius per DESIGN.md (`xl` for empty-state cards). Use it in all six. Keep the solo icon well as an optional slot.
- **Guardrail:** polish (same layout; spacing snaps to the scale)
- **Screenshot:** code scan; `shots/baseline/G2/deck-end-*`, `deck-pause-*`; `shots/baseline/G3/lists-saved-empty-*`, `lists-matches-empty-*`, `lists-matches-solo-*`, `hidden-empty-*`

### DS-ALL-14: The match and decision screens are two near-identical full-screen sheets

- **Screen and state:** G2 match sheet, decision sheet ("בחרנו שם").
- **Browser:** all (code)
- **What's wrong:** `MatchSheet.tsx:108-147` and `DecisionSheet.tsx:61-90` repeat the same structure line for line:
  - the section with `names-sheet-in min-h-[calc(100dvh-…)] gap-6 px-5 pt-14 pb-8`;
  - the `IconButton` close with its inline X;
  - the eyebrow `text-person font-bold text-clay-deep`;
  - the `Glass … gap-2.5 rounded-xl px-6 py-8` holding `text-match-name`, the clay dot, `text-match-line` and the caption;
  - a `gap-3` button stack.

  They differ in copy, which buttons there are, and analytics. The two "moments" stay identical only while both files are edited together.
- **Rule it breaks:** `design-systems` · "The Same or Different? Decision" · "Same purpose + same behavior → Same pattern". `design-systems` · `references/component-hierarchy.md` Organisms.
- **Severity:** P3
- **Effort:** M
- **Proposed change:** a `MomentSheet` (`src/components/names/MomentSheet.tsx`) with `eyebrow`, `name`, `line`, `meta` and `actions` props, used by both. Same DOM and classes, so no visual change. Moving `gap-2.5` to `gap-3` is optional (DS-ALL-16).
- **Guardrail:** polish (refactor, no look change)
- **Screenshot:** code scan; `shots/baseline/G2/match-default-*`, `decision-shared-*`, `decision-solo-*`

### DS-ALL-15: Tags, the clay dot and token aliases are spelled ad hoc

- **Screen and state:** G2 card, detail header; G3 lists rows, duel; background sheet; intro.
- **Browser:** all (code)
- **What's wrong:**
  - **Tags.** The sex tag `rounded-pill bg-peach-soft px-2.5 py-1.5 text-tag text-clay-deep` is pasted in `card/CardHeader.tsx:30` and `detail/NameDetailSheet.tsx:202`. The "חדש" badge is the same pill at another size (`ListsScreen.tsx:393`: `px-2 py-0.5 text-label`).
  - **Duel chips.** The duel's top-five chips (`DuelScreen.tsx:279`) are a selected-chip look on a non-control.
  - **Clay dot.** `size-2.5 rounded-full bg-clay` appears 5 times (`Intro.tsx:84`, `MatchSheet.tsx:131`, `DecisionSheet.tsx:75`, `ListsScreen.tsx:611`, `SwipeHeader.tsx:56`).
  - **Radius.** `rounded-full` (17) and `rounded-pill` (52) are both used for the same fully round shape, and `rounded-[inherit]` once (`SettingsScreen.tsx:45`).
  - **Raw variables** used where Tailwind names exist: `shadow-(--nest-shadow-card-raised)` (`BackgroundSheet.tsx:207`; `shadow-card-raised` exists) and `from-(--nest-canvas)` (`Intro.tsx:152`; `canvas` exists).
  - **Overlay tokens.** `bg-(--nest-ink-45)` (scrim, `BottomSheet.tsx:253`, `Dialog.tsx:43`), `bg-(--nest-white-75)`, `bg-(--nest-white-55)` and `bg-(--nest-peach-pale-60)` have no Tailwind name.
  - **Opacities.** `opacity-[0.22]` and `opacity-[0.18]` (`ScreenBackground.tsx:146-147`) are arbitrary.
- **Rule it breaks:** `design-systems` · `references/design-tokens.md` Token Audit Checklist · "Every raw value in component code traces back to a token" and "Naming is consistent and predictable across all categories".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:**
  - `tagClass("sm" | "xs")` and `dotClass()` in `ui/classes.ts`;
  - `rounded-full` → `rounded-pill`;
  - `shadow-card-raised`, `from-canvas`;
  - add Tailwind color names for the overlay tokens in the token script (`bg-scrim`, `bg-white-75` …; new names, same values);
  - blob opacities become a token or the existing 20/25 steps.

  The duel chips are IMP-C-G3-13's call (a non-control look).
- **Merges:** IMP-C-G3-13 (duel chips).
- **Guardrail:** polish
- **Screenshot:** code scan

### DS-ALL-16: Layout spacing uses half steps that aren't in DESIGN.md's scale

- **Screen and state:** sheets, dialogs, about, invite, card.
- **Browser:** all (code)
- **What's wrong:** DESIGN.md's spacing is `space-1…8` in 4 px steps. Half steps used *between* blocks (not inside controls):
  - `gap-2.5` (10 px): `DecisionSheet.tsx:71`, `MatchSheet.tsx:127`, `InviteScreen.tsx:177`, `ui/Dialog.tsx:61`, `FiltersSheet.tsx:296`, `BackgroundSheet.tsx:98`, `card/CardBible.tsx:19`;
  - `gap-3.5`, `px-5.5`, `py-7`, `pb-7`: DS-ALL-13;
  - `gap-4.5` and `p-3.5`: `about/AboutContent.tsx:34`, `:40`;
  - `py-2.5`: `SurnameSection.tsx:23`, `TogetherSection.tsx:13`, `CardBible.tsx:19`;
  - `-my-1.5` and `-my-3` hacks to keep 44 px links from moving the line (DS-ALL-07).

  Inside controls, 6 and 14 px (`gap-1.5` ×34, `px-3.5` ×16) are consistent with `Button md` and are kept (the skill's hybrid 4/8 rule).
- **Rule it breaks:** `design-systems` · `references/perceptual-patterns.md` Spacing Systems · "Choose a base unit and build all spacing from multipliers of it". Also the Token Audit Checklist: "Spacing scale is consistent (base unit × multiplier, no arbitrary gaps)".
- **Severity:** P3
- **Effort:** XS per file
- **Proposed change:** snap `gap-2.5` → `gap-3`, `gap-3.5` → `gap-3`/`gap-4`, `gap-4.5` → `gap-4`, `px-5.5` → `px-5`, `py-7` → `py-6`/`py-8`, `p-3.5` → `p-4`. Check each against its board first: the moment cards and the dialog are ≤ 2 px moves. Or add `6`/`10`/`14` to DESIGN.md's documented scale if the boards use them on purpose.
- **Guardrail:** polish
- **Screenshot:** code scan

### DS-ALL-17: Skeletons use a magic row height and four different looks

- **Screen and state:** G3 lists and hidden loading; app auth loading; invite loading; detail pending.
- **Browser:** all (code)
- **What's wrong:**
  - `h-[78px]` is repeated in `HiddenScreen.tsx:75` and `ListsScreen.tsx:249`, `:323`, `:505`: an arbitrary px that has to match a list row's real height.
  - The skeleton looks differ:
    - white surface cards (lists);
    - `bg-surface/60 aspect-[3/4]` (`AuthGuard.tsx:15`);
    - `sand` blocks (`InviteScreen.tsx:211-212`);
    - `sand` pills (`detail/DetailsPending.tsx:15-16`).
- **Rule it breaks:** `design-systems` · Audit categories · "Loading and empty states". `references/design-tokens.md` · "Every raw value … traces back to a token".
- **Severity:** P3
- **Effort:** S
- **Proposed change:** one `skeletonClass()` (sand on canvas, `names-well` on glass), with the row height from the row's own min-height token. This is where ELEV-G3-02's "placeholders that match the list" fix lands.
- **Merges:** ELEV-G3-02.
- **Guardrail:** polish
- **Screenshot:** code scan (no loading state in the G3 baseline; `shots/baseline/G2/detail-loading-*` shows `DetailsPending`)

### DS-ALL-18: DESIGN.md doesn't list the patterns the code relies on

- **Screen and state:** documentation.
- **Browser:** n/a
- **What's wrong:** DESIGN.md Components has no entry for these, although each exists in code:
  - text input as a class (DS-ALL-06);
  - segments (-05);
  - text links (-07);
  - icons (-08);
  - empty panel (-13);
  - tag (-15);
  - skeleton (-17);
  - the full-screen moment (-14);
  - the page shell (-12);
  - `RowMenu` / `SkipButton` menus (both build `ITEM`-style menu rows: `RowMenu.tsx:15`, `SkipButton.tsx:133`);
  - settings rows (`SettingsScreen.tsx:43-45`).

  Several documented specs disagree with the code: "Content is capped at `max-w-md`" (-12) and the input placeholders (-06). There's also no states table per component (`design-systems` Component Specification: "States: default, hover, active, focus, disabled, loading, error, empty").
- **Rule it breaks:** `design-system` · Principles · "Document everything: if it's not documented, it doesn't exist". `design-systems` · `references/pattern-documentation.md` · Anatomy of a Pattern Entry (States, Tokens Used).
- **Severity:** P3
- **Effort:** S
- **Proposed change:** after the DS polish items land, add those entries to DESIGN.md Components (anatomy, tokens, states) and fix the two wrong specs. Docs only; it goes with the slot that implements DS-ALL-06/-12, or with US-FINAL's docs commit.
- **Guardrail:** polish (docs)
- **Screenshot:** n/a

## Checked and held (no finding)

| Check | Result |
|---|---|
| Hex / rgb / px font sizes in names code | 0 (`tests/names/designGuard.test.ts` green at HEAD) |
| Glass panels | All through `Glass`/`glassClass`/`names-glass*` classes; the solid fallback lives in one place (`names.css`) |
| Sheets and dialogs | Every sheet is a `BottomSheet`; every confirm is a `Dialog`; one `ToastRegion` |
| Icon-only controls | All on `IconButton`, except `AuthLayout`'s back link (DS-ALL-08), the row menu trigger (`iconButtonClass()`, correct) and undo (`ActionBar` `UNDO`: same look on strong glass, deliberate) |
| Decision buttons | One `DecisionButtons` shared by the action bar and the sheet (DESIGN.md) |
| Logical properties | No `ml-/mr-/pl-/pr-/left-/right-` utilities in names code (the 3 grep hits are the words "right-most"/"right-click" in comments) |
| Font families | One (`font-nest`). Weights: `font-bold` ×72, `font-medium` ×12, `font-extrabold` ×2 (= 800). `font-normal` (400) ×2 (`SettingsScreen.tsx:358`, `detail/SimilarSection.tsx:24`) is below Heebo's self-hosted 500–800 range, so it renders as 500. That's harmless, but it reads as a 4th weight: fold it into DS-ALL-10's fix (`font-medium`) |
| Shadows | Token names only (`shadow-card`, `-hero`, `-button`, `-glass`), except DS-ALL-15's one raw var |
