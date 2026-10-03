"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { Field } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { Palette } from "@/lib/types";
import { applyPalette } from "@/lib/data";

const PALETTES: Array<{ id: Palette; name: string; sub: string; colors: string[] }> = [
  { id: "neutral", name: "מרווה", sub: "ניטרלי", colors: ["#2F5D4F", "#E3ECE6", "#E7C6A4"] },
  { id: "girl", name: "ורד מעושן", sub: "בת", colors: ["#8E4B5A", "#F3E1E3", "#F2C6B6"] },
  { id: "boy", name: "ים עמוק", sub: "בן", colors: ["#2F4F6B", "#E1EAF2", "#F0D49A"] },
];

export default function Settings() {
  const { space, me, user, members, refresh, signOut } = useSession();
  const qc = useQueryClient();
  const [name, setName] = useState(me?.display_name ?? "");
  const [due, setDue] = useState(space?.due_date ?? "");
  const [code, setCode] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  if (!space || !user) return null;

  const setPalette = async (p: Palette) => {
    applyPalette(p);
    qc.setQueryData(["membership", user.id], (old: { space: typeof space } | undefined) => old ? { ...old, space: { ...old.space, palette: p } } : old);
    await supabase.from("spaces").update({ palette: p }).eq("id", space.id);
    refresh();
  };
  const saveProfile = async () => {
    await supabase.from("space_members").update({ display_name: name.trim() }).eq("space_id", space.id).eq("user_id", user.id);
    if (due && due !== space.due_date) await supabase.from("spaces").update({ due_date: due }).eq("id", space.id);
    refresh(); setMsg("נשמר");
    setTimeout(() => setMsg(""), 2000);
  };
  const invite = async () => {
    const c = Array.from(crypto.getRandomValues(new Uint8Array(6))).map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");
    const { error } = await supabase.from("space_invites").insert({ code: c, space_id: space.id, created_by: user.id });
    if (!error) setCode(c);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="font-serif text-[34px] md:text-[40px]">הגדרות</h1>

      <section className="card p-6 flex flex-col gap-4">
        <h2 className="text-lg font-extrabold">פלטת צבעים</h2>
        <p className="text-sm text-ink-3 leading-relaxed">הבחירה ידנית בלבד — כך אף אחד לא ״מגלה״ את מין העובר מצבע המסך לפני שאתם מוכנים.</p>
        <div className="grid grid-cols-3 gap-3">
          {PALETTES.map((p) => (
            <button key={p.id} aria-pressed={space.palette === p.id} onClick={() => setPalette(p.id)}
              className="rounded-2xl p-3.5 flex flex-col gap-2.5 text-start border transition-shadow"
              style={{ borderColor: space.palette === p.id ? p.colors[0] : "var(--line)", boxShadow: space.palette === p.id ? `0 0 0 2px ${p.colors[0]}` : undefined }}>
              <span className="flex gap-1">{p.colors.map((c) => <i key={c} className="w-6 h-6 rounded-full" style={{ background: c }} />)}</span>
              <span><b className="block">{p.name}</b><span className="text-[13px] text-ink-3">{p.sub}</span></span>
            </button>
          ))}
        </div>
      </section>

      <section className="card p-6 flex flex-col gap-4">
        <h2 className="text-lg font-extrabold">פרטים</h2>
        <Field label="השם שלך"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="תאריך לידה משוער"><input className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
        <div className="flex items-center gap-3"><button className="btn btn-primary" onClick={saveProfile}>שמירה</button>{msg && <span className="text-sm font-bold" style={{ color: "var(--st-done)" }}>{msg}</span>}</div>
      </section>

      <section className="card p-6 flex flex-col gap-4">
        <h2 className="text-lg font-extrabold">שיתוף עם בן/בת הזוג</h2>
        <div className="flex flex-col gap-2">{members.map((m) => <div key={m.user_id} className="flex items-center gap-2"><Icon name="users" size={18} className="text-ink-3" />{m.display_name}{m.user_id === user.id && <span className="text-ink-3 text-sm">(את/ה)</span>}</div>)}</div>
        {members.length < 2 && (code ? (
          <div className="rounded-2xl bg-primary-50 p-4 flex flex-col gap-2">
            <span className="text-sm font-bold text-ink-3">קוד הזמנה · בתוקף 7 ימים</span>
            <span dir="ltr" className="text-3xl font-extrabold tracking-[.3em] text-center">{code}</span>
            <span className="text-sm text-ink-3">בן/בת הזוג נרשמים לקן ובוחרים ״יש לי קוד הזמנה״.</span>
          </div>
        ) : <button className="btn btn-secondary self-start" onClick={invite}><Icon name="plus" />יצירת קוד הזמנה</button>)}
      </section>

      <button className="btn btn-danger self-start" onClick={signOut}><Icon name="logout" />התנתקות</button>
    </div>
  );
}
