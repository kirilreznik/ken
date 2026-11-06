# Name swiper analytics

What the swiper measures, where it goes, and how to read it. Decided with Kiril on 2026-11-06
(product review §3): own anonymous events table in the EU Supabase, SQL views for the metrics,
Microsoft Clarity recordings during the beta. BigQuery comes later, as a scheduled copy.

## How it works

- **Events.** `track("event", props)` in `src/lib/names/track.ts` queues an event and sends
  batches to the `names_track` RPC every few seconds and when the page is hidden. Events go to
  `analytics.names_events` in project `hkoumskvmkqqnwhnizbq` (migration
  `0010_names_analytics.sql` in kirilreznik/pregnancy-manager).
- **No personal data.** The server adds the user and space as pseudonymous keys (a salted hash),
  never the raw ids. Props are numbers, booleans or short ASCII tokens; Hebrew text (a name) is
  dropped on the client and again by the database. Paths lose the invite code.
- **Deleting an account** deletes its events (a trigger on `auth.users`) and leaves one
  anonymous `account_deleted` row so deletions can be counted.
- **Clarity** loads only when `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set, and never starts on an
  invite link, the sign-in callback or a URL with an invite code. The whole `/names` app is
  `data-clarity-mask`, so every text and image (names, display names, emails, own photos) is a
  block in recordings; the action buttons, sex chips and header opt back in with
  `data-clarity-unmask`. Clarity never records `aria-label`/`title`. Each tracked event is also
  sent to Clarity as a custom event, so recordings can be filtered by `vote`, `match_shown` and so on.
- **Vercel Analytics** keeps getting page URLs only; `?source=` and `?tab=` now survive the
  scrubber (`src/lib/names/analytics.ts`), every other parameter is still dropped.
- Set `NEXT_PUBLIC_NAMES_ANALYTICS=off` to stop sending events (e.g. a local test run). Local
  `npm run dev` builds send `app_version = dev`, which the views leave out.

## Adding a metric

1. Add the event with a one-line description to `NAMES_EVENTS` in `src/lib/names/track.ts`.
2. Call `track("my_event", { some_prop: 3 })` where it happens. That's it: it shows up in
   `analytics.names_events_daily` the next day, and you can query its props right away.

## Events

| Event | When | Props |
| --- | --- | --- |
| `app_open` | full page load of /names | `source` (pwa, direct…), `display` (standalone/browser), `signed_in` |
| `page_view` | each screen shown | `screen` |
| `signin_started` / `signin_code_sent` / `signin_failed` / `signin_completed` | sign-in steps | `method`, `step`, `resend`, `new_user` |
| `onboarding_completed` | onboarding saved | `opt_in`, `joining` |
| `first_vote` | first decision in a space | |
| `vote` | every decision | `vote`, `method` (swipe/button/key), `shared`, `position` |
| `vote_undone` | ביטול | |
| `deck_exhausted` | no names left | `votes` |
| `filter_empty` | filters left nothing | `sex` and which sheet filters are on |
| `filter_sex` / `filters_reset` | quick chips, reset | `sex` |
| `session_end` | page hidden (running totals per session; 30 min away starts a new session) | `votes`, `saves`, `duration_s` |
| `invite_shared` | share sheet or copy | `method` |
| `join_completed` / `join_failed` | invite link | `votes_moved` / `reason` |
| `match_shown` / `match_cta` | match sheet | `kept_by`, `loved_by` / `action` (list, continue, close) |
| `lists_tab` | a tab of השמות שלי | `tab` |
| `duel_started` / `duel_completed` | duel | `from`, `size`, `picks` |
| `custom_name_added`, `report_sent`, `about_opened` | | `in_data` |
| `background_changed` | | `background` |
| `install_prompt` | install offer used | `mode`, `outcome` |
| `opt_in_changed`, `display_name_changed`, `signed_out` | settings | `opt_in` |
| `account_deleted` | written by the database | |
| `invite_prompt` | "choose together" prompt after the 5th save, or the solo matches tab | `placement` (fifth_save, matches_tab), `action` (shown, invite, later) |
| `recap_shown` / `recap_cta` | round recap after 30 decisions in a session | `votes`, `saves` / `action` (continue, list) |
| `nest_card_shown` / `nest_card_tap` | the Nest app card (recap, decision, deck end) | `placement`, `opted_in` / `action` (opt_in, learn) |
| `decision_made` / `decision_cleared` | "בחרנו שם" | `from` (duel, saved, matches), `shared`, `custom`, `rank` / `from` |
| `space_left` / `space_leave_failed` | leaving a shared space in settings | `members` / `reason` |
| `survey_prompt` / `survey_submitted` | the beta survey | `action` / closed answers as tokens (`disappointed`, `stage`, `nest_app`), `audience`/`useful` as answered-or-not, `votes`, `sessions` |

Nest card tap rate = `nest_card_tap` (action opt_in) ÷ `nest_card_shown` where `opted_in` is false;
compare it with the onboarding opt-in rate (review §8, kill-assumption 3).

## Beta survey

The survey (Sean Ellis question, two open questions, pregnancy stage, interest in the Nest app)
is offered on the swipe screen from the user's 2nd session once they made 50+ decisions, as a
slim prompt above the card that opens a sheet. Answers go to `analytics.names_survey` through
`names_survey()` (migration `0011_names_leave_survey.sql`, one row per user, open answers capped
at 500 characters, deleted with the account). Read it with `select * from analytics.names_survey_pmf;`
(share of "very disappointed", overall and by stage). Until 0011 is applied the closed answers
still arrive in `survey_submitted` events; the open answers are lost.

## Reading the numbers

Supabase → SQL editor (runs as `postgres`), for example `select * from analytics.names_nsm_weekly;`.
Every view covers names spaces only and leaves out `analytics.internal_users`.

| View | Metric |
| --- | --- |
| `names_nsm_weekly` | **North Star**: weekly progressing spaces (a new match in a shared space, a new save in a solo one) |
| `names_activation_weekly` | activation (20+ votes in the first 24 h) and 7-day return, by sign-up week |
| `names_invites_weekly` | invites made, used, used within 7 days |
| `names_deck_depth` | median / p75 / p90 votes per user, users who reached the end |
| `names_decision_rate` | spaces that finished a duel |
| `names_opt_in` | Nest launch-list opt-in % |
| `names_daily` | voters, votes by kind, custom names, new spaces, joins per day |
| `names_funnel_weekly` | devices: opened → sign-in → onboarding → first vote → 20 votes → invite → join |
| `names_sessions_daily` | sessions, votes and length per session |
| `names_events_daily` | every event per day: count, users, devices, sessions |
| `names_user_stats`, `names_votes`, `names_members`, `names_match_times`, `names_events_clean` | building blocks for your own queries |

## Owner setup

1. **Apply migration 0010** to `hkoumskvmkqqnwhnizbq` (after review). Until then the RPC answers
   404 and the swiper drops events quietly, so merging the ken PR first is safe.
2. **Leave yourself out of the numbers** (the QA users are already in):
   `insert into analytics.internal_users (user_id, note) select id, 'Kiril' from auth.users where email = '<your email>';`
3. **Clarity** (free): sign in at https://clarity.microsoft.com with your Microsoft account →
   New project → name "Nest names", site `https://nestjourney.app` → Settings:
   - Masking: **Balanced** (the app masks itself; pick **Strict** if you'd rather mask everything).
   - Setup → copy the project id (the code after `/tag/` in the snippet, e.g. `abcd1234ef`).
   - Optional: Settings → Setup → turn **cookies** off if you prefer no Clarity cookies
     (returning visitors then look new); then also drop the cookies sentence from the privacy policy.
4. **Vercel** → project `ken` → Environment Variables → add `NEXT_PUBLIC_CLARITY_PROJECT_ID`
   (Production only, so previews aren't recorded) → redeploy.
5. **Privacy policy**: the draft (version `2026-11-06-draft`) now names the events and Microsoft
   Clarity; it goes to the lawyer with the rest (SETUP §12).
