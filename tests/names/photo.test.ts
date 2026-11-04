import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { deleteOwnPhoto, loadOwnPhoto, saveOwnPhoto } from "@/lib/names/photo";

const jpeg = (bytes: number[]) => new Blob([new Uint8Array(bytes)], { type: "image/jpeg" });

describe("own photo", () => {
  it("returns null when nothing is saved", async () => {
    expect(await loadOwnPhoto("nobody")).toBeNull();
  });

  it("saves, loads and deletes a Blob per user", async () => {
    await saveOwnPhoto("a", jpeg([1, 2, 3]));
    await saveOwnPhoto("b", jpeg([9]));
    const a = await loadOwnPhoto("a");
    expect(a).toBeInstanceOf(Blob);
    expect(a!.type).toBe("image/jpeg");
    expect([...new Uint8Array(await a!.arrayBuffer())]).toEqual([1, 2, 3]);

    await deleteOwnPhoto("a");
    expect(await loadOwnPhoto("a")).toBeNull();
    expect((await loadOwnPhoto("b"))!.size).toBe(1);
  });

  it("replacing the photo replaces the Blob", async () => {
    await saveOwnPhoto("c", jpeg([1]));
    await saveOwnPhoto("c", jpeg([4, 5]));
    expect([...new Uint8Array(await (await loadOwnPhoto("c"))!.arrayBuffer())]).toEqual([4, 5]);
  });

  it("deleting a missing photo is fine", async () => {
    await expect(deleteOwnPhoto("none")).resolves.toBeUndefined();
  });
});

describe("subscribeOwnPhoto", () => {
  it("notifies after save and delete", async () => {
    const { subscribeOwnPhoto } = await import("@/lib/names/photo");
    let n = 0;
    const stop = subscribeOwnPhoto(() => n++);
    await saveOwnPhoto("s", jpeg([1]));
    await deleteOwnPhoto("s");
    stop();
    await saveOwnPhoto("s", jpeg([2]));
    expect(n).toBe(2);
  });
});

describe("fitLongSide", () => {
  it("scales the long side down to 1,200 px and keeps the ratio", async () => {
    const { fitLongSide } = await import("@/lib/names/photo");
    expect(fitLongSide(4032, 3024)).toEqual({ width: 1200, height: 900 });
    expect(fitLongSide(3024, 4032)).toEqual({ width: 900, height: 1200 });
    expect(fitLongSide(2000, 2000)).toEqual({ width: 1200, height: 1200 });
  });

  it("never upscales a small photo", async () => {
    const { fitLongSide } = await import("@/lib/names/photo");
    expect(fitLongSide(800, 600)).toEqual({ width: 800, height: 600 });
    expect(fitLongSide(1200, 10)).toEqual({ width: 1200, height: 10 });
  });

  it("keeps at least 1 px on each side", async () => {
    const { fitLongSide } = await import("@/lib/names/photo");
    expect(fitLongSide(12000, 3)).toEqual({ width: 1200, height: 1 });
    expect(fitLongSide(0, 0)).toEqual({ width: 1, height: 1 });
  });
});
