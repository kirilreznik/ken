// קן · triage-product — something was shared into Ken (link, text or screenshot).
// Reads the product page, asks Claude what it is, and files it automatically:
//   • same product (any colour/version) already listed → extra store offer for price comparison
//   • generic placeholder ("עגלה") still empty → filled with this product
//   • otherwise → new item in the right category (grouped with similar products for comparison)
// Callers: the app (user JWT + inbox_id) or the iPhone Shortcut (capture token + url/text/file).
import { createClient } from "npm:@supabase/supabase-js@2";
import { encodeBase64 } from "jsr:@std/encoding@1/base64";

const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-5-5";
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const plain = (t: string, status = 200) => new Response(t, { status, headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8" } });

const CAT_LABEL: Record<string, string> = { stroller: "עגלה", car_seat: "כיסא בטיחות", sleep: "שינה", clothes: "בגדים", bath: "אמבטיה", feeding: "האכלה", nursery: "חדר תינוק", birth_bag: "תיק לידה", misc: "שונות" };
const ERR: Record<string, string> = { no_key: "הסיווג האוטומטי עוד לא הוגדר", empty: "לא התקבל קישור או תמונה", not_product: "לא זיהינו כאן מוצר", model: "הסיווג נכשל — נסו שוב", token: "הקיצור לא מחובר — צרו קישור חדש בהגדרות של קן" };

const nis = (n: number) => `₪${Math.round(n).toLocaleString("he-IL")}`;
const hostOf = (u?: string | null) => { try { return new URL(u!).hostname.replace(/^www\./, ""); } catch { return null; } };
const firstUrl = (t?: string | null) => t?.match(/https?:\/\/[^\s<>"']+/)?.[0]?.replace(/[).,]+$/, "") ?? null;

function safeUrl(u: string) {
  try {
    const x = new URL(u);
    if (!/^https?:$/.test(x.protocol)) return null;
    const h = x.hostname;
    if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[)/.test(h)) return null;
    return x.toString();
  } catch { return null; }
}

const decode = (s: string) => s.replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

// deno-lint-ignore no-explicit-any
function findProduct(node: any): any {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) { for (const n of node) { const p = findProduct(n); if (p) return p; } return null; }
  const t = node["@type"];
  if (t === "Product" || (Array.isArray(t) && t.includes("Product"))) return node;
  return findProduct(node["@graph"]) ?? null;
}

async function fetchPage(url: string) {
  const ok = safeUrl(url);
  if (!ok) return null;
  const res = await fetch(ok, {
    redirect: "follow", signal: AbortSignal.timeout(9000),
    headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1", "Accept-Language": "he-IL,he;q=0.9,en;q=0.8", Accept: "text/html,application/xhtml+xml" },
  });
  if (!res.ok || !(res.headers.get("content-type") ?? "").includes("html")) return { final_url: res.url, status: res.status };
  const html = (await res.text()).slice(0, 1_500_000);
  const meta: Record<string, string> = {};
  for (const tag of html.match(/<meta\s[^>]*>/gi) ?? []) {
    const k = tag.match(/(?:property|name|itemprop)\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
    const v = tag.match(/content\s*=\s*["']([^"']*)["']/i)?.[1];
    if (k && v && !meta[k]) meta[k] = decode(v);
  }
  // deno-lint-ignore no-explicit-any
  let product: any = null;
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { product = findProduct(JSON.parse(m[1].trim())); } catch { /* ignore */ }
    if (product) break;
  }
  const offers = product ? (Array.isArray(product.offers) ? product.offers[0] : product.offers) : null;
  const text = decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim().slice(0, 5000);
  const img = product?.image ? (Array.isArray(product.image) ? product.image[0] : typeof product.image === "object" ? product.image.url : product.image) : null;
  return {
    final_url: res.url,
    title: meta["og:title"] ?? decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? ""),
    site: meta["og:site_name"] ?? hostOf(res.url),
    description: meta["og:description"] ?? meta["description"] ?? null,
    image: meta["og:image"] ?? meta["og:image:secure_url"] ?? img ?? null,
    price: meta["product:price:amount"] ?? meta["og:price:amount"] ?? offers?.price ?? offers?.lowPrice ?? null,
    currency: meta["product:price:currency"] ?? meta["og:price:currency"] ?? offers?.priceCurrency ?? null,
    product: product ? { name: product.name, brand: product.brand?.name ?? product.brand, sku: product.sku, model: product.model, color: product.color } : null,
    text,
  };
}

const nullable = (t: string, description?: string) => ({ type: [t, "null"], ...(description ? { description } : {}) });
const TOOL = {
  name: "save_product",
  description: "File the shared product into the couple's baby-prep list.",
  input_schema: {
    type: "object",
    properties: {
      is_product: { type: "boolean", description: "False if this isn't a product someone could buy" },
      title: { type: "string", description: "Short Hebrew display name with brand and model when known, e.g. 'עגלת Bugaboo Fox 5' or 'כיסא בטיחות Cybex Cloud T'" },
      generic_name: { type: "string", description: "Hebrew generic item name, e.g. 'עגלה משולבת', 'כיסא בטיחות לתינוק', 'מיטת תינוק'" },
      brand: nullable("string"), model: nullable("string"),
      variant: nullable("string", "Colour / size / version of this listing, e.g. 'שחור', 'Mineral Taupe', '2024'"),
      category: { type: "string", enum: Object.keys(CAT_LABEL) },
      price: nullable("number", "Current selling price as shown (after discount), number only"),
      currency: nullable("string", "ISO code; ₪ = ILS"),
      store: nullable("string", "Store / site name as people call it, e.g. 'שילב', 'בייבי סטאר', 'Amazon'"),
      image_url: nullable("string", "Main product image URL from the page, if any"),
      summary: { type: "string", description: "1–2 Hebrew sentences: what it is and the 2–3 facts that matter for choosing" },
      match_type: { type: "string", enum: ["offer", "fill", "new"], description: "offer = the SAME product (same brand+model, any colour/version) is already in the list; fill = an empty generic placeholder in the list is exactly this kind of item; new = otherwise" },
      match_item_id: nullable("string", "id of the existing item for offer/fill"),
      compare_with_id: nullable("string", "For new: id of an existing DIFFERENT product that serves the same purpose (e.g. another stroller) to compare against"),
    },
    required: ["is_product", "title", "generic_name", "category", "summary", "match_type"],
  },
};
const SYSTEM = `You file products that an expecting Israeli couple shares into their baby-prep shopping list.
Use only what the page/screenshot shows. Prices: the current price shown to buyers (sale price if discounted).
Matching rules:
- "offer": an existing item is the same product (same brand and model). Different colour, fabric, bundle or year still counts as the same product.
- "fill": an existing item is a generic placeholder (no brand/model/url) for exactly this kind of thing (e.g. placeholder "עגלה" and the shared item is a stroller). Prefer the placeholder over creating a new item.
- "new": anything else. If another specific product in the list serves the same purpose, give its id in compare_with_id.
Never invent ids. Hebrew for all free text. Always call save_product exactly once.`;

async function storeImage(spaceId: string, name: string, src: string) {
  const ok = safeUrl(src);
  if (!ok) return null;
  try {
    const r = await fetch(ok, { signal: AbortSignal.timeout(8000) });
    const type = r.headers.get("content-type") ?? "";
    if (!r.ok || !type.startsWith("image/")) return null;
    const buf = new Uint8Array(await r.arrayBuffer());
    if (buf.byteLength > 4_000_000) return null;
    const path = `${spaceId}/prep/${name}.${type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg"}`;
    const { error } = await admin.storage.from("media").upload(path, buf, { contentType: type, upsert: true });
    return error ? null : path;
  } catch { return null; }
}

// deno-lint-ignore no-explicit-any
async function processInbox(row: any): Promise<{ ok: boolean; message: string; [k: string]: unknown }> {
  const fail = async (code: string) => {
    await admin.from("prep_inbox").update({ status: "failed", error: code, updated_at: new Date().toISOString() }).eq("id", row.id);
    return { ok: false, error: code, message: ERR[code] ?? ERR.model };
  };
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return fail("no_key");
  const url = row.url || firstUrl(row.text);
  if (!url && !row.image_path && !row.text) return fail("empty");

  let page = null;
  if (url) { try { page = await fetchPage(url); } catch (e) { console.error("[triage] fetch", String(e)); } }

  const content: unknown[] = [];
  if (row.image_path) {
    const { data: blob } = await admin.storage.from("media").download(row.image_path);
    if (blob && blob.size < 5_000_000) content.push({ type: "image", source: { type: "base64", media_type: blob.type || "image/jpeg", data: encodeBase64(new Uint8Array(await blob.arrayBuffer())) } });
  }
  const [{ data: items }, { data: offers }] = await Promise.all([
    admin.from("prep_items").select("id, title, category, status, url, brand, model, price, compare_group, image_path, notes").eq("space_id", row.space_id),
    admin.from("prep_offers").select("id, item_id, store, price").eq("space_id", row.space_id),
  ]);
  const list = (items ?? []).map((i) => ({ id: i.id, title: i.title, category: i.category, status: i.status, brand: i.brand, model: i.model, has_url: !!i.url, stores: (offers ?? []).filter((o) => o.item_id === i.id).map((o) => o.store) }));
  content.push({ type: "text", text: `Shared: ${JSON.stringify({ url, text: row.text?.slice(0, 1000) ?? null })}\nPage: ${JSON.stringify(page)}\nCurrent list: ${JSON.stringify(list)}\nCall save_product.` });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: 4000, system: SYSTEM, tools: [TOOL], tool_choice: { type: "auto" }, messages: [{ role: "user", content }] }),
  });
  if (!res.ok) { console.error("[triage] anthropic", res.status, (await res.text()).slice(0, 400)); return fail("model"); }
  const out = await res.json();
  // deno-lint-ignore no-explicit-any
  const r = (out.content ?? []).find((c: any) => c.type === "tool_use")?.input;
  if (!r) { console.error("[triage] no tool_use", JSON.stringify(out.content ?? []).slice(0, 400)); return fail("model"); }
  if (!r.is_product) return fail("not_product");

  const category = CAT_LABEL[r.category] ? r.category : "misc";
  const productUrl = (page as { final_url?: string } | null)?.final_url || url || null;
  const store = r.store || (page as { site?: string } | null)?.site || hostOf(productUrl);
  const currency = (r.currency || "ILS").toUpperCase();
  const price = typeof r.price === "number" && r.price > 0 ? r.price : null;
  const priceILS = currency === "ILS" ? price : null;
  const byId = new Map((items ?? []).map((i) => [i.id, i]));
  const target = r.match_item_id ? byId.get(r.match_item_id) : null;
  const now = new Date().toISOString();
  const offerRow = (itemId: string) => ({ space_id: row.space_id, item_id: itemId, store, url: productUrl, price, currency, variant: r.variant ?? null, image_url: r.image_url ?? (page as { image?: string } | null)?.image ?? null, source: "share", created_by: row.created_by });

  let action: "new" | "offer" | "fill"; let itemId: string; let message: string; let prev: unknown = null;
  if (r.match_type === "offer" && target) {
    action = "offer"; itemId = target.id;
    if (target.url && !(offers ?? []).some((o) => o.item_id === target.id)) {
      await admin.from("prep_offers").insert({ space_id: row.space_id, item_id: target.id, store: hostOf(target.url), url: target.url, price: target.price, source: "manual", created_by: row.created_by });
    }
    message = `נוספה חנות ל־${target.title}: ${store ?? "חנות"}${price ? ` · ${currency === "ILS" ? nis(price) : `${price} ${currency}`}` : ""}`;
  } else if (r.match_type === "fill" && target && !target.url && !target.brand) {
    action = "fill"; itemId = target.id;
    prev = { title: target.title, status: target.status, price: target.price, url: target.url, brand: target.brand, model: target.model, notes: target.notes, compare_group: target.compare_group };
    await admin.from("prep_items").update({ title: r.title, brand: r.brand ?? null, model: r.model ?? null, url: productUrl, price: priceILS, status: target.status === "need" ? "reviewing" : target.status, notes: target.notes ?? r.summary, source: "share", updated_at: now }).eq("id", target.id);
    message = `עודכן ״${target.title}״: ${r.title}${priceILS ? ` · ${nis(priceILS)}` : ""}`;
  } else {
    action = "new";
    const peer = r.compare_with_id ? byId.get(r.compare_with_id) : null;
    const group = peer ? (peer.compare_group || r.generic_name) : null;
    if (peer && !peer.compare_group) await admin.from("prep_items").update({ compare_group: group }).eq("id", peer.id);
    const { data: created, error } = await admin.from("prep_items").insert({
      space_id: row.space_id, title: r.title, category, status: "reviewing", price: priceILS, url: productUrl, notes: r.summary,
      brand: r.brand ?? null, model: r.model ?? null, source: "share", compare_group: group, quantity: 1, sort: Date.now() / 1000, created_by: row.created_by,
    }).select("id").single();
    if (error || !created) { console.error("[triage] insert", error?.message); return fail("model"); }
    itemId = created.id;
    message = `נוסף ל${CAT_LABEL[category]}: ${r.title}${priceILS ? ` · ${nis(priceILS)}` : ""}`;
  }

  const { data: offer } = await admin.from("prep_offers").insert(offerRow(itemId)).select("id").single();

  // Keep the item's price = cheapest ₪ offer.
  const { data: prices } = await admin.from("prep_offers").select("price").eq("item_id", itemId).eq("currency", "ILS").not("price", "is", null);
  const min = Math.min(...(prices ?? []).map((p) => Number(p.price)));
  if (Number.isFinite(min)) await admin.from("prep_items").update({ price: min }).eq("id", itemId);

  // Product photo for new / filled items.
  if (action !== "offer" && !(target?.image_path)) {
    const src = r.image_url || (page as { image?: string } | null)?.image;
    const path = (src && await storeImage(row.space_id, `${itemId}-${Date.now()}`, src)) || (action === "new" ? row.image_path : null);
    if (path) await admin.from("prep_items").update({ image_path: path }).eq("id", itemId);
  }

  await admin.from("prep_inbox").update({
    status: "done", action, item_id: itemId, offer_id: offer?.id ?? null, error: null, updated_at: now,
    result: { title: r.title, generic_name: r.generic_name, category, brand: r.brand, model: r.model, variant: r.variant, price, currency, store, summary: r.summary, message, prev },
  }).eq("id", row.id);
  return { ok: true, message, action, item_id: itemId };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const ctype = req.headers.get("content-type") ?? "";
    let token = "", inboxId = "", url = "", text = "";
    let file: File | null = null;
    if (ctype.includes("multipart/form-data") || ctype.includes("application/x-www-form-urlencoded")) {
      const fd = await req.formData();
      token = String(fd.get("token") ?? ""); url = String(fd.get("url") ?? ""); text = String(fd.get("text") ?? "");
      const f = fd.get("file") ?? fd.get("image");
      if (f && typeof f !== "string") file = f;
    } else {
      const b = await req.json().catch(() => ({}));
      token = b.token ?? ""; inboxId = b.inbox_id ?? ""; url = b.url ?? ""; text = b.text ?? "";
    }

    // iPhone Shortcut: personal token → new inbox row → plain-text answer for the notification.
    if (token) {
      const { data: t } = await admin.from("capture_tokens").select("*").eq("token", token).maybeSingle();
      if (!t) return plain(ERR.token, 401);
      await admin.from("capture_tokens").update({ last_used_at: new Date().toISOString() }).eq("token", token);
      if (!url) url = firstUrl(text) ?? "";
      const { data: row, error } = await admin.from("prep_inbox").insert({ space_id: t.space_id, created_by: t.user_id, url: url || null, text: text || null, via: "shortcut" }).select("*").single();
      if (error || !row) return plain("לא הצלחנו לשמור", 500);
      if (file && file.type.startsWith("image/") && file.size < 8_000_000) {
        const path = `${t.space_id}/inbox/${row.id}.${file.type.includes("png") ? "png" : "jpg"}`;
        const up = await admin.storage.from("media").upload(path, new Uint8Array(await file.arrayBuffer()), { contentType: file.type, upsert: true });
        if (!up.error) { await admin.from("prep_inbox").update({ image_path: path }).eq("id", row.id); row.image_path = path; }
      }
      const r = await processInbox(row);
      return plain(r.ok ? `קן ✓ ${r.message}` : `קן: ${r.message}`, 200);
    }

    // App: signed-in member processes an inbox row it created.
    const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: u } = jwt ? await admin.auth.getUser(jwt) : { data: { user: null } };
    if (!u?.user) return json({ error: "unauthorized" }, 401);
    const { data: row } = await admin.from("prep_inbox").select("*").eq("id", inboxId).maybeSingle();
    if (!row) return json({ error: "not found" }, 404);
    const { data: member } = await admin.from("space_members").select("user_id").eq("space_id", row.space_id).eq("user_id", u.user.id).maybeSingle();
    if (!member) return json({ error: "forbidden" }, 403);
    await admin.from("prep_inbox").update({ status: "pending", error: null, updated_at: new Date().toISOString() }).eq("id", row.id);
    return json(await processInbox(row));
  } catch (e) {
    console.error("[triage] crash", String(e));
    return json({ error: "crash" }, 500);
  }
});
