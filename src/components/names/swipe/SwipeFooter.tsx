type SwipeFooterProps = {
  /** The last decision ("השם זיו נשמר", "דילוג על יעל"), from src/lib/names/a11y.ts. */
  status: string;
  /** The name now on top, read after the status. */
  next?: string | null;
  /** "אין חיבור · 3 בחירות ממתינות לסנכרון" (FR-W29), or null. */
  sync?: string | null;
};

/**
 * Under the actions (FR-W10): the last decision as a polite live region for screen readers
 * (on screen the card flying off and the saved count say it), and the sync line (offline,
 * queued votes) in its own live region. The sync line floats just above the action bar (its
 * parent in SwipeScreen is `relative`), so its arrival and departure move nothing (CLS 0).
 * "ביטול" lives in the action row. Both regions are always rendered so the first message is announced.
 */
export default function SwipeFooter({ status, next = null, sync }: SwipeFooterProps) {
  return (
    <>
      <span role="status" aria-live="polite" className="sr-only">
        {status}
        {status && next ? `. השם הבא: ${next}` : null}
      </span>
      <p
        role="status"
        aria-live="polite"
        data-sync-status
        className={[
          "pointer-events-none absolute inset-x-0 bottom-full mx-auto flex w-fit max-w-[calc(100%-2.5rem)] items-center justify-center gap-1.5 rounded-pill text-caption text-ink",
          "names-glass-soft bg-surface px-3 py-1 empty:border-0 empty:p-0",
        ].join(" ")}
      >
        {sync ? (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="flex-none"
            >
              <path d="M2 8.8a15 15 0 0 1 4.2-2.6M9.5 5.2A15 15 0 0 1 22 8.8M5 12.5a10 10 0 0 1 3-1.9M13 10.3a10 10 0 0 1 6 2.2M8.5 16a5 5 0 0 1 7 0M12 20h.01M3 3l18 18" />
            </svg>
            {sync}
          </>
        ) : null}
      </p>
    </>
  );
}
