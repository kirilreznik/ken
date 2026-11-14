/**
 * "חיפוש לפי תיאור" (the AI deck): a person describes the names they want in their own words,
 * and the server asks Claude to pick a personal deck from our cards only
 * (src/lib/names/server/aiDeck.ts). This file is shared by the client and the server: the
 * request and response shapes, the input clean-up, the saved deck pref and the copy.
 */

import { matches, type FilterableCard, type Filters } from "./filters";
import type { Vote } from "./types";

export const AI_DECK_PATH = "/api/names/ai-deck";

/** Longest description, in characters (after clean-up). */
export const PROMPT_MAX = 300;
/** Longest refinement ("לדייק"), in characters. */
export const REFINE_MAX = 200;
/** Shortest description that is worth a request. */
export const PROMPT_MIN = 3;
/** How many names Claude is asked for, best first. */
export const PICKS_WANTED = 50;
/** Longest reason line kept from Claude's answer. */
export const REASON_MAX = 90;
/** Most names `allow` or `exclude` may carry. */
export const LIST_MAX = 2500;
/** The client gives up after this. */
export const AI_TIMEOUT_MS = 45_000;

/** Shown when the feature is on (NEXT_PUBLIC_NAMES_AI=on); the server has its own switch too. */
export function aiDeckEnabled(): boolean {
  return process.env.NEXT_PUBLIC_NAMES_AI === "on";
}

// Bidi overrides and isolates, zero-width characters and other invisible format characters.
const INVISIBLE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯﻿￹-￻]/g;

/**
 * The description as it is sent: invisible and control characters out, angle brackets and
 * braces out (so text can't close or fake the tags around it), whitespace runs to one space,
 * trimmed and cut to `max` characters (by code point).
 */
export function cleanPrompt(raw: unknown, max = PROMPT_MAX): string {
  if (typeof raw !== "string") return "";
  const text = raw
    .normalize("NFC")
    .replace(INVISIBLE, "")
    .replace(/[<>{}[\]`\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return [...text].slice(0, max).join("").trim();
}

/** One pick as the server sends it: a deck name and Claude's short reason (null if it failed the checks). */
export interface AiPick {
  name: string;
  reason: string | null;
}

/**
 * POST body. `allow` is the names that pass the person's filters (left out when no filter is
 * set), worked out on the device so the filters themselves (a relative's name among them) never
 * leave it; `exclude` is the names already decided. The server picks only from what's left.
 */
export interface AiDeckRequest {
  prompt: string;
  refine?: string;
  allow?: string[];
  exclude?: string[];
}

/**
 * "ok": names picked. "off_topic": the text isn't about choosing a baby name. "unsafe": the
 * request asked for something we don't do. "none": nothing in the cards fits.
 */
export type AiStatus = "ok" | "off_topic" | "unsafe" | "none";

export interface AiDeckResponse {
  status: AiStatus;
  picks: AiPick[];
}

export type AiError =
  | "signin"
  | "too_short"
  | "too_long"
  | "no_names"
  | "limit_day"
  | "limit_week"
  | "busy"
  | "budget"
  | "off"
  | "error";

export type AiResult = { ok: true; data: AiDeckResponse } | { ok: false; error: AiError };

/** POST /api/names/ai-deck with the access token. Network failures and the deadline read as "error". */
export async function requestAiDeck(
  accessToken: string,
  body: AiDeckRequest,
  fetchImpl: typeof fetch = fetch,
): Promise<AiResult> {
  try {
    const res = await fetchImpl(AI_DECK_PATH, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });
    if (res.ok) {
      const data = readResponse(await res.json());
      return data ? { ok: true, data } : { ok: false, error: "error" };
    }
    if (res.status === 401) return { ok: false, error: "signin" };
    const json = (await res.json().catch(() => null)) as { error?: unknown } | null;
    const error = json && typeof json.error === "string" && isAiError(json.error) ? json.error : "error";
    return { ok: false, error };
  } catch {
    return { ok: false, error: "error" };
  }
}

const AI_ERRORS: readonly AiError[] = ["signin", "too_short", "too_long", "no_names", "limit_day", "limit_week", "busy", "budget", "off", "error"];
function isAiError(v: string): v is AiError {
  return (AI_ERRORS as readonly string[]).includes(v);
}

const STATUSES: readonly AiStatus[] = ["ok", "off_topic", "unsafe", "none"];

/** The server's answer, checked again on the device (names must be strings, reasons short). */
export function readResponse(raw: unknown): AiDeckResponse | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (!STATUSES.includes(r.status as AiStatus) || !Array.isArray(r.picks)) return null;
  const picks = readPicks(r.picks);
  return { status: r.status as AiStatus, picks };
}

function readPicks(raw: unknown[]): AiPick[] {
  const seen = new Set<string>();
  const out: AiPick[] = [];
  for (const p of raw) {
    if (typeof p !== "object" || p === null) continue;
    const { name, reason } = p as Record<string, unknown>;
    if (typeof name !== "string" || !name || name.length > 40 || seen.has(name)) continue;
    seen.add(name);
    out.push({ name, reason: typeof reason === "string" && reason.length <= REASON_MAX ? reason : null });
    if (out.length >= 100) break;
  }
  return out;
}

/** The AI deck saved on the device (pref "aiDeck"): the words used and the picks in order. */
export interface SavedAiDeck {
  prompt: string;
  refine: string | null;
  picks: AiPick[];
  /** ISO time it was made. */
  at: string;
}

export function readSavedAiDeck(raw: unknown): SavedAiDeck | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const prompt = cleanPrompt(r.prompt);
  if (!prompt || !Array.isArray(r.picks) || typeof r.at !== "string") return null;
  const picks = readPicks(r.picks);
  if (!picks.length) return null;
  const refine = cleanPrompt(r.refine, REFINE_MAX) || null;
  return { prompt, refine, picks, at: r.at };
}

/**
 * The AI deck's cards left to swipe: the picks in Claude's order, without decided names and
 * within the current filters. `top` (the card an undo restored) goes first, as in buildDeck.
 */
export function buildAiDeck<T extends FilterableCard>(
  cards: readonly T[],
  saved: SavedAiDeck,
  votes: ReadonlyMap<string, Vote>,
  filters: Filters,
  top: string | null = null,
): { cards: T[]; total: number; position: number } {
  const byName = new Map(cards.map((c) => [c.stats.name, c]));
  const inDeck: T[] = [];
  for (const p of saved.picks) {
    const c = byName.get(p.name);
    if (c && votes.get(p.name) !== "hidden" && matches(c, filters)) inDeck.push(c);
  }
  const remaining = inDeck.filter((c) => !votes.has(c.stats.name));
  if (top !== null) {
    const i = remaining.findIndex((c) => c.stats.name === top);
    if (i > 0) remaining.unshift(...remaining.splice(i, 1));
  }
  const total = inDeck.length;
  return { cards: remaining, total, position: Math.max(1, Math.min(total, total - remaining.length + 1)) };
}

/** Claude's reason for a name in the saved deck, if any. */
export function reasonFor(saved: SavedAiDeck | null, name: string | undefined): string | null {
  if (!saved || !name) return null;
  return saved.picks.find((p) => p.name === name)?.reason ?? null;
}

/** "42 שמות" / "שם אחד". */
export function picksCountText(n: number): string {
  return n === 1 ? "שם אחד" : `${n} שמות`;
}

/** The description length as a coarse bucket for analytics (no text ever leaves). */
export function lengthBucket(text: string): "short" | "medium" | "long" {
  const n = [...text].length;
  return n < 40 ? "short" : n < 120 ? "medium" : "long";
}

// Copy (gender-neutral, as the rest of the swiper: past tense and infinitives; explicit actions).
export const AI_TITLE = "חיפוש לפי תיאור";
export const AI_LEAD = "אפשר לתאר במילים שלך איזה שם מחפשים, ונבחר שמות מתוך השמות שלנו.";
export const AI_PLACEHOLDER = "למשל: שם קצר לבת, משהו מהטבע";
export const AI_SUBMIT = "בחירת שמות לפי התיאור";
export const AI_SUBMIT_REFINE = "בחירה מחדש";
export const AI_LOADING = "בוחרים שמות לפי התיאור…";
export const AI_PRIVACY = "התיאור נשלח לעיבוד אצל Anthropic ולא נשמר אצלנו. עדיף לא לכתוב בו פרטים מזהים.";
export const AI_SIGNIN = "התחברות לחיפוש לפי תיאור";
export const AI_SIGNIN_LEAD = "החיפוש לפי תיאור פתוח למי שמחובר. התיאור שכתבת יחכה כאן.";
export const AI_REASON_LABEL = "למה השם הזה";
export const AI_GENERATED = "הוצע אוטומטית";
export const AI_BACK = "חזרה לכל השמות";
export const AI_REFINE = "לדייק";
export const AI_REFINE_PLACEHOLDER = "למשל: פחות תנ״כיים";
export const AI_END_TITLE = "עברת על כל השמות שנבחרו לפי התיאור.";
export const AI_WITH_FILTERS = "עם הסינון שבחרת";

/** Tappable examples under the box. */
export const AI_EXAMPLES: readonly string[] = [
  "שם קצר לבת, משהו מהטבע",
  "שמות תנ״כיים שלא נפוצים היום",
  "שם שנשמע טוב גם באנגלית וקל לבטא בחו״ל",
  "על שם סבתא רבקה, אולי שם שמתחיל בר׳",
  "שמות כמו נועה ומאיה אבל פחות נפוצים",
  "שם לבן עם משמעות של אור או שמחה",
];

/** The message for a failed or empty request. */
export function aiErrorText(error: AiError | AiStatus): string {
  switch (error) {
    case "signin":
      return "צריך להתחבר מחדש כדי לחפש לפי תיאור.";
    case "too_short":
      return "אפשר להוסיף עוד כמה מילים על השם שמחפשים.";
    case "too_long":
      return `אפשר לכתוב עד ${PROMPT_MAX} תווים.`;
    case "no_names":
    case "none":
      return "לא מצאנו שמות שמתאימים לתיאור ולסינון. אפשר לשנות את התיאור או את הסינון.";
    case "limit_day":
      return "הגעת למספר החיפושים לפי תיאור להיום. אפשר לנסות שוב מחר.";
    case "limit_week":
      return "הגעת למספר החיפושים לפי תיאור לשבוע הזה. אפשר לנסות שוב בעוד כמה ימים.";
    case "busy":
      return "היו הרבה חיפושים ברצף. אפשר לנסות שוב בעוד דקה.";
    case "budget":
    case "off":
      return "החיפוש לפי תיאור לא זמין כרגע. אפשר לנסות שוב מאוחר יותר.";
    case "off_topic":
      return "כאן אפשר לתאר רק את השם שמחפשים, למשל משמעות, צליל, אורך או על שם מי.";
    case "unsafe":
      return "את זה אין לנו איך לחפש. אפשר לתאר משמעות, צליל, אורך או על שם מי.";
    case "ok":
      return "";
    default:
      return "לא הצלחנו לבחור שמות. אפשר לנסות שוב.";
  }
}
