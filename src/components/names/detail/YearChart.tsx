"use client";

import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { FIRST_TREND_YEAR, LAST_YEAR } from "@/lib/names/data";
import { babies, chartKeyStep, chartLabel, chartModel, type ChartPad } from "@/lib/names/detail";
import type { NameStats } from "@/lib/names/types";

/** Plot height and room for the labels, in CSS px (board 14's 220 × 96 chart at phone width). */
const HEIGHT = 148;
const PAD: ChartPad = { top: 10, end: 8, bottom: 24, start: 40 };
/** Gap between the chosen point and its label. */
const TIP_GAP = 8;

const anchor = (i: number, n: number) => (i === 0 ? "start" : i === n - 1 ? "end" : "middle");

/**
 * The 2000–2024 births chart (PRD 3.2.9, board 14): `line` gridlines at 0 and two round values,
 * a `peach-soft` area, an ink line and a clay dot on 2024, on a surface well. Drawn in CSS px at
 * the container's width so the labels keep their token size; LTR on the SVG only, like the
 * sparkline. A name with no 2000–2024 years shows the no-data line instead.
 *
 * Tap, drag or hover picks the nearest year and shows its count in a label above the point;
 * focused, Left/Right (and Home/End) move the year. `touch-action: pan-y` keeps the sheet's
 * vertical scroll and gives sideways drags to the chart. Screen readers get the summary as the
 * chart's label, a hidden table of every year and a live line for the chosen year.
 */
export default function YearChart({ stats }: { stats: Pick<NameStats, "y"> }) {
  const box = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [tip, setTip] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setWidth(Math.round(el.clientWidth));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = tipRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    setTip((t) => (t.w === w && t.h === h ? t : { w, h }));
  }, [active]);

  const model = width > 0 ? chartModel(stats.y, { width, height: HEIGHT, pad: PAD }) : null;
  if (!stats.y) {
    return (
      <p className="m-0 text-body text-ink-soft">
        אין נתונים לשנים <bdi dir="ltr">{`${FIRST_TREND_YEAR}–${LAST_YEAR}`}</bdi>
      </p>
    );
  }

  const pick = (event: PointerEvent<HTMLDivElement>) => {
    if (!model || !box.current) return;
    const x = event.clientX - box.current.getBoundingClientRect().left;
    setActive(model.nearestYear(x) - FIRST_TREND_YEAR);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    // A mouse hovers; a finger or pen only while it's down.
    if (event.pointerType === "mouse" || event.buttons) pick(event);
  };
  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") setActive(null);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = chartKeyStep(active, event.key);
    if (next === null) return;
    event.preventDefault();
    setActive(next);
  };

  const point = model && active !== null ? model.points[active] : null;
  // The label sits centred above the point, kept inside the chart; below it when the point is near the top.
  const tipX = point ? Math.min(Math.max(point.x - tip.w / 2, 0), width - tip.w) : 0;
  const above = point ? point.y - TIP_GAP - tip.h : 0;
  const tipY = point ? (above >= 0 ? above : Math.min(point.y + TIP_GAP, HEIGHT - tip.h)) : 0;
  const readout = point ? `ב־${point.year}: ${babies(point.value)}` : "";

  return (
    <div className="rounded-sm border border-line bg-surface p-2">
      <div
        ref={box}
        tabIndex={0}
        role="img"
        aria-label={chartLabel(stats)}
        aria-describedby={hintId}
        onPointerDown={pick}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onKeyDown={onKeyDown}
        className="relative cursor-crosshair select-none"
        style={{ height: HEIGHT, touchAction: "pan-y", direction: "ltr" }}
      >
        {model ? (
          <svg
            width={width}
            height={HEIGHT}
            viewBox={`0 0 ${width} ${HEIGHT}`}
            aria-hidden="true"
            focusable="false"
            className="block overflow-visible"
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
            {point ? (
              <line x1={point.x} x2={point.x} y1={PAD.top} y2={HEIGHT - PAD.bottom} strokeWidth={1} className="stroke-stone" />
            ) : null}
            <polyline
              points={model.line}
              fill="none"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-ink"
            />
            <circle cx={model.last.x} cy={model.last.y} r={4} className="fill-clay" />
            {point ? <circle cx={point.x} cy={point.y} r={4.5} strokeWidth={2} className="fill-surface stroke-ink" /> : null}
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
        {point ? (
          <div
            ref={tipRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 whitespace-nowrap rounded-pill bg-ink px-2 py-0.5 text-caption text-surface"
            style={{ insetInlineStart: 0, transform: `translate(${tipX}px, ${tipY}px)` }}
          >
            <span dir="rtl">
              <span className="font-bold">
                ב־<bdi dir="ltr">{point.year}</bdi>:
              </span>{" "}
              {babies(point.value)}
            </span>
          </div>
        ) : null}
      </div>
      <p id={hintId} className="sr-only">
        החצים ימינה ושמאלה עוברים בין השנים
      </p>
      <p className="sr-only" aria-live="polite">
        {readout}
      </p>
      <table className="sr-only">
        <caption>מספר התינוקות בכל שנה</caption>
        <thead>
          <tr>
            <th scope="col">שנה</th>
            <th scope="col">תינוקות</th>
          </tr>
        </thead>
        <tbody>
          {stats.y.map((value, i) => (
            <tr key={i}>
              <th scope="row">{FIRST_TREND_YEAR + i}</th>
              <td>{value.toLocaleString("he-IL")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
