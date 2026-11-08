const ICONS = {
  // Wi-Fi with a slash: offline.
  offline:
    "M2 8.8a15 15 0 0 1 4.2-2.6M9.5 5.2A15 15 0 0 1 22 8.8M5 12.5a10 10 0 0 1 3-1.9M13 10.3a10 10 0 0 1 6 2.2M8.5 16a5 5 0 0 1 7 0M12 20h.01M3 3l18 18",
  // Circled i: information.
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 8h.01",
  // Clock: the session ran out.
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  // Circled !: an error.
  alert: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 8v5M12 16h.01",
} as const;

interface PanelNoteProps {
  icon: keyof typeof ICONS;
  children: React.ReactNode;
  id?: string;
  role?: "alert";
}

function Icon({ icon, size, className }: { icon: keyof typeof ICONS; size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={ICONS[icon]} />
    </svg>
  );
}

/**
 * A notice inside the auth glass panel (offline, sign-ups closed, session expired, an error): a drawn icon and
 * `ink` text, no box of its own, so every in-panel message reads the same and stays ≥ 4.5:1 on the glass.
 * Errors (`icon="alert"`) are bold: the icon and the weight say "error", not red, which drops under 4.5:1 on the photo.
 */
export default function PanelNote({ icon, children, id, role }: PanelNoteProps) {
  return (
    <p id={id} role={role} className={`m-0 flex items-start gap-2 text-body text-ink ${icon === "alert" ? "font-bold" : "font-medium"}`}>
      <Icon icon={icon} size={20} className="mt-0.5 flex-none" />
      <span className="text-pretty">{children}</span>
    </p>
  );
}

/** The error mark for a caption-size error inside a line of text (a field hint, a centered hint): 16 px, inline. */
export function ErrorMark() {
  return <Icon icon="alert" size={16} className="me-1 inline-block align-[-3px]" />;
}

/** Classes for a caption-size error's words on the glass, next to `ErrorMark`. */
export const CAPTION_ERROR = "font-bold text-ink";
