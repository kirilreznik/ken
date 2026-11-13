import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/babyNames/slug";

/** /robots.txt: everything public may be crawled except the APIs; pages opt out with noindex. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
