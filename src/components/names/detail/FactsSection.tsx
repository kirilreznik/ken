import { factTiles } from "@/lib/names/detail";
import type { NameStats } from "@/lib/names/types";
import { Numbers } from "./NumbersSection";

const COLS = ["grid-cols-1", "grid-cols-2", "grid-cols-3"] as const;

/**
 * FR-D15 (board 14): up to three wells in one row, value over label (all-time births, 2024
 * rank, compared with 2000). Tiles that don't apply are left out and the rest share the row;
 * words wrap instead of truncating, but a number never breaks inside itself.
 */
export default function FactsSection({ stats, rank }: { stats: Pick<NameStats, "m" | "f" | "y">; rank: number | null }) {
  const tiles = factTiles(stats, rank);
  return (
    <ul data-facts className={`m-0 grid list-none gap-1.5 p-0 ${COLS[tiles.length - 1]}`}>
      {tiles.map((tile) => (
        <li key={tile.key} className="names-well flex min-w-0 flex-col gap-1 rounded-md px-2.5 py-3">
          <span className="text-stat break-words text-ink [&_bdi]:whitespace-nowrap">
            <Numbers text={tile.value} />
          </span>
          <span className="text-ref break-words text-ink-soft">
            <Numbers text={tile.label} />
          </span>
        </li>
      ))}
    </ul>
  );
}
