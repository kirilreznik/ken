/**
 * The beta survey (product review §5): the Sean Ellis question, two open questions, the
 * pregnancy stage (coarse, never a due date) and interest in the Nest app. Answers go to
 * `names_survey` (migration 0011 in kirilreznik/pregnancy-manager); the closed answers also
 * ride on the `survey_submitted` event, so they are counted even before 0011 is applied.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { APP_VERSION } from "./clientLog";

export interface Choice<T extends string> {
  value: T;
  label: string;
}

export type Disappointed = "very" | "somewhat" | "not" | "stopped";
export type Stage = "none" | "to20" | "after20" | "born" | "other";
export type NestApp = "yes" | "maybe" | "no";

export const SURVEY_TEXT_MAX = 500;

export const Q_DISAPPOINTED = {
  title: "אם בחירת השם של Nest תפסיק לעבוד מחר, איך זה ירגיש?",
  choices: [
    { value: "very", label: "יהיה לי מאוד חבל" },
    { value: "somewhat", label: "יהיה לי קצת חבל" },
    { value: "not", label: "לא ממש אכפת לי" },
    { value: "stopped", label: "כבר לא בשימוש אצלי" },
  ] satisfies Choice<Disappointed>[],
};

export const Q_AUDIENCE = "למי לדעתך זה הכי מתאים?";
export const Q_USEFUL = "מה הדבר הכי שימושי כאן?";

// Wording Kiril chose on 2026-11-06 ("Neutral rewrite"): it asks about the pregnancy,
// not the person, so it fits a partner who isn't the one pregnant.
export const Q_STAGE = {
  title: "באיזה שלב ההיריון עכשיו?",
  choices: [
    { value: "none", label: "עוד אין היריון" },
    { value: "to20", label: "עד שבוע 20" },
    { value: "after20", label: "אחרי שבוע 20" },
    { value: "born", label: "התינוק כבר נולד" },
    { value: "other", label: "הבחירה בשביל מישהו אחר" },
  ] satisfies Choice<Stage>[],
};

export const Q_NEST_APP = {
  title: "אפליקציה מאותו צוות לניהול ההיריון: תורים, בדיקות ומסמכים. מעניין?",
  choices: [
    { value: "yes", label: "כן, ממש" },
    { value: "maybe", label: "אולי" },
    { value: "no", label: "לא" },
  ] satisfies Choice<NestApp>[],
};

export interface SurveyAnswer {
  disappointed: Disappointed | null;
  audience: string;
  useful: string;
  stage: Stage | null;
  nestApp: NestApp | null;
}

export const EMPTY_ANSWER: SurveyAnswer = { disappointed: null, audience: "", useful: "", stage: null, nestApp: null };

/** Something was answered (an empty form isn't sent). */
export function hasAnswer(a: SurveyAnswer): boolean {
  return !!(a.disappointed || a.stage || a.nestApp || a.audience.trim() || a.useful.trim());
}

/** The RPC payload. Text is trimmed and cut to 500 characters (the database cuts again). */
export function surveyPayload(a: SurveyAnswer, context: { votes: number; sessions: number }): Record<string, unknown> {
  return {
    disappointed: a.disappointed,
    stage: a.stage,
    nest_app: a.nestApp,
    audience: a.audience.trim().slice(0, SURVEY_TEXT_MAX),
    useful: a.useful.trim().slice(0, SURVEY_TEXT_MAX),
    votes: context.votes,
    sessions: context.sessions,
    app_version: APP_VERSION,
  };
}

/** The event props: closed answers as tokens, open answers only as "answered or not". */
export function surveyEventProps(a: SurveyAnswer, context: { votes: number; sessions: number }) {
  return {
    disappointed: a.disappointed,
    stage: a.stage,
    nest_app: a.nestApp,
    audience: !!a.audience.trim(),
    useful: !!a.useful.trim(),
    votes: context.votes,
    sessions: context.sessions,
  };
}

export type SurveyResult = "sent" | "offline" | "error";

/** Sends the answer. "error" means the server refused it (e.g. 0011 isn't applied yet). */
export async function sendSurvey(client: SupabaseClient, payload: Record<string, unknown>): Promise<SurveyResult> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return "offline";
  try {
    const { error } = await client.rpc("names_survey", { p_answer: payload });
    return error ? "error" : "sent";
  } catch {
    return "offline";
  }
}
