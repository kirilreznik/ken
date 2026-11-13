# BREAK · G1: Entry (welcome, sign-in, callback, onboarding, intro, join, invite, offline, goodbye, 404, unconfigured)

Skill: `break-ui` (`.claude/skills/break-ui/SKILL.md`, `CATALOG.md`). Phases 1, 2, 4 and 5 followed. Phase 3 (the "Demo data / Worst case" toggle) is replaced by a probe outside the app: the worst cases come in through the same boundary as the real data (Supabase responses, stored session metadata, typed input, URL params) via Playwright routes, so nothing is committed to the app (PRD §3.1.4, story criteria). Phase 6 (fix) is not part of an audit. Assumptions: none needed; the skill asks nothing before its report. Skipped: nothing that needs a service. Dark mode isn't supported by `/names`, so it's not checked. Browser zoom 200 % is replaced by Safari's real "Page Zoom" (aA menu) at 150 %, which lays out a 262 px viewport on an iPhone 15 (`zoom150` below); pinch zoom doesn't change layout.

**How:** `shots/break-g1-probe.mjs [webkit|chromium|webkit320|zoom150] [--only …]` (dev server :3000, gitignored), every backend call answered in the probe: OTP send and verify (ok, slow 6 s, 500, 429, network failure), `names_space`, `space_members`, `name_votes` count (0, 1, 1,284), `names_join` (ok, slow, 500, network failure), `names_invite` (ok, slow 8 s, network failure), the auth user PUT (ok, slow, 500). Slow answers are fulfilled after the delay and awaited before the browser closes. Per state it records horizontal overflow and clipped boxes (`report-*.json`). Simulator: `shots/break-g1-sim.mjs` (Safari, signed out on 127.0.0.1:3100; types a long address, sends nothing). Shots: `scripts/ralph/qa/name-polish/shots/audit/BREAK-G1/<state>-<browser>.png`.

## Phase 1: what G1 renders from data

| Field | Source | Limit | Optional? |
|---|---|---|---|
| Email address (field and code-step lead `<bdi>`) | typed | none in the app; RFC 254 | No |
| Display name (onboarding field) | `user_metadata.display_name`, else the first word of Google's `full_name` | `DISPLAY_NAME_MAX` 40 (`src/lib/names/onboarding.ts:3`), `maxLength` on the field; server cap unknown from this repo | No |
| Member names (invite "מי כבר כאן") | `space_members.display_name` via `memberLabel()` (`src/lib/names/invite.ts:30`), "בלי שם" when blank, "(אני)" appended | each member's own client caps it at 40 | Yes |
| Surname (intro field) | typed, device pref | `SURNAME_MAX` 30 (`src/components/names/Intro.tsx:12`) | Yes |
| Invite link and expiry | `names_invite` code (8 chars) + `inviteUrl()`; `expires_at` via `Intl.DateTimeFormat("he-IL")` | fixed | No |
| Join code (URL) | `/names/join/[code]`, `normalizeJoinCode()` `^[A-Za-z0-9_-]{4,64}$` | 64 | No |
| Votes moved on join | `savedCount()` > 0 → `VOTES_MOVE_TEXT` (no number shown) | — | Yes |
| Callback error, 404 path | URL | not rendered (fixed Hebrew copy) | — |
| Async states | OTP send/verify, onboarding save + `ensureSpace`, join, invite | — | — |

## Findings

### BREAK-G1-01: A failed sign-in request shows nothing when the phone thinks it's online

- **Screen and state:** `/names/sign-in/email`, "שליחת קוד" and the code step's "כניסה", when the request fails at the network level (no response: flaky mobile data, captive portal, DNS, Supabase unreachable) while `navigator.onLine` is still true
- **Browser:** webkit-iphone · chromium-pixel (both sampled every 500 ms for 12 s: no `role=alert`, no text, the button back to idle; one request sent)
- **What's wrong:** the error is classified as `offline` (`authErrorKind`, `AuthRetryableFetchError` status 0) and set to `OFFLINE_MESSAGE`, which `EmailSignIn` hides on purpose because `ConnectionNote` says it "while offline" (`src/components/names/EmailSignIn.tsx:137-138`). But `ConnectionNote` only shows when `useOnline()` is false, so in this case nobody says it: the tap does nothing visible, on both the send and the verify step. Onboarding handles the same case (it shows `OFFLINE_SAVE_MESSAGE`), so this is only the email screen.
- **Rule it breaks:** `break-ui` · `CATALOG.md` States · "Error from the API | No error state"; `SKILL.md` Failure severity "Broken (… action unreachable, wrong data shown)"
- **Severity:** P1
- **Effort:** XS
- **Proposed change:** in `EmailSignIn.tsx`, hide `OFFLINE_MESSAGE` only while `useOnline()` is false (the hook `ConnectionNote` uses), so a network failure while "online" shows the line in the error slot; keep the hide-while-offline rule so it isn't said twice. A unit test for the case (error `OFFLINE_MESSAGE`, online true → alert shown).
- **Guardrail:** polish (a missing error state of an existing flow, §3.1.4; existing copy)
- **Screenshot:** `audit/BREAK-G1/signin-send-abort-webkit.png`, `audit/BREAK-G1/signin-verify-abort-webkit.png` (compare `signin-send-500-webkit.png`, which shows the line)

### BREAK-G1-02: A long email address runs off the screen in the code-step lead

- **Screen and state:** `/names/sign-in/email` code step (and wrong code, verify errors), the lead "שלחנו קוד בן 6 ספרות ל־{email}"
- **Browser:** webkit-iphone (393: `first.last+billing-notifications@sub.department.region.example.co.uk` runs past the glass panel and starts 4 px off the screen), webkit320 (77 px off the screen), zoom150 (`bartholomew.fitzgerald@northwind-industries-holdings.example.com` 35 px off, the plus address 135 px off), so the start of the address can't be read. Same engine as Safari.
- **What's wrong:** the `<bdi dir="ltr">` can only break at "-" and ".", so a segment with no hyphen that's wider than the line ("first.last+billing-notifications@sub.department.region.example.co.uk" after its last hyphen) overflows towards the start side, over the panel's edge and off the screen. At 393 the common long address only wraps at its hyphen (filed as IMP-C-G1-16, P3); this is the case where it doesn't fit at all.
- **Rule it breaks:** `break-ui` · `SKILL.md` Failure signatures · "Email or URL runs past the edge | No break opportunities in the string | `overflow-wrap: anywhere` on that element"
- **Severity:** P2
- **Effort:** XS
- **Proposed change:** `wrap-anywhere` (Tailwind 4 `overflow-wrap: anywhere`) on the `<bdi>` in `EmailSignIn.tsx:192`. Merge with IMP-C-G1-16 in triage: its "whitespace-nowrap" option would make this break worse, so the merged item should be "address on its own line, `wrap-anywhere`" (break only when it can't fit).
- **Guardrail:** polish
- **Screenshot:** `audit/BREAK-G1/signin-code-plus-webkit.png`, `…/signin-code-plus-webkit320.png`, `…/signin-code-long-zoom150.png`

### BREAK-G1-03: The invite link field hides the code, the only part that differs

- **Screen and state:** `/names/invite`, link ready
- **Browser:** webkit320 (shows `…/names/join/K7M2Q`, the code cut), zoom150 (`http://localhost:3000/names/jo`, no code at all); the production URL `https://nestjourney.app/names/join/XXXXXXXX` is 6 characters longer than the dev one shot here, so it cuts sooner, near the edge even at 393
- **What's wrong:** the read-only `<input dir="ltr">` shows the start of the URL and clips the end, so the visible part is the same for every invite and the code isn't readable without scrolling inside the field. Sharing and copying still work (buttons below), so it's not broken; the field just doesn't show what it's there to show.
- **Rule it breaks:** `break-ui` · `CATALOG.md` Emails, URLs · "Long URL; overflow, and end-truncation hides the part that differs"; `SKILL.md` "Truncate in the middle when items differ at the end"
- **Severity:** P3
- **Effort:** S
- **Proposed change:** in `InviteScreen.tsx:162-172`, let the link wrap instead of clipping: a read-only text block (same `bg-sand` well, `text-caption`, `dir="ltr"`, `wrap-anywhere`, `select-all`) keeping `aria-label` and `aria-describedby`, or keep the input and scroll it to its end on mount (`el.scrollLeft = el.scrollWidth`). Recommendation: the wrapping block; the copy fallback text ("אפשר לסמן את הקישור ולהעתיק אותו") still works with `select-all`. Update the invite test that finds the field by label.
- **Guardrail:** polish
- **Screenshot:** `audit/BREAK-G1/invite-members-long-webkit320.png`, `audit/BREAK-G1/invite-members-long-zoom150.png`

## Decisions for the owner

None. (The server's cap on `space_members.display_name` can't be read from this repo; the invite list wraps any length with `break-words`, so an uncapped name grows the row but breaks nothing. Not filed.)

## What held up (checked, no finding)

- **Long, short, blank and emoji display names** on the invite list: a 38-char Hebrew name with maqaf and "(אני)" wraps to two lines; a 38-char name with no spaces (`bartholomew.fitzgerald.northwind.co.il`) fits at 393 and wraps at 320 (`break-words`); "י"; `👩🏽‍💻 נועה` renders whole; blank → "בלי שם". webkit, chromium, 320, zoom150.
- **Onboarding display name:** 38-char Hebrew and unbreakable names prefill and scroll inside the field (no overflow) at every width; Google `full_name` "Aleksandra Wiśniewska-Kowalczyk" → "Aleksandra". The 40 `maxLength` cuts a ZWJ emoji typed at the limit to its first code points (👩🏽 instead of 👩🏽‍💻), never a broken glyph. Save slow → "שומרים…" disabled; save 500 and `names_space` failure → "משהו השתבש. אפשר לנסות שוב." with the button back.
- **Intro surname:** 28-char Hebrew (`בן־שושן־אבוטבול־רוזנבלום־כהן`) and 30-char Latin (`Oberhauser-Wettstein-Kowalczyk`) fit the field at 393 and 320 and scroll inside it at zoom150; a 34-char paste stops at 30 (`maxLength` enforced).
- **Email field:** a 64-char address scrolls inside the field (webkit, chromium, Simulator Safari, caret at the end).
- **Sign-in errors with a response:** send 500 → generic line; 429 → rate-limit line (wraps to two lines, fine); verify 500 → generic line; slow send → "שולחים…", `disabled`, `aria-busy`; slow verify keeps the code and shows the wrong-code line when it answers.
- **Join:** a 62-char code with a valid shape shows the invitation; a code with spaces/Hebrew → "הקישור כבר לא בתוקף." with "לכניסה"; slow → spinner line; 500 and network failure → "ההצטרפות לא הצליחה." + "ניסיון חוזר"; saved 0 → no votes line; 1 and 1,284 → the same "השמות ששמרת עוברים איתך." (no number to pluralise or format).
- **Invite:** slow → the sand skeleton; network failure → "לא הצלחנו ליצור קישור." + "ניסיון חוזר" (members list still shows).
- **Welcome with every param** (`?closed=1&expired=1&join=…`): both notices and the join pitch stack without overflow (full page).
- **Callback error with a long `error_description`, 404 with a 200-char path:** neither renders URL data; fixed copy only.
- **Horizontal overflow:** `scrollWidth == clientWidth` on every state in webkit, chromium, 320 and 262 px; the only overflowing element in the whole run is BREAK-G1-02's `<bdi>`.

Not re-filed (other lenses have them): callback/join waiting forever when the network hangs (IMP-A-G1-06), the address's hyphen break at 393 (IMP-C-G1-16, merged into -02 above), input font under 16 px (IMP-A-G1-02), the 320 px intro lead under the first card (baseline note, IMP-A-G1).
