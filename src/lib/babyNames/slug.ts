/**
 * URLs of the public name pages: /baby-names/<name>, with the Hebrew name itself as the path
 * segment. A space becomes "_" because the deck has both "לי-שי" and "לי שי"; hyphens and
 * geresh stay as they are.
 */

export const SITE_URL = "https://nestjourney.app";
export const BASE_PATH = "/baby-names";

export function nameSlug(name: string): string {
  return name.replaceAll(" ", "_");
}

/** The name a slug stands for; accepts the raw or percent-encoded segment. */
export function nameFromSlug(slug: string): string {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // Not percent-encoded; use as is.
  }
  return decoded.replaceAll("_", " ");
}

/** Site-relative href of a name page, percent-encoded. */
export function nameHref(name: string): string {
  return `${BASE_PATH}/${encodeURIComponent(nameSlug(name))}`;
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}
