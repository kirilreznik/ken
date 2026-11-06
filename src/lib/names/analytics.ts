/**
 * Analytics privacy (PRD 3.2.19). Vercel Analytics and Speed Insights get page URLs only; a
 * /names URL loses its hash, the code segment of /names/join/{code} and every query parameter
 * (invite codes, ?join=, OAuth tokens) except the allowlisted ones below. Other pages pass
 * through unchanged.
 */

const JOIN_PATH = /^\/names\/join\/[^/]+/;

/**
 * Query parameters a /names URL keeps: `source` (how the app was opened, e.g. ?source=pwa from
 * the manifest) and `tab` (the "השמות שלי" segment). Only short lowercase tokens survive, so
 * nothing typed or personal can ride along.
 */
export const KEPT_PARAMS = ["source", "tab"] as const;
const KEPT_VALUE = /^[a-z0-9_-]{1,32}$/;

export function scrubAnalyticsUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  const { pathname } = parsed;
  if (pathname !== "/names" && !pathname.startsWith("/names/")) return url;
  const kept = new URLSearchParams();
  for (const key of KEPT_PARAMS) {
    const value = parsed.searchParams.get(key);
    if (value !== null && KEPT_VALUE.test(value)) kept.set(key, value);
  }
  parsed.search = kept.toString();
  parsed.hash = "";
  parsed.pathname = pathname.replace(JOIN_PATH, "/names/join");
  return parsed.href;
}

/** beforeSend for both <Analytics> and <SpeedInsights>. */
export function scrubAnalyticsEvent<T extends { url: string }>(event: T): T {
  return { ...event, url: scrubAnalyticsUrl(event.url) };
}
