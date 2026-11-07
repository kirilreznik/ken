/**
 * The name sheet's analytics (PRD 3.2.10): one visit runs from the sheet opening on a name until
 * the URL no longer holds a name (`n`), so the about and report sheets opened from it, and the
 * similar names pushed over it, stay inside the visit. `detail_closed` ends it on every close
 * path (✕, handle, drag, scrim, Escape, Back, a decision); `detail_section_seen` is sent once
 * per section for each name shown in the visit, since each similar name is its own
 * `detail_opened` (Back to a name already shown sends nothing again).
 */

import type { NamesEvent, TrackProps } from "./track";

export type DetailSection = "numbers" | "similar" | "story";

type Send = (event: NamesEvent, props?: TrackProps) => void;

export interface DetailVisits {
  /** The name the sheet shows (null when it shows none) and whether the URL still holds a name. */
  update(name: string | null, lasting: boolean): void;
  /** The handle took the sheet to full height. */
  full(): void;
  /** A section scrolled into view. */
  seen(section: DetailSection): void;
}

export function createDetailVisits(send: Send, now: () => number = () => performance.now()): DetailVisits {
  let visit: { at: number; full: boolean; name: string; seen: Map<string, Set<DetailSection>> } | null = null;
  return {
    update(name, lasting) {
      if (!visit) {
        if (name !== null) visit = { at: now(), full: false, name, seen: new Map() };
        return;
      }
      if (!lasting) {
        send("detail_closed", { seconds: Math.max(0, Math.round((now() - visit.at) / 1000)), full: visit.full });
        visit = null;
      } else if (name !== null) visit.name = name;
    },
    full() {
      if (visit) visit.full = true;
    },
    seen(section) {
      if (!visit) return;
      const seen = visit.seen.get(visit.name) ?? new Set<DetailSection>();
      if (seen.has(section)) return;
      visit.seen.set(visit.name, seen.add(section));
      send("detail_section_seen", { section });
    },
  };
}
