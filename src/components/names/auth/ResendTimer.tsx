"use client";

import { useEffect, useState } from "react";
import { RESEND_SECONDS, resendAnnouncement, resendWaitText, secondsLeft } from "@/lib/names/resend";

interface ResendTimerProps {
  /** Date.now() of the last send; changing it restarts the countdown. */
  sentAt: number;
  onResend: () => void;
  /** True while sending is blocked (another request, or no captcha token yet). */
  disabled?: boolean;
  /** True while this resend is in flight: the link says "שולחים…". */
  sending?: boolean;
  /** Said with the restart announcement after a resend (the visible line is the caller's). */
  sentNote?: string;
}

/**
 * "שליחה חוזרת" after 60 s (FR-W4). The wait is shown in words; screen readers hear it at
 * the start, every 15 s and when sending is allowed again.
 */
export default function ResendTimer({ sentAt, onResend, disabled, sending, sentNote }: ResendTimerProps) {
  const [now, setNow] = useState(sentAt);
  const left = secondsLeft(sentAt, Math.max(now, sentAt), RESEND_SECONDS);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, 1000);
    const first = window.setTimeout(tick, 0);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(first);
    };
  }, [sentAt]);

  const announcement = resendAnnouncement(left, RESEND_SECONDS, sentNote);
  const [spoken, setSpoken] = useState(announcement ?? "");
  if (announcement && announcement !== spoken) setSpoken(announcement);

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onResend}
        disabled={left > 0 || disabled || sending}
        aria-busy={sending || undefined}
        className="min-h-11 rounded-pill px-1 text-card-title font-bold text-ink underline underline-offset-4 disabled:text-stone disabled:no-underline"
      >
        {sending ? "שולחים…" : "שליחה חוזרת"}
      </button>
      {left > 0 ? (
        <span aria-hidden="true" className="text-caption text-ink tabular-nums">
          {resendWaitText(left)}
        </span>
      ) : null}
      <span role="status" className="sr-only">
        {spoken}
      </span>
    </div>
  );
}
