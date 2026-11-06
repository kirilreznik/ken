import { describe, expect, it } from "vitest";
import { cleanProps } from "@/lib/names/track";
import { EMPTY_ANSWER, Q_STAGE, hasAnswer, sendSurvey, surveyEventProps, surveyPayload } from "@/lib/names/survey";
import type { SupabaseClient } from "@supabase/supabase-js";

const answer = { ...EMPTY_ANSWER, disappointed: "very" as const, stage: "after20" as const, audience: "  זוגות שלא מסכימים  ", useful: "א".repeat(700) };

describe("survey", () => {
  it("needs at least one answer", () => {
    expect(hasAnswer(EMPTY_ANSWER)).toBe(false);
    expect(hasAnswer({ ...EMPTY_ANSWER, useful: "  " })).toBe(false);
    expect(hasAnswer({ ...EMPTY_ANSWER, nestApp: "maybe" })).toBe(true);
  });

  it("trims and caps the open answers", () => {
    const p = surveyPayload(answer, { votes: 64, sessions: 2 });
    expect(p.audience).toBe("זוגות שלא מסכימים");
    expect((p.useful as string).length).toBe(500);
    expect(p).toMatchObject({ disappointed: "very", stage: "after20", nest_app: null, votes: 64, sessions: 2 });
  });

  it("sends no free text in the event, and every prop survives the analytics filter", () => {
    const props = surveyEventProps(answer, { votes: 64, sessions: 2 });
    expect(props).toEqual({ disappointed: "very", stage: "after20", nest_app: null, audience: true, useful: true, votes: 64, sessions: 2 });
    expect(cleanProps(props)).toEqual(props);
  });

  it("asks about the pregnancy with five coarse stages, never a date", () => {
    expect(Q_STAGE.choices.map((c) => c.value)).toEqual(["none", "to20", "after20", "born", "other"]);
  });

  it("reports a refusal as error", async () => {
    const client = { rpc: async () => ({ error: { message: "x", code: "PGRST202" } }) } as unknown as SupabaseClient;
    expect(await sendSurvey(client, {})).toBe("error");
    const ok = { rpc: async () => ({ error: null, data: true }) } as unknown as SupabaseClient;
    expect(await sendSurvey(ok, {})).toBe("sent");
  });
});
