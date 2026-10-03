"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { currentSubscription, disablePushHere, enablePush, pushSupport, sendTestPush, type PushSupport } from "@/lib/push";

interface Prefs {
  user_id: string; space_id: string; push_enabled: boolean; appointment_reminders: boolean; task_reminders: boolean;
  window_reminders: boolean; suggestion_reminders: boolean; weekly_summary: boolean; timezone: string;
}
const DEFAULTS = { push_enabled: false, appointment_reminders: true, task_reminders: true, window_reminders: true, suggestion_reminders: true, weekly_summary: true };

const TOGGLES: Array<{ key: keyof typeof DEFAULTS; label: string; sub: string }> = [
  { key: "appointment_reminders", label: "תזכורת לתור", sub: "ערב לפני, ב־20:00" },
  { key: "task_reminders", label: "משימות להיום", sub: "בבוקר, ב־08:00 — רק משימות שלך או של שניכם" },
  { key: "window_reminders", label: "חלון בדיקה נסגר", sub: "כשנשאר פחות משבוע ועדיין אין תור" },
  { key: "weekly_summary", label: "סיכום שבועי", sub: "מוצאי שבת ב־20:00: מה מחכה בשבוע הקרוב" },
  { key: "suggestion_reminders", label: "הצעות לשבוע", sub: "בתוך הסיכום השבועי (או ביום ראשון בבוקר אם הסיכום כבוי)" },
];

export function Notifications() {
  const { space, user } = useSession();
  const qc = useQueryClient();
  const [support, setSupport] = useState<PushSupport>("unsupported");
  const [here, setHere] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const key = ["notification_prefs", user?.id];
  const { data: prefs } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("notification_prefs").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data as Prefs | null;
    },
  });

  useEffect(() => {
    let alive = true;
    const s = pushSupport();
    currentSubscription().then((sub) => { if (alive) { setSupport(s); setHere(!!sub); } }).catch(() => { if (alive) setSupport(s); });
    return () => { alive = false; };
  }, []);

  if (!space || !user) return null;
  const p = { ...DEFAULTS, ...(prefs ?? {}) };

  const save = async (patch: Partial<Prefs>) => {
    const row = { ...DEFAULTS, ...(prefs ?? {}), ...patch, user_id: user.id, space_id: space.id, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jerusalem", updated_at: new Date().toISOString() };
    qc.setQueryData(key, row);
    const { error } = await supabase.from("notification_prefs").upsert(row, { onConflict: "user_id" });
    if (error) setMsg("לא נשמר — צריך חיבור לאינטרנט");
    qc.invalidateQueries({ queryKey: key });
  };

  const turnOn = async () => {
    setBusy(true); setMsg("");
    try { await enablePush(space.id); setHere(true); await save({ push_enabled: true }); setMsg("ההתראות הופעלו במכשיר הזה"); }
    catch (e) { setMsg((e as Error).message === "permission" ? "הדפדפן לא אישר התראות. אפשר לשנות בהגדרות האתר." : "לא הצלחנו להפעיל התראות במכשיר הזה"); setSupport(pushSupport()); }
    setBusy(false);
  };
  const turnOffHere = async () => { setBusy(true); await disablePushHere().catch(() => {}); setHere(false); setBusy(false); setMsg("ההתראות כובו במכשיר הזה"); };
  const test = async () => {
    setBusy(true); setMsg("");
    try { const n = await sendTestPush(); setMsg(n ? "נשלחה התראת בדיקה" : "לא נמצא מכשיר רשום — נסו לכבות ולהפעיל שוב"); }
    catch { setMsg("השליחה נכשלה — צריך חיבור לאינטרנט"); }
    setBusy(false);
  };

  return (
    <section className="card p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-none bg-primary-100 text-primary"><Icon name="bell" /></span>
        <h2 className="text-lg font-extrabold flex-1">התראות</h2>
      </div>

      {support === "ios-needs-install" && (
        <p className="text-sm rounded-2xl bg-primary-50 p-4 leading-relaxed">באייפון, התראות עובדות רק כשקן מותקן במסך הבית: בספארי לוחצים <b>שיתוף</b> ← <b>הוספה למסך הבית</b>, ופותחים את קן משם.</p>
      )}
      {support === "unsupported" && <p className="text-sm text-ink-3">הדפדפן הזה לא תומך בהתראות.</p>}
      {support === "denied" && <p className="text-sm text-ink-3">ההתראות חסומות בדפדפן. כדי להפעיל, מאשרים התראות לאתר בהגדרות הדפדפן ומרעננים.</p>}

      {support === "ok" && (here ? (
        <div className="flex gap-2 flex-wrap items-center">
          <span className="inline-flex items-center gap-1.5 font-bold" style={{ color: "var(--st-done)" }}><Icon name="check" size={18} />פעיל במכשיר הזה</span>
          <button className="btn btn-ghost" disabled={busy} onClick={test}>שליחת בדיקה</button>
          <button className="btn btn-ghost" disabled={busy} onClick={turnOffHere}>כיבוי במכשיר הזה</button>
        </div>
      ) : (
        <button className="btn btn-primary self-start" disabled={busy} onClick={turnOn}><Icon name="bell" />הפעלת התראות במכשיר הזה</button>
      ))}

      {(here || p.push_enabled) && (
        <div className="flex flex-col gap-3 border-t border-line-2 pt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="cb mt-0.5" checked={p.push_enabled} onChange={(e) => save({ push_enabled: e.target.checked })} />
            <span><b className="block">לקבל התראות</b><span className="text-[13px] text-ink-3">כיבוי כאן משתיק את כל המכשירים שלך</span></span>
          </label>
          {TOGGLES.map((t) => (
            <label key={t.key} className="flex items-start gap-3 cursor-pointer" style={{ opacity: p.push_enabled ? 1 : 0.5 }}>
              <input type="checkbox" className="cb mt-0.5" disabled={!p.push_enabled} checked={p[t.key]} onChange={(e) => save({ [t.key]: e.target.checked })} />
              <span><b className="block">{t.label}</b><span className="text-[13px] text-ink-3">{t.sub}</span></span>
            </label>
          ))}
        </div>
      )}
      {msg && <p className="text-sm font-bold text-ink-2">{msg}</p>}
    </section>
  );
}
