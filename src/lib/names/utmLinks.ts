/**
 * Passing a campaign link's utm_* on to the swiper. People arrive from a tagged link on the
 * landing page (/) or a public name page (/baby-names/…), then tap through to /names, which is
 * where analytics runs. Without this the tags stay behind and the visit counts as direct.
 * Nothing is stored here; the swiper remembers the tags once it opens (track.ts arrivalUtm).
 */

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;
const UTM_VALUE = /^[A-Za-z0-9_.-]{1,40}$/;

/** The page's utm_* worth passing on (short plain tokens only). */
export function utmParams(search: string): [string, string][] {
  const params = new URLSearchParams(search);
  const out: [string, string][] = [];
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value && UTM_VALUE.test(value)) out.push([key, value]);
  }
  return out;
}

/** True for a same-site link into the swiper or the name pages. */
export function carriesUtm(href: string): boolean {
  return /^\/(names|baby-names)(\/|\?|#|$)/.test(href);
}

/** `href` with the utm_* added (ones it already has win). Other links come back unchanged. */
export function withUtm(href: string, utm: readonly [string, string][]): string {
  if (!utm.length || !carriesUtm(href)) return href;
  const url = new URL(href, "https://x.invalid");
  for (const [key, value] of utm) if (!url.searchParams.has(key)) url.searchParams.set(key, value);
  return `${url.pathname}${url.search}${url.hash}`;
}
