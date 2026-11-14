/**
 * In-app feedback (/names/feedback): copy, validation and the POST to /api/names/feedback.
 * Open to guests and signed-in people; the server stores it in analytics.names_feedback
 * (migration 0016 in kirilreznik/pregnancy-manager) and may email the owner.
 */

import { APP_VERSION } from "./clientLog";

export const FEEDBACK_PATH = "/names/feedback";
export const FEEDBACK_MAX = 1000;
export const FEEDBACK_CONTACT_MAX = 200;

export type FeedbackKind = "idea" | "problem" | "praise" | "other";

export const FEEDBACK_KINDS: { value: FeedbackKind; label: string }[] = [
  { value: "idea", label: "רעיון" },
  { value: "problem", label: "משהו לא עובד" },
  { value: "praise", label: "מה אהבתי" },
  { value: "other", label: "אחר" },
];

export const FEEDBACK_TEXT = {
  title: "משוב",
  intro: "מה עובד, מה מבלבל, מה חסר? אנחנו קוראים כל הודעה.",
  kindLegend: "על מה? (לא חובה)",
  messageLabel: "מה רצית לספר?",
  contactLabel: "מייל לתשובה (לא חובה)",
  contactHint: "רק אם אפשר לחזור אליך. לא נשתמש בו לשום דבר אחר.",
  privacy: "המשוב נשמר בלי השם שלך ובלי הבחירות שלך.",
  submit: "שליחת משוב",
  sending: "שולחים…",
  sent: "תודה, המשוב נשלח.",
  back: "חזרה לבחירת שם",
  offline: "אין חיבור לאינטרנט. אפשר לשלוח כשהחיבור יחזור.",
  failed: "המשוב לא נשלח. אפשר לנסות שוב.",
  limited: "נשלחו הרבה הודעות בזמן קצר. אפשר לנסות שוב מאוחר יותר.",
  settingsRow: "שליחת משוב",
  aboutLink: "יש לך הערה או רעיון? שליחת משוב",
} as const;

export type FeedbackError = "empty" | "too-long" | "contact";

export const FEEDBACK_ERRORS: Record<FeedbackError, string> = {
  empty: "צריך לכתוב משהו",
  "too-long": `עד ${FEEDBACK_MAX} תווים`,
  contact: "כתובת המייל לא נראית תקינה",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isFeedbackKind(v: unknown): v is FeedbackKind {
  return v === "idea" || v === "problem" || v === "praise" || v === "other";
}

/** The first problem with the form, or null when it can be sent. */
export function validateFeedback(message: string, contact: string): FeedbackError | null {
  const text = message.trim();
  if (!text) return "empty";
  if (text.length > FEEDBACK_MAX) return "too-long";
  const c = contact.trim();
  if (c && (c.length > FEEDBACK_CONTACT_MAX || !EMAIL.test(c))) return "contact";
  return null;
}

/** Where the person came from (?from=/names/settings), kept only when it is a /names path. */
export function feedbackFrom(value: string | null | undefined): string | null {
  if (!value) return null;
  return /^\/names(\/[A-Za-z0-9_-]{1,40}){0,3}$/.test(value) ? value : null;
}

export type FeedbackPayload = {
  kind: FeedbackKind | null;
  message: string;
  contact: string | null;
  from: string | null;
  appVersion: string;
  /** Honeypot: a hidden field people never fill. */
  website?: string;
};

export function feedbackPayload(input: { kind: FeedbackKind | null; message: string; contact: string; from: string | null; website?: string }): FeedbackPayload {
  return {
    kind: input.kind,
    message: input.message.trim().slice(0, FEEDBACK_MAX),
    contact: input.contact.trim() || null,
    from: input.from,
    appVersion: APP_VERSION,
    ...(input.website ? { website: input.website } : {}),
  };
}

export type FeedbackResult = "ok" | "limited" | "offline" | "error";

/** POSTs the feedback; a session token (when signed in) lets the server mark it as signed in. */
export async function sendFeedback(payload: FeedbackPayload, token: string | null, fetcher: typeof fetch = fetch): Promise<FeedbackResult> {
  try {
    const res = await fetcher("/api/names/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(payload),
    });
    if (res.ok) return "ok";
    if (res.status === 429) return "limited";
    return "error";
  } catch {
    return typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "error";
  }
}
