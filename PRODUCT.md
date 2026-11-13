# Product

<!-- impeccable:product-schema 1 -->

<!--
Written by the polish run (US-003, tasks/prd-name-polish.md §3.3.4) without an interview:
Ralph runs unattended, so every fact below is taken from decisions already on file
(docs/names-pwa/brand/BRAND.md, docs/names-pwa/README.md, tasks/prd-names-pwa.md §3,
tasks/prd-name-detail.md §3) and none is new. Where the source is a PRD decision, it is cited.
Scope: the name swiper at /names only. The Nest landing page (/, /pregnancy) and the rest
of this repo are out of scope for this file and for DESIGN.md.
-->

## Platform

web

An installable PWA (manifest `display: standalone`, scope `/names`, own service worker) used mostly on phones in Mobile Safari and Chrome. Mobile web, not a native wrapper.

## Users

Whoever manages the pregnancy and is choosing a baby name: the pregnant parent, a partner, or both, and just as much someone choosing alone. The product never assumes a partner, a couple, or a gender (BRAND.md "Voice and copy", tasks/prd-names-pwa.md §3.1.8). Sharing is always optional; a partner, relative or friend joins by invite link.

Users are 18+ (confirmed at onboarding), read Hebrew, and arrive from the Nest landing page's name demo or from an invite link.

## Product Purpose

"בחירת שם": go through baby names one card at a time, keep the ones you like, and, if you choose with someone, see the names you all kept. It is the first Nest product people can use before the Nest app is in the stores, so everyone who signs up is already a Nest user on the shared Nest backend (tasks/prd-names-pwa.md §1).

What a visit is for:

- **First visit:** sign in (Google or a 6-digit email code), onboarding (display name, 18+, terms and privacy, optional launch updates), a one-time intro with an optional surname, then the deck.
- **A swiping visit:** decide on names (שמירה / אהבתי מאוד / דילוג, with undo), open a name's detail sheet for its story, numbers and similar names, adjust filters or the background.
- **A shared visit:** invite someone, see matches ("התאמות") as they appear, run the duel ("דו־קרב") on saved names or matches, and mark the name chosen ("בחרנו שם").
- **A return visit:** pick up where the deck left off, check "השמות שלי", see new matches. Works offline after the first visit.

Success is a calm, finished-feeling tool that people return to until they have chosen a name.

## Positioning

The real Israeli birth data (CBS, every name given 1949–2024) on every card, with a written story and checked similar names for each of the 1,295 deck names, inside a privacy model where nobody ever sees what someone else skipped. It is part of Nest, the Hebrew-first pregnancy app, and carries its brand.

## Operating Context

- Used on a phone, one-handed, often in short sessions; swipe gestures and three large buttons are the primary path, keyboard shortcuts exist for desktop.
- Hebrew only, right to left. Numbers and Latin text inside Hebrew keep their own direction.
- Works offline after one online visit: swiping, lists and the duel; votes queue and sync later.
- Installable to the home screen (Android prompt, iOS "add to home screen" steps).

### Visitor modes (impeccable, tasks/prd-name-polish.md §3.3.5)

- **Operate** for every `/names` screen: the visitor is there to complete a task (sign in, decide on names, manage lists, change settings).
- **Persuade** for `/names/welcome` only, and only within the existing look: it shows a static preview card (זיו) and the sign-in buttons.

## Capabilities and Constraints

Screens: welcome, email sign-in (email, then code), auth callback, onboarding, intro (with the surname step), the swipe deck, lists (שמרתי, התאמות, דו־קרב), hidden names, invite, join, settings, about the data, privacy, terms, offline, goodbye, 404, and the "השירות לא מוגדר" notice. Over the deck and lists open sheets: name detail, filters, background, match, decision, survey, about, report, install, add name. Sheets and dialogs are URL layers (`?sheet=`, `?dialog=`) so Back closes them.

Owner decisions that are constraints (don't reopen; tasks/prd-names-pwa.md §3.1, tasks/prd-name-detail.md §3.1, tasks/prd-name-polish.md §3.1):

- **No due date, anywhere.** Never asked for, never shown.
- **A partner's non-mutual choices are never shown.** Nobody sees another person's skips, lone saves, loves or hides. Together is shown only as a match (two or more members kept or loved the name, `name_matches`); the copy says "שם שנשמר אצל שניים או יותר", never "שניכם".
- **Matches are never green and never get confetti.** Status is never shown by color alone.
- **The deck order, the filters and the matching rules don't change.** The deck is the names that have content, shuffled per user with a seeded order.
- **The swipe card never scrolls** on a 390 × 844 phone, so swipe-up ("אהבתי מאוד") works on every card. Everything else about a name lives in the detail sheet (a bottom sheet at 70% that drags to full height).
- **Decisions in the detail sheet** use the same three buttons as the swipe screen and the same vote path.
- **Solo works fully.** Sharing is by invite link (7 days, single use); members are unlimited.
- **Leaving a shared space** ("יציאה מהבחירה המשותפת", settings) is offered, but its RPC `names_leave` (migration 0011) is not yet on the Nest (EU) backend, so it ends in the error copy (ND-UX-008, the owner's step). Account deletion works.
- **"Common among" (CBS sectors)** is not shown in the sheet; the origin filter covers it.
- **Sign-in is Google or an email code.** No SMS, no phone field. While sign-ups are closed, a new person gets the waitlist message.
- **Names data ships as static files** and is cached for offline use; only votes, matches and invites go to the database.
- Terminology: "שמירה" / "שמרתי", "אהבתי מאוד", "דילוג", "התאמה" / "התאמות", "דו־קרב", "השמות שלי", "פרטי השם", "בחרנו שם", "על הנתונים".

Privacy rules (docs/names-pwa/README.md "Data flow", tasks/prd-names-pwa.md §3.2.18–19):

- The surname and the own background photo stay on the device; they are never uploaded.
- No name, surname, vote, display name or email is ever sent to analytics or logs. Vercel Analytics sees page views only, with query strings stripped (they can hold invite codes).
- Reports and errors go to the `client-log` function with an area, message, path and app version only.
- Sign-out and account deletion clear this user's local data.

Out of scope: the Nest landing page and the rest of this repo; public per-name pages, sharing a name, audio, a second photo per name (tasks/prd-name-detail.md §3.1.10); any new feature, screen, setting, analytics event or backend call during the polish run (tasks/prd-name-polish.md §3.1.4).

## Brand Commitments

From `docs/names-pwa/brand/BRAND.md`, binding:

- The product is **Nest**; the wordmark is always lowercase **nest**, from the brand files, never rebuilt in Heebo. In Hebrew copy the Latin name stays ("ב־Nest"). The logo dot is always clay; the mark is never mirrored.
- **Voice:** a calm, organized friend. Warm, brief, practical, never alarming. Gender-neutral Hebrew (infinitives, nouns, "אפשר…" forms; slashes only in labels). Explicit action labels that say what happens, not "המשך" or "אישור". Short sentences, active voice, no exclamation marks.
- **No medical advice.** Nest organizes; it doesn't diagnose or recommend.
- Imagery is warm, natural light, quiet home interiors and soft fabrics; it never implies Nest is only for women or only for couples.

## Evidence on Hand

- Names data: `data/names/names.json` (19,884 CBS names, births 1949–2024, release 391/2025), `data/names/name-content.json` (1,295 deck names: niqqud, intro, checked Bible verse, known people from Wikidata), `data/names/name-details.json` (stories and similar names). The explanations were written with AI and say so on the about screen.
- Background photos: `public/landing/names-fabric.webp`, `names-notebook.webp`, `names-nursery.webp`.
- Brand: `docs/names-pwa/brand/` (BRAND.md, tokens.json, logos in `svg/` and `png/`). Boards 1–15: `docs/names-pwa/design/screens/*.png` with sources in `docs/names-pwa/design/source/*.dc.html`.
- Legal texts: `src/content/names-legal/` (draft, pending legal review). Their wording is not changed by design work.
- There are no testimonials, user counts, press or ratings. Don't invent any.

## Product Principles

1. **Choosing a name is calm.** Nothing pressures, celebrates loudly or alarms; matches are warm, not fireworks.
2. **Privacy between people is absolute.** What one person skips, or keeps alone, is theirs.
3. **Solo is a whole experience,** and sharing is an invitation, never a requirement.
4. **Real data, honestly sourced.** Numbers come from CBS with attribution; content is labelled for what it is; nothing is made up.
5. **The card is for deciding, the sheet is for reading.** The card stays short so every gesture works; depth lives one tap away.

## Accessibility & Inclusion

- WCAG 2.2 AA: text contrast ≥ 4.5:1 on canvas, glass and every background photo; touch targets ≥ 44 × 44 px; visible focus; a Hebrew `aria-label` on every icon-only control; dialogs and sheets are modal with focus trapped and returned.
- Status is never told by color alone; a word and an icon go with it.
- `prefers-reduced-motion` turns flings into short fades; `prefers-reduced-transparency` and browsers without `backdrop-filter` get solid white cards.
- Gender-neutral Hebrew throughout; any family shape is welcome.
