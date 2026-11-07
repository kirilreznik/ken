# Mobile Safari in the iOS Simulator (name detail run)

Helper: `sim.mjs` (this folder). Measured on this Mac on 2026-11-06 (US-002).

## Device

- **iPhone 17 Pro**, iOS 26.5, UDID `8FD8821E-B33E-4AA4-8752-A7C725E57069` (already booted;
  `boot()` boots it only when nothing is booted).
- Screen 402 × 874 pt; `xcrun simctl io booted screenshot` gives 1206 × 2622 px (3×).
  **Device point = screenshot pixel / 3.** All `sim.mjs` coordinates are device points.
- Safari uses the iOS 26 compact tab bar at the bottom (back, address, reload, `…`).

## Points → Mac screen

The device screen is `group 1 of window 1` of the Simulator process:

```sh
osascript -e 'tell application "System Events" to tell process "Simulator" to get {position, size} of group 1 of window 1'
# → 43, 137, 341, 742   (window at 20,60, size 388x835)
```

So `scale = 341 / 402 = 0.848` and `mac = (43 + x·0.848, 137 + y·0.848)`. `sim.mjs` reads the rect
before every gesture, so a moved window still maps right. `node sim.mjs geometry` prints it.
Activate the Simulator before clicking (the helper does); if another window covers it, the
clicks land there.

## Page → device points

Mobile Safari's page viewport here is **402 × 714 CSS px** and starts **63 pt** below the top of
the screen (status bar), while the page isn't scrolled. Measured with `calib.html`
(`node sim.mjs serve-calib` then `open http://localhost:3199/`): a tap at device (201, 234)
reported `clientX/Y 201, 171`.

To find an element: run its `getBoundingClientRect()` in Playwright WebKit with the
same user, **resized to 402 × 714** (the stock `devices['iPhone 15']` viewport is 393 × 659, so
its rects are off), and add 63 to y. `locate()` does exactly that:

```sh
node sim.mjs locate /names/welcome "button:has-text('קוד במייל')" 0   # 0 = signed out
# → {"x":201,"y":744,...}   then: node sim.mjs tap 201 744
```

After the page scrolls, or with the keyboard open, re-measure (take a screenshot, divide by 3).

## Gestures

- **Tap:** `cliclick dd:X,Y w:60 du:X,Y`. The one-shot `c:` was unreliable in earlier runs.
- **Drag:** `cliclick dd:… w:50 dm:… w:… (12+ times) du:…`. Use `dm:` (drag-move); `m:` is a plain
  mouse move and never reaches Safari as a touch move. The 50 ms hold after `dd:` plus ~30–40 ms
  between moves (500 ms total for 200 pt) makes Safari see a pan, not a tap.
  Measured with `calib.html`: a 200 pt drag on a horizontal `overflow-x: auto` strip scrolled it
  **189 px** (≈ 10 px touch slop), and on a `touch-action: none` box the page got
  `pointerType: "touch"`, **18 pointermoves, dx 199** (shots `us002-calib-*.png`).
- **Type:** `cliclick t:text` types into the focused field (ASCII; the hardware keyboard is on,
  so only the keyboard accessory bar shows). For secrets, import `type()` and pass a variable
  read from `.env.test.local`; never put them on a command line or in a screenshot.
- **Close the keyboard bar:** tap its ✓ at (360, 840).
- **Back:** `back()` taps the toolbar back button at (57, 815). The keyboard bar hides the
  toolbar, so close it first. The left-edge back swipe (`back({ swipe: true })`) did **not**
  navigate in two tries (250–400 ms, from x = 0.5); don't rely on it.

## Self-test (US-002)

1. `open http://localhost:3000/names/welcome` → welcome board (`us002-sim-welcome.png`).
2. `tap 201 744` (email button) → email-code screen, field focused (`us002-sim-email.png`).
3. `type abc` → shows in the field (`us002-sim-typed.png`, never sent).
4. ✓, then `back` → welcome again (`us002-sim-back3.png`).
5. Drag on `calib.html` as above (`us002-calib-tap.png`, `us002-calib-drag.png`).

## Traps (from the pregnancy-manager runs and this one)

- **Stuck "Open in …?" dialog:** a second `openurl` with a custom scheme while an app is in the
  foreground can show a system confirmation that no tap or key closes. Only fix: reboot the
  device: `xcrun simctl shutdown booted && xcrun simctl boot "iPhone 17 Pro" && open -a Simulator`
  (about 15–20 s), then retry. `http://localhost` URLs open straight in Safari without it.
- A miss looks like "nothing happened". Before blaming the app, re-read the geometry and the
  screenshot, and try a few points around the target.
- A tap right after a scroll only stops the momentum; wait ~1 s first.
- The dev server's Next.js "N" badge sits bottom-left at about (26, 765) on :3000; avoid it or
  use the production build on :3100.
- `screencapture` of the Mac screen isn't permitted here; use `screenshot()` only.
- Drags through cliclick reach the page only after the touch-down hold; real fingers can be
  faster. A gesture bug seen only in the Simulator needs a second look in Playwright before
  it's filed.

## Sign in QA user 1 through the email-code UI (US-003, worked first try, 1 email)

Run from a small script in this folder (never pass the email or code on a command line):

```js
import { tap, type, screenshot } from "./sim.mjs";
import { qaEmail } from "../names-pwa/env.mjs";
import { emailCode } from "../names-pwa/rest.mjs";
// 1. node sim.mjs open http://localhost:3000/names   → welcome (signed out)
await tap(201, 744);            // "כניסה עם קוד במייל"; the email field autofocuses
await type(qaEmail(1));
await tap(201, 495);            // "שליחת קוד"  (sends the one real email)
// wait ~3 s for "מה הקוד?"
const code = await emailCode(qaEmail(1));   // fresh code via admin generate_link, no email
await tap(201, 445);            // code field
await type(code);               // auto-submits at 6 digits
```

- User 1 is already onboarded (`terms_accepted_at` set), so it lands on the once-per-device intro;
  "התחלת בחירה" is at (240, 733) (avoid the dev "N" badge at x ≈ 37). Then `/names`.
- The session is per origin: `localhost:3000` and `localhost:3100` each need their own sign-in.
- Delete any helper script holding these steps after use, or keep it under `shots/` (gitignored).

## Background sheet (Simulator)

On `/names` (not scrolled): background button (161, 100) → "ללא רקע" (326, 391), "בדים" (201, 391);
the sheet's ✕ is (42, 288). Choosing doesn't close the sheet.

## screenshot() and folders

`screenshot("baseline/x")` drops the folder (it uses the basename); move the file afterwards.

## Offline in Simulator Safari (US-068)

The Simulator shares the Mac's network and has no offline switch. To test the service worker, stop
the production server (`pkill -f "next start -p 3100"`); Safari's requests to localhost:3100 then
fail and the worker serves pages and data from its cache. Supabase stays reachable, so the vote
outbox can't be checked this way; check queue-and-flush in Playwright (`context.setOffline`).
Restart with `nohup npx next start -p 3100 > /tmp/names-3100.log 2>&1 &`.

- Safari on :3100 is signed in as QA user 1 (since US-068, `shots/us068-sim-signin.mjs`, 1 email).
- `node sim.mjs open "http://localhost:3100/names?sheet=name&n=<name>"` opens a sheet straight from a link.
