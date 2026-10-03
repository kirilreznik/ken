# קן — Roadmap

Decisions (Oct 2026): Vercel built-in monitoring (no Sentry) · AI document reading OK (opt-in) ·
weekly summary = push only · reminders 20:00 day-before / 08:00 tasks / Sat 20:00 summary ·
calendar feed shows generic titles by default (toggle in settings).

| # | Milestone | Status |
|---|-----------|--------|
| M0 | Error tracking: Vercel Analytics + Speed Insights, scrubbed client errors → `/api/log` → Vercel Runtime Logs, error boundaries, sync/upload/sw hooks | ✅ |
| M1 | Schema `0002`: prep_items, birth_plans, contacts, journal_entries (private/hidden), suggestion_states, notification_prefs, push_subscriptions, notification_log, `media` bucket; generic media upload queue | ✅ |
| M2 | Screens: Calendar (month + agenda, pregnancy-week rows, category filters) · Baby prep (starter list, statuses, compare groups, photos, budget) · Birth planning (hospital, caregiver, contacts, bag, pinned docs, preferences, route, final checklist, printable page) · Journal (timeline, photos, private/hidden entries, milestones, printable book) | ✅ |
| M3 | Smart checklist: week-based rules + test-booking nudges → "הצעות לשבוע" card on Home (add as task / dismiss), `src/lib/suggestions.ts` | ✅ |
| M4 | Calendar feed: `/api/calendar/<token>.ics` via `calendar_feed()` RPC (no service key), revocable token, generic titles by default — Settings → סנכרון ליומן | ✅ |
| M5 | Push reminders: VAPID (private key in Vault), SW push/click handlers, `notify` Edge Function every 15 min (pg_cron + pg_net), dedupe via notification_log, per-user prefs — Settings → התראות | ✅ |
| M6 | Weekly summary: Saturday 20:00 push + "השבוע הקרוב" card on Home (Sat–Mon), `src/lib/summary.ts` shared by both | ✅ |
| M7 | AI reading (opt-in per space): `read-document` Edge Function → Claude, suggestions in documents.ai_suggestion, review/apply in the document drawer. **Needs `ANTHROPIC_API_KEY` secret** | ✅ code · 🔑 key |
| M8 | Unit tests (`npm test`: week math, rules, summary, ICS) ✅ · device pass on iPhone + Android ⏳ · release ⏳ | 🟡 |

## Error tracking — where to look
Vercel → project `ken` → Logs, filter `[client-error]`. Each line: area (`render`, `sync`, `upload`, `sw`, `query`…),
route with IDs replaced, build id, online/standalone flags. No user-entered text is sent.
Enable Analytics + Speed Insights once in Vercel → project → Analytics / Speed Insights.

## Reminders — how it works
- `pg_cron` job `ken-notify` calls the `notify` Edge Function every 15 minutes with a secret from Vault.
- The function works per user in their timezone (default Asia/Jerusalem): 20:00–23:00 → tomorrow's appointments;
  08:00–11:00 → today's/overdue tasks (yours or unassigned) and test windows closing within a week;
  Saturday 20:00 → weekly summary (includes suggestions). Each message is sent once (notification_log).
- iPhone: push works only when Ken is installed to the home screen (iOS 16.4+).
- Rebuild the function after changing shared rules: `npm run build:functions`, then redeploy `supabase/functions/notify/dist/index.js`.

## AI document reading — setup
1. Supabase → Edge Functions → Secrets: add `ANTHROPIC_API_KEY` (optional `ANTHROPIC_MODEL`, default `claude-sonnet-5-5`).
2. In the app: Settings → קריאה אוטומטית של מסמכים → on. New PDF/image uploads are read automatically;
   older ones have a "קריאת המסמך" button in the document drawer. Nothing changes without the couple's approval.

## Calendar feed
Settings → סנכרון ליומן → create link → "Apple" (webcal) or "Google". Anyone with the link can see the schedule;
"קישור חדש" rotates it, "ביטול הסנכרון" removes it.

## M9 · Onboarding + follow-up plan import ✅
- Onboarding: name + role (pregnant / partner — wording only, both are equal editors) + due date or LMP → `/welcome`:
  1) follow-up plan (photo/PDF → `analyze-plan` Edge Function, or the standard Israeli plan) → review & edit → appointments;
  2) invite partner (share code). Either partner can be the one who sets things up.
- Mid-pregnancy: Tests → "ייבוא תוכנית מעקב" (or More → תוכנית המעקב). Smart matching updates existing tests
  (window, book-by week, notes) instead of duplicating; finished tests are left alone; past windows are listed unselected.
- New: `appointments.book_by_week / source / plan_document_id`, `space_members.role`, document category `plan`, table `plan_imports`
  (resumable — closing the app during analysis is fine). Suggestions use `book_by_week` for "לקבוע תור" nudges.
- Needs `ANTHROPIC_API_KEY` for document analysis; without it the standard plan still works.
- TODO: rebuild + redeploy `notify` (`npm run build:functions`) so weekly-summary suggestion counts use book_by_week too.

## M10 · Shopping: share → AI triage → list / price comparison ✅
- Share a link, text or screenshot into Ken:
  - iPhone: a Shortcut in the share sheet (Settings → שיתוף מוצרים לקן: personal token + steps) → `triage-product` Edge Function.
  - Android: installed PWA is a share target (`/share-target` → service worker → `/share`).
  - Anywhere: הכנות לתינוק → "הוספה מקישור" (`/share`, paste / screenshot).
- `triage-product` reads the page (OG / JSON-LD price, image) + Claude decides:
  same product (any colour/version) → extra store in `prep_offers`; empty placeholder (e.g. "עגלה") → filled; otherwise new item
  (grouped with a similar product for comparison). Item price = cheapest ₪ offer. Auto-applied, with undo in the "נכנסו מהשיתוף" strip.
- Item sheet shows "איפה לקנות": stores cheapest first, add/remove manually.
- Tables: `prep_offers`, `prep_inbox`, `capture_tokens`; `prep_items.brand/model/source`.
