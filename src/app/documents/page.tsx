"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { EmptyState, Sheet, WeekBadge } from "@/components/ui";
import { useQuick } from "@/components/QuickActions";
import { useAppointments, useDocuments, useSave, useSignedUrl } from "@/lib/data";
import { useSession } from "@/lib/session";
import { supabase, DOCS_BUCKET } from "@/lib/supabase";
import { cancelUpload, retryUpload, useUploads } from "@/lib/uploads";
import { useOnline } from "@/lib/online";
import { weekLabelOf, weekOf } from "@/lib/pregnancy";
import { fmtDayYear, fmtShort } from "@/lib/format";
import { DOC_CATEGORY_LABEL } from "@/lib/labels";
import type { DocCategory, DocumentRow } from "@/lib/types";

const fileTag = (d: DocumentRow) => (d.mime_type?.includes("pdf") ? "PDF" : d.mime_type?.startsWith("image/") ? "תמונה" : "קובץ");

function Thumb({ d, big }: { d: DocumentRow; big?: boolean }) {
  const isImg = d.mime_type?.startsWith("image/");
  const us = d.category === "ultrasound";
  return (
    <div className={`${big ? "h-[260px]" : "h-[132px]"} rounded-[14px] flex items-center justify-center relative overflow-hidden`}
      style={{ background: us ? "#2B2A28" : "#F3EEE6", color: us ? "#8F8A82" : "#A39B90" }}>
      {isImg ? <Icon name={us ? "wave" : "img"} size={big ? 40 : 30} /> : (
        <div className="bg-white rounded shadow-[0_2px_8px_rgba(0,0,0,.08)] flex flex-col gap-1.5" style={{ width: big ? 150 : 76, height: big ? 200 : 100, padding: big ? 18 : 12 }}>
          {[70, 100, 100, 60, 100, 80].map((w, i) => <i key={i} className="block h-1 rounded bg-[#E8E1D6]" style={{ width: `${w}%` }} />)}
        </div>
      )}
      <span className="absolute top-2 start-2 bg-white rounded-md px-1.5 py-0.5 text-[11px] font-extrabold" style={{ color: "var(--st-att)" }}>{fileTag(d)}</span>
    </div>
  );
}

export default function Documents() {
  const { space, nameOf } = useSession();
  const quick = useQuick();
  const qc = useQueryClient();
  const online = useOnline();
  const { data: docs, isLoading } = useDocuments();
  const { data: appts } = useAppointments();
  const uploads = useUploads().filter((u) => !u.media);
  const save = useSave("documents");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<DocCategory | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sel, setSel] = useState<DocumentRow | null>(null);
  const [tag, setTag] = useState("");
  const url = useSignedUrl(sel, online).data ?? null;

  const filtered = useMemo(() => {
    const s = q.trim();
    return (docs ?? []).filter((d) => (cat === "all" || d.category === cat) &&
      (!s || [d.title, d.provider, d.note, ...(d.tags ?? []), DOC_CATEGORY_LABEL[d.category]].some((x) => x?.includes(s)) ||
        (space && String(weekOf(space.due_date, d.doc_date)) === s)))
      .sort((a, b) => b.doc_date.localeCompare(a.doc_date));
  }, [docs, q, cat, space]);

  if (!space) return null;
  const counts = (docs ?? []).reduce<Record<string, number>>((m, d) => ({ ...m, [d.category]: (m[d.category] ?? 0) + 1 }), {});
  const current = sel ? (docs ?? []).find((d) => d.id === sel.id) ?? sel : null;
  const appt = current?.appointment_id ? (appts ?? []).find((a) => a.id === current.appointment_id) : null;

  const remove = async (d: DocumentRow) => {
    if (!confirm(`למחוק את ״${d.title}״?`)) return;
    setSel(null);
    save.remove(d.id);
    await supabase.storage.from(DOCS_BUCKET).remove([d.storage_path]);
  };
  const share = async () => {
    if (!current || !url) return;
    if (navigator.share) await navigator.share({ title: current.title, url }).catch(() => {});
    else { await navigator.clipboard.writeText(url); alert("הקישור הועתק (בתוקף 10 דקות)"); }
  };
  const addTag = () => {
    if (!current || !tag.trim()) return;
    save.update(current.id, { tags: [...(current.tags ?? []), tag.trim()] });
    setTag("");
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]"><h1 className="font-serif text-[34px] md:text-[40px] leading-tight">מסמכים</h1><p className="text-ink-3 mt-1">{docs?.length ?? 0} מסמכים</p></div>
        <button className="btn btn-primary" onClick={() => quick({ kind: "upload" })}><Icon name="up" />העלאת מסמך</button>
      </header>

      <div className="flex gap-2.5 items-center flex-wrap">
        <label className="flex-1 min-w-[220px] relative"><span className="sr-only">חיפוש</span>
          <input className="input ps-11" placeholder="חיפוש לפי שם, רופא, שבוע או תגית" value={q} onChange={(e) => setQ(e.target.value)} />
          <Icon name="search" className="absolute top-3.5 start-3.5 text-ink-3" />
        </label>
        <div className="seg" role="group" aria-label="תצוגה">
          <button aria-pressed={view === "grid"} aria-label="רשת" onClick={() => setView("grid")}><Icon name="grid" /></button>
          <button aria-pressed={view === "list"} aria-label="רשימה" onClick={() => setView("list")}><Icon name="list" /></button>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        <button className="chip" aria-pressed={cat === "all"} onClick={() => setCat("all")}>הכל <span className="opacity-70">{docs?.length ?? 0}</span></button>
        {(Object.keys(DOC_CATEGORY_LABEL) as DocCategory[]).map((c) => (
          <button key={c} className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{DOC_CATEGORY_LABEL[c]}{counts[c] ? <span className="opacity-70">{counts[c]}</span> : null}</button>
        ))}
      </div>

      {uploads.length > 0 && (
        <section className="card p-2 divide-y divide-line-2">
          {uploads.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-3">
              <span className="w-11 h-11 rounded-xl flex items-center justify-center flex-none" style={{ background: u.status === "failed" ? "var(--st-att-bg)" : "var(--st-pend-bg)", color: u.status === "failed" ? "var(--st-att)" : "var(--st-pend)" }}>
                <Icon name={u.status === "failed" ? "alert" : u.status === "uploading" ? "sync" : online ? "clock" : "cloudOff"} className={u.status === "uploading" ? "spin" : ""} />
              </span>
              <span className="flex-1 min-w-0"><b className="block truncate">{u.meta.title}</b>
                <span className="text-[13px] font-bold" style={{ color: u.status === "failed" ? "var(--st-att)" : "var(--st-pend)" }}>
                  {u.status === "failed" ? `ההעלאה נכשלה${u.error ? ` · ${u.error}` : ""}` : u.status === "uploading" ? "מעלה…" : online ? "בתור" : "ממתין לחיבור · יעלה אוטומטית"}
                </span></span>
              {u.status === "failed" && <button className="btn btn-secondary h-10 min-h-0 text-sm" onClick={() => retryUpload(u.id, qc)}>ניסיון חוזר</button>}
              {u.status !== "uploading" && <button className="icon-btn" aria-label="ביטול" onClick={() => cancelUpload(u.id)}><Icon name="close" /></button>}
            </div>
          ))}
        </section>
      )}

      {isLoading && !docs ? null : filtered.length === 0 ? (
        <EmptyState title={docs?.length ? "לא נמצאו מסמכים" : "עוד אין מסמכים"} text={docs?.length ? "נסו חיפוש אחר או קטגוריה אחרת" : "צלמו או העלו תוצאות, סקירות והפניות — הכל יישמר לפי שבוע."}
          action={!docs?.length ? <button className="btn btn-primary mt-2" onClick={() => quick({ kind: "upload" })}><Icon name="up" />העלאת מסמך ראשון</button> : undefined} />
      ) : view === "grid" ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
          {filtered.map((d) => (
            <button key={d.id} onClick={() => setSel(d)} className="card p-2.5 rounded-[20px] flex flex-col gap-2.5 text-start">
              <Thumb d={d} />
              <div className="px-1.5 pb-1.5 flex flex-col gap-1.5">
                <b className="text-[15px] leading-tight">{d.title}</b>
                <span className="text-[13px] text-ink-3">{fmtShort(d.doc_date)}{d.provider ? ` · ${d.provider}` : ""}</span>
                <span className="flex gap-1.5 items-center flex-wrap"><WeekBadge label={weekLabelOf(space.due_date, d.doc_date + "T12:00")} /><span className="text-xs font-bold text-ink-3">{DOC_CATEGORY_LABEL[d.category]}</span></span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="card divide-y divide-line-2">
          {filtered.map((d) => (
            <button key={d.id} onClick={() => setSel(d)} className="w-full flex items-center gap-3 px-4 py-3 text-start min-h-[72px]">
              <span className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[11px] font-extrabold flex-none" style={{ background: d.category === "ultrasound" ? "#2B2A28" : "#F3EEE6", color: d.category === "ultrasound" ? "#A39E96" : "var(--st-att)" }}>{fileTag(d)}</span>
              <span className="flex-1 min-w-0"><b className="block">{d.title}</b><span className="text-[13px] text-ink-3">{fmtShort(d.doc_date)} · {DOC_CATEGORY_LABEL[d.category]}{d.provider ? ` · ${d.provider}` : ""}</span></span>
              <WeekBadge label={weekOf(space.due_date, d.doc_date)} />
            </button>
          ))}
        </div>
      )}

      <Sheet open={!!current} onClose={() => setSel(null)} title="פרטי מסמך" wide
        footer={current ? <>
          <button className="btn btn-danger me-auto" onClick={() => remove(current)}><Icon name="trash" size={18} />מחיקה</button>
          <button className="btn btn-secondary" disabled={!url} onClick={share}><Icon name="share" size={18} />שיתוף</button>
          <a className={`btn btn-primary ${url ? "" : "pointer-events-none opacity-50"}`} href={url ?? undefined} target="_blank" rel="noreferrer" download><Icon name="down" size={18} />פתיחה / הורדה</a>
        </> : undefined}>
        {current && (
          <>
            {url && current.mime_type?.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={current.title} className="w-full max-h-[340px] object-contain rounded-[20px] bg-[#F3EEE6]" />
            ) : <Thumb d={current} big />}
            {!online && <p className="text-sm text-ink-3 flex items-center gap-2"><Icon name="cloudOff" size={16} />התצוגה המקדימה תיטען כשיחזור החיבור</p>}
            <div>
              <h3 className="text-[22px] font-extrabold">{current.title}</h3>
              <div className="flex gap-2 mt-2.5 flex-wrap items-center"><span className="badge bg-primary-100 text-primary">{DOC_CATEGORY_LABEL[current.category]}</span><WeekBadge label={weekLabelOf(space.due_date, current.doc_date + "T12:00")} />
                {current.size_bytes ? <span className="text-[13px] font-bold text-ink-3">{fileTag(current)} · {(current.size_bytes / 1048576).toFixed(1)}MB</span> : null}</div>
            </div>
            <dl className="divide-y divide-line-2 text-[15px]">
              <div className="flex justify-between py-2.5"><dt className="text-ink-3">תאריך</dt><dd className="font-bold">{fmtDayYear(current.doc_date)}</dd></div>
              {current.provider && <div className="flex justify-between py-2.5"><dt className="text-ink-3">רופא / נותן שירות</dt><dd className="font-bold">{current.provider}</dd></div>}
              <div className="flex justify-between py-2.5"><dt className="text-ink-3">הועלה ע״י</dt><dd className="font-bold">{nameOf(current.created_by) || "—"}</dd></div>
            </dl>
            {appt && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-2"><Icon name="cal" className="text-primary" /><span className="flex-1"><b className="block">{appt.title}</b><span className="text-[13px] text-ink-3">תור מקושר</span></span>
                <button className="btn btn-ghost" onClick={() => { setSel(null); quick({ kind: "appointment", initial: appt }); }}>פתיחה</button></div>
            )}
            {current.note && <div className="rounded-2xl p-3.5 border border-[#f1e0cf] bg-[#fff8f1]"><div className="lbl" style={{ color: "#8A4526" }}>הערה שלנו</div><p className="mt-1">{current.note}</p></div>}
            <div className="flex flex-col gap-2"><span className="lbl">תגיות</span>
              <div className="flex gap-1.5 flex-wrap items-center">
                {(current.tags ?? []).map((t) => (
                  <button key={t} className="inline-flex items-center gap-1 h-[30px] px-3 rounded-full bg-chip text-[13px] font-bold" onClick={() => save.update(current.id, { tags: current.tags.filter((x) => x !== t) })} aria-label={`הסרת ${t}`}>{t}<Icon name="close" size={12} /></button>
                ))}
                <form onSubmit={(e) => { e.preventDefault(); addTag(); }} className="inline-flex"><input className="h-[30px] w-28 px-3 rounded-full text-[13px] border border-dashed border-[#d6ccbe] bg-transparent" placeholder="+ תגית" value={tag} onChange={(e) => setTag(e.target.value)} /></form>
              </div>
            </div>
          </>
        )}
      </Sheet>
    </div>
  );
}
