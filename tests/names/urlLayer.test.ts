import { describe, expect, it } from "vitest";
import { closeNameIn, isPushedLayer, LAYER_STATE_KEY, layerSearch, layerToken, nameSearch, openNameIn, otherLayerOpen, readName, type LayerWindow } from "@/lib/names/urlLayer";

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

describe("layerSearch and the name param", () => {
  it("drops n when another sheet opens or the sheet closes", () => {
    expect(layerSearch("?sheet=name&n=%D7%A0%D7%95%D7%A2%D7%9D", "sheet", "filters")).toBe("?sheet=filters");
    expect(layerSearch("?tab=saved&sheet=name&n=x", "sheet", null)).toBe("?tab=saved");
  });

  it("keeps n for the about and report sheets opened from the name sheet", () => {
    expect(layerSearch("?sheet=name&n=x", "sheet", "about")).toBe("?sheet=about&n=x");
    expect(layerSearch("?sheet=about&n=x", "sheet", "report")).toBe("?sheet=report&n=x");
    expect(layerSearch("?sheet=report&n=x", "sheet", null)).toBe("");
    expect(readName("?sheet=about&n=x")).toBeNull();
  });
});

describe("nameSearch / readName", () => {
  it("opens the name sheet with URL-encoded Hebrew that round-trips", () => {
    const search = nameSearch("?tab=saved", "נועם");
    expect(search).toBe("?tab=saved&sheet=name&n=%D7%A0%D7%95%D7%A2%D7%9D");
    expect(readName(search)).toBe("נועם");
    expect(readName(nameSearch("", "ח'דיג'ה"))).toBe("ח'דיג'ה");
    expect(readName(nameSearch("", "שם עם רווח"))).toBe("שם עם רווח");
  });

  it("replaces the name and closes cleanly", () => {
    expect(readName(nameSearch("?sheet=name&n=a", "b"))).toBe("b");
    expect(nameSearch("?tab=duel&sheet=name&n=a", null)).toBe("?tab=duel");
    expect(nameSearch("?sheet=filters&n=a", null)).toBe("?sheet=filters");
  });

  it("reads a name only from an open name sheet", () => {
    expect(readName("")).toBeNull();
    expect(readName("?n=a")).toBeNull();
    expect(readName("?sheet=filters&n=a")).toBeNull();
    expect(readName("?sheet=name")).toBeNull();
    expect(readName("?sheet=name&n=%20")).toBeNull();
  });
});

/** A browser history in memory: entries, pushState/replaceState, go() firing popstate. */
function fakeWindow(start: string): LayerWindow & { entries: { state: unknown; url: string }[]; index: number; back(): void } {
  const listeners: (() => void)[] = [];
  const w = {
    entries: [{ state: null as unknown, url: start }],
    index: 0,
    location: { pathname: "", search: "", hash: "" },
    history: {
      get state() {
        return w.entries[w.index].state;
      },
      pushState(state: unknown, _unused: string, url: string) {
        w.entries = w.entries.slice(0, w.index + 1);
        w.entries.push({ state, url });
        w.index += 1;
        sync();
      },
      replaceState(state: unknown, _unused: string, url: string) {
        w.entries[w.index] = { state, url };
        sync();
      },
      go(delta: number) {
        w.index = Math.max(0, Math.min(w.entries.length - 1, w.index + delta));
        sync();
        listeners.splice(0).forEach((listener) => listener());
      },
    },
    addEventListener(_type: "popstate", listener: () => void) {
      listeners.push(listener);
    },
    back() {
      w.history.go(-1);
    },
  };
  function sync() {
    const url = new URL(w.entries[w.index].url, "https://x.test");
    w.location = { pathname: url.pathname, search: url.search, hash: url.hash };
  }
  sync();
  return w;
}

describe("openNameIn / closeNameIn", () => {
  it("pushes a marked entry; Back closes", () => {
    const w = fakeWindow("/names");
    openNameIn(w, "נועם");
    expect(readName(w.location.search)).toBe("נועם");
    expect(isPushedLayer(w.history.state, "sheet", "name")).toBe(true);
    w.back();
    expect(w.location.search).toBe("");
  });

  it("a second name pushes another entry; Back returns to the first, a second Back closes", () => {
    const w = fakeWindow("/names");
    openNameIn(w, "נועם");
    openNameIn(w, "נעמה");
    expect(w.entries).toHaveLength(3);
    expect(readName(w.location.search)).toBe("נעמה");
    w.back();
    expect(readName(w.location.search)).toBe("נועם");
    w.back();
    expect(w.location.search).toBe("");
  });

  it("opening the name already shown does nothing", () => {
    const w = fakeWindow("/names");
    openNameIn(w, "נועם");
    openNameIn(w, "נועם");
    expect(w.entries).toHaveLength(2);
  });

  it("close goes back past every name entry at once", () => {
    const w = fakeWindow("/names?tab=saved");
    openNameIn(w, "א");
    openNameIn(w, "ב");
    openNameIn(w, "ג");
    closeNameIn(w);
    expect(w.index).toBe(0);
    expect(w.location.search).toBe("?tab=saved");
  });

  it("replace swaps the name in place and keeps the stack depth", () => {
    const w = fakeWindow("/names");
    openNameIn(w, "א");
    openNameIn(w, "ב", { replace: true });
    expect(w.entries).toHaveLength(2);
    expect(readName(w.location.search)).toBe("ב");
    closeNameIn(w);
    expect(w.index).toBe(0);
    expect(w.location.search).toBe("");
  });

  it("a direct link closes by replacing the URL", () => {
    const w = fakeWindow("/names?sheet=name&n=%D7%90");
    closeNameIn(w);
    expect(w.entries).toHaveLength(1);
    expect(w.location.search).toBe("");
  });

  it("a name opened over a direct link: close cleans the link entry too", () => {
    const w = fakeWindow("/names?sheet=name&n=%D7%90");
    openNameIn(w, "ב");
    w.back();
    expect(readName(w.location.search)).toBe("א");
    w.history.go(1);
    closeNameIn(w);
    expect(w.index).toBe(0);
    expect(w.location.search).toBe("");
  });

  it("close does nothing when the name sheet isn't open", () => {
    const w = fakeWindow("/names?sheet=filters");
    closeNameIn(w);
    expect(w.location.search).toBe("?sheet=filters");
  });
});

describe("otherLayerOpen", () => {
  it("is true for another sheet or any dialog", () => {
    expect(otherLayerOpen("?sheet=filters")).toBe(true);
    expect(otherLayerOpen("?sheet=survey")).toBe(true);
    expect(otherLayerOpen("?dialog=reset")).toBe(true);
    expect(otherLayerOpen("?sheet=name&n=x&dialog=reset")).toBe(true);
  });

  it("is false with no layer or the name sheet itself", () => {
    expect(otherLayerOpen("")).toBe(false);
    expect(otherLayerOpen("?tab=saved")).toBe(false);
    expect(otherLayerOpen("?sheet=name&n=x")).toBe(false);
  });

  it("stops openNameIn over another layer", () => {
    for (const start of ["/names?sheet=survey", "/names?sheet=decision", "/names?dialog=delete-account"]) {
      const w = fakeWindow(start);
      openNameIn(w, "נועם");
      expect(w.entries).toHaveLength(1);
      expect(readName(w.location.search)).toBeNull();
    }
  });
});
