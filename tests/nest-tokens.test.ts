import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import tokens from "../docs/names-pwa/brand/tokens.json";

const css = readFileSync(new URL("../src/styles/nest-tokens.css", import.meta.url), "utf8");

describe("nest-tokens.css", () => {
  it.each(tokens.color.tokens.map((t) => [t.name, t.value]))("defines color %s as %s", (name, value) => {
    expect(css).toContain(`--nest-${name}: ${value};`);
    expect(css).toContain(`--color-${name}: var(--nest-${name});`);
  });

  it("defines every radius, shadow, spacing and type token", () => {
    for (const t of [...tokens.radius.tokens, ...tokens.shadow.tokens, ...tokens.spacing.tokens]) {
      expect(css).toContain(`--nest-${t.name}: ${t.value};`);
    }
    for (const s of tokens.type.groups.flatMap((g) => g.styles)) {
      expect(css).toContain(`--nest-text-${s.name}: ${s.fontSize};`);
      expect(css).toContain(`--nest-text-${s.name}-line-height: ${s.lineHeight};`);
    }
  });
});
