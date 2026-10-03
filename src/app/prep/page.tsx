"use client";

import { useMemo, useState } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { EmptyState, ProgressRing } from "@/components/ui";
import { PrepSheet } from "@/components/PrepSheet";
import { nowSort, useMediaUrls, usePrepItems, useSave } from "@/lib/data";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { useUploads, pendingMediaFor } from "@/lib/uploads";
import { PREP_DEFAULTS } from "@/lib/prepDefaults";
import { PREP_CATEGORY_LABEL, PREP_STATUS_LABEL, PREP_STATUS_ORDER, isPrepReady } from "@/lib/labels";
import type { PrepCategory, PrepItem, PrepStatus } from "@/lib/types";

const CAT_ICON: Record<PrepCategory, IconName> = {
  stroller: "baby", car_seat: "users", sleep: "home", clothes: "heart", bath: "drop", feeding: "drop", nursery: "home", birth_bag: "bag", misc: "grid",
};
const STATUS_STYLE: Record<PrepStatus, React.CSSProperties> = {
  need: { background: "#fff", color: "var(--ink-2)", boxShadow: "inset 0 0 0 1.5px #D6CCBE" },
  reviewing: { background: "var(--st-pend-bg)", color: "var(--st-pend)" },
  chosen: { background: "var(--st-sched-bg)", color: "var(--st-sched)" },
  bought: { background: "var(--st-done-bg)", color: "var(--st-done)" },
  not_needed: { background: "var(--chip)", color: "var(--ink-3)", textDecoration: "line-through" },
};
const BAR: Record<PrepStatus, string> = { bought: "var(--primary)", chosen: "var(--st-sched)", reviewing: "#D9B36A", need: "#E6DCCD", not_needed: "#F1ECE4" };
const nis = (n: number) => `₪${Math.round(n).toLocaleString("he-IL")}`;

function StatusSelect({ item, onChange }: { item: PrepItem; onChange: (s: PrepStatus) => void }) {
  return (
    <label className="relative inline-flex">
      <span className="sr-only">סטטוס</span>
      <select value={item.status} onChange={(e) => onChange(e.target.value as PrepStatus)}
        className="appearance-none h-8 ps-3 pe-7 rounded-full text-[13px] font-bold cursor-pointer" style={STATUS_STYLE[item.status]}>
        {PREP_STATUS_ORDER.map((s) => <option key={s} value={s}>{PREP_STATUS_LABEL[s]}</option>)}
      </select>
      <Icon name="chevD" size={14} className="absolute end-2 top-[9px] pointer-events-none opacity-60" />
    </label>
  );
}

function PrepCard({ i, urls, pending, onEdit, onStatus }: { i: PrepItem; urls: Record<string, string>; pending: boolean; onEdit: (i: PrepItem) => void; onStatus: (i: PrepItem, s: PrepStatus) => void }) {
    const src = i.image_path ? urls[i.image_path] : undefined;
    return (
      <article className="bg-white border border-[#EDE4D7] rounded-[24px] p-3 flex flex-col gap-3" style={i.status === "chosen" ? { boxShadow: "0 0 0 2px var(--st-sched)" } : undefined}>
        <button className="h-[150px] rounded-2xl bg-[#F1E8DC] flex items-center justify-center text-[#A8957C] overflow-hidden relative" onClick={() => onEdit(i)} aria-label={`עריכת ${i.title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : <Icon name={pending ? "sync" : CAT_ICON[i.category]} size={40} strokeWidth={1.2} className={pending ? "spin" : ""} />}
        </button>
        <div className="px-1.5 flex flex-col gap-2">
          <div className="flex items-start gap-2"><h3 className="text-[17px] font-extrabold flex-1">{i.title}{i.quantity > 1 ? ` × ${i.quantity}` : ""}</h3><StatusSelect item={i} onChange={(s) => onStatus(i, s)} /></div>
          {i.price != null && <div className="text-xl font-extrabold" style={i.status === "not_needed" ? { color: "#8A8177" } : undefined}>{nis(i.price * (i.quantity || 1))}</div>}
          {i.recommended_by && <div className="flex items-center gap-2 text-[13px] font-semibold text-[#5C554D]"><Icon name="users" size={15} className="text-ink-3" />{i.recommended_by}</div>}
          {i.url && <a href={i.url} target="_blank" rel="noreferrer noopener" className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "#8A4526" }}><Icon name="link" size={15} />קישור למוצר</a>}
          {i.notes && <p className="text-sm leading-normal text-[#4A3F33] bg-[#FFF8F1] rounded-xl px-3 py-2.5">{i.notes}</p>}
        </div>
      </article>
    );
  }

function PrepRow({ i, urls, onEdit, onStatus }: { i: PrepItem; urls: Record<string, string>; onEdit: (i: PrepItem) => void; onStatus: (i: PrepItem, s: PrepStatus) => void }) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3 border-b border-[#F3ECE2] last:border-0 min-h-[68px]">
      <button className="w-[52px] h-[52px] rounded-[14px] bg-[#F1E8DC] flex items-center justify-center text-[#A8957C] overflow-hidden flex-none" onClick={() => onEdit(i)} aria-label={`עריכת ${i.title}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {i.image_path && urls[i.image_path] ? <img src={urls[i.image_path]} alt="" className="w-full h-full object-cover" /> : <Icon name={CAT_ICON[i.category]} />}
      </button>
      <button className="flex-1 min-w-0 text-start" onClick={() => onEdit(i)}>
        <b className={`block ${i.status === "not_needed" ? "line-through text-ink-3" : ""}`}>{i.title}{i.quantity > 1 ? ` × ${i.quantity}` : ""}</b>
        <span className="text-[13px] text-ink-3 font-semibold">{[i.price != null ? nis(i.price * (i.quantity || 1)) : null, i.recommended_by].filter(Boolean).join(" · ") || " "}</span>
      </button>
      <StatusSelect item={i} onChange={(s) => onStatus(i, s)} />
    </div>
  );
}

export default function Prep() {
  const { space, user, refresh } = useSession();
  const { data: items, isLoading } = usePrepItems();
  const save = useSave("prep_items");
  const uploads = useUploads();
  const [cat, setCat] = useState<PrepCategory | "all">("all");
  const [hideDone, setHideDone] = useState(false);
  const [edit, setEdit] = useState<Partial<PrepItem> | null>(null);
  const [budgetEdit, setBudgetEdit] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const list = useMemo(() => items ?? [], [items]);
  const urls = useMediaUrls(list.map((i) => i.image_path ?? "")).data ?? {};

  const stats = useMemo(() => {
    const counted = list.filter((i) => i.status !== "not_needed");
    const ready = counted.filter((i) => isPrepReady(i.status)).length;
    const by = Object.fromEntries(PREP_STATUS_ORDER.map((s) => [s, list.filter((i) => i.status === s).length])) as Record<PrepStatus, number>;
    const spent = list.filter((i) => isPrepReady(i.status)).reduce((s, i) => s + (i.price ?? 0) * (i.quantity || 1), 0);
    const perCat = Object.fromEntries((Object.keys(PREP_CATEGORY_LABEL) as PrepCategory[]).map((c) => {
      const cs = list.filter((i) => i.category === c && i.status !== "not_needed");
      return [c, { total: cs.length, ready: cs.filter((i) => isPrepReady(i.status)).length }];
    })) as Record<PrepCategory, { total: number; ready: number }>;
    const deciding = list.filter((i) => i.status === "reviewing");
    return { total: counted.length, ready, by, spent, perCat, deciding };
  }, [list]);

  if (!space || !user) return null;

  const setStatus = (i: PrepItem, s: PrepStatus) => save.update(i.id, { status: s, updated_at: new Date().toISOString() });
  const seed = async () => {
    setSeeding(true);
    const base = nowSort();
    PREP_DEFAULTS.forEach(([c, title, qty], n) => save.insert({ title, category: c, status: "need", quantity: qty ?? 1, price: null, url: null, notes: null,
      recommended_by: null, image_path: null, compare_group: null, sort: base + n, created_by: user.id }));
    setSeeding(false);
  };
  const saveBudget = async (v: string) => {
    const n = Number(v.replace(/[^\d.]/g, "")) || null;
    await supabase.from("spaces").update({ prep_budget: n }).eq("id", space.id);
    setBudgetEdit(false);
    refresh();
  };

  const shown = list.filter((i) => (cat === "all" || i.category === cat) && (!hideDone || !isPrepReady(i.status)))
    .sort((a, b) => a.sort - b.sort);
  const cats = (Object.keys(PREP_CATEGORY_LABEL) as PrepCategory[]).filter((c) => cat === "all" ? shown.some((i) => i.category === c) : c === cat);
  const pct = stats.total ? Math.round((stats.ready / stats.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 -mx-4 px-4 md:-mx-10 md:px-10 -mt-2 pt-2 min-h-full" style={{ background: "#F7F2EA" }}>
      {list.length === 0 && !isLoading ? (
        <div className="flex flex-col gap-5 pt-2">
          <h1 className="font-serif text-[34px] md:text-[44px]">הכנות לתינוק</h1>
          <EmptyState title="מתחילים לתכנן" text="רשימה מוכנה של כ־35 פריטים — עגלה, שינה, בגדים, תיק לידה ועוד. אפשר למחוק, לשנות ולהוסיף."
            action={<div className="flex gap-2 mt-2 flex-wrap justify-center"><button className="btn btn-primary" disabled={seeding} onClick={seed}>התחלה עם רשימה מוכנה</button><button className="btn btn-secondary" onClick={() => setEdit({})}>פריט ראשון ידני</button></div>} />
        </div>
      ) : (
        <>
          <section className="flex gap-6 items-end flex-wrap pt-2">
            <div className="flex-1 min-w-[280px] flex flex-col gap-3.5">
              <div className="lbl" style={{ color: "#8A4526" }}>הכנות לתינוק</div>
              <div className="flex items-center gap-4">
                <div className="md:hidden"><ProgressRing percent={pct} size={76} stroke={7} color="var(--second)"><b className="text-[17px]">{pct}%</b></ProgressRing></div>
                <h1 className="font-serif text-[32px] md:text-[52px] leading-[1.05]">{stats.ready} מתוך {stats.total}<br /><span className="text-[#8C7356]">פריטים מוכנים</span></h1>
              </div>
              <div className="flex h-3.5 rounded-full overflow-hidden gap-[3px] max-w-[620px]" role="img"
                aria-label={PREP_STATUS_ORDER.map((s) => `${PREP_STATUS_LABEL[s]} ${stats.by[s]}`).join(", ")}>
                {(["bought", "chosen", "reviewing", "need", "not_needed"] as PrepStatus[]).map((s) => stats.by[s] ? <span key={s} style={{ flex: stats.by[s], background: BAR[s] }} /> : null)}
              </div>
              <div className="flex gap-4 flex-wrap text-sm font-bold text-[#4A443D]">
                {(["bought", "chosen", "reviewing", "need", "not_needed"] as PrepStatus[]).map((s) => (
                  <span key={s} className="inline-flex gap-1.5 items-center"><i className="w-2.5 h-2.5 rounded-[3px]" style={{ background: BAR[s], boxShadow: s === "need" || s === "not_needed" ? "inset 0 0 0 1px #CDBFAE" : undefined }} />{PREP_STATUS_LABEL[s]} {stats.by[s]}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="bg-white border border-[#EDE4D7] rounded-[20px] px-5 py-4 min-w-[180px]">
                <div className="lbl">תקציב</div>
                <div className="text-2xl font-extrabold mt-1">{nis(stats.spent)}</div>
                {budgetEdit ? (
                  <form className="flex gap-1.5 mt-1" onSubmit={(e) => { e.preventDefault(); saveBudget(String(new FormData(e.currentTarget).get("b") ?? "")); }}>
                    <input name="b" autoFocus defaultValue={space.prep_budget ?? ""} inputMode="decimal" className="w-24 h-8 rounded-lg border border-[#ddd4c7] px-2 text-sm" aria-label="תקציב" />
                    <button className="text-sm font-bold text-primary">שמירה</button>
                  </form>
                ) : (
                  <button className="text-[13px] font-semibold text-ink-3 underline-offset-2 hover:underline" onClick={() => setBudgetEdit(true)}>
                    {space.prep_budget ? `מתוך ${nis(space.prep_budget)} שתכננו` : "הגדרת תקציב"}
                  </button>
                )}
              </div>
              {stats.deciding.length > 0 && (
                <div className="bg-white border border-[#EDE4D7] rounded-[20px] px-5 py-4 min-w-[180px]"><div className="lbl">ההחלטה הבאה</div>
                  <div className="text-lg font-extrabold mt-1">{PREP_CATEGORY_LABEL[stats.deciding[0].category]}</div>
                  <div className="text-[13px] font-semibold text-ink-3">{stats.deciding.filter((d) => d.category === stats.deciding[0].category).length} אפשרויות בבדיקה</div></div>
              )}
            </div>
          </section>

          <div className="flex gap-2.5 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-1">
            <button onClick={() => setCat("all")} aria-pressed={cat === "all"} className="flex-none w-[96px] rounded-[20px] bg-white border border-[#EDE4D7] p-3.5 flex flex-col gap-2 text-start" style={cat === "all" ? { boxShadow: "0 0 0 2px var(--ink)" } : undefined}>
              <Icon name="grid" size={24} className="text-[#8C7356]" /><b className="text-sm">הכל</b><small className="text-xs font-bold text-ink-3">{stats.ready} / {stats.total}</small>
            </button>
            {(Object.keys(PREP_CATEGORY_LABEL) as PrepCategory[]).filter((c) => stats.perCat[c].total > 0).map((c) => {
              const p = stats.perCat[c];
              return (
                <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className="flex-none w-[118px] rounded-[20px] bg-white border border-[#EDE4D7] p-3.5 flex flex-col gap-2 text-start" style={cat === c ? { boxShadow: "0 0 0 2px var(--ink)" } : undefined}>
                  <Icon name={CAT_ICON[c]} size={24} className="text-[#8C7356]" /><b className="text-sm">{PREP_CATEGORY_LABEL[c]}</b>
                  <small className="text-xs font-bold text-ink-3">{p.ready} / {p.total}</small>
                  <span className="h-1 rounded-full bg-[#EFE7DB] flex"><span className="rounded-full" style={{ width: `${p.total ? (p.ready / p.total) * 100 : 0}%`, background: "var(--second)" }} /></span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-sm font-semibold min-h-11"><input type="checkbox" className="switch" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />להסתיר מה שמוכן</label>
            <button className="btn btn-primary ms-auto" onClick={() => setEdit({ category: cat === "all" ? "misc" : cat })}><Icon name="plus" />פריט</button>
          </div>

          {cats.map((c) => {
            const its = shown.filter((i) => i.category === c);
            const groups = [...new Set(its.map((i) => i.compare_group).filter(Boolean))] as string[];
            const loose = its.filter((i) => !i.compare_group);
            return (
              <section key={c} className="flex flex-col gap-3.5">
                <div className="flex items-baseline gap-3"><h2 className="font-serif text-[26px] md:text-[30px]">{PREP_CATEGORY_LABEL[c]}</h2>
                  <span className="text-ink-3">{stats.perCat[c].ready} מתוך {stats.perCat[c].total} מוכנים</span></div>
                {groups.map((g) => (
                  <div key={g} className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-ink-3">משווים: {g}</span>
                    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))]">{its.filter((i) => i.compare_group === g).map((i) => <PrepCard key={i.id} i={i} urls={urls} pending={pendingMediaFor(uploads, i.id).length > 0} onEdit={setEdit} onStatus={setStatus} />)}</div>
                  </div>
                ))}
                {loose.length > 0 && <div className="bg-white border border-[#EDE4D7] rounded-[24px] overflow-hidden">{loose.map((i) => <PrepRow key={i.id} i={i} urls={urls} onEdit={setEdit} onStatus={setStatus} />)}</div>}
              </section>
            );
          })}
        </>
      )}
      <PrepSheet open={!!edit} onClose={() => setEdit(null)} initial={edit} />
    </div>
  );
}
