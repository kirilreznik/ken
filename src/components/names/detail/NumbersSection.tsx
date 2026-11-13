import { LAST_YEAR } from "@/lib/names/data";
import { babies, rankText } from "@/lib/names/detail";
import type { NameStats } from "@/lib/names/types";
import Section from "./Section";
import YearChart from "./YearChart";

/**
 * FR-D13 (board 14): the year chart, then "ב־2024: {n} תינוקות" with ", מקום {rank} בדירוג" when
 * the name is ranked. Numbers sit in LTR runs like the card. A name with no 2000–2024 years
 * shows only the chart's no-data line.
 */
export default function NumbersSection({ stats, rank }: { stats: Pick<NameStats, "name" | "y">; rank: number | null }) {
  const latest = stats.y?.[stats.y.length - 1];
  return (
    <Section label="כמה תינוקות קיבלו את השם בכל שנה" seen="numbers">
      {/* A new name starts with no year picked (the sheet stays mounted across similar names). */}
      <YearChart key={stats.name} stats={stats} />
      {latest !== undefined ? (
        <p data-numbers-line className="m-0 text-caption text-stone">
          ב־<bdi dir="ltr">{LAST_YEAR}</bdi>: <Numbers text={babies(latest)} />
          {rank !== null ? (
            <>
              , <Numbers text={rankText(rank)} /> בדירוג
            </>
          ) : null}
        </p>
      ) : null}
    </Section>
  );
}

/** Wraps each run of digits (with its separators and "%") in an LTR bdi. */
export function Numbers({ text }: { text: string }) {
  return text.split(/(\d[\d,.]*%?)/u).map((part, i) => (i % 2 ? <bdi key={i} dir="ltr">{part}</bdi> : part));
}
