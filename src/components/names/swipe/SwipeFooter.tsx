type SwipeFooterProps = {
  canUndo: boolean;
  onUndo: () => void;
  /** The last decision ("זיו נשמר", "דילגת על יעל", "בוטל: נועם"), from src/lib/names/a11y.ts. */
  status: string;
  /** id of the keyboard shortcut hint (SwipeKeys). */
  describedBy?: string;
};

/**
 * The swipe screen's footer (FR-W10): "ביטול" at the start and a polite live status at the
 * end. Glass-soft pills on the photos (GlassFabric.dc.html), plain text on "ללא רקע"
 * (Main.dc.html; utilities beat the glass rules, which sit in the components layer). With
 * nothing to undo the button stays focusable with aria-disabled. The status region is
 * always rendered (an empty one has no pill) so the first message is announced.
 */
export default function SwipeFooter({ canUndo, onUndo, status, describedBy }: SwipeFooterProps) {
  return (
    <div className="flex items-center justify-between gap-2.5 px-7 pb-4">
      <button
        type="button"
        aria-label="ביטול ההחלטה האחרונה"
        aria-describedby={describedBy}
        aria-disabled={!canUndo || undefined}
        onClick={() => {
          if (canUndo) onUndo();
        }}
        className={[
          "names-glass-soft inline-flex min-h-11 flex-none items-center gap-1.5 rounded-pill px-3.5 text-person font-bold text-ink",
          "in-data-[names-bg=none]:border-transparent in-data-[names-bg=none]:bg-transparent in-data-[names-bg=none]:px-1 in-data-[names-bg=none]:text-ink-soft",
          "transition-transform duration-150 motion-safe:active:scale-95",
          "aria-disabled:cursor-default aria-disabled:opacity-60 motion-safe:aria-disabled:active:scale-100",
        ].join(" ")}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="flex-none"
        >
          <path d="M14 7h-5a5 5 0 0 0 0 10h6M14 7l-3-3M14 7l-3 3" />
        </svg>
        ביטול
      </button>
      <span
        role="status"
        aria-live="polite"
        className={[
          "names-glass-soft max-w-[62%] truncate rounded-pill text-center px-3 py-1.5 text-caption text-ink",
          "in-data-[names-bg=none]:border-transparent in-data-[names-bg=none]:bg-transparent in-data-[names-bg=none]:p-0 in-data-[names-bg=none]:text-stone",
          "empty:border-0 empty:bg-transparent empty:p-0",
        ].join(" ")}
      >
        {status}
      </span>
    </div>
  );
}
