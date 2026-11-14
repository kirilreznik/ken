"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import BackButton from "@/components/names/BackButton";
import { Button, CheckIcon, Chip, inputClass } from "@/components/names/ui";
import { APP_PATH } from "@/lib/names/auth";
import { isOffline } from "@/lib/names/authErrors";
import {
  FEEDBACK_CONTACT_MAX,
  FEEDBACK_ERRORS,
  FEEDBACK_KINDS,
  FEEDBACK_MAX,
  FEEDBACK_TEXT as T,
  feedbackFrom,
  feedbackPayload,
  sendFeedback,
  validateFeedback,
  type FeedbackKind,
} from "@/lib/names/feedback";
import { getSupabase } from "@/lib/names/supabase";
import { track } from "@/lib/names/track";

function ErrorLine({ id, children }: { id: string; children: string }) {
  return (
    <span id={id} role="alert" className="text-caption font-bold text-urgent">
      {children}
    </span>
  );
}

/**
 * /names/feedback: a short form open to everyone (guests too). Kind (optional), the message,
 * an optional reply address. Saved through /api/names/feedback; ?from= says where it was opened.
 */
export default function FeedbackScreen() {
  return (
    <div data-names-bg="none" className="min-h-dvh bg-canvas">
      <main className="mx-auto flex w-full max-w-content flex-col gap-4 px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <header className="flex items-center gap-2">
          <BackButton />
          <h1 className="m-0 min-w-0 flex-1 text-title">{T.title}</h1>
        </header>
        <Suspense fallback={null}>
          <Form />
        </Suspense>
      </main>
    </div>
  );
}

function Form() {
  const from = feedbackFrom(useSearchParams().get("from"));
  const [kind, setKind] = useState<FeedbackKind | null>(null);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<{ field: "message" | "contact"; text: string } | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const thanks = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (sent) thanks.current?.focus();
  }, [sent]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const invalid = validateFeedback(message, contact);
    if (invalid) {
      const field = invalid === "contact" ? "contact" : "message";
      setError({ field, text: FEEDBACK_ERRORS[invalid] });
      document.getElementById(field === "contact" ? "feedback-contact" : "feedback-message")?.focus();
      return;
    }
    if (isOffline()) {
      setSendError(T.offline);
      return;
    }
    setSending(true);
    setSendError(null);
    let token: string | null = null;
    try {
      const { data } = (await getSupabase()?.auth.getSession()) ?? { data: { session: null } };
      token = data.session?.access_token ?? null;
    } catch {
      token = null;
    }
    const result = await sendFeedback(feedbackPayload({ kind, message, contact, from, website }), token);
    setSending(false);
    if (result !== "ok") {
      setSendError(result === "limited" ? T.limited : result === "offline" || isOffline() ? T.offline : T.failed);
      return;
    }
    track("feedback_sent", { kind: kind ?? "none", contact: !!contact.trim(), signed_in: !!token });
    setSent(true);
  };

  if (sent) {
    return (
      <section className="flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-card">
        <p ref={thanks} tabIndex={-1} role="status" className="m-0 flex items-center gap-2 text-card-title text-ink outline-none">
          <CheckIcon />
          {T.sent}
        </p>
        <Button href={APP_PATH}>{T.back}</Button>
      </section>
    );
  }

  return (
    <section className="rounded-lg bg-surface p-5 shadow-card">
      <form noValidate onSubmit={(e) => void submit(e)} className="flex flex-col gap-5">
        <p className="m-0 text-body text-ink-soft">{T.intro}</p>

        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="mb-2 p-0 text-person font-bold text-ink">{T.kindLegend}</legend>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_KINDS.map((k) => (
              <Chip key={k.value} selected={kind === k.value} onClick={() => setKind(kind === k.value ? null : k.value)}>
                {k.label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="feedback-message" className="text-person font-bold text-ink">
            {T.messageLabel}
          </label>
          <textarea
            id="feedback-message"
            dir="rtl"
            lang="he"
            rows={5}
            maxLength={FEEDBACK_MAX}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError(null);
              setSendError(null);
            }}
            aria-invalid={error?.field === "message" ? true : undefined}
            aria-describedby={error?.field === "message" ? "feedback-message-error" : "feedback-message-hint"}
            className={`${inputClass("multiline")} min-h-32`}
          />
          {error?.field === "message" ? (
            <ErrorLine id="feedback-message-error">{error.text}</ErrorLine>
          ) : (
            <span id="feedback-message-hint" className="text-caption text-stone">
              עד {FEEDBACK_MAX} תווים.
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="feedback-contact" className="text-person font-bold text-ink">
            {T.contactLabel}
          </label>
          <input
            id="feedback-contact"
            type="email"
            dir="ltr"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={FEEDBACK_CONTACT_MAX}
            placeholder="name@example.com"
            value={contact}
            onChange={(e) => {
              setContact(e.target.value);
              setError(null);
            }}
            aria-invalid={error?.field === "contact" ? true : undefined}
            aria-describedby={error?.field === "contact" ? "feedback-contact-error" : "feedback-contact-hint"}
            className={`${inputClass()} text-start`}
          />
          {error?.field === "contact" ? (
            <ErrorLine id="feedback-contact-error">{error.text}</ErrorLine>
          ) : (
            <span id="feedback-contact-hint" className="text-caption text-stone">
              {T.contactHint}
            </span>
          )}
        </div>

        {/* Honeypot: hidden from people and screen readers; bots that fill it are ignored. */}
        <div aria-hidden="true" className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="feedback-website">אתר</label>
          <input id="feedback-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>

        <p className="m-0 text-caption text-stone">{T.privacy}</p>
        {sendError ? <ErrorLine id="feedback-send-error">{sendError}</ErrorLine> : null}
        <Button type="submit" className="w-full" aria-disabled={sending || undefined} aria-busy={sending}>
          {sending ? T.sending : T.submit}
        </Button>
      </form>
    </section>
  );
}
