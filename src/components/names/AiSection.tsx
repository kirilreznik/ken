"use client";

import { useEffect, useId, useState } from "react";
import { useIsGuest } from "@/components/names/AuthProvider";
import WelcomeActions from "@/components/names/WelcomeActions";
import { Button, chipClass, inputClass } from "@/components/names/ui";
import {
  AI_EXAMPLES,
  AI_GUEST_TRY,
  AI_GUEST_USED,
  AI_LEAD,
  AI_LOADING,
  AI_PLACEHOLDER,
  AI_PRIVACY,
  AI_REFINE,
  AI_REFINE_PLACEHOLDER,
  AI_SIGNIN_LEAD,
  AI_SUBMIT,
  AI_SUBMIT_REFINE,
  AI_WITHIN_FILTERS,
  PROMPT_MAX,
  PROMPT_MIN,
  REFINE_MAX,
  aiErrorText,
  cleanPrompt,
  fetchAiQuota,
  lengthBucket,
  quotaText,
  requestAiDeck,
  type AiCaller,
  type AiQuota,
  type SavedAiDeck,
} from "@/lib/names/aiDeck";
import { deviceId } from "@/lib/names/device";
import { isOffline, OFFLINE_MESSAGE } from "@/lib/names/authErrors";
import { getSupabase } from "@/lib/names/supabase";
import { markSigninFrom } from "@/lib/names/signinFrom";
import { track } from "@/lib/names/track";

/** A guest's description waits here (this tab only) while they sign in. */
const DRAFT_KEY = "nest-names-ai-draft";

function readDraft(): string {
  try {
    return sessionStorage.getItem(DRAFT_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeDraft(text: string): void {
  try {
    if (text) sessionStorage.setItem(DRAFT_KEY, text);
    else sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Storage blocked: the text just won't wait.
  }
}

type AiSectionProps = {
  /** The deck made last time, if one is on: its words fill the box and "לדייק" shows. */
  saved: SavedAiDeck | null;
  /** Names that pass the filters as they are in the sheet now (null: no filter is set). */
  allow: () => string[] | null;
  /** Names already decided (they are left out of the new deck). */
  exclude: () => string[];
  activeFilters: number;
  /** A new deck arrived: save it (and the sheet's filters) and close the sheet. */
  onDeck: (deck: SavedAiDeck) => void;
};

/**
 * "חיפוש לפי תיאור", the step the filters sheet opens from its top row (aiDeck.ts; the sheet's
 * title names it): a box for the description, tappable examples, the button, and how many
 * searches are left this month. A guest gets one try (counted by a random device id); after
 * it, the sign-in buttons take the button's place and what they typed waits in this tab. The description goes to our server, which asks Claude to pick from
 * our cards; nothing typed here is stored by us or sent with analytics.
 */
export default function AiSection({ saved, allow, exclude, activeFilters, onDeck }: AiSectionProps) {
  const guest = useIsGuest();
  const [prompt, setPrompt] = useState(() => saved?.prompt ?? "");
  const [refine, setRefine] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedExample, setUsedExample] = useState(false);
  const [quota, setQuota] = useState<AiQuota | null>(null);
  const fieldId = useId();
  const refineId = useId();
  const leadId = useId();
  const privacyId = useId();
  const errorId = useId();
  const quotaId = useId();

  // A description typed before signing in comes back.
  useEffect(() => {
    if (saved) return;
    const draft = readDraft();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from session storage after mount
    if (draft) setPrompt(draft);
  }, [saved]);

  // Who asks: the session's token, or this device for a guest. Null: signed out, not a guest.
  async function caller(): Promise<AiCaller | null> {
    if (guest) return { device: deviceId() };
    const supabase = getSupabase();
    const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
    const token = data.session?.access_token;
    return token ? { token } : null;
  }

  // How many searches are left, read when the step opens (it doesn't use one).
  useEffect(() => {
    let live = true;
    void (async () => {
      const who = await caller();
      const q = who && !isOffline() ? await fetchAiQuota(who) : null;
      if (live && q) setQuota(q);
    })();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per guest or account
  }, [guest]);

  const guestUsed = guest && quota?.remaining === 0;
  const allUsed = !guest && quota?.remaining === 0;
  const refining = !!saved && cleanPrompt(prompt) === saved.prompt;
  const length = [...prompt].length;

  async function submit() {
    if (busy || allUsed || guestUsed) return;
    const text = cleanPrompt(prompt);
    if ([...text].length < PROMPT_MIN) {
      setError(aiErrorText("too_short"));
      return;
    }
    if (isOffline()) {
      setError(OFFLINE_MESSAGE);
      return;
    }
    const refineText = refining ? cleanPrompt(refine, REFINE_MAX) : "";
    setBusy(true);
    setError(null);
    track("ai_submit", { length: lengthBucket(text), example: usedExample, filters: activeFilters, refine: !!refineText, guest });
    const started = performance.now();
    try {
      const who = await caller();
      if (!who) {
        setError(aiErrorText("signin"));
        track("ai_error", { code: "signin" });
        return;
      }
      const allowed = allow();
      const result = await requestAiDeck(who, {
        prompt: text,
        ...(refineText ? { refine: refineText } : {}),
        ...(allowed ? { allow: allowed } : {}),
        exclude: exclude(),
      });
      const ms = Math.round(performance.now() - started);
      if (!result.ok) {
        if (result.quota) setQuota(result.quota);
        // A used-up month shows in the line under the button; a used-up try, as the sign-in block.
        const shown = result.error === "guest_used" || (result.error === "limit_month" && result.quota);
        setError(shown ? null : aiErrorText(result.error));
        track("ai_error", { code: result.error, ms });
        return;
      }
      const { status, picks } = result.data;
      if (result.data.quota) setQuota(result.data.quota);
      track("ai_result", { status, picks: picks.length, reasons: picks.filter((p) => p.reason).length, ms });
      if (status !== "ok" || picks.length === 0) {
        setError(aiErrorText(status === "ok" ? "none" : status));
        return;
      }
      writeDraft("");
      onDeck({ prompt: text, refine: refineText || null, picks, at: new Date().toISOString() });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p id={leadId} className="m-0 text-person text-ink-soft">
        {AI_LEAD}
        {activeFilters > 0 ? ` ${AI_WITHIN_FILTERS}` : ""}
      </p>
      <label htmlFor={fieldId} className="sr-only">
        תיאור השם שמחפשים
      </label>
      <textarea
        id={fieldId}
        dir="rtl"
        rows={3}
        maxLength={PROMPT_MAX}
        value={prompt}
        placeholder={AI_PLACEHOLDER}
        aria-describedby={`${leadId} ${privacyId}${error ? ` ${errorId}` : ""}`}
        aria-invalid={error ? true : undefined}
        onChange={(e) => {
          setPrompt(e.target.value);
          setUsedExample(false);
          if (guest) writeDraft(e.target.value);
        }}
        className={`${inputClass("multiline")} min-h-24`}
      />
      <p className="m-0 self-end text-caption text-stone tabular-nums" aria-hidden="true">
        {length}/{PROMPT_MAX}
      </p>
      {!prompt.trim() ? (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="דוגמאות לתיאור">
          {AI_EXAMPLES.map((ex) => (
            <li key={ex}>
              <button
                type="button"
                className={chipClass(false, "md")}
                onClick={() => {
                  setPrompt(ex);
                  setUsedExample(true);
                  if (guest) writeDraft(ex);
                }}
              >
                {ex}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {refining ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={refineId} className="text-person font-bold text-ink">
            {AI_REFINE}
          </label>
          <input
            id={refineId}
            dir="rtl"
            maxLength={REFINE_MAX}
            value={refine}
            placeholder={AI_REFINE_PLACEHOLDER}
            onChange={(e) => setRefine(e.target.value)}
            className={inputClass()}
          />
        </div>
      ) : null}
      <p id={privacyId} className="m-0 text-caption text-stone">
        {AI_PRIVACY}
      </p>
      {error ? (
        <p id={errorId} role="alert" className="m-0 text-person text-urgent">
          {error}
        </p>
      ) : null}
      {guestUsed ? (
        <div className="flex flex-col gap-2.5">
          <p className="m-0 text-person font-bold text-ink">{AI_GUEST_USED}</p>
          <p className="m-0 text-person text-ink-soft">{AI_SIGNIN_LEAD}</p>
          <div onClickCapture={() => {
            markSigninFrom("ai");
            track("ai_open", { source: "guest_signin" });
          }} className="flex flex-col gap-3">
            <WelcomeActions />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => void submit()}
            aria-busy={busy || undefined}
            aria-disabled={busy || allUsed || undefined}
            aria-describedby={quotaId}
          >
            {busy ? AI_LOADING : refining ? AI_SUBMIT_REFINE : AI_SUBMIT}
          </Button>
          <p id={quotaId} className="m-0 text-center text-caption text-ink-soft tabular-nums">
            {guest ? AI_GUEST_TRY : quota ? quotaText(quota) : ""}
          </p>
        </div>
      )}
      <p role="status" className="sr-only">
        {busy ? AI_LOADING : ""}
      </p>
    </div>
  );
}
