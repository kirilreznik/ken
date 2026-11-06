import type { ReactNode } from "react";
import SkipButton from "./SkipButton";

type Act = "keep" | "love" | "skip";

const PRESS = "touch-manipulation transition-transform duration-150 motion-safe:active:scale-95";
const DISABLED = "aria-disabled:opacity-60 aria-disabled:cursor-default motion-safe:aria-disabled:active:scale-100";
// Three equal pills, each with its word: the heart used to be an unlabeled circle, and people
// had to remember from the intro that it means "אהבתי מאוד".
const PILL = `inline-flex h-13 w-full min-w-0 items-center justify-center gap-1.5 rounded-pill px-3 text-intro font-bold whitespace-nowrap max-[22.5rem]:gap-1 max-[22.5rem]:px-2 [&>svg]:max-[22.5rem]:hidden ${PRESS} ${DISABLED}`;
// "ביטול" is a small round button at the end of the row, not a row of its own under it.
const UNDO = `names-glass names-button-glass inline-flex size-11 flex-none items-center justify-center rounded-pill text-ink ${PRESS} ${DISABLED}`;

const CLASS: Record<Act, string> = {
  keep: `names-button-primary bg-ink text-surface ${PILL}`,
  love: `names-button-peach ${PILL}`,
  skip: `names-glass names-button-glass text-ink ${PILL}`,
};

const LABEL: Record<Exclude<Act, "skip">, string> = {
  keep: "שמירה לרשימה",
  love: "אהבתי מאוד",
};

function Icon({ size = 20, children }: { size?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="flex-none"
    >
      {children}
    </svg>
  );
}

type ActionBarProps = {
  onKeep: () => void;
  onLove: () => void;
  onSkip: () => void;
  /** "דילוג ולא להציג שוב" from the skip button's menu (long-press, right-click, menu key). */
  onHide: () => void;
  /** No card to decide on (end of deck, loading): the buttons stay focusable but do nothing. */
  disabled?: boolean;
  /** id of the keyboard shortcut hint (SwipeKeys). */
  describedBy?: string;
  onUndo: () => void;
  /** Something to take back; without it the button stays focusable with aria-disabled. */
  canUndo: boolean;
};

/**
 * The swipe screen's actions (FR-W10, Main.dc.html / GlassFabric.dc.html): "שמירה" ink pill
 * with a bookmark, "אהבתי" peach pill with a heart (read as "אהבתי מאוד"), "דילוג" glass pill with an x, in
 * the demo's order. In RTL "שמירה" is the right-most one; the drag direction is read from it.
 */
export default function ActionBar({ onKeep, onLove, onSkip, onHide, disabled = false, describedBy, onUndo, canUndo }: ActionBarProps) {
  const act = (fn: () => void) => () => {
    if (!disabled) fn();
  };
  const common = { type: "button" as const, "aria-disabled": disabled || undefined, "aria-describedby": describedBy };
  return (
    <div data-clarity-unmask="true" className="mx-auto grid w-full max-w-md grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 px-5 pt-2 pb-3 max-[22.5rem]:gap-1.5 max-[22.5rem]:px-3">
      <button {...common} data-act="keep" aria-label={LABEL.keep} className={CLASS.keep} onClick={act(onKeep)}>
        <Icon>
          <path d="M6 4h12v16l-6-4-6 4z" />
        </Icon>
        שמירה
      </button>
      <button {...common} data-act="love" aria-label={LABEL.love} className={CLASS.love} onClick={act(onLove)}>
        <Icon>
          <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
        </Icon>
        אהבתי
      </button>
      <SkipButton onSkip={onSkip} onHide={onHide} disabled={disabled} className={CLASS.skip} describedBy={describedBy}>
        דילוג
        <Icon>
          <path d="M6 6l12 12M18 6L6 18" />
        </Icon>
      </SkipButton>
      <button
        type="button"
        aria-label="ביטול ההחלטה האחרונה"
        title="ביטול"
        aria-describedby={describedBy}
        aria-disabled={!canUndo || undefined}
        onClick={() => {
          if (canUndo) onUndo();
        }}
        className={UNDO}
      >
        <Icon>
          <path d="M14 7h-5a5 5 0 0 0 0 10h6M14 7l-3-3M14 7l-3 3" />
        </Icon>
      </button>
    </div>
  );
}
