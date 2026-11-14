import { describe, expect, it } from "vitest";
import { carriesUtm, utmParams, withUtm } from "@/lib/names/utmLinks";
import landing from "@/lib/pregnancy-landing.mjs";

describe("utm links", () => {
  const utm = utmParams("?utm_source=whatsapp&utm_medium=social&utm_campaign=launch&fbclid=abc");

  it("passes only short utm tokens on", () => {
    expect(utm).toEqual([
      ["utm_source", "whatsapp"],
      ["utm_medium", "social"],
      ["utm_campaign", "launch"],
    ]);
    expect(utmParams("?utm_source=<script>&utm_campaign=" + "x".repeat(41))).toEqual([]);
  });

  it("tags links into the swiper and the name pages only", () => {
    expect(withUtm("/names?source=landing", utm)).toBe("/names?source=landing&utm_source=whatsapp&utm_medium=social&utm_campaign=launch");
    expect(withUtm("/baby-names/noa#x", utm)).toBe("/baby-names/noa?utm_source=whatsapp&utm_medium=social&utm_campaign=launch#x");
    expect(withUtm("/names?utm_source=seo", utm)).toContain("utm_source=seo&");
    expect(withUtm("https://cbs.gov.il", utm)).toBe("https://cbs.gov.il");
    expect(withUtm("/namesake", utm)).toBe("/namesake");
    expect(withUtm("/names", [])).toBe("/names");
    expect(carriesUtm("/names/feedback")).toBe(true);
  });

  it("the landing page passes a campaign link's tags on to /names", async () => {
    const res = await landing.fetch(new Request("https://nestjourney.app/?utm_source=whatsapp"), {});
    const html = await res.text();
    expect(html).toContain("utm_campaign");
    expect(html).toContain("/^\\/(names|baby-names)(\\/|\\?|#|$)/");
  });
});
