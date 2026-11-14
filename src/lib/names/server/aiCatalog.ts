import { buildCards } from "@/lib/names/card";
import { parseNames, type RawNamesFile } from "@/lib/names/data";
import { meaningLabel } from "@/lib/names/relative";
import { THEME_LABELS, isThemeId } from "@/lib/names/themes";
import type { Card, NameContent } from "@/lib/names/types";
import contentFile from "../../../../data/names/name-content.json";
import latinFile from "../../../../data/names/name-latin.json";
import meaningsFile from "../../../../data/names/name-meanings.json";
import namesFile from "../../../../data/names/names.json";
import themesFile from "../../../../data/names/name-themes.json";

/**
 * The deck as Claude sees it: one line per card, numbered by a stable id. Built once per
 * server instance from the same files the app ships (data/names/*.json), in content order, so
 * the text is byte-identical between requests and the prompt cache holds.
 *
 * Every field here is our own checked content; nothing from a user ever goes into it.
 */
export interface Catalog {
  /** Cards by id (the line number Claude answers with). */
  cards: readonly Card[];
  /** id by deck name. */
  ids: ReadonlyMap<string, number>;
  /** The lines, one per card: `id|name|sex|2024|trend|letters|themes|meanings|latin|bible|intro`. */
  text: string;
}

const SEX: Record<string, string> = { בן: "בן", בת: "בת", "מתאים לכולם": "לכולם" };
const INTRO_MAX = 110;

type PerName<T> = { names: Record<string, T> };

/** The card content with themes, Latin spellings and meaning groups added (as scripts/build-names-data.mjs does). */
function content(): Map<string, NameContent> {
  const names = (contentFile as unknown as PerName<NameContent>).names;
  const themes = (themesFile as unknown as PerName<string[]>).names;
  const latin = (latinFile as unknown as PerName<{ he?: string; intl?: string }>).names;
  const meanings = (meaningsFile as unknown as PerName<string[]>).names;
  const out = new Map<string, NameContent>();
  for (const [name, c] of Object.entries(names)) {
    out.set(name, { ...c, themes: themes[name], latin: latin[name], meanings: meanings[name] });
  }
  return out;
}

/** Strips the field separator and line breaks from our own text, so a line always has 11 fields. */
function field(text: string | undefined | null): string {
  return (text ?? "").replace(/[|\r\n]+/g, " ").trim();
}

export function catalogLine(id: number, card: Card): string {
  const { stats, content: c, derived } = card;
  const themes = (c.themes ?? []).filter(isThemeId).map((t) => THEME_LABELS[t]).join(",");
  const meanings = (c.meanings ?? []).map(meaningLabel).filter(Boolean).join(",");
  const latin = c.latin?.intl ?? c.latin?.he ?? "";
  const intro = [...field(c.intro)].slice(0, INTRO_MAX).join("");
  return [
    id,
    stats.name,
    SEX[derived.sexTag] ?? "",
    derived.band,
    derived.trend?.word ?? "",
    [...stats.name].length,
    themes,
    meanings,
    field(latin),
    c.bible ? "תנ״ך" : "",
    intro,
  ]
    .map((v) => field(String(v)))
    .join("|");
}

export function buildCatalog(cards: readonly Card[]): Catalog {
  const ids = new Map<string, number>();
  const lines: string[] = [];
  cards.forEach((card, id) => {
    ids.set(card.stats.name, id);
    lines.push(catalogLine(id, card));
  });
  return { cards, ids, text: lines.join("\n") };
}

let cached: Catalog | null = null;

/** The catalog for this server instance (built on first use). */
export function getCatalog(): Catalog {
  cached ??= buildCatalog(buildCards(parseNames(namesFile as unknown as RawNamesFile), content()));
  return cached;
}
