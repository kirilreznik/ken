import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// §8 design rules, enforced on the names code: tokens only (no hex/rgb colors, no literal font sizes),
// logical properties only (no left/right, ml/mr/pl/pr) and a Hebrew aria-label on every icon-only button.

const ROOT = join(__dirname, "../..");
const DIRS = ["src/app/names", "src/components/names", "src/lib/names"];
const EXT = /\.(tsx?|mjs|css)$/;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return files(path);
    return EXT.test(entry) ? [path] : [];
  });
}

// Comments may name directions ("the right-most action"); only code counts. Keeps line numbers.
function stripComments(src: string): string {
  const blank = (m: string) => m.replace(/[^\n]/g, " ");
  return src
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, blank)
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, pre: string) => pre + blank(m.slice(pre.length)));
}

type Rule = { name: string; re: RegExp };

const RULES: Rule[] = [
  { name: "hex color", re: /(?<![\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g },
  { name: "rgb/hsl color", re: /(?<![\w-])(?:rgba?|hsla?|hwb|oklch|oklab)\(/g },
  { name: "literal font size", re: /\btext-\[(?:length:)?[\d.]+(?:px|rem|em)\]/g },
  { name: "literal font size", re: /font-size\s*:\s*[\d.]+(?:px|rem|em)\b/g },
  { name: "literal font size", re: /\bfontSize\s*:\s*["'`]?[\d.]+/g },
  { name: "physical class", re: /(?<![\w-])-?(?:ml|mr|pl|pr|left|right|scroll-m[lr]|scroll-p[lr])-[\w[(.]/g },
  { name: "physical class", re: /(?<![\w-])(?:text-(?:left|right)|rounded-[tb]?[lr]|border-[lr])(?![\w])/g },
  { name: "physical class", re: /(?<![\w-])(?:rounded-[tb]?[lr]|border-[lr])-[\w[(.]/g },
  { name: "physical property", re: /(?<![\w-])(?:margin|padding|border|inset|scroll-margin|scroll-padding)-(?:left|right)\b/g },
  { name: "physical property", re: /(?<![\w-])(?:left|right)\s*:/g },
  { name: "physical property", re: /\b(?:margin|padding|border|scrollMargin|scrollPadding)(?:Left|Right)\b/g },
  { name: "physical property", re: /\b(?:float|clear|text-align|textAlign)\s*:\s*["'`]?(?:left|right)\b/g },
];

type Hit = { file: string; line: number; rule: string; text: string };

function scanRules(file: string, src: string): Hit[] {
  const code = stripComments(src);
  const hits: Hit[] = [];
  for (const { name, re } of RULES) {
    for (const m of code.matchAll(re)) {
      const line = code.slice(0, m.index).split("\n").length;
      hits.push({ file, line, rule: name, text: m[0] });
    }
  }
  return hits;
}

// Reads a JSX tag starting at `<`; returns its end index (after `>`), name, attribute text and kind.
function readTag(src: string, at: number) {
  let i = at + 1;
  const closing = src[i] === "/";
  if (closing) i++;
  const nameMatch = /^[\w.:-]*/.exec(src.slice(i))!;
  const name = nameMatch[0];
  i += name.length;
  const attrStart = i;
  let depth = 0;
  let quote: string | null = null;
  for (; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === quote && src[i - 1] !== "\\") quote = null;
    } else if (c === '"' || c === "'" || c === "`") {
      quote = c;
    } else if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) break;
  }
  const attrs = src.slice(attrStart, i);
  return { end: i + 1, name, attrs, closing, selfClosing: attrs.trimEnd().endsWith("/") };
}

// True when the button body has no text an assistive tech would read (icons and aria-hidden parts only).
function hasReadableText(body: string): boolean {
  const hidden: boolean[] = [];
  for (let i = 0; i < body.length; ) {
    const c = body[i];
    if (c === "<" && /[\w/>]/.test(body[i + 1] ?? "")) {
      const tag = readTag(body, i);
      if (tag.closing) hidden.pop();
      else if (!tag.selfClosing) {
        const isIcon = tag.name === "svg" || /Icon$|^Icon/.test(tag.name);
        hidden.push(hidden.at(-1) || isIcon || /aria-hidden(?!=\{?\s*false)/.test(tag.attrs));
      }
      i = tag.end;
      continue;
    }
    if (!hidden.at(-1) && !/\s/.test(c)) return true;
    i++;
  }
  return false;
}

function scanButtons(file: string, src: string): Hit[] {
  const code = stripComments(src);
  const hits: Hit[] = [];
  for (const m of code.matchAll(/<button(?![\w])/g)) {
    const tag = readTag(code, m.index);
    // A spread passes through the caller's children and aria-label (the Button primitives).
    if (/aria-label(?:ledby)?\s*=|\{\s*\.\.\./.test(tag.attrs)) continue;
    const line = code.slice(0, m.index).split("\n").length;
    const close = code.indexOf("</button>", tag.end);
    if (tag.selfClosing || close < 0 || !hasReadableText(code.slice(tag.end, close))) {
      hits.push({ file, line, rule: "icon-only button without aria-label", text: "<button" });
    }
  }
  return hits;
}

describe("names design guard", () => {
  const all = DIRS.flatMap((d) => files(join(ROOT, d)));

  it("finds the names code", () => {
    expect(all.length).toBeGreaterThan(50);
  });

  it("has no hard-coded colors, literal font sizes or physical directions", () => {
    const hits = all.flatMap((f) => scanRules(relative(ROOT, f), readFileSync(f, "utf8")));
    expect(hits.map((h) => `${h.file}:${h.line} ${h.rule}: ${h.text}`)).toEqual([]);
  });

  it("gives every icon-only button an aria-label", () => {
    const hits = all
      .filter((f) => f.endsWith(".tsx"))
      .flatMap((f) => scanButtons(relative(ROOT, f), readFileSync(f, "utf8")));
    expect(hits.map((h) => `${h.file}:${h.line} ${h.rule}`)).toEqual([]);
  });

  // A space has any number of members and a match is a name two or more kept (NP-025).
  it("never assumes exactly two people choose", () => {
    const hits = all.flatMap((f) =>
      readFileSync(f, "utf8")
        .split("\n")
        .flatMap((text, i) => (/שניכם|שנינו/.test(text) ? [`${relative(ROOT, f)}:${i + 1}`] : [])),
    );
    expect(hits).toEqual([]);
  });
});

describe("scanRules", () => {
  const rules = (src: string) => scanRules("x.tsx", src).map((h) => h.rule);

  it.each([
    ['className="text-[#1f1a17]"', "hex color"],
    ["color: #fff;", "hex color"],
    ["background: rgba(0, 0, 0, 0.4);", "rgb/hsl color"],
    ['style={{ color: "hsl(10 20% 30%)" }}', "rgb/hsl color"],
    ['className="text-[15px]"', "literal font size"],
    ["font-size: 1.2rem;", "literal font size"],
    ["style={{ fontSize: 14 }}", "literal font size"],
    ['className="ml-2"', "physical class"],
    ['className="pr-4"', "physical class"],
    ['className="-left-2"', "physical class"],
    ['className="right-0"', "physical class"],
    ['className="text-left"', "physical class"],
    ['className="rounded-tl-lg"', "physical class"],
    ['className="border-r"', "physical class"],
    ["margin-left: 4px;", "physical property"],
    ["left: 0;", "physical property"],
    ["style={{ right: 0 }}", "physical property"],
    ["style={{ marginLeft: 4 }}", "physical property"],
    ["text-align: right;", "physical property"],
  ])("flags %s", (src, rule) => {
    expect(rules(src)).toContain(rule);
  });

  it.each([
    'className="ms-2 pe-4 start-0 end-0 -start-[90px] text-start rounded-s-lg border-e"',
    'className="px-[max(env(safe-area-inset-left),env(safe-area-inset-right))]"',
    'className="text-body bg-(--nest-glass-tint)"',
    "font-size: var(--nest-text-body);",
    'href="/names#top" id="add-name"',
    "// the right-most action\n/* left: 0 */",
    'const url = "https://example.com"; // left: 0',
    "&#123;",
  ])("allows %s", (src) => {
    expect(rules(src)).toEqual([]);
  });
});

describe("scanButtons", () => {
  const flagged = (src: string) => scanButtons("x.tsx", src).length > 0;

  it("flags an icon-only button without aria-label", () => {
    expect(flagged('<button type="button"><svg viewBox="0 0 24 24"><path d="M0 0" /></svg></button>')).toBe(true);
    expect(flagged("<button onClick={go}>\n  <Icon>\n    <circle r={1} />\n  </Icon>\n</button>")).toBe(true);
    expect(flagged('<button><span aria-hidden="true">×</span></button>')).toBe(true);
    expect(flagged('<button type="button" />')).toBe(true);
  });

  it("allows labelled or text buttons", () => {
    expect(flagged('<button aria-label="סגירה"><svg /></button>')).toBe(false);
    expect(flagged("<button aria-label={`אפשרויות עבור ${name}`}><Icon /></button>")).toBe(false);
    expect(flagged("<button><Icon><path /></Icon>\n הסרה מהרשימה</button>")).toBe(false);
    expect(flagged('<button><svg /><span className="sr-only">סגירה</span></button>')).toBe(false);
    expect(flagged("<button onClick={() => setOpen((o) => !o)}>{label}</button>")).toBe(false);
    expect(flagged("<button {...attrs} type={type} className={cls} />")).toBe(false);
  });
});
