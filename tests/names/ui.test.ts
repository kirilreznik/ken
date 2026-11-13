import { describe, expect, it } from "vitest";
import { buttonClass, chipClass, glassClass, iconButtonClass } from "@/components/names/ui/classes";
import { DETENT_DRAG, detentAfterDrag } from "@/components/names/ui/detents";

describe("glass primitives classes", () => {
  it("maps glass variants to the names.css classes", () => {
    expect(glassClass()).toBe("names-glass");
    expect(glassClass("strong")).toBe("names-glass");
    expect(glassClass("soft")).toBe("names-glass-soft");
  });

  it("scales pressed controls only when motion is allowed", () => {
    const all = [
      buttonClass("primary"),
      buttonClass("secondary", "md"),
      buttonClass("peach"),
      iconButtonClass(),
      chipClass(true),
      chipClass(false),
    ];
    for (const cls of all) {
      expect(cls).toContain("motion-safe:active:scale-95");
      expect(cls).not.toMatch(/(^|\s)active:scale/);
    }
  });

  it("builds the button variants", () => {
    expect(buttonClass("primary")).toContain("bg-ink");
    expect(buttonClass("primary")).toContain("names-button-primary");
    expect(buttonClass("primary", "md")).not.toContain("names-button-primary");
    expect(buttonClass("secondary")).toContain("names-glass names-button-glass");
    expect(buttonClass("peach")).toContain("size-14");
    expect(buttonClass("peach", "md")).toContain("size-11");
    expect(buttonClass("link")).toContain("underline");
    expect(buttonClass("link")).toContain("min-h-11");
  });

  it("keeps targets at least 44 px", () => {
    expect(buttonClass("primary", "md")).toContain("h-11");
    expect(buttonClass("primary", "lg")).toContain("h-14");
    expect(iconButtonClass()).toContain("size-11");
    // Chips: 29 px pill, the ::before adds 8 px above and below.
    expect(chipClass(false)).toContain("before:-inset-y-2");
  });

  it("inks the selected chip and glasses the others", () => {
    expect(chipClass(true)).toContain("bg-ink text-surface");
    expect(chipClass(false)).toContain("names-glass-soft names-chip-off");
    expect(chipClass(false)).not.toContain("bg-ink");
  });

  it("uses no raw colors, physical sides or pixel font sizes", () => {
    const all = [buttonClass("primary"), buttonClass("secondary"), buttonClass("peach"), buttonClass("link"), iconButtonClass(), chipClass(true), chipClass(false)].join(" ");
    expect(all).not.toMatch(/#[0-9a-f]{3,8}|rgb|\b(ml|mr|pl|pr|left|right)-|text-\[\d/i);
  });
});

describe("tall sheet detents", () => {
  it("drags up from 70% to full and stays at full", () => {
    expect(detentAfterDrag("70", -DETENT_DRAG)).toBe("full");
    expect(detentAfterDrag("70", -300)).toBe("full");
    expect(detentAfterDrag("full", -300)).toBe("full");
  });

  it("drags down from full to 70% and from 70% to close", () => {
    expect(detentAfterDrag("full", DETENT_DRAG)).toBe("70");
    expect(detentAfterDrag("full", 500)).toBe("70");
    expect(detentAfterDrag("70", DETENT_DRAG)).toBe("close");
  });

  it("snaps back after a short drag", () => {
    expect(detentAfterDrag("70", 0)).toBe("70");
    expect(detentAfterDrag("70", DETENT_DRAG - 1)).toBe("70");
    expect(detentAfterDrag("70", -(DETENT_DRAG - 1))).toBe("70");
    expect(detentAfterDrag("full", DETENT_DRAG - 1)).toBe("full");
    expect(detentAfterDrag("full", -(DETENT_DRAG - 1))).toBe("full");
  });

  it("takes a custom threshold", () => {
    expect(detentAfterDrag("70", -40, 40)).toBe("full");
    expect(detentAfterDrag("70", 39, 40)).toBe("70");
  });
});
