import { describe, expect, it } from "vitest";
// @ts-expect-error Next's bundled path-to-regexp has no types
import { pathToRegexp } from "next/dist/compiled/path-to-regexp";
import nextConfig from "../../next.config";

async function cacheControlFor(path: string): Promise<string | undefined> {
  let value: string | undefined;
  for (const rule of (await nextConfig.headers!()) ?? []) {
    if (!(pathToRegexp(rule.source, [], { strict: true }) as RegExp).test(path)) continue;
    value = rule.headers.find((h) => h.key === "Cache-Control")?.value ?? value;
  }
  return value;
}

describe("names data caching headers", () => {
  it("caches the hashed data files forever", async () => {
    for (const file of ["names.7f66a50409b5.json", "content.11038fa6aa76.json"]) {
      expect(await cacheControlFor(`/names/data/${file}`)).toBe("public, max-age=31536000, immutable");
    }
  });

  it("leaves the manifest and unhashed files to revalidate", async () => {
    for (const file of ["manifest.json", "names.json", "content.json", "names.abc.json"]) {
      expect(await cacheControlFor(`/names/data/${file}`)).toBeUndefined();
    }
  });
});
