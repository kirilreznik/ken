# NATIVE · ALL: every `/names` route (G1, G2, G3) and the installed web app

Skill: `mobile-native` (`.claude/skills/mobile-native/SKILL.md`; the skill has no other files). Every row of its Symptom Table, every fix §1–§11, the Baseline and the "Never Ship" table were checked on every route of PRD §6. Assumptions where the skill would ask or wait: the "Initial Response" greeting is skipped. The skill's Output says "apply the fixes", but this is an audit (PRD §3.3.6), so the fixes are only proposed here and no code was changed. "Real hardware" (§11) means the iOS Simulator plus Playwright devices (PRD §10). Each finding says what still needs a phone. No service-bound steps.

## How it was checked

- **Code scan** of `src/app/layout.tsx`, `src/app/names/**`, `src/components/names/**`, `src/lib/names/manifest.ts` and `names.css`. Grepped for: `viewport`, `themeColor`, `appleWebApp`, `tap-highlight`, `overscroll`, `user-select`/`select-none`, `touch-callout`, `touch-action`/`touch-*`, `text-size-adjust`, `safe-area-inset`, `vh`/`dvh`/`svh`, `hover:`, `<input`/`<textarea` attributes (`inputMode`, `enterKeyHint`, `autoComplete`, `autoCorrect`, `autoCapitalize`, `spellCheck`), and `<img`.
- **Probe, WebKit iPhone 15 and Chromium Pixel 7** (`shots/native-probe.mjs <engine>`, dev :3000, real backend, read-only). It covers 20 states: signed out it opens welcome, sign-in email, callback, join (unknown code), offline, goodbye and 404; as QA user 1 it opens intro, invite, the deck, the name sheet, the filters sheet, lists, the add-name sheet, matches, hidden, settings, about, privacy and terms. For each state it records:
  - computed `overscroll-behavior-y` on `html`/`body` and `-webkit-tap-highlight-color` on `.nest-names`;
  - for every visible control: `user-select`, `-webkit-touch-callout` and `touch-action`;
  - every text field's font size and keyboard attributes;
  - every `:hover` rule outside a `(hover: hover)` media query, and every `vh` rule, in the loaded stylesheets;
  - the viewport, theme-color and apple-* meta tags, the fixed elements' paddings, and horizontal overflow.
  Output: `shots/audit/NATIVE/probe-{webkit,chromium}.json` plus one screenshot per state.
- **Simulator, Mobile Safari** (iPhone 17 Pro, iOS 26.5; `shots/native-sim.mjs hold|path|shot`):
  - long press on a header link and on a header icon button;
  - pull down on the deck, and on the scrim of an open sheet;
  - long press on a background thumbnail;
  - double tap on a filter chip;
  - about and the name sheet in landscape (portrait vs landscape line pitch).
  Signed in on :3000, signed out on :3100.
- **Installed web app (Simulator):** Safari → "…" → Share → View More → Add to Home Screen, with "Open as Web App" on (`sim-pwa-0…5.png`). Then launched from the Home Screen (`sim-pwa-welcome.png`).
  - **Gap:** inside the installed app, no `cliclick` tap or drag reached the page, whether on the buttons or on a plain legal link. Taps did work on the Home Screen. The same happened in the older "Best" web clip of the app. The web app's scene doesn't seem to take the Simulator's synthesized mouse input. Only the signed-out welcome screen could be judged standalone: its status bar, its top and bottom safe areas, and the bottom legal line above the home indicator. **The deck, the sheets and the lists still need a phone in standalone mode.** The app's only standalone code paths are `install.ts` (hides the install hint) and `NamesAnalytics` (`display_mode`); neither renders anything over the page, so the dead taps are put down to the harness, not the app.
- Filters were put back after the double-tap test (1,295 names, `sim-filters-dbltap.png` shows the moment of the bug). No votes were cast, and the Simulator was rotated back to portrait.

## Checked and held (no finding)

| Skill item | Result |
|---|---|
| §1 Sticky hover | Tailwind 4 `hover:` compiles to `@media (hover: hover)`. The stylesheet walk found **0** ungated `:hover` rules on any route. There are only 5 `hover:` uses (tabs, row menu, skip menu, survey prompt). (The skill also asks for `(pointer: fine)`. Tailwind's gate covers phones; not worth a finding.) |
| §2 Tap highlight | `-webkit-tap-highlight-color: transparent` on `.nest-names` (`names.css:45`), inherited by every element (computed `rgba(0,0,0,0)` on every route in both engines). No grey flash in the Simulator. |
| §3 Wrong height | App shells use `min-h-dvh`. The deck is `h-[calc(100dvh-insets)]`, and sheets use `dvh` and `env()`. No `100vh`/`h-screen` on mobile. The only `vh` rule is the desktop panel (-06). |
| §4 Input zoom | Fields under 16 px are already filed: IMP-A-G1-02, IMP-A-G2-04, IMP-A-G3-05 (PRO-G1-06). Re-measured: email, surname and add-name 15 px; settings name 13.5 px; the invite link field 12 px (`readOnly`, add it to the same fix). `maximum-scale`/`user-scalable` are absent, so pinch zoom works ✓. |
| §5 Laggy taps, press on pointer-down | Press feedback gaps are filed (MOT-G13-08, PRO-G1-03, PRO-G3-01, IMP-A-G1-08). `touch-action` is -04. |
| §6 Scroll chaining from sheets | Sheet bodies, the card, the match and decision layers are `overscroll-contain`. `useModal` sets `overflow: hidden` on `html`. A pull on the scrim of the open filters sheet left the page still (`sim-sheet-scrimpull-*.png`) ✓. The page itself is -01. |
| §7 Notch and home indicator | `viewport-fit=cover` comes through in the rendered viewport meta (the root layout's tag, merged with the names layout). Every screen pads top and bottom with `env(safe-area-inset-*)`. The deck and backgrounds also pad left/right. Toasts use `max(1.5rem, inset)` and sheets use `max(1.75rem, inset)`. In the installed app the welcome photo runs under the home indicator, and the legal line sits clear of it ✓. Landscape: the 480 px columns sit inside the side insets. |
| §8 Long press on the card | The swipe card and slider are `select-none` (`dragClass`, `LetterRangeSlider`). Full-screen background images are `pointer-events-none`, so they show no callout. |
| §9 Gesture axes | The card switches `touch-action` between `none` and `pan-y` depending on whether it scrolls. The sheet handle is `touch-none`, the year chart and letter slider are `pan-y`. A vertical scroll past the card works (IMP-A-G2). |
| §10 Status bar / theme-color | One `theme-color` (canvas `#F4F2F1`, root and names layouts) and no dark theme. The app is light-only and declares no `color-scheme`, so the UA keeps light controls in iOS dark mode, and one value is right. The manifest's `theme_color`/`background_color` are the same canvas. In the installed app, `apple-mobile-web-app-status-bar-style: default` gives an opaque canvas band behind the clock (`sim-pwa-welcome.png`). On the canvas screens (lists, settings, about) it is seamless. Over a photo (welcome, deck) the photo starts under the band, as it does in Safari itself. The alternative, `black-translucent`, puts a **white** clock over the light fabric/room photos and over the `#F4F2F1` canvas screens, where it would be unreadable. So `default` is the right call; nothing to change. |
| Baseline: `-webkit-text-size-adjust` | Not set. In landscape, iOS Safari kept the same line pitch as portrait on about (≈ 67 vs 68 px per line at the same scale, `sim-about-portrait.png` vs `sim-about-landscape.png`), so no text inflation. No finding. |
| Overflow | No horizontal scroll on any route in either engine (`scrollWidth` = viewport). |

## Findings

### NATIVE-ALL-01: Pulling down on the deck drags the whole app down and reloads it (pull-to-refresh)

- **Screen and state:** `/names` deck (any state). The same applies to every screen, but the deck is fixed-height and has nothing to scroll.
- **Browser:** sim-safari (seen). chromium-pixel: Android Chrome's pull-to-refresh follows from the same CSS, but Playwright can't show it, so it needs a phone.
- **What's wrong:** `overscroll-behavior` is `auto` on `html` and `body` on every route (probe, both engines). A downward drag that starts on the header or between the header and the card pulls the **whole deck down**: header, card and action bar move ~150 pt. Safari's reload spinner shows in the gap above, and the page reloads on release (`sim-deck-pull-held.png`). A second, accidental pull on the deck did the same. An app screen with its own gestures shouldn't rubber-band or refresh as a document.
- **Rule it breaks:** `mobile-native` · `SKILL.md` §6 · "Pull-to-refresh hijacks scroll → `overscroll-behavior: none` on `html, body`" and "Wrong … in an app with its own scroll containers, a drawer the user drags down".
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** `src/app/names/names.css` `@layer base`: `html:has(.nest-names), body:has(.nest-names) { overscroll-behavior-y: none; }`. Use `:has()` because the base rules are scoped (Next keeps stylesheets loaded across navigations, `names.css:1-3`), which keeps the landing page untouched (§3.1.9). The lists, settings and legal pages lose Safari's pull-to-refresh as well. They don't need it: lists come from the live vote cache, and an installed app has no pull-to-refresh on iOS anyway. Inner scrollers already use `contain`. Verify in the Simulator: pull on the deck header, the deck stays put. Then check that the lists still scroll, the sheets still drag, and the card still swipes.
- **Guardrail:** polish
- **Screenshot:** `scripts/ralph/qa/name-polish/shots/audit/NATIVE/sim-deck-pull-rest.png`, `…/sim-deck-pull-held.png`

### NATIVE-ALL-02: Controls are selectable text: a long press selects words with the loupe and a Copy menu, and a double tap selects a chip's label

- **Screen and state:** every route. Seen on the deck header and the filters sheet.
- **Browser:** sim-safari (seen). webkit-iphone and chromium-pixel (computed values).
- **What's wrong:** only the swipe card, the "דילוג" button, the letter slider, the year chart and the sheet's drag guard are `select-none`. Every other control keeps `user-select: text`: 7/10 controls on the deck, 45/48 in filters, 12/12 in settings, 4/4 on welcome, 10/10 on the add-name sheet (probe). In Safari:
  - **A long press on the "סינון" icon button** selected the "0" of the "השמות שלי" pill next to it. The selection handles, the loupe, then "Copy · Find Selection · Look Up" appeared (`sim-deck-filterbtn-held.png`, `…-after.png`).
  - **A double tap on the "שירה" filter chip** selected the word "שירה" with handles. The second tap was eaten by the selection, so the chip stayed on (35 names) instead of toggling back (`sim-filters-dbltap.png`).
  INT-G2-02 found the same thing on "שמירה"/"אהבתי"/undo. This is the app-wide cause.
- **Rule it breaks:** `mobile-native` · `SKILL.md` §8 · "Text that is a *control* shouldn't be selectable; text that is *content* must stay selectable" (`button, [role="button"], .tab, .chip … { user-select: none; -webkit-user-select: none; -webkit-touch-callout: none }`).
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** one base rule in `src/app/names/names.css` `@layer base`: `.nest-names :where(button, [role="button"], [role="tab"], label:has(> input[type="checkbox"]), label:has(> input[type="radio"])) { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }`. It's `:where()` (zero specificity), so a component can opt back in. Never on `body` or content text: name meanings, about and legal stay selectable. This makes the INT-G2-02 per-class fix unnecessary; merge them, and drop the now-redundant `select-none` from `SkipButton` only if triage wants the cleanup. Verify: hold "סינון" and "שמירה" (on :3100 or a mock, so nothing is saved), and double-tap a chip: no selection appears, and the chip toggles twice.
- **Guardrail:** polish
- **Screenshot:** `…/audit/NATIVE/sim-deck-filterbtn-held.png`, `…/sim-deck-filterbtn-after.png`, `…/sim-filters-dbltap.png`

### NATIVE-ALL-03: A long press on a link that looks like a button opens Safari's link preview

- **Screen and state:** deck header "השמות שלי" pill and gear (`SwipeHeader.tsx:62`, `IconButton`/`Button` as `Link`). The same holds for every `Link`-based control: the auth back button (`AuthLayout.tsx:42`), settings link rows (`SettingsScreen.tsx:65`), the "לבחירת שמות" and other `Button` links, the callback CTA (`AuthCallback.tsx:63`), and the 404/offline/error "back" links.
- **Browser:** sim-safari (seen).
- **What's wrong:** holding the "השמות שלי" pill opened a full **page preview of `/names/lists`** with "Open · Open in New Tab · Open in Tab Group · Download Linked File · Add to Reading List" over the deck (`sim-deck-listlink-held.png`). That is a browser tell on what looks like an app button, and "Open in New Tab" splits the app into two tabs. Inline text links (welcome/join legal links, the about source link, privacy/terms body links) are content, and should keep their callout.
- **Rule it breaks:** `mobile-native` · `SKILL.md` §8 · "`-webkit-touch-callout: none` /* no long-press callout on links/images used as controls */".
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** add `select-none [-webkit-touch-callout:none]` to the link branch of the shared classes: `ui/Button.tsx` (both `Link` returns), `iconButtonClass()` in `ui/classes.ts`, `SwipeHeader.tsx:62`, `AuthLayout.tsx:42`, `SettingsScreen.tsx` `rowAction`, `AuthCallback.tsx:63`. Alternatively, extend the -02 base rule with a `[data-control]` hook on those links. Don't apply it to underlined inline links. Verify: hold the "השמות שלי" pill, and no preview opens; a tap still navigates.
- **Guardrail:** polish
- **Screenshot:** `…/audit/NATIVE/sim-deck-listlink-rest.png`, `…/sim-deck-listlink-held.png`

### NATIVE-ALL-04: A long press on a background thumbnail pops the photo out with "Share · Save to Photos · Copy"

- **Screen and state:** background sheet (`BackgroundSheet.tsx`, `next/image` thumbnails inside the choice buttons; the own-photo `<img>` at `:204`).
- **Browser:** sim-safari (seen).
- **What's wrong:** holding the "מחברת" thumbnail lifted the image out of the sheet as a large preview with the iOS image menu (`sim-bgthumb-held.png`). The thumbnail is a control (a radio-like choice), not content to save. It also offers to save the user's own photo, which is meant to stay on the device.
- **Rule it breaks:** `mobile-native` · `SKILL.md` §8 · "no long-press callout on links/images used as controls".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** covered by -02 if its rule is on `button` (`-webkit-touch-callout` is inherited by the `img` inside). Otherwise add `[-webkit-touch-callout:none]` and `draggable={false}` to the thumbnail images in `BackgroundSheet.tsx`. Verify: hold a thumbnail, and no preview or menu appears; a tap still picks the background.
- **Guardrail:** polish
- **Screenshot:** `…/audit/NATIVE/sim-bgsheet.png`, `…/sim-bgthumb-held.png`

### NATIVE-ALL-05: Most controls lack `touch-action: manipulation`, so a quick second tap is read as a double-tap gesture

- **Screen and state:** every route. Only the `PRESS` controls (`Button`, `IconButton`, `Chip`, decision pills) have `touch-manipulation`. Without it: the welcome and sign-in CTAs (`WelcomeActions.tsx`, `EmailSignIn.tsx` `primaryButton`), the lists/duel tabs, the 38 filter chips and rows built on raw `button`/`label`, settings rows (10/12 `auto`), the about links, onboarding, the callback CTA, and the row menu items (probe `touchAction` counts).
- **Browser:** sim-safari (the double tap in -02 went to the browser's word selection instead of a second click). webkit-iphone and chromium-pixel (computed values).
- **What's wrong:** without `manipulation` the browser keeps double-tap gestures (zoom, word select) on these elements. It may hold the first click while it waits, and it turns a fast second tap into a gesture. Toggling a chip twice, or tapping "שליחה שוב" twice, doesn't behave like a native control.
- **Rule it breaks:** `mobile-native` · `SKILL.md` §5 · "`touch-action: manipulation` tells the browser this element never double-tap-zooms, so it fires `click` immediately" (`button, a, [role="button"] { touch-action: manipulation }`).
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** add `touch-action: manipulation` to the same base rule as -02 in `names.css` (`:where(button, a, [role="button"], [role="tab"], label)`). The card's own inline `touchAction` and the handle's `touch-none` win over it (they're more specific and inline). Verify: double-tap a filter chip in the Simulator, and it toggles on and off.
- **Guardrail:** polish
- **Screenshot:** `…/audit/NATIVE/sim-filters-dbltap.png`, `…/probe-webkit.json` (`deck-filters.touchAction`)

### NATIVE-ALL-06: In landscape the tall sheet is sized from `90vh`, so its top runs under Safari's toolbar

- **Screen and state:** name sheet (any tall sheet) with the phone in landscape. An iPhone 17 Pro is 874 px wide in landscape, which is ≥ 768 px, so the `md:` centred panel applies. iPad Safari gets the same panel.
- **Browser:** sim-safari (landscape).
- **What's wrong:** the panel's `md:max-h-[90vh]` (`ui/BottomSheet.tsx:318`) uses the large viewport. In landscape, Safari's toolbar and tab strip take ~110 pt at the top, so the panel's top edge is under them: "נועה" is cut at the toolbar and the panel has no top corners. The bottom also runs flush into the screen edge with the action row half visible (`sim-namesheet-landscape.png`, rotated).
- **Rule it breaks:** `mobile-native` · `SKILL.md` §3 · "`100vh` on mobile is the *largest* viewport … use the dynamic and small units instead" / Never Ship "`100vh` for an app shell or bottom-pinned UI → `100dvh`".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `ui/BottomSheet.tsx:318` `md:max-h-[90vh]` → `md:max-h-[90dvh]` (the comment at `:64` too). Verify: the name sheet in Simulator landscape has its top corners and the close button below the toolbar. Desktop Chromium 1280 × 800 is unchanged (there `dvh` = `vh`).
- **Guardrail:** polish
- **Screenshot:** `…/audit/NATIVE/sim-namesheet-landscape.png`

### NATIVE-ALL-07: Name fields let iOS autocorrect and spell-check the names; some fields have no return-key label

- **Screen and state:** add-name sheet (`lists/AddNameSheet.tsx:70`), intro surname (`Intro.tsx:132`), onboarding and settings display name (`Onboarding.tsx:153`, `SettingsScreen.tsx:272`), the report sheet's name field (`about/ReportSheet.tsx:142`). The return key: email (`EmailSignIn.tsx:155`), surname, onboarding and settings name.
- **Browser:** webkit-iphone and chromium-pixel (attributes from the probe and the code). The keyboard itself needs a phone (the Simulator types from the Mac keyboard, so no on-screen keyboard shows).
- **What's wrong:**
  - The email and code fields set `autoCorrect="off"`, `autoCapitalize="off"` and `spellCheck={false}`, but none of the name fields do. iOS autocorrect can replace an uncommon name with a dictionary word as the user types a space or taps done (e.g. a Hebrew custom name or a Latin surname), and it underlines names in red.
  - Only add-name sets `enterKeyHint` ("done"). The email step's return key says "return" although it sends the code, and the single-field name forms show a generic key.
- **Rule it breaks:** `mobile-native` · `SKILL.md` §4 · "set the keyboard: … `autocapitalize="none"` and `autocorrect="off"` on usernames and codes, `enterkeyhint="send"` / `"search"` / `"done"` so the return key says what it does".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** on the five name fields add `autoCorrect="off" spellCheck={false}`, keeping `autoCapitalize` at its default (`sentences`) so Latin names still start with a capital. Add `enterKeyHint="send"` to the email field, `"done"` to the surname, settings name and report name fields, and `"next"` to the onboarding name (the consent checkboxes come next). No visual change. Verify: the attributes in the WebKit probe, and the keyboard on a phone.
- **Guardrail:** polish
- **Screenshot:** `…/audit/NATIVE/probe-webkit.json` (`inputs` per state), `…/lists-addname-webkit.png`

### NATIVE-ALL-08: No `interactive-widget=resizes-content`, so on Android the keyboard covers the bottom-pinned buttons of the field sheets

- **Screen and state:** the add-name sheet footer ("הוספה"), report and survey sheet footers ("שליחה"), the intro's sticky "התחלת בחירה" footer under the surname field, and the settings name field near the bottom. All of these with the keyboard open on Android Chrome.
- **Browser:** chromium-pixel. Read from the code and the rendered meta (`width=device-width, initial-scale=1, viewport-fit=cover`); the software keyboard can't be shown in Playwright, so this needs an Android phone. iOS already resizes the visual viewport for `dvh`/fixed UI.
- **What's wrong:** Android Chrome's default (`resizes-visual`) lays the keyboard over the page without shrinking the layout viewport. `fixed`/`dvh` sheets keep their footer at the old bottom, under the keyboard, and the user has to close the keyboard to reach "הוספה"/"שליחה".
- **Rule it breaks:** `mobile-native` · `SKILL.md` Baseline · "`interactive-widget=resizes-content` makes the software keyboard shrink the layout viewport on Android Chrome, so `100dvh` and bottom-pinned inputs react to it the way they do on iOS".
- **Severity:** P3
- **Effort:** XS
- **Proposed change:** `src/app/names/layout.tsx` `viewport`: add `interactiveWidget: "resizes-content"`. Next merges it with the root's width/scale/viewport-fit, as it already does for `themeColor`. Keep it in the names layout so the landing is unchanged (§3.1.9). Read Next 16's `generate-viewport` docs for the field name before using it. Verify: the rendered meta in both engines. On an Android phone, open the add-name sheet with the keyboard and check that "הוספה" sits above the keyboard and the deck behind it doesn't jump.
- **Guardrail:** polish
- **Screenshot:** `…/audit/NATIVE/probe-chromium.json` (`deck.metas`)

## Summary

8 findings: 3 P2 (-01 pull-to-refresh on the deck, -02 selectable controls, -03 link previews on control links) and 5 P3 (-04 thumbnail image callout, -05 `touch-action`, -06 `90vh` panel in landscape, -07 name field keyboard attributes, -08 Android keyboard over sheet footers). All are XS and polish.

-01, -02, -04 and -05 come from one missing block of the skill's Baseline in `names.css`. Triage can take them as one slot, with -03 in the same component pass. Merges: -02 ⊇ INT-G2-02. Input sizes stay with IMP-A-G1-02 / IMP-A-G2-04 / IMP-A-G3-05, plus the 12 px invite field found here. Press feedback stays with MOT-G13-08 and its merges.

**What still needs a phone:**
- standalone mode beyond the welcome screen (Simulator input didn't reach the installed app);
- Android pull-to-refresh (-01) and the Android keyboard (-08);
- the iOS keyboard's autocorrect and return-key labels (-07).
