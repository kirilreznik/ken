// Which names the deck keeps: names in use among Jewish Israelis (owner decision 2026-11-13;
// the swiper's current version is for the Israeli, mainly Jewish, market).
//
// Measured on the CBS sector split (sectors.json), never by judging a name by hand. A name stays when
//   (a) most babies ever given it were in the Jewish sector, or
//   (b) since 2000, at least JEWISH_MIN_RECENT Jewish babies got it AND they are at least
//       JEWISH_SHARE_RECENT of all babies given it since 2000 (for shared names such as לין, איה, אדם).
// A name with no row in sectors.json was only ever given in the Jewish sector, so it stays.
// sector-overrides.json lets the owner keep or drop a single name against the rule, with a reason.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const JEWISH_SHARE_ALL_TIME = 0.5;
export const JEWISH_MIN_RECENT = 100;
export const JEWISH_SHARE_RECENT = 0.1;

/** Why the rule keeps or drops a name: "only-jewish" | "all-time" | "recent" | "below". */
export function sectorReason(row) {
  if (!row) return "only-jewish";
  const [jAll, all, jRecent, recent] = row;
  if (all > 0 && jAll / all >= JEWISH_SHARE_ALL_TIME) return "all-time";
  if (jRecent >= JEWISH_MIN_RECENT && jRecent / recent >= JEWISH_SHARE_RECENT) return "recent";
  return "below";
}

/** Loads sectors.json and sector-overrides.json from content-src; returns name -> { keep, why, row }. */
export function loadSectorRule(srcDir) {
  const sectors = JSON.parse(readFileSync(resolve(srcDir, "sectors.json"), "utf8")).names;
  const overridesFile = resolve(srcDir, "sector-overrides.json");
  const overrides = existsSync(overridesFile) ? JSON.parse(readFileSync(overridesFile, "utf8")) : {};
  const keep = overrides.keep ?? {};
  const drop = overrides.drop ?? {};
  return (name) => {
    const row = sectors[name] ?? null;
    if (keep[name]) return { keep: true, why: `owner keeps: ${keep[name]}`, row };
    if (drop[name]) return { keep: false, why: `owner drops: ${drop[name]}`, row };
    const reason = sectorReason(row);
    return { keep: reason !== "below", why: reason, row };
  };
}
