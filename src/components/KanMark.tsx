export function KanMark({ size = 26, arc = "#F5EFE6", dot = "#E7C6A4" }: { size?: number; arc?: string; dot?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <path d="M8 22a12 12 0 0 0 24 0" fill="none" stroke={arc} strokeWidth={3.2} strokeLinecap="round" />
      <circle cx={20} cy={15.5} r={4.8} fill={dot} />
    </svg>
  );
}
