import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dismissToast, getToast, showToast, subscribeToast, TOAST_ACTION_DURATION, TOAST_DURATION } from "@/lib/names/toast";

describe("toast store", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });
  afterEach(() => {
    dismissToast();
    vi.useRealTimers();
  });

  it("shows one toast and hides it after the default duration", () => {
    const listener = vi.fn();
    const stop = subscribeToast(listener);
    showToast("נשמר");
    expect(getToast()?.message).toBe("נשמר");
    expect(listener).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(TOAST_DURATION - 1);
    expect(getToast()).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(getToast()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(2);
    stop();
  });

  it("keeps a toast with an action longer", () => {
    showToast("עדכון זמין", { action: { label: "רענון", onAction: () => {} } });
    vi.advanceTimersByTime(TOAST_DURATION);
    expect(getToast()?.action?.label).toBe("רענון");
    vi.advanceTimersByTime(TOAST_ACTION_DURATION - TOAST_DURATION);
    expect(getToast()).toBeNull();
  });

  it("keeps a toast with a link as long as one with an action", () => {
    showToast("השם יעל הוסתר ולא יוצג יותר", { link: { label: "לשמות שהסתרתי", href: "/names/hidden" } });
    vi.advanceTimersByTime(TOAST_DURATION);
    expect(getToast()?.link).toEqual({ label: "לשמות שהסתרתי", href: "/names/hidden" });
    vi.advanceTimersByTime(TOAST_ACTION_DURATION - TOAST_DURATION);
    expect(getToast()).toBeNull();
  });

  it("replaces the current toast, and an old id can't dismiss the new one", () => {
    const first = showToast("א");
    showToast("ב");
    dismissToast(first);
    expect(getToast()?.message).toBe("ב");
    vi.advanceTimersByTime(TOAST_DURATION);
    expect(getToast()).toBeNull();
  });

  it("duration 0 stays until dismissed", () => {
    const id = showToast("אין חיבור", { duration: 0 });
    vi.advanceTimersByTime(60_000);
    expect(getToast()?.id).toBe(id);
    dismissToast(id);
    expect(getToast()).toBeNull();
  });
});
