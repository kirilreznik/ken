// Generates src/styles/nest-tokens.css from docs/names-pwa/brand/tokens.json.
// Run with `npm run tokens:css`. Never edit the generated file by hand.
//
// Raw values live under :root as --nest-* (prefixed so they never collide with the
// landing page's own :root variables). The @theme block exposes them to Tailwind 4
// as bg-ink, rounded-lg, shadow-card, text-title, font-nest and so on.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = JSON.parse(readFileSync(resolve(root, "docs/names-pwa/brand/tokens.json"), "utf8"));
const out = resolve(root, "src/styles/nest-tokens.css");

// Values the brand file doesn't carry but the names design does: the liquid glass
// (docs/names-pwa/design/source/Glass*.dc.html, Main.dc.html) and the photo scrim and
// overlays of the landing demo (src/lib/pregnancy-names-demo.mjs namesStyle).
const extras = {
  "glass-tint": "rgba(255,255,255,0.34)",
  "glass-soft-tint": "rgba(255,255,255,0.22)",
  "glass-well-tint": "rgba(255,255,255,0.42)",
  "glass-blur": "28px",
  "glass-saturate": "180%",
  "glass-filter": "blur(28px) saturate(180%)",
  "glass-soft-blur": "20px",
  "glass-soft-saturate": "160%",
  "glass-soft-filter": "blur(20px) saturate(160%)",
  "glass-border": "rgba(255,255,255,0.55)",
  "glass-soft-border": "rgba(255,255,255,0.45)",
  "glass-well-border": "rgba(255,255,255,0.5)",
  "glass-highlight": "inset 0 1px 0 rgba(255,255,255,0.5)",
  // Stronger glass over the user's own photo (PRD 3.2.15), any photo can sit behind it.
  "glass-own-tint": "rgba(255,255,255,0.55)",
  "glass-own-soft-tint": "rgba(255,255,255,0.4)",
  "glass-own-well-tint": "rgba(255,255,255,0.6)",
  "white-30": "rgba(255,255,255,0.3)",
  "white-55": "rgba(255,255,255,0.55)",
  "white-60": "rgba(255,255,255,0.6)",
  "white-70": "rgba(255,255,255,0.7)",
  "white-75": "rgba(255,255,255,0.75)",
  "peach-pale-60": "rgba(255,246,238,0.6)",
  "ink-35": "rgba(31,27,30,0.35)",
  "ink-45": "rgba(31,27,30,0.45)",
  "ink-75": "rgba(31,27,30,0.75)",
  "scrim-photo": "linear-gradient(180deg, rgba(244,242,241,0.75), rgba(244,242,241,0))",
  "scrim-photo-height": "180px",
  "bg-none":
    "radial-gradient(circle at 85% 30%, rgba(255,207,168,0.55), rgba(255,207,168,0) 45%), radial-gradient(circle at 10% 85%, rgba(255,226,201,0.7), rgba(255,226,201,0) 40%)",
  "blob-blur": "60px",
  "shadow-button": "0 8px 20px rgba(31,27,30,0.25)",
  "shadow-button-soft": "0 8px 20px rgba(31,27,30,0.18)",
  "shadow-card-raised": "0 1px 2px rgba(31,27,30,0.04), 0 8px 20px rgba(31,27,30,0.08)",
  // The nearer peeking card under the current one on "ללא רקע" (Main.dc.html).
  "surface-dim": "#FBF9F8",
};

// Type sizes of the names boards that the brand scale doesn't have: the card's name
// (52/60, GlassFabric.dc.html), the primary button label (16, Intro.dc.html) and the
// card's sex tag (11, GlassFabric.dc.html).
const extraStyles = [
  { name: "name", fontSize: "52px", lineHeight: "60px", fontWeight: 800, letterSpacing: "-1px" },
  { name: "button", fontSize: "16px", lineHeight: "22px", fontWeight: 700 },
  { name: "tag", fontSize: "11px", lineHeight: "14px", fontWeight: 700 },
  // Card details (Main.dc.html): Bible text, its reference, a known-person row.
  { name: "quote", fontSize: "13.5px", lineHeight: "20px", fontWeight: 500 },
  { name: "ref", fontSize: "12px", lineHeight: "16px", fontWeight: 500 },
  { name: "person", fontSize: "13px", lineHeight: "18px", fontWeight: 500 },
  // The number in a card's births tile.
  { name: "stat", fontSize: "18px", lineHeight: "22px", fontWeight: 800 },
  // The card's intro line (Main.dc.html) and the swipe stamps (the demo's .nd-stamp).
  { name: "intro", fontSize: "15px", lineHeight: "22px", fontWeight: 500 },
  { name: "stamp", fontSize: "22px", lineHeight: "28px", fontWeight: 800 },
  // The next-but-one name on the farther peeking card (Main.dc.html).
  { name: "peek", fontSize: "14px", lineHeight: "18px", fontWeight: 800 },
  // The name on the intro's small card illustration (Intro.dc.html).
  { name: "hero-name", fontSize: "34px", lineHeight: "40px", fontWeight: 800 },
  // The privacy note under the background options (Background.dc.html).
  { name: "note", fontSize: "12.5px", lineHeight: "19px", fontWeight: 500 },
];

const colors = tokens.color.tokens;
const radii = tokens.radius.tokens;
const shadows = tokens.shadow.tokens;
const spacing = tokens.spacing.tokens;
const styles = [...tokens.type.groups.flatMap((g) => g.styles), ...extraStyles];

const rootVars = [
  ...colors.map((t) => [t.name, t.value]),
  ...radii.map((t) => [t.name, t.value]),
  ...shadows.map((t) => [t.name, t.value]),
  ...spacing.map((t) => [t.name, t.value]),
  ["font-sans", tokens.type.families.sans],
  ...styles.flatMap((s) => [
    [`text-${s.name}`, s.fontSize],
    [`text-${s.name}-line-height`, s.lineHeight],
    [`text-${s.name}-weight`, String(s.fontWeight)],
    ...(s.letterSpacing ? [[`text-${s.name}-tracking`, s.letterSpacing]] : []),
  ]),
  ...Object.entries(extras),
];

const theme = [
  ...colors.map((t) => [`color-${t.name}`, `var(--nest-${t.name})`]),
  ...radii.map((t) => [t.name, `var(--nest-${t.name})`]),
  ...shadows.map((t) => [t.name, `var(--nest-${t.name})`]),
  ...Object.keys(extras)
    .filter((k) => k.startsWith("shadow-"))
    .map((k) => [k, `var(--nest-${k})`]),
  ["font-nest", "var(--nest-font-sans)"],
  ...styles.flatMap((s) => [
    [`text-${s.name}`, `var(--nest-text-${s.name})`],
    [`text-${s.name}--line-height`, `var(--nest-text-${s.name}-line-height)`],
    [`text-${s.name}--font-weight`, `var(--nest-text-${s.name}-weight)`],
    ...(s.letterSpacing ? [[`text-${s.name}--letter-spacing`, `var(--nest-text-${s.name}-tracking)`]] : []),
  ]),
];

const block = (pairs, prefix) => pairs.map(([k, v]) => `  --${prefix}${k}: ${v};`).join("\n");

const css = `/* Generated by scripts/build-nest-tokens.mjs from docs/names-pwa/brand/tokens.json.
 * Do not edit by hand: run \`npm run tokens:css\`.
 * Imported once, from src/app/names/layout.tsx. Preflight already comes from
 * src/app/globals.css, so only the theme and utilities layers are pulled in here. */

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

:root {
${block(rootVars, "nest-")}
}

@theme inline {
${block(theme, "")}
}
`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, css);
console.log(`Wrote ${out.replace(root + "/", "")}`);
