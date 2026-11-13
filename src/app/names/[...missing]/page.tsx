import type { Metadata } from "next";
import { notFound } from "next/navigation";

// The catch-all's own metadata is what the client keeps after hydration; without it the
// title fell back to the names layout's default and lost "העמוד לא נמצא" (same as not-found.tsx).
export const metadata: Metadata = {
  title: "העמוד לא נמצא",
};

// Unknown paths under /names render the names 404 (not-found.tsx) instead of the root one.
export default function MissingNamesPage() {
  notFound();
}
