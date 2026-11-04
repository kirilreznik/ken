import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const SET = { NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon" };

async function load(env: Record<string, string>, browser: boolean) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  const createClient = vi.fn(() => ({ fake: true }));
  vi.doMock("@supabase/supabase-js", () => ({ createClient }));
  if (browser) vi.stubGlobal("window", {});
  const mod = await import("@/lib/names/supabase");
  return { ...mod, createClient };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.doUnmock("@supabase/supabase-js");
});

describe("supabase browser client", () => {
  it("is not configured without the public variables", async () => {
    const { isConfigured, getSupabase, createClient } = await load(
      { NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_ANON_KEY: "" },
      true,
    );
    expect(isConfigured()).toBe(false);
    expect(getSupabase()).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("needs both variables", async () => {
    const { isConfigured } = await load({ ...SET, NEXT_PUBLIC_SUPABASE_ANON_KEY: " " }, true);
    expect(isConfigured()).toBe(false);
  });

  it("returns null on the server even when configured", async () => {
    const { isConfigured, getSupabase, createClient } = await load(SET, false);
    expect(isConfigured()).toBe(true);
    expect(getSupabase()).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("creates one PKCE client with the names storage key in the browser", async () => {
    const { getSupabase, createClient } = await load(SET, true);
    const a = getSupabase();
    const b = getSupabase();
    expect(a).not.toBeNull();
    expect(a).toBe(b);
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith(SET.NEXT_PUBLIC_SUPABASE_URL, SET.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "nest-names-auth",
      },
    });
  });
});

describe("service role key", () => {
  const roots = ["src/app/names", "src/components/names", "src/lib/names"];
  const serverDir = join("src", "lib", "names", "server") + sep;

  function files(dir: string): string[] {
    let out: string[] = [];
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return out;
    }
    for (const e of entries) {
      const p = join(dir, e);
      out = statSync(p).isDirectory() ? out.concat(files(p)) : out.concat(p);
    }
    return out;
  }

  it("never appears in client code", () => {
    const offenders = roots
      .flatMap(files)
      .filter((f) => !relative(".", f).startsWith(serverDir))
      .filter((f) => readFileSync(f, "utf8").includes("SUPABASE_SERVICE_ROLE_KEY"));
    expect(offenders).toEqual([]);
  });
});
