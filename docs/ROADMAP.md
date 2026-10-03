# קן — Roadmap

Decisions (Oct 2026): Vercel built-in monitoring (no Sentry) · AI document reading OK (opt-in) ·
weekly summary = push only · reminders 20:00 day-before / 08:00 tasks / Sat 20:00 summary ·
calendar feed shows generic titles by default (toggle in settings).

| # | Milestone | Status |
|---|-----------|--------|
| M0 | Error tracking: Vercel Analytics + Speed Insights, scrubbed client errors → `/api/log` → Vercel Runtime Logs, error boundaries, sync/upload/sw hooks | ✅ |
| M1 | Schema `0002`: prep_items, birth_plans, contacts, journal_entries (private/hidden), suggestion_states, notification_prefs, push_subscriptions, notification_log, `media` bucket; generic media upload queue | ✅ |
| M2 | Screens: Calendar (month + agenda, pregnancy-week rows, category filters) · Baby prep (starter list, statuses, compare groups, photos, budget) · Birth planning (hospital, caregiver, contacts, bag, pinned docs, preferences, route, final checklist, printable page) · Journal (timeline, photos, private/hidden entries, milestones, printable book) | ✅ |
| M3 | Smart checklist: week-based rules → "הצעות לשבוע" card on Home (add / dismiss) | ⏳ |
| M4 | Calendar feed (ICS) per space with revocable token, generic titles by default | ⏳ |
| M5 | Push reminders: VAPID, SW push handlers, Supabase Edge Function + pg_cron, dedupe via notification_log, per-user prefs | ⏳ |
| M6 | Weekly summary (Sat 20:00) push + in-app card | ⏳ |
| M7 | AI reading of uploaded documents (Claude API, opt-in), suggestions stored in documents.ai_suggestion | ⏳ |
| M8 | Tests (week math, rules, sync, reminders) + device pass + release | ⏳ |

## Error tracking — where to look
Vercel → project `ken` → Logs, filter `[client-error]`. Each line: area (`render`, `sync`, `upload`, `sw`, `query`…),
route with IDs replaced, build id, online/standalone flags. No user-entered text is sent.
Enable Analytics + Speed Insights once in Vercel → project → Analytics / Speed Insights.
