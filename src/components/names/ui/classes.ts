// Class names for the glass primitives (boards 2 and 8). Colors, radii and shadows come
// from nest-tokens.css; the photo vs "ללא רקע" look is switched in names.css by the
// data-names-bg="none" attribute the screen background sets on an ancestor.

export type GlassVariant = "strong" | "soft";
export type ButtonVariant = "primary" | "secondary" | "peach" | "link";
export type ButtonSize = "lg" | "tall" | "md";

export function glassClass(variant: GlassVariant = "strong"): string {
  return variant === "soft" ? "names-glass-soft" : "names-glass";
}

// Pressed state: scale 0.95, never under reduced motion, and never on a disabled control.
export const PRESS =
  "touch-manipulation transition-transform duration-(--nest-duration-press) motion-safe:active:scale-95 motion-safe:disabled:active:scale-100 motion-safe:aria-disabled:active:scale-100";
// Disabled buttons and chips ("not yet"): an opaque line fill with stone text (4.2:1) and no
// shadow or edge, the same on every background. Opacity let the photo through, so an ink pill
// turned brown and kept competing with the screen's real action.
export const DISABLED = [
  "disabled:border-transparent disabled:bg-line disabled:text-stone disabled:shadow-none",
  "aria-disabled:border-transparent aria-disabled:bg-line aria-disabled:text-stone aria-disabled:shadow-none",
].join(" ");
// Fields and checkboxes keep their own look and dim instead.
const FIELD_DISABLED = "disabled:opacity-60 aria-disabled:opacity-60";

const SIZE: Record<ButtonSize, string> = {
  lg: "h-14 gap-2 px-6 text-button",
  tall: "h-13 gap-2 px-6 text-card-title",
  md: "h-11 gap-1.5 px-3.5 text-body font-bold",
};

const ROUND: Record<ButtonSize, string> = { lg: "size-14", tall: "size-13", md: "size-11" };

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "lg"): string {
  switch (variant) {
    case "primary":
      return [
        "inline-flex items-center justify-center rounded-pill bg-ink text-surface",
        size === "lg" ? "names-button-primary" : "",
        SIZE[size],
        PRESS,
        DISABLED,
      ]
        .filter(Boolean)
        .join(" ");
    case "secondary":
      return ["names-glass names-button-glass inline-flex items-center justify-center rounded-pill text-ink", SIZE[size], PRESS, DISABLED].join(" ");
    case "peach":
      return ["names-button-peach inline-flex shrink-0 items-center justify-center rounded-pill", ROUND[size], PRESS, DISABLED].join(" ");
    case "link":
      return linkClass("standalone");
  }
}

// Text links (DESIGN.md "Text links"), every one at least 44 × 44 px:
// - "inline": a link inside running text; bold ink, inherits the text's size, offset 2. `trim` hides
//   part of the 44 px tap area from the line around it: "line" keeps a text line's height, "row"
//   keeps the about sheet's 32 px source rows, "none" is a link on its own row.
// - "standalone": an action on its own (Button variant="link"): text-card-title, bold ink, offset 4.
// - "quiet": a secondary action next to a title or under a list: text-person, bold ink-soft, offset 4.
export type LinkVariant = "inline" | "standalone" | "quiet";
export type LinkTrim = "line" | "row" | "none";

const LINK = "inline-flex min-h-11 min-w-11 items-center justify-center font-bold underline";
const LINK_DISABLED = "disabled:text-stone disabled:no-underline aria-disabled:text-stone aria-disabled:no-underline";
const LINK_TRIM: Record<LinkTrim, string> = { line: "-my-3", row: "-my-1.5", none: "" };

export function linkClass(variant: LinkVariant = "standalone", trim: LinkTrim = "line"): string {
  switch (variant) {
    case "inline":
      return [LINK, LINK_TRIM[trim], "text-ink underline-offset-2"].filter(Boolean).join(" ");
    case "standalone":
      return `${LINK} gap-1.5 rounded-pill px-1 text-card-title text-ink underline-offset-4 ${LINK_DISABLED}`;
    case "quiet":
      return `${LINK} rounded-pill px-1 text-person text-ink-soft underline-offset-4 ${LINK_DISABLED}`;
  }
}

export function iconButtonClass(): string {
  return ["names-glass-soft inline-flex size-11 shrink-0 items-center justify-center rounded-pill text-ink", PRESS, DISABLED].join(" ");
}

// Text fields (DESIGN.md "Inputs"): surface fill, 48 px, text-field (16 px: iOS Safari zooms into anything smaller and
// stays zoomed) with stone placeholders. The edge
// is stone on solid surfaces and ink-soft on glass, where the photo behind can be darker (≥ 3:1
// either way); read-only fields are sand. Focus is the global 2 px outline pulled onto the field's
// own edge (no floating second ring); an invalid field keeps its urgent edge while focused. "code" is the sign-in code's large centered digits;
// "multiline" is a textarea (its min height comes from the caller) and has no resize grip on touch;
// "link" is a read-only URL: text-field too (a 12 px field zoomed Safari on tap, NP-BUG-007), cut with an
// ellipsis on a phone; "העתקת הקישור" and "שליחת קישור הזמנה" carry the whole link.
export type InputKind = "line" | "multiline" | "code" | "link";

const FIELD = [
  "w-full rounded-md border border-stone in-[.names-glass]:border-ink-soft bg-surface px-3.5 text-ink placeholder:text-stone read-only:enabled:bg-sand",
  "focus-visible:-outline-offset-1 aria-invalid:border-urgent aria-invalid:focus-visible:outline-urgent",
  FIELD_DISABLED,
].join(" ");

const FIELD_KIND: Record<InputKind, string> = {
  line: "h-12 text-start text-field",
  multiline: "py-3 text-start text-field resize-y pointer-coarse:resize-none",
  code: "h-12 text-center text-title tracking-[0.4em] tabular-nums",
  link: "h-12 text-start text-field text-ellipsis",
};

export function inputClass(kind: InputKind = "line"): string {
  return `${FIELD} ${FIELD_KIND[kind]}`;
}

// Checkboxes (DESIGN.md "Checkboxes"): a drawn 24 px box with the fields' edge, stone on solid
// surfaces and ink-soft on glass (≥ 3:1), an urgent edge while invalid and unchecked. Checked is
// ink with a surface check mark (names.css .names-checkbox), so the state isn't told by color
// alone. Focus keeps the global outline 2 px off the box: on the ink box an edge outline would vanish.
export function checkboxClass(): string {
  return [
    "names-checkbox size-6 shrink-0 cursor-pointer appearance-none rounded-[calc(var(--radius-sm)/2)] border-2 border-stone in-[.names-glass]:border-ink-soft bg-surface",
    "checked:border-ink checked:bg-ink aria-invalid:not-checked:border-urgent",
    FIELD_DISABLED,
  ].join(" ");
}

// The pill is 29 px tall like the board; ::before stretches the hit area to 45 px tall and 8 px wider.
const CHIP = "inline-flex items-center justify-center rounded-pill px-3 py-1.5 text-caption font-bold";
const CHIP_OFF = "names-glass-soft names-chip-off text-ink in-data-[names-bg=none]:text-ink-soft";

// "md" is the filters sheet's chip (board 3): 44 px tall, white with a line edge when off; ::before
// adds 2 px above and below.
export type ChipSize = "sm" | "md";

const CHIP_MD = "inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-pill px-3.5 text-person font-bold";

export function chipClass(selected: boolean, size: ChipSize = "sm"): string {
  const md = size === "md";
  return [
    `relative ${md ? CHIP_MD : CHIP}`,
    md ? "before:absolute before:inset-x-0 before:-inset-y-0.5 before:content-['']" : "before:absolute before:-inset-x-1 before:-inset-y-2 before:content-['']",
    selected ? "border border-ink bg-ink text-surface" : md ? "border border-line bg-surface text-ink" : CHIP_OFF,
    PRESS,
    DISABLED,
  ].join(" ");
}

// A label in the unselected chip's look that isn't a control (the card's hint chips, board 12).
export function hintChipClass(): string {
  return `${CHIP} ${CHIP_OFF}`;
}

// Empty and end panels (DESIGN.md "Empty and end panels"): one centered column, gap-3, px-5 py-6,
// radius-xl. "glass" stands where the swipe card was (deck end, empty filter, pauses, load error)
// and scrolls inside itself when its content is taller than the room; "card" is the white card of
// an empty list (saved, matches, hidden, duel). The title role follows the surface: the deck's
// panels replace the card and take text-title, an empty list's card takes text-card-title.
export type EmptyPanelSurface = "glass" | "card";

const EMPTY_PANEL = "flex flex-col items-center gap-3 rounded-xl px-5 py-6 text-center";

const EMPTY_PANEL_SURFACE: Record<EmptyPanelSurface, string> = {
  glass: "min-h-0 flex-1 justify-center-safe overflow-y-auto [&>*]:shrink-0",
  card: "bg-surface shadow-card",
};

const EMPTY_TITLE: Record<EmptyPanelSurface, string> = {
  glass: "m-0 text-balance text-title font-bold text-ink",
  card: "m-0 text-balance text-card-title text-ink",
};

// The line under the title: what fills the list, balanced so no one-word last line.
const EMPTY_LINE = "m-0 text-balance text-person text-ink-soft";

export function emptyPanelClass(surface: EmptyPanelSurface): string {
  return `${EMPTY_PANEL} ${EMPTY_PANEL_SURFACE[surface]}`;
}

export function emptyTitleClass(surface: EmptyPanelSurface): string {
  return EMPTY_TITLE[surface];
}

export function emptyLineClass(): string {
  return EMPTY_LINE;
}

// Segmented control (NP-060): the lists tabs and the duel's source toggle. The group is a white
// pill with equal columns; the selected segment is ink.
export function segmentGroupClass(): string {
  return "grid auto-cols-fr grid-flow-col gap-1 rounded-pill border border-line bg-surface p-1";
}

export function segmentClass(selected: boolean): string {
  return `min-h-11 rounded-pill px-2 text-person font-bold ${selected ? "bg-ink text-surface" : "text-ink-soft hover:bg-sand"}`;
}

// Loading placeholders (DESIGN.md "Loading"): static bars, no shimmer, so nothing to reduce. "canvas"
// is sand on canvas and white cards; "glass" is the well inside a glass card (the deck skeleton).
export type SkeletonSurface = "canvas" | "glass";

const SKELETON: Record<SkeletonSurface, string> = { canvas: "bg-sand", glass: "names-well" };

export function skeletonClass(surface: SkeletonSurface = "canvas"): string {
  return SKELETON[surface];
}

// Tags (NP-066): the peach pill with clay-deep text. "sm" is the sex tag on the card and the
// detail header; "xs" is the "חדש" badge in a list row.
export type TagSize = "sm" | "xs";

const TAG_SIZE: Record<TagSize, string> = { sm: "px-2.5 py-1.5 text-tag", xs: "px-2 py-0.5 text-label" };

export function tagClass(size: TagSize = "sm"): string {
  return `rounded-pill bg-peach-soft text-clay-deep ${TAG_SIZE[size]}`;
}

// The 10 px clay dot (intro, match and decision eyebrows, list rows, the new-match badge).
export function dotClass(): string {
  return "size-2.5 rounded-pill bg-clay";
}
