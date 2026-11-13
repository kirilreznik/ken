import { FIRST_TREND_YEAR, LAST_YEAR } from "@/lib/names/data";
import { chartLabel, chartModel } from "@/lib/names/detail";
import type { NameStats } from "@/lib/names/types";

/** Chart units: the SVG stretches to the container, labels are HTML placed by percent so they keep their size. */
const W = 1000;
const H = 400;
const fmt = new Intl.NumberFormat("he-IL");

/**
 * The 2000–2024 births chart, server-rendered for the public pages: a peach area, an ink line,
 * a clay dot on 2024 and gridlines at 0 and two round values (the same model as the swiper's
 * sheet chart). LTR like every chart in the app. Under it, every year in a table people and
 * search engines can read.
 */
export default function YearChart({ stats }: { stats: Pick<NameStats, "y"> }) {
  const model = chartModel(stats.y, { width: W, height: H, pad: 0 });
  if (!model || !stats.y) {
    return (
      <p className="m-0 text-body text-ink-soft">
        אין נתונים לשנים <bdi dir="ltr">{`${FIRST_TREND_YEAR}–${LAST_YEAR}`}</bdi>
      </p>
    );
  }
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  return (
    <figure className="m-0 flex flex-col gap-2">
      <div className="rounded-md border border-line bg-surface p-3" style={{ direction: "ltr" }}>
        <div className="seo-chart relative ms-12 me-2 mt-2 mb-6 h-44 sm:h-56" role="img" aria-label={chartLabel(stats)}>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false" className="absolute inset-0 block h-full w-full overflow-visible">
            <polygon points={model.area} className="fill-peach-soft" />
            {model.yTicks.map((t) => (
              <line key={t.value} x1={0} x2={W} y1={t.y} y2={t.y} strokeWidth={1} className="stroke-line" />
            ))}
            <polyline points={model.line} fill="none" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" className="stroke-ink" />
          </svg>
          <span
            aria-hidden="true"
            className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-clay"
            style={{ left: pct(model.last.x, W), top: pct(model.last.y, H) }}
          />
          {model.yTicks.map((t) => (
            <span
              key={t.value}
              aria-hidden="true"
              className="absolute -translate-y-1/2 pe-2 text-caption text-stone"
              style={{ right: "100%", top: pct(t.y, H) }}
            >
              {t.label}
            </span>
          ))}
          {model.xLabels.map((l, i) => (
            <span
              key={l.year}
              aria-hidden="true"
              className={`absolute top-full pt-1 text-caption text-stone ${i === 0 ? "" : i === model.xLabels.length - 1 ? "-translate-x-full" : "-translate-x-1/2"}`}
              style={{ left: pct(l.x, W) }}
            >
              {l.label}
            </span>
          ))}
        </div>
      </div>
      <figcaption className="text-caption text-stone">
        מספר התינוקות שקיבלו את השם בכל שנה, <bdi dir="ltr">{`${FIRST_TREND_YEAR}–${LAST_YEAR}`}</bdi>. שנה עם פחות מ־5 תינוקות
        מופיעה כ־0.
      </figcaption>
      <details className="rounded-md border border-line bg-surface px-4">
        <summary className="flex min-h-11 items-center text-person font-bold text-ink-soft">כל השנים בטבלה</summary>
        <table className="mb-3 w-full border-collapse text-person">
          <thead>
            <tr className="text-stone">
              <th scope="col" className="py-1 text-start font-bold">
                שנה
              </th>
              <th scope="col" className="py-1 text-start font-bold">
                תינוקות
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.y
              .map((n, i) => ({ year: FIRST_TREND_YEAR + i, n }))
              .reverse()
              .map(({ year, n }) => (
                <tr key={year} className="border-t border-line">
                  <td className="py-1">
                    <bdi dir="ltr">{year}</bdi>
                  </td>
                  <td className="py-1">{n > 0 ? <bdi dir="ltr">{fmt.format(n)}</bdi> : "פחות מ־5"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
