"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { addDays, parseDay, toDay, weekInfo } from "@/lib/pregnancy";
import type { MemberRole } from "@/lib/types";
import { fmtDayYear } from "@/lib/format";
import { Field } from "@/components/ui";
import { KanMark } from "@/components/KanMark";

export default function Onboarding() {
  const { user, refresh, signOut } = useSession();
  const [mode, setMode] = useState<"new" | "join">("new");
  const [name, setName] = useState("");
  const [dateKind, setDateKind] = useState<"due" | "lmp">("due");
  const [date, setDate] = useState("");
  const [role, setRole] = useState<MemberRole | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const due = date ? (dateKind === "due" ? date : toDay(addDays(parseDay(date), 280))) : "";
  const wk = due ? weekInfo(due) : null;

  const setMyRole = async (sid: string) => {
    if (role) await supabase.from("space_members").update({ role }).eq("space_id", sid).eq("user_id", user!.id);
  };

  const create = async () => {
    if (!name.trim()) return setErr("איך לקרוא לך?");
    if (!role) return setErr("מי את/ה בהריון הזה?");
    if (!due) return setErr("צריך תאריך כדי לחשב את השבוע");
    setBusy(true); setErr("");
    const { data: sid, error } = await supabase.rpc("create_space", { p_name: "ההריון שלנו", p_due_date: due, p_display_name: name.trim() });
    if (error || !sid) { setBusy(false); return setErr(error?.message ?? "משהו השתבש"); }
    await setMyRole(sid as string);
    try { sessionStorage.setItem("ken-welcome", "1"); } catch {}
    refresh();
  };

  const join = async () => {
    if (!name.trim()) return setErr("איך לקרוא לך?");
    setBusy(true); setErr("");
    const { data: sid, error } = await supabase.rpc("join_space", { p_code: code, p_display_name: name.trim() });
    if (error) { setBusy(false); return setErr(error.message.includes("invalid_code") ? "הקוד לא תקין או שפג תוקפו" : error.message); }
    await setMyRole(sid as string);
    setBusy(false);
    refresh();
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-5 pt-safe">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-[26%] bg-primary flex items-center justify-center"><KanMark size={32} /></div>
          <div><h1 className="font-serif text-3xl">ברוכים הבאים לקן</h1><p className="text-ink-3">עוד רגע וזה מוכן</p></div></div>
        <div className="seg w-full">
          <button className="flex-1 justify-center" aria-pressed={mode === "new"} onClick={() => setMode("new")}>מתחילים מרחב חדש</button>
          <button className="flex-1 justify-center" aria-pressed={mode === "join"} onClick={() => setMode("join")}>יש לי קוד הזמנה</button>
        </div>
        <div className="card p-6 flex flex-col gap-4">
          <Field label="השם שלך" hint="כך יופיע אצל בן/בת הזוג"><input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></Field>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-ink-2">מי את/ה בהריון הזה?</span>
            <div className="grid grid-cols-2 gap-2">
              {([["pregnant", "אני בהריון", "התוכנית והתזכורות לפי הגוף שלי"], ["partner", "בן/בת הזוג", "אני מנהל/ת יחד, או בשבילנו"]] as const).map(([v, t, sub]) => (
                <button key={v} type="button" aria-pressed={role === v} onClick={() => setRole(v)}
                  className="rounded-2xl p-3 text-start border transition-shadow"
                  style={{ borderColor: role === v ? "var(--primary)" : "var(--line)", boxShadow: role === v ? "0 0 0 2px var(--primary)" : undefined }}>
                  <b className="block">{t}</b><span className="text-[12px] text-ink-3">{sub}</span>
                </button>
              ))}
            </div>
            <span className="text-[12px] text-ink-3">שניכם עורכים הכל באופן שווה — זה רק כדי שהניסוחים יתאימו.</span>
          </div>
          {mode === "new" ? (
            <>
              <div className="seg">
                <button aria-pressed={dateKind === "due"} onClick={() => setDateKind("due")}>תאריך לידה משוער</button>
                <button aria-pressed={dateKind === "lmp"} onClick={() => setDateKind("lmp")}>וסת אחרונה</button>
              </div>
              <Field label={dateKind === "due" ? "תאריך לידה משוער" : "היום הראשון של הווסת האחרונה"}
                hint={wk ? `היום: שבוע ${wk.label} · משוער ל־${fmtDayYear(due)}` : "אם אין עדיין תאריך — לפי הווסת האחרונה. אפשר לתקן אחר כך, גם לפי התוכנית מהרופא/ה."}>
                <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
              {err && <p className="text-sm font-semibold" style={{ color: "var(--st-att)" }}>{err}</p>}
              <button className="btn btn-primary h-12" disabled={busy} onClick={create}>{busy ? "יוצרים…" : "המשך — תוכנית המעקב"}</button>
            </>
          ) : (
            <>
              <Field label="קוד הזמנה" hint="בן/בת הזוג יכולים ליצור קוד בהגדרות">
                <input className="input text-center tracking-[.3em] font-extrabold uppercase" dir="ltr" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={8} />
              </Field>
              {err && <p className="text-sm font-semibold" style={{ color: "var(--st-att)" }}>{err}</p>}
              <button className="btn btn-primary h-12" disabled={busy || code.length < 6} onClick={join}>הצטרפות</button>
            </>
          )}
        </div>
        <button className="text-sm text-ink-3 underline self-center" onClick={signOut}>התנתקות</button>
      </div>
    </div>
  );
}
