# PRD: Name detail sheet ("פרטי השם") for the name swiper, autonomous build + QA run

Status: ready for a Ralph run. Owner: Kiril. Written 2026-11-06 from the brainstorm and decisions in the project thread "Brainstorm name card detail view".

Stories: `scripts/ralph/prd-name-detail.json` (installed as `scripts/ralph/prd.json` by `scripts/ralph/run-name-detail.sh`). Branch: `ralph/name-detail`, from `origin/main` (which includes PR #14, the swipe-screen declutter).

## 1. Introduction

The name swiper at `nestjourney.app/names` shows one name card at a time. Today the whole card content (header, intro, Bible verse, known people, boys/girls bar, two number tiles) sits on the swipe card, and a long card scrolls inside itself. That has two costs:

1. There is no place for more depth about a name: the full year-by-year numbers, a longer story, similar names, the name with the family surname, or the "together" view of a shared space.
2. A card that scrolls gives vertical touch to scrolling, so the "אהבתי מאוד" swipe-up gesture is turned off on phones for those cards (see `useSwipeDrag.ts`, "a card that scrolls leaves vertical touch to scrolling").

This run adds a **name detail sheet**: tapping a name card (or its "לכל הפרטים" button, or a saved name on the Lists screen) opens a tall glass bottom sheet with everything about the name. The swipe card becomes shorter so it never scrolls, and swipe-up works on every card again. People can decide (keep / love / skip) from inside the sheet.

The run also writes the new content the sheet needs: a short **story** paragraph and a checked list of **similar names** for every one of the 1,295 cards in the deck.

## 2. Goals

- A tap on the current card opens the detail sheet in under 150 ms on a mid-range phone, without ever being mistaken for a swipe, and a swipe is never mistaken for a tap.
- The swipe card fits without scrolling on a 390 × 844 phone for all 1,295 names, so swipe-up ("אהבתי מאוד") works by touch on every card.
- The sheet shows, for every name: header, meaning (intro + story), surname line, Bible verse (when checked), known people (when any), the year chart 2000–2024, boys/girls split, key facts, similar names, the "together" match badge (shared spaces, mutual saves only), the source, and the decision buttons.
- Every name in the deck gets a story (or an explicit, reported "no story") and a reviewed similar-names list, built and checked by script.
- Everything already shipped keeps working (full regression QA on mobile browsers).
- Verified in real mobile browsers: Mobile Safari in the iOS Simulator, plus Playwright WebKit (iPhone) and Chromium (Pixel) with touch emulation.

## 3. Decisions

### 3.1 Owner decisions (don't reopen)

Made by Kiril or on his behalf with the product-taste and red-team reviews, 2026-11-06. Design references: `docs/names-pwa/design/screens/12-detail-card.png` … `15-detail-extras.png` and their source `docs/names-pwa/design/source/NameDetail.dc.html` (the brainstorm page; its phone mocks are the boards, the rest is background).

1. **Bottom sheet**, not a full page and not an expanding card. It opens over the deck at about 70% of the screen height and can be dragged up to full height. It closes with the ✕ button, a drag down on the handle, a tap on the scrim, Escape, or the phone's Back.
2. **Slim swipe card.** The verse and known-people sections move off the card into the sheet. The card keeps: header (sex tag, name, niqqud, surname line, position), the intro (clamped to 2 lines), small non-interactive hint chips for what's inside, built from the card data only so they never wait for the details file ("מהתנ״ך" when the card has a checked verse, "{n} אנשים מוכרים" when it has people), the boys/girls bar, the two number tiles, and a "לכל הפרטים" button. The card must never scroll.
3. **Decide inside the sheet** with the same three buttons as the swipe screen (same look, icons, order and labels as `ActionBar`): "שמירה", "אהבתי מאוד", "דילוג".
4. **Lists screen opens the same sheet** when a saved or matched name is tapped.
5. **Partner / "together": shown only as a match.** In a shared space, the sheet shows a "התאמה" badge only when the name is a match (every rule of `name_matches`: both / all members kept or loved it). A partner's lone save, skip, love or hide is **never** shown, before or after the user decides. Solo spaces and non-matched names show no "together" section at all.
6. **Similar names: every form**, girls' and boys' forms, short forms and other spellings, each with its sex tag ("בן" / "בת" / "מתאים לכולם"). Only names that have a card in the deck. Names the user hid are left out. The section is hidden when the list is empty. Tapping one opens that name's sheet (with a Back step to the previous one).
7. **"Common among" (CBS sectors) is not shown** in the sheet in this run. The origin filter already covers it.
8. **Say it with the surname:** the name with the surname saved on the device, in large type. If no surname is saved, a small link "הוספת שם משפחה" that opens the existing surname setting.
9. **A longer story** for each name: 2 to 4 sentences on meaning, origin and use, written by this run under strict rules (§6), spot-checked by Kiril after the run.
10. **Out of scope now:** public per-name pages, sharing a name, the "common among" line, partner's non-mutual choices, a second photo/illustration, audio pronunciation.

### 3.2 Decisions made for this run (change only by editing this PRD)

1. **URL:** the sheet is a URL layer like the other sheets: `?sheet=name&n=<name>` (URL-encoded Hebrew). Opening pushes a history entry, so Back closes it. Opening a similar name from inside the sheet pushes another entry (Back returns to the previous name). A direct link to `/names?sheet=name&n=X` opens the sheet for X if X is a deck name; any other value closes the layer by replacing the URL. Add `"name"` to `SHEETS` in `src/lib/names/urlLayer.ts`.
2. **Tap rule:** a pointer that goes down on the card and comes up within **10 px** of where it started and within **400 ms**, never having started a drag (`gesture.ts`: a drag starts at 8 px), is a tap. Add `TAP_SLOP_PX = 10`, `TAP_MAX_MS = 400` and a pure `isTap(dx, dy, ms)` to `src/lib/names/gesture.ts`. A tap whose target is inside a `button`, `a` or `[role=button]` inside the card (e.g. "לכל הפרטים", the "i" corner button) is left to that control. A tap while a fling animation is running does nothing.
3. **Keyboard:** Enter or Space on the focused card opens the sheet. Existing card shortcuts (arrows etc. in `src/lib/names/keys.ts`) keep working; check for conflicts there first. Escape closes the sheet and focus returns to the element that opened it (card, "לכל הפרטים" button or list row).
4. **Detents:** the sheet opens at `min(70dvh, content height)` and can be dragged up by the handle to full height (100dvh minus the top safe-area inset). Content scrolls inside the sheet at either height. A drag down on the handle from full goes to 70%; from 70% it closes. The decision buttons stay pinned at the bottom, above the safe-area inset. On desktop (≥ 768 px wide) the sheet is a centered panel, max width 480 px, like the other sheets.
5. **Deciding from the sheet on the swipe screen:**
   - If the sheet shows the current top card: close the sheet (no history entry left behind: replace, then fling), then fly the card exactly as the action buttons do (`drag.fly(kind)`), with analytics `method: "detail"`.
   - If the sheet shows another name (reached through similar names): record the vote for that name through the vote store, keep the sheet open, show the current choice as pressed, announce it in the live region and show a toast ("נשמר: {name}" / "אהבתי מאוד: {name}" / "דילוג: {name}"). That name then leaves the deck as any decided name does.
6. **Deciding from the sheet on the Lists screen:** the buttons show the current vote as pressed (`aria-pressed`). Choosing another changes the vote through the vote store, the list updates, a toast confirms, and the sheet stays open. Choosing "דילוג" on a saved name removes it from "שמרתי" (toast with "ביטול" that restores the previous vote, using the existing toast/undo patterns if they exist; if not, the toast only confirms).
7. **Details data is loaded lazily.** Stories and similar names live in a new file `data/names/name-details.json`, published as a content-hashed `/names/data/details.<hash>.json` named in `manifest.json` (like `names` and `content`). It is fetched the first time a sheet opens, cached in memory, precached and served cache-first by the service worker (bump `VERSION` in `public/names/sw.js`). The card data the sheet also uses (stats, intro, verse, people) is already loaded. While details load, the other sections render and the story/similar sections show a quiet placeholder; if loading fails (offline, never cached), those two sections show "הפרטים האלה יופיעו כשיהיה חיבור לאינטרנט" and everything else still shows.
8. **Rank and growth facts** (pure functions in `src/lib/names/detail.ts`, unit-tested):
   - **Rank in 2024:** position of the name among all CBS names (`data/names/names.json`, all 19,884, both sexes together) by births in 2024 (`y[24]`); ties share the same rank (1, 2, 2, 4); shown as "#{rank} בשנת 2024" only when the name had births in 2024. Sanity check: אריאל is #2 (2,099 births; מוחמד #1 with 2,257).
   - **Compared with 2000:** with `a = y[0]` (2000) and `b = y[24]` (2024), shown only if both are ≥ 20: if `b/a ≥ 1.1` → "פי {x} מבשנת 2000" with one decimal (אריאל: "פי 3.3"); if `b/a ≤ 0.9` → "{p}% פחות מבשנת 2000" (whole percent); otherwise "בערך כמו בשנת 2000".
   - **All-time births:** `m + f`, formatted with thousands separators, label "תינוקות מאז 1949".
9. **Year chart:** an inline SVG (no chart library), years 2000–2024 on the x axis (labels 2000, 2012, 2024), y gridlines at 0 and two "nice" round values covering the max, an ink line, a soft peach area fill and a clay dot on 2024 (same marks as the card sparkline in `CardStats.tsx`, bigger). Tapping or hovering the chart shows the nearest year and its count in a small label; the chart is focusable and the arrow keys move the year. A visually hidden `<table>` lists every year for screen readers, and the chart has an `aria-label` summarising it ("מספר התינוקות בכל שנה, 2000 עד 2024 …"). The chart is drawn left-to-right (`direction: ltr` on the SVG only), like the sparkline. Names with no years (`y` missing) show "אין נתונים לשנים 2000–2024" and the all-time count only.
10. **Analytics** (add each to `NAMES_EVENTS` in `src/lib/names/track.ts` and to `docs/names-pwa/ANALYTICS.md`; never a name, surname or vote text in props):
    - `detail_opened {source: 'tap' | 'button' | 'key' | 'list' | 'similar' | 'link'}`
    - `detail_closed {seconds, full: boolean}` (`full`: was it dragged to full height)
    - `detail_section_seen {section: 'numbers' | 'similar' | 'story'}` once per open, when the section scrolls into view (IntersectionObserver)
    - `detail_similar_tap`
    - `detail_surname_add`
    - the existing `vote` event with `method: "detail"` for decisions made in the sheet (extend the `method` union).
11. **Focus and semantics:** the sheet is a modal dialog (`role="dialog"`, `aria-modal="true"`, `aria-labelledby` = the name heading), traps focus, and returns focus on close, through the existing `useModal` / `BottomSheet` machinery. The name heading is the first focused element. The live region announces decisions made inside the sheet.
12. **Motion:** the sheet slides up 260 ms ease-out and down 200 ms ease-in; with `prefers-reduced-motion` it fades (160 ms). Use the existing sheet animation if `BottomSheet` has one.
13. **Matches in the sheet:** use the matches already loaded by `useMatches` (`SwipeScreen`, Lists). A matched name shows "התאמה · שניכם שמרתם את השם הזה" in a 2-member space and "התאמה · {n} שמרו את השם הזה" with 3+ members (same wording rules as the Lists "התאמות" tab: read it and reuse its text). Style: ink text on `sand`, a small heart icon; **never green, no confetti**.
14. **The "i" / "על הנתונים" corner button** on the card stays and keeps opening the about sheet; it's not the detail sheet. The sheet's source section also links to it.

### 3.3 Living with the launch pack (ken PR #16)

A parallel piece of work, the "name swiper launch pack" (ken PR #16, branch `claude/project-thread-5xnmem`), also changes the swipe screen and Lists. It must be merged to `main` **before** this run starts (§4). What it adds, as reported by its author:

- **SwipeScreen:** session pauses that render in place of the card, and an inline `SurveyPrompt` that opens `?sheet=survey` only when tapped.
- **ListsScreen:** the matches tab is always present (`SoloMatches` empty state with an invite), a `ChosenBanner`, `RowMenu` with optional `onChoose` / `onRemove` / `onHide`, and match rows now have a `RowMenu` too. `DuelScreen` gets `onChoose` / `chooseLabel`.
- **urlLayer `SHEETS`:** adds `decision` (the "בחרנו שם" moment, opened by a tap) and `survey`.
- **track.ts:** new events and `currentSessionInfo()`. The 5th-save invite prompt, round recap and survey eligibility are derived from the vote store's votes (`updatedAt` since the session start), so votes made from the name sheet count automatically.
- **prefs:** `invitePromptShown`, `recapSession`, `sessions`, `survey`, `chosen`.

How this run lives with it:

1. **Read it first.** US-000 confirms PR #16 is on `origin/main` (`git log origin/main --oneline | grep -i -E "launch pack|#16"`, or the files `SurveyPrompt`, `SoloMatches`, `ChosenBanner` exist) and lists its changed files under Codebase Patterns in `progress.txt`. Every story that touches `SwipeScreen`, `ActionBar`, `ListsScreen`, `RowMenu`, `DuelScreen`, `urlLayer`, `layers`, `prefs` or `track.ts` reads those changes before editing and keeps them working.
2. **One vote path.** Decisions in the name sheet go through the same vote store as swipes and buttons (`store.setVote` via the screen's `decide()` for the current card). Never add a second path; then the launch pack's counters, prompts and recap include sheet votes with no extra work.
3. **One layer at a time.** The name sheet joins `decision` and `survey` in `SHEETS`. The launch pack opens nothing on its own (pauses render in place of the card, the survey and decision sheets open only on a tap), so the only rule needed: the name sheet doesn't open on top of another open sheet or dialog, and a tap on the card while a pause replaces it does nothing.
4. **Lists.** The name opens from rows of "שמרתי" and of the matches tab; the row's `RowMenu` (with the launch pack's choose/remove/hide actions) keeps its own button and behaviour; `SoloMatches` and `ChosenBanner` are untouched. A name already marked as chosen ("בחרנו שם") still opens its sheet normally.
5. **Leaving a space.** After leaving a shared space the together badge disappears (it reads current matches and member count, never cached partner data).
6. **If PR #16 is not on `main` when the run starts,** US-000 writes `## BLOCKED: merge or close ken PR #16 (launch pack) first` at the top of `progress.txt` and stops. The owner can override by putting `LAUNCH_PACK=skip` on the first line of `progress.txt`; then this section is ignored.

## 4. Before the run (owner)

Nothing new is needed from the owner. The run uses what the last run set up: the Mac build folder (`~/Ken-names`), `.env.local`, `scripts/ralph/.env.test.local` with the QA users, Playwright, Xcode with an iOS Simulator runtime, and `cliclick` (`brew install cliclick`, already used by the pregnancy-manager runs). No backend change is needed by this run: no migration, no new Supabase or Vercel setting. **Merge the launch pack, ken PR #16, first** (§3.3), including any migration it needs. To start: `git pull` in `~/Ken-names`, then `./scripts/ralph/run-name-detail.sh`.

After the run: review `scripts/ralph/qa/name-detail/SUMMARY.md`, spot-check the content files (`data/names/content-src/spot-check-details-*.md`), then open a PR from `ralph/name-detail`.

## 5. Design system and components (read before every UI story)

The app's design language is the Nest brand applied to the names PWA. Before any UI story read, in this order:

1. `docs/names-pwa/README.md` ("Code layout", "Design tokens") and `docs/names-pwa/brand/BRAND.md`.
2. The board(s) the story names, as PNG **and** source: `docs/names-pwa/design/screens/*.png` and `docs/names-pwa/design/source/*.dc.html`. For this run: boards 12–15 (`12-detail-card.png`, `13-detail-sheet.png`, `14-detail-full.png`, `15-detail-extras.png`, source `NameDetail.dc.html`), plus board 2 (`02-main.png`, `Main.dc.html`) and 8 (`08-glass-fabric.png`, `GlassFabric.dc.html`) for the card and glass, board 3 (`03-filters.png`, `Filters.dc.html`) for sheet chrome, board 5 (`05-lists.png`, `Lists.dc.html`) for lists.
3. **The boards 12–15 are sketches** made in a brainstorm with a hand-written palette. Where they differ from the existing app, the **app's tokens and components win**: take layout, order, hierarchy and copy from the boards, take every color, radius, shadow, blur, type size and component from the app. The placeholders on board 15 ("כהן", the bracketed story text, the similar names "אריאלה / אראל / ארי") are not content: never ship them.

**Tokens:** `src/styles/nest-tokens.css` (generated from `docs/names-pwa/brand/tokens.json`). Use the Tailwind theme names it exposes: colors `ink`, `ink-soft`, `stone`, `mist`, `faint`, `canvas`, `surface`, `sand`, `line`, `peach`, `peach-soft`, `peach-pale`, `clay`, `clay-deep`; type `text-hero-name`, `text-name`, `text-card-title`, `text-title`, `text-section`, `text-intro`, `text-body`, `text-quote`, `text-ref`, `text-person`, `text-tag`, `text-stat`, `text-caption`, `text-label`, `text-note`, `text-match-line`, `text-row-name`; radii `rounded-sm/md/lg/xl/pill`; glass classes `names-glass`, `names-glass-soft`, `names-well`, `names-card-glass`. **No hex, rgb or px font size anywhere in names code**; `tests/names/designGuard.test.ts` enforces this, keep it green. If a genuinely new value is needed, add it to `tokens.json`/the token script and run `npm run tokens:css`, never inline.

**Components to reuse (don't rebuild):**

| Need | Use |
|---|---|
| Sheet chrome, scrim, handle, focus trap, URL layer, Back | `BottomSheet` (`src/components/names/ui/BottomSheet.tsx`), `openSheet`/`closeSheet`/`useLayerOpen` (`ui/layers.ts`), `useModal` |
| Buttons, icon buttons | `Button`, `IconButton` (`ui/Button.tsx`), `buttonClass` (`ui/classes.ts`) |
| Chips (similar names, hint chips) | `Chip` (`ui/Chip.tsx`) |
| Glass panels | `Glass` (`ui/Glass.tsx`), `glassClass` |
| Toasts | `ToastRegion` (`ui/ToastRegion.tsx`) and `src/lib/names/toast.ts` |
| Decision buttons | `ActionBar`'s `LABEL`, `CLASS` and icons (`swipe/ActionBar.tsx`): extract a shared `DecisionButtons` component used by both, don't copy |
| Name header, niqqud, sex tag, surname line | `CardHeader` (`card/CardHeader.tsx`), `fullName` |
| Verse | `CardBible` (`card/CardBible.tsx`) |
| Known people | `CardPeople` (`card/CardPeople.tsx`) |
| Boys/girls bar | `CardSexBar` (`card/CardSexBar.tsx`), `sexSplit` (`lib/names/sex.ts`), `barLabel` (`lib/names/a11y.ts`) |
| Number tiles, sparkline marks | `CardStats` (`card/CardStats.tsx`), `lib/names/card.ts`, `lib/names/popularity.ts` |
| Data source link | `AboutLink` / about sheet (`about/AboutSheet.tsx`), report sheet (`about/ReportSheet.tsx`) |
| Matches | `useMatches`, `lib/names/matches.ts` |
| Votes | `useVotes`, `lib/names/votes.ts`, `voteStore.ts` |
| Surname | prefs key `surname` (`lib/names/prefs.ts`) and the existing surname input (`Intro.tsx` / settings: find where it's edited and open that) |
| Analytics | `track()` (`lib/names/track.ts`) |

Section headings inside the sheet use one consistent style (take the existing small section label used on the card, e.g. the "מהתנ״ך" label in `CardBible`, `text-tag` in `ink-soft`/`stone`). Spacing between sections follows the card's `gap-3` rhythm.

## 6. Content: stories and similar names

### 6.1 Files

- Sources: `data/names/content-src/details-NNN.json`, one per content batch, shape `{ "_about": "...", "names": { "<name>": { "story": "<text>" | null, "storyNote": "<why null, English>"?, "similar": ["<name>", ...] } } }`. Drafting helpers may live in `scripts/names-content/drafts/details-NNN.py` like the card batches (optional).
- Candidates: `scripts/names-content/similar-candidates.mjs` writes `data/names/content-src/similar-candidates.json`: for every deck name, the deck names that are likely forms or spellings of it (rules in 6.3). The batches choose from these and may add a true form the rules missed **only if it's a deck name**.
- Build: `scripts/names-content/build-details.mjs` reads every `details-NNN.json`, validates (6.4), fills symmetry (if A lists B, B lists A), and writes `data/names/name-details.json` plus `data/names/content-src/DETAILS-REPORT.md` (coverage, every null story with its note, every dropped similar name with the reason). `scripts/build-names-data.mjs` publishes it (3.2.7).
- Spot checks: after each batch, `data/names/content-src/spot-check-details-NNN.md` with 10 random entries of that batch (seeded by the batch number so it's reproducible), for the owner.

### 6.2 Story rules

The story is the most likely place to invent facts. These rules are strict; when in doubt, write less or set `story: null` with a `storyNote`.

- 2 to 4 sentences, 140 to 480 characters, Hebrew, gender-neutral, plain register, no exclamation marks, no emoji, no questions to the reader.
- Content: what the name means, which language it comes from and how the word is used in Hebrew (or the source language), where it appears (Bible, Mishnah/Talmud, nature, a place in Israel), how it is formed (e.g. "צורה מקוצרת של…"). It builds on the card's intro (`data/names/name-content.json`) and must not contradict it. Don't repeat the intro word for word.
- **No numbers of births, ranks or trends** (the sheet shows the data). **No famous people** (known people come from Wikidata only). **No quotes and no chapter/verse references** (the verse section is the checked one). A Bible person or place may be named only if the card has a checked `bible` entry for this name, or the name is itself a well-known Bible name the card's intro already mentions.
- **No claims you can't stand behind:** no "השם הנפוץ ביותר", no "מביא מזל", no personality traits, no religious or medical claims, no claims about who "usually" gives the name. Names of Arabic, Aramaic, Russian, Amharic or other origin get the same care: give the meaning only if it's well established; otherwise a shorter story about the word, or null.
- Names the card content holds (`hold`) are not in the deck and get nothing.
- Keep the voice of the existing intros (see 10 random entries of `name-content.json` before writing).

### 6.3 Similar-names rules

A similar name is a **form of the same name**:
- girls' and boys' forms: אריאל ↔ אריאלה, דניאל ↔ דניאלה;
- short and long forms, only when one really is a short form of the other: ארי ↔ אריאל, יוסי ↔ יוסף;
- other spellings: יונתן ↔ יהונתן, אליה ↔ אלייה;
- the same name built on the same word: אור ↔ אורי ↔ אוריה ↔ אוריאל, נוי ↔ נויה.

**Not** names that only sound alike or look alike: נוי and נועה, טל and טליה are fine (טליה is built on טל), but טל and טום are not. When unsure, leave it out.

Candidate rules for `similar-candidates.mjs` (generate generously; the batch decides):
- same consonants after removing matres lectionis ו and י and a final ה/א;
- one adds a feminine ending to the other: ־ה, ־ית, ־ת, ־יה, ־לה;
- one is the other plus or minus the theophoric ־אל / ־יה / יהו־ / אלי־;
- doubled ו/י spellings (דניאל/דנייאל), final letter forms normalised.
Unit-test the candidate rules in `tests/names/similar.test.ts` with at least 12 pairs that must match and 6 that must not.

Per name: 0 to 6 similar names, ordered by births in 2024 (most first). Never the name itself. Only deck names (have a card in `name-content.json`, not held).

### 6.4 Build validation (`build-details.mjs`, unit-tested in `tests/names/details.test.ts`)

Fails the build (exit 1) on: a story outside 140–480 chars; `!` or `?` in a story; a quote mark (`"`, `״` used as quotes, `“ ”`), a chapter/verse pattern, or a digit other than a 4-digit year in a story; a similar name that isn't a deck name or is the name itself; a name in a details file that isn't a deck name; duplicate names across batches. Warns (in DETAILS-REPORT.md) on: a deck name with no details entry; a story that mentions "תנ״ך"/"בספר"/"בתורה"/"בנביאים" when the card has no checked `bible`; a story that shares more than 60% of its words with the intro.

### 6.5 Batches

20 batches in the order of the card batches (most given in 2024 first): batch 1 = deck names 1–65 by 2024 births, batch 2 = 66–130, …, batch 20 = 1,236–1,295 (the last takes the remainder). `scripts/names-content/details-batches.mjs` prints the names of batch N (deck order by 2024 births, ties by name), so every story uses the exact same split. A batch story drafts all its names, runs the build, writes its spot-check file, and commits `content(names): details batch NN`.

## 7. Functional requirements

### Opening and closing
- FR-D1: A tap on the current swipe card (3.2.2) opens the sheet for that name. A drag never opens it; a tap never moves the card.
- FR-D2: The card's "לכל הפרטים" button (≥ 44 × 44 px, `Button` link or secondary style, with an chevron that mirrors in RTL) opens the sheet.
- FR-D3: Enter or Space on the focused card opens the sheet (3.2.3).
- FR-D4: Tapping a name in Lists ("שמרתי" and "התאמות" tabs) opens the sheet on the Lists screen. The row's existing menu button keeps its own behaviour.
- FR-D5: The sheet closes with ✕ ("סגירה"), the handle (tap), a drag down, a scrim tap, Escape and Back; focus returns to the opener.
- FR-D6: `?sheet=name&n=X` deep link opens X's sheet (valid deck name) or quietly drops the layer (3.2.1).

### Sheet content, top to bottom (boards 13–15)
- FR-D7 Header: name (`text-hero-name` or the card's name size), niqqud, sex tag (`Chip`-like tag as on the card), ✕ button on the end side.
- FR-D8 Surname: "{name} {surname}" in large type on a `peach-pale` well when a surname is saved; otherwise a link "הוספת שם משפחה" that opens the surname setting and fires `detail_surname_add`. The surname never leaves the device (no request, no analytics).
- FR-D9 Meaning: label "מה השם אומר", the intro, then the story (when present).
- FR-D10 Bible: label "מהתנ״ך", the checked verse and reference (reuse `CardBible`). Hidden when none.
- FR-D11 People: label "אנשים מוכרים בשם הזה", up to 2 people (reuse `CardPeople`). Hidden when none.
- FR-D12 Together: the match badge (3.1.5, 3.2.13). Hidden unless matched.
- FR-D13 Numbers: label "כמה תינוקות קיבלו את השם בכל שנה", the chart (3.2.9), a line "ב־2024: {n} תינוקות" with the rank when available.
- FR-D14 Boys and girls: label "בנים ובנות, מאז 1949", the bar with labels (reuse `CardSexBar` at full width).
- FR-D15 Facts: three tiles in one row (`names-well`): all-time births, rank in 2024, compared with 2000 (3.2.8). A tile whose fact doesn't apply is left out and the others share the row.
- FR-D16 Similar names: label "שמות קרובים", chips with the name and its sex tag; tapping opens that name's sheet (3.2.1) and fires `detail_similar_tap`. Hidden when empty after removing hidden names.
- FR-D17 Source: "מקור: הלשכה המרכזית לסטטיסטיקה" + "על הנתונים" (opens the about sheet) + "דיווח על טעות" (opens the report sheet for this name).
- FR-D18 Decision buttons pinned at the bottom (3.1.3, 3.2.5, 3.2.6), same component as the swipe screen.

### Card
- FR-D19 Slim card (3.1.2): no verse, no people sections; intro clamped to 2 lines with an ellipsis; hint chips; "לכל הפרטים". The card's `aria-label` (`cardLabel`) adds ", לפרטים נוספים: הקשה" (or equivalent short Hebrew) and the card gets `aria-haspopup="dialog"`.
- FR-D20 The card never scrolls at 390 × 844 and 375 × 667 for any deck name, and `touch-action: none` applies to every card so swipe-up works by touch. At 200% zoom or 320 px width (where it can't fit) the card may scroll as today, and the existing pan-y fallback applies.

### Data and offline
- FR-D21 Details file built, published, loaded lazily and cached (3.2.7).
- FR-D22 Offline: the sheet opens offline; with no cached details it still shows every section except story and similar names, which show the offline line.

### Analytics
- FR-D23 Events in 3.2.10 fire once each as described and carry no personal data.

## 8. Rules for every story

These hold for every story and are not repeated in each story's criteria.

- **Read first:** this PRD's §3 (decisions), §5 (design system, for UI stories), the files the story names. Next.js 16 and libraries have changed: read `node_modules/next/dist/docs/` or https://nextjs.org/docs before using a Next API; read `@supabase/supabase-js` source/docs before touching auth or data.
- **Where code goes:** routes `src/app/names/`, UI `src/components/names/` (new detail UI in `src/components/names/detail/`), pure logic `src/lib/names/` with Vitest tests in `tests/names/`, content scripts `scripts/names-content/`, data `data/names/`. Don't touch the landing page.
- **Design tokens only, RTL-first** (logical properties only: `ms-/me-/ps-/pe-/start-/end-`, never `left/right/ml/mr/pl/pr`), mirror only directional icons, LTR runs (numbers inside Hebrew text are fine; years and counts in `<bdi dir="ltr">` as the card does).
- **Accessibility (WCAG 2.1 AA):** targets ≥ 44 × 44 px; Hebrew `aria-label` on every icon-only control; visible focus ring; status never by color alone; live region for decisions; dialog semantics (3.2.11); contrast ≥ 4.5:1 on glass and on every background photo.
- **Copy:** gender-neutral Hebrew (infinitives, nouns, "אפשר…"), explicit action labels, no exclamation marks, no medical advice, no invented facts.
- **Privacy:** never send a name, surname, vote, display name or email to analytics or logs. Surname and photos never leave the device. Matches only ever reveal mutual saves.
- **Performance:** the sheet's JS is code-split (`next/dynamic` or a lazy import) so the swipe screen's first load doesn't grow by more than 5 KB gzipped; the details JSON loads only on first open. Measure with `npm run build` output before and after and write the numbers in the story notes.
- **Checks:** every story ends with `npm run lint` (0 errors), `npx tsc --noEmit`, `npm test` and `npm run build` green.
- **Dependencies:** none expected. Playwright's WebKit browser may be installed (`npx playwright install webkit`). Anything else needs a reason in `progress.txt` and must be small and maintained.
- **Commits:** build and content stories commit once each when done (`feat(names): …`, `content(names): …`, `test(names): …`, `docs(names): …`, `chore(names): …`). QA stories never commit and never fix. FIX stories commit once per cycle. Never `git stash`, `git clean`, `git checkout .` or `git reset --hard`.
- **Never** change Supabase or Vercel settings, apply SQL, push to `main` or deploy. Push only `ralph/name-detail`.
- **Secrets:** `.env.local` and `scripts/ralph/.env.test.local` are gitignored; never print, log or commit their values, codes or tokens.

## 9. Story order

1. US-000 gate (browsers, Simulator, QA users), QA helpers for mobile (US-001–US-003).
2. Data layer and content tooling (US-004–US-011).
3. Content batches 1–20 (US-012–US-031), then the content report (US-032).
4. Logic for the sheet: tap rule, URL layer, analytics events, facts, chart model, similar filtering, together state (US-033–US-040).
5. UI building blocks: shared decision buttons, sheet detents, sheet shell, each section (US-041–US-056).
6. Wiring: open from card (tap, button, key), decide from sheet, similar navigation, slim card, Lists entry, offline, motion, desktop, analytics wiring, code-split (US-057–US-072).
7. Docs (US-073) and a self-audit of all new code before QA (US-074).
8. QA: US-QA0, then cycles 1–3 (17 QA stories each) with US-FIX1–3, then US-FINAL.

## 10. Mobile browser check (every UI story)

The owner asked for verification **in real browsers on mobile**. Every UI story is checked three ways; QA stories use all three on every checklist item that has a UI.

1. **Playwright WebKit, iPhone (Mobile Safari's engine) with touch:** `devices['iPhone 15']` (390 × 844, DPR 3, `hasTouch`, `isMobile`), `locale: 'he-IL'`, `timezoneId: 'Asia/Jerusalem'`, signed-in `storageState` from `scripts/ralph/qa/names-pwa/login.mjs`. Taps with `page.touchscreen.tap(x, y)`. Playwright's touchscreen only taps, so drags are a sequence of pointer events with `pointerType: 'touch'` and `isPrimary: true` (pointerdown, 10+ pointermoves along the path with small waits, pointerup) dispatched on the card; in Chromium you may instead use CDP `Input.dispatchTouchEvent`. The helper hides these details. Helper: `scripts/ralph/qa/name-detail/mobile.mjs` (US-001).
2. **Playwright Chromium, Android (Pixel 7) with touch:** `devices['Pixel 7']`, same options. Same helper.
3. **Mobile Safari in the iOS Simulator** (a real mobile browser): helper `scripts/ralph/qa/name-detail/sim.mjs` (US-002) wrapping `xcrun simctl boot/openurl/io screenshot` and `cliclick` taps/drags. The app runs on the Mac (`npm run dev` on port 3000, or the production build on 3100 for QA), and the Simulator reaches it at `http://localhost:<port>`. Sign in once per Simulator device through the real email-code UI with QA user 1 (type `NAMES_QA_EMAIL_1` with `cliclick t:`, get a fresh code with `emailCode()` from `scripts/ralph/qa/names-pwa/rest.mjs`, type it); the session persists in Safari. Don't send more than 3 sign-in emails per QA cycle. Read the pregnancy-manager notes on `simctl` + `cliclick` coordinate math in `scripts/ralph/qa/name-detail/SIMULATOR.md` (written in US-002) before the first Simulator interaction.

For each check: save screenshots under `scripts/ralph/qa/name-detail/shots/` (gitignored), **read the PNG**, and compare it with the board PNG and its source (§5). Check layout, spacing, colors, radii, glass, copy, RTL sides, the pinned buttons above the home indicator, and that nothing is cut off. Fix and repeat until it matches; not "close enough". A deliberate difference goes in the story's notes. Also check desktop 1280 × 800 in Chromium for sheet layout stories.

If a browser or the Simulator can't run, write it at the top of `progress.txt` as a blocker; never skip the check.

## 11. QA

### 11.1 Records

In `scripts/ralph/qa/name-detail/` (created by US-001; `shots/` and `.auth/` gitignored):
- `bugs.md`: IDs `ND-BUG-001` on. Fields: id, cycle found, QA story, browser (`webkit-iphone` / `chromium-pixel` / `sim-safari` / `desktop`), screen, steps, expected, actual, screenshot path, `status: open | fixed | blocked | wontfix-owner`, fix note, cycle fixed.
- `ux-insights.md`: non-blocking ideas, IDs `ND-UX-001` on. Never acted on in this run.
- `SUMMARY.md`: written by US-FINAL.

### 11.2 What counts as a bug

All block equally: a functional bug; a visual difference from the boards/tokens that §3/§5 don't explain; a token, RTL or design-system violation; an accessibility failure; copy that breaks §8; a difference from an FR; a privacy leak; a regression in anything that worked before this run; a content rule break (§6) found in the sheet. `blocked` is only for a check the environment can't run, never for "couldn't reproduce".

### 11.3 The loop (3 cycles, hard cap)

1. **US-QA0** (once): production build running on port 3100 (`npm run build && npm run start -- -p 3100`), QA users 1–3 signed in over REST, the QA users' votes reset (delete their `name_votes` rows through REST as each user), users 1 and 2 in one shared space (use the invite/join REST helpers if they aren't already; note what you did), Simulator Safari signed in as user 1, all three browsers verified.
2. **Cycle N** (N = 1, 2, 3): `US-QA{N}-A` … `US-QA{N}-Q`, each running its full checklist (11.4) in all three mobile browsers unless the item says otherwise. Every item every cycle, even ones that passed before.
3. **US-FIX{N}:** if cycle N found zero `open` bugs, mark every remaining QA and FIX story `passes: true` with `skipped: QA clean after cycle N` and let US-FINAL run. Otherwise fix every `open` bug, verify each fix in the browser it failed in, set `fixed` with a note, run the checks, one commit `fix(names): resolve the {k} bugs found in detail QA cycle {N}`.
4. **US-FIX3 is the last fix pass.** No cycle 4. What it can't fix stays `open`.
5. **US-FINAL** re-checks every bug marked `fixed` in cycle 3, writes `SUMMARY.md` ("clean after cycle N" or "stopped after 3 cycles, {k} bugs open for the owner's review", with the list and screenshots), lists the content spot-check files for the owner, commits, and pushes `ralph/name-detail`. Never rounds up.

### 11.4 Checklists

Phone first. "All three" = WebKit iPhone, Chromium Pixel, Simulator Safari. Users: QA users from `.env.test.local`.

**A: Tap vs swipe (all three)**
- A tap on the card body opens the sheet; on the header, intro, tiles and chips too.
- Drag right keeps, left skips, up loves; a short drag (< 100 px) snaps back; none of these opens the sheet. A shaky tap (6–9 px movement) opens it; a 12 px movement doesn't.
- A tap on "לכל הפרטים" opens it once (not twice); a tap on the "i" corner opens the about sheet, not the detail sheet.
- Tapping during a fling does nothing. Fast repeated taps open one sheet.
- Swipe-up loves by touch on the 5 longest-content cards (find them by intro + verse + people length) at 390 × 844 and 375 × 667.

**B: Sheet behaviour (all three + desktop)**
- Opens at ~70% with the deck visible behind the scrim; handle drag up goes full; drag down from full goes to 70%, from 70% closes. Inner content scrolls at both heights; scrolling never moves the card behind.
- Closes with ✕, handle tap, scrim tap, Escape (desktop), Back (browser back and, in the Simulator, the Safari back swipe from the edge); focus returns to the opener.
- URL is `?sheet=name&n=…` while open and clean after close. A direct link opens it; a junk `n` doesn't.
- Pinned buttons sit above the home indicator (Simulator iPhone with a home indicator) and never cover the last section.
- Reduced motion: fade only.
- Desktop: centered panel, max 480 px.

**C: Content correctness (WebKit iPhone + Simulator)**
- For 6 names (אריאל, יעל, אביגיל, מוחמד, a name with no years, a name with a story null): every section present or hidden per FR-D7–D17, in that order.
- Numbers by hand against `data/names/names.json`: 2024 count, all-time births, boys/girls split, rank (אריאל #2), "compared with 2000" (אריאל "פי 3.3").
- The verse matches the card's checked verse; the people match the card's.
- No board placeholder text anywhere (search the DOM for "כהן" when no surname is set, bracketed text, "לדוגמה").

**D: Chart (all three)**
- Ticks and labels read 2000 / 2012 / 2024 and round y values; the line reaches the right height for 3 sampled years (compare with data).
- Tap on a year shows the right count; arrow keys move the year (desktop); the hidden table has 25 rows; `aria-label` reads correctly (accessibility snapshot).
- A name with no years shows the no-data line.

**E: Similar names (all three)**
- Chips show name + sex tag, ordered by 2024 births; tapping opens that name's sheet; Back returns to the previous name, then closes.
- A name the user hid isn't shown; a name with no similar names hides the section.
- Spot-check 10 random names' lists against the rules in §6.3: log each list that contains a non-form (sound-alike) as a content bug.

**F: Surname (WebKit + Simulator)**
- With a surname saved: "{name} {surname}" shows; with none: "הוספת שם משפחה" opens the surname setting; after saving and coming back, the line shows.
- Network log while opening 5 sheets: the surname appears in no request.

**G: Together / privacy (WebKit + Chromium, users 1 and 2)**
- Both keep a name (user 2 via REST is fine): user 1's sheet shows the match badge with the right wording.
- User 2 keeps a name user 1 hasn't decided: nothing about it in user 1's sheet. User 2 skips a name user 1 kept: nothing. User 2 loves, user 1 skips: nothing.
- Solo user 3: no together section ever.
- Badge is not green, has text, has no confetti.

**H: Deciding from the sheet (all three)**
- On the current card: each of the three buttons closes the sheet and flies the card like the action buttons; the vote is saved (REST read); `vote` analytics has `method: "detail"`; undo restores it.
- On a similar name: vote saved, button pressed, toast and live-region text right, sheet stays; that name doesn't appear later in the deck.
- Buttons look like the swipe screen's (same icons, colors, order, labels).

**I: Lists entry (all three)**
- Tapping a "שמרתי" row and a "התאמות" row opens the sheet over Lists; the row menu still works.
- Current vote shows pressed; changing it updates the list and shows a toast; "דילוג" removes it from שמרתי.
- Back closes the sheet, then leaves Lists as before.

**J: Slim card + swipe screen regression (all three)**
- The card never scrolls at 390 × 844 and 375 × 667 for 20 sampled names including the 5 longest; intro clamps to 2 lines; hint chips correct for 5 names; no verse/people on the card.
- Board 12 match; glass on each background (fabric, notebook, nursery, none, own photo).
- Everything in the previous run's swipe checklists still works: actions, keyboard, undo (10), hide via long-press "דילוג", filters (incl. themes and letter range from PRs #12/#14), deck end and empty-filter states, peeking cards, position line, status footer.

**K: Offline and PWA (production build 3100, Chromium Pixel + Simulator)**
- After one online visit, offline: the sheet opens; if details were cached, story and similar show; with a fresh profile that never opened a sheet (precache only), they show too (precached), and if you block the details URL they show the offline line while the rest renders.
- Votes from the sheet queue offline and flush online (REST check).
- The new details file is in the manifest, precached, cache-first; `sw.js` `VERSION` bumped; "עדכון זמין" flow still works.

**L: Accessibility, RTL, design system (WebKit + desktop Chromium)**
- axe (`@axe-core/playwright`) on the swipe screen, the open sheet (both heights), the sheet over Lists: no serious or critical issues.
- Keyboard: Tab order inside the sheet, focus trap, Escape, focus return; Enter/Space opens from the card.
- 200% zoom and 320 px width: no horizontal scroll, nothing cut off, card falls back to scrolling (pan-y) as specified.
- Code check of every new or changed file under `src/components/names`, `src/lib/names`: no hex/rgb/px font sizes, no physical left/right properties, every icon button labelled, no green; `designGuard` test green.
- Contrast ≥ 4.5:1 for every text style in the sheet on each background.

**M: Analytics (Chromium, network log)**
- Each event in 3.2.10 fires with the right props and only then; `detail_section_seen` once per open per section; no name, surname or vote text in any analytics or Clarity request; Clarity still masks the app.

**N: Regression, sign-in and onboarding (all three, light)**
- Welcome, email sign-in (one real send to a Resend test address per cycle), sign out, onboarding for a reset user, intro and surname, routing. No due date anywhere. (Full detail: `tasks/prd-names-pwa.md` §11.4 A and B.)

**O: Regression, lists, duel, invite, join, matches, launch pack (WebKit + Chromium)**
- `tasks/prd-names-pwa.md` §11.4 G, H, I in full, plus the match sheet still showing once per match.
- Launch pack (when on main): the matches tab and its invite empty state, the invite prompt after the 5th save (a save made from the name sheet counts), the "בחרנו שם" moment and session recap, the survey sheet never opening over the name sheet, leaving a shared space (the together badge disappears afterwards). Use the launch pack's own PR description for the expected behaviour.

**P: Regression, about, report, legal, settings, backgrounds (all three, light)**
- `tasks/prd-names-pwa.md` §11.4 E and J (account deletion only on a throwaway user from the admin API).

**Q: Performance (Chromium Pixel, production build)**
- Swipe screen first-load JS within +5 KB gzipped of `origin/main` (compare `npm run build` route sizes; record both).
- Sheet opens in < 150 ms after the tap (performance marks), details JSON fetched once, gzipped size recorded; no layout shift on the swipe screen when the sheet opens or closes (CLS 0 during the interaction).

## 12. Non-goals

- Public per-name pages, SEO, sharing a name or a link to it.
- "Common among" (CBS sectors) in the sheet.
- Showing a partner's non-mutual votes in any form.
- Changing the deck order, filters or matching rules.
- Wikidata people fetching (separate task); new Bible references (the story has none).
- Any backend, Supabase, Vercel or auth change.
- Native app (pregnancy-manager) work.

## 13. Success

- All stories pass, QA clean or bugs listed honestly in SUMMARY.md.
- After launch (owner, from analytics): share of sessions with `detail_opened` ≥ 25%; swipe-up loves by touch rise (now possible on every card); votes with `method: "detail"` tracked separately; no rise in `vote_undone` rate.

## 14. User stories

The full stories with every acceptance criterion are generated below from the same source as `scripts/ralph/prd-name-detail.json`. The JSON is what Ralph runs; if the two ever differ, the JSON wins.

131 stories, in run order.

### US-000: Gate: browsers, Simulator and QA users work
**Description:** As the run, I need every verification tool working before any build story, so no story is ever marked done without a real mobile check.

**Acceptance criteria:**
- [ ] On branch `ralph/name-detail` created from `origin/main` (contains PR #14, `ae85b2a` or later); `git log -1 origin/main` recorded in `progress.txt`
- [ ] `npm ci` done; `npx playwright install chromium webkit` done (or already installed); a trivial Playwright script opens `https://example.com` in both WebKit (`devices['iPhone 15']`) and Chromium (`devices['Pixel 7']`)
- [ ] `xcrun simctl list devices available` shows at least one iPhone with a home indicator (e.g. iPhone 15/16); it boots (`xcrun simctl boot`), `open -a Simulator` shows it, and `xcrun simctl openurl booted http://localhost:3000/names/welcome` loads the welcome page in Mobile Safari with `npm run dev` running; `xcrun simctl io booted screenshot` saves a PNG that you read and that shows the welcome page
- [ ] `cliclick` is installed (`which cliclick`); one `cliclick` tap on the Simulator window is shown to land (e.g. tapping the welcome email button changes the screen, checked by screenshot)
- [ ] `scripts/ralph/.env.test.local` has the keys `NAMES_QA_EMAIL_1`..`3` (and the service-role key name used by `rest.mjs`); `node scripts/ralph/qa/names-pwa/login.mjs 1` and `2` succeed (key names only in logs, never values)
- [ ] Launch pack check (PRD §3.3): record whether ken PR #16 is on `origin/main` and list its changed files under Codebase Patterns in `progress.txt`; if it isn't on main and `progress.txt` doesn't start with `LAUNCH_PACK=skip`, write `## BLOCKED: merge or close ken PR #16 (launch pack) first` and stop
- [ ] If any item fails: write the missing prerequisite at the top of `progress.txt` under `## BLOCKED`, leave `passes: false`, and stop the iteration without starting other stories
- [ ] No commit in this story

### US-001: Mobile Playwright helper and QA record files
**Description:** As a story or QA check, I want one helper that opens the app as an iPhone (WebKit) or Pixel (Chromium) with touch and a signed-in user, so mobile checks are quick and the same every time.

**Acceptance criteria:**
- [ ] `scripts/ralph/qa/name-detail/mobile.mjs` exports `openMobile({ browser: 'webkit' | 'chromium', device: 'iPhone 15' | 'Pixel 7', user: 1|2|3|null, port: 3000|3100, reducedMotion?, offline?, colorScheme? })` returning `{ browser, context, page, network }` with `locale: 'he-IL'`, `timezoneId: 'Asia/Jerusalem'`, `hasTouch`, `isMobile`, and the user's storageState from `scripts/ralph/qa/names-pwa/.auth/` (calls `login.mjs` logic when missing)
- [ ] Exports `tap(page, locatorOrPoint)`, `drag(page, locator, { dx, dy, steps, ms })` that sends a touch pointer sequence (`pointerType: 'touch'`, `isPrimary: true`, ≥ 10 moves) on the element so the app's pointer handlers see a real touch drag, `shot(page, name)` saving to `scripts/ralph/qa/name-detail/shots/`, `axe(page)` using `@axe-core/playwright`, and a `network` array of `{url, method, postData}` for privacy checks
- [ ] A CLI mode: `node mobile.mjs <webkit|chromium> <path> <out-name> [--user N] [--port P]` saves a screenshot
- [ ] Self-test: on the current `/names` (dev server, user 1 onboarded per README 'QA helpers'), `drag` right by 160 px on the card records a keep (REST read via `rest.mjs` `votes`), then `ביטול` restores it; works in WebKit and Chromium; numbers written in notes
- [ ] Creates `scripts/ralph/qa/name-detail/bugs.md` and `ux-insights.md` with the field headers from PRD §11.1; adds `scripts/ralph/qa/name-detail/shots/` and `.auth/` to `.gitignore`
- [ ] No secret value printed or written anywhere
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `chore(names): add mobile QA helper for the detail run`

### US-002: iOS Simulator helper and notes
**Description:** As a story or QA check, I want a helper that drives Mobile Safari in the iOS Simulator, so verification happens in a real mobile browser.

**Acceptance criteria:**
- [ ] `scripts/ralph/qa/name-detail/sim.mjs` exports `boot(device?)`, `open(url)` (`xcrun simctl openurl booted`), `screenshot(name)` (`xcrun simctl io booted screenshot` into `shots/`), `tap(x, y)` and `drag(x1, y1, x2, y2, ms)` in **device points** (converted to screen points from the Simulator window position and scale read with `osascript`, then `cliclick dd:/m:/du:` with small waits), `type(text)` (`cliclick t:`), and `back()` (edge swipe from the left edge in RTL Safari, or the Safari back button)
- [ ] `scripts/ralph/qa/name-detail/SIMULATOR.md` documents: which device was used, how points map to screen pixels (with the numbers measured on this Mac), the down/move/up timing that makes Safari see a drag rather than a scroll, how to reach a page element's coordinates (run `document.querySelector(sel).getBoundingClientRect()` in the WebKit iPhone 15 Playwright page of the same size and use those points), and the known traps from the pregnancy-manager runs (stuck 'Open in…' dialog → reboot the device)
- [ ] Self-test: open `/names/welcome`, tap the email button, screenshot shows the email screen; a 200 px horizontal `drag` on a scrollable element is seen as a drag (screenshot before/after)
- [ ] Nothing is committed from `shots/`
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `chore(names): add iOS Simulator helper for the detail run`

### US-003: Sign in on the Simulator and take baseline screenshots
**Description:** As the QA cycles, I need a signed-in Mobile Safari and screenshots of how the app looks before this run, so regressions can be spotted by comparison.

**Acceptance criteria:**
- [ ] QA user 1 is signed in to Mobile Safari in the Simulator through the real email-code UI (type `NAMES_QA_EMAIL_1`, fetch a fresh code with `emailCode()` from `rest.mjs`, type it); user 1 is onboarded per README 'QA helpers'; at most 2 emails sent; the steps that worked are added to `SIMULATOR.md`
- [ ] Baseline screenshots of `/names` (fabric and 'ללא רקע' backgrounds), `/names?sheet=filters`, `/names/lists`, `/names/lists?tab=duel`, `/names?sheet=about`, `/names/settings` saved in all three browsers to `shots/baseline/` (gitignored)
- [ ] The 5 deck names with the longest card content (intro + verse + people text length, computed from `data/names/name-content.json`) are listed in `progress.txt` Codebase Patterns for later swipe-up checks
- [ ] No commit in this story

### US-004: Details types and parser
**Description:** As a developer, I need typed name details (story, similar names) and a safe parser, so the app and the build share one shape.

**Acceptance criteria:**
- [ ] `src/lib/names/types.ts` gains `NameDetail { story: string | null; similar: string[] }`
- [ ] `src/lib/names/data.ts` gains `RawDetailsFile` and `parseDetails(raw): Map<string, NameDetail>` that drops entries that aren't objects, coerces a missing `similar` to `[]`, a non-string story to `null`, and ignores `_about`
- [ ] `tests/names/details.test.ts` covers: normal entry, missing fields, junk entries, empty file
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `feat(names): add name details type and parser`

### US-005: Batch split for the details content
**Description:** As a content batch story, I need a fixed, reproducible list of names per batch, so the 20 batches cover every deck name exactly once.

**Acceptance criteria:**
- [ ] `scripts/names-content/details-batches.mjs` exports `deckOrder()` (deck names = keys of `data/names/name-content.json` `names`, sorted by 2024 births desc from `data/names/names.json` (`y[24]`, missing = 0), ties by Hebrew name with `localeCompare('he')`) and `batch(n)` (n = 1..20: names `65*(n-1)` to `65*n - 1`, batch 20 takes the rest)
- [ ] CLI: `node scripts/names-content/details-batches.mjs 3` prints batch 3's names, one per line, with their 2024 births
- [ ] Test: the 20 batches together contain every deck name once (1,295 today; the test reads the count from the file rather than hard-coding it), batch 1 starts with the top names of 2024
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `chore(names): add details batch split`

### US-006: Similar-name candidate rules
**Description:** As the content batches, I need code that proposes likely forms and spellings of each name, so similar-name lists start from evidence rather than memory.

**Acceptance criteria:**
- [ ] `scripts/names-content/similar-rules.mjs` exports `normalize(name)` (final letters to regular, strip ו/י matres, strip final ה/א) and `isCandidate(a, b)` implementing PRD §6.3's candidate rules
- [ ] `tests/names/similar.test.ts` has ≥ 12 pairs that must match (incl. אריאל/אריאלה, דניאל/דניאלה, יונתן/יהונתן, אליה/אלייה, אור/אורי, אורי/אוריאל, נוי/נויה, טל/טליה, מיכאל/מיכאלה, עדי/עדיה, הלל/הללי, נתן/נתנאל) and ≥ 6 that must not (נוי/נועה, טל/טום, ים/יאיר, רון/רוני is allowed? decide and document; include clear negatives like שירה/שרה only if the rules reject them, and say why in a comment)
- [ ] Rules are pure and fast (all 1,295² pairs in < 5 s)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `chore(names): add similar-name candidate rules`

### US-007: Write the similar-name candidates file
**Description:** As the content batches, I want every deck name's candidate forms in one file, so each batch reviews instead of inventing.

**Acceptance criteria:**
- [ ] `scripts/names-content/similar-candidates.mjs` writes `data/names/content-src/similar-candidates.json`: `{ _about, names: { <name>: [<deck name>, ...] } }`, candidates from `isCandidate`, only deck names, never the name itself, ordered by 2024 births
- [ ] Counts recorded in `notes`: names with ≥ 1 candidate, average candidates, the 10 names with the most candidates
- [ ] Re-running gives the same file (stable order)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `chore(names): write similar-name candidates`

### US-008: Build and validate the details file
**Description:** As the owner, I want a build that refuses bad stories or similar lists, so nothing invented or broken reaches the app.

**Acceptance criteria:**
- [ ] `scripts/names-content/build-details.mjs` reads every `data/names/content-src/details-NNN.json`, applies every PRD §6.4 failure and warning rule, fills symmetry (if A lists B, B gets A, re-sorted by 2024 births, capped at 6), drops similar names the user can't see in the deck (not deck names) with a report line, and writes `data/names/name-details.json` (`{ _about, names }`) and `data/names/content-src/DETAILS-REPORT.md` (coverage numbers, null stories with notes, warnings, drops)
- [ ] Exit code 1 with a clear message on any failure rule; 0 otherwise
- [ ] Unit tests with small fixture batches in `tests/names/fixtures/` cover each failure and warning rule and the symmetry fill
- [ ] With no batch files yet, it writes an empty `names` object and the report says 0 of N covered
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `feat(names): build and check the name details file`

### US-009: Publish the details file with the app data
**Description:** As the app, I need the details file served like the other data files, so it can be cached forever and loaded on demand.

**Acceptance criteria:**
- [ ] `scripts/build-names-data.mjs` also writes `public/names/data/details.<hash>.json` (minified) from `data/names/name-details.json` and adds `details` to `manifest.json`; old hashed details files are removed like the others (extend the `HASHED` pattern)
- [ ] `src/lib/names/data.ts` `DataManifest` gains `details`; `tests/names/build-names-data.test.ts` and `dataCaching.test.ts` updated and green
- [ ] The swipe screen's existing data loads are unchanged (no details fetch on page load), checked by a network log in the dev server
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `feat(names): publish the details data file`

### US-010: Service worker caches the details file
**Description:** As someone offline, I want the details I'll open to be available, so the sheet works without a connection.

**Acceptance criteria:**
- [ ] `public/names/sw.js` precaches the `details` file named in `manifest.json` with the others and serves `/names/data/details.*` cache-first (it already matches `/names/data/*`; confirm and test); `VERSION` bumped
- [ ] `tests/names/serviceWorker.test.ts` covers the details file in precache
- [ ] On a production build (port 3100) in Chromium Pixel: after one online load, offline fetch of the details URL is served from cache (record how you checked)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `feat(names): precache the details file in the service worker`

### US-011: Lazy details loader and hook
**Description:** As the sheet, I need to load details once, on first open, with clear loading and error states.

**Acceptance criteria:**
- [ ] `loadDetails()` in `src/lib/names/data.ts` fetches the manifest's details file once (memoised promise; a failed load can be retried on the next open)
- [ ] `useNameDetails()` in `src/components/names/useNameDetails.ts` returns `{ details: Map | null, state: 'idle' | 'loading' | 'ready' | 'error' }` and only starts loading when first called with `enabled: true`
- [ ] Tests (with a stubbed fetch) for: single fetch across many calls, error then retry, `idle` until enabled
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `feat(names): load name details on demand`

### US-012: Details content batch 01
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 1, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 1`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-001.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-001.md` lists 10 random entries of this batch (seed 1) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 01`

### US-013: Details content batch 02
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 2, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 2`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-002.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-002.md` lists 10 random entries of this batch (seed 2) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 02`

### US-014: Details content batch 03
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 3, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 3`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-003.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-003.md` lists 10 random entries of this batch (seed 3) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 03`

### US-015: Details content batch 04
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 4, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 4`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-004.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-004.md` lists 10 random entries of this batch (seed 4) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 04`

### US-016: Details content batch 05
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 5, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 5`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-005.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-005.md` lists 10 random entries of this batch (seed 5) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 05`

### US-017: Details content batch 06
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 6, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 6`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-006.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-006.md` lists 10 random entries of this batch (seed 6) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 06`

### US-018: Details content batch 07
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 7, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 7`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-007.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-007.md` lists 10 random entries of this batch (seed 7) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 07`

### US-019: Details content batch 08
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 8, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 8`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-008.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-008.md` lists 10 random entries of this batch (seed 8) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 08`

### US-020: Details content batch 09
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 9, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 9`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-009.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-009.md` lists 10 random entries of this batch (seed 9) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 09`

### US-021: Details content batch 10
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 10, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 10`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-010.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-010.md` lists 10 random entries of this batch (seed 10) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 10`

### US-022: Details content batch 11
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 11, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 11`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-011.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-011.md` lists 10 random entries of this batch (seed 11) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 11`

### US-023: Details content batch 12
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 12, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 12`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-012.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-012.md` lists 10 random entries of this batch (seed 12) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 12`

### US-024: Details content batch 13
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 13, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 13`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-013.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-013.md` lists 10 random entries of this batch (seed 13) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 13`

### US-025: Details content batch 14
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 14, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 14`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-014.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-014.md` lists 10 random entries of this batch (seed 14) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 14`

### US-026: Details content batch 15
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 15, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 15`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-015.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-015.md` lists 10 random entries of this batch (seed 15) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 15`

### US-027: Details content batch 16
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 16, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 16`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-016.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-016.md` lists 10 random entries of this batch (seed 16) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 16`

### US-028: Details content batch 17
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 17, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 17`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-017.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-017.md` lists 10 random entries of this batch (seed 17) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 17`

### US-029: Details content batch 18
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 18, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 18`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-018.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-018.md` lists 10 random entries of this batch (seed 18) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 18`

### US-030: Details content batch 19
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 19, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 19`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-019.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-019.md` lists 10 random entries of this batch (seed 19) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 19`

### US-031: Details content batch 20
**Description:** As someone choosing a name, I want a short, careful story and the real similar forms for the names in batch 20, so the sheet has depth without invented facts.

**Acceptance criteria:**
- [ ] Names = `node scripts/names-content/details-batches.mjs 20`; for each, read its card in `data/names/name-content.json` (intro, verse) and its candidates in `similar-candidates.json`
- [ ] Read PRD §6.2 and §6.3 again before writing; read 10 random existing intros to match their voice
- [ ] Writes `data/names/content-src/details-020.json` with every batch name: `story` (2–4 sentences, 140–480 chars, rules §6.2) or `null` with an English `storyNote`; `similar` chosen from the candidates (plus true forms the rules missed, deck names only) per §6.3
- [ ] No birth numbers, ranks, famous people, quotes, verse references, superlatives, traits, luck, religious or medical claims; uncertain meaning → shorter story or null
- [ ] `node scripts/names-content/build-details.mjs` exits 0; its warnings for this batch are fixed or explained in `notes`
- [ ] `data/names/content-src/spot-check-details-020.md` lists 10 random entries of this batch (seed 20) with intro, story and similar names, for the owner
- [ ] Counts in `notes`: stories written, nulls (with reasons summarised), names with ≥ 1 similar name
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details batch 20`

### US-032: Details coverage report
**Description:** As the owner, I want one place that shows how complete and careful the new content is, so I know what to spot-check.

**Acceptance criteria:**
- [ ] `build-details.mjs` run on all 20 batches: every deck name has an entry; `DETAILS-REPORT.md` shows coverage 100%, the number of null stories and their reasons, symmetry fills, drops and warnings
- [ ] `data/names/content-src/spot-check-details-INDEX.md` lists the 20 spot-check files and asks the owner to read at least 3
- [ ] A grep over `name-details.json` for the forbidden patterns of §6.4 finds nothing; for 20 random stories, re-read them against §6.2 and fix any that break a rule (commit the fix with this story)
- [ ] `npm run names:data` and `npm run build` publish the file (size of the gzipped details file recorded in notes)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `content(names): details coverage report`

### US-033: Tap rule
**Description:** As someone swiping, I want a tap to open details and a drag to stay a drag, so the two never get confused.

**Acceptance criteria:**
- [ ] `src/lib/names/gesture.ts` gains `TAP_SLOP_PX = 10`, `TAP_MAX_MS = 400` and `isTap(dx, dy, ms)` (true when `Math.hypot(dx, dy) <= 10` and `ms <= 400`)
- [ ] `tests/names/gesture.test.ts` covers: still tap, 9 px tap, 11 px not, 401 ms not, and that `dragStart` never starts a drag for a movement `isTap` accepts horizontally below 8 px
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `feat(names): add the tap rule`

### US-034: URL layer for the name sheet
**Description:** As someone using Back, I want the sheet in the URL, so Back closes it and a link can open it.

**Acceptance criteria:**
- [ ] `SHEETS` in `src/lib/names/urlLayer.ts` includes `"name"`; helpers `nameSearch(search, name | null)`, `readName(search)` for the `n` param (URL-encoded Hebrew round-trips)
- [ ] `openNameSheet(name, { replace?: boolean })` in `src/components/names/ui/layers.ts` sets `sheet=name&n=…` pushing a marked history entry (or replacing), and `closeSheet` also removes `n`
- [ ] Opening a second name while the sheet is open pushes another entry; Back returns to the first name (unit-tested with the existing history helpers or a jsdom history)
- [ ] `tests/names/urlLayer.test.ts` updated
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `feat(names): add the name sheet URL layer`

### US-035: Analytics events for the sheet
**Description:** As the owner, I want to measure how the sheet is used, without collecting personal data.

**Acceptance criteria:**
- [ ] `NAMES_EVENTS` gains `detail_opened`, `detail_closed`, `detail_section_seen`, `detail_similar_tap`, `detail_surname_add` with the descriptions and props of PRD §3.2.10; the `vote` description's `method` union adds `'detail'`
- [ ] `docs/names-pwa/ANALYTICS.md` lists them
- [ ] `tests/names/track.test.ts` (or analytics tests) check the new names are accepted and that `track` drops any prop not in the allowed shape if the module has such a guard
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `feat(names): add detail sheet analytics events`

### US-036: Facts: rank, compared with 2000, all-time births
**Description:** As someone reading the numbers, I want a few clear facts that are always computed the same way.

**Acceptance criteria:**
- [ ] `src/lib/names/detail.ts` exports `rankMap(allNames)` (2024 births, ties share rank, names with 0 births absent), `rank2024(name, map)`, `compare2000(stats)` returning `{ kind: 'times' | 'less' | 'same', text }` or null per PRD §3.2.8, `allTimeBirths(stats)` with Hebrew thousands formatting
- [ ] Tests: אריאל rank 2 and 'פי 3.3', מוחמד rank 1, a tie case, a falling name ('…% פחות'), a 'בערך כמו' case, a name under 20 births in 2000 → null, a name with no `y` → no rank, no compare
- [ ] `rankMap` built from the full names file once and memoised; computing it for 19,884 names takes < 50 ms (measured in the test)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `feat(names): add detail facts`

### US-037: Chart model
**Description:** As the chart, I need points, ticks and labels computed once and tested, so drawing stays simple.

**Acceptance criteria:**
- [ ] `src/lib/names/detail.ts` exports `chartModel(y, { width, height, pad })` returning the polyline points, the area polygon, y ticks (0 and two 'nice' round values ≥ the max: 1/2/5 × 10^k steps), x labels for 2000/2012/2024, the 2024 point, and `nearestYear(x)`; `chartLabel(stats)` returns the Hebrew aria summary (range, first and last values, peak year)
- [ ] Tests: אריאל's ticks (0, 1,000, 2,000 or similar with max 2,099 → top tick ≥ 2,099), nearestYear at both ends and the middle, a flat series, an all-zero series
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `feat(names): add the chart model`

### US-038: Similar names for display
**Description:** As the sheet, I need the similar names a person can actually open, in a stable order, with their sex tags.

**Acceptance criteria:**
- [ ] `similarForDisplay(name, details, cards, hiddenNames)` in `src/lib/names/detail.ts` returns `{ name, sexTag }[]`: drops names not in the deck and names the user hid, keeps the build order (2024 births), max 6
- [ ] Tests: hidden name removed, unknown name removed, empty result, order kept
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `feat(names): select similar names for display`

### US-039: Together state (matches only)
**Description:** As a person in a shared space, I want to see when we both chose a name, and never anything my partner did alone.

**Acceptance criteria:**
- [ ] `togetherFor(name, matches, memberCount)` in `src/lib/names/detail.ts` returns null unless the name is in the matches list; otherwise `{ text }` with the same wording as the Lists 'התאמות' tab (2 members: 'התאמה · שניכם שמרתם את השם הזה', 3+: 'התאמה · {n} שמרו את השם הזה'; read the Lists code for the exact existing strings and reuse them)
- [ ] Tests: solo → null; shared, not matched → null; matched with 2 and 3 members; the function receives no partner votes at all (its signature takes only matches)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `feat(names): add the together state`

### US-040: Card hint chips model
**Description:** As someone swiping, I want a hint of what's inside the sheet, from data the card already has.

**Acceptance criteria:**
- [ ] `cardHints(content)` in `src/lib/names/detail.ts` returns the hint labels in order: 'מהתנ״ך' when `content.bible` exists, '{n} אנשים מוכרים' / 'אדם מוכר אחד' when people exist
- [ ] Tests for 0, 1 and 2 people, with and without a verse
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `feat(names): add card hint chips`

### US-041: Shared decision buttons
**Description:** As a developer, I want one component for the keep / love / skip buttons, so the swipe screen and the sheet always look and behave the same.

**Acceptance criteria:**
- [ ] `src/components/names/DecisionButtons.tsx` holds the three buttons with `ActionBar`'s labels, classes, icons and order; supports an optional `pressed?: Vote` (sets `aria-pressed` and a visible pressed style made of tokens, not color alone: e.g. a check icon) and `onDecide(kind)`
- [ ] `ActionBar` uses it; the swipe screen looks identical to the US-003 baseline (compare screenshots) and keeps `data-act` attributes, long-press hide on 'דילוג' and the undo button
- [ ] Existing tests green; a test for the pressed state
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-041-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with the US-003 baseline `/names` screenshots (must be identical); every difference fixed or explained in `notes`
- [ ] Committed once: `refactor(names): share the decision buttons`

### US-042: Tall bottom sheet with two heights
**Description:** As someone reading details, I want the sheet to open part-way and pull up to full height.

**Acceptance criteria:**
- [ ] `BottomSheet` gains an opt-in `detents` prop (`['70', 'full']`) per PRD §3.2.4: opens at `min(70dvh, content)`, handle drag up → full, down from full → 70%, down from 70% → close; tap on the handle still closes; inner content scrolls at both heights
- [ ] Sheets without the prop (filters, about, report, background, match, install, add-name) behave exactly as before (open each and compare with the US-003 baseline)
- [ ] `tests/names/ui.test.ts` covers the detent state logic (pure reducer in `ui/` or `lib/names/`)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-042-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with boards 13–15 (`13-detail-sheet.png`, `14-detail-full.png`, `15-detail-extras.png`, source `NameDetail.dc.html`) and board 3 sheet chrome (`03-filters.png`, `Filters.dc.html`); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): add two-height bottom sheets`

### US-043: Bottom sheet with a custom header and pinned footer
**Description:** As the name sheet, I need my own header (the name) instead of a text title, and the decision buttons pinned at the bottom.

**Acceptance criteria:**
- [ ] `BottomSheet` accepts `header?: ReactNode` (rendered instead of the title row; `aria-labelledby` points to an element with the id the sheet passes down) and its existing `footer` stays pinned above the safe-area inset at both heights
- [ ] Existing sheets unchanged; a test for the labelled-by wiring
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-043-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with boards 13–15 (`13-detail-sheet.png`, `14-detail-full.png`, `15-detail-extras.png`, source `NameDetail.dc.html`) and board 3 sheet chrome (`03-filters.png`, `Filters.dc.html`); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): let sheets take a custom header`

### US-044: Name sheet shell
**Description:** As someone who tapped a card, I want a sheet titled with the name, so I know where I am and can close it.

**Acceptance criteria:**
- [ ] `src/components/names/detail/NameDetailSheet.tsx`, mounted in `SwipeScreen`, opens for `?sheet=name&n=X` when X is a deck name; header per FR-D7 (name, niqqud, sex tag, '✕' `IconButton` with `aria-label="סגירה"`); body sections are empty placeholders for now
- [ ] Unknown or missing `n`: the layer is closed by replacing the URL, no error
- [ ] Only one layer at a time (PRD §3.3.3): the name sheet doesn't open over another open sheet/dialog, and a tap on the card while a launch-pack pause replaces it does nothing
- [ ] Dialog semantics per PRD §3.2.11; the name heading gets focus on open
- [ ] Opened manually through the URL for checks (no card tap yet)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-044-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with boards 13–15 (`13-detail-sheet.png`, `14-detail-full.png`, `15-detail-extras.png`, source `NameDetail.dc.html`) and board 3 sheet chrome (`03-filters.png`, `Filters.dc.html`); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): add the name sheet shell`

### US-045: Surname section
**Description:** As a parent, I want to see the name with our family name, so I can hear how it sounds.

**Acceptance criteria:**
- [ ] Section per FR-D8 using the existing `fullName()`; 'הוספת שם משפחה' opens the existing surname setting (find it: intro or settings) and fires `detail_surname_add`
- [ ] The surname appears in no network request while the sheet is used (network log in notes)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-045-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 15 (`15-detail-extras.png`), ignoring its placeholder surname; every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): show the name with the surname`

### US-046: Meaning section with the story
**Description:** As someone choosing, I want the meaning and the story of the name in one place.

**Acceptance criteria:**
- [ ] Section per FR-D9: label 'מה השם אומר', intro, then the story from `useNameDetails` (sheet opening enables loading)
- [ ] Loading: a quiet placeholder (`sand` skeleton line, no spinner text); error/offline: the line from PRD §3.2.7; story null: no story paragraph and no placeholder
- [ ] Checked on 3 names: with story, null story, and with the details request blocked
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-046-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with boards 13–15 (`13-detail-sheet.png`, `14-detail-full.png`, `15-detail-extras.png`, source `NameDetail.dc.html`) and board 3 sheet chrome (`03-filters.png`, `Filters.dc.html`); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): add the meaning section`

### US-047: Bible and people sections
**Description:** As someone choosing, I want the checked verse and known people in the sheet.

**Acceptance criteria:**
- [ ] FR-D10 and FR-D11 by reusing `CardBible` and `CardPeople` (add a size prop if needed instead of copying); hidden when empty
- [ ] Checked on אריאל (both), a name with a verse and no people, a name with neither
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-047-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with boards 13–15 (`13-detail-sheet.png`, `14-detail-full.png`, `15-detail-extras.png`, source `NameDetail.dc.html`) and board 3 sheet chrome (`03-filters.png`, `Filters.dc.html`); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): add verse and people to the sheet`

### US-048: Together badge
**Description:** As a person in a shared space, I want to see a match in the sheet.

**Acceptance criteria:**
- [ ] FR-D12 using `togetherFor` and `useMatches` data passed from the screen; text + small heart icon, `sand` background, ink text, no green; hidden otherwise
- [ ] Checked with users 1 and 2 sharing a space and a name both kept (set user 2's vote via REST)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-048-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 15 (`15-detail-extras.png`); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): show matches in the sheet`

### US-049: Year chart (drawing)
**Description:** As someone curious about a name, I want to see its births over the years.

**Acceptance criteria:**
- [ ] `src/components/names/detail/YearChart.tsx` draws `chartModel` as inline SVG per PRD §3.2.9: ink line, `peach-soft` area (via token class, no hex), `clay` 2024 dot, `line` gridlines, tick labels in `text-caption`/`stone`; `direction: ltr` on the SVG only; width follows the container
- [ ] Checked on אריאל, מוחמד (large numbers), a rare name and a name with no years (no-data line)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-049-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 14 (`14-detail-full.png`); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): draw the year chart`

### US-050: Year chart (interaction and screen readers)
**Description:** As someone exploring the chart, I want to read exact numbers by tapping, and screen-reader users want the same data.

**Acceptance criteria:**
- [ ] Tap or hover shows the nearest year and its count in a small label above the point (stays inside the chart); the chart is focusable (`tabIndex=0`, focus ring) and Left/Right arrows move the year; a visually hidden table lists all 25 years; `aria-label` from `chartLabel`
- [ ] A drag across the chart on touch moves the label and never scrolls the sheet sideways
- [ ] Checked by touch in all three browsers and by keyboard on desktop
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-050-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 14 (`14-detail-full.png`); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): make the year chart readable by touch and keyboard`

### US-051: Numbers section
**Description:** As someone reading the numbers, I want the chart with the latest year and rank under it.

**Acceptance criteria:**
- [ ] FR-D13: label, `YearChart`, line 'ב־2024: {n} תינוקות' with ', #{rank} בשנת 2024' when ranked; numbers in `<bdi dir="ltr">` like the card
- [ ] Values checked by hand against `names.json` for 3 names
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-051-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 14 (`14-detail-full.png`); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): add the numbers section`

### US-052: Boys and girls section
**Description:** As someone reading the numbers, I want the boys/girls split at full width.

**Acceptance criteria:**
- [ ] FR-D14 reusing `CardSexBar` (full-width variant if needed), label 'בנים ובנות, מאז 1949', `barLabel` for screen readers
- [ ] Checked on אריאל (77/23), יעל and אביגיל (extremes 'מעל 99%' / 'פחות מ־1%')
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-052-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 14 (`14-detail-full.png`); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): add the boys and girls section`

### US-053: Facts tiles
**Description:** As someone reading the numbers, I want three quick facts.

**Acceptance criteria:**
- [ ] FR-D15: up to three `names-well` tiles in one row (all-time births, rank, compared with 2000) using US-036; a tile that doesn't apply is left out and the rest share the row; text never truncated at 320 px (wraps)
- [ ] Checked on אריאל and on a name with no 2024 births
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-053-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 14 (`14-detail-full.png`); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): add the facts tiles`

### US-054: Similar names section (display)
**Description:** As someone choosing, I want to see other forms of the name.

**Acceptance criteria:**
- [ ] FR-D16 using `similarForDisplay` and the `Chip` component: each chip shows the name and its sex tag (text, not color), ≥ 44 px tall, wraps in RTL; hidden when empty or while details load; chips are buttons with `aria-label` '{name}, פרטי השם'
- [ ] Tap does nothing yet (wired in US-062)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-054-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 15 (`15-detail-extras.png`), ignoring its placeholder names; every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): show similar names`

### US-055: Source section
**Description:** As someone who wants to trust the numbers, I want the source and a way to report a mistake.

**Acceptance criteria:**
- [ ] FR-D17: 'מקור: הלשכה המרכזית לסטטיסטיקה', 'על הנתונים' (opens the about sheet the same way `AboutLink` does) and 'דיווח על טעות' (opens the report sheet with this name) as link buttons ≥ 44 px
- [ ] Opening another sheet from the name sheet and closing it returns to the name sheet (or document why the layer model can't stack and close the name sheet first, keeping Back correct)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-055-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 14 (`14-detail-full.png`); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): add the source section`

### US-056: Pinned decision buttons in the sheet (display)
**Description:** As someone in the sheet, I want the keep / love / skip buttons always in reach.

**Acceptance criteria:**
- [ ] `DecisionButtons` in the sheet footer (US-043), same look and order as the swipe screen; with `pressed` when the name already has a vote; buttons don't act yet (wired in US-060/061/067)
- [ ] Never covers the last section at either height; above the home indicator on the Simulator
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-056-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 13 (`13-detail-sheet.png`) and the swipe screen's action bar; every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): pin decision buttons in the sheet`

### US-057: Tap on the card opens the sheet
**Description:** As someone swiping, I want to tap a card to see its details.

**Acceptance criteria:**
- [ ] `useSwipeDrag` gains `onTap` called from `onPointerUp` when no drag started and `isTap` holds, the target isn't inside a button/link/[role=button] in the card, and no fling is running; `SwipeScreen` passes `onTap` = open the sheet for the current card with `detail_opened {source: 'tap'}`
- [ ] Drags behave exactly as before: keep, skip, love, snap back (re-run the US-001 self-test drags in WebKit and Chromium and a Simulator drag)
- [ ] Taps on header, intro, tiles, chips open the sheet; tap on the 'i' corner opens about; a 12 px movement doesn't open
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-057-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 12 (`12-detail-card.png`) and board 2/8 (`02-main.png`, `08-glass-fabric.png`) and board 13; every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): open details with a tap on the card`

### US-058: 'לכל הפרטים' button on the card
**Description:** As someone who doesn't know cards are tappable, I want a visible way into the details.

**Acceptance criteria:**
- [ ] A 'לכל הפרטים' button (≥ 44 × 44, `Button` link/secondary style from `classes.ts`, chevron that mirrors in RTL) at the end of the card per board 12; opens the sheet with `source: 'button'` exactly once per tap (no double open via the card's onTap)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-058-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 12 (`12-detail-card.png`) and board 2/8 (`02-main.png`, `08-glass-fabric.png`); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): add the details button to the card`

### US-059: Keyboard opens the sheet
**Description:** As a keyboard user, I want Enter or Space on the card to open details and Escape to bring me back.

**Acceptance criteria:**
- [ ] Enter/Space on the focused card opens the sheet (`source: 'key'`) without breaking the keys in `src/lib/names/keys.ts` (check the key map first and record it in notes); Escape closes and focus returns to the card; `tests/names/keys.test.ts` updated if keys.ts changes
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-059-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 13 (desktop Chromium 1280 × 800 for the keyboard part); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): open details from the keyboard`

### US-060: Decide from the sheet on the current card
**Description:** As someone who read the details, I want to keep, love or skip right there.

**Acceptance criteria:**
- [ ] Per PRD §3.2.5 first bullet and §3.3.2 (same `decide()` path as swipes, so launch-pack counters and prompts count it): the sheet closes without leaving a history entry, then the card flies like the action buttons; the vote is saved (REST read), `vote` analytics has `method: 'detail'`; 'ביטול' undoes it and the card comes back
- [ ] Reduced motion: fade only
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-060-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 13 and the swipe screen; every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): decide from the details sheet`

### US-061: Decide on another name from the sheet
**Description:** As someone who opened a similar name, I want to save it without leaving the sheet.

**Acceptance criteria:**
- [ ] Per PRD §3.2.5 second bullet: vote saved through the same vote-store path the swipe screen uses (PRD §3.3.2), button pressed, toast via `ToastRegion` ('נשמר: {name}' / 'אהבתי מאוד: {name}' / 'דילוג: {name}'), live region text, sheet stays; the name no longer comes up in the deck
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-061-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 13; every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): decide on similar names from the sheet`

### US-062: Open a similar name
**Description:** As someone exploring forms of a name, I want to tap one and see its details, then go back.

**Acceptance criteria:**
- [ ] Chip tap opens that name with `openNameSheet` (push), fires `detail_similar_tap` and `detail_opened {source: 'similar'}`; Back returns to the previous name, a second Back closes; the scroll position resets to the top for the new name; focus moves to the new heading
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-062-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 15; every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): open similar names from the sheet`

### US-063: Slim card
**Description:** As someone swiping, I want a calm card that fits on the screen, with the long parts one tap away.

**Acceptance criteria:**
- [ ] `NameCard` per PRD §3.1.2 / FR-D19: no `CardBible`/`CardPeople` on the card, intro clamped to 2 lines (`line-clamp-2`), hint chips from `cardHints` (non-interactive, `Chip` look), boys/girls bar and tiles kept, 'לכל הפרטים' kept; `cardLabel` gains the details hint and the card `aria-haspopup="dialog"`; `tests/names/a11y.test.ts` updated
- [ ] The previous run's card checks still pass where still relevant (header, bar, tiles, peeking cards, stamps)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-063-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 12 (`12-detail-card.png`) and board 2/8 (`02-main.png`, `08-glass-fabric.png`); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): slim the swipe card`

### US-064: The card never scrolls, swipe-up works everywhere
**Description:** As someone swiping on a phone, I want swipe-up to love on every card.

**Acceptance criteria:**
- [ ] At 390 × 844 and 375 × 667 the card's content fits for every deck name: a script renders all 1,295 cards (or measures with the same CSS in Playwright) and reports any overflow; fix layout until 0 overflow, record the result
- [ ] `useSwipeDrag`'s fit check gives `touch-action: none` to fitting cards (unchanged logic); swipe-up loves by touch on the 5 longest cards from US-003 in all three browsers
- [ ] At 200% zoom / 320 px the card may scroll and uses the existing pan-y fallback (check it still works)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-064-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 12 (`12-detail-card.png`) and board 2/8 (`02-main.png`, `08-glass-fabric.png`); every difference fixed or explained in `notes`
- [ ] Committed once: `fix(names): keep every card unscrolled so swipe-up works`

### US-065: Deep link to a name's sheet
**Description:** As someone following a link, I want the right sheet to open.

**Acceptance criteria:**
- [ ] `/names?sheet=name&n=<valid>` opens the sheet on top of the deck after data loads (`detail_opened {source: 'link'}`); Back/close leaves `/names` clean; invalid `n` is dropped by replace; signed-out users go through the normal auth guard and land back with the sheet open if the guard keeps the query (if it doesn't, note it, don't change auth)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-065-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 13; every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): open a name's sheet from a link`

### US-066: Lists: tap a name to open its sheet
**Description:** As someone narrowing down saved names, I want the details from the list.

**Acceptance criteria:**
- [ ] `NameDetailSheet` mounted in `ListsScreen`; tapping the name area of a 'שמרתי' or matches-tab row (the launch pack's matches tab if it's on main) opens it (`source: 'list'`), the row menu button keeps its behaviour; rows keep their look and ≥ 44 px targets; the sheet's together badge uses the Lists matches; custom names added by hand (no card) don't open a sheet (no tap affordance on them)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-066-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 5 (`05-lists.png`, `Lists.dc.html`) and boards 13–14; every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): open details from the lists`

### US-067: Lists: change a vote from the sheet
**Description:** As someone on the Lists screen, I want to change my choice from the details.

**Acceptance criteria:**
- [ ] Per PRD §3.2.6: pressed state shows the current vote; another choice updates the store and the list, toast confirms; 'דילוג' removes from 'שמרתי' (with 'ביטול' in the toast if the toast system supports actions, else confirm only, noted); sheet stays open; REST read confirms
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-067-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 5 (`05-lists.png`, `Lists.dc.html`) and boards 13–14; every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): change votes from the details sheet in lists`

### US-068: Offline sheet
**Description:** As someone offline, I want the sheet to open with whatever is available.

**Acceptance criteria:**
- [ ] Production build (3100), Chromium Pixel and Simulator: after one online visit the sheet works offline with story and similar names; with the details URL blocked (Playwright `route.abort`) the two sections show the offline line and the rest renders; votes from the sheet queue and flush when back online (REST check)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-068-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 13; every difference fixed or explained in `notes`
- [ ] Committed once: `fix(names): make the details sheet work offline`

### US-069: Sheet motion and reduced motion
**Description:** As someone using the sheet, I want smooth motion, and none when I ask for less.

**Acceptance criteria:**
- [ ] Slide up 260 ms ease-out, down 200 ms ease-in, detent changes animate (PRD §3.2.12); `prefers-reduced-motion` → 160 ms fade, no slide; no layout shift on the swipe screen behind (CLS 0 measured during open/close)
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-069-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 13 (also with `reducedMotion: 'reduce'`); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): animate the details sheet`

### US-070: Desktop layout
**Description:** As someone on a laptop, I want the sheet as a centered panel.

**Acceptance criteria:**
- [ ] ≥ 768 px: centered panel max 480 px wide, same detents logic replaced by a max height of 90vh with inner scroll; hover on the chart works; checked at 1280 × 800 in Chromium
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-070-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with boards 13–14 (desktop Chromium only for this story, plus one phone check that nothing changed); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): lay out the details sheet on desktop`

### US-071: Analytics wiring
**Description:** As the owner, I want the remaining sheet events recorded.

**Acceptance criteria:**
- [ ] `detail_closed {seconds, full}` on every close path; `detail_section_seen` once per open for numbers/similar/story via IntersectionObserver; all events checked in a network log (Chromium) with no name, surname or vote text in any request
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-071-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 13 (network log is the main check); every difference fixed or explained in `notes`
- [ ] Committed once: `feat(names): record detail sheet events`

### US-072: Code-split the sheet and measure
**Description:** As someone on a slow phone, I want the swipe screen to stay as fast as before.

**Acceptance criteria:**
- [ ] The sheet and chart load via a lazy import on first open (preload on card focus/pointerdown is allowed); `npm run build` route sizes for `/names` and `/names/lists` before (origin/main) and after recorded in notes; first-load JS of `/names` grows ≤ 5 KB gzipped
- [ ] Sheet opens < 150 ms after the tap on Chromium Pixel with 4× CPU throttling after the first open (performance marks), first open time recorded too
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-072-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with board 13; every difference fixed or explained in `notes`
- [ ] Committed once: `perf(names): load the details sheet on demand`

### US-073: Docs
**Description:** As the next developer, I want the sheet, data and content pipeline documented.

**Acceptance criteria:**
- [ ] `docs/names-pwa/README.md`: a 'Name detail sheet' section (files, URL layer, data loading, gestures, analytics) and the details file in 'Swapping the card content'; `data/names/content-src/README.md`: the details batches, rules summary and build command; `docs/names-pwa/E16-name-swipe-spec.md`: a short addendum linking this PRD
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `docs(names): document the details sheet and content`

### US-074: Self-audit before QA
**Description:** As the QA cycles, I want obvious rule breaks fixed before testing starts.

**Acceptance criteria:**
- [ ] Grep every file changed on this branch (`git diff --name-only origin/main...`) under `src/`: no hex/rgb/px font sizes, no physical left/right properties, every icon button labelled in Hebrew, no green, no `console.log`; `designGuard` green
- [ ] axe on the open sheet (both heights) in WebKit: 0 serious/critical
- [ ] Fixes committed in this story
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Mobile browser check (PRD §10) passes: screenshots `scripts/ralph/qa/name-detail/shots/us-074-*.png` from WebKit iPhone 15 and Chromium Pixel 7 (both with touch) and from Mobile Safari in the iOS Simulator, each read and compared with boards 12–15; every difference fixed or explained in `notes`
- [ ] Committed once: `chore(names): fix audit findings before QA`

### US-QA0: QA setup
**Description:** As the QA cycles, I need a clean, known starting state in every browser.

**Acceptance criteria:**
- [ ] Production build running on port 3100 (`npm run build && npm run start -- -p 3100`), checked by curl
- [ ] QA users 1–3 signed in over REST (`login.mjs`), their `name_votes` rows deleted through REST as each user, user 1 onboarded per README; users 1 and 2 share one space (create with the invite/join helpers if needed; write what you did in `progress.txt`); user 3 solo
- [ ] Simulator Mobile Safari signed in as user 1 on port 3100 (session from US-003 may need a new sign-in for the new port; ≤ 2 emails)
- [ ] One screenshot per browser of `/names` proves all three work
- [ ] No commit

### US-QA1-A: QA cycle 1: Tap vs swipe
**Description:** As the owner, I want area A (Tap vs swipe) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area A checklist (PRD §11.4 A) run in full, even if it passed in an earlier cycle

### US-QA1-B: QA cycle 1: Sheet behaviour
**Description:** As the owner, I want area B (Sheet behaviour) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area B checklist (PRD §11.4 B) run in full, even if it passed in an earlier cycle

### US-QA1-C: QA cycle 1: Content correctness
**Description:** As the owner, I want area C (Content correctness) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area C checklist (PRD §11.4 C) run in full, even if it passed in an earlier cycle

### US-QA1-D: QA cycle 1: Chart
**Description:** As the owner, I want area D (Chart) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area D checklist (PRD §11.4 D) run in full, even if it passed in an earlier cycle

### US-QA1-E: QA cycle 1: Similar names
**Description:** As the owner, I want area E (Similar names) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area E checklist (PRD §11.4 E) run in full, even if it passed in an earlier cycle

### US-QA1-F: QA cycle 1: Surname
**Description:** As the owner, I want area F (Surname) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area F checklist (PRD §11.4 F) run in full, even if it passed in an earlier cycle

### US-QA1-G: QA cycle 1: Together and privacy
**Description:** As the owner, I want area G (Together and privacy) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area G checklist (PRD §11.4 G) run in full, even if it passed in an earlier cycle

### US-QA1-H: QA cycle 1: Deciding from the sheet
**Description:** As the owner, I want area H (Deciding from the sheet) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area H checklist (PRD §11.4 H) run in full, even if it passed in an earlier cycle

### US-QA1-I: QA cycle 1: Lists entry
**Description:** As the owner, I want area I (Lists entry) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area I checklist (PRD §11.4 I) run in full, even if it passed in an earlier cycle

### US-QA1-J: QA cycle 1: Slim card and swipe-screen regression
**Description:** As the owner, I want area J (Slim card and swipe-screen regression) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area J checklist (PRD §11.4 J) run in full, even if it passed in an earlier cycle

### US-QA1-K: QA cycle 1: Offline and PWA
**Description:** As the owner, I want area K (Offline and PWA) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area K checklist (PRD §11.4 K) run in full, even if it passed in an earlier cycle

### US-QA1-L: QA cycle 1: Accessibility, RTL, design system
**Description:** As the owner, I want area L (Accessibility, RTL, design system) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area L checklist (PRD §11.4 L) run in full, even if it passed in an earlier cycle

### US-QA1-M: QA cycle 1: Analytics
**Description:** As the owner, I want area M (Analytics) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area M checklist (PRD §11.4 M) run in full, even if it passed in an earlier cycle

### US-QA1-N: QA cycle 1: Regression: sign-in and onboarding
**Description:** As the owner, I want area N (Regression: sign-in and onboarding) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area N checklist (PRD §11.4 N) run in full, even if it passed in an earlier cycle

### US-QA1-O: QA cycle 1: Regression: lists, duel, invite, join, matches
**Description:** As the owner, I want area O (Regression: lists, duel, invite, join, matches) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area O checklist (PRD §11.4 O) run in full, even if it passed in an earlier cycle

### US-QA1-P: QA cycle 1: Regression: about, report, legal, settings, backgrounds
**Description:** As the owner, I want area P (Regression: about, report, legal, settings, backgrounds) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area P checklist (PRD §11.4 P) run in full, even if it passed in an earlier cycle

### US-QA1-Q: QA cycle 1: Performance
**Description:** As the owner, I want area Q (Performance) checked in real mobile browsers in cycle 1, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area Q checklist (PRD §11.4 Q) run in full, even if it passed in an earlier cycle

### US-FIX1: Fix the bugs from QA cycle 1
**Description:** As the owner, I want every open bug from cycle 1 fixed and verified, or the loop to stop when QA is clean.

**Acceptance criteria:**
- [ ] If cycle 1 filed zero `open` bugs: mark every remaining `US-QA*` and `US-FIX*` story `passes: true` with notes 'skipped: QA clean after cycle 1', no commit, and let US-FINAL run
- [ ] Otherwise: fix every `open` bug, verify each fix in the browser it failed in (screenshot), set `status: fixed` with a fix note and the cycle
- [ ] A bug that can't be fixed without breaking a §3 decision is set `wontfix-owner` with the reason
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `fix(names): resolve the {k} bugs found in detail QA cycle 1`

### US-QA2-A: QA cycle 2: Tap vs swipe
**Description:** As the owner, I want area A (Tap vs swipe) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area A checklist (PRD §11.4 A) run in full, even if it passed in an earlier cycle

### US-QA2-B: QA cycle 2: Sheet behaviour
**Description:** As the owner, I want area B (Sheet behaviour) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area B checklist (PRD §11.4 B) run in full, even if it passed in an earlier cycle

### US-QA2-C: QA cycle 2: Content correctness
**Description:** As the owner, I want area C (Content correctness) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area C checklist (PRD §11.4 C) run in full, even if it passed in an earlier cycle

### US-QA2-D: QA cycle 2: Chart
**Description:** As the owner, I want area D (Chart) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area D checklist (PRD §11.4 D) run in full, even if it passed in an earlier cycle

### US-QA2-E: QA cycle 2: Similar names
**Description:** As the owner, I want area E (Similar names) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area E checklist (PRD §11.4 E) run in full, even if it passed in an earlier cycle

### US-QA2-F: QA cycle 2: Surname
**Description:** As the owner, I want area F (Surname) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area F checklist (PRD §11.4 F) run in full, even if it passed in an earlier cycle

### US-QA2-G: QA cycle 2: Together and privacy
**Description:** As the owner, I want area G (Together and privacy) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area G checklist (PRD §11.4 G) run in full, even if it passed in an earlier cycle

### US-QA2-H: QA cycle 2: Deciding from the sheet
**Description:** As the owner, I want area H (Deciding from the sheet) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area H checklist (PRD §11.4 H) run in full, even if it passed in an earlier cycle

### US-QA2-I: QA cycle 2: Lists entry
**Description:** As the owner, I want area I (Lists entry) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area I checklist (PRD §11.4 I) run in full, even if it passed in an earlier cycle

### US-QA2-J: QA cycle 2: Slim card and swipe-screen regression
**Description:** As the owner, I want area J (Slim card and swipe-screen regression) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area J checklist (PRD §11.4 J) run in full, even if it passed in an earlier cycle

### US-QA2-K: QA cycle 2: Offline and PWA
**Description:** As the owner, I want area K (Offline and PWA) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area K checklist (PRD §11.4 K) run in full, even if it passed in an earlier cycle

### US-QA2-L: QA cycle 2: Accessibility, RTL, design system
**Description:** As the owner, I want area L (Accessibility, RTL, design system) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area L checklist (PRD §11.4 L) run in full, even if it passed in an earlier cycle

### US-QA2-M: QA cycle 2: Analytics
**Description:** As the owner, I want area M (Analytics) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area M checklist (PRD §11.4 M) run in full, even if it passed in an earlier cycle

### US-QA2-N: QA cycle 2: Regression: sign-in and onboarding
**Description:** As the owner, I want area N (Regression: sign-in and onboarding) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area N checklist (PRD §11.4 N) run in full, even if it passed in an earlier cycle

### US-QA2-O: QA cycle 2: Regression: lists, duel, invite, join, matches
**Description:** As the owner, I want area O (Regression: lists, duel, invite, join, matches) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area O checklist (PRD §11.4 O) run in full, even if it passed in an earlier cycle

### US-QA2-P: QA cycle 2: Regression: about, report, legal, settings, backgrounds
**Description:** As the owner, I want area P (Regression: about, report, legal, settings, backgrounds) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area P checklist (PRD §11.4 P) run in full, even if it passed in an earlier cycle

### US-QA2-Q: QA cycle 2: Performance
**Description:** As the owner, I want area Q (Performance) checked in real mobile browsers in cycle 2, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area Q checklist (PRD §11.4 Q) run in full, even if it passed in an earlier cycle

### US-FIX2: Fix the bugs from QA cycle 2
**Description:** As the owner, I want every open bug from cycle 2 fixed and verified, or the loop to stop when QA is clean.

**Acceptance criteria:**
- [ ] If cycle 2 filed zero `open` bugs: mark every remaining `US-QA*` and `US-FIX*` story `passes: true` with notes 'skipped: QA clean after cycle 2', no commit, and let US-FINAL run
- [ ] Otherwise: fix every `open` bug, verify each fix in the browser it failed in (screenshot), set `status: fixed` with a fix note and the cycle
- [ ] A bug that can't be fixed without breaking a §3 decision is set `wontfix-owner` with the reason
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `fix(names): resolve the {k} bugs found in detail QA cycle 2`

### US-QA3-A: QA cycle 3: Tap vs swipe
**Description:** As the owner, I want area A (Tap vs swipe) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area A checklist (PRD §11.4 A) run in full, even if it passed in an earlier cycle

### US-QA3-B: QA cycle 3: Sheet behaviour
**Description:** As the owner, I want area B (Sheet behaviour) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area B checklist (PRD §11.4 B) run in full, even if it passed in an earlier cycle

### US-QA3-C: QA cycle 3: Content correctness
**Description:** As the owner, I want area C (Content correctness) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area C checklist (PRD §11.4 C) run in full, even if it passed in an earlier cycle

### US-QA3-D: QA cycle 3: Chart
**Description:** As the owner, I want area D (Chart) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area D checklist (PRD §11.4 D) run in full, even if it passed in an earlier cycle

### US-QA3-E: QA cycle 3: Similar names
**Description:** As the owner, I want area E (Similar names) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area E checklist (PRD §11.4 E) run in full, even if it passed in an earlier cycle

### US-QA3-F: QA cycle 3: Surname
**Description:** As the owner, I want area F (Surname) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area F checklist (PRD §11.4 F) run in full, even if it passed in an earlier cycle

### US-QA3-G: QA cycle 3: Together and privacy
**Description:** As the owner, I want area G (Together and privacy) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area G checklist (PRD §11.4 G) run in full, even if it passed in an earlier cycle

### US-QA3-H: QA cycle 3: Deciding from the sheet
**Description:** As the owner, I want area H (Deciding from the sheet) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area H checklist (PRD §11.4 H) run in full, even if it passed in an earlier cycle

### US-QA3-I: QA cycle 3: Lists entry
**Description:** As the owner, I want area I (Lists entry) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area I checklist (PRD §11.4 I) run in full, even if it passed in an earlier cycle

### US-QA3-J: QA cycle 3: Slim card and swipe-screen regression
**Description:** As the owner, I want area J (Slim card and swipe-screen regression) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area J checklist (PRD §11.4 J) run in full, even if it passed in an earlier cycle

### US-QA3-K: QA cycle 3: Offline and PWA
**Description:** As the owner, I want area K (Offline and PWA) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area K checklist (PRD §11.4 K) run in full, even if it passed in an earlier cycle

### US-QA3-L: QA cycle 3: Accessibility, RTL, design system
**Description:** As the owner, I want area L (Accessibility, RTL, design system) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area L checklist (PRD §11.4 L) run in full, even if it passed in an earlier cycle

### US-QA3-M: QA cycle 3: Analytics
**Description:** As the owner, I want area M (Analytics) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area M checklist (PRD §11.4 M) run in full, even if it passed in an earlier cycle

### US-QA3-N: QA cycle 3: Regression: sign-in and onboarding
**Description:** As the owner, I want area N (Regression: sign-in and onboarding) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area N checklist (PRD §11.4 N) run in full, even if it passed in an earlier cycle

### US-QA3-O: QA cycle 3: Regression: lists, duel, invite, join, matches
**Description:** As the owner, I want area O (Regression: lists, duel, invite, join, matches) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area O checklist (PRD §11.4 O) run in full, even if it passed in an earlier cycle

### US-QA3-P: QA cycle 3: Regression: about, report, legal, settings, backgrounds
**Description:** As the owner, I want area P (Regression: about, report, legal, settings, backgrounds) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area P checklist (PRD §11.4 P) run in full, even if it passed in an earlier cycle

### US-QA3-Q: QA cycle 3: Performance
**Description:** As the owner, I want area Q (Performance) checked in real mobile browsers in cycle 3, so bugs are found before review.

**Acceptance criteria:**
- [ ] Runs every item of the checklist in PRD §11.4 for this area, in the browsers it names (all three = WebKit iPhone 15, Chromium Pixel 7, Simulator Mobile Safari), on the production build on port 3100
- [ ] Each item: pass, or a bug in `scripts/ralph/qa/name-detail/bugs.md` (PRD §11.1 fields, next free `ND-BUG-` id, screenshot in `shots/`); ideas go to `ux-insights.md`
- [ ] Never fixes and never commits; appends a short result to `progress.txt` (items checked, bugs filed)
- [ ] Area Q checklist (PRD §11.4 Q) run in full, even if it passed in an earlier cycle

### US-FIX3: Fix the bugs from QA cycle 3
**Description:** As the owner, I want every open bug from cycle 3 fixed and verified, or the loop to stop when QA is clean.

**Acceptance criteria:**
- [ ] If cycle 3 filed zero `open` bugs: mark every remaining `US-QA*` and `US-FIX*` story `passes: true` with notes 'skipped: QA clean after cycle 3', no commit, and let US-FINAL run
- [ ] Otherwise: fix every `open` bug, verify each fix in the browser it failed in (screenshot), set `status: fixed` with a fix note and the cycle
- [ ] A bug that can't be fixed without breaking a §3 decision is set `wontfix-owner` with the reason
- [ ] Checks pass: `npm run lint` (0 errors), `npx tsc --noEmit` (typecheck passes), `npm test`, `npm run build`
- [ ] Committed once: `fix(names): resolve the {k} bugs found in detail QA cycle 3`
- [ ] This is the last fix pass: anything still broken stays `open`

### US-FINAL: Summary and push
**Description:** As the owner, I want an honest summary and the branch pushed, so I can review and open a PR.

**Acceptance criteria:**
- [ ] Re-checks every bug fixed in the last cycle that ran, in its browser
- [ ] `scripts/ralph/qa/name-detail/SUMMARY.md`: stories done, 'clean after cycle N' or 'stopped after 3 cycles, {k} bugs open for the owner's review' with the list and screenshots paths, content coverage numbers from DETAILS-REPORT.md, the spot-check files to read, perf numbers from US-072, and any blocked checks; never rounds up
- [ ] Committed once: `docs(names): detail sheet QA summary`; `git push -u origin ralph/name-detail` (never main)
