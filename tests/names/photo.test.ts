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
