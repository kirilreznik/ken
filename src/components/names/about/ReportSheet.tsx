"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { BottomSheet, Button, closeSheet } from "@/components/names/ui";
import { useSearchParams } from "next/navigation";
import { useLayerOpen } from "@/components/names/ui/layers";
import { isOffline } from "@/lib/names/authErrors";
import { sendClientLog } from "@/lib/names/clientLog";
import {
  REPORT_ERRORS,
  REPORT_FAILED,
  REPORT_MAX,
  REPORT_OFFLINE,
  REPORT_SENT,
  buildReport,
  reportTitle,
  validateReport,
} from "@/lib/names/report";
import { track } from "@/lib/names/track";
import { NAME_PARAM } from "@/lib/names/urlLayer";

type ReportSheetProps = {
  /** The card the report is about; null on /names/about, where the name is an optional field. */
  name: string | null;
  /** Names `n` may hold: opened from the name sheet (?sheet=report&n=…), the report is about that name. */
  knownNames?: ReadonlySet<string>;
};

const FORM_ID = "report-form";
const field = "w-full rounded-md border border-line bg-surface px-3.5 text-start text-intro text-ink aria-invalid:border-urgent";

function ErrorLine({ id, children }: { id: string; children: string }) {
  return (
    <span id={id} role="alert" className="flex items-center gap-1.5 text-caption font-bold text-urgent">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" className="flex-none">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5M12 16v.5" />
      </svg>
      {children}
    </span>
  );
}

/**
 * "דיווח על טעות בשם {name}" (?sheet=report, FR-W30, PRD 3.2.18): a text area and "שליחת דיווח".
 * Posts to client-log with only area, name, message, path and appVersion, then thanks.
 * Mounts only while open, so each opening starts empty.
 */
export default function ReportSheet(props: ReportSheetProps) {
  return (
    <Suspense fallback={null}>
      <Gate {...props} />
    </Suspense>
  );
}

function Gate({ name, knownNames }: ReportSheetProps) {
  const linked = useSearchParams().get(NAME_PARAM);
  const open = useLayerOpen("sheet", "report");
  return open ? <Panel name={linked && knownNames?.has(linked) ? linked : name} /> : null;
}

function Panel({ name }: { name: string | null }) {
  const [typedName, setTypedName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const thanks = useRef<HTMLParagraphElement>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const invalid = validateReport(message);
    if (invalid) {
      setError(REPORT_ERRORS[invalid]);
      document.getElementById("report-message")?.focus();
      return;
    }
    if (isOffline()) {
      setSendError(REPORT_OFFLINE);
      return;
    }
    setSending(true);
    setSendError(null);
    const ok = await sendClientLog(buildReport(name ?? typedName, message));
    setSending(false);
    if (!ok) {
      setSendError(isOffline() ? REPORT_OFFLINE : REPORT_FAILED);
      return;
    }
    track("report_sent");
    setSent(true);
  };

  // The submit button goes away with the form; the thanks line takes the focus.
  useEffect(() => {
    if (sent) thanks.current?.focus();
  }, [sent]);

  if (sent) {
    return (
      <BottomSheet
        name="report"
        title={reportTitle(name)}
        footer={
          <Button className="w-full" onClick={() => closeSheet("report")}>
            סגירה
          </Button>
        }
      >
        <p ref={thanks} tabIndex={-1} role="status" className="m-0 flex items-center gap-2 text-card-title text-ink outline-none">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          {REPORT_SENT}
        </p>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      name="report"
      title={reportTitle(name)}
      footer={
        <Button type="submit" form={FORM_ID} className="w-full" aria-disabled={sending || undefined}>
          {sending ? "שולחים…" : "שליחת דיווח"}
        </Button>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={submit} className="flex flex-col gap-1.5">
        <p className="m-0 mb-2 text-body text-ink-soft">
          אפשר לכתוב מה לא נכון בפירוש, בהערה מהתנ״ך, באנשים או במספרים. הדיווח נשלח בלי פרטים עליך.
        </p>
        {name === null && (
          <>
            <label htmlFor="report-name" className="text-person font-bold text-ink">
              באיזה שם? (לא חובה)
            </label>
            <input
              id="report-name"
              type="text"
              dir="rtl"
              lang="he"
              autoComplete="off"
              maxLength={40}
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className={`${field} mb-3 h-12`}
            />
          </>
        )}
        <label htmlFor="report-message" className="text-person font-bold text-ink">
          מה לא נכון?
        </label>
        <textarea
          id="report-message"
          dir="rtl"
          lang="he"
          rows={4}
          maxLength={REPORT_MAX}
          data-autofocus=""
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setError(null);
            setSendError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "report-error" : "report-hint"}
          className={`${field} min-h-30 resize-y py-3`}
        />
        {error ? (
          <ErrorLine id="report-error">{error}</ErrorLine>
        ) : (
          <span id="report-hint" className="text-caption text-stone">
            עד {REPORT_MAX} תווים.
          </span>
        )}
        {sendError && <ErrorLine id="report-send-error">{sendError}</ErrorLine>}
      </form>
    </BottomSheet>
  );
}
