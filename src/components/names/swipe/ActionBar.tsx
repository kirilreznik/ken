import DecisionButtons, { DISABLED, Icon, PRESS, type Decision } from "../DecisionButtons";

// "ביטול" is a small round button at the end of the row, not a row of its own under it.
const UNDO = `names-glass names-button-glass inline-flex size-11 flex-none items-center justify-center rounded-pill text-ink ${PRESS} ${DISABLED}`;

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
 * The swipe screen's actions (FR-W10): the shared decision buttons (DecisionButtons) and the
 * round "ביטול" at the end of the row. The drag direction is read from "שמירה" (right-most in RTL).
 */
export default function ActionBar({ onKeep, onLove, onSkip, onHide, disabled = false, describedBy, onUndo, canUndo }: ActionBarProps) {
  const handlers: Record<Decision, () => void> = { keep: onKeep, love: onLove, skip: onSkip, hidden: onHide };
  return (
    <div data-clarity-unmask="true" className="mx-auto grid w-full max-w-md grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 px-5 pt-2 pb-3 max-[22.5rem]:gap-1.5 max-[22.5rem]:px-3">
      <DecisionButtons onDecide={(kind) => handlers[kind]()} disabled={disabled} describedBy={describedBy} />
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
