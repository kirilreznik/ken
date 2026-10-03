import { createClient } from "@supabase/supabase-js";
import { buildIcs, type FeedData } from "@/lib/ics";

export const dynamic = "force-dynamic";

/** Subscribed calendar feed: /api/calendar/<token>.ics — the token is a revocable capability. */
export async function GET(req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const token = file.replace(/\.ics$/i, "");
  if (!/^[a-f0-9]{32,128}$/.test(token)) return new Response("Not found", { status: 404 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return new Response("Not configured", { status: 503 });

  const sb = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.rpc("calendar_feed", { token });
  if (error) {
    console.error("[calendar-feed]", error.message);
    return new Response("Error", { status: 500 });
  }
  if (!data) return new Response("Not found", { status: 404 });

  const body = buildIcs(data as FeedData, { host: new URL(req.url).host });
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="ken.ics"',
      "Cache-Control": "private, max-age=900",
      "X-Robots-Tag": "noindex",
    },
  });
}
