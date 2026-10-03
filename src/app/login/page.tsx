"use client";

import { useState, useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { KanMark } from "@/components/KanMark";
import { Field } from "@/components/ui";

const noop = () => () => {};
/** Supabase puts email-link errors in the URL hash (e.g. #error_code=otp_expired). */
function useLinkError() {
  const hash = useSyncExternalStore(noop, () => window.location.hash, () => "");
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const code = p.get("error_code");
  if (!code) return null;
  return code === "otp_expired" ? "קישור האימות כבר שומש או שפג תוקפו. הזינו את המייל ונשלח קישור חדש." : "האימות לא הצליח. נסו לשלוח קישור חדש.";
}

export default function Login() {
  const linkError = useLinkError();
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "err" | "ok"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const fn = mode === "in" ? supabase.auth.signInWithPassword({ email, password }) : supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    const { data, error } = await fn;
    setBusy(false);
    if (error) {
      if (error.message.includes("not confirmed")) {
        setNeedsConfirm(true);
        return setMsg({ kind: "err", text: "צריך לאשר את המייל קודם. לא קיבלתם? אפשר לשלוח שוב." });
      }
      const t = error.message.includes("Invalid login") ? "המייל או הסיסמה לא נכונים" : error.message.includes("at least") ? "הסיסמה צריכה להיות באורך 6 תווים לפחות" : error.message;
      setMsg({ kind: "err", text: t });
    } else if (mode === "up" && data.user && data.user.identities?.length === 0) {
      // Supabase returns a fake success for an existing email (no mail is sent).
      setMode("in");
      setMsg({ kind: "ok", text: "כבר יש חשבון עם המייל הזה — פשוט התחברו עם הסיסמה." });
    } else if (mode === "up" && !data.session) {
      setNeedsConfirm(true);
      setMsg({ kind: "ok", text: "שלחנו לכם מייל לאימות. אחרי האישור אפשר להתחבר." });
    }
  };

  const resend = async () => {
    if (!email) return setMsg({ kind: "err", text: "הזינו את המייל שאיתו נרשמתם" });
    setBusy(true);
    const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    setMsg(error ? { kind: "err", text: error.message.includes("seconds") ? "אפשר לשלוח שוב בעוד דקה" : error.message } : { kind: "ok", text: "שלחנו קישור חדש. פתחו את המייל האחרון בלבד." });
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-5 pt-safe">
      <div className="w-full max-w-sm flex flex-col gap-7">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-20 h-20 rounded-[26%] bg-primary flex items-center justify-center shadow-[0_18px_40px_-16px_rgba(47,93,79,.6)]"><KanMark size={54} /></div>
          <h1 className="font-serif text-4xl font-bold">קן</h1>
          <p className="text-ink-3">ההריון שלכם, במקום אחד</p>
        </div>
        <form onSubmit={submit} className="card p-6 flex flex-col gap-4">
          <div className="seg w-full">
            <button type="button" className="flex-1 justify-center" aria-pressed={mode === "in"} onClick={() => setMode("in")}>התחברות</button>
            <button type="button" className="flex-1 justify-center" aria-pressed={mode === "up"} onClick={() => setMode("up")}>הרשמה</button>
          </div>
          <Field label="מייל"><input className="input" type="email" dir="ltr" style={{ textAlign: "right" }} autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="סיסמה" hint={mode === "up" ? "לפחות 6 תווים" : undefined}>
            <input className="input" type="password" dir="ltr" style={{ textAlign: "right" }} autoComplete={mode === "in" ? "current-password" : "new-password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {linkError && !msg && <p className="text-sm font-semibold" style={{ color: "var(--st-att)" }}>{linkError}</p>}
          {msg && <p className="text-sm font-semibold" style={{ color: msg.kind === "err" ? "var(--st-att)" : "var(--st-done)" }}>{msg.text}</p>}
          <button className="btn btn-primary h-12" disabled={busy}>{busy ? "רגע…" : mode === "in" ? "כניסה" : "יצירת חשבון"}</button>
          {(needsConfirm || linkError) && <button type="button" className="btn btn-ghost" disabled={busy} onClick={resend}>שליחת מייל אימות מחדש</button>}
        </form>
        <p className="text-center text-[13px] text-ink-3">המידע פרטי ונגיש רק לכם ולבן/בת הזוג שתזמינו.</p>
      </div>
    </div>
  );
}
