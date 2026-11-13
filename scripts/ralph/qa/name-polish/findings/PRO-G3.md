# PRO · G3: Lists and settings (saved, matches, duel, row menu, add-name, chosen banner, hidden, settings and its dialogs, about, privacy, terms)

Run 2026-11-07 by US-A-PRO-G3 at `501b57e` (no app code change since the US-007 baselines at `f513415`: `git diff f513415 HEAD -- src` is empty).

Skill: `ui-ux-pro-max` (`.claude/skills/ui-ux-pro-max/SKILL.md`). References read: `references/quick-reference.md` (all 10 categories, the rule IDs cited below) and `references/pro-rules.md` (the professional-UI tables and the canonical Pre-Delivery Checklist). `scripts/search.py` was run with `python3` for the rules cited: `"press feedback active state" --domain ux`, `"destructive action separated" --domain ux`, `"landscape orientation layout" --domain ux`, `"tabular numbers count" --domain ux`.

Assumptions where the skill would ask: as in PRO-G1/G2. The stack is detected (Next.js 16 + Tailwind 4). The review method for an existing UI is "priority 1→10, then the Pre-Delivery Checklist". `--design-system` / `--persist` weren't run, because they would replace the owner's look (PRD §3.1.1–2). No palette, font or GSAP preset is proposed. Dark-mode items are n/a (light only by design). Searches that returned off-topic rows fall back to the static rule in `quick-reference.md` (the skill's "retry once, then fall back"):
- `destructive action separated` returned only "Confirmation Dialogs", so -02 cites `destructive-nav-separation` / `destructive-emphasis`
- `landscape orientation layout` returned "Fixed Positioning", so -03 cites `orientation-support`
- `tabular numbers count` returned "Number Formatting"

## Method and evidence

- **Probe** `shots/pro-g3-probe.mjs` (gitignored). It's the PRO-G2 probe (same `measure()`, same mocks) with the 23 G3 states from `us007-g3.mjs`:
  - saved, row menu, add-name, add-name error, saved empty, hidden empty, chosen banner
  - matches solo, shared, shared empty
  - duel: round 1, mid-way, done, between matches, too few
  - hidden
  - settings solo and shared, the delete and leave dialogs (opened by URL, never confirmed)
  - about, privacy, terms

  **Safety:** a catch-all route answers every non-GET to `/rest/v1`, `/api/names` and `/functions/v1` at once with 503 (the IMP-A-G3 incident). The specific mocks (votes echoed, tracking 204) are registered after it and win. Nothing is held, and nothing is sent. `login.mjs 1` was re-run first.
- **Modes:** WebKit iPhone 15 portrait, landscape 844 × 390 and 320 × 568; Chromium Pixel 7 portrait, 200 % zoom (206 × 420) and desktop 1280 × 800. Every state ran in every mode (138 measurements, 0 errors).
- **Contrast:** `CONTRAST=1 node shots/pro-g3-probe.mjs webkit contrast`. It checks every text node against its composited background. G3's surfaces are opaque (cards, sheet, page, peach banner), so no rendered-pixel pass was needed.
- **Simulator** (Mobile Safari, iPhone 17 Pro, :3100): Safari is still signed out, so `/names/settings` and `/names/lists` land on welcome (`audit/PRO-G3/settings-sim.png`, `lists-sim.png`). As in PRO-G2, the Safari judgement uses the US-007 Safari set `baseline/G3/*-sim.png` (11 states, no code change since).
- **Shots:** `scripts/ralph/qa/name-polish/shots/audit/PRO-G3/<state>-<engine>[-landscape|-w320|-zoom200|-desktop].png`.
- **Harness noise:** one `pageerror` per context ("The operation is insecure"). It comes from the probe's prefs init script on `about:blank`, as in PRO-G2.

## Checklist results (priority order, then Pre-Delivery Checklist)

| # | Category | Result |
|---|---|---|
| 1 | Accessibility | **Contrast passes everywhere:** the worst text is 5.1:1 (10.5 px section labels, about's source caption), the custom-name and hint captions 5.7:1, "כבר ברשימה" 6.9:1, everything else ≥ 7.9:1. The tabs are a real `tablist` with `aria-selected` and roving `tabIndex`. The row menu uses `menuitem`s. The duel bar is a `progressbar`. Both settings confirms are `alertdialog`, `aria-modal`, named by their question, with focus on "ביטול". The add-name error is linked by `aria-describedby` and shown with an icon and text, not color alone. Headings are sequential on every page |
| 2 | Touch & Interaction | All targets ≥ 44 px in every mode except the chosen banner's "ביטול" (39 × 44, already IMP-A-G3-06). Gaps: tabs 4 px apart inside one segmented control, menu items and settings rows stacked with dividers (list patterns, not separate targets). `touch-action: manipulation` on controls. **Press feedback:** -01 |
| 3 | Performance | 400 rows render without virtualization (IMP-A-G3). Skeletons for matches loading. Failure states are IMP-A-G3-01/-02 |
| 4 | Style | One icon family. One ink CTA per state: the selected tab is ink as a selection state, not a CTA; add-name "הוספה לרשימה"; duel result "בחרתי בשם…". The ink destructive confirms are IMP-C-G3-15 |
| 5 | Layout & Responsive | No horizontal overflow and nothing out of reach in any state or mode, including 200 % zoom. At 200 % the "השמות שלי" and "דו־קרב" titles wrap, and so does the duel tab label, all readable. **Landscape duel:** -03 |
| 6 | Typography & Color | Tokens only. Legal and about paragraphs are 13.5/1.63 at 34–45 characters a line. List intros are 13/1.38 and two lines, as in G2. 10.5 px section labels and the "חדש" badge are PRO-G2-06 (owner) and IMP-C-G3-24. The tab counts ("שמרתי · 8", "התאמות · 3") aren't `tabular-nums`: add them to PRO-G2-04's list. The duel counter is IMP-C-G3-11 |
| 7 | Animation | The duel's snap between pairs is IMP-C-G3-12, which goes to MOT |
| 8 | Forms & Feedback | Add-name: visible label, persistent hint, inline error. Destructive actions are confirmed (`confirmation-dialogs`). The missing undo is IMP-C-G3-01, and the requests with no timeout are IMP-A-G3-04. Settings' "שמירה" is natively `disabled` at opacity 0.6 until the name changes. A single disabled button stays readable, as decided in PRO-G2-03 |
| 9 | Navigation | Tabs are deep links (`?tab=`), and so are the dialogs (`?dialog=`) and the sheet (`?sheet=add-name`). The back arrow from legal pages is IMP-C-G3-03. Finding hidden names is IMP-C-G3-05. **Leave the shared choice:** -02 |
| 10 | Charts | n/a in G3 (the duel's progress bar has a role and a value) |
| — | `cursor-pointer` (web) | `<button>`s show the arrow on desktop (PRO-G1-04) |

**Checked and not kept:**
- **Tabs 4 px apart** against `touch-spacing` 8 px: they're one segmented control, each segment 44 px tall and a third of the width. Platform segmented controls touch.
- **Row menu items 0 px apart,** and the menu covering the next row's "⋮": a popover menu over its list, closed by Escape or an outside tap.
- **Settings rows 1 px apart:** an inset grouped list with dividers, each row 56 px tall.
- **Matches and hidden intros at line-height 1.38** (`line-height` asks for 1.5–1.75 for body text). They're two-line captions in the `caption` token, the same call as G2.

## Findings

Severity is the PRD's scale (§7). Shot paths are relative to `scripts/ralph/qa/name-polish/shots/`.

### PRO-G3-01: Lists and settings controls give no feedback on tap (merge with PRO-G2-02, PRO-G1-03)

- **Screen and state:**
  - `/names/lists`: the three tabs, each row's name button (opens the name sheet), the row menu items ("בחרתי בשם…", "הסרה מהרשימה", "לא להציג יותר"), the chosen banner, the duel link card
  - `/names/settings`: every row ("הזמנת מישהו לבחור ביחד", "יציאה מהבחירה המשותפת", "על הנתונים", "התקנה למסך הבית", terms, privacy, "יציאה מהחשבון", "מחיקת החשבון")
  - `/names/about`: the source links; privacy and terms: the email links
- **Browser:** webkit-iphone, chromium-pixel, sim-safari
- **What's wrong:** the probe found no `active:` class on any of these. The tap highlight is off app-wide (`names.css:45`), so a tap shows nothing until the result arrives.
  - **Tabs** (`lists/ListsScreen.tsx:226`) and **menu items** (`lists/RowMenu.tsx:15`) have `hover:bg-sand` only, which a touch screen doesn't show.
  - **Settings rows** (`SettingsScreen.tsx:45` `rowAction`, used by `LinkRow` `:59`/`:65`) navigate to a route that has to load, or open a dialog.
  - **Row name buttons** (`ListsScreen.tsx:434` `RowName`) open the sheet, which takes a moment the first time (the details file).
  - On the same screens, the "⋮", "החזרה", "הוספת שם" and the pills do press (`PRESS`).
- **Rule it breaks:** `ui-ux-pro-max` · `quick-reference.md` §2 `press-feedback` "Visual feedback on press" and §3 `tap-feedback-speed` "within 100ms of tap"; `pro-rules.md` "Tap feedback · Don't: No visual response on tap"; §4 `state-clarity`; search `ux` "Active States · Do: Add pressed/active state visual change"
- **Severity:** P3
- **Effort:** S
- **Proposed change:** the same shared, non-scaling pressed fill as PRO-G2-02, with no new token:
  - `rowAction` and `RowName` get `active:bg-sand` (the rows are inside `rounded-[inherit]` cards, so the fill keeps the corners)
  - `RowMenu` `ITEM` and the unselected tab get `active:bg-sand` next to their `hover:`
  - the link-styled anchors move to the `link` variant once PRO-G2-02 gives it a pressed opacity

  No scale on full-width rows (`pro-rules.md` "Stable Interaction States"). Do it in one story with PRO-G1-03 and PRO-G2-02. The duel cards are IMP-C-G3-12.
- **Guardrail:** polish
- **Screenshot:** `audit/PRO-G3/settings-shared-webkit.png`, `audit/PRO-G3/row-menu-webkit.png`, `audit/PRO-G3/saved-webkit.png`

### PRO-G3-02: "Leave the shared choice" sits in the invite card as a normal row, while it deletes the matches

- **Screen and state:** `/names/settings`, shared space, section "בחירה ביחד"
- **Browser:** webkit-iphone, chromium-pixel, sim-safari (`baseline/G3/settings-shared-sim.png`, `settings-leave-dialog-sim.png`)
- **What's wrong:** "יציאה מהבחירה המשותפת" (`SettingsScreen.tsx:348–359`) is the second row of the same card as "הזמנת מישהו לבחור ביחד", separated by a 1 px divider. It's styled like every navigation row: bold ink text with a stone caption, "השמות ששמרת יישארו אצלך". The caption reassures, but the confirm says otherwise: "ההתאמות עם … יימחקו, והבחירה המשותפת תימשך בלעדיך. כדי לחזור צריך קישור הזמנה חדש". At the bottom of the same screen, the account actions follow the rule: they sit in their own card, and "מחיקת החשבון" is `text-urgent`. The one other destructive action in settings gets neither the separation nor the danger color, right under the invite row a person may be reaching for.
- **Rule it breaks:** `ui-ux-pro-max` · `quick-reference.md` §9 `destructive-nav-separation` "Dangerous actions … must be visually and spatially separated from normal nav items"; §8 `destructive-emphasis` "Destructive actions use semantic danger color (red) and are visually separated from primary actions"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `SettingsScreen.tsx`, give the leave row's title `text-urgent`, as the delete row has it (the caption stays stone). Two options for the separation:
  - (a) the row moves out of the invite card into its own one-row card under it, in the same section
  - (b) it keeps its place, and only the color changes

  Prefer (a): it's the pattern settings already uses for the account actions. The section, its order and all copy stay as they are. The confirm's ink button is IMP-C-G3-15, and leaving always failing is IMP-C-G3-09. Re-check `settings-shared` at 390, 320 and in Safari.
- **Guardrail:** polish (row style and grouping, no copy, flow or token change)
- **Screenshot:** `audit/PRO-G3/settings-shared-webkit.png`, `baseline/G3/settings-shared-full-webkit.png`

### PRO-G3-03: In landscape the duel shows one name; the second choice is below the fold

- **Screen and state:** duel, every round (from saved and from matches)
- **Browser:** webkit-iphone landscape 844 × 390 (and Chromium at 200 % zoom, 206 × 420)
- **What's wrong:** the two pick cards stack vertically, each `min-h-[180px]` (`lists/DuelScreen.tsx:237`, `:255`), under the header, the progress bar and the question. In landscape the page is 589 px tall against a 390 px viewport. The first name fills the screen, and the "או" badge sits at the bottom edge. The second name, half of the question "איזה מהשניים?", can only be seen by scrolling. The page is `max-w-[480px]`, so 360 px of width on either side stays empty. Comparing two names is the whole screen, and it doesn't work without scrolling. At 200 % zoom it's the same (601/420), but there that's expected reflow.
- **Rule it breaks:** `ui-ux-pro-max` · `quick-reference.md` §5 `orientation-support` "Keep layout readable and operable in landscape mode"; §5 `content-priority` "Show core content first on mobile"; Pre-Delivery Checklist "Tested on 375px (small phone) and in landscape orientation"
- **Severity:** P3 (a phone held sideways is rare for this app)
- **Effort:** S
- **Proposed change:** `DuelScreen.tsx`: under a short-viewport query (Tailwind `[@media(max-height:30rem)]:` or `landscape:`):
  - the pair container becomes a two-column row (`flex-row`, "או" centred between the cards)
  - the cards drop to `min-h-[140px]`

  Portrait at 390 × 844 and at 320 × 568 doesn't change: the cards stay stacked, which every board shows. Check both orientations in WebKit and Safari (`osascript` ⌘→ rotates the Simulator; see PRO-G1's note on the tab overview).
- **Guardrail:** polish (a breakpoint the boards don't cover, no change to the portrait layout)
- **Screenshot:** `audit/PRO-G3/duel-webkit-landscape.png`, `audit/PRO-G3/duel-chromium-zoom200.png`

## Summary

3 findings: 0 P1, 0 P2, 3 P3.
- **-01:** press feedback on list rows, tabs, menu items and settings rows, merged with PRO-G1-03 and PRO-G2-02 into one story.
- **-02:** "leave the shared choice" needs the danger color and its own card.
- **-03:** the landscape duel hides the second name.

G3 passes most of the skill's checklist:
- contrast ≥ 5.1:1 everywhere
- no overflow at 320, in landscape, at 200 % zoom or on desktop
- every target ≥ 44 px except the known banner link
- semantic tabs, menus, dialogs and progress, and confirmed destructive actions

The rest of what the skill flags here is already recorded and is cross-referenced, not repeated:
- IMP-A-G3: failure states, timeouts, field sizes, "ביטול" width
- IMP-C-G3: undo, empty states, destructive confirm style, duel counter and motion, 10.5 px labels
- PRO-G2-04 / -06: tabular counts, small type tokens
