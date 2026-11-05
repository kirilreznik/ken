/**
 * Analytics privacy (PRD 3.2.19). Vercel Analytics and Speed Insights get page URLs only; a
 * /names URL loses its query string and hash (invite codes, ?join=, OAuth tokens) and the code
 * segment of /names/join/{code}. Other pages pass through unchanged.
 */

const JOIN_PATH = /^\/names\/join\/[^/]+/;

export function scrubAnalyticsUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  const { pathname } = parsed;
  if (pathname !== "/names" && !pathname.startsWith("/names/")) return url;
  parsed.search = "";
  parsed.hash = "";
  parsed.pathname = pathname.replace(JOIN_PATH, "/names/join");
  return parsed.href;
}

/** beforeSend for both <Analytics> and <SpeedInsights>. */
export function scrubAnalyticsEvent<T extends { url: string }>(event: T): T {
  return { ...event, url: scrubAnalyticsUrl(event.url) };
}
