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
    ];
  },
};

export default nextConfig;
