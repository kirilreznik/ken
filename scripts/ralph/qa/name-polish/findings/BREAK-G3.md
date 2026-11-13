# BREAK · G3: Lists and settings (saved, matches, chosen banner, row menu, add-name, duel, hidden, settings and its dialogs, about, privacy, terms)

Skill: `break-ui` (`.claude/skills/break-ui/SKILL.md`, `CATALOG.md`). Phases 1, 2, 4 and 5 followed. Phase 3 (the "Demo data / Worst case" toggle) is replaced by a probe outside the app: the worst cases come in through the same boundary as the real data (Supabase responses, the stored session's `user_metadata`/email, device prefs) via Playwright routes and init scripts, so nothing is committed to the app (PRD §3.1.4, story criteria). Phase 6 (fix) is not part of an audit. Assumptions: none needed; the skill asks nothing before its report. Skipped: nothing that needs a service. Dark mode isn't supported by `/names`, so it isn't checked. Browser zoom 200 % is replaced by Safari's real "Page Zoom" at 150 %, a 262 × 439 WebKit viewport (`zoom150`), as in BREAK-G1/G2.

**How:** `shots/break-g3-probe.mjs [webkit|chromium|webkit320|zoom150] [--only saved,counts,matches,loads,abortlong,duel,hidden,add,settings,pages]` (dev server :3000, QA user 1, gitignored). Every backend call is answered in the probe: `names_space`, `space_members` (1, 2 or 12 members, display names up to 36 chars in Latin, Hebrew, Arabic and with an emoji; PATCH answered), `name_votes` GET (0, 1, 13 long names, 40, 999 hidden, 1,284 saved; 500; network failure) with writes echoed and never sent, `name_matches` (0, 6 long, 1,284; 500; network failure; 6 s), `names_leave` (500, network failure), `/api/names/account` (500, 429, network failure), `PUT /auth/v1/user` (500, network failure), `/auth/v1/logout` blocked. The session's `user_metadata.display_name` (40 chars) and email (`bartholomew.fitzgerald@northwind-industries-holdings.example.com`) are set in the stored session in the page only. Per state it records horizontal overflow, text boxes past the viewport and clipped text (`report-<browser>.json`). WebKit ran every state, Chromium the loads, counts, settings and saved states (same results), webkit320 and zoom150 every layout state. Simulator: `shots/break-g3-sim.mjs`, Safari signed in on localhost:3000 with QA user 1's real data, by URL only (the matches tab, the leave dialog with the real partner "QA2", the add-name sheet); no write. Typing Hebrew from the Mac keyboard into Safari doesn't land, so the long add-name entry is Playwright only. Shots: `scripts/ralph/qa/name-polish/shots/audit/BREAK-G3/<state>-<browser>.png`.

## Phase 1: what G3 renders from data

| Field | Source | Limit | Optional? |
|---|---|---|---|
| Row name (saved, matches, hidden, duel result) | vote / match `name` | data max 10 ("איילת השחר"); custom `CUSTOM_NAME_MAX` 20 (`src/lib/names/custom.ts:3`), Hebrew letters, `'`, `"`, inner space or hyphen, so a 19-letter single word is valid | No |
| Row meta "בת · ניתן ל־1,090 ב־2024 · → יציב" | `names.*.json` via `rowMeta` (Intl-formatted) | — | Yes (custom names: "שם שהוספתי" in saved, nothing in hidden/matches) |
| "חדש", loved mark, "{n} שמרו" (matches) | match row | `kept_by_count` ≤ space size (no cap in this repo) | Yes |
| Tab labels "שמרתי · {n}", "התאמות · {n}" | saved rows, matches | unbounded | count only once loaded |
| Chosen banner name, row-menu label "בחרתי/בחרנו בשם {name}" | `chosen` pref, row name | 20 | Yes |
| Add-name field and its error | typed text | no `maxLength`; validated on submit (20) | — |
| Duel card names, "סיבוב {n} מתוך {total}", toggle "שמרתי · {n}" / "התאמות · {n}", top-five chips, ranked list | saved / matched names; `progress()` (`src/lib/names/duel.ts:131`) | total rounds grow with the list (40 → 113, 1,284 → 3,845) | No |
| Hidden list | hidden votes | unbounded (999 tested) | No |
| "השם שלי" input | `user_metadata.display_name` | `DISPLAY_NAME_MAX` 40 (`onboarding.ts:3`, `maxLength`) | Yes (email sign-ins start empty) |
| "כניסה באמצעות" email | `user.email` | unbounded (auth) | No for email sign-ins |
| Leave dialog body "ההתאמות עם {names} יימחקו" | other members' `display_name`s (`leaveBody`, `src/lib/names/leave.ts:19`) | 40 each, members unbounded | Falls back to "מי שבוחר איתך" |
| Matches offline line "עודכן לאחרונה ב־…" | cache time | Intl date/time | Yes |
| Async states | votes read, matches read, display-name / opt-in save, leave, delete | — | — |

## Findings

### BREAK-G3-01: When the votes can't be read on a new device, "שמרתי" says nothing was saved and "שמות שהסתרתי" says nothing was hidden

- **Screen and state:** `/names/lists` and `/names/hidden` on a device with no vote cache (new phone, cleared Safari data), the `name_votes` read answering 500 or failing at the network level; the "server" had 40 saved and 4 hidden names
- **Browser:** webkit-iphone · chromium-pixel (both: with a 500, at once "שמרתי · 0" and "עוד לא נשמרו שמות." + "לבחירת שמות"; with a network failure, "בטעינה" for about 5 s and then the same empty state, which stays: `saved-votes-abort-20s` samples every 2 s for 20 s). Hidden shows "אין שמות מוסתרים".
- **What's wrong:** the same store behaviour as BREAK-G2-02 (`src/lib/names/voteStore.ts:488-492`: ready after a failed first read with nothing cached), but here it's worse than a pill: the lists state, as a fact, that the user has no saved and no hidden names, and invite them to start over. The "0" in the tab confirms it. Nothing says the read failed or that it will retry (it re-reads only on focus, visibility or Realtime).
- **Rule it breaks:** `break-ui` · `CATALOG.md` States · "Error from the API | No error state"; `SKILL.md` severity "Broken (… wrong data shown)"
- **Severity:** P2
- **Effort:** S (on top of BREAK-G2-02's `loadFailed`)
- **Proposed change:** with BREAK-G2-02's `loadFailed` in the vote store (and its retry on the flush timer), `SavedPanel` (`lists/ListsScreen.tsx:511`) and `HiddenScreen` (`HiddenScreen.tsx:78`) show, in place of the empty state, the same card with "לא הצלחנו לטעון את הרשימה. מנסים שוב." and a `Button variant="link"` "ניסיון חוזר" (calls the store's read); the tab label keeps "שמרתי" without a count while `loadFailed` (`ListsScreen.tsx:84`). Component tests for both empty-vs-failed branches. Merge with BREAK-G2-02 in triage (one store change, three screens).
- **Guardrail:** polish (a missing error state of an existing flow, §3.1.4)
- **Screenshot:** `audit/BREAK-G3/saved-votes-500-webkit.png`, `…/saved-votes-abort-20s-webkit.png`, `…/hidden-votes-500-chromium.png`

### BREAK-G3-02: Counts of 1,000 and more have no separator in the tabs, the duel toggle and the round counter, and the tab label breaks between "·" and the number

- **Screen and state:** "השמות שלי" tabs with 1,284 saved and 1,284 matches ("שמרתי · 1284", "התאמות · 1284"), the duel's source toggle ("שמרתי · 1284") and its header ("סיבוב 1 מתוך 3845")
- **Browser:** webkit-iphone · chromium-pixel (raw numbers); webkit320 and zoom150 (the selected tab wraps to "שמרתי ·" / "1284"; at zoom150 "התאמות" / "1284 ·" puts the dot on the wrong side of the number on the second line)
- **What's wrong:** `ListsScreen.tsx:84-85`, `DuelScreen.tsx:194` and `roundText` (`src/lib/names/duel.ts:223`) interpolate raw numbers, while the row meta right under the tabs formats with `Intl.NumberFormat("he-IL")` ("ניתן ל־2,257"). The label's only break opportunity is the space after "·", so a narrow tab breaks there and the bidi run of the second line moves the dot. Nothing overflows.
- **Rule it breaks:** `break-ui` · `SKILL.md` Failure signatures · "`1284` … Raw number rendered | `Intl.NumberFormat` with the user's locale"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** use BREAK-G2-03's `formatCount()` in the three places and join "·" to the number with a no-break space (`שמרתי · ${formatCount(n)}`), so a wrap, when it has to happen, keeps "· 1,284" together. Update the unit tests that assert these strings. Merge with BREAK-G2-03 (and PRO-G2-04's `tabular-nums`).
- **Guardrail:** polish
- **Screenshot:** `audit/BREAK-G3/matches-1284-webkit.png`, `…/saved-1284-webkit320.png`, `…/matches-1284-zoom150.png`, `…/duel-1284-zoom150.png`

### BREAK-G3-03: A long one-word custom name runs off both sides of the duel card on a 320 px screen

- **Screen and state:** duel round with a custom name at the 20-character limit with no space or hyphen ("בתשבעשלומציוןאביגיל", 19 letters, accepted by `validateCustomName`), 320 × 568
- **Browser:** webkit320 (the name spans −86…406 px in a 320 px viewport, cut on both sides, and the page scrolls sideways by 86 px). Fits at 393; at zoom150 the shot drew another pair. The duel's result list wraps the same name (it has `min-w-0`).
- **What's wrong:** the same cause as BREAK-G2-05: `text-duel-name break-words` (`lists/DuelScreen.tsx:257`) sits in a centred flex column (`items-center`, the pick button), so the span's min-content is the whole word and `overflow-wrap: break-word` never gets to break it. Real names are shorter (the longest one-word data name is 8 letters), so it's the schema limit, not everyday data.
- **Rule it breaks:** `break-ui` · `SKILL.md` Failure signatures · "Text overflows its box instead of wrapping … `overflow-wrap: anywhere` breaks only when it has to"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `wrap-anywhere` instead of `break-words` on the duel name span (`DuelScreen.tsx:257`). Merge with BREAK-G2-05 (same change on the match, decision and card headings).
- **Guardrail:** polish
- **Screenshot:** `audit/BREAK-G3/duel-long-1-webkit320.png` (compare `…/duel-long-1-webkit.png`)

### BREAK-G3-04: With large text, the row menu of a long name runs past the screen edge and cuts the start of its items

- **Screen and state:** "שמרתי", row menu of the custom name "שלומציון-אביגיל רות" ("בחרתי בשם שלומציון-אביגיל רות"), Safari Page Zoom 150 %
- **Browser:** zoom150 (the menu spans 28…287 px in a 262 px viewport; the start of each item, where the icons and the first words are, is 25 px off screen). Fits at 393 and 320.
- **What's wrong:** the menu is anchored to the button's end (`absolute end-0`, `RowMenu.tsx:100`) and every item is `whitespace-nowrap` (`RowMenu.tsx:16`), so the widest label sets the menu's width and it grows toward the start edge with no limit. The choose label carries the name, so a long name makes the widest item.
- **Rule it breaks:** `break-ui` · `SKILL.md` Failure signatures · "Long translated button label overflows | Fixed-width button | Width from content with `min-width`, never a fixed `width`" and Phase 4 "Browser zoom 200 % … boxes don't [grow]"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `RowMenu.tsx`, give the menu `max-w-[calc(100vw-2.5rem)]` (the page's side padding) and drop `whitespace-nowrap` from `ITEM` in favour of `text-start` with `py-2` so a long label wraps inside the menu; the icons keep `flex-none`. Do it with INT-G3-03 (the same menu's vertical placement) in triage.
- **Guardrail:** polish
- **Screenshot:** `audit/BREAK-G3/saved-menu-custom-zoom150.png` (compare `…/saved-menu-custom-webkit.png`)

### BREAK-G3-05: The leave dialog lists every other member in one comma run, and mixed-script names scramble it

- **Screen and state:** settings, "לצאת מהבחירה המשותפת?" in a 12-member space whose display names mix Hebrew, Latin, Arabic and an emoji; and in a pair with one Latin name
- **Browser:** webkit-iphone · zoom150 (12 members: the body becomes a 9-line (393) / 15-line (262) block of names in which the commas land on the wrong side of Latin names and neighbouring Latin names read left to right as one run). One Latin partner name reads correctly (`leave-1-latin`, and the real "QA2" in `leave-real-sim`).
- **What's wrong:** `leaveBody` joins the names with ", " into one string (`src/lib/names/leave.ts:21`), with no isolation per name, so the bidi algorithm merges neighbouring Latin names and the commas between them into one LTR run. There's no "and" before the last name and no limit, so a big space turns the warning into a wall of names and the consequence ("יימחקו") is pushed far down.
- **Rule it breaks:** `break-ui` · `CATALOG.md` People and names · "`نور الهدى عبد الرحمن` | RTL; punctuation … land on the wrong side without `dir="auto"`"; Labels · "Tag rows that wrap into a wall; needs a `+8` overflow"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** in `leaveBody`, wrap each name in first-strong isolates (U+2068 … U+2069, string-safe for the dialog's `description`), name at most 3 and add "ועוד {n}" beyond that, and join with `new Intl.ListFormat("he", { type: "conjunction" })` ("עומר, נועה ו־דנה"; the ListFormat output for Hebrew to be checked in a unit test). Update `leave` unit tests.
- **Guardrail:** polish (copy shape of an existing string; no new content)
- **Screenshot:** `audit/BREAK-G3/leave-12-long-webkit.png`, `…/leave-12-long-zoom150.png`, `…/leave-1-latin-webkit.png`

### BREAK-G3-06: Settings shows a long Latin display name from its end, and splits the email mid-word

- **Screen and state:** settings, "השם שלי" holding a 40-character Latin name ("Christopher Alexander Montgomery III Jr."), and "כניסה באמצעות" with a long email
- **Browser:** webkit-iphone · chromium-pixel · zoom150 (the field shows "stopher Alexander Montgomery III Jr", the start cut; the email breaks "…northwind-industries-holdin" / "gs.example.com" at 393 and "north" / "wind-…" at 262)
- **What's wrong:** the input is `dir="rtl"` (`SettingsScreen.tsx:275`), so a Latin value is aligned and scrolled from the right and its first letters fall off the left; Google sign-ins prefill a Latin first name, and a user can type any name up to 40. The email `<bdi>` uses `break-all` (`SettingsScreen.tsx:307`), which breaks between any two letters even where the address offers a hyphen or a dot.
- **Rule it breaks:** `break-ui` · `SKILL.md` Failure signatures · "Long word breaks mid-word … `word-break: break-all` | `overflow-wrap: anywhere` breaks only when it has to"; `CATALOG.md` People and names · RTL/LTR mixing "without `dir="auto"`"
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `dir="auto"` on the "השם שלי" input (the onboarding name field too, if it has the same `dir`), and `wrap-anywhere` instead of `break-all` on the email `<bdi>`. Do it with IMP-C-G3-16 (same input).
- **Guardrail:** polish
- **Screenshot:** `audit/BREAK-G3/settings-long-webkit.png`, `…/settings-long-zoom150.png`

### BREAK-G3-07: A duel over a long list takes hundreds of rounds (owner)

- **Screen and state:** duel between saved names (or matches) with a realistic list: 20 names → 53 rounds, 40 → 113, 100 → 293; the 1,284 worst case → "סיבוב 1 מתוך 3845" with a bar that doesn't visibly move
- **Browser:** webkit-iphone · webkit320 · zoom150 (layout holds; the count is the problem). Round totals from `progress()` (`src/lib/names/duel.ts:131`) for each list size.
- **What's wrong:** the duel inserts every name of the list into a top five (E16 FR-13), so its length grows linearly (about 3 picks per name). A couple who saved 40 names is told "סיבוב 1 מתוך 113" on entry, which reads as a chore; "עצירה, אפשר להמשיך אחר כך" helps but doesn't change the scale. Nothing breaks visually.
- **Rule it breaks:** `break-ui` · `CATALOG.md` Collections · "1,000+ items … also 'Showing 40 of 1,284' copy" (the realistic upper bound of a list, applied to an interaction); `SKILL.md` severity "Fragile"
- **Severity:** P3
- **Effort:** S
- **Proposed change:** recommendation for the owner: above 20 names, start the duel on the loved names plus the most recent saves up to 20 (the toggle keeps "שמרתי / התאמות"), and say it above the cards ("דו־קרב בין 20 השמות האחרונים"). Changing the duel's scope changes E16 FR-13's behaviour, so it isn't a polish change.
- **Guardrail:** owner (§3.2: changes an earlier owner decision, the duel over the whole list)
- **Screenshot:** `audit/BREAK-G3/duel-1284-webkit.png`, `…/duel-1284-zoom150.png`

## What held up (checked, no finding)

- **Longest names in every list:** "איילת השחר", "זינאלדין", "כריסטיאן", "אלכסנדרה" and custom "שלומציון-אביגיל רות", "אביגיל-שלומציון" and "בתשבעשלומציוןאביגיל" in saved, matches (with "חדש", the loved mark and "12 שמרו" on one row), hidden, the chosen banner and the duel result wrap inside their rows at 393, 320 and 262 (`min-w-0` on the text column, the menu button and "החזרה" keep `flex-none`); no row lost its trailing action.
- **Counts:** 0, 1, 999, 1,284 saved and 1,284 matches lay out in the tabs at every width (labels wrap, see -02); "שמרתי · 1" reads fine (no plural); "{n} שמרו" shows only from 3; the matches intro switches at 3 members.
- **Huge lists:** 999 hidden names (1,000 rows) and 1,284 matches render without a stall the probe could see (the hidden page reached network idle in about 1.1 s; no virtualisation needed at this size); 1,284 saved rows render in WebKit and Chromium.
- **Add-name:** a 19-character name fits the field; 21 characters gives "עד 20 תווים", Latin gives "אפשר לכתוב רק אותיות בעברית", both under the field at 320 and 262 (copy issues are COPY-G3-03).
- **Settings failures (500 and network failure):** the name save and the opt-in each show "לא הצלחנו לשמור. אפשר לנסות שוב." and the switch goes back to off; leave shows "היציאה לא הצליחה. אפשר לנסות שוב."; delete shows "לא הצלחנו למחוק את החשבון. אפשר לנסות שוב." and stays on settings; 429 shows its own line. Nothing is left spinning (`aria-busy` clears).
- **Sign out** while the network fails: `signOut({ scope: "local" })` removes the session even when the logout call errors (`@supabase/auth-js` `_signOut`), checked in code; not run, so the stored QA session stays valid.
- **Display names in the leave dialog:** a single Latin, Arabic or emoji name reads in order (`leave-1-latin`, real "QA2" in Safari).
- **Matches offline line** with long rows: "עודכן לאחרונה ב־…" sits above the list at every width.
- **About, privacy, terms:** no horizontal overflow at 320 or 262; the draft banner and long Latin values wrap (`break-all` there is noted in IMP-A-G3).
- **Horizontal overflow:** `scrollWidth == clientWidth` in every state and browser except -03's duel card.

Not re-filed (other lenses have them): the matches tab and the duel between matches stay on the skeleton forever when `name_matches` fails with no cache (IMP-A-G3-01; reproduced here with 500 and a network failure after 10.5 s, `matches-get-500-webkit.png`, `duel-matches-get-abort-chromium.png`), the skeletons' look (ELEV-G3-02), the row menu opening below the screen (INT-G3-03), the round counter after the end (IMP-C-G3-11), the empty states' wording (COPY-G3-02, IMP-C-G3-02), the settings input spec (IMP-C-G3-16), "השמות שלי" wrapping beside the header buttons at 320 (baseline note).
