import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? String(Date.now()),
  },
  // For now the site root shows the public landing page instead of the old app's home
  // (which sent visitors to the login screen). The old app's other routes are unchanged.
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/pregnancy" }] };
  },
  async headers() {
    return [
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] },
      // The names worker controls /names itself, above its default max scope (/names/).
      {
        source: "/names/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/names" },
        ],
      },
      // Names data files carry a content hash (scripts/build-names-data.mjs); manifest.json doesn't.
      {
        source: "/names/data/:file((?:names|content|details)\\.[0-9a-f]{12}\\.json)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
