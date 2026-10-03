"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { Icon } from "@/components/Icon";

/** Invite the partner with a 7-day code (both partners are equal editors). */
export function InviteCard() {
  const { space, user, me } = useSession();
  const [code, setCode] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  if (!space || !user) return null;

  const invite = async () => {
    setErr("");
    const c = Array.from(crypto.getRandomValues(new Uint8Array(6))).map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");
    const { error } = await supabase.from("space_invites").insert({ code: c, space_id: space.id, created_by: user.id });
    if (error) setErr("צריך חיבור לאינטרנט"); else setCode(c);
  };
  const link = typeof window !== "undefined" ? window.location.origin : "";
  const text = code ? `${me?.display_name ?? ""} מזמין/ה אותך לקן — האפליקציה שלנו להריון.\n1. נכנסים ל־${link}\n2. נרשמים ובוחרים ״יש לי קוד הזמנה״\n3. הקוד: ${code}` : "";
  const share = async () => {
    if (navigator.share) { await navigator.share({ title: "הזמנה לקן", text }).catch(() => {}); return; }
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  return code ? (
    <div className="rounded-2xl bg-primary-50 p-4 flex flex-col gap-3">
      <span className="text-sm font-bold text-ink-3">קוד הזמנה · בתוקף 7 ימים</span>
      <span dir="ltr" className="text-3xl font-extrabold tracking-[.3em] text-center">{code}</span>
      <button className="btn btn-primary" onClick={share}><Icon name="share" />{copied ? "הועתק" : "שליחת ההזמנה"}</button>
      <span className="text-sm text-ink-3">בן/בת הזוג נרשמים לקן ובוחרים ״יש לי קוד הזמנה״. שניכם תוכלו לערוך הכל.</span>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <button className="btn btn-secondary self-start" onClick={invite}><Icon name="plus" />יצירת קוד הזמנה</button>
      {err && <span className="text-sm font-bold" style={{ color: "var(--st-att)" }}>{err}</span>}
    </div>
  );
}
