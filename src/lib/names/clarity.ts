/**
 * Microsoft Clarity for the name swiper (session recordings and heatmaps during the beta).
 *
 * Privacy:
 * - The names layout puts data-clarity-mask on the whole app, so every text (baby names,
 *   display names, emails) and image is masked; inputs are always masked by Clarity. Static
 *   controls that carry no personal text opt back in with data-clarity-unmask.
 * - Clarity never records aria-label or title attributes (clarity-js IGNORE_ATTRIBUTES), where
 *   the cards repeat the name for screen readers.
 * - Clarity records page URLs, so it doesn't start on a URL that carries an invite code or a
 *   sign-in token: /names/join/{code}, /names/auth/*, or any query parameter outside SAFE_PARAMS.
 * - Once running, Clarity follows pushState and uploads each new URL, and the name sheet pushes
 *   ?n=<name>. Its `drop` setting (clarity-js: every uploaded URL goes through it) turns the
 *   values of DROP_PARAMS into "*na*"; the loader adds them to the tag's "start" config.
 */

/** Query parameters that never carry anything personal (all are fixed tokens). */
const SAFE_PARAMS = new Set(["source", "tab", "sheet", "dialog", "from"]);

/** The project id from NEXT_PUBLIC_CLARITY_PROJECT_ID, or null when unset or malformed. */
export function clarityProjectId(raw: string | undefined): string | null {
  const id = raw?.trim() ?? "";
  return /^[a-z0-9]{6,20}$/i.test(id) ? id : null;
}

/** True when Clarity may start recording on this URL. */
export function clarityAllowed(pathname: string, search: string): boolean {
  if (pathname !== "/names" && !pathname.startsWith("/names/")) return false;
  if (pathname.startsWith("/names/join") || pathname.startsWith("/names/auth")) return false;
  for (const key of new URLSearchParams(search).keys()) if (!SAFE_PARAMS.has(key)) return false;
  return true;
}

/** Parameters whose values Clarity never uploads (the name sheet's baby name). */
export const DROP_PARAMS = ["n"] as const;

/** A queued Clarity call; "start" with a config gets DROP_PARAMS added to its `drop` list. */
export function withDropParams(args: unknown[]): unknown[] {
  const [command, config, ...rest] = args;
  if (command !== "start" || !config || typeof config !== "object") return args;
  const own = (config as { drop?: unknown }).drop;
  const drop = [...new Set([...(Array.isArray(own) ? own : []), ...DROP_PARAMS])];
  return [command, { ...config, drop }, ...rest];
}

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] };

let loaded = false;

/** Adds the Clarity tag once (Microsoft's standard snippet). */
export function loadClarity(id: string): void {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const w = window as unknown as { clarity?: ClarityFn };
  if (!w.clarity) {
    const fn: ClarityFn = (...args: unknown[]) => {
      (fn.q ??= []).push(withDropParams(args));
    };
    w.clarity = fn;
  }
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}
