import type { ReactNode } from "react";
import type { Vote } from "@/lib/names/types";
import SkipButton from "./swipe/SkipButton";
import { DISABLED, PRESS } from "./ui/classes";
import { BOOKMARK_PATH, CHECK_PATH, CLOSE_PATH, HEART_PATH, Icon } from "./ui/icons";

export type Decision = Vote;
type Act = "keep" | "love" | "skip";

// Three equal pills, each with its word: the heart used to be an unlabeled circle, and people
// had to remember from the intro that it means "אהבתי מאוד".
const PILL = `inline-flex h-13 w-full min-w-0 items-center justify-center gap-1.5 rounded-pill px-3 text-intro font-bold whitespace-nowrap max-[22.5rem]:gap-1 max-[22.5rem]:px-2 [&>svg]:max-[22.5rem]:hidden ${PRESS} ${DISABLED}`;
// The current vote (sheet only): a ring and a check in place of the icon, so it isn't told by color.
const PRESSED = "ring-2 ring-ink ring-offset-2 ring-offset-surface";

export const CLASS: Record<Act, string> = {
  keep: `names-button-primary bg-ink text-surface ${PILL}`,
  love: `names-button-peach ${PILL}`,
  skip: `names-glass names-button-glass text-ink ${PILL}`,
};

export const LABEL: Record<Act, string> = {
  keep: "שמירה לרשימה",
  love: "אהבתי מאוד",
  skip: "דילוג",
};


const PATH: Record<Act, ReactNode> = {
  keep: <path d={BOOKMARK_PATH} />,
  love: <path d={HEART_PATH} />,
  skip: <path d={CLOSE_PATH} />,
};
const CHECK = <path d={CHECK_PATH} />;

/** The button a vote presses: a hidden name reads as "דילוג". */
export function pressedAct(vote: Vote | null | undefined): Act | null {
  if (!vote) return null;
  return vote === "hidden" ? "skip" : vote;
}

type DecisionButtonsProps = {
  onDecide: (kind: Decision) => void;
  /** The name's current vote. Leave it out where there is none to show (the swipe screen); `null` = none yet. */
  pressed?: Vote | null;
  /** No card to decide on (end of deck, loading): the buttons stay focusable but do nothing. */
  disabled?: boolean;
  /** id of the keyboard shortcut hint (SwipeKeys). */
  describedBy?: string;
};

/**
 * "שמירה" ink pill with a bookmark, "אהבתי" peach pill with a heart (read as "אהבתי מאוד"),
 * "דילוג" glass pill with an x and its hide menu, in the demo's order (Main.dc.html /
 * GlassFabric.dc.html). Shared by the swipe screen's action bar and the name sheet; renders the
 * three buttons only, so the parent lays them out. In RTL "שמירה" is the right-most one.
 */
export default function DecisionButtons({ onDecide, pressed, disabled = false, describedBy }: DecisionButtonsProps) {
  const on = pressedAct(pressed);
  const decide = (kind: Decision) => () => {
    if (!disabled) onDecide(kind);
  };
  const state = (act: Act) => ({
    "aria-pressed": pressed === undefined ? undefined : on === act,
    className: on === act ? `${CLASS[act]} ${PRESSED}` : CLASS[act],
  });
  const icon = (act: Act) => <Icon>{on === act ? CHECK : PATH[act]}</Icon>;
  const common = { type: "button" as const, "aria-disabled": disabled || undefined, "aria-describedby": describedBy };
  const skip = state("skip");
  return (
    <>
      <button {...common} {...state("keep")} data-act="keep" aria-label={LABEL.keep} onClick={decide("keep")}>
        {icon("keep")}
        שמירה
      </button>
      <button {...common} {...state("love")} data-act="love" aria-label={LABEL.love} onClick={decide("love")}>
        {icon("love")}
        אהבתי
      </button>
      <SkipButton
        onSkip={decide("skip")}
        onHide={decide("hidden")}
        disabled={disabled}
        className={skip.className}
        pressed={skip["aria-pressed"]}
        describedBy={describedBy}
      >
        דילוג
        {icon("skip")}
      </SkipButton>
    </>
  );
}
