import type { ReactNode } from "react";

interface IconProps {
  size?: number;
  className?: string;
  children: ReactNode;
}

/**
 * The one line icon (NP-061): a 24-unit Feather/Lucide-style glyph with a 2 px stroke, round caps
 * and joins, hidden from assistive tech (the control around it carries the Hebrew label).
 */
export function Icon({ size = 20, className = "flex-none", children }: IconProps) {
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
      className={className}
    >
      {children}
    </svg>
  );
}

type GlyphProps = Omit<IconProps, "children">;

export const CLOSE_PATH = "M6 6l12 12M18 6L6 18";
export const CHECK_PATH = "M5 12.5l4.5 4.5L19 7.5";
export const HEART_PATH = "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z";
export const BOOKMARK_PATH = "M6 4h12v16l-6-4-6 4z";

export function CloseIcon(props: GlyphProps) {
  return (
    <Icon {...props}>
      <path d={CLOSE_PATH} />
    </Icon>
  );
}

/** The one check mark. */
export function CheckIcon(props: GlyphProps) {
  return (
    <Icon {...props}>
      <path d={CHECK_PATH} />
    </Icon>
  );
}

export function HeartIcon(props: GlyphProps) {
  return (
    <Icon {...props}>
      <path d={HEART_PATH} />
    </Icon>
  );
}

export function BookmarkIcon(props: GlyphProps) {
  return (
    <Icon {...props}>
      <path d={BOOKMARK_PATH} />
    </Icon>
  );
}

/**
 * A chevron drawn for RTL and mirrored in LTR: "back" points to the inline start (right in Hebrew),
 * "forward" to the inline end.
 */
export function ChevronIcon({ dir, className = "flex-none", ...props }: GlyphProps & { dir: "back" | "forward" }) {
  return (
    <Icon {...props} className={`${className} ltr:-scale-x-100`}>
      <path d={dir === "back" ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
    </Icon>
  );
}
