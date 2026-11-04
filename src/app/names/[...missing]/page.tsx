import { notFound } from "next/navigation";

// Unknown paths under /names render the names 404 (not-found.tsx) instead of the root one.
export default function MissingNamesPage() {
  notFound();
}
