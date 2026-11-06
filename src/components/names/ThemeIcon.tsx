import type { ReactNode } from "react";
import type { ThemeId } from "@/lib/names/themes";

// Line icons for the "נושאים" chips: 24 px grid, 1.8 stroke, round caps and joins (brand
// iconography). Some shapes follow Lucide (ISC licence): book-open, flame, leaf, star.
const PATHS: Record<ThemeId | "all", ReactNode> = {
  all: <path d="M6 8.5c-2 0-3.5 1.6-3.5 3.5S4 15.5 6 15.5c3.5 0 8.5-7 12-7 2 0 3.5 1.6 3.5 3.5S20 15.5 18 15.5c-3.5 0-8.5-7-12-7Z" />,
  israel: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  poetry: (
    <>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  fire: (
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
  ),
  unisex: (
    <>
      <circle cx="10" cy="13" r="5" />
      <path d="M13.6 9.4 20 3M15.5 3H20v4.5M10 18v4M8 20h4" />
    </>
  ),
  special: (
    <path d="M12 2.5l2.9 5.9 6.6 1-4.8 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.8-4.6 6.6-1L12 2.5Z" />
  ),
  strength: <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />,
  land: (
    <>
      <path d="M2.5 20 9 9l4 6.5L15.5 12l6 8h-19Z" />
      <circle cx="16.5" cy="5.5" r="1.5" />
    </>
  ),
  water: <path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11Z" />,
  bible: (
    <>
      <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2Z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7Z" />
    </>
  ),
  animals: (
    <>
      <circle cx="8.5" cy="6.5" r="1.8" />
      <circle cx="15.5" cy="6.5" r="1.8" />
      <circle cx="4.8" cy="11.2" r="1.6" />
      <circle cx="19.2" cy="11.2" r="1.6" />
      <path d="M12 12c-3 0-5.5 3.2-5.5 5.5 0 1.6 1.2 2.5 2.7 2.5 1.2 0 1.9-.6 2.8-.6s1.6.6 2.8.6c1.5 0 2.7-.9 2.7-2.5 0-2.3-2.5-5.5-5.5-5.5Z" />
    </>
  ),
  beauty: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M12 15v6M9.5 21h5M9.5 7.2A3 3 0 0 1 12 6" />
    </>
  ),
  joy: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01" />
    </>
  ),
  international: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
    </>
  ),
  nature: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
      <path d="M2 21c0-3 1.9-5.4 5.1-6 2.4-.5 4.9-2 5.9-3" />
    </>
  ),
};

export default function ThemeIcon({ theme }: { theme: ThemeId | "all" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="flex-none"
    >
      {PATHS[theme]}
    </svg>
  );
}
