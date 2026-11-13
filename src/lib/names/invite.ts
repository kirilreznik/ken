import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/names/supabase";
import type { SpaceMember } from "@/lib/names/space";

/** A single-use invite from `names_invite()` (PRD §3.2.5): 8 characters, valid 7 days. */
export interface Invite {
  code: string;
  expiresAt: string;
}

/** FR-W23 Web Share payload (the url is added per invite). */
export const SHARE_TITLE = "בחירת שם ב־Nest";
export const SHARE_TEXT = "בואו לבחור שם ביחד";
export const COPIED_TEXT = "הקישור הועתק";

/** https://{site}/names/join/{CODE}: NEXT_PUBLIC_SITE_URL when set, else this origin. */
export function inviteUrl(siteUrl: string | undefined, origin: string, code: string): string {
  const base = (siteUrl?.trim() || origin).replace(/\/+$/, "");
  return `${base}/names/join/${encodeURIComponent(code)}`;
}

const dateFmt = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" });

/** "12 בנובמבר 2026" in the device's time zone (`format` is for tests). */
export function expiryDate(expiresAt: string, format: Intl.DateTimeFormat = dateFmt): string {
  return format.format(new Date(expiresAt));
}

/** "בתוקף עד 12 בנובמבר 2026". */
export function expiryText(expiresAt: string, format: Intl.DateTimeFormat = dateFmt): string {
  return `בתוקף עד ${expiryDate(expiresAt, format)}`;
}

/** The members list: the user's own name as "{name} (אני)", everyone else by display name. */
export function memberLabel(member: SpaceMember, userId: string | null): string {
  const name = member.displayName.trim() || "בלי שם";
  return member.userId === userId ? `${name} (אני)` : name;
}

/** The user first, then everyone else in joining order. */
export function membersForList(list: readonly SpaceMember[], userId: string | null): SpaceMember[] {
  const own = list.filter((m) => m.userId === userId);
  return [...own, ...list.filter((m) => m.userId !== userId)];
}

function readInvite(data: unknown): Invite {
  const row = (Array.isArray(data) ? data[0] : data) as { code?: unknown; expires_at?: unknown } | null | undefined;
  if (typeof row?.code !== "string" || row.code === "" || typeof row.expires_at !== "string") {
    throw new Error("names_invite returned no code");
  }
  return { code: row.code, expiresAt: row.expires_at };
}

// One invite per space and member count for the session: a new member used the code, so the
// next visit asks for a fresh one. A failed request is dropped so the next call retries.
let inviteCache: { key: string; promise: Promise<Invite> } | null = null;

/** A fresh (or this session's still valid) invite for the user's active space. */
export function createInvite(
  spaceId: string,
  memberCount: number,
  client: Pick<SupabaseClient, "rpc"> | null = getSupabase(),
): Promise<Invite> {
  const key = `${spaceId}:${memberCount}`;
  if (inviteCache?.key === key) return inviteCache.promise;

  const promise = (async () => {
    if (!client) throw new Error("supabase unavailable");
    const { data, error } = await client.rpc("names_invite");
    if (error) throw error;
    return readInvite(data);
  })();
  const entry = { key, promise };
  inviteCache = entry;
  promise.catch(() => {
    if (inviteCache === entry) inviteCache = null;
  });
  return promise;
}

/** Drops the cached invite ("קישור חדש", sign-out). */
export function clearInviteCache(): void {
  inviteCache = null;
}

