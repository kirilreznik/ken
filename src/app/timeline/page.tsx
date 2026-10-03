"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { EmptyState, KindTile, StatusBadge } from "@/components/ui";
import { useQuick } from "@/components/QuickActions";
import { displayStatus, signedUrl, useAppointments, useDocuments, usePregnancy, useQuestions } from "@/lib/data";
import { useSession } from "@/lib/session";
import { dateOfWeek, weekLabelOf, weekOf } from "@/lib/pregnancy";
import { fmtDay, fmtShort, fmtTime } from "@/lib/format";
import { DOC_CATEGORY_LABEL, KIND_LABEL } from "@/lib/labels";
import type { Appointment, AppointmentKind, DocumentRow } from "@/lib/types";

const TRIMESTERS = [
  { n: 1, title: "שליש ראשון", from: 0, to: 13 },
  { n: 2, title: "שליש שני", from: 14, to: 27 },
  { n: 3, title: "שליש שלישי", from: 28, to: 42 },
];
type Filter = "all" | AppointmentKind;

export default function Timeline() {
  const { space } = useSession();
  const wk = usePregnancy();
  const quick = useQuick();
  const { data: appts, isLoading } = useAppointments();
  const { data: docs } = useDocuments();
  const { data: questions } = useQuestions();
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);

  const weeks = useMemo(() => {
    if (!space) return new Map<number, { appts: Appointment[]; docs: DocumentRow[] }>();
    const m = new Map<number, { appts: Appointment[]; docs: DocumentRow[] }>();
    const slot = (w: number) => { if (!m.has(w)) m.set(w, { appts: [], docs: [] }); return m.get(w)!; };
    for (const a of appts ?? []) {
      if (filter !== "all" && a.kind !== filter) continue;
      const w = a.starts_at ? weekOf(space.due_date, new Date(a.starts_at)) : a.window_start_week;
      if (w == null) continue;
      slot(w).appts.push(a);
    }
    if (filter === "all") for (const d of docs ?? []) if (!d.appointment_id) slot(weekOf(space.due_date, d.doc_date)).docs.push(d);
    if (wk) slot(wk.week);
    for (const [, v] of m) v.appts.sort((a, b) => (a.starts_at ?? "").localeCompare(b.starts_at ?? ""));
    return m;
  }, [appts, docs, space, filter, wk]);

  if (!space || !wk) return null;
  const sortedWeeks = [...weeks.keys()].sort((a, b) => a - b);

  const openDoc = async (d: DocumentRow) => { try { window.open(await signedUrl(d), "_blank"); } catch { alert("אפשר לפתוח מסמכים רק עם חיבור"); } };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end gap-4 flex-wrap">
        <div className="flex-1 min-w-[220px]"><h1 className="font-serif text-[34px] md:text-[40px] leading-tight">ציר הזמן</h1><p className="text-ink-3 mt-1">כל ההריון, שבוע אחרי שבוע</p></div>
        <a href="#now" className="btn btn-secondary"><Icon name="timeline" />קפיצה להיום</a>
        <button className="btn btn-primary" onClick={() => quick({ kind: "appointment" })}><Icon name="plus" />הוספה</button>
      </header>
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {(["all", "doctor", "ultrasound", "blood", "genetic", "medical", "other"] as Filter[]).map((k) => (
          <button key={k} className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>{k === "all" ? "הכל" : KIND_LABEL[k]}</button>
        ))}
      </div>

      {isLoading && !appts ? null : sortedWeeks.length === 0 ? (
        <EmptyState title="ציר הזמן ריק" text="הוסיפו תורים ובדיקות, וכל אחד יקבל את המקום שלו לפי שבוע ההריון." />
      ) : TRIMESTERS.map((tri) => {
        const ws = sortedWeeks.filter((w) => w >= tri.from && w <= tri.to);
        if (!ws.length) return null;
        const current = wk.trimester === tri.n;
        return (
          <section key={tri.n} className="flex flex-col">
            <div className="flex items-center gap-3.5 py-2 mb-3">
              <h2 className="text-[15px] font-extrabold text-ink-2 whitespace-nowrap">{tri.title} · שבועות {tri.from || 1}–{Math.min(tri.to, 40)}</h2>
              {current ? <span className="badge bg-primary-100 text-primary">אתם כאן</span> : wk.trimester > tri.n ? <StatusBadge status="completed" /> : null}
              <span className="flex-1 h-px bg-[#dcd3c6]" />
            </div>
            {ws.map((w) => {
              const isNow = w === wk.week;
              const past = w < wk.week;
              const { appts: as, docs: ds } = weeks.get(w)!;
              return (
                <div key={w} id={isNow ? "now" : undefined}
                  className={`grid grid-cols-[64px_28px_minmax(0,1fr)] md:grid-cols-[112px_36px_minmax(0,1fr)] gap-x-2 scroll-mt-24 ${isNow ? "rounded-3xl bg-primary-100 -mx-3 px-3 pt-1.5 mb-5 shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--primary)_35%,white)]" : ""}`}>
                  <div className="pt-3.5">
                    <div className="text-[13px] md:text-sm font-bold" style={{ color: isNow ? "var(--primary)" : "var(--ink-3)" }}>{isNow ? "השבוע" : "שבוע"}</div>
                    <div className="font-serif text-[28px] md:text-4xl leading-none">{w}</div>
                    <div className="hidden md:block text-[13px] text-ink-3 mt-1.5">{fmtShort(dateOfWeek(space.due_date, w))}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="mt-[18px] flex-none rounded-full flex items-center justify-center"
                      style={isNow ? { width: 22, height: 22, background: "#fff", boxShadow: "0 0 0 4px var(--primary)" }
                        : past ? { width: 18, height: 18, background: "var(--primary)", color: "#fff" }
                          : { width: 18, height: 18, background: "var(--bg)", border: "2px dashed #B3A999" }}>
                      {past && !isNow && <Icon name="check" size={11} strokeWidth={3} />}
                    </span>
                    <span className="flex-1 w-0.5 bg-[#dcd3c6]" />
                  </div>
                  <div className="flex flex-col gap-3 pb-7">
                    {isNow && (
                      <div className="text-sm font-bold text-primary pt-4">היום · <span dir="ltr">{wk.label}</span></div>
                    )}
                    {as.map((a) => {
                      const st = displayStatus(a, wk.week);
                      const linkedDocs = (docs ?? []).filter((d) => d.appointment_id === a.id);
                      const linkedQs = (questions ?? []).filter((q) => q.appointment_id === a.id);
                      const future = st === "future";
                      const expanded = open === a.id;
                      return (
                        <article key={a.id} className={future ? "rounded-[20px] border-[1.5px] border-dashed border-[#d7cdbf] p-4" : "card p-4 md:p-5"}
                          style={st === "attention" ? { boxShadow: "inset 0 0 0 1.5px #E7B9A8" } : undefined}>
                          <button className="w-full text-start flex flex-col gap-2" onClick={() => setOpen(expanded ? null : a.id)} aria-expanded={expanded}>
                            <div className="flex items-center gap-2.5">
                              <span className={`flex-1 min-w-0 text-[17px] font-extrabold ${future ? "text-ink-2" : ""}`}>{a.title}</span>
                              <StatusBadge status={st} />
                            </div>
                            <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-sm text-[#5c554d]">
                              {a.starts_at ? <span>{fmtDay(a.starts_at)} · {fmtTime(a.starts_at)} · <span dir="ltr">{weekLabelOf(space.due_date, a.starts_at)}</span></span>
                                : <span>חלון: שבועות {a.window_start_week}–{a.window_end_week}</span>}
                              <span>· {KIND_LABEL[a.kind]}</span>
                              {a.provider && <span>· {a.provider}</span>}
                              {a.result_summary && <b style={{ color: "var(--st-done)" }}>· {a.result_summary}</b>}
                            </div>
                            {(linkedDocs.length > 0 || linkedQs.length > 0) && (
                              <div className="flex gap-2 flex-wrap text-[13px] font-bold">
                                {linkedDocs.length > 0 && <span className="inline-flex items-center gap-1 h-[30px] px-2.5 rounded-[9px] bg-bg"><Icon name="clip" size={15} />{linkedDocs.length} קבצים</span>}
                                {linkedQs.length > 0 && <span className="inline-flex items-center gap-1 h-[30px] px-2.5 rounded-[9px]" style={{ background: "var(--second-100)", color: "var(--second)" }}><Icon name="ask" size={15} />{linkedQs.length} שאלות</span>}
                              </div>
                            )}
                          </button>
                          {expanded && (
                            <div className="mt-4 pt-4 border-t border-line-2 flex flex-col gap-3">
                              <div className="grid md:grid-cols-2 gap-3">
                                {a.medical_notes && <div className="rounded-2xl p-3.5 border border-[#e4ebf3] bg-[#f7f9fc]"><div className="lbl" style={{ color: "#35526E" }}>הערה רפואית</div><p className="mt-1.5 leading-relaxed">{a.medical_notes}</p></div>}
                                {a.personal_note && <div className="rounded-2xl p-3.5 border border-[#f1e0cf] bg-[#fff8f1]"><div className="lbl" style={{ color: "#8A4526" }}>הערה שלנו · פרטי</div><p className="mt-1.5 leading-relaxed">{a.personal_note}</p></div>}
                              </div>
                              {linkedDocs.map((d) => (
                                <button key={d.id} onClick={() => openDoc(d)} className="flex items-center gap-3 p-3 rounded-2xl bg-surface-2 text-start">
                                  <Icon name="doc" className="text-ink-3" /><span className="flex-1"><b>{d.title}</b> <span className="text-ink-3 text-sm">· {DOC_CATEGORY_LABEL[d.category]}</span></span><Icon name="chevL" className="text-ink-3" />
                                </button>
                              ))}
                              <div className="flex gap-2 flex-wrap">
                                <button className="btn btn-secondary" onClick={() => quick({ kind: "appointment", initial: a })}><Icon name="pen" size={18} />עריכה</button>
                                <button className="btn btn-ghost" onClick={() => quick({ kind: "upload", appointmentId: a.id })}><Icon name="up" size={18} />צירוף מסמך</button>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                    {ds.map((d) => (
                      <button key={d.id} onClick={() => openDoc(d)} className="card p-3.5 flex items-center gap-3 text-start">
                        <KindTile kind="other" size={36} /><span className="flex-1 min-w-0"><b className="block truncate">{d.title}</b><span className="text-[13px] text-ink-3">{DOC_CATEGORY_LABEL[d.category]} · {fmtShort(d.doc_date)}</span></span>
                      </button>
                    ))}
                    {w === 20 && <div className="flex items-center gap-3 px-4 py-3.5 rounded-[20px] font-bold" style={{ background: "#F6EFE2", color: "#6A4F1C" }}><Icon name="flag" />חצי הדרך</div>}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
      <div className="grid grid-cols-[64px_28px_minmax(0,1fr)] md:grid-cols-[112px_36px_minmax(0,1fr)] gap-x-2">
        <div><div className="text-sm font-bold text-ink-3">שבוע</div><div className="font-serif text-4xl">40</div></div>
        <div className="flex justify-center"><span className="w-5 h-5 rounded-full bg-primary mt-2" style={{ boxShadow: "0 0 0 4px var(--primary-100)" }} /></div>
        <div className="card p-4 flex items-center gap-3 flex-wrap"><span className="font-serif text-[22px]">תאריך לידה משוער</span><span className="text-ink-3">{fmtDay(space.due_date)}</span></div>
      </div>
    </div>
  );
}
