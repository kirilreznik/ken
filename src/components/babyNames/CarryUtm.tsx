"use client";

import { useEffect } from "react";
import { utmParams, withUtm } from "@/lib/names/utmLinks";

/**
 * On a public name page opened from a tagged link, adds the page's utm_* to every link into
 * /names and /baby-names, so the swiper's app_open counts the campaign. Renders nothing.
 */
export default function CarryUtm() {
  useEffect(() => {
    const utm = utmParams(window.location.search);
    if (!utm.length) return;
    const tag = (a: HTMLAnchorElement) => {
      const href = a.getAttribute("href");
      if (href) {
        const next = withUtm(href, utm);
        if (next !== href) a.setAttribute("href", next);
      }
    };
    document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach(tag);
    // Links rendered later (client navigation, sheets) are tagged as they're used.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (a instanceof HTMLAnchorElement) tag(a);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
