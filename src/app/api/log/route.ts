/** Receives scrubbed client error reports and writes them to Vercel Runtime Logs. */
export async function POST(req: Request) {
  const text = await req.text();
  if (text.length > 8_000) return new Response(null, { status: 413 });
  let data: Record<string, unknown>;
  try { data = JSON.parse(text); } catch { return new Response(null, { status: 400 }); }
  const area = typeof data.area === "string" ? data.area : "unknown";
  console.error(`[client-error] ${area} ${String(data.path ?? "")} — ${String(data.message ?? "")}`, JSON.stringify(data));
  return new Response(null, { status: 204 });
}
