import type { ButtonHTMLAttributes, ReactNode } from "react";

type Act = "keep" | "love" | "skip";

const PRESS = "transition-transform duration-150 motion-safe:active:scale-95";
const DISABLED = "aria-disabled:opacity-60 aria-disabled:cursor-default motion-safe:aria-disabled:active:scale-100";
const PILL = `inline-flex h-14 items-center justify-center gap-2 rounded-pill px-5.5 text-intro font-bold ${PRESS} ${DISABLED}`;

const CLASS: Record<Act, string> = {
  keep: `names-button-primary bg-ink text-surface ${PILL}`,
  love: `names-button-peach inline-flex size-14 shrink-0 items-center justify-center rounded-pill ${PRESS} ${DISABLED}`,
  skip: `names-glass names-button-glass text-ink ${PILL}`,
};

const LABEL: Record<Act, string> = {
  keep: "שמירה לרשימה",
  love: "אהבתי מאוד",
  skip: "דילוג, לא בשבילנו",
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
  /** No card to decide on (end of deck, loading): the buttons stay focusable but do nothing. */
  disabled?: boolean;
  /** Extra props for "דילוג" (the hide menu's long-press and right-click, US-046). */
  skipProps?: ButtonHTMLAttributes<HTMLButtonElement>;
};

/**
 * The swipe screen's actions (FR-W10, Main.dc.html / GlassFabric.dc.html): "שמירה" ink pill
 * with a bookmark, "אהבתי מאוד" peach circle with a heart, "דילוג" glass pill with an x, in
 * the demo's order. In RTL "שמירה" is the right-most one; the drag direction is read from it.
 */
export default function ActionBar({ onKeep, onLove, onSkip, disabled = false, skipProps }: ActionBarProps) {
  const act = (fn: () => void) => () => {
    if (!disabled) fn();
  };
  const common = { type: "button" as const, "aria-disabled": disabled || undefined };
  return (
    <div className="flex items-center justify-center gap-5 px-5 pb-3">
      <button {...common} data-act="keep" aria-label={LABEL.keep} className={CLASS.keep} onClick={act(onKeep)}>
        <Icon>
          <path d="M6 4h12v16l-6-4-6 4z" />
        </Icon>
        שמירה
      </button>
      <button {...common} data-act="love" aria-label={LABEL.love} className={CLASS.love} onClick={act(onLove)}>
        <Icon size={22}>
          <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
        </Icon>
      </button>
      <button
        {...skipProps}
        {...common}
        data-act="skip"
        aria-label={LABEL.skip}
        className={CLASS.skip}
        onClick={act(onSkip)}
      >
        דילוג
        <Icon>
          <path d="M6 6l12 12M18 6L6 18" />
        </Icon>
      </button>
    </div>
  );
}
