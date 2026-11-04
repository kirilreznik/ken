/** Short build id sent with reports; "dev" outside Vercel. */
export const APP_VERSION = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev";

/**
 * A report for the `client-log` function (PRD 3.2.18). Never put a user id, email,
 * display name, phone, surname or vote in here.
 */
export interface ClientLogReport {
  area: string;
  message: string;
  name?: string;
}

/** Fire-and-forget POST to `{SUPABASE_URL}/functions/v1/client-log`; failures are swallowed. */
export async function reportClientLog(report: ClientLogReport): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key || typeof fetch === "undefined") return;
  // Invite codes stay out of reports.
  const path = typeof location === "undefined" ? "" : location.pathname.replace(/^\/names\/join\/.*/, "/names/join");
  try {
    await fetch(`${url}/functions/v1/client-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify({ ...report, path, appVersion: APP_VERSION }),
      keepalive: true,
    });
  } catch {
    // Reporting is best effort.
  }
}
