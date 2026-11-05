import { describe, expect, it } from "vitest";
import { isPushedLayer, LAYER_STATE_KEY, layerSearch, layerToken } from "@/lib/names/urlLayer";

describe("layerSearch", () => {
  it("adds the sheet param and keeps the rest", () => {
    expect(layerSearch("", "sheet", "filters")).toBe("?sheet=filters");
    expect(layerSearch("?tab=saved", "sheet", "about")).toBe("?tab=saved&sheet=about");
  });

  it("replaces an open sheet", () => {
    expect(layerSearch("?sheet=filters", "sheet", "about")).toBe("?sheet=about");
  });

  it("removes the param and drops an empty query", () => {
    expect(layerSearch("?sheet=filters", "sheet", null)).toBe("");
    expect(layerSearch("?tab=duel&sheet=filters", "sheet", null)).toBe("?tab=duel");
  });

  it("keeps a sheet when a dialog opens over it", () => {
    expect(layerSearch("?sheet=filters", "dialog", "reset")).toBe("?sheet=filters&dialog=reset");
    expect(layerSearch("?sheet=filters&dialog=reset", "dialog", null)).toBe("?sheet=filters");
  });
});

describe("isPushedLayer", () => {
  it("matches only the entry pushed for that layer", () => {
    const state = { [LAYER_STATE_KEY]: layerToken("sheet", "filters"), __NA: true };
    expect(isPushedLayer(state, "sheet", "filters")).toBe(true);
    expect(isPushedLayer(state, "sheet", "about")).toBe(false);
    expect(isPushedLayer(state, "dialog", "filters")).toBe(false);
  });

  it("is false for a direct link (no marker)", () => {
    expect(isPushedLayer(null, "sheet", "filters")).toBe(false);
    expect(isPushedLayer({ __NA: true }, "sheet", "filters")).toBe(false);
    expect(isPushedLayer("x", "sheet", "filters")).toBe(false);
  });
});
