import { describe, expect, it, vi } from "vitest";

const openSheet = vi.fn();
vi.mock("@/components/names/ui", () => ({ openSheet }));

const { openAiSearch, peekAiStep, takeAiStep } = await import("@/components/names/aiStep");

describe("לדייק opens the filters sheet on the AI step", () => {
  it("starts on the filters unless לדייק asked for the AI step", () => {
    expect(peekAiStep()).toBe(false);
  });

  it("opens the filters sheet and marks the AI step once", () => {
    openAiSearch();
    expect(openSheet).toHaveBeenCalledWith("filters");
    expect(peekAiStep()).toBe(true);
    takeAiStep();
    expect(peekAiStep()).toBe(false);
  });
});
