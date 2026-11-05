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

/** The page path for a report, without invite codes. */
export function reportPath(pathname: string): string {
  return pathname.replace(/^\/names\/join\/.*/, "/names/join");
}

/**
 * POSTs to `{SUPABASE_URL}/functions/v1/client-log` with only the report's fields, the path
 * and appVersion. Resolves true when the function accepted it, false on any failure.
 */
export async function sendClientLog(report: ClientLogReport): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key || typeof fetch === "undefined") return false;
  const path = typeof location === "undefined" ? "" : reportPath(location.pathname);
  const body = { area: report.area, ...(report.name ? { name: report.name } : {}), message: report.message, path, appVersion: APP_VERSION };
  try {
    const res = await fetch(`${url}/functions/v1/client-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Fire-and-forget sendClientLog; failures are swallowed. */
export async function reportClientLog(report: ClientLogReport): Promise<void> {
  await sendClientLog(report);
}
