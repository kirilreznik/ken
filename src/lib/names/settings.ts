import type { SupabaseClient } from "@supabase/supabase-js";
import { clearSpaceCache } from "@/lib/names/space";

type UserLike = {
  email?: string | null;
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
};

export const NAME_SAVED_TEXT = "השם נשמר";
export const OPT_IN_ON_TEXT = "העדכונים הופעלו";
export const OPT_IN_OFF_TEXT = "העדכונים כובו";
export const SETTINGS_OFFLINE_TEXT = "אין חיבור לאינטרנט. אפשר לשמור שוב כשהחיבור יחזור.";
export const SETTINGS_ERROR_TEXT = "לא הצלחנו לשמור. אפשר לנסות שוב.";

/** How the user signs in (FR-W25): Google, or the email the code goes to. */
export type SignInMethod = { kind: "google" } | { kind: "email"; email: string };

export function signInMethod(user: UserLike | null | undefined): SignInMethod {
  const app = user?.app_metadata ?? {};
  const providers = Array.isArray(app.providers) ? app.providers : [];
  if (app.provider === "google" || providers.includes("google")) return { kind: "google" };
  return { kind: "email", email: user?.email ?? "" };
}

/** The opt-in as stored in user_metadata; anything but `true` is off. */
export function isOptedIn(metadata: Record<string, unknown> | null | undefined): boolean {
  return metadata?.updates_opt_in === true;
}

/** user_metadata for an opt-in change (PRD §6): the time goes with "on", and is cleared with "off". */
export function optInMetadata(on: boolean, now: Date = new Date()): Record<string, unknown> {
  return { updates_opt_in: on, updates_opt_in_at: on ? now.toISOString() : null };
}

/**
 * Saves a new display name (FR-W25) to the user's own `space_members` row (RLS "member updates
 * self") and to `user_metadata.display_name`. The member cache is dropped so lists show the new name.
 */
export async function saveDisplayName(client: SupabaseClient, spaceId: string | null, userId: string, displayName: string): Promise<void> {
  if (spaceId) {
    const { error } = await client.from("space_members").update({ display_name: displayName }).eq("space_id", spaceId).eq("user_id", userId);
    if (error) throw error;
  }
  clearSpaceCache();
  const { error } = await client.auth.updateUser({ data: { display_name: displayName } });
  if (error) throw error;
}
