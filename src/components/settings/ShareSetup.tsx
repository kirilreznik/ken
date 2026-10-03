"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { Icon } from "@/components/Icon";

const ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/functions/v1/triage-product`;

function Copy({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] font-bold text-ink-3">{label}</span>
      <div className="flex gap-2">
        <input className="input flex-1 text-[13px]" dir="ltr" readOnly value={value} onFocus={(e) => e.currentTarget.select()} />
        <button type="button" className="btn btn-ghost" onClick={async () => { try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1500); } catch {} }}>{done ? "הועתק" : "העתקה"}</button>
      </div>
    </div>
  );
}

/** Share into Ken from the iPhone share sheet (via a Shortcut) or Android (installed PWA). */
export function ShareSetup() {
  const { space, user } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const key = ["capture_tokens", user?.id];
  const { data: token } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("capture_tokens").select("token").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1);
      return (data?.[0]?.token as string | undefined) ?? null;
    },
    meta: { persist: false },
  });
  if (!space || !user) return null;

  const create = async () => {
    setErr("");
    await supabase.from("capture_tokens").delete().eq("user_id", user.id);
    const t = Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, "0")).join("");
    const { error } = await supabase.from("capture_tokens").insert({ token: t, user_id: user.id, space_id: space.id });
    if (error) setErr("צריך חיבור לאינטרנט");
    qc.invalidateQueries({ queryKey: key });
    setOpen(true);
  };

  return (
    <section id="share" className="card p-6 flex flex-col gap-4 scroll-mt-6">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-none bg-primary-100 text-primary"><Icon name="share" /></span>
        <h2 className="text-lg font-extrabold flex-1">שיתוף מוצרים לקן</h2>
      </div>
      <p className="text-sm text-ink-3 leading-relaxed">ראיתם עגלה באתר או באינסטגרם? שתפו את הקישור או צילום מסך לקן — נזהה מה זה, כמה זה עולה ונכניס לקטגוריה. אם המוצר כבר ברשימה, החנות תתווסף להשוואת מחירים.</p>

      <div className="rounded-2xl bg-surface-2 p-4 flex flex-col gap-3">
        <b>אייפון — דרך ״קיצורים״</b>
        <p className="text-[13px] text-ink-3">באייפון אפליקציות אינטרנט לא מופיעות בתפריט השיתוף, אז יוצרים פעם אחת קיצור קטן (2 דקות). כל שיתוף אליו נכנס ישר לקן.</p>
        {!token ? (
          <button className="btn btn-primary self-start" onClick={create}><Icon name="link" />יצירת קוד אישי לקיצור</button>
        ) : (
          <>
            <button className="text-sm font-bold text-primary self-start" onClick={() => setOpen((v) => !v)}>{open ? "הסתרת ההוראות" : "הוראות והקוד שלי"}</button>
            {open && (
              <>
                <ol className="list-decimal ps-5 flex flex-col gap-2 text-sm leading-relaxed">
                  <li>פותחים את <b>קיצורים</b> ← <b>+</b> ← קוראים לקיצור <b>״שמירה בקן״</b>.</li>
                  <li>לוחצים על <b>ⓘ</b> ומדליקים <b>״הצג בגיליון השיתוף״</b>. בשורה העליונה בוחרים לקבל: כתובות URL, דפי Safari, טקסט ותמונות.</li>
                  <li>מוסיפים פעולה <b>״קבלת תוכן של URL״</b>: בכתובת מדביקים את הכתובת למטה, שיטה <b>POST</b>, גוף הבקשה <b>טופס</b>, ומוסיפים 3 שדות:
                    <ul className="list-disc ps-5 mt-1">
                      <li><code dir="ltr">token</code> — טקסט — הקוד האישי למטה</li>
                      <li><code dir="ltr">text</code> — טקסט — ״קלט קיצור הדרך״</li>
                      <li><code dir="ltr">file</code> — קובץ — ״קלט קיצור הדרך״</li>
                    </ul></li>
                  <li>מוסיפים פעולה <b>״הצגת הודעה״</b> עם ״תוכן של URL״ — כך תראו מה נוסף.</li>
                  <li>מעכשיו: בכל אתר או צילום מסך ← <b>שיתוף</b> ← <b>שמירה בקן</b>.</li>
                </ol>
                <Copy label="כתובת" value={ENDPOINT} />
                <Copy label="קוד אישי (לא לשתף)" value={token} />
                <button className="text-[13px] font-bold self-start" style={{ color: "var(--st-att)" }} onClick={create}>יצירת קוד חדש (הקוד הישן יפסיק לעבוד)</button>
              </>
            )}
          </>
        )}
      </div>

      <div className="rounded-2xl bg-surface-2 p-4 flex flex-col gap-1">
        <b>אנדרואיד</b>
        <p className="text-[13px] text-ink-3">מתקינים את קן למסך הבית (בכרום: ⋮ ← ״התקנת אפליקציה״), ואז ״קן״ מופיע ישר בתפריט השיתוף.</p>
      </div>
      <p className="text-[13px] text-ink-3">אפשר תמיד גם להדביק קישור ב״הכנות לתינוק״ ← ״הוספה מקישור״. הקישורים נשלחים לקריאה ע״י Claude (Anthropic).</p>
      {err && <p className="text-sm font-bold" style={{ color: "var(--st-att)" }}>{err}</p>}
    </section>
  );
}
