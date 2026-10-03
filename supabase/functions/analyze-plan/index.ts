// קן · analyze-plan — reads the pregnancy follow-up plan (one or more PDFs/photos) with Claude
// and stores a structured list of appointments on plan_imports.result for the couple to review.
// Called explicitly from the import screen (the user chose to send the plan for analysis).
import { createClient } from "npm:@supabase/supabase-js@2";
import { encodeBase64 } from "jsr:@std/encoding@1/base64";

const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-5-5";
const MAX_FILES = 6;
const MAX_TOTAL = 25 * 1024 * 1024;
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const nullable = (t: string, description?: string) => ({ type: [t, "null"], ...(description ? { description } : {}) });

const TOOL = {
  name: "save_plan",
  description: "Save every appointment/test in the follow-up plan.",
  input_schema: {
    type: "object",
    properties: {
      due_date: nullable("string", "Estimated due date (YYYY-MM-DD) if written in the document"),
      clinic: nullable("string", "Clinic / doctor that issued the plan, as written"),
      general_notes: nullable("string", "Short Hebrew note about anything general in the plan (e.g. 'כל הבדיקות בהפניה מהקופה'), or null"),
      items: {
        type: "array", maxItems: 40,
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "Short Hebrew name of the test/visit, as commonly called in Israel (e.g. 'שקיפות עורפית', 'סקירת מערכות מוקדמת', 'העמסת סוכר 100 גרם', 'ביקור אצל רופא/ת נשים')" },
            kind: { type: "string", enum: ["doctor", "ultrasound", "blood", "genetic", "medical", "other"] },
            window_start_week: nullable("integer", "First pregnancy week the test should be done"),
            window_end_week: nullable("integer", "Last pregnancy week the test should be done (inclusive)"),
            window_start_date: nullable("string", "If the plan gives calendar dates instead of weeks: YYYY-MM-DD"),
            window_end_date: nullable("string", "YYYY-MM-DD"),
            book_by_week: nullable("integer", "Week by which it should be BOOKED, only if the plan says so (e.g. 'לקבוע תור עד שבוע 10')"),
            date: nullable("string", "Exact appointment date if one is already set (YYYY-MM-DD)"),
            time: nullable("string", "HH:MM if set"),
            location: nullable("string"),
            notes: nullable("string", "Preparation or instructions in Hebrew (fasting, referral needed, bring results), short"),
            optional: { type: "boolean", description: "True if the plan marks it as optional / by choice / recommended only for some" },
            match_id: nullable("string", "id of an EXISTING appointment (from the list given) that is the same test; null if new"),
          },
          required: ["title", "kind", "optional"],
        },
      },
    },
    required: ["items"],
  },
};

const SYSTEM = `You turn an Israeli pregnancy follow-up plan ("תוכנית מעקב הריון", usually handed out at the first visit at the HMO / women's health clinic) into structured appointments for a couple's organiser app.
Rules:
- Extract only tests/visits that appear in the document. Do not add standard tests the document does not mention.
- One item per distinct test or visit. If a plan lists recurring doctor visits ("ביקור כל 4–6 שבועות"), create one item per visit with its week window when weeks are given; otherwise one item with a note.
- Prefer pregnancy weeks. If the plan uses calendar dates, fill window_start_date/window_end_date instead.
- Never give medical advice or interpret results. Hebrew for all free text.
- Use match_id only when an existing appointment is clearly the same test (same purpose, overlapping timing). Never invent ids.
- Call save_plan exactly once.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const auth = req.headers.get("authorization");
  if (!auth) return json({ error: "unauthorized" }, 401);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });

  let id = "";
  try { id = String((await req.json()).import_id ?? ""); } catch { /* empty */ }
  if (!id) return json({ error: "import_id required" }, 400);

  const { data: imp } = await sb.from("plan_imports").select("*").eq("id", id).maybeSingle();
  if (!imp) return json({ error: "not found" }, 404);
  const fail = async (code: string, status = 500) => {
    await sb.from("plan_imports").update({ status: "failed", error: code, updated_at: new Date().toISOString() }).eq("id", id);
    return json({ error: code }, status);
  };

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return fail("no_key", 503);

  const [{ data: space }, { data: docs }, { data: appts }] = await Promise.all([
    sb.from("spaces").select("due_date").eq("id", imp.space_id).maybeSingle(),
    sb.from("documents").select("id, storage_path, mime_type, size_bytes").in("id", imp.document_ids ?? []),
    sb.from("appointments").select("id, title, kind, status, window_start_week, window_end_week, starts_at").eq("space_id", imp.space_id),
  ]);
  if (!space || !docs?.length) return fail("no_documents", 400);
  if (docs.length > MAX_FILES) return fail("too_many_files", 413);
  if (docs.reduce((n, d) => n + (d.size_bytes ?? 0), 0) > MAX_TOTAL) return fail("too_large", 413);

  const content: unknown[] = [];
  for (const d of docs) {
    const mime = d.mime_type ?? "";
    const isPdf = mime.includes("pdf");
    if (!isPdf && !/^image\/(jpeg|png|webp|gif)$/.test(mime)) return fail("unsupported", 415);
    const { data: blob, error } = await sb.storage.from("documents").download(d.storage_path);
    if (error || !blob) return fail("download");
    content.push({ type: isPdf ? "document" : "image", source: { type: "base64", media_type: isPdf ? "application/pdf" : mime, data: encodeBase64(new Uint8Array(await blob.arrayBuffer())) } });
  }
  const today = new Date().toISOString().slice(0, 10);
  content.push({ type: "text", text:
    `Today is ${today}. The couple's estimated due date is ${space.due_date}.\n` +
    `Existing appointments in the app (for match_id):\n${JSON.stringify(appts ?? [])}\n` +
    `Read the plan above (${docs.length} file(s), possibly several pages of one plan) and call save_plan.` });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: 6000, system: SYSTEM, tools: [TOOL], tool_choice: { type: "tool", name: "save_plan" }, messages: [{ role: "user", content }] }),
  });
  if (!res.ok) {
    console.error("[analyze-plan] anthropic", res.status, (await res.text()).slice(0, 500));
    return fail(res.status === 401 ? "bad_key" : "model", 502);
  }
  const out = await res.json();
  const use = (out.content ?? []).find((c: { type: string }) => c.type === "tool_use");
  if (!use?.input?.items) return fail("no_result", 502);

  const known = new Set((appts ?? []).map((a) => a.id));
  const result = { ...use.input, items: use.input.items.map((it: { match_id?: string | null }) => ({ ...it, match_id: it.match_id && known.has(it.match_id) ? it.match_id : null })), model: MODEL, at: new Date().toISOString() };
  const { error: upErr } = await sb.from("plan_imports").update({ status: "ready", result, error: null, updated_at: new Date().toISOString() }).eq("id", id);
  if (upErr) return fail("save");
  return json({ ok: true, result });
});
