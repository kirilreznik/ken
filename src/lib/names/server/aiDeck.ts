import { createHmac } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AI_GUEST_MONTH,
  AI_USER_MONTH,
  DEVICE_HEADER,
  DEVICE_ID_RE,
  LIST_MAX,
  PROMPT_MAX,
  PROMPT_MIN,
  REFINE_MAX,
  cleanPrompt,
  type AiDeckResponse,
  type AiError,
  type AiQuota,
} from "@/lib/names/aiDeck";
import type { Catalog } from "./aiCatalog";
import { readModelOutput, systemText, userText } from "./aiPrompt";
import { bearerToken } from "./deleteAccount";

/** What one model call returns to the handler. */
export interface ModelReply {
  /** The JSON text the model wrote, or null on a refusal. */
  json: string | null;
  refused: boolean;
  usd: number;
  model: string;
}

export type CallModel = (system: string, user: string) => Promise<ModelReply>;

/** Limits, from env with these defaults (AI_DECK in docs/names-pwa/SETUP.md). */
export interface AiLimits {
  /** Searches per calendar month (Israel time) for a signed-in person. */
  userMonth: number;
  /** Searches per month for a guest device before sign-in is asked for. */
  guestMonth: number;
  /** Requests per hashed IP per day, everyone together. */
  ipDay: number;
  /** Guest requests per hashed IP per day (a guest can clear the device id). */
  guestIpDay: number;
  /** Guest requests per day across all guests. */
  guestDay: number;
  /** Total spend per day across everyone, in US dollars. */
  budgetUsd: number;
}

export function readLimits(env: Record<string, string | undefined> = process.env): AiLimits {
  const n = (key: string, fallback: number) => {
    const v = Number(env[key]);
    return env[key] !== undefined && env[key] !== "" && Number.isFinite(v) && v >= 0 ? v : fallback;
  };
  return {
    userMonth: n("NAMES_AI_USER_MONTH", AI_USER_MONTH),
    guestMonth: n("NAMES_AI_GUEST_MONTH", AI_GUEST_MONTH),
    ipDay: n("NAMES_AI_IP_DAY", 20),
    guestIpDay: n("NAMES_AI_GUEST_IP_DAY", 3),
    guestDay: n("NAMES_AI_GUEST_DAY", 200),
    budgetUsd: n("NAMES_AI_DAILY_USD", 20),
  };
}

type Deps = {
  getAdmin: () => SupabaseClient | null;
  getCatalog: () => Catalog;
  callModel: CallModel | null;
  /** NAMES_AI_ENABLED === "true". */
  enabled: () => boolean;
  limits?: () => AiLimits;
  /** Secret for hashing IP addresses (never stored in the clear). */
  ipSalt?: () => string;
  now?: () => number;
};

/** Gap between two requests from one person on one server instance. */
export const BURST_MS = 4000;
/** Largest request body accepted, in bytes. */
export const BODY_MAX = 120_000;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
const fail = (status: number, error: AiError) => json(status, { error });

/** The caller's IP from Vercel's headers ("" when unknown). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "";
}

/** A signed-in person (their user id) or a guest (an HMAC of their device id, 32 hex). */
type Who = { user: string; device: null } | { user: null; device: string };

const hash = (salt: string, text: string) => createHmac("sha256", salt).update(text).digest("hex").slice(0, 32);

/**
 * Who is asking. A bearer token must be a valid session (no falling back to guest); without one,
 * a well-formed device id makes a guest. Neither: sign in.
 */
async function identify(request: Request, admin: SupabaseClient, salt: string): Promise<Who | Response> {
  const token = bearerToken(request.headers.get("authorization"));
  if (token) {
    try {
      const { data, error } = await admin.auth.getUser(token);
      if (error || !data.user) return fail(401, "signin");
      return { user: data.user.id, device: null };
    } catch {
      console.error("names ai deck: token check failed");
      return fail(500, "error");
    }
  }
  const device = request.headers.get(DEVICE_HEADER)?.trim() ?? "";
  if (!DEVICE_ID_RE.test(device)) return fail(401, "signin");
  return { user: null, device: hash(salt, `device:${device}`) };
}

/** This month's searches left for `who`, or null when the count can't be read. */
async function readQuota(admin: SupabaseClient, who: Who, l: AiLimits): Promise<AiQuota | null> {
  try {
    const { data, error } = await admin.rpc("names_ai_used", { p_user: who.user, p_device: who.device });
    if (error || typeof data !== "number") return null;
    const limit = who.user ? l.userMonth : l.guestMonth;
    return { remaining: Math.max(limit - data, 0), limit, guest: !who.user };
  } catch {
    return null;
  }
}

function nameList(raw: unknown): string[] | null {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw) || raw.length > LIST_MAX) return null;
  return raw.filter((x): x is string => typeof x === "string" && x.length > 0 && x.length <= 40);
}

/**
 * POST /api/names/ai-deck. Order of checks: switch, who (a session, or a guest's device id),
 * body, burst, monthly and daily limits and budget (one RPC, which also counts the request),
 * then the model, then the output check. A search that picks no names (or fails on our side)
 * is given back, so the monthly count only holds searches that made a deck; the daily abuse
 * counters keep every call. Nothing the person wrote is logged or stored; errors log a code only.
 */
export function createAiDeck({
  getAdmin,
  getCatalog,
  callModel,
  enabled,
  limits = readLimits,
  ipSalt = () => process.env.NAMES_AI_IP_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  now = Date.now,
}: Deps) {
  const lastCall = new Map<string, number>();

  return async function aiDeck(request: Request): Promise<Response> {
    if (!enabled() || !callModel) return fail(503, "off");

    const admin = getAdmin();
    if (!admin) {
      console.error("names ai deck: service client not configured");
      return fail(503, "off");
    }
    const who = await identify(request, admin, ipSalt());
    if (who instanceof Response) return who;
    const subject = who.user ?? `g:${who.device}`;

    // The body: size first, then shape.
    let body: Record<string, unknown>;
    try {
      const text = await request.text();
      if (new TextEncoder().encode(text).length > BODY_MAX) return fail(413, "too_long");
      const parsed: unknown = JSON.parse(text);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return fail(400, "error");
      body = parsed as Record<string, unknown>;
    } catch {
      return fail(400, "error");
    }
    if (typeof body.prompt !== "string") return fail(400, "too_short");
    if ([...body.prompt].length > PROMPT_MAX * 2) return fail(400, "too_long");
    const prompt = cleanPrompt(body.prompt, PROMPT_MAX);
    const refine = cleanPrompt(body.refine, REFINE_MAX) || null;
    if ([...prompt].length < PROMPT_MIN) return fail(400, "too_short");
    const allowList = body.allow === undefined ? undefined : nameList(body.allow);
    const exclude = nameList(body.exclude);
    if (allowList === null || exclude === null) return fail(400, "error");

    const catalog = getCatalog();
    const excluded = new Set(exclude.map((n) => catalog.ids.get(n)).filter((id): id is number => id !== undefined));
    let allowed: number[] | null = null;
    if (allowList !== undefined || excluded.size) {
      const base = allowList === undefined ? catalog.cards.map((_, id) => id) : allowList.map((n) => catalog.ids.get(n));
      allowed = [...new Set(base.filter((id): id is number => id !== undefined && !excluded.has(id)))].sort((a, b) => a - b);
      if (!allowed.length) return fail(422, "no_names");
    }

    // One request at a time per person per instance.
    const t = now();
    for (const [id, at] of lastCall) if (t - at >= BURST_MS) lastCall.delete(id);
    if (lastCall.has(subject)) return fail(429, "busy");
    lastCall.set(subject, t);

    const ip = clientIp(request);
    const ipKey = ip ? hash(ipSalt(), ip) : "";
    const l = limits();
    const used = (limit: number) => ({ remaining: 0, limit, guest: !who.user });
    try {
      const taken = await admin.rpc("names_ai_take_month", {
        p_user: who.user,
        p_device: who.device,
        p_ip: ipKey,
        p_user_month: l.userMonth,
        p_guest_month: l.guestMonth,
        p_ip_day: l.ipDay,
        p_guest_ip_day: l.guestIpDay,
        p_guest_day: l.guestDay,
        p_budget: l.budgetUsd,
      });
      if (taken.error) {
        console.error("names ai deck: limit check failed", taken.error.code ?? "");
        return fail(503, "off");
      }
      const verdict = taken.data as string;
      if (verdict === "user_month") return json(429, { error: "limit_month", quota: used(l.userMonth) });
      if (verdict === "guest_month") return json(429, { error: "guest_used", quota: used(l.guestMonth) });
      if (verdict === "guest_day") return fail(429, "guest_busy");
      if (verdict === "ip_day") return fail(429, "limit_day");
      if (verdict === "budget") return fail(503, "budget");
      if (verdict !== "ok") return fail(503, "off");
    } catch {
      console.error("names ai deck: limit check failed");
      return fail(503, "off");
    }
    // Give the search back: `withIp` when it failed on our side (then it never happened).
    const giveBack = (withIp: boolean) =>
      admin.rpc("names_ai_give_back", { p_user: who.user, p_device: who.device, p_ip: withIp ? ipKey : "" }).then(
        () => undefined,
        () => undefined,
      );

    let reply: ModelReply;
    try {
      reply = await callModel(systemText(catalog), userText(prompt, refine, allowed));
    } catch (e) {
      console.error("names ai deck: model call failed", (e as { status?: number })?.status ?? "");
      await giveBack(true);
      return fail(502, "error");
    }
    await admin.rpc("names_ai_spend", { p_usd: reply.usd }).then(
      () => undefined,
      () => undefined,
    );

    const verdict: AiDeckResponse | null =
      reply.refused || reply.json === null ? { status: "unsafe", picks: [] } : readModelOutput(reply.json, catalog, allowed ? new Set(allowed) : null);
    if (!verdict) {
      console.error("names ai deck: output did not match the schema");
      await giveBack(true);
      return fail(502, "error");
    }
    // No deck, no search used.
    if (verdict.status !== "ok" || verdict.picks.length === 0) await giveBack(false);
    const quota = await readQuota(admin, who, l);
    return json(200, (quota ? { ...verdict, quota } : verdict) satisfies AiDeckResponse);
  };
}

/** GET /api/names/ai-deck: this month's searches left, without using one. */
export function createAiQuota({
  getAdmin,
  enabled,
  limits = readLimits,
  ipSalt = () => process.env.NAMES_AI_IP_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
}: Pick<Deps, "getAdmin" | "enabled" | "limits" | "ipSalt">) {
  return async function aiQuota(request: Request): Promise<Response> {
    if (!enabled()) return fail(503, "off");
    const admin = getAdmin();
    if (!admin) return fail(503, "off");
    const who = await identify(request, admin, ipSalt());
    if (who instanceof Response) return who;
    const quota = await readQuota(admin, who, limits());
    return quota ? json(200, { quota }) : fail(503, "off");
  };
}
