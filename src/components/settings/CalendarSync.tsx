"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { Icon } from "@/components/Icon";

/** Settings card: subscribe to the space's schedule from Google / Apple / Outlook calendars. */
export function CalendarSync() {
  const { space, refresh } = useSession();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState("");
  if (!space) return null;

  const token = space.calendar_token;
  const httpsUrl = token && typeof window !== "undefined" ? `${window.location.origin}/api/calendar/${token}.ics` : "";
  const webcal = httpsUrl.replace(/^https?:/, "webcal:");
  const google = httpsUrl ? `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}` : "";

  const setFeed = async (enabled: boolean) => {
    if (enabled === false && !confirm("הקישור הנוכחי יפסיק לעבוד ביומנים שכבר נרשמו אליו. להמשיך?")) return;
    setBusy(true); setErr("");
    const { error } = await supabase.rpc("set_calendar_feed", { sid: space.id, enabled });
    setBusy(false);
    if (error) setErr("לא הצלחנו לעדכן — צריך חיבור לאינטרנט");
    refresh();
  };
  const setTitles = async (v: boolean) => {
    const { error } = await supabase.from("spaces").update({ calendar_show_titles: v }).eq("id", space.id);
    if (error) setErr("לא הצלחנו לעדכן — צריך חיבור לאינטרנט");
    refresh();
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(httpsUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  return (
    <section className="card p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-none bg-primary-100 text-primary"><Icon name="cal" /></span>
        <h2 className="text-lg font-extrabold flex-1">סנכרון ליומן</h2>
      </div>
      <p className="text-sm text-ink-3 leading-relaxed">
        התורים והמשימות עם תאריך יופיעו ביומן של Google, Apple או Outlook ויתעדכנו לבד (בדרך כלל תוך כמה שעות).
        הסנכרון חד־כיווני: עורכים כאן, רואים שם.
      </p>
      {!token ? (
        <button className="btn btn-primary self-start" disabled={busy} onClick={() => setFeed(true)}><Icon name="link" />יצירת קישור ליומן</button>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            <a className="btn btn-primary" href={webcal}>הוספה ליומן של Apple</a>
            <a className="btn btn-secondary" href={google} target="_blank" rel="noreferrer">הוספה ל־Google Calendar</a>
          </div>
          <div className="flex gap-2 items-center">
            <input className="input flex-1 text-sm" dir="ltr" readOnly value={httpsUrl} aria-label="קישור ליומן" onFocus={(e) => e.currentTarget.select()} />
            <button className="btn btn-ghost" onClick={copy}>{copied ? "הועתק" : "העתקה"}</button>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="cb mt-0.5" checked={!!space.calendar_show_titles} onChange={(e) => setTitles(e.target.checked)} />
            <span><b className="block">להציג שמות ומקומות</b>
              <span className="text-[13px] text-ink-3">כבוי: ביומן יופיע רק ״תור״ או ״משימה״ — שימושי ביומן עבודה משותף. דלוק: שם הבדיקה, המקום והרופא/ה.</span></span>
          </label>
          <p className="text-[13px] text-ink-3">כל מי שמחזיק בקישור יכול לראות את הלו״ז. אם שיתפתם אותו בטעות — אפשר ליצור קישור חדש.</p>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-ghost" disabled={busy} onClick={() => setFeed(true)}>קישור חדש</button>
            <button className="btn btn-ghost" disabled={busy} onClick={() => setFeed(false)} style={{ color: "var(--st-att)" }}>ביטול הסנכרון</button>
          </div>
        </>
      )}
      {err && <p className="text-sm font-bold" style={{ color: "var(--st-att)" }}>{err}</p>}
    </section>
  );
}
