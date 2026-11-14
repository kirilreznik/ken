import { createHmac } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  LIST_MAX,
  PROMPT_MAX,
  PROMPT_MIN,
  REFINE_MAX,
  cleanPrompt,
  type AiDeckResponse,
  type AiError,
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
  userDay: number;
  userWeek: number;
  ipDay: number;
  /** Total spend per day across everyone, in US dollars. */
  budgetUsd: number;
}

export function readLimits(env: Record<string, string | undefined> = process.env): AiLimits {
  const n = (key: string, fallback: number) => {
    const v = Number(env[key]);
    return Number.isFinite(v) && v >= 0 ? v : fallback;
  };
  return {
    userDay: n("NAMES_AI_USER_DAY", 5),
    userWeek: n("NAMES_AI_USER_WEEK", 20),
    ipDay: n("NAMES_AI_IP_DAY", 20),
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

function nameList(raw: unknown): string[] | null {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw) || raw.length > LIST_MAX) return null;
  return raw.filter((x): x is string => typeof x === "string" && x.length > 0 && x.length <= 40);
}

/**
 * POST /api/names/ai-deck. Order of checks: switch, token, body, burst, daily limits and
 * budget (one RPC, which also counts the request), then the model, then the output check.
 * Nothing the person wrote is logged or stored; errors log a code only.
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

    const token = bearerToken(request.headers.get("authorization"));
    if (!token) return fail(401, "signin");
    const admin = getAdmin();
    if (!admin) {
      console.error("names ai deck: service client not configured");
      return fail(503, "off");
    }

    let userId: string;
    try {
      const { data, error } = await admin.auth.getUser(token);
      if (error || !data.user) return fail(401, "signin");
      userId = data.user.id;
    } catch {
      console.error("names ai deck: token check failed");
      return fail(500, "error");
    }

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
    if (lastCall.has(userId)) return fail(429, "busy");
    lastCall.set(userId, t);

    const ip = clientIp(request);
    const ipKey = ip ? createHmac("sha256", ipSalt()).update(ip).digest("hex").slice(0, 32) : "";
    const l = limits();
    try {
      const taken = await admin.rpc("names_ai_take", {
        p_user: userId,
        p_ip: ipKey,
        p_user_day: l.userDay,
        p_user_week: l.userWeek,
        p_ip_day: l.ipDay,
        p_budget: l.budgetUsd,
      });
      if (taken.error) {
        console.error("names ai deck: limit check failed", taken.error.code ?? "");
        return fail(503, "off");
      }
      const verdict = taken.data as string;
      if (verdict === "user_day" || verdict === "ip_day") return fail(429, "limit_day");
      if (verdict === "user_week") return fail(429, "limit_week");
      if (verdict === "budget") return fail(503, "budget");
      if (verdict !== "ok") return fail(503, "off");
    } catch {
      console.error("names ai deck: limit check failed");
      return fail(503, "off");
    }

    let reply: ModelReply;
    try {
      reply = await callModel(systemText(catalog), userText(prompt, refine, allowed));
    } catch (e) {
      console.error("names ai deck: model call failed", (e as { status?: number })?.status ?? "");
      // Our failure: give the request back.
      await admin.rpc("names_ai_refund", { p_user: userId, p_ip: ipKey }).then(
        () => undefined,
        () => undefined,
      );
      return fail(502, "error");
    }
    await admin.rpc("names_ai_spend", { p_usd: reply.usd }).then(
      () => undefined,
      () => undefined,
    );

    if (reply.refused || reply.json === null) return json(200, { status: "unsafe", picks: [] } satisfies AiDeckResponse);
    const verdict = readModelOutput(reply.json, catalog, allowed ? new Set(allowed) : null);
    if (!verdict) {
      console.error("names ai deck: output did not match the schema");
      return fail(502, "error");
    }
    return json(200, verdict satisfies AiDeckResponse);
  };
}
