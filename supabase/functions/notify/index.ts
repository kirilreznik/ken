// קן · notify — push reminders + weekly summary.
// Runs every 15 min (pg_cron → pg_net, authenticated by the x-cron-secret from Vault),
// or on demand by a signed-in user ({ test: true }) to send a test notification.
// Bundled with esbuild (see scripts/build-functions.mjs) so it can reuse src/lib rules.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { parseDay, weekInfo } from "../../../src/lib/pregnancy";
import { buildSuggestions } from "../../../src/lib/suggestions";
import { summaryLine, weekSummary } from "../../../src/lib/summary";
import type { Appointment, PrepItem, Space, SuggestionState, Task } from "../../../src/lib/types";

declare const Deno: { env: { get(k: string): string | undefined }; serve(h: (r: Request) => Response | Promise<Response>): void };

interface Prefs {
  user_id: string; space_id: string; push_enabled: boolean; appointment_reminders: boolean; task_reminders: boolean;
  window_reminders: boolean; suggestion_reminders: boolean; weekly_summary: boolean; timezone: string | null;
}
interface Sub { id: string; user_id: string; endpoint: string; p256dh: string; auth: string; failure_count: number }
interface Msg { kind: string; ref: string; title: string; body: string; url: string }

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

function local(tz: string, d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23", weekday: "short" })
    .formatToParts(d).map((x) => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), weekday: p.weekday as string };
}
const nextDay = (s: string) => { const d = new Date(`${s}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); };
const timeHe = (iso: string, tz: string) => new Intl.DateTimeFormat("he-IL", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const listTitles = (ts: { title: string }[]) => ts.slice(0, 2).map((t) => t.title).join(" · ") + (ts.length > 2 ? ` ועוד ${ts.length - 2}` : "");

async function sendToUser(subs: Sub[], payload: Omit<Msg, "ref" | "kind"> & { tag: string }) {
  let ok = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 6 * 3600 });
      ok++;
      await sb.from("push_subscriptions").update({ last_success_at: new Date().toISOString(), failure_count: 0 }).eq("id", s.id);
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410 || s.failure_count >= 4) await sb.from("push_subscriptions").delete().eq("id", s.id);
      else await sb.from("push_subscriptions").update({ failure_count: s.failure_count + 1 }).eq("id", s.id);
      console.error("[notify] push failed", code ?? String(e));
    }
  }
  return ok;
}

function messagesFor(p: Prefs, space: Space, data: { appts: Appointment[]; tasks: Task[]; prep: PrepItem[]; states: SuggestionState[] }): Msg[] {
  const tz = p.timezone || "Asia/Jerusalem";
  const L = local(tz);
  const week = weekInfo(space.due_date, parseDay(L.day)).week;
  const morning = L.hour >= 8 && L.hour < 11;
  const evening = L.hour >= 20 && L.hour < 23;
  const out: Msg[] = [];

  if (p.appointment_reminders && evening) {
    const tomorrow = nextDay(L.day);
    for (const a of data.appts) {
      if (a.status !== "scheduled" || !a.starts_at || local(tz, new Date(a.starts_at)).day !== tomorrow) continue;
      out.push({ kind: "appt", ref: `${a.id}:${tomorrow}`, title: `מחר: ${a.title}`, body: [timeHe(a.starts_at, tz), a.location, a.provider].filter(Boolean).join(" · "), url: "/tests" });
    }
  }

  if (p.task_reminders && morning) {
    const mine = data.tasks.filter((t) => !t.done && t.due_date && t.due_date <= L.day && (!t.assignee || t.assignee === p.user_id));
    const today = mine.filter((t) => t.due_date === L.day);
    const overdue = mine.filter((t) => t.due_date! < L.day);
    if (mine.length) out.push({
      kind: "tasks", ref: L.day,
      title: today.length ? (today.length === 1 ? "משימה להיום" : `${today.length} משימות להיום`) : `${overdue.length} משימות באיחור`,
      body: listTitles(today.length ? today : overdue) + (today.length && overdue.length ? ` · ועוד ${overdue.length} באיחור` : ""),
      url: "/tasks",
    });
  }

  if (p.window_reminders && morning) {
    for (const a of data.appts) {
      if ((a.status !== "future" && a.status !== "need") || a.window_end_week == null) continue;
      if (week < a.window_end_week - 1 || week > a.window_end_week) continue;
      out.push({ kind: "window", ref: a.id, title: "חלון בדיקה נסגר בקרוב", body: `${a.title} — עד סוף שבוע ${a.window_end_week}, ועדיין לא נקבע תור.`, url: "/tests" });
    }
  }

  const saturdayEvening = L.weekday === "Sat" && evening;
  if (p.weekly_summary && saturdayEvening) {
    const s = weekSummary({ dueDate: space.due_date, today: L.day, dayOf: (iso) => local(tz, new Date(iso)).day,
      appointments: data.appts, tasks: data.tasks, prep: data.prep, states: data.states });
    out.push({ kind: "weekly", ref: s.from, title: `השבוע הקרוב · שבוע ${s.week}`, body: summaryLine(s) + (s.firstSuggestion ? ` — למשל: ${s.firstSuggestion}` : ""), url: "/?summary=1" });
  }

  // Suggestions get their own nudge only when the weekly summary is off (Sunday morning).
  if (p.suggestion_reminders && !p.weekly_summary && L.weekday === "Sun" && morning) {
    const sugg = buildSuggestions({ week, appointments: data.appts, tasks: data.tasks, prep: data.prep, states: data.states });
    if (sugg.length) out.push({ kind: "sugg", ref: `w${week}`, title: `הצעות לשבוע ${week}`, body: listTitles(sugg), url: "/" });
  }
  return out;
}

async function runCron() {
  const { data: prefs } = await sb.from("notification_prefs").select("*").eq("push_enabled", true);
  if (!prefs?.length) return { users: 0, sent: 0 };
  const userIds = prefs.map((p) => p.user_id);
  const spaceIds = [...new Set(prefs.map((p) => p.space_id))];
  const [subs, spaces, appts, tasks, prep, states] = await Promise.all([
    sb.from("push_subscriptions").select("*").in("user_id", userIds),
    sb.from("spaces").select("*").in("id", spaceIds),
    sb.from("appointments").select("*").in("space_id", spaceIds),
    sb.from("tasks").select("*").in("space_id", spaceIds),
    sb.from("prep_items").select("*").in("space_id", spaceIds),
    sb.from("suggestion_states").select("*").in("space_id", spaceIds),
  ]);
  let sent = 0;
  for (const p of prefs as Prefs[]) {
    const space = (spaces.data as Space[] | null)?.find((s) => s.id === p.space_id);
    const mySubs = ((subs.data ?? []) as Sub[]).filter((s) => s.user_id === p.user_id);
    if (!space || !mySubs.length) continue;
    const by = <T extends { space_id: string }>(rows: T[] | null) => (rows ?? []).filter((r) => r.space_id === p.space_id);
    const msgs = messagesFor(p, space, { appts: by(appts.data as Appointment[]), tasks: by(tasks.data as Task[]), prep: by(prep.data as PrepItem[]), states: by(states.data as SuggestionState[]) });
    for (const m of msgs) {
      const { data: fresh } = await sb.from("notification_log").upsert({ user_id: p.user_id, kind: m.kind, ref_key: m.ref }, { onConflict: "user_id,kind,ref_key", ignoreDuplicates: true }).select("id");
      if (!fresh?.length) continue;
      sent += await sendToUser(mySubs, { title: m.title, body: m.body, url: m.url, tag: `${m.kind}:${m.ref}` });
    }
  }
  return { users: prefs.length, sent };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const { data: cfg, error } = await sb.rpc("notify_config");
  if (error || !cfg?.vapid_private) return json({ error: "not configured" }, 500);
  webpush.setVapidDetails(cfg.vapid_subject, cfg.vapid_public, cfg.vapid_private);

  if (cfg.cron_secret && req.headers.get("x-cron-secret") === cfg.cron_secret) {
    try { return json(await runCron()); } catch (e) { console.error("[notify] cron", String(e)); return json({ error: "failed" }, 500); }
  }

  // Test notification for the signed-in user.
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: u } = jwt ? await sb.auth.getUser(jwt) : { data: { user: null } };
  if (!u?.user) return json({ error: "unauthorized" }, 401);
  const { data: subs } = await sb.from("push_subscriptions").select("*").eq("user_id", u.user.id);
  const sent = await sendToUser((subs ?? []) as Sub[], { title: "קן", body: "התראות פועלות. נזכיר לך לפני תורים ומשימות.", url: "/settings", tag: "test" });
  return json({ sent });
});
