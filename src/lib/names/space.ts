import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/names/supabase";

/** A person in the user's space, as `space_members` stores them. */
export interface SpaceMember {
  userId: string;
  displayName: string;
  joinedAt: string;
}

interface MemberRow {
  user_id: string;
  display_name: string | null;
  joined_at: string;
}

// Session caches: one space per signed-in user, one member list per space.
let spaceCache: { userId: string; promise: Promise<string> } | null = null;
const memberCache = new Map<string, Promise<SpaceMember[]>>();

function requireClient(client: SupabaseClient | null): SupabaseClient {
  if (!client) throw new Error("supabase unavailable");
  return client;
}

/** Keeps a promise in a cache only while it hasn't failed, so the next call retries. */
function cacheUntilFailed<T>(promise: Promise<T>, drop: () => void): Promise<T> {
  promise.catch(drop);
  return promise;
}

/**
 * The user's active space id (PRD §3.2.4): `names_space` returns the space joined
 * last or creates a names space. Never sends a due date. Cached for the session.
 */
export async function ensureSpace(displayName: string, client = getSupabase()): Promise<string> {
  const supabase = requireClient(client);
  const { data: auth } = await supabase.auth.getSession();
  const userId = auth.session?.user.id;
  if (!userId) throw new Error("not signed in");
  if (spaceCache?.userId === userId) return spaceCache.promise;

  const promise = (async () => {
    const { data, error } = await supabase.rpc("names_space", { p_display_name: displayName });
    if (error) throw error;
    if (typeof data !== "string" || data === "") throw new Error("names_space returned no id");
    return data;
  })();
  const entry = { userId, promise };
  spaceCache = entry;
  return cacheUntilFailed(promise, () => {
    if (spaceCache === entry) spaceCache = null;
  });
}

/** Everyone in the space, oldest member first. Cached for the session; `force` refetches. */
export function members(spaceId: string, { force = false, client = getSupabase() } = {}): Promise<SpaceMember[]> {
  const cached = memberCache.get(spaceId);
  if (cached && !force) return cached;

  const promise = (async () => {
    const { data, error } = await requireClient(client)
      .from("space_members")
      .select("user_id, display_name, joined_at")
      .eq("space_id", spaceId)
      .order("joined_at", { ascending: true });
    if (error) throw error;
    return ((data ?? []) as MemberRow[]).map((row) => ({
      userId: row.user_id,
      displayName: row.display_name ?? "",
      joinedAt: row.joined_at,
    }));
  })();
  memberCache.set(spaceId, promise);
  return cacheUntilFailed(promise, () => {
    if (memberCache.get(spaceId) === promise) memberCache.delete(spaceId);
  });
}

/** A space with two or more members is shared: matches and the shared copy show. */
export function isSharedSpace(list: readonly SpaceMember[]): boolean {
  return list.length >= 2;
}

/** Drops the cached space and members (sign-out, join, account deletion). */
export function clearSpaceCache(): void {
  spaceCache = null;
  memberCache.clear();
}
