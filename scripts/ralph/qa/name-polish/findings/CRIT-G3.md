# CRIT · G3: Lists and settings (saved, matches, chosen banner, row menu, add name, duel, hidden, settings, about, privacy, terms)

Run 2026-11-07 by US-A-CRIT-G3 at `5b72361` (no app code change since the baselines, `git diff f513415 HEAD -- src` is empty).

Skill: `design-critique` (`.claude/skills/design-critique/SKILL.md`; references read: `references/heuristics-and-laws.md` (H1–H10, the 27 laws), `references/interaction-design-principles.md` (excise, excise audit checklist), `references/visual-design-principles.md` (consistency, state design), `references/design-patterns-catalog.md` (tabs, settings, blank slate, undo vs confirm, favorites, anti-patterns, pattern selection)) and `design-critique-quick` (`SKILL.md`, its five-part framework as a second pass). Method: the skill's 9 steps, then the quick framework on every state.

Assumptions where the skill would ask: as in CRIT-G1/G2. The design is the live app, the stage is "live product" (full heuristic evaluation). Severity 0–4 is mapped to the PRD's scale: 4 → P1, 3 → P2, 1–2 → P3. Skipped (need a service): the Figma pull and the `~~design tool` / `~~user feedback` connectors (`CONNECTORS.md` doesn't exist). One evaluator; IMP-C-G3, IMP-A-G3 and PRO-G3 (36 findings between them) stand in as the other evaluators and are cross-referenced, not repeated.

Evidence: `scripts/ralph/qa/name-polish/shots/audit/CRIT-G3/`.
- `-webkit` (Playwright WebKit iPhone 15) and `-chromium` (Pixel 7): all 24 G3 states from `scores.md` "Screens G3" (+ the `-full` pages), taken today on the dev server with `us007-g3.mjs` (`G3_OUT` = this folder, `G3_PORT=3000`). The WebKit legal pages needed a retry: `go()` in `us007-g3.mjs` now hops via `about:blank` first (gitignored helper).
- `-sim`: the US-007 Safari set (11 states, same app code), copied from `baseline/G3/`. Safari on :3100 is signed out today (PRO-G3), so no fresh signed-in Safari state.
- `probe-custom-*.png`: `shots/crit-g3-probe.mjs` (gitignored; us007 mocks, every write answered by the mock and never sent): hide the custom "זוהרית" from "שמרתי", then "החזרה" it on `/names/hidden`, with the write bodies logged.

## Critique summary

**Context (step 1).** Who: an expecting parent (or the partner they invited), on a phone. What: come back to the names they kept, compare them (duel), see what both kept (matches), and one day mark the chosen one. Settings are rare visits. Where: daily-ish return use for the lists, rare for settings and the legal pages. Constraints: the owner's boards and brand; the chosen name and the surname are device-only; matches are never green or celebrated.

**First impression (step 2, 5 seconds).** Lists pass: title, three tabs with the active one in ink, rows with the name in row-name type. The duel passes (two big names and "או"). Settings read as a standard grouped list. The weaker 5-second moments are the ones already filed: three empty-state patterns (IMP-C-G3-02), the duel result (IMP-C-G3-14), the delete confirm (IMP-C-G3-15).

**Posture and excise (step 5).** Lists are transient-to-sovereign (a short review). Excise is low: one tap to a name's sheet, two to a row action, the duel one link away. Filed excise: hidden names only reachable from the filters sheet (IMP-C-G3-05), the duel tab that removes the tabs (IMP-C-G3-25), legal pages in a new tab (IMP-C-G3-03).

**Patterns (step 6).** Tabs: 3 parallel sections, the default tab holds the main content (right use). Favorites: "אהבתי מאוד" first with a heart and a word, not color alone. Settings: few, each explained ("כך יופיע השם שלך…", "כבוי · לא חובה"). Undo vs confirm: account deletion and leaving are confirmed (right, irreversible); row remove/hide have neither (IMP-C-G3-01). One misapplication found: a "don't show again" action offered on a name the user typed in, whose way back deletes it (-01).

**IA and labels (step 7).** Titles match their triggers ("השמות שלי", "שמות שהסתרתי", "הגדרות", "על הנתונים"). Label slips already filed ("שניכם", "two of you" vs every member, "כבר ברשימה"). One new: "בחרנו בשם …" claims a shared state that only one device knows (-02).

**Content (step 8).** Plain, warm, gender-neutral in G3 except the filed "שניכם". Two statements that aren't true for the user's data: -01 ("השם יחזור לבחירה" for a name that was never in it) and -02.

**What works well (quick framework).**
- One ink primary per screen; the tabs show counts ("שמרתי · 8", "התאמות · 3"), so status is visible without opening them (H1).
- Loved names first with a heart and the words "אהבתי מאוד"; matches "חדש" is a word on a tag, not a dot (status never by color alone).
- The duel says where you are ("סיבוב 5 מתוך 17", a progress bar, "החמישייה עד עכשיו") and resumes after "עצירה" (the pick is saved to `duelState`, the toast says so): Goal-Gradient and Zeigarnik used right.
- Destructive settings are separated from the rest: "מחיקת החשבון" last, in urgent color, behind a confirm with a specific title ("למחוק את החשבון?") and a specific button ("מחיקה לצמיתות"), cancel focused first ("Hide the ejector seat", "Confirmation text matches the action").
- About shows the source, the year and the licence with direct links (H10, trust).

**Accessibility (quick framework).** Covered by IMP-A-G3 and PRO-G3 (contrast ≥ 5.1:1, fields under 16 px, 39 px "ביטול", press states). Nothing new.

## Findings

### CRIT-G3-01: "לא להציג יותר" on a name the user added; "החזרה" then deletes it and says it comes back

- **Screen and state:** `/names/lists` "שמרתי", row menu of a custom name ("שם שהוספתי"), then `/names/hidden`
- **Browser:** webkit-iphone · chromium-pixel (probe); same code path in Safari
- **What's wrong:** every saved row's menu offers "לא להציג יותר", custom names included (`lists/ListsScreen.tsx:567`). It calls `store.setVote(name, "hidden")` without the custom flag (`ListsScreen.tsx:240`; `setVote`'s `custom` defaults to `false`, `voteStore.ts:531`), so the probe's write is `{"name":"זוהרית","vote":"hidden","custom":false}`. On `/names/hidden`, "החזרה" deletes the vote (`HiddenScreen.tsx:50`, the probe's `DELETE …name=eq.זוהרית`) and announces "השם זוהרית יחזור לבחירה" (`lists.ts:40`). A name the user typed in isn't in the deck's data, so it never comes back: it's gone from every list, and the message said the opposite. The action itself makes no sense for a typed name: it was never "shown" in the deck, so "don't show again" has nothing to stop.
- **Rule it breaks:** `design-critique` · `references/heuristics-and-laws.md` H2 "Match between system and real world" (an action whose meaning doesn't apply to the object) and H3 "Can users undo… Common violations: no undo after deleting an item"; `SKILL.md` Content "Responsible — Are they true…?"; `references/design-patterns-catalog.md` Undo vs Confirm "Misapplication: no undo for destructive actions".
- **Severity:** P2 (the user's own entry is lost behind a message that says it's safe)
- **Effort:** XS
- **Proposed change:** in `ListsScreen.tsx` SavedPanel, pass `onHide` to `RowMenu` only when `!row.custom` (the prop is already optional); a custom name keeps "בחרתי בשם…" and "הסרה מהרשימה". No change to `/names/hidden` (old custom hidden rows, if any, behave as today). A unit or component check that a custom row's menu has no "לא להציג יותר"; the Playwright check is the probe above.
- **Guardrail:** polish (removes a menu item that doesn't apply to the row; no new data or call)
- **Screenshot:** `audit/CRIT-G3/probe-custom-menu-webkit.png`, `audit/CRIT-G3/probe-custom-hidden-webkit.png`, `audit/CRIT-G3/probe-custom-restored-chromium.png`

### CRIT-G3-02: "בחרנו בשם …" in a shared choice is stored on this device only

- **Screen and state:** `/names/lists` row menu, duel result and decision sheet in a shared space; the chosen banner
- **Browser:** all (source)
- **What's wrong:** in a shared space the action reads "בחרנו בשם X" (`launch.ts:84`) and the banner then says the name was chosen, but `useChosen` keeps it in a device pref (`useChosen.ts:11` "device only"). The partner sees no banner, no mark, nothing; the same person on their other device sees nothing either. The words describe a joint decision; the system records a private note. At the product's most important moment (Peak-End), the two partners can hold different "chosen" names without knowing.
- **Rule it breaks:** `design-critique` · `references/heuristics-and-laws.md` H1 "Visibility of system status" and H2 (the label's "we" doesn't match what the system does); `SKILL.md` Content "Responsible — Are they true…?"; UX laws "Mental Model".
- **Severity:** P3
- **Effort:** M (either way)
- **Proposed change:** owner decision. Either (a) store the chosen name on the space (a backend column or table, and the partner sees the banner), or (b) keep it device-only and say so: "סימנתי את X כשם שבחרנו" plus one line in the decision sheet "הסימון נשמר במכשיר הזה". Recommendation: (b) now, (a) when the backend is next touched.
- **Guardrail:** owner (§3.2: changes an earlier owner decision, the launch pack's device-only "בחרנו שם" moment, and option (a) needs a backend change)
- **Screenshot:** `audit/CRIT-G3/lists-chosen-banner-webkit.png`, `audit/CRIT-G3/duel-done-webkit.png`

## Seen again, already filed (not repeated)

| What the critique found | Filed as |
|---|---|
| Remove/hide from a list are silent and can't be undone | IMP-C-G3-01 |
| Three empty-state patterns that say "nothing here" | IMP-C-G3-02 |
| Legal pages in a new tab, back lands on the deck | IMP-C-G3-03 |
| Opt-in switch's off track almost invisible | IMP-C-G3-04 |
| Hidden names reachable only from the filters sheet | IMP-C-G3-05 |
| Add-name sheet without a close button | IMP-C-G3-06 |
| Chosen banner "ביטול" clears with no undo; banner doesn't look tappable; chosen row not marked | IMP-C-G3-07, -22, IMP-A-G3-06 |
| "שניכם" / "two of you" in matches | IMP-C-G3-08, -26 |
| Leaving a shared choice always fails | IMP-C-G3-09 |
| Lists header at 320 px | IMP-C-G3-10 |
| Duel round counter, press feedback, "top five" chips like toggles, flat result, double tap | IMP-C-G3-11, -12, -13, -14, IMP-A-G3-03 |
| Delete confirm looks like any primary | IMP-C-G3-15 |
| Settings name field off spec; fields under 16 px; add-name no length limit | IMP-C-G3-16, IMP-A-G3-05 |
| "כבר ברשימה" doesn't say where | IMP-C-G3-17 |
| Matches offline line a bare timestamp | IMP-C-G3-18 |
| Row menu puts the decision next to the removals | IMP-C-G3-20 |
| About's report button hand-rolled | IMP-C-G3-21 |
| Stragglers; 10.5 px settings headings | IMP-C-G3-23, -24 |
| "דו־קרב" tab removes the tabs | IMP-C-G3-25 |
| Long legal pages without an index | IMP-C-G3-27 |
| Failed matches request = endless skeleton; failed votes read = "nothing saved" | IMP-A-G3-01, -02 |
| Settings confirms with no deadline | IMP-A-G3-04 |
| No press state on tabs, rows, menu items, settings rows | PRO-G3-01 |
| "Leave the shared choice" styled as a normal row | PRO-G3-02 |
| Landscape duel shows one name | PRO-G3-03 |

## Checked and clean

- Every G3 screen has a back arrow in the same place and a title that matches the trigger (Krug "Navigation"); the active tab is ink with a count, the duel source toggle says "בין:" and uses the same segmented control (H4).
- Row menus: focus moves into the menu, arrows/Escape/Tab work, a tap outside closes it; labels are verbs that say what happens ("הסרה מהרשימה", "לא להציג יותר").
- Considered and not filed: the matches row's menu has a single item ("בחרנו בשם…"); a one-item menu is two taps, but it keeps every list row the same shape (Law of Similarity) and the action is rare, so the excise is acceptable. Settings' "שמירה" for the display name shares a word with the deck's "שמירה" decision; the context (a field beside it) makes the meaning clear, and it's the platform's standard form label. The lists header's icon-only invite button has a Hebrew `aria-label` and the same invite is labelled in settings and on the solo matches card; moving or labelling it would change the board's header (owner), not worth an entry.
- Duel resume: `stop()` saves `duelState` and the toast "הדו־קרב נשמר. אפשר להמשיך מאותו מקום." matches "עצירה, אפשר להמשיך אחר כך" (true).
- No dark patterns: account deletion is two taps from settings, no confirm-shaming on delete or leave, the opt-in is off by default and says "לא חובה" (`design-patterns-catalog.md` anti-patterns "Roach motel", "Trick question").
- Narrow screens judged from `baseline/G3/*-webkit375.png` / `*-webkit320.png`: nothing beyond IMP-C-G3-10.
