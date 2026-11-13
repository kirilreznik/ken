import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
// @ts-expect-error plain .mjs build script without types
import { buildNamesData } from "../../scripts/build-names-data.mjs";

type Manifest = { names: string; content: string; details: string; builtAt: string };
const build = buildNamesData as (o: { srcDir: string; outDir: string; now?: Date }) => Manifest;

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function setup(names: unknown, content: unknown, details?: unknown) {
  const dir = mkdtempSync(join(tmpdir(), "names-data-"));
  dirs.push(dir);
  const srcDir = join(dir, "src");
  mkdirSync(srcDir);
  writeFileSync(join(srcDir, "names.json"), JSON.stringify(names, null, 2));
  writeFileSync(join(srcDir, "name-content.json"), JSON.stringify(content, null, 2));
  if (details) writeFileSync(join(srcDir, "name-details.json"), JSON.stringify(details, null, 2));
  return { srcDir, outDir: join(dir, "out") };
}

const names = { firstTrendYear: 2000, lastYear: 2024, names: [{ n: "זיו", m: 10, f: 5, s: "1949" }] };
const content = { names: { "זיו": { niqqud: "זִיו", intro: "אור", people: [] } } };
const details = { _about: "x", names: { "זיו": { story: null, similar: ["זיוה"] } } };

describe("build-names-data", () => {
  it("writes minified hashed files and a manifest", () => {
    const paths = setup(names, content, details);
    const manifest = build({ ...paths, now: new Date("2026-11-04T00:00:00Z") });

    expect(manifest.names).toMatch(/^names\.[0-9a-f]{12}\.json$/);
    expect(manifest.content).toMatch(/^content\.[0-9a-f]{12}\.json$/);
    expect(manifest.details).toMatch(/^details\.[0-9a-f]{12}\.json$/);
    expect(JSON.parse(readFileSync(join(paths.outDir, "manifest.json"), "utf8"))).toEqual({
      names: manifest.names,
      content: manifest.content,
      details: manifest.details,
      builtAt: "2026-11-04T00:00:00.000Z",
    });
    expect(readFileSync(join(paths.outDir, manifest.names), "utf8")).toBe(JSON.stringify(names));
    expect(readFileSync(join(paths.outDir, manifest.content), "utf8")).toBe(JSON.stringify(content));
    expect(readFileSync(join(paths.outDir, manifest.details), "utf8")).toBe(JSON.stringify(details));
  });

  it("publishes an empty details file when name-details.json is missing", () => {
    const paths = setup(names, content);
    const manifest = build(paths);
    expect(JSON.parse(readFileSync(join(paths.outDir, manifest.details), "utf8"))).toEqual({ names: {} });
  });

  it("keeps hashes stable for the same input", () => {
    const a = build(setup(names, content, details));
    const b = build(setup(names, content, details));
    expect([b.names, b.content, b.details]).toEqual([a.names, a.content, a.details]);
  });

  it("changes the hash when content changes and removes old hashed files", () => {
    const paths = setup(names, content, details);
    const first = build(paths);
    writeFileSync(join(paths.outDir, "keep.txt"), "x");
    writeFileSync(join(paths.outDir, "details.0123456789ab.json"), "{}");

    const changed = { names: { ...content.names, "נוי": { niqqud: "נוֹי", intro: "יופי", people: [] } } };
    writeFileSync(join(paths.srcDir, "name-content.json"), JSON.stringify(changed));
    const second = build(paths);

    expect(second.names).toBe(first.names);
    expect(second.content).not.toBe(first.content);
    expect(readdirSync(paths.outDir).sort()).toEqual(
      [second.content, second.details, "keep.txt", "manifest.json", second.names].sort(),
    );

    writeFileSync(join(paths.srcDir, "name-details.json"), JSON.stringify({ names: {} }));
    const third = build(paths);
    expect(third.details).not.toBe(second.details);
    expect(readdirSync(paths.outDir)).not.toContain(second.details);
  });

  it("builds the real data", () => {
    const dir = mkdtempSync(join(tmpdir(), "names-data-"));
    dirs.push(dir);
    const manifest = build({ srcDir: "data/names", outDir: dir });
    const raw = JSON.parse(readFileSync(join(dir, manifest.names), "utf8"));
    expect(raw.names).toHaveLength(19884);
    const published = JSON.parse(readFileSync(join(dir, manifest.details), "utf8"));
    expect(published).toEqual(JSON.parse(readFileSync("data/names/name-details.json", "utf8")));
  });
});
