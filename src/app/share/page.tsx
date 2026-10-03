"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { InboxItem } from "@/components/prep/InboxItem";
import { useSession } from "@/lib/session";
import { usePrepInbox } from "@/lib/data";
import { useOnline } from "@/lib/online";
import { firstUrl, shareToKen } from "@/lib/share";
import { report } from "@/lib/report";

/** Read (and clear) what the Android share sheet handed to the service worker. */
async function takeAndroidShare() {
  const q = new URLSearchParams(window.location.search);
  if (q.get("from") !== "android") return null;
  let meta = { url: q.get("url") ?? "", text: q.get("text") ?? "", title: q.get("title") ?? "" };
  let file: Blob | null = null;
  if ("caches" in window) {
    const c = await caches.open("kan-share");
    const m = await c.match("/__share/meta");
    if (m) meta = await m.json();
    const f = await c.match("/__share/file");
    if (f) file = await f.blob();
    await c.delete("/__share/meta"); await c.delete("/__share/file");
  }
  window.history.replaceState(null, "", "/share");
  if (!meta.url && !meta.text && !file) return null;
  return { url: meta.url || firstUrl(meta.text) || "", text: [meta.title, meta.text].filter(Boolean).join("\n"), file };
}

export default function SharePage() {
  const { space, user } = useSession();
  const qc = useQueryClient();
  const online = useOnline();
  const { data: inbox } = usePrepInbox();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [ids, setIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const started = useRef(false);

  const submit = async (input: { url?: string; text?: string; file?: Blob | null }, via: "app" | "android" = "app") => {
    if (!space || !user) return;
    setBusy(true); setErr("");
    try {
      const id = crypto.randomUUID();
      setIds((x) => [id, ...x]);
      const real = await shareToKen({ url: input.url, text: input.text, file: input.file ?? null, via }, space.id, user.id, qc);
      setIds((x) => x.map((v) => (v === id ? real : v)));
      setText(""); setFile(null);
    } catch (e) {
      report(e, "upload", { where: "share" });
      setErr("לא הצלחנו לשמור — צריך חיבור לאינטרנט");
    }
    setBusy(false);
  };

  useEffect(() => {
    if (started.current || !space || !user) return;
    started.current = true;
    takeAndroidShare().then((s) => { if (s) submit(s, "android"); }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [space, user]);

  const paste = async () => { try { setText(await navigator.clipboard.readText()); } catch { setErr("אין גישה ללוח — הדביקו ידנית"); } };
  const mine = (inbox ?? []).filter((r) => ids.includes(r.id)).sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <header>
        <h1 className="font-serif text-[34px] md:text-[40px] leading-tight">הוספה לקניות</h1>
        <p className="text-ink-3 mt-1">קישור למוצר או צילום מסך — נזהה מה זה, כמה זה עולה ואיפה זה שייך. אם המוצר כבר ברשימה, החנות תתווסף להשוואה.</p>
      </header>

      {mine.length > 0 && <section className="card px-4 py-1">{mine.map((r) => <InboxItem key={r.id} row={r} />)}</section>}
      {busy && !mine.length && <div className="card p-4 flex items-center gap-3"><Icon name="sync" className="spin text-primary" /><b>מזהים את המוצר…</b></div>}

      <section className="card p-5 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-ink-2">קישור או טקסט</span>
          <textarea className="input" rows={3} dir="auto" placeholder="https://…" value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-secondary" onClick={paste}><Icon name="clip" />הדבקה</button>
          <label className="btn btn-secondary cursor-pointer"><Icon name="img" />{file ? "הוחלף צילום" : "צילום מסך"}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
          <button className="btn btn-primary ms-auto" disabled={busy || !online || (!text.trim() && !file)} onClick={() => submit({ text, url: firstUrl(text) ?? undefined, file })}>הוספה</button>
        </div>
        {file && <span className="text-sm text-ink-3">{file.name}</span>}
        {!online && <span className="text-sm text-ink-3">צריך חיבור לאינטרנט</span>}
        {err && <span className="text-sm font-bold" style={{ color: "var(--st-att)" }}>{err}</span>}
      </section>

      <div className="flex gap-3 flex-wrap text-sm">
        <Link href="/prep" className="btn btn-ghost">לרשימת ההכנות</Link>
        <Link href="/settings#share" className="btn btn-ghost">שיתוף ישיר מהאייפון</Link>
      </div>
    </div>
  );
}
