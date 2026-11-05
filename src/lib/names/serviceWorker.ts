/** The names service worker (public/names/sw.js) and the scope it controls. */
export const SW_URL = "/names/sw.js";
/** "/names", not "/names/": the swipe screen is /names itself (see manifest.ts). */
export const SW_SCOPE = "/names";

/** Production builds only; dev keeps hot reload free of cached pages. */
export function shouldRegisterWorker(nodeEnv: string | undefined, hasServiceWorker: boolean): boolean {
  return nodeEnv === "production" && hasServiceWorker;
}
