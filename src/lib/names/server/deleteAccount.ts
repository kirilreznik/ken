import type { SupabaseClient } from "@supabase/supabase-js";

export const DELETE_WINDOW_MS = 60_000;

type Deps = {
  getAdmin: () => SupabaseClient | null;
  now?: () => number;
};

/** The access token from "Authorization: Bearer <token>", or null. */
export function bearerToken(header: string | null): string | null {
  const match = header?.match(/^Bearer\s+(\S+)\s*$/i);
  return match ? match[1] : null;
}

const empty = (status: number) => new Response(null, { status, headers: { "Cache-Control": "no-store" } });

/**
 * DELETE /api/names/account (PRD §6): verifies the bearer token, runs
 * prepare_account_deletion (votes, memberships, space hand-over) and deletes
 * the auth user. 204 / 401 / 429 / 500; errors carry no detail and nothing
 * about the user is logged.
 */
export function createDeleteAccount({ getAdmin, now = Date.now }: Deps) {
  // One call per user per minute; in-memory per server instance is enough.
  const lastCall = new Map<string, number>();

  return async function deleteAccount(request: Request): Promise<Response> {
    const token = bearerToken(request.headers.get("authorization"));
    if (!token) return empty(401);

    const admin = getAdmin();
    if (!admin) {
      console.error("names account deletion: service client not configured");
      return empty(500);
    }

    let userId: string;
    try {
      const { data, error } = await admin.auth.getUser(token);
      if (error || !data.user) return empty(401);
      userId = data.user.id;
    } catch {
      console.error("names account deletion: token check failed");
      return empty(500);
    }

    const t = now();
    for (const [id, at] of lastCall) if (t - at >= DELETE_WINDOW_MS) lastCall.delete(id);
    if (lastCall.has(userId)) return empty(429);
    lastCall.set(userId, t);

    try {
      const prepared = await admin.rpc("prepare_account_deletion", { p_user: userId });
      if (prepared.error) {
        console.error("names account deletion: prepare failed", prepared.error.code ?? "");
        return empty(500);
      }
      const deleted = await admin.auth.admin.deleteUser(userId);
      if (deleted.error) {
        console.error("names account deletion: delete failed", deleted.error.status ?? "");
        return empty(500);
      }
    } catch {
      console.error("names account deletion: request failed");
      return empty(500);
    }
    return empty(204);
  };
}
