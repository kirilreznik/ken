"use client";

import { Suspense, useState, type FormEvent } from "react";
import { BottomSheet, Button, closeSheet } from "@/components/names/ui";
import { useLayerOpen } from "@/components/names/ui/layers";
import { reportClientLog } from "@/lib/names/clientLog";
import { getSupabase } from "@/lib/names/supabase";
import {
  EMPTY_ANSWER,
  Q_AUDIENCE,
  Q_DISAPPOINTED,
  Q_NEST_APP,
  Q_STAGE,
  Q_USEFUL,
  SURVEY_TEXT_MAX,
  hasAnswer,
  sendSurvey,
  surveyEventProps,
  surveyPayload,
  type Choice,
  type SurveyAnswer,
} from "@/lib/names/survey";
import { showToast } from "@/lib/names/toast";
import { track } from "@/lib/names/track";

type SurveySheetProps = {
  votes: number;
  sessions: number;
  /** The survey was sent: it never shows again. */
  onDone: () => void;
};

const FORM_ID = "survey-form";
const field = "w-full rounded-md border border-line bg-surface px-3.5 py-3 text-start text-body text-ink min-h-22 resize-y";

/**
 * The beta survey (?sheet=survey), opened from the prompt on the swipe screen. Every question
 * is optional; the sheet closes like any other, so it never stands between the user and the deck.
 */
export default function SurveySheet(props: SurveySheetProps) {
  return (
    <Suspense fallback={null}>
      <Gate {...props} />
    </Suspense>
  );
}

function Gate(props: SurveySheetProps) {
  return useLayerOpen("sheet", "survey") ? <Panel {...props} /> : null;
}

function ChoiceGroup<T extends string>({
  name,
  title,
  choices,
  value,
  onChange,
}: {
  name: string;
  title: string;
  choices: Choice<T>[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
      <legend className="mb-2 p-0 text-card-title text-ink">{title}</legend>
      {choices.map((c) => (
        <label
          key={c.value}
          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-line bg-surface px-3.5 py-2 text-body text-ink has-checked:border-ink has-checked:bg-sand"
        >
          <input
            type="radio"
            name={name}
            value={c.value}
            checked={value === c.value}
            onChange={() => onChange(c.value)}
            className="size-5 flex-none accent-ink"
          />
          {c.label}
        </label>
      ))}
    </fieldset>
  );
}

function Panel({ votes, sessions, onDone }: SurveySheetProps) {
  const [answer, setAnswer] = useState<SurveyAnswer>(EMPTY_ANSWER);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof SurveyAnswer>(key: K, value: SurveyAnswer[K]) => {
    setAnswer((a) => ({ ...a, [key]: value }));
    setError(null);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (sending || !supabase) return;
    if (!hasAnswer(answer)) {
      setError("אפשר לענות על שאלה אחת לפחות, או לסגור.");
      return;
    }
    setSending(true);
    const context = { votes, sessions };
    const result = await sendSurvey(supabase, surveyPayload(answer, context));
    setSending(false);
    if (result === "offline") {
      setError("אין חיבור לאינטרנט. אפשר לשלוח כשהחיבור יחזור.");
      return;
    }
    // The closed answers are in the event either way; a refusal is logged, not shown.
    if (result === "error") reportClientLog({ area: "survey", message: "names_survey refused" });
    track("survey_submitted", surveyEventProps(answer, context));
    onDone();
    closeSheet("survey");
    showToast("תודה! התשובות נשלחו.");
  };

  return (
    <BottomSheet
      name="survey"
      title="שאלון קצר"
      footer={
        <div className="flex flex-col gap-2">
          {error ? (
            <p role="alert" className="m-0 text-caption font-bold text-urgent">
              {error}
            </p>
          ) : null}
          <Button type="submit" form={FORM_ID} className="w-full" aria-busy={sending} aria-disabled={sending}>
            {sending ? "שולחים…" : "שליחה"}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={(e) => void submit(e)} className="flex flex-col gap-6">
        <p className="m-0 text-body text-ink-soft">
          חמש שאלות, כולן לא חובה. התשובות עוזרות לנו להבין למי זה מתאים. הן נשמרות בלי האימייל ובלי השם שלך.
        </p>
        <ChoiceGroup name="survey-disappointed" {...Q_DISAPPOINTED} value={answer.disappointed} onChange={(v) => set("disappointed", v)} />
        <div className="flex flex-col gap-2">
          <label htmlFor="survey-audience" className="text-card-title text-ink">
            {Q_AUDIENCE}
          </label>
          <textarea
            id="survey-audience"
            dir="rtl"
            lang="he"
            rows={2}
            maxLength={SURVEY_TEXT_MAX}
            value={answer.audience}
            onChange={(e) => set("audience", e.target.value)}
            className={field}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="survey-useful" className="text-card-title text-ink">
            {Q_USEFUL}
          </label>
          <textarea
            id="survey-useful"
            dir="rtl"
            lang="he"
            rows={2}
            maxLength={SURVEY_TEXT_MAX}
            value={answer.useful}
            onChange={(e) => set("useful", e.target.value)}
            className={field}
          />
        </div>
        <ChoiceGroup name="survey-stage" {...Q_STAGE} value={answer.stage} onChange={(v) => set("stage", v)} />
        <ChoiceGroup name="survey-nest" {...Q_NEST_APP} value={answer.nestApp} onChange={(v) => set("nestApp", v)} />
      </form>
    </BottomSheet>
  );
}
