import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import tokens from "../../docs/names-pwa/brand/tokens.json";
import { APPLE_TOUCH_ICON, namesManifest } from "@/lib/names/manifest";

const canvas = tokens.color.tokens.find((t) => t.name === "canvas")?.value;

describe("namesManifest", () => {
  const m = namesManifest();

  it("has the FR-W26 fields", () => {
    expect(m).toMatchObject({
      id: "/names/",
      name: "Nest · בחירת שם",
      short_name: "בחירת שם",
      lang: "he",
      dir: "rtl",
      start_url: "/names?source=pwa",
      scope: "/names",
      display: "standalone",
      background_color: canvas,
      theme_color: canvas,
    });
  });

  it("starts inside its scope, and the scope covers the swipe screen", () => {
    expect(`${m.start_url}`.startsWith(`${m.scope}`)).toBe(true);
    expect("/names".startsWith(`${m.scope}`)).toBe(true);
  });

  it("lists 192 and 512 any icons and a 512 maskable one that exist in public/", () => {
    const icons = m.icons ?? [];
    expect(icons.map((i) => `${i.sizes} ${i.purpose}`)).toEqual(["192x192 any", "512x512 any", "512x512 maskable"]);
    for (const src of [...icons.map((i) => i.src), APPLE_TOUCH_ICON]) {
      expect(existsSync(join(process.cwd(), "public", src))).toBe(true);
    }
  });
});
