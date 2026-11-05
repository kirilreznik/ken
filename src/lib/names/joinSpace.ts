import type { SupabaseClient } from "@supabase/supabase-js";
import { clearInviteCache } from "./invite";
import { clearPendingJoin, isInvalidCodeError, joinOutcome, normalizeJoinCode, type JoinOutcome } from "./join";
import { clearSpaceCache, ensureSpace, members } from "./space";
import { getSupabase } from "./supabase";

/** Saved (keep or love) votes the user has in a space; 0 when the count can't be read. */
async function savedCount(client: SupabaseClient, spaceId: string): Promise<number> {
  const { count, error } = await client
    .from("name_votes")
    .select("name", { count: "exact", head: true })
    .eq("space_id", spaceId)
    .in("vote", ["keep", "love"]);
  return error ? 0 : (count ?? 0);
}

/** Where the user stands before joining: their space, whether it is solo, and how many names they saved there. */
async function currentSpace(client: SupabaseClient, displayName: string) {
  try {
    const spaceId = await ensureSpace(displayName, client);
    const list = await members(spaceId, { client });
    const solo = list.length < 2;
    return { spaceId, solo, saved: solo ? await savedCount(client, spaceId) : 0 };
  } catch {
    return { spaceId: null, solo: false, saved: 0 };
  }
}

async function run(code: string, displayName: string, client: SupabaseClient): Promise<JoinOutcome> {
  const before = await currentSpace(client, displayName);
  const { data, error } = await client.rpc("names_join", { p_code: code, p_display_name: displayName });
  if (error) {
    if (!isInvalidCodeError(error)) return { kind: "error" };
    clearPendingJoin();
    return { kind: "invalid" };
  }
  if (typeof data !== "string" || data === "") return { kind: "error" };
  // The active space changed (or gained a member): every cached space, member list and invite is stale.
  clearPendingJoin();
  clearSpaceCache();
  clearInviteCache();
  return joinOutcome(before, data);
}

// One names_join per user and code for the page's life, so a re-render or a second effect
// run never spends the single-use code twice. Errors are dropped so "ניסיון חוזר" retries.
const inFlight = new Map<string, Promise<JoinOutcome>>();

/** FR-W24: joins the space behind an invite code (names_join moves solo votes along). */
export function joinWithCode(userId: string, rawCode: string, displayName: string, client = getSupabase()): Promise<JoinOutcome> {
  const code = normalizeJoinCode(rawCode);
  if (!code) {
    clearPendingJoin();
    return Promise.resolve({ kind: "invalid" });
  }
  if (typeof navigator !== "undefined" && navigator.onLine === false) return Promise.resolve({ kind: "offline" });
  if (!client) return Promise.resolve({ kind: "error" });

  const key = `${userId}:${code}`;
  const cached = inFlight.get(key);
  if (cached) return cached;
  const promise = run(code, displayName, client).catch((): JoinOutcome => ({ kind: "error" }));
  inFlight.set(key, promise);
  void promise.then((outcome) => {
    if (outcome.kind === "error" && inFlight.get(key) === promise) inFlight.delete(key);
  });
  return promise;
}
