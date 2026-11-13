import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dismissToast, getToast, showToast, subscribeToast, TOAST_ACTION_DURATION, TOAST_DURATION, TOAST_EXIT } from "@/lib/names/toast";

// A dismissed toast stays as leaving for TOAST_EXIT ms (its fade, NP-096), then unmounts.
function expectGone() {
  expect(getToast()?.leaving).toBe(true);
  vi.advanceTimersByTime(TOAST_EXIT);
  expect(getToast()).toBeNull();
}

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
    expect(listener).toHaveBeenCalledTimes(2);
    expectGone();
    expect(listener).toHaveBeenCalledTimes(3);
    stop();
  });

  it("keeps a toast with an action longer", () => {
    showToast("עדכון זמין", { action: { label: "רענון", onAction: () => {} } });
    vi.advanceTimersByTime(TOAST_DURATION);
    expect(getToast()?.action?.label).toBe("רענון");
    vi.advanceTimersByTime(TOAST_ACTION_DURATION - TOAST_DURATION);
    expectGone();
  });

  it("keeps a toast with a link as long as one with an action", () => {
    showToast("השם יעל הוסתר ולא יוצג יותר", { link: { label: "לשמות שהסתרתי", href: "/names/hidden" } });
    vi.advanceTimersByTime(TOAST_DURATION);
    expect(getToast()?.link).toEqual({ label: "לשמות שהסתרתי", href: "/names/hidden" });
    vi.advanceTimersByTime(TOAST_ACTION_DURATION - TOAST_DURATION);
    expectGone();
  });

  it("replaces the current toast, and an old id can't dismiss the new one", () => {
    const first = showToast("א");
    showToast("ב");
    dismissToast(first);
    expect(getToast()?.message).toBe("ב");
    vi.advanceTimersByTime(TOAST_DURATION);
    expectGone();
  });

  it("duration 0 stays until dismissed", () => {
    const id = showToast("אין חיבור", { duration: 0 });
    vi.advanceTimersByTime(60_000);
    expect(getToast()?.id).toBe(id);
    dismissToast(id);
    expectGone();
  });

  it("marks only a toast that stays until dismissed as sticky (it sits clear of the card's button)", () => {
    showToast("עדכון זמין", { action: { label: "רענון", onAction: () => {} }, duration: 0 });
    expect(getToast()?.sticky).toBe(true);
    showToast("נשמר", { action: { label: "ביטול", onAction: () => {} } });
    expect(getToast()?.sticky).toBe(false);
  });
});
