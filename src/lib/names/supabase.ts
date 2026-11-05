import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Read through literal process.env.NEXT_PUBLIC_* so Next inlines them at build time.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const AUTH_STORAGE_KEY = "nest-names-auth";

/** True when the browser client has both public Supabase variables. */
export function isConfigured(): boolean {
  return url.trim() !== "" && anonKey.trim() !== "";
}

let client: SupabaseClient | null = null;

/**
 * The single browser Supabase client. Returns null on the server and when the
 * public variables are missing, so callers render the unconfigured state instead.
 */
export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined" || !isConfigured()) return null;
  client ??= createClient(url, anonKey, {
    auth: {
      flowType: "pkce",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: AUTH_STORAGE_KEY,
    },
  });
  return client;
}
