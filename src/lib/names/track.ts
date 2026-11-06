/**
 * Product analytics for the name swiper. Events go to the anonymous `analytics.names_events`
 * table through the `names_track` RPC (migration 0010 in kirilreznik/pregnancy-manager); the
 * server adds pseudonymous user and space keys from the session, so nothing here sends a user
 * id, email, display name or baby name.
 *
 * Adding a metric:
 *   1. add the event and a one-line description to NAMES_EVENTS below;
 *   2. call `track("my_event", { some_prop: 3 })` where it happens.
 *
 * Props are numbers, booleans, null or short ASCII tokens ("keep", "swipe", "pwa"). Anything
 * else is dropped here and again on the server, so a name typed by the user can never be sent.
 */

import { APP_VERSION } from "./clientLog";

/** Every event the swiper sends, with what it means. Keep it sorted by flow. */
export const NAMES_EVENTS = {
  app_open: "A full page load of /names. {source: 'pwa' | 'direct' | …, display: 'standalone' | 'browser', signed_in}",
  page_view: "A screen was shown (also on in-app navigation). {screen}",
  signin_started: "A sign-in button was used. {method: 'google' | 'email'}",
  signin_code_sent: "The email code was sent. {resend}",
  signin_failed: "Sign-in failed. {method, step: 'send' | 'verify' | 'oauth' | 'callback'}",
  signin_completed: "Signed in. {method, new_user}",
  onboarding_completed: "Onboarding was saved. {opt_in, joining}",
  first_vote: "The first decision in a space.",
  vote: "A decision on a card. {vote: 'keep' | 'love' | 'skip' | 'hidden', method: 'swipe' | 'button' | 'key', shared, position}",
  vote_undone: "ביטול took back a decision.",
  deck_exhausted: "The deck ran out of names. {votes}",
  filter_empty: "The filters left no names. {sex, sheet_filters}",
  filter_sex: "The filter menu was applied with a different sex filter. {sex: 'boy' | 'girl' | 'unisex' | 'all'}",
  filters_reset: "The filters were reset from the empty deck.",
  session_end: "The page was hidden; running totals for the session. {votes, saves, duration_s}",
  invite_shared: "The invite link was shared or copied. {method: 'share' | 'copy'}",
  join_completed: "Joined a shared space from an invite link.",
  join_failed: "An invite link didn't work. {reason}",
  match_shown: "The match sheet opened. {kept_by, loved_by}",
  match_cta: "A way out of the match sheet. {action: 'list' | 'continue' | 'close'}",
  lists_tab: "A tab of השמות שלי was shown. {tab}",
  duel_started: "A duel began. {from, size}",
  duel_completed: "A duel reached its winner. {from, size}",
  custom_name_added: "A name was added by hand.",
  report_sent: "A mistake in a name was reported.",
  about_opened: "The about sheet of a name opened.",
  background_changed: "The background was changed. {background}",
  install_prompt: "The install offer was used. {mode, outcome}",
  opt_in_changed: "The launch-updates switch changed in settings. {opt_in}",
  display_name_changed: "The display name was changed in settings.",
  signed_out: "Signed out from settings.",
  // account_deleted is written by the database when an account goes (its own events go with it).
} as const;

export type NamesEvent = keyof typeof NAMES_EVENTS;
export type TrackValue = string | number | boolean | null;
export type TrackProps = Record<string, TrackValue | undefined>;

interface Pending {
  event: NamesEvent;
  props: Record<string, TrackValue>;
  device_id: string;
  session_id: string;
  path: string | null;
  app_version: string;
  client_at: string;
  /** The access token when the event happened, so it is counted for the right user. */
  token: string | null;
}

const KEY = /^[a-z][a-z0-9_]{0,31}$/;
const TOKEN_VALUE = /^[A-Za-z0-9_.:/-]{0,64}$/;
const PATH_SEGMENT = /^[A-Za-z0-9_-]+$/;
const DEVICE_KEY = "nest-names-device";
const SESSION_KEY = "nest-names-session";
/** A session ends after 30 minutes away. */
export const SESSION_IDLE_MS = 30 * 60 * 1000;
const BATCH = 50;
const MAX_QUEUE = 500;
const FLUSH_MS = 4000;

/** Keeps only the props the server would keep (same rules as analytics.clean_props). */
export function cleanProps(props: TrackProps | undefined): Record<string, TrackValue> {
  const out: Record<string, TrackValue> = {};
  if (!props) return out;
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || !KEY.test(key)) continue;
    if (value === null || typeof value === "boolean") out[key] = value;
    else if (typeof value === "number") {
      if (Number.isFinite(value)) out[key] = value;
    } else if (typeof value === "string" && TOKEN_VALUE.test(value)) out[key] = value;
    if (Object.keys(out).length >= 24) break;
  }
  return out;
}

/**
 * The path sent with an event: /names paths only, without the invite code of /names/join/{code},
 * and without any segment that isn't a plain ASCII token.
 */
export function trackPath(pathname: string): string | null {
  if (pathname !== "/names" && !pathname.startsWith("/names/")) return null;
  const parts = pathname.replace(/^\/names\/join\/.*/, "/names/join").split("/").filter(Boolean);
  if (!parts.every((p) => PATH_SEGMENT.test(p))) return "/names";
  return `/${parts.join("/")}`.slice(0, 200);
}

/** The screen name for page_view: the first segment after /names ("swipe" for /names itself). */
export function screenOf(pathname: string): string {
  const path = trackPath(pathname);
  if (!path) return "other";
  return path.split("/")[2] ?? "swipe";
}

/** How the app was opened: ?source= when it's a short token, else "direct". */
export function sourceOf(search: string): string {
  const source = new URLSearchParams(search).get("source");
  return source && /^[a-z0-9_-]{1,32}$/.test(source) ? source : "direct";
}

function uuid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16),
      );
}

function storage(kind: "local" | "session"): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

/** A random id for this browser, kept in localStorage (a new one if storage is blocked). */
let deviceId: string | null = null;
function device(): string {
  if (deviceId) return deviceId;
  const store = storage("local");
  try {
    deviceId = store?.getItem(DEVICE_KEY) ?? null;
  } catch {
    deviceId = null;
  }
  if (!deviceId || !/^[0-9a-f-]{36}$/.test(deviceId)) {
    deviceId = uuid();
    try {
      store?.setItem(DEVICE_KEY, deviceId);
    } catch {
      // Private mode: the id lives for this page only.
    }
  }
  return deviceId;
}

interface SessionState {
  id: string;
  startedAt: number;
  lastAt: number;
  votes: number;
  saves: number;
}

let session: SessionState | null = null;

function saveSession() {
  try {
    storage("session")?.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage blocked: the session lives in memory.
  }
}

/** The current session, continued across reloads in this tab and renewed after 30 minutes away. */
function currentSession(now: number): SessionState {
  if (!session) {
    try {
      const raw = storage("session")?.getItem(SESSION_KEY);
      const parsed = raw ? (JSON.parse(raw) as SessionState) : null;
      if (parsed && typeof parsed.id === "string" && typeof parsed.lastAt === "number") session = parsed;
    } catch {
      session = null;
    }
  }
  if (!session || now - session.lastAt > SESSION_IDLE_MS) {
    session = { id: uuid(), startedAt: now, lastAt: now, votes: 0, saves: 0 };
  }
  session.lastAt = now;
  return session;
}

let token: string | null = null;
let queue: Pending[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let sending = false;
let listening = false;

/** The signed-in user's access token (null when signed out); AuthProvider keeps it current. */
export function setTrackToken(next: string | null): void {
  token = next;
}

function enabled(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NEXT_PUBLIC_NAMES_ANALYTICS === "off") return false;
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
}

type Clarity = (...args: unknown[]) => void;

/**
 * Records an event. Fire and forget: it is queued and sent in small batches, and never throws.
 */
export function track(event: NamesEvent, props?: TrackProps): void {
  if (!enabled()) return;
  try {
    listen();
    const now = Date.now();
    const s = currentSession(now);
    const clean = cleanProps(props);
    if (event === "vote") {
      s.votes += 1;
      if (clean.vote === "keep" || clean.vote === "love") s.saves += 1;
    }
    saveSession();
    queue.push({
      event,
      props: clean,
      device_id: device(),
      session_id: s.id,
      path: trackPath(window.location.pathname),
      app_version: APP_VERSION,
      client_at: new Date(now).toISOString(),
      token,
    });
    if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE);
    // Clarity custom events let recordings be filtered by what happened ("vote", "match_shown").
    (window as unknown as { clarity?: Clarity }).clarity?.("event", event);
    schedule();
  } catch {
    // Analytics never breaks the app.
  }
}

function schedule() {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    void flush();
  }, FLUSH_MS);
}

async function send(batch: Pending[], keepalive: boolean): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return true;
  const bearer = batch[0]?.token ?? key;
  const events = batch.map((p) => ({
    event: p.event,
    props: p.props,
    device_id: p.device_id,
    session_id: p.session_id,
    path: p.path,
    app_version: p.app_version,
    client_at: p.client_at,
  }));
  try {
    const res = await fetch(`${url}/rest/v1/rpc/names_track`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${bearer}` },
      body: JSON.stringify({ p_events: events }),
      keepalive,
    });
    // An expired token: send these without it rather than lose them.
    if ((res.status === 401 || res.status === 403) && bearer !== key) {
      return send(batch.map((p) => ({ ...p, token: null })), keepalive);
    }
    // Other refusals (4xx) won't get better on retry.
    return res.ok || (res.status >= 400 && res.status < 500);
  } catch {
    return false;
  }
}

/** Takes up to one batch of events that share a token off the queue. */
function takeBatch(): Pending[] {
  const first = queue[0];
  if (!first) return [];
  let n = 0;
  while (n < queue.length && n < BATCH && queue[n].token === first.token) n += 1;
  const batch = queue.slice(0, n);
  queue = queue.slice(n);
  return batch;
}

/** Sends everything queued. With keepalive (the page is hiding) it doesn't wait for answers. */
export async function flush(keepalive = false): Promise<void> {
  if (keepalive) {
    while (queue.length) void send(takeBatch(), true);
    return;
  }
  if (sending) return;
  sending = true;
  try {
    while (queue.length) {
      const batch = takeBatch();
      if (!(await send(batch, false))) {
        // Offline or a server error: put them back and try again later.
        queue = [...batch, ...queue].slice(-MAX_QUEUE);
        break;
      }
    }
  } finally {
    sending = false;
  }
}

function listen() {
  if (listening || typeof document === "undefined") return;
  listening = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      endSession();
      void flush(true);
    }
  });
  window.addEventListener("pagehide", () => void flush(true));
  window.addEventListener("online", () => void flush());
}

/** Queues session_end with the session's running totals. */
function endSession() {
  if (!session) return;
  const now = Date.now();
  queue.push({
    event: "session_end",
    props: { votes: session.votes, saves: session.saves, duration_s: Math.round((now - session.startedAt) / 1000) },
    device_id: device(),
    session_id: session.id,
    path: trackPath(window.location.pathname),
    app_version: APP_VERSION,
    client_at: new Date(now).toISOString(),
    token,
  });
  session.lastAt = now;
  saveSession();
}

/** For tests: forget all module state. */
export function resetTrackForTests(): void {
  token = null;
  queue = [];
  if (timer) clearTimeout(timer);
  timer = null;
  sending = false;
  session = null;
  deviceId = null;
}

/** For tests: what is waiting to be sent. */
export function queuedForTests(): readonly Pending[] {
  return queue;
}
