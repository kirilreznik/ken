"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/ui";
import { JournalForm, JournalSheet } from "@/components/JournalSheet";
import { useJournal, useMediaUrls } from "@/lib/data";
import { useSession } from "@/lib/session";
import { useUploads, pendingMediaFor } from "@/lib/uploads";
import { weekOf, weekInfo } from "@/lib/pregnancy";
import { fmtDay, fmtShort } from "@/lib/format";
import { JOURNAL_KIND_LABEL } from "@/lib/labels";
import type { JournalEntry } from "@/lib/types";

const UPCOMING = ["תנועה ראשונה", "הכנת חדר התינוק", "בחירת שם", "צילומי הריון", "סיפרנו למשפחה", "הבעיטה הראשונה שעידו הרגיש"];

export default function Journal() {
  const { space, user, members, nameOf } = useSession();
  const { data: entries } = useJournal();
  const uploads = useUploads();
  const [edit, setEdit] = useState<Partial<JournalEntry> | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const list = useMemo(() => (entries ?? []).slice().sort((a, b) => b.entry_date.localeCompare(a.entry_date) || (b.created_at ?? "").localeCompare(a.created_at ?? "")), [entries]);
  const urls = useMediaUrls(list.filter((e) => !e.hidden || revealed.has(e.id)).flatMap((e) => e.photos)).data ?? {};
  if (!space || !user) return null;
  const wk = weekInfo(space.due_date);
  const byWeek = new Map<number, JournalEntry[]>();
  for (const e of list) { const w = weekOf(space.due_date, e.entry_date); byWeek.set(w, [...(byWeek.get(w) ?? []), e]); }
  const milestonesDone = new Set(list.filter((e) => e.kind === "milestone").map((e) => e.title));
  const photoCount = list.reduce((n, e) => n + e.photos.length, 0);
  const pages = Math.max(1, Math.ceil(list.filter((e) => e.include_in_book && !e.hidden).length * 0.8) + 2);

  return (
    <div className="flex gap-10 flex-wrap items-start -mx-4 px-4 md:-mx-10 md:px-10 -mt-2 pt-2 min-h-full" style={{ background: "#F7F2EA" }}>
      <div className="flex-[999_1_520px] min-w-0 flex flex-col gap-7 max-w-[820px]">
        <header className="flex flex-col gap-2 pt-2">
          <div className="lbl flex items-center gap-2"><Icon name="lock" size={16} />פרטי · רק לשניכם</div>
          <h1 className="font-serif text-[38px] md:text-[52px] leading-[1.05]">היומן שלנו</h1>
          <p className="text-ink-3 text-[17px]">רגעים, מחשבות ותמונות — מופרדים מהמידע הרפואי, ומחוברים לאותו ציר זמן.</p>
        </header>

        <section className="bg-white border border-[#EDE4D7] rounded-[26px] p-4 md:p-5 shadow-[0_10px_30px_-18px_rgba(74,52,30,.25)]">
          <JournalForm inline onClose={() => {}} />
        </section>

        {list.length === 0 && <p className="text-ink-3 text-center py-6">הרשומה הראשונה מחכה לכם. גם משפט אחד ביום שווה זיכרון.</p>}

        <div className="flex flex-col">
          {[...byWeek.entries()].map(([w, es]) => (
            <div key={w} className="grid grid-cols-[64px_minmax(0,1fr)] md:grid-cols-[120px_minmax(0,1fr)] gap-4 md:gap-7">
              <div className="pt-2.5"><span className="text-[13px] font-bold text-ink-3">שבוע</span><b className="block font-serif text-[34px] md:text-[44px] leading-none font-medium text-[#8C7356]">{w}</b>
                {w === wk.week && <span className="text-[13px] font-bold text-ink-3">השבוע</span>}</div>
              <div className="flex flex-col">
                {es.map((e) => {
                  const pend = pendingMediaFor(uploads, e.id).length;
                  const locked = e.hidden && !revealed.has(e.id);
                  if (locked) {
                    return (
                      <article key={e.id} className="rounded-[26px] p-5 mb-6 flex items-center gap-4 text-[#F5EFE6]" style={{ background: "var(--primary)" }}>
                        <span className="w-14 h-14 rounded-[18px] bg-white/10 flex items-center justify-center flex-none"><Icon name="lock" size={26} /></span>
                        <div className="flex-1"><div className="font-serif text-2xl">{e.title || "רשומה מוסתרת"}</div><div className="text-sm text-on-primary-2">מוסתר — לא מופיע במסך הבית או בהתראות</div></div>
                        <button className="btn bg-[#f5efe6] text-ink" onClick={() => setRevealed(new Set(revealed).add(e.id))}>הצגה</button>
                      </article>
                    );
                  }
                  return (
                    <article key={e.id} className="bg-white border border-[#EDE4D7] rounded-[26px] p-5 md:p-6 mb-6 flex flex-col gap-3.5">
                      {e.photos.length > 0 && (
                        <div className={`grid gap-2 ${e.photos.length === 1 ? "grid-cols-1" : "grid-cols-[2fr_1fr]"}`}>
                          {e.photos.slice(0, 3).map((p, i) => (
                            <a key={p} href={urls[p]} target="_blank" rel="noreferrer" className={`rounded-[18px] overflow-hidden bg-[#EBDFCF] block ${e.photos.length > 1 && i === 0 ? "row-span-2 h-[248px]" : e.photos.length === 1 ? "h-[300px]" : "h-[120px]"}`}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {urls[p] && <img src={urls[p]} alt="" className="w-full h-full object-cover" />}
                            </a>
                          ))}
                        </div>
                      )}
                      {pend > 0 && <span className="text-[13px] font-bold flex items-center gap-1.5" style={{ color: "var(--st-pend)" }}><Icon name="sync" size={15} className="spin" />{pend} תמונות בהעלאה</span>}
                      {e.kind !== "note" && <span className="self-start inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[13px] font-extrabold" style={{ background: "#F6EFE2", color: "#6A4F1C" }}><Icon name="flag" size={15} />{JOURNAL_KIND_LABEL[e.kind]}</span>}
                      {e.title && <h3 className="font-serif text-[26px] font-medium leading-tight">{e.title}</h3>}
                      {e.body && <p className={e.title ? "text-[17px] leading-relaxed text-ink-2 whitespace-pre-line" : "font-serif text-[21px] leading-relaxed whitespace-pre-line"}>{e.body}</p>}
                      <div className="flex items-center gap-2 text-[13px] font-bold text-ink-3 flex-wrap">
                        <Avatar name={nameOf(e.author)} tone={members.findIndex((m) => m.user_id === e.author)} size={24} />{nameOf(e.author)} · {fmtDay(e.entry_date)}
                        {e.visibility === "private" && <span className="inline-flex items-center gap-1"><Icon name="lock" size={13} />רק לי</span>}
                        {(e.author === user.id || e.visibility === "shared") && <button className="ms-auto text-primary min-h-11 px-1" onClick={() => setEdit(e)}>עריכה</button>}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="grid grid-cols-[64px_minmax(0,1fr)] md:grid-cols-[120px_minmax(0,1fr)] gap-4 md:gap-7">
            <div><span className="text-[13px] font-bold text-ink-3">בהמשך</span></div>
            <div className="border-[1.5px] border-dashed border-[#D6CCBE] rounded-[26px] p-5 flex flex-col gap-2.5">
              <div className="lbl">רגעים שעוד מחכים לכם</div>
              <div className="flex gap-2 flex-wrap">
                {UPCOMING.filter((u) => !milestonesDone.has(u)).map((u) => (
                  <button key={u} className="h-8 px-3 rounded-full text-[13px] font-extrabold shadow-[inset_0_0_0_1px_#E1D3B8] text-[#6A4F1C]"
                    onClick={() => setEdit({ kind: "milestone", title: u })}>{u}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside className="flex-[1_1_280px] max-w-[320px] flex flex-col gap-4 md:sticky md:top-8">
        <div className="lbl">ספר ההריון</div>
        <div className="aspect-[3/4] rounded-[6px_18px_18px_6px] bg-[#E9DFD0] p-7 flex flex-col justify-between shadow-[inset_-10px_0_0_rgba(0,0,0,.05),0_24px_48px_-20px_rgba(74,52,30,.45)]">
          <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><path d="M8 22a12 12 0 0 0 24 0" fill="none" stroke="#8C7356" strokeWidth="2" strokeLinecap="round" /><circle cx="20" cy="15.5" r="4.5" fill="var(--second)" /></svg>
          <div><div className="font-serif text-[32px] leading-tight text-[#3A332B]">תשעה חודשים<br />שלנו</div>
            <div className="text-sm text-[#6A5A45] mt-2.5 font-semibold">{members.map((m) => m.display_name).join(" ו")} · {new Date(space.due_date).getFullYear() - 1}–{new Date(space.due_date).getFullYear()}</div></div>
        </div>
        <div className="bg-white border border-[#EDE4D7] rounded-[20px] p-4 flex flex-col gap-3">
          <div className="flex justify-between"><span className="text-ink-3">רשומות</span><b>{list.length}</b></div>
          <div className="flex justify-between"><span className="text-ink-3">תמונות</span><b>{photoCount}</b></div>
          <div className="flex justify-between"><span className="text-ink-3">עמודים (משוער)</span><b>{pages}</b></div>
          <Link href="/journal/book" className="btn mt-1" style={{ background: "var(--ink)", color: "#fff" }}><Icon name="book" />תצוגה מקדימה להדפסה</Link>
          <p className="text-[13px] text-ink-3 leading-normal">מידע רפואי לא נכנס לספר. רשומות מוסתרות לא נכללות.</p>
        </div>
        <span className="text-[13px] text-ink-3">עודכן {list[0] ? fmtShort(list[0].entry_date) : "—"}</span>
      </aside>
      <JournalSheet open={!!edit} onClose={() => setEdit(null)} initial={edit} />
    </div>
  );
}
