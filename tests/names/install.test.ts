import { describe, expect, it } from "vitest";
import { INSTALL_HINT_VOTES, INSTALL_STEPS, installMode, isIosSafari, showInstallHint } from "@/lib/names/install";

const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const IPAD_DESKTOP =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
const IPHONE_CHROME =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.0.0 Mobile/15E148 Safari/604.1";
const IPHONE_INSTAGRAM =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0";
const ANDROID_CHROME =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";

describe("isIosSafari", () => {
  it("accepts iPhone Safari and iPad Safari in desktop mode", () => {
    expect(isIosSafari(IPHONE_SAFARI)).toBe(true);
    expect(isIosSafari(IPAD_DESKTOP, 5)).toBe(true);
  });

  it("rejects a Mac without touch, other iOS browsers, in-app browsers and Android", () => {
    expect(isIosSafari(IPAD_DESKTOP, 0)).toBe(false);
    expect(isIosSafari(IPHONE_CHROME)).toBe(false);
    expect(isIosSafari(IPHONE_INSTAGRAM)).toBe(false);
    expect(isIosSafari(ANDROID_CHROME, 5)).toBe(false);
  });
});

describe("installMode", () => {
  it("offers nothing when already standalone", () => {
    expect(installMode({ standalone: true, ios: true, canPrompt: true })).toBeNull();
  });

  it("prefers the browser prompt, then the iOS steps", () => {
    expect(installMode({ standalone: false, ios: false, canPrompt: true })).toBe("prompt");
    expect(installMode({ standalone: false, ios: true, canPrompt: false })).toBe("ios");
    expect(installMode({ standalone: false, ios: false, canPrompt: false })).toBeNull();
  });
});

describe("showInstallHint", () => {
  it("shows from the 5th vote until dismissed, only with something to install", () => {
    expect(INSTALL_HINT_VOTES).toBe(5);
    expect(showInstallHint("prompt", 4, false)).toBe(false);
    expect(showInstallHint("prompt", 5, false)).toBe(true);
    expect(showInstallHint("ios", 12, false)).toBe(true);
    expect(showInstallHint("ios", 12, true)).toBe(false);
    expect(showInstallHint(null, 12, false)).toBe(false);
  });
});

describe("copy", () => {
  it("keeps the FR-W27 steps", () => {
    expect(INSTALL_STEPS.join(" ")).toBe("לוחצים על כפתור השיתוף ואז על ״הוספה למסך הבית״");
  });
});
