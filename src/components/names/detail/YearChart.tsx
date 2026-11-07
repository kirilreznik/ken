"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { FIRST_TREND_YEAR, LAST_YEAR } from "@/lib/names/data";
import { chartLabel, chartModel, type ChartPad } from "@/lib/names/detail";
import type { NameStats } from "@/lib/names/types";

/** Plot height and room for the labels, in CSS px (board 14's 220 × 96 chart at phone width). */
const HEIGHT = 148;
const PAD: ChartPad = { top: 10, end: 8, bottom: 24, start: 40 };

const anchor = (i: number, n: number) => (i === 0 ? "start" : i === n - 1 ? "end" : "middle");

/**
 * The 2000–2024 births chart (PRD 3.2.9, board 14): `line` gridlines at 0 and two round values,
 * a `peach-soft` area, an ink line and a clay dot on 2024, on a surface well. Drawn in CSS px at
 * the container's width so the labels keep their token size; LTR on the SVG only, like the
 * sparkline. A name with no 2000–2024 years shows the no-data line instead.
 */
export default function YearChart({ stats }: { stats: Pick<NameStats, "y"> }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setWidth(Math.round(el.clientWidth));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const model = width > 0 ? chartModel(stats.y, { width, height: HEIGHT, pad: PAD }) : null;
  if (!stats.y) {
    return (
      <p className="m-0 text-body text-ink-soft">
        אין נתונים לשנים <bdi dir="ltr">{`${FIRST_TREND_YEAR}–${LAST_YEAR}`}</bdi>
      </p>
    );
  }
  return (
    <div className="rounded-sm border border-line bg-surface p-2">
      <div ref={box} style={{ height: HEIGHT }}>
        {model ? (
          <svg
            width={width}
            height={HEIGHT}
            viewBox={`0 0 ${width} ${HEIGHT}`}
            role="img"
            aria-label={chartLabel(stats)}
            className="block overflow-visible"
            style={{ direction: "ltr" }}
          >
            <polygon points={model.area} className="fill-peach-soft" />
            {model.yTicks.map((tick) => (
              <g key={tick.value}>
                <line x1={PAD.start} x2={width - PAD.end} y1={tick.y} y2={tick.y} strokeWidth={1} className="stroke-line" />
                <text x={PAD.start - 6} y={tick.y} textAnchor="end" dominantBaseline="middle" className="fill-stone text-caption">
                  {tick.label}
                </text>
              </g>
            ))}
            <polyline
              points={model.line}
              fill="none"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-ink"
            />
            <circle cx={model.last.x} cy={model.last.y} r={4} className="fill-clay" />
            {model.xLabels.map((label, i) => (
              <text
                key={label.year}
                x={label.x}
                y={HEIGHT - 4}
                textAnchor={anchor(i, model.xLabels.length)}
                className="fill-stone text-caption"
              >
                {label.label}
              </text>
            ))}
          </svg>
        ) : null}
      </div>
    </div>
  );
}
