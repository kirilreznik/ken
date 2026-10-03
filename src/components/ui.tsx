"use client";

import { useEffect, useRef } from "react";
import { Icon, type IconName } from "./Icon";
import { STATUS_LABEL, PRIORITY_LABEL, KIND_LABEL } from "@/lib/labels";
import type { AppointmentKind, DisplayStatus, Priority } from "@/lib/types";

const STATUS_STYLE: Record<DisplayStatus, { bg: string; fg: string; icon: IconName; ring?: string }> = {
  future: { bg: "var(--st-future-bg)", fg: "var(--st-future)", icon: "dashed" },
  need: { bg: "#fff", fg: "var(--st-need)", icon: "plusc", ring: "inset 0 0 0 1.5px var(--st-need-ring)" },
  scheduled: { bg: "var(--st-sched-bg)", fg: "var(--st-sched)", icon: "cal" },
  done: { bg: "var(--st-future-bg)", fg: "var(--ink-2)", icon: "check" },
  pending: { bg: "var(--st-pend-bg)", fg: "var(--st-pend)", icon: "clock" },
  completed: { bg: "var(--st-done-bg)", fg: "var(--st-done)", icon: "check" },
  attention: { bg: "var(--st-att-bg)", fg: "var(--st-att)", icon: "alert" },
};

export function StatusBadge({ status, label }: { status: DisplayStatus; label?: string }) {
  const s = STATUS_STYLE[status];
  return (
    <span className="badge" style={{ background: s.bg, color: s.fg, boxShadow: s.ring }}>
      <Icon name={s.icon} size={14} strokeWidth={2.1} />
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}

export function WeekBadge({ label, current }: { label: string | number; current?: boolean }) {
  return (
    <span className="wk" style={current ? { background: "var(--primary)", color: "#fff" } : undefined}>
      שבוע <b dir="ltr" style={{ fontWeight: 800 }}>{label}</b>
    </span>
  );
}

const PRI_COLOR: Record<Priority, string> = { urgent: "var(--st-att)", high: "var(--st-pend)", normal: "var(--ink-3)", low: "var(--ink-3)" };
const PRI_ICON: Record<Priority, IconName> = { urgent: "bars3", high: "bars2", normal: "bars1", low: "bars1" };
export function PriorityTag({ p }: { p: Priority }) {
  return (
    <span className="inline-flex items-center gap-1 text-[13px] font-bold" style={{ color: PRI_COLOR[p] }}>
      <Icon name={PRI_ICON[p]} size={16} />
      {PRIORITY_LABEL[p]}
    </span>
  );
}

export const KIND_ICON: Record<AppointmentKind, IconName> = {
  doctor: "steth", ultrasound: "wave", blood: "drop", genetic: "dna", medical: "test", other: "cal",
};
const KIND_TINT: Record<AppointmentKind, [string, string]> = {
  doctor: ["var(--st-sched-bg)", "var(--st-sched)"],
  ultrasound: ["var(--primary-100)", "var(--primary)"],
  blood: ["var(--st-pend-bg)", "var(--st-pend)"],
  genetic: ["var(--primary-100)", "var(--primary)"],
  medical: ["var(--chip)", "var(--ink-2)"],
  other: ["var(--chip)", "var(--ink-2)"],
};
export function KindTile({ kind, size = 48 }: { kind: AppointmentKind; size?: number }) {
  const [bg, fg] = KIND_TINT[kind];
  return (
    <span title={KIND_LABEL[kind]} className="flex items-center justify-center flex-none"
      style={{ width: size, height: size, borderRadius: size * 0.29, background: bg, color: fg }}>
      <Icon name={KIND_ICON[kind]} size={size / 2} />
    </span>
  );
}

/** Ring fills counter-clockwise (RTL reading direction). */
export function ProgressRing({ percent, size = 140, stroke = 10, track = "var(--line)", color = "var(--primary)", children }: {
  percent: number; size?: number; stroke?: number; track?: string; color?: string; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex-none" style={{ width: size, height: size }} role="img" aria-label={`${percent}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "scaleX(-1) rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${(c * percent) / 100} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export function PregnancyBar({ percent, onDark }: { percent: number; onDark?: boolean }) {
  return (
    <div>
      <div className="relative h-2.5 rounded-full flex" style={{ background: onDark ? "rgba(255,255,255,.18)" : "var(--line)" }}>
        <div className="rounded-full" style={{ width: `${percent}%`, background: onDark ? "var(--accent)" : "var(--primary)" }} />
        <span className="absolute -top-1 w-[3px] h-[18px]" style={{ insetInlineStart: "32.5%", background: onDark ? "var(--primary)" : "var(--surface)" }} />
        <span className="absolute -top-1 w-[3px] h-[18px]" style={{ insetInlineStart: "67.5%", background: onDark ? "var(--primary)" : "var(--surface)" }} />
        {!onDark && (
          <span className="absolute w-[22px] h-[22px] rounded-full bg-white" style={{ top: -6, insetInlineStart: `calc(${percent}% - 11px)`, boxShadow: "0 0 0 3px var(--primary)" }} />
        )}
      </div>
      <div className={`flex text-[13px] font-semibold mt-3 ${onDark ? "text-on-primary-2" : "text-ink-3"}`}>
        <span style={{ width: "32.5%" }}>שליש ראשון</span>
        <span style={{ width: "35%" }}>שליש שני</span>
        <span>שליש שלישי</span>
      </div>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="card p-9 flex flex-col items-center text-center gap-3">
      <svg viewBox="0 0 120 80" width="110" height="74" aria-hidden="true">
        <path d="M20 52a40 40 0 0 0 80 0" fill="none" stroke="#D9CDBC" strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="36" r="10" fill="var(--sand)" />
      </svg>
      <div className="text-lg font-extrabold">{title}</div>
      {text && <div className="text-ink-3 text-[15px] leading-relaxed max-w-xs">{text}</div>}
      {action}
    </div>
  );
}

export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card p-5 flex flex-col gap-3" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => <div key={i} className="skel h-4" style={{ width: `${90 - i * 15}%` }} />)}
    </div>
  );
}

export function Avatar({ name, tone = 0, size = 28 }: { name: string; tone?: number; size?: number }) {
  const tones = [["#F3E2D6", "#8A4B2C"], ["#DCE6EE", "#35526E"]];
  const [bg, fg] = tones[tone % 2];
  return (
    <span title={name} className="inline-flex items-center justify-center rounded-full font-extrabold flex-none"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.46 }}>
      {name.trim().charAt(0) || "?"}
    </span>
  );
}

/** Modal on desktop, bottom sheet on mobile. */
export function Sheet({ open, onClose, title, children, footer, wide }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} onCancel={onClose} aria-label={title}
      className="m-0 p-0 bg-transparent max-w-none max-h-none w-full h-full backdrop:bg-[rgba(35,32,28,.36)] open:flex items-end md:items-center justify-center"
      onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      <div dir="rtl" className={`bg-white w-full ${wide ? "md:max-w-2xl" : "md:max-w-lg"} rounded-t-[28px] md:rounded-[28px] max-h-[92dvh] flex flex-col shadow-2xl`}>
        <span className="md:hidden self-center mt-2.5 w-10 h-[5px] rounded-full bg-[#ddd4c7]" />
        <div className="flex items-center justify-between px-5 pt-2 md:pt-5">
          <h2 className="text-[21px] font-extrabold">{title}</h2>
          <button type="button" className="icon-btn" aria-label="סגירה" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="px-5 py-3 overflow-y-auto flex flex-col gap-4">{children}</div>
        {footer && <div className="px-5 pt-2 pb-5 pb-safe flex gap-2.5 justify-end">{footer}</div>}
      </div>
    </dialog>
  );
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold">{label}</span>
      {children}
      {error ? (
        <span className="text-[13px] font-semibold flex items-center gap-1.5" style={{ color: "var(--st-att)" }}><Icon name="alert" size={16} />{error}</span>
      ) : hint ? <span className="text-[13px] text-ink-3">{hint}</span> : null}
    </label>
  );
}
