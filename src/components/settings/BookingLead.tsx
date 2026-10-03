"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { Icon } from "@/components/Icon";
import type { Space } from "@/lib/types";

/** How many weeks before a test window opens to book it — drives "לקבוע עד שבוע X" and the nudges. */
export function BookingLead() {
  const { space, user, refresh } = useSession();
  const qc = useQueryClient();
  const [err, setErr] = useState("");
  if (!space || !user) return null;
  const lead = space.booking_lead_weeks ?? 3;

  const set = async (v: number) => {
    const n = Math.max(1, Math.min(8, v));
    if (n === lead) return;
    setErr("");
    qc.setQueryData(["membership", user.id], (old: { space: Space } | undefined) => old ? { ...old, space: { ...old.space, booking_lead_weeks: n } } : old);
    const { error } = await supabase.from("spaces").update({ booking_lead_weeks: n }).eq("id", space.id);
    if (error) setErr("לא נשמר — צריך חיבור לאינטרנט");
    refresh();
  };

  return (
    <section className="card p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-none bg-primary-100 text-primary"><Icon name="clock" /></span>
        <h2 className="text-lg font-extrabold flex-1">מתי לקבוע תורים</h2>
      </div>
      <p className="text-sm text-ink-3 leading-relaxed">
        כמה שבועות לפני שחלון הבדיקה נפתח כדאי לקבוע תור. אנחנו ממליצים על כ־3 שבועות — במכונים עמוסים (למשל סקירות) אפשר יותר.
        זה קובע את ״לקבוע עד שבוע…״, את ההצעות בדף הבית ואת התזכורות. בדיקות שבתוכנית מהרופא/ה כתוב להן מועד קביעה — נשארות לפי התוכנית.
      </p>
      <div className="flex items-center gap-3">
        <button className="icon-btn border border-line" aria-label="פחות שבועות" onClick={() => set(lead - 1)} disabled={lead <= 1}><span className="text-xl font-extrabold leading-none">−</span></button>
        <span className="min-w-[110px] text-center"><b className="font-serif text-4xl leading-none">{lead}</b> <span className="font-bold text-ink-2">שבועות לפני</span></span>
        <button className="icon-btn border border-line" aria-label="יותר שבועות" onClick={() => set(lead + 1)} disabled={lead >= 8}><Icon name="plus" /></button>
        {lead !== 3 && <button className="text-sm font-bold text-primary" onClick={() => set(3)}>חזרה להמלצה</button>}
      </div>
      <p className="text-[13px] text-ink-3">לדוגמה: בדיקה שהחלון שלה מתחיל בשבוע 20 → לקבוע עד שבוע {Math.max(1, 20 - lead)}.</p>
      {err && <p className="text-sm font-bold" style={{ color: "var(--st-att)" }}>{err}</p>}
    </section>
  );
}
