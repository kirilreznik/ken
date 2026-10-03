import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // Surfaced in the UI by <ConfigGate>; avoids a crash during build/prerender.
  console.warn("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
}

export const supabaseConfigured = Boolean(url && anon);

export const supabase = createClient(url ?? "http://localhost:54321", anon ?? "public-anon-key-missing", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export const DOCS_BUCKET = "documents";
export const MEDIA_BUCKET = "media";
