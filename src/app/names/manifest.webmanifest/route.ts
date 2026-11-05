import { namesManifest } from "@/lib/names/manifest";

// Next's manifest file convention only works at the app root; the names app gets its own scoped one.
export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(namesManifest()), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8" },
  });
}
