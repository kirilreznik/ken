// Bundles Supabase Edge Functions that import shared code from src/lib.
// Usage: node scripts/build-functions.mjs  → supabase/functions/<name>/dist/index.js
import { build } from "esbuild";

for (const name of ["notify"]) {
  await build({
    entryPoints: [`supabase/functions/${name}/index.ts`],
    outfile: `supabase/functions/${name}/dist/index.js`,
    bundle: true, format: "esm", platform: "neutral", target: "es2022",
    external: ["npm:*", "jsr:*"], legalComments: "none", charset: "utf8",
  });
  console.log("built", name);
}
