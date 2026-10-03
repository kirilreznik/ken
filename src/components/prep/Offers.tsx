"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { usePrepOffers, useSave } from "@/lib/data";
import { useSession } from "@/lib/session";
import type { PrepOffer } from "@/lib/types";

const money = (o: PrepOffer) => (o.price == null ? "—" : o.currency === "ILS" ? `₪${Math.round(Number(o.price)).toLocaleString("he-IL")}` : `${o.price} ${o.currency}`);

/** Where to buy an item: stores side by side, cheapest first. Keeps the item price = cheapest ₪ offer. */
export function Offers({ itemId }: { itemId: string }) {
  const { user } = useSession();
  const { data } = usePrepOffers();
  const save = useSave("prep_offers");
  const saveItem = useSave("prep_items");
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ store: "", price: "", url: "", variant: "" });
  const list = (data ?? []).filter((o) => o.item_id === itemId)
    .sort((a, b) => (a.price == null ? 1 : b.price == null ? -1 : Number(a.price) - Number(b.price)));
  const best = list.find((o) => o.price != null && o.currency === "ILS");

  const syncPrice = (next: PrepOffer[]) => {
    const p = next.filter((o) => o.price != null && o.currency === "ILS").map((o) => Number(o.price));
    if (p.length) saveItem.update(itemId, { price: Math.min(...p) });
  };
  const add = () => {
    const price = f.price ? Number(f.price.replace(/[^\d.]/g, "")) || null : null;
    const url = /^https?:\/\//i.test(f.url.trim()) ? f.url.trim() : null;
    if (!f.store.trim() && !url) return;
    const row = { item_id: itemId, store: f.store.trim() || null, price, url, variant: f.variant.trim() || null, currency: "ILS", note: null, image_url: null, source: "manual" as const, created_by: user?.id };
    const id = save.insert(row);
    syncPrice([...list, { ...row, id, space_id: "", created_by: row.created_by ?? null } as PrepOffer]);
    setF({ store: "", price: "", url: "", variant: "" }); setAdding(false);
  };
  const remove = (o: PrepOffer) => { save.remove(o.id); syncPrice(list.filter((x) => x.id !== o.id)); };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center"><span className="lbl flex-1">איפה לקנות{list.length > 1 ? ` · ${list.length} חנויות` : ""}</span>
        {!adding && <button type="button" className="text-sm font-bold text-primary" onClick={() => setAdding(true)}>+ חנות</button>}</div>
      {list.length > 0 && (
        <div className="rounded-2xl border border-line divide-y divide-line-2">
          {list.map((o) => (
            <div key={o.id} className="flex items-center gap-3 px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <b className="block truncate">{o.store ?? "חנות"}{o === best && list.length > 1 && <span className="badge ms-2 text-[11px]" style={{ background: "var(--st-done-bg)", color: "var(--st-done)" }}>הכי זול</span>}</b>
                {o.variant && <span className="text-[13px] text-ink-3">{o.variant}</span>}
              </div>
              <b className="text-[17px]" dir="ltr">{money(o)}</b>
              {o.url && <a className="icon-btn" href={o.url} target="_blank" rel="noreferrer noopener" aria-label={`פתיחה ב${o.store ?? "חנות"}`}><Icon name="link" size={18} /></a>}
              <button type="button" className="icon-btn" aria-label="הסרה" onClick={() => remove(o)}><Icon name="close" size={16} /></button>
            </div>
          ))}
        </div>
      )}
      {list.length === 0 && !adding && <p className="text-[13px] text-ink-3">שתפו קישור לאותו מוצר מחנות אחרת — הוא יתווסף כאן להשוואה.</p>}
      {adding && (
        <div className="rounded-2xl bg-surface-2 p-3 grid grid-cols-2 gap-2">
          <input className="input" placeholder="חנות" value={f.store} onChange={(e) => setF({ ...f, store: e.target.value })} />
          <input className="input" placeholder="מחיר ₪" inputMode="decimal" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
          <input className="input col-span-2" placeholder="https://" dir="ltr" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
          <input className="input col-span-2" placeholder="צבע / גרסה (לא חובה)" value={f.variant} onChange={(e) => setF({ ...f, variant: e.target.value })} />
          <div className="col-span-2 flex gap-2 justify-end"><button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>ביטול</button><button type="button" className="btn btn-secondary" onClick={add}>הוספה</button></div>
        </div>
      )}
    </section>
  );
}
