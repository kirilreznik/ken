import { afterEach, describe, expect, it, vi } from "vitest";
import namesFile from "../../data/names/names.json";
import contentFile from "../../data/names/name-content.json";
import type { RawContentFile, RawNamesFile } from "@/lib/names/data";

const rawNames = namesFile as RawNamesFile;
const rawContent = contentFile as RawContentFile;

async function freshData() {
  vi.resetModules();
  return import("@/lib/names/data");
}

afterEach(() => vi.unstubAllGlobals());

describe("names data files", () => {
  it("has 19,884 names, each with stats and a year array of the right length", async () => {
    const { parseNames, FIRST_TREND_YEAR, LAST_YEAR } = await freshData();
    const names = parseNames(rawNames);
    expect(names.size).toBe(19884);
    const noam = names.get("נועם")!;
    expect(noam.name).toBe("נועם");
    expect(noam.m + noam.f).toBeGreaterThan(0);
    for (const stats of names.values()) {
      if (stats.y) expect(stats.y).toHaveLength(LAST_YEAR - FIRST_TREND_YEAR + 1);
    }
  });

  it("has content names that are all in names.json, with a complete card each", async () => {
    const { parseNames, parseContent, contentNames } = await freshData();
    const names = parseNames(rawNames);
    const content = parseContent(rawContent);
    const list = contentNames(content);
    expect(list.length).toBeGreaterThanOrEqual(10);
    expect(new Set(list).size).toBe(list.length);
    for (const name of list) {
      const card = content.get(name)!;
      expect(names.has(name), name).toBe(true);
      expect(card.niqqud, name).toMatch(/[\u05D0-\u05EA]/);
      expect(card.intro.length, name).toBeGreaterThan(5);
      if (card.bible) {
        expect(card.bible.text.length, name).toBeGreaterThan(0);
        expect(card.bible.ref.length, name).toBeGreaterThan(0);
      }
      expect(card.people.length, name).toBeLessThanOrEqual(2);
    }
  });

  it("keeps the 10 E16 sample names in the deck", async () => {
    const { parseContent } = await freshData();
    const content = parseContent(rawContent);
    for (const name of ["זיו", "נועם", "יעל", "לביא", "תמר", "שקד", "אריאל", "אביגיל", "עמית", "אלה"]) {
      expect(content.has(name), name).toBe(true);
    }
  });

  it("rejects a file with other years", async () => {
    const { parseNames } = await freshData();
    expect(() => parseNames({ ...rawNames, lastYear: 2025 })).toThrow();
  });
});

describe("loadNames / loadContent", () => {
  const files: Record<string, unknown> = {
    "/names/data/manifest.json": {
      names: "names.abc.json",
      content: "content.def.json",
      details: "details.ghi.json",
      builtAt: "x",
    },
    "/names/data/names.abc.json": rawNames,
    "/names/data/content.def.json": rawContent,
    "/names/data/names.json": rawNames,
    "/names/data/content.json": rawContent,
  };
  const serve = (missing: string[] = []) =>
    vi.fn(async (url: string) =>
      url in files && !missing.includes(url)
        ? new Response(JSON.stringify(files[url]))
        : new Response("", { status: 404 }),
    );

  it("fetches the hashed files named in the manifest", async () => {
    const fetchMock = serve();
    vi.stubGlobal("fetch", fetchMock);
    const { loadNames, loadContent } = await freshData();
    expect((await loadNames()).size).toBe(19884);
    expect((await loadContent()).size).toBe(Object.keys(rawContent.names).length);
    const urls = fetchMock.mock.calls.map((c) => c[0]);
    expect(urls).toContain("/names/data/names.abc.json");
    expect(urls).toContain("/names/data/content.def.json");
    expect(urls.filter((u) => u.endsWith("manifest.json"))).toHaveLength(1);
  });

  it("falls back to the unhashed files without a manifest", async () => {
    const fetchMock = serve(["/names/data/manifest.json"]);
    vi.stubGlobal("fetch", fetchMock);
    const { loadNames } = await freshData();
    expect((await loadNames()).get("יעל")?.f).toBeGreaterThan(0);
    expect(fetchMock.mock.calls.map((c) => c[0])).toContain("/names/data/names.json");
  });
});
