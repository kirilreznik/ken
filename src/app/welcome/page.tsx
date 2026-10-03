"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { KanMark } from "@/components/KanMark";
import { InviteCard } from "@/components/InviteCard";
import { PlanImport, type PlanDone } from "@/components/plan/PlanImport";
import { useSession } from "@/lib/session";
import { usePregnancy } from "@/lib/data";

/** First-run flow after creating a space: follow-up plan → invite partner → home. */
export default function Welcome() {
  const router = useRouter();
  const { members, me } = useSession();
  const wk = usePregnancy();
  const [step, setStep] = useState<"plan" | "invite">("plan");
  const [done, setDone] = useState<PlanDone | null>(null);
  const finish = () => router.replace("/");
  const finishPlan = (r: PlanDone | null) => { setDone(r); if (members.length > 1) finish(); else setStep("invite"); };

  return (
    <div className="min-h-dvh p-5 pt-safe pb-28 flex justify-center">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[26%] bg-primary flex items-center justify-center"><KanMark size={32} /></div>
          <div className="flex-1"><h1 className="font-serif text-3xl">{step === "plan" ? "בואו נבנה את התוכנית" : "עכשיו ביחד"}</h1>
            <p className="text-ink-3">{wk ? `שבוע ${wk.label}` : ""}{me ? ` · שלום ${me.display_name}` : ""}</p></div>
          <span className="text-sm font-bold text-ink-3">{step === "plan" ? "1/2" : "2/2"}</span>
        </div>

        {step === "plan" ? (
          <PlanImport welcome onDone={finishPlan} onSkip={() => finishPlan(null)} />
        ) : (
          <div className="flex flex-col gap-4">
            {done && (
              <div className="rounded-2xl p-4 flex gap-3 items-center" style={{ background: "var(--st-done-bg)", color: "var(--st-done)" }}>
                <Icon name="check" /><b>{done.created + done.updated} בדיקות בתוכנית. נזכיר מתי לקבוע כל אחת.</b>
              </div>
            )}
            <section className="card p-6 flex flex-col gap-4">
              <h2 className="text-lg font-extrabold">להזמין את בן/בת הזוג</h2>
              <p className="text-sm text-ink-3 leading-relaxed">שניכם רואים ועורכים את אותם תורים, משימות ומסמכים, ומקבלים תזכורות. לא משנה מי מנהל — כל אחד יכול להוסיף ולסמן.</p>
              <InviteCard />
            </section>
            <button className="btn btn-primary h-12" onClick={finish}>לדף הבית</button>
            <button className="text-sm text-ink-3 underline self-center" onClick={finish}>אזמין אחר כך (בהגדרות)</button>
          </div>
        )}
      </div>
    </div>
  );
}
