"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { PlanImport, type PlanDone } from "@/components/plan/PlanImport";

export default function PlanPage() {
  const [done, setDone] = useState<PlanDone | null>(null);
  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <header>
        <h1 className="font-serif text-[34px] md:text-[40px] leading-tight">תוכנית המעקב</h1>
        <p className="text-ink-3 mt-1">העלו את התוכנית שקיבלתם מהרופא/ה — גם באמצע ההריון. נתאים אותה לבדיקות שכבר אצלכם.</p>
      </header>
      {done ? (
        <div className="card p-8 flex flex-col items-center text-center gap-4">
          <span className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--st-done-bg)", color: "var(--st-done)" }}><Icon name="check" size={28} /></span>
          <div><h2 className="text-xl font-extrabold">התוכנית עודכנה</h2>
            <p className="text-ink-3 mt-1">{done.created} בדיקות חדשות · {done.updated} עודכנו. נזכיר לכם מתי לקבוע כל אחת.</p></div>
          <Link href="/tests" className="btn btn-primary">לבדיקות ותורים</Link>
        </div>
      ) : <PlanImport onDone={setDone} />}
    </div>
  );
}
