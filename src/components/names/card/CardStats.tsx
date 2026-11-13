import { TREND_RANGE, countTile, sparkEnd, trendLabel } from "@/lib/names/card";
import { SPARK_VIEWBOX } from "@/lib/names/popularity";
import type { CardDerived, NameStats } from "@/lib/names/types";

type CardStatsProps = Pick<CardDerived, "band" | "trend" | "spark"> & { stats: NameStats };

const tile = "names-well flex flex-col rounded-md p-3";
const label = "text-tag text-ink-soft in-data-[names-bg=none]:text-stone";

/**
 * The two number tiles (E16 FR-5, FR-5a): births in the latest year with the popularity
 * band, and the 2000–2024 sparkline with its arrow and word. The word reads only the last few
 * years, so the caption names the chart's range and the word says "לאחרונה". A name with no recent years
 * shows the all-time count and no trend tile, so the trend never shows as a shape alone.
 * Sizes from Main.dc.html (canvas wells) and GlassFabric.dc.html (glass wells).
 */
export default function CardStats({ stats, band, trend, spark }: CardStatsProps) {
  const count = countTile(stats);
  const end = sparkEnd(spark);
  const showTrend = trend && spark && end;
  return (
    <div className={`grid gap-3 ${showTrend ? "grid-cols-2" : "grid-cols-1"}`}>
      <div className={`${tile} gap-0.5`}>
        <span className={label}>{count.label}</span>
        <span className="text-stat text-ink">
          <bdi dir="ltr">{count.value}</bdi>
        </span>
        <span className="text-ref text-ink-soft">תינוקות · {band}</span>
      </div>
      {showTrend && (
        <div className={`${tile} gap-1`}>
          <span className={label}>
            <bdi dir="ltr">{TREND_RANGE}</bdi>
          </span>
          <svg
            width="132"
            height="36"
            viewBox={SPARK_VIEWBOX}
            role="img"
            aria-label={trendLabel(trend.word)}
            className="h-auto w-full"
            style={{ direction: "ltr" }}
          >
            <polyline
              points={spark}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-ink"
            />
            <circle cx={end.x} cy={end.y} r="3.5" className="fill-clay" />
          </svg>
          <span className="flex items-center gap-1 text-ref font-bold text-ink">
            <span aria-hidden="true">{trend.arrow}</span>
            <span>{trend.word} לאחרונה</span>
          </span>
        </div>
      )}
    </div>
  );
}
