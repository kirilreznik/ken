import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Invite-only sign-ups (pregnancy-manager migration 0012). A new account is created only for a
 * visitor who came through an invite link: email sign-in sends the code as user_metadata, and
 * Google sign-in, which can't carry data through OAuth, first asks for an IP pass with
 * names_signup_pass(code). Neither changes anything for existing accounts.
 */

/** Sign-up data for signInWithOtp: the invite code, when there is one. */
export function signupData(join: string | null | undefined): { names_invite: string } | undefined {
  const code = join?.trim();
  return code ? { names_invite: code } : undefined;
}

/**
 * Asks for a sign-up pass before leaving for Google. Best effort: a failure (offline, an older
 * database without the RPC, a used code) only means Supabase refuses a NEW account later, which
 * the callback already shows as "sign-ups closed"; existing accounts sign in either way.
 */
export async function requestSignupPass(
  client: Pick<SupabaseClient, "rpc"> | null,
  join: string | null | undefined,
): Promise<boolean> {
  const code = join?.trim();
  if (!client || !code) return false;
  try {
    const { data, error } = await client.rpc("names_signup_pass", { p_code: code });
    return !error && data === true;
  } catch {
    return false;
  }
}
