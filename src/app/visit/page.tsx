"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { nextAppointment, openQuestionsFor, useAppointments, useQuestions, useSave } from "@/lib/data";
import type { Question } from "@/lib/types";

export default function Visit() {
  const { data: appts } = useAppointments();
  const { data: qs } = useQuestions();
  const next = nextAppointment(appts);
  // Freeze the question order at entry, so answered ones stay navigable during the visit.
  const [ids, setIds] = useState<string[] | null>(null);
  if (ids === null && qs) setIds(openQuestionsFor(qs, next?.id ?? null).map((q) => q.id));
  const list = (ids ?? []).map((id) => (qs ?? []).find((q) => q.id === id)).filter(Boolean) as Question[];

  return (
    <div dir="rtl" className="min-h-dvh flex flex-col gap-6 px-5 pb-10 pt-safe text-[#f5efe6]" style={{ background: "#1F3A32" }}>
      <header className="flex items-center gap-3 pt-3">
        <div className="flex-1"><div className="text-[13px] font-bold text-[#a9c4b6]">מצב תור{next ? ` · ${next.title}` : ""}</div><div className="font-extrabold">{next?.provider ?? "השאלות שלכם"}</div></div>
        <Link href="/questions" className="h-11 px-4 rounded-[14px] bg-white/10 font-bold inline-flex items-center">סיום</Link>
      </header>
      {list.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
          <div className="font-serif text-3xl">אין שאלות פתוחות</div>
          <p className="text-[#a9c4b6]">הוסיפו שאלות במסך ״שאלות לרופא״ והן יחכו לכם כאן.</p>
        </div>
      ) : <Stepper list={list} />}
    </div>
  );
}

function Stepper({ list }: { list: Question[] }) {
  const [i, setI] = useState(0);
  const q = list[Math.min(i, list.length - 1)];
  return (
    <div className="w-full max-w-xl mx-auto flex-1 flex flex-col gap-6">
      <div className="flex gap-1.5" aria-hidden="true">
        {list.map((x, k) => <span key={x.id} className="flex-1 h-[5px] rounded-full" style={{ background: k === i ? "#E7C6A4" : x.resolved ? "#7FA594" : "rgba(255,255,255,.18)" }} />)}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-extrabold text-[#e7c6a4]">שאלה {i + 1} מתוך {list.length}</span>
        <span className="text-sm text-[#a9c4b6]">· {list.filter((x) => x.resolved).length} נענו</span>
        {q.category && <span className="ms-auto h-[26px] px-2.5 rounded-lg bg-white/10 text-[13px] font-bold inline-flex items-center">{q.category}</span>}
      </div>
      <Card key={q.id} q={q} isLast={i >= list.length - 1} canPrev={i > 0} go={(d) => setI((x) => Math.max(0, Math.min(list.length - 1, x + d)))} />
    </div>
  );
}

function Card({ q, isLast, canPrev, go }: { q: Question; isLast: boolean; canPrev: boolean; go: (d: number) => void }) {
  const save = useSave("questions");
  const [note, setNote] = useState(q.answer ?? "");
  const flush = () => { if (note !== (q.answer ?? "")) save.update(q.id, { answer: note || null }); };
  return (
    <>
      <h1 aria-live="polite" className="font-serif text-[30px] md:text-[38px] leading-[1.3] min-h-[150px]">{q.text}</h1>
      <label className="flex flex-col gap-2 flex-1">
        <span className="text-sm font-bold text-[#a9c4b6]">מה הרופא/ה ענו?</span>
        <textarea className="flex-1 min-h-[120px] rounded-[18px] border border-white/20 bg-white/[.07] px-4 py-3.5 text-lg leading-relaxed resize-none text-[#f5efe6] placeholder:text-[#a9c4b6]"
          placeholder="כתבו בקצרה — אפשר להשלים אחר כך" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <div className="flex flex-col gap-2.5">
        <button className="h-[60px] rounded-[20px] bg-[#f5efe6] text-[#1F3A32] text-lg font-extrabold flex items-center justify-center gap-2.5"
          onClick={() => { save.update(q.id, { resolved: true, answer: note || null }); if (!isLast) go(1); }}>
          <Icon name="check" size={22} />{q.resolved ? "נענתה" : isLast ? "נענתה" : "נענתה · לשאלה הבאה"}
        </button>
        <div className="flex gap-2.5">
          <button className="flex-1 h-[52px] rounded-2xl bg-white/10 font-bold flex items-center justify-center gap-1.5 disabled:opacity-40" disabled={!canPrev} onClick={() => { flush(); go(-1); }}><Icon name="chevR" />הקודמת</button>
          <button className="flex-1 h-[52px] rounded-2xl bg-white/10 font-bold flex items-center justify-center gap-1.5 disabled:opacity-40" disabled={isLast} onClick={() => { flush(); go(1); }}>דילוג<Icon name="chevL" /></button>
        </div>
      </div>
    </>
  );
}
