import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error plain .mjs script without types
import { batch, births2024, deckOrder } from "../../scripts/names-content/details-batches.mjs";

const order = deckOrder() as string[];
const births = births2024() as Map<string, number>;
const batchOf = batch as (n: number, order?: string[]) => string[];

describe("details batches", () => {
  it("cover every deck name exactly once across 20 batches", () => {
    const content = JSON.parse(readFileSync("data/names/name-content.json", "utf8"));
    const deck = Object.keys(content.names);
    const all = Array.from({ length: 20 }, (_, i) => batchOf(i + 1, order)).flat();
    expect(all).toHaveLength(deck.length);
    expect(new Set(all).size).toBe(deck.length);
    expect(new Set(all)).toEqual(new Set(deck));
  });

  it("use 65 names per batch, the last takes the rest", () => {
    for (let n = 1; n < 20; n++) expect(batchOf(n, order)).toHaveLength(65);
    expect(batchOf(20, order)).toHaveLength(order.length - 65 * 19);
  });

  it("start batch 1 with the top names of 2024", () => {
    const first = batchOf(1, order);
    const top = Math.max(...order.map((n) => births.get(n) ?? 0));
    expect(births.get(first[0])).toBe(top);
    const min1 = Math.min(...first.map((n) => births.get(n) ?? 0));
    const max2 = Math.max(...batchOf(2, order).map((n) => births.get(n) ?? 0));
    expect(min1).toBeGreaterThanOrEqual(max2);
  });

  it("rejects batch numbers outside 1..20", () => {
    expect(() => batchOf(0, order)).toThrow();
    expect(() => batchOf(21, order)).toThrow();
  });
});
