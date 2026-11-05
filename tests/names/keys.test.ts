import { describe, expect, it } from "vitest";
import { isMenuKey, SWIPE_KEYS_HINT, swipeKey } from "@/lib/names/keys";

describe("swipeKey", () => {
  it("maps K, L, S, Z and Backspace", () => {
    expect(swipeKey({ key: "k", code: "KeyK" })).toBe("keep");
    expect(swipeKey({ key: "l", code: "KeyL" })).toBe("love");
    expect(swipeKey({ key: "s", code: "KeyS" })).toBe("skip");
    expect(swipeKey({ key: "z", code: "KeyZ" })).toBe("undo");
    expect(swipeKey({ key: "Backspace", code: "Backspace" })).toBe("undo");
  });
  it("accepts Shift (capital letters)", () => {
    expect(swipeKey({ key: "K", code: "KeyK" })).toBe("keep");
  });
  it("works on the Hebrew layout by physical key", () => {
    expect(swipeKey({ key: "ל", code: "KeyK" })).toBe("keep");
    expect(swipeKey({ key: "ך", code: "KeyL" })).toBe("love");
    expect(swipeKey({ key: "ד", code: "KeyS" })).toBe("skip");
    expect(swipeKey({ key: "ז", code: "KeyZ" })).toBe("undo");
  });
  it("falls back to the key without a code", () => {
    expect(swipeKey({ key: "s" })).toBe("skip");
  });
  it("ignores modifiers, repeats and other keys", () => {
    expect(swipeKey({ key: "z", code: "KeyZ", metaKey: true })).toBeNull();
    expect(swipeKey({ key: "z", code: "KeyZ", ctrlKey: true })).toBeNull();
    expect(swipeKey({ key: "k", code: "KeyK", altKey: true })).toBeNull();
    expect(swipeKey({ key: "k", code: "KeyK", repeat: true })).toBeNull();
    expect(swipeKey({ key: "Enter", code: "Enter" })).toBeNull();
    expect(swipeKey({ key: "a", code: "KeyA" })).toBeNull();
  });
  it("hint lists every shortcut", () => {
    expect(SWIPE_KEYS_HINT).toBe(
      "קיצורי מקלדת: K שמירה, L אהבתי מאוד, S דילוג, Z ביטול. על דילוג, מקש התפריט או Shift+F10: דילוג ולא להציג שוב",
    );
  });
});

describe("isMenuKey", () => {
  it("accepts the menu key and Shift+F10", () => {
    expect(isMenuKey({ key: "ContextMenu" })).toBe(true);
    expect(isMenuKey({ key: "F10", shiftKey: true })).toBe(true);
  });
  it("ignores F10 alone, modified keys and other keys", () => {
    expect(isMenuKey({ key: "F10" })).toBe(false);
    expect(isMenuKey({ key: "F10", shiftKey: true, ctrlKey: true })).toBe(false);
    expect(isMenuKey({ key: "ContextMenu", metaKey: true })).toBe(false);
    expect(isMenuKey({ key: "s" })).toBe(false);
  });
});
