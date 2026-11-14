import "server-only";
import { createHmac } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FEEDBACK_CONTACT_MAX, FEEDBACK_KINDS, FEEDBACK_MAX, feedbackFrom, isFeedbackKind, validateFeedback } from "@/lib/names/feedback";
import { clientIp } from "./aiDeck";
import { bearerToken } from "./deleteAccount";

const BODY_MAX = 8_000;

type Deps = {
  getAdmin: () => SupabaseClient | null;
  ipSalt?: () => string;
  /** Sends the owner an email about new feedback; failures are logged and never fail the request. */
  notify?: (note: FeedbackNote) => Promise<void>;
};

export type FeedbackNote = { kind: string | null; message: string; contact: string | null; signedIn: boolean; from: string | null };

const empty = (status: number) => new Response(null, { status, headers: { "Cache-Control": "no-store" } });

/**
 * POST /api/names/feedback. Guests and signed-in people. Checks the body, then (with a valid
 * session) who sent it, then saves through names_feedback_add(), which also rate-limits by an
 * HMAC of the IP. The text is never logged. 204 on success, 400 bad input, 429 limited.
 */
export function createFeedback({ getAdmin, ipSalt = () => process.env.NAMES_AI_IP_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "", notify }: Deps) {
  return async function feedback(request: Request): Promise<Response> {
    let body: Record<string, unknown>;
    try {
      const text = await request.text();
      if (new TextEncoder().encode(text).length > BODY_MAX) return empty(413);
      const parsed: unknown = JSON.parse(text);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return empty(400);
      body = parsed as Record<string, unknown>;
    } catch {
      return empty(400);
    }
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const contact = typeof body.contact === "string" ? body.contact.trim() : "";
    if (validateFeedback(message, contact)) return empty(400);
    // A bot filled the hidden field: pretend it worked.
    if (typeof body.website === "string" && body.website.trim()) return empty(204);
    const kind = isFeedbackKind(body.kind) ? body.kind : null;
    const from = feedbackFrom(typeof body.from === "string" ? body.from : null);
    const version = typeof body.appVersion === "string" && /^[A-Za-z0-9_.-]{1,40}$/.test(body.appVersion) ? body.appVersion : null;

    const admin = getAdmin();
    if (!admin) {
      console.error("names feedback: service client not configured");
      return empty(503);
    }

    let user: string | null = null;
    const token = bearerToken(request.headers.get("authorization"));
    if (token) {
      try {
        const { data } = await admin.auth.getUser(token);
        user = data.user?.id ?? null;
      } catch {
        user = null; // An expired session still sends, as a guest.
      }
    }
    const ip = clientIp(request);
    const ipKey = ip ? createHmac("sha256", ipSalt()).update(`feedback:${ip}`).digest("hex").slice(0, 32) : null;

    const { data, error } = await admin.rpc("names_feedback_add", {
      p_user: user,
      p_ip: ipKey,
      p_kind: kind,
      p_message: message.slice(0, FEEDBACK_MAX),
      p_contact: contact ? contact.slice(0, FEEDBACK_CONTACT_MAX) : null,
      p_path: from,
      p_version: version,
    });
    if (error) {
      console.error("names feedback: save failed", error.code ?? "");
      return empty(500);
    }
    if (data === "limited") return empty(429);
    if (data !== "ok") return empty(400);

    if (notify) {
      try {
        await notify({ kind, message: message.slice(0, FEEDBACK_MAX), contact: contact || null, signedIn: !!user, from });
      } catch {
        console.error("names feedback: notify failed");
      }
    }
    return empty(204);
  };
}

/**
 * An email to the owner through Resend's HTTP API when RESEND_API_KEY and
 * NAMES_FEEDBACK_NOTIFY_TO are set in Vercel; otherwise no notifier (feedback is still saved).
 */
export function resendNotifier(env: Record<string, string | undefined> = process.env, fetcher: typeof fetch = fetch) {
  const key = env.RESEND_API_KEY?.trim();
  const to = env.NAMES_FEEDBACK_NOTIFY_TO?.trim();
  if (!key || !to) return undefined;
  const from = env.NAMES_FEEDBACK_FROM?.trim() || "Nest <no-reply@nestjourney.app>";
  return async (note: FeedbackNote) => {
    const label = FEEDBACK_KINDS.find((k) => k.value === note.kind)?.label ?? "משוב";
    const lines = [
      note.message,
      "",
      `סוג: ${label}`,
      `נשלח על ידי: ${note.signedIn ? "משתמש מחובר" : "אורח"}`,
      `מאיפה: ${note.from ?? "לא ידוע"}`,
      `מייל לתשובה: ${note.contact ?? "לא הושאר"}`,
    ];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetcher("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [to],
          subject: `משוב חדש ב־Nest: ${label}`,
          text: lines.join("\n"),
          ...(note.contact ? { reply_to: note.contact } : {}),
        }),
        signal: controller.signal,
      });
      if (!res.ok) console.error("names feedback: notify status", res.status);
    } finally {
      clearTimeout(timer);
    }
  };
}
