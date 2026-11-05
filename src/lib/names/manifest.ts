import type { MetadataRoute } from "next";
import { canvasColor } from "./brand";

export const MANIFEST_PATH = "/names/manifest.webmanifest";
export const APPLE_TOUCH_ICON = "/names/icons/apple-touch-icon-180.png";

/**
 * The /names web app manifest (FR-W26), separate from the landing.
 * Scope is "/names", not "/names/": the swipe screen and start_url live at /names, which a
 * "/names/" scope doesn't contain (Chromium then ignores the scope).
 */
export function namesManifest(): MetadataRoute.Manifest {
  return {
    id: "/names/",
    name: "Nest · בחירת שם",
    short_name: "בחירת שם",
    description: "בוחרים שם לתינוק או לתינוקת, לבד או ביחד: שמירה, דילוג והתאמות.",
    lang: "he",
    dir: "rtl",
    start_url: "/names?source=pwa",
    scope: "/names",
    display: "standalone",
    background_color: canvasColor,
    theme_color: canvasColor,
    icons: [
      { src: "/names/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/names/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/names/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
