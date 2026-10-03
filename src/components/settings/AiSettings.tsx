"use client";

import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { Icon } from "@/components/Icon";

/** Opt-in for reading uploaded documents with Claude (per space — affects both partners). */
export function AiSettings() {
  const { space, refresh } = useSession();
  if (!space) return null;
  const toggle = async (v: boolean) => {
    await supabase.from("spaces").update({ ai_reading_enabled: v }).eq("id", space.id);
    refresh();
  };
  return (
    <section className="card p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-none bg-primary-100 text-primary"><Icon name="doc" /></span>
        <h2 className="text-lg font-extrabold flex-1">קריאה אוטומטית של מסמכים</h2>
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" className="cb mt-0.5" checked={!!space.ai_reading_enabled} onChange={(e) => toggle(e.target.checked)} />
        <span><b className="block">להציע שם, תאריך, ערכים ומשימות מתוך PDF ותמונות</b>
          <span className="text-[13px] text-ink-3 leading-relaxed block mt-1">
            כשמופעל, כל מסמך שמועלה נשלח לקריאה ע״י Claude (Anthropic) דרך השרת של קן. ההצעות מופיעות בפרטי המסמך ושום דבר לא משתנה בלי אישור שלכם.
            ההגדרה משותפת לשניכם. זה לא פירוש רפואי.
          </span></span>
      </label>
    </section>
  );
}
