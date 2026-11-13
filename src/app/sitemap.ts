import type { MetadataRoute } from "next";
import { indexedNamePages } from "@/lib/babyNames/data";
import { LISTS, listHref } from "@/lib/babyNames/lists";
import { absoluteUrl, BASE_PATH, nameHref } from "@/lib/babyNames/slug";

/**
 * /sitemap.xml: the landing page, the name hub, the five lists and the name pages open to search
 * engines (INDEX_MIN_2024). Noindex name pages and the swiper are left out.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl(BASE_PATH), changeFrequency: "weekly", priority: 0.9 },
    ...LISTS.map((l) => ({ url: absoluteUrl(listHref(l.id)), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...indexedNamePages().map((p) => ({ url: absoluteUrl(nameHref(p.name)), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
