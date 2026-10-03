"use client";

import Link from "next/link";
import { useJournal, useMediaUrls } from "@/lib/data";
import { useSession } from "@/lib/session";
import { weekOf } from "@/lib/pregnancy";
import { fmtDayYear } from "@/lib/format";
import { KanMark } from "@/components/KanMark";

export default function Book() {
  const { space, members, nameOf } = useSession();
  const { data } = useJournal();
  const entries = (data ?? []).filter((e) => e.include_in_book && !e.hidden).sort((a, b) => a.entry_date.localeCompare(b.entry_date));
  const urls = useMediaUrls(entries.flatMap((e) => e.photos)).data ?? {};
  if (!space) return null;
  const names = members.map((m) => m.display_name).join(" ו");
  const year = new Date(space.due_date).getFullYear();

  return (
    <div dir="rtl" className="bg-[#efe9e0] print:bg-white min-h-dvh">
      <style>{`@page { size: A5; margin: 14mm; } @media print { .page { break-after: page; box-shadow: none !important; margin: 0 !important; } }`}</style>
      <div className="flex gap-2 justify-center p-5 print:hidden">
        <Link href="/journal" className="btn btn-secondary">חזרה</Link>
        <button className="btn btn-primary" onClick={() => window.print()}>הדפסה / שמירה כ־PDF</button>
      </div>
      <div className="flex flex-col items-center gap-6 pb-10 print:p-0 print:gap-0">
        <section className="page w-[148mm] min-h-[210mm] bg-[#E9DFD0] p-[18mm] flex flex-col justify-between shadow-xl">
          <div className="w-14 h-14 rounded-[26%] bg-[#2f5d4f] flex items-center justify-center"><KanMark size={38} /></div>
          <div><h1 className="font-serif text-[44px] leading-tight text-[#3A332B]">תשעה חודשים<br />שלנו</h1>
            <p className="mt-3 text-lg text-[#6A5A45] font-semibold">{names} · {year - 1}–{year}</p></div>
        </section>
        {entries.map((e) => (
          <section key={e.id} className="page w-[148mm] min-h-[210mm] bg-white p-[16mm] flex flex-col gap-4 shadow-xl">
            <div className="text-sm font-bold text-[#8C7356]">שבוע {weekOf(space.due_date, e.entry_date)} · {fmtDayYear(e.entry_date)}</div>
            {e.title && <h2 className="font-serif text-[30px] leading-tight">{e.title}</h2>}
            {e.photos.length > 0 && (
              <div className={`grid gap-2 ${e.photos.length > 1 ? "grid-cols-2" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {e.photos.slice(0, 4).map((p) => urls[p] ? <img key={p} src={urls[p]} alt="" className="w-full max-h-[90mm] object-cover rounded-lg" /> : null)}
              </div>
            )}
            {e.body && <p className="font-serif text-[17px] leading-[1.8] whitespace-pre-line">{e.body}</p>}
            <div className="mt-auto text-sm text-[#8a8177]">— {nameOf(e.author)}</div>
          </section>
        ))}
        {entries.length === 0 && <p className="text-ink-3 print:hidden">עוד אין רשומות לספר.</p>}
      </div>
    </div>
  );
}
