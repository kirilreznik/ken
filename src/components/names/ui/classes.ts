// Class names for the glass primitives (boards 2 and 8). Colors, radii and shadows come
// from nest-tokens.css; the photo vs "ללא רקע" look is switched in names.css by the
// data-names-bg="none" attribute the screen background sets on an ancestor.

export type GlassVariant = "strong" | "soft";
export type ButtonVariant = "primary" | "secondary" | "peach" | "link";
export type ButtonSize = "lg" | "md";

export function glassClass(variant: GlassVariant = "strong"): string {
  return variant === "soft" ? "names-glass-soft" : "names-glass";
}

// Pressed state: scale 0.95, never under reduced motion.
const PRESS = "transition-transform duration-150 motion-safe:active:scale-95";
const DISABLED = "disabled:opacity-60 aria-disabled:opacity-60";

const SIZE: Record<ButtonSize, string> = {
  lg: "h-14 gap-2 px-6 text-button",
  md: "h-11 gap-1.5 px-3.5 text-body font-bold",
};

const ROUND: Record<ButtonSize, string> = { lg: "size-14", md: "size-11" };

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
      return [
        "inline-flex min-h-11 items-center gap-1.5 rounded-pill px-1 text-card-title font-bold text-ink underline underline-offset-4",
        "disabled:text-stone disabled:no-underline aria-disabled:text-stone aria-disabled:no-underline",
      ].join(" ");
  }
}

export function iconButtonClass(): string {
  return ["names-glass-soft inline-flex size-11 shrink-0 items-center justify-center rounded-pill text-ink", PRESS, DISABLED].join(" ");
}

// The pill is 29 px tall like the board; ::before stretches the hit area to 45 px.
export function chipClass(selected: boolean): string {
  return [
    "relative inline-flex items-center rounded-pill px-3 py-1.5 text-caption font-bold",
    "before:absolute before:inset-x-0 before:-inset-y-2 before:content-['']",
    selected ? "border border-ink bg-ink text-surface" : "names-glass-soft names-chip-off text-ink in-data-[names-bg=none]:text-ink-soft",
    PRESS,
    DISABLED,
  ].join(" ");
}
