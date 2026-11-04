import tokens from "../../../docs/names-pwa/brand/tokens.json";

function colorToken(name: string): string {
  const token = tokens.color.tokens.find((t) => t.name === name);
  if (!token) throw new Error(`Missing color token: ${name}`);
  return token.value;
}

/** The app background, for places that need a literal value (viewport theme color, manifest). */
export const canvasColor = colorToken("canvas");
