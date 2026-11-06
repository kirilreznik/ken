import { describe, expect, it } from "vitest";
import { pendingText, syncStatusText } from "@/lib/names/offline";

describe("syncStatusText", () => {
  it("says offline with the queued count", () => {
    expect(syncStatusText(false, 3)).toBe("אין חיבור · 3 בחירות ממתינות לסנכרון");
    expect(syncStatusText(false, 1)).toBe("אין חיבור · בחירה אחת ממתינה לסנכרון");
  });

  it("says offline alone with nothing queued", () => {
    expect(syncStatusText(false, 0)).toBe("אין חיבור");
  });

  it("stays quiet online unless queued votes are stuck", () => {
    expect(syncStatusText(true, 0)).toBeNull();
    expect(syncStatusText(true, 0, true)).toBeNull();
    expect(syncStatusText(true, 2)).toBeNull();
    expect(syncStatusText(true, 2, true)).toBe("2 בחירות ממתינות לסנכרון");
  });

  it("ignores bad counts", () => {
    expect(syncStatusText(false, -1)).toBe("אין חיבור");
    expect(pendingText(12)).toBe("12 בחירות ממתינות לסנכרון");
  });
});
