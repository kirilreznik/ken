/** Fallback when the service worker isn't active yet: keep the link/text, drop the file. */
export async function POST(req: Request) {
  const fd = await req.formData().catch(() => null);
  const q = new URLSearchParams({ from: "android" });
  for (const k of ["url", "text", "title"]) { const v = fd?.get(k); if (typeof v === "string" && v) q.set(k, v.slice(0, 2000)); }
  return Response.redirect(new URL(`/share?${q}`, req.url), 303);
}
