import { describe, expect, it } from "vitest";
import { allNamePages, indexedNamePages, INDEX_MIN_2024, namePage } from "@/lib/babyNames/data";
import { LISTS } from "@/lib/babyNames/lists";
import { nameFromSlug, nameHref, nameSlug } from "@/lib/babyNames/slug";

describe("name page slugs", () => {
  it("round-trips names with spaces, hyphens and geresh", () => {
    for (const name of ["נועה", "בת שבע", "לי-שי", "לי שי", "ג'וליה"]) {
      expect(nameFromSlug(nameSlug(name))).toBe(name);
      expect(nameFromSlug(nameHref(name).split("/").at(-1)!)).toBe(name);
    }
  });

  it("gives every deck name a distinct slug", () => {
    const slugs = allNamePages().map((p) => nameSlug(p.name));
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("name pages data", () => {
  it("has a page for every deck card", () => {
    expect(allNamePages().length).toBe(1937);
    expect(namePage("נועה")?.detail.story).toBeTruthy();
  });

  it("opens only names given to at least INDEX_MIN_2024 babies in 2024", () => {
    const indexed = indexedNamePages();
    expect(indexed.every((p) => p.count2024 >= INDEX_MIN_2024)).toBe(true);
    expect(indexed.length).toBe(allNamePages().filter((p) => p.count2024 >= INDEX_MIN_2024).length);
  });

  it("fills all five lists", () => {
    for (const list of LISTS) expect(list.pages().length).toBeGreaterThan(20);
  });
});
