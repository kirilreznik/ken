import namesFile from "../../../data/names/names.json";
import contentFile from "../../../data/names/name-content.json";
import { buildCards } from "./card";
import { parseContent, parseNames, type RawContentFile, type RawNamesFile } from "./data";
import type { Card } from "./types";

let cards: Card[] | null = null;

/** The content names' cards, built at render time on the server from data/names (welcome, dev pages). */
export function staticCards(): Card[] {
  cards ??= buildCards(parseNames(namesFile as RawNamesFile), parseContent(contentFile as RawContentFile));
  return cards;
}
