"use client";

import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { usePrepInbox, usePrepItems, usePrepOffers } from "@/lib/data";
import { INBOX_ERROR, runTriage, undoInbox } from "@/lib/share";
import { relDays } from "@/lib/format";
import type { PrepInbox } from "@/lib/types";

const hostOf = (u?: string | null) => { try { return new URL(u!).hostname.replace(/^www\./, ""); } catch { return null; } };

/** One shared link/screenshot and what the AI did with it (with undo). */
export function InboxItem({ row, onOpen }: { row: PrepInbox; onOpen?: (itemId: string) => void }) {
  const { space } = useSession();
  const qc = useQueryClient();
  const { data: items } = usePrepItems();
  const { data: offers } = usePrepOffers();
  const [busy, setBusy] = useState(false);
  if (!space) return null;
  const label = row.result?.title ?? hostOf(row.url) ?? (row.image_path ? "צילום מסך" : row.text?.slice(0, 40)) ?? "שיתוף";

  const dismiss = async () => { await supabase.from("prep_inbox").update({ dismissed: true }).eq("id", row.id); qc.invalidateQueries({ queryKey: ["prep_inbox", space.id] }); };
  const undo = async () => { setBusy(true); await undoInbox(row, items ?? [], offers ?? [], space.id, qc); setBusy(false); };
  const retry = async () => { setBusy(true); await runTriage(row.id, space.id, qc); setBusy(false); };

  const tone = row.status === "failed" ? { bg: "var(--st-att-bg)", fg: "var(--st-att)", icon: "alert" as const }
    : row.status === "pending" ? { bg: "var(--st-pend-bg)", fg: "var(--st-pend)", icon: "sync" as const }
    : { bg: "var(--primary-100)", fg: "var(--primary)", icon: "check" as const };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#F3ECE2] last:border-0">
      <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-none" style={{ background: tone.bg, color: tone.fg }}>
        <Icon name={tone.icon} size={20} className={row.status === "pending" ? "spin" : ""} />
      </span>
      <div className="flex-1 min-w-0">
        {row.status === "pending" && <><b className="block truncate">{label}</b><span className="text-[13px] text-ink-3">מזהים את המוצר, המחיר והקטגוריה…</span></>}
        {row.status === "done" && (
          <button className="text-start w-full" onClick={() => row.item_id && onOpen?.(row.item_id)} disabled={!onOpen || !row.item_id}>
            <b className="block">{row.result?.message ?? label}</b>
            <span className="text-[13px] text-ink-3">{relDays(row.created_at)}{row.via === "shortcut" ? " · מהאייפון" : row.via === "android" ? " · משיתוף" : ""}</span>
          </button>
        )}
        {row.status === "failed" && <><b className="block truncate">{label}</b><span className="text-[13px] font-bold" style={{ color: "var(--st-att)" }}>{INBOX_ERROR[row.error ?? ""] ?? INBOX_ERROR.model}</span></>}
      </div>
      <div className="flex gap-1 flex-none">
        {row.status === "done" && <button className="btn btn-ghost h-9 min-h-0 px-2.5 text-sm" disabled={busy} onClick={undo}>ביטול</button>}
        {row.status === "failed" && <button className="btn btn-ghost h-9 min-h-0 px-2.5 text-sm" disabled={busy} onClick={retry}>שוב</button>}
        {row.status !== "pending" && <button className="icon-btn" aria-label="הסתרה" onClick={dismiss}><Icon name="close" size={16} /></button>}
      </div>
    </div>
  );
}

/** Recent shares on the prep page, newest first, until dismissed. */
export function InboxStrip({ onOpen }: { onOpen?: (itemId: string) => void }) {
  const { data } = usePrepInbox();
  const list = (data ?? []).filter((r) => !r.dismissed && r.status !== "undone").sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6);
  return (
    <section className="bg-white border border-[#EDE4D7] rounded-[24px] px-4 py-1" aria-label="נכנסו מהשיתוף">
      <div className="flex items-center gap-2 py-3">
        <Icon name="share" size={18} className="text-[#8C7356]" />
        <b className="flex-1 text-sm">{list.length ? "נכנסו מהשיתוף" : "ראיתם משהו? שתפו קישור או צילום מסך לקן"}</b>
        <Link href="/share" className="text-sm font-bold text-primary">הוספה מקישור</Link>
      </div>
      {list.map((r) => <InboxItem key={r.id} row={r} onOpen={onOpen} />)}
    </section>
  );
}
