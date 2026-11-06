import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
// @ts-expect-error plain .mjs build script without types
import { buildNamesData } from "../../scripts/build-names-data.mjs";
import { defaultFilters, matches, rangeValue, type FilterableCard } from "@/lib/names/filters";
import { getPref, openPrefs, prefKey } from "@/lib/names/prefs";
import { THEME_IDS, hasAnyTheme, hasTheme, themesValue } from "@/lib/names/themes";

const ROOT = join(__dirname, "../..");

function card(name: string, themes: string[] = [], sexTag: "בן" | "בת" | "מתאים לכולם" = "בן"): FilterableCard {
  return {
    stats: { name, s: "J" },
    derived: { sexTag, band: "נפוץ", trend: null },
    content: { themes },
  };
}

describe("themes", () => {
  it("themes.json lists exactly the app's theme ids, in the same order", () => {
    const src = JSON.parse(readFileSync(join(ROOT, "data/names/content-src/themes.json"), "utf8"));
    expect(src.themes.map((t: { id: string }) => t.id)).toEqual([...THEME_IDS]);
  });

  it("every built tag is a known theme and unisex is never a list", () => {
    const built = JSON.parse(readFileSync(join(ROOT, "data/names/name-themes.json"), "utf8")).names;
    for (const ids of Object.values(built) as string[][]) {
      for (const id of ids) expect(THEME_IDS).toContain(id);
      expect(ids).not.toContain("unisex");
    }
  });

  it("unisex comes from the boy/girl split, the rest from the card's tags", () => {
    expect(hasTheme(card("נועם", [], "מתאים לכולם"), "unisex")).toBe(true);
    expect(hasTheme(card("דוד", ["bible"]), "unisex")).toBe(false);
    expect(hasTheme(card("דוד", ["bible"]), "bible")).toBe(true);
    expect(hasTheme({ derived: { sexTag: "בת" } }, "nature")).toBe(false);
  });

  it("several themes match a name with any of them", () => {
    const ים = card("ים", ["water"], "מתאים לכולם");
    expect(hasAnyTheme(ים, ["fire", "water"])).toBe(true);
    expect(hasAnyTheme(ים, ["fire", "nature"])).toBe(false);
    expect(matches(ים, { ...defaultFilters(), themes: ["fire", "unisex"] })).toBe(true);
    expect(matches(ים, { ...defaultFilters(), themes: ["fire"] })).toBe(false);
  });

  it("summary value", () => {
    expect(themesValue(null)).toBe("כל הנושאים");
    expect(themesValue(["water"])).toBe("ים ומים");
    expect(themesValue(["water", "fire"])).toBe("2 נושאים");
  });
});

describe("custom number of letters", () => {
  it("keeps names inside the range; the top end means 'or more'", () => {
    const f = (min: number, max: number) => ({ ...defaultFilters(), letterRange: { min, max } });
    expect(matches(card("ים"), f(3, 5))).toBe(false);
    expect(matches(card("שירה"), f(3, 5))).toBe(true);
    expect(matches(card("אבראהים"), f(3, 5))).toBe(false);
    expect(matches(card("אבראהים"), f(5, 7))).toBe(true);
    expect(matches(card("עבדאלרחמן"), f(5, 7))).toBe(true);
  });

  it("labels", () => {
    expect(rangeValue({ min: 3, max: 5 })).toBe("בין 3 ל־5 אותיות");
    expect(rangeValue({ min: 4, max: 4 })).toBe("4 אותיות");
    expect(rangeValue({ min: 5, max: 7 })).toBe("5 אותיות ומעלה");
    expect(rangeValue({ min: 7, max: 7 })).toBe("7 אותיות ומעלה");
    expect(rangeValue({ min: 2, max: 7 })).toBe("כל האורכים");
  });

  it("saved filters keep valid themes and range, drop the rest", () => {
    const U = "u-themes";
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    });
    openPrefs(U);
    localStorage.setItem(
      prefKey(U, "filters"),
      JSON.stringify({ themes: ["water", "nope", "water"], letterRange: { min: 9, max: 1 }, length: "קצר" }),
    );
    expect(getPref(U, "filters")).toEqual({
      ...defaultFilters(),
      themes: ["water"],
      letterRange: { min: 2, max: 7 },
    });
    localStorage.setItem(prefKey(U, "filters"), JSON.stringify({ themes: [] }));
    expect(getPref(U, "filters").themes).toBeNull();
    vi.unstubAllGlobals();
  });
});

describe("build-names-data adds theme tags to the content file", () => {
  it("merges name-themes.json when present", () => {
    const dir = mkdtempSync(join(tmpdir(), "names-themes-"));
    try {
      const names = { firstTrendYear: 2000, lastYear: 2024, names: [{ n: "ים", m: 1, f: 1, s: "J" }] };
      const content = { names: { ים: { niqqud: "יָם", intro: "ים", people: [] } } };
      writeFileSync(join(dir, "names.json"), JSON.stringify(names));
      writeFileSync(join(dir, "name-content.json"), JSON.stringify(content));
      writeFileSync(join(dir, "name-themes.json"), JSON.stringify({ names: { ים: ["water"], אחר: ["fire"] } }));
      const out = join(dir, "out");
      const manifest = buildNamesData({ srcDir: dir, outDir: out });
      const built = JSON.parse(readFileSync(join(out, manifest.content), "utf8"));
      expect(built.names).toEqual({ ים: { ...content.names.ים, themes: ["water"] } });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
