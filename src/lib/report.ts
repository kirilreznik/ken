/**
 * Client error reporting → /api/log → Vercel Runtime Logs.
 * Privacy: never sends user-entered text. Messages are truncated and scrubbed of
 * quoted values, emails, long numbers and query strings; paths have IDs replaced.
 */
export type ErrorArea = "render" | "window" | "promise" | "query" | "sync" | "upload" | "sw" | "auth" | "push" | "other";

let sent = 0;
const seen = new Set<string>();
const MAX_PER_SESSION = 25;

const scrub = (s: string) =>
  s
    .replace(/(["'«“„])[^"'»”]{0,500}?(["'»”])/g, "$1…$2")
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]")
    .replace(/\b\d{5,}\b/g, "[n]")
    .replace(/\?[^\s)]*/g, "")
    .slice(0, 400);

const scrubPath = (p: string) =>
  p.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ":id").replace(/\d{4,}/g, ":n");

export function report(error: unknown, area: ErrorArea, extra?: Record<string, string | number | boolean | null | undefined>) {
  try {
    if (typeof window === "undefined" || sent >= MAX_PER_SESSION) return;
    const e = error instanceof Error ? error : new Error(typeof error === "string" ? error : JSON.stringify(error)?.slice(0, 200) ?? "unknown");
    const code = (error as { code?: string })?.code;
    const message = scrub(e.message || String(e));
    const key = `${area}:${message}`;
    if (seen.has(key)) return;
    seen.add(key);
    sent++;
    const payload = {
      area,
      name: e.name,
      message,
      code: code ? String(code).slice(0, 40) : undefined,
      stack: (e.stack ?? "").split("\n").slice(0, 8).map((l) => scrub(l)).join("\n").slice(0, 1500),
      path: scrubPath(location.pathname),
      build: process.env.NEXT_PUBLIC_BUILD_ID,
      online: navigator.onLine,
      standalone: matchMedia("(display-mode: standalone)").matches,
      ua: navigator.userAgent.slice(0, 160),
      extra,
    };
    const body = JSON.stringify(payload);
    if (!(navigator.sendBeacon && navigator.sendBeacon("/api/log", new Blob([body], { type: "application/json" })))) {
      void fetch("/api/log", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
    if (process.env.NODE_ENV !== "production") console.error(`[report:${area}]`, error);
  } catch {
    /* never throw from the reporter */
  }
}

export function installGlobalReporters() {
  const onError = (ev: ErrorEvent) => report(ev.error ?? ev.message, "window", { src: ev.filename ? scrubPath(ev.filename) : undefined });
  const onRejection = (ev: PromiseRejectionEvent) => report(ev.reason, "promise");
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  return () => { window.removeEventListener("error", onError); window.removeEventListener("unhandledrejection", onRejection); };
}
