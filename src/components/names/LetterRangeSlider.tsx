"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { RANGE_MAX, RANGE_MIN, clampRange, rangeValue, type LetterRange } from "@/lib/names/filters";

// Half the thumb's 44 px hit box: the track is inset by this much so the thumbs' centres
// reach its ends.
const INSET = 22;
const STEPS = RANGE_MAX - RANGE_MIN;
const TICKS = Array.from({ length: STEPS + 1 }, (_, i) => RANGE_MIN + i);

type Thumb = "min" | "max";

const pos = (n: number) => `calc(${INSET}px + (100% - ${INSET * 2}px) * ${(n - RANGE_MIN) / STEPS})`;
const tickLabel = (n: number) => (n === RANGE_MAX ? `${n}+` : String(n));

/**
 * The "מספר אותיות מותאם אישית" range: two thumbs on one track, min at the inline start (the
 * right in Hebrew). Drag anywhere on the track to move the nearer thumb; horizontal drags
 * don't scroll the sheet (touch-action: pan-y). Each thumb is a slider for keyboards and
 * screen readers.
 */
export default function LetterRangeSlider({
  value,
  onChange,
}: {
  value: LetterRange;
  onChange: (value: LetterRange) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const active = useRef<Thumb | null>(null);

  function valueAt(clientX: number): number {
    const el = trackRef.current;
    if (!el) return RANGE_MIN;
    const rect = el.getBoundingClientRect();
    const rtl = getComputedStyle(el).direction === "rtl";
    const width = rect.width - INSET * 2;
    const fromStart = rtl ? rect.right - INSET - clientX : clientX - rect.left - INSET;
    const frac = width > 0 ? Math.min(1, Math.max(0, fromStart / width)) : 0;
    return Math.round(RANGE_MIN + frac * STEPS);
  }

  function move(thumb: Thumb, n: number) {
    const next = thumb === "min" ? { min: Math.min(n, value.max), max: value.max } : { min: value.min, max: Math.max(n, value.min) };
    if (next.min !== value.min || next.max !== value.max) onChange(clampRange(next.min, next.max));
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const n = valueAt(event.clientX);
    const thumb: Thumb =
      n < value.min ? "min" : n > value.max ? "max" : n - value.min <= value.max - n ? "min" : "max";
    active.current = thumb;
    event.currentTarget.setPointerCapture(event.pointerId);
    (event.currentTarget.querySelector(`[data-thumb="${thumb}"]`) as HTMLElement | null)?.focus({ preventScroll: true });
    move(thumb, n);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (active.current) move(active.current, valueAt(event.clientX));
  }

  function end() {
    active.current = null;
  }

  function onKeyDown(thumb: Thumb, event: KeyboardEvent<HTMLDivElement>) {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const current = value[thumb];
    const step: Record<string, number> = {
      ArrowUp: 1,
      ArrowDown: -1,
      ArrowRight: rtl ? -1 : 1,
      ArrowLeft: rtl ? 1 : -1,
      PageUp: 2,
      PageDown: -2,
    };
    let n: number | null = null;
    if (event.key in step) n = current + step[event.key];
    else if (event.key === "Home") n = RANGE_MIN;
    else if (event.key === "End") n = RANGE_MAX;
    if (n === null) return;
    event.preventDefault();
    move(thumb, Math.min(RANGE_MAX, Math.max(RANGE_MIN, n)));
  }

  const thumb = (which: Thumb, label: string) => {
    const n = value[which];
    return (
      <div
        data-thumb={which}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={RANGE_MIN}
        aria-valuemax={RANGE_MAX}
        aria-valuenow={n}
        aria-valuetext={n === RANGE_MAX ? `${n} אותיות ומעלה` : `${n} אותיות`}
        onKeyDown={(e) => onKeyDown(which, e)}
        className="names-range-thumb absolute top-0 flex size-11 items-center justify-center rounded-pill"
        style={{ insetInlineStart: pos(n), marginInlineStart: -INSET, zIndex: which === "min" && n === RANGE_MAX ? 2 : 1 }}
      >
        <span className="size-6.5 rounded-pill border-2 border-ink bg-surface shadow-button" />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <p className="text-card-title text-ink" aria-hidden="true">
        {rangeValue(value)}
      </p>
      <div
        ref={trackRef}
        className="relative h-11 touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
        onLostPointerCapture={end}
      >
        <div className="absolute inset-x-5.5 top-1/2 -mt-0.5 h-1 rounded-pill bg-line" />
        <div
          className="absolute top-1/2 -mt-0.5 h-1 rounded-pill bg-ink"
          style={{ insetInlineStart: pos(value.min), insetInlineEnd: `calc(100% - ${pos(value.max)})` }}
        />
        {thumb("min", "מספר אותיות, לפחות")}
        {thumb("max", "מספר אותיות, לכל היותר")}
      </div>
      <div className="relative h-4" aria-hidden="true">
        {TICKS.map((n) => (
          <span
            key={n}
            className="absolute top-0 w-8 text-center text-caption text-stone"
            style={{ insetInlineStart: pos(n), marginInlineStart: -16 }}
          >
            <bdi dir="ltr">{tickLabel(n)}</bdi>
          </span>
        ))}
      </div>
    </div>
  );
}
