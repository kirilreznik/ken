// קן · read-document — reads an uploaded PDF/image with Claude and stores *suggestions*
// (title, category, date, provider, plain summary, values, follow-ups) on documents.ai_suggestion.
// Nothing is applied automatically; the couple reviews and accepts in the app.
// Opt-in per space (spaces.ai_reading_enabled). Requires the ANTHROPIC_API_KEY secret.
import { createClient } from "npm:@supabase/supabase-js@2";
import { encodeBase64 } from "jsr:@std/encoding@1/base64";

const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-5-5";
const MAX_BYTES = 20 * 1024 * 1024;
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const TOOL = {
  name: "save_reading",
  description: "Save what the document says, in Hebrew.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Short Hebrew title, e.g. 'ספירת דם ופריטין' or 'סקירת מערכות מוקדמת'" },
      category: { type: "string", enum: ["blood", "ultrasound", "scan", "genetic", "referral", "summary", "receipt", "other"] },
      doc_date: { type: ["string", "null"], description: "Date of the test/visit as YYYY-MM-DD, or null if not written" },
      provider: { type: ["string", "null"], description: "Doctor, clinic or lab as written, or null" },
      summary: { type: "string", description: "1–3 plain Hebrew sentences describing what the document is and what it reports. No diagnosis, no advice." },
      values: {
        type: "array", maxItems: 30,
        items: {
          type: "object",
          properties: {
            name: { type: "string" }, value: { type: "string" }, unit: { type: ["string", "null"] },
            reference: { type: ["string", "null"], description: "Reference range exactly as printed" },
            flag: { type: "string", enum: ["normal", "high", "low", "flagged", "none"], description: "Only what the document itself marks; 'none' if not marked" },
          },
          required: ["name", "value", "flag"],
        },
      },
      follow_ups: {
        type: "array", maxItems: 6,
        description: "Action items explicitly written in the document (repeat a test, book a referral, bring something). Hebrew, imperative.",
        items: { type: "object", properties: { title: { type: "string" }, due_date: { type: ["string", "null"] } }, required: ["title"] },
      },
    },
    required: ["title", "category", "summary", "values", "follow_ups"],
  },
};

const SYSTEM = `You read Israeli pregnancy-related medical documents (lab results, ultrasound reports, referrals, doctor summaries, receipts) for an expecting couple's organiser app.
Extract only what is written. Never diagnose, interpret risk, or give medical advice; if a value is marked abnormal, report the mark, not a meaning.
Write all free text in Hebrew. Keep test names as printed (Hebrew or English). Use the save_reading tool exactly once.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const auth = req.headers.get("authorization");
  if (!auth) return json({ error: "unauthorized" }, 401);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });

  let id = "";
  try { id = String((await req.json()).document_id ?? ""); } catch { /* empty */ }
  if (!id) return json({ error: "document_id required" }, 400);

  // RLS: only members of the document's space can read it.
  const { data: doc } = await sb.from("documents").select("*").eq("id", id).maybeSingle();
  if (!doc) return json({ error: "not found" }, 404);
  const { data: space } = await sb.from("spaces").select("ai_reading_enabled").eq("id", doc.space_id).maybeSingle();
  if (!space?.ai_reading_enabled) return json({ error: "disabled" }, 403);
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "no_key" }, 503);

  const mime: string = doc.mime_type ?? "";
  const isPdf = mime.includes("pdf");
  const isImg = /^image\/(jpeg|png|webp|gif)$/.test(mime);
  if (!isPdf && !isImg) return json({ error: "unsupported" }, 415);
  if ((doc.size_bytes ?? 0) > MAX_BYTES) return json({ error: "too_large" }, 413);

  const fail = async (msg: string, status = 500) => {
    await sb.from("documents").update({ ai_status: "failed", ai_suggestion: { error: msg, at: new Date().toISOString() } }).eq("id", id);
    return json({ error: msg }, status);
  };

  await sb.from("documents").update({ ai_status: "pending" }).eq("id", id);
  const { data: blob, error: dlErr } = await sb.storage.from("documents").download(doc.storage_path);
  if (dlErr || !blob) return fail("download");
  const b64 = encodeBase64(new Uint8Array(await blob.arrayBuffer()));

  const source = { type: "base64", media_type: isPdf ? "application/pdf" : mime, data: b64 };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 6000,
      system: SYSTEM,
      tools: [TOOL],
      tool_choice: { type: "auto" },
      messages: [{ role: "user", content: [
        { type: isPdf ? "document" : "image", source },
        { type: "text", text: `The couple titled this upload "${doc.title}". Read it and call save_reading.` },
      ] }],
    }),
  });
  if (!res.ok) {
    console.error("[read-document] anthropic", res.status, (await res.text()).slice(0, 500));
    return fail(res.status === 401 ? "bad_key" : "model", 502);
  }
  const out = await res.json();
  const use = (out.content ?? []).find((c: { type: string }) => c.type === "tool_use");
  if (!use?.input) return fail("no_result", 502);

  const suggestion = { ...use.input, model: MODEL, at: new Date().toISOString() };
  const { error: upErr } = await sb.from("documents").update({ ai_status: "done", ai_suggestion: suggestion }).eq("id", id);
  if (upErr) return fail("save");
  return json({ ok: true, suggestion });
});
