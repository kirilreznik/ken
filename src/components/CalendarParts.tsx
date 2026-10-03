import type { CalEvent, EventKind } from "@/lib/events";

export const EVENT_STYLE: Record<EventKind, { bg: string; fg: string; mark: React.CSSProperties; label: string }> = {
  doctor: { bg: "var(--st-sched-bg)", fg: "#2A4560", mark: { width: 8, height: 8, borderRadius: 99, background: "var(--st-sched)" }, label: "ביקור רופא" },
  test: { bg: "var(--primary-100)", fg: "var(--ink)", mark: { width: 8, height: 8, borderRadius: 2, background: "var(--primary)" }, label: "בדיקה" },
  deadline: { bg: "var(--st-att-bg)", fg: "#7E2F1D", mark: { width: 7, height: 7, background: "#A85A36", transform: "rotate(45deg)" }, label: "דדליין" },
  task: { bg: "#FFFFFF", fg: "var(--ink-2)", mark: { width: 8, height: 8, borderRadius: 99, boxShadow: "inset 0 0 0 1.5px #3D3832" }, label: "משימה" },
  milestone: { bg: "#F6EFE2", fg: "#5E4415", mark: { width: 0, height: 0, borderInline: "4.5px solid transparent", borderBottom: "8px solid #8A6A2A" }, label: "אבן דרך" },
};

export function EventMark({ kind }: { kind: EventKind }) {
  return <span aria-hidden="true" style={{ flex: "none", display: "inline-block", ...EVENT_STYLE[kind].mark }} />;
}

export function EventChip({ e, onClick }: { e: CalEvent; onClick?: () => void }) {
  const s = EVENT_STYLE[e.kind];
  return (
    <button type="button" onClick={onClick} title={e.title}
      className="w-full flex items-center gap-1.5 rounded-[7px] px-1.5 py-1 text-[12px] font-bold leading-tight text-start overflow-hidden"
      style={{ background: s.bg, color: s.fg, boxShadow: e.kind === "task" ? "inset 0 0 0 1px #E2DACE" : undefined, opacity: e.done ? 0.6 : 1 }}>
      <EventMark kind={e.kind} />
      <span className="truncate">{e.time ? <span dir="ltr">{e.time} </span> : null}{e.title}</span>
    </button>
  );
}
