import Link from "next/link";
import type { NamePage } from "@/lib/babyNames/data";
import { nameHref } from "@/lib/babyNames/slug";

/** Names as pill links, wrapping; used for similar names, the hub's letters and top names. */
export function NamePills({ pages }: { pages: NamePage[] }) {
  return (
    <ul className="m-0 flex flex-wrap gap-2 p-0" style={{ listStyle: "none" }}>
      {pages.map((p) => (
        <li key={p.name}>
          <Link
            href={nameHref(p.name)}
            className="inline-flex min-h-11 items-center rounded-pill border border-line bg-surface px-4 text-card-title text-ink hover:bg-peach-pale"
          >
            {p.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** A numbered list of names with their intro and one stat (the list pages). */
export function NameRows({ pages, stat }: { pages: NamePage[]; stat: (p: NamePage) => string }) {
  return (
    <ol className="m-0 flex flex-col gap-2 p-0" style={{ listStyle: "none" }}>
      {pages.map((p, i) => (
        <li key={p.name}>
          <Link
            href={nameHref(p.name)}
            className="flex items-start gap-3 rounded-md border border-line bg-surface p-4 hover:bg-peach-pale"
          >
            <span className="w-8 shrink-0 text-stat text-faint">
              <bdi dir="ltr">{i + 1}</bdi>
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-row-name text-ink">{p.name}</span>
                <span className="text-caption font-bold text-clay-deep">
                  <Digits text={stat(p)} />
                </span>
              </span>
              <span className="text-body text-ink-soft">{p.content.intro}</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** Wraps each run of digits (with separators, "+" and "%") in an LTR bdi, like the swiper. */
export function Digits({ text }: { text: string }) {
  return text.split(/([+#]?\d[\d,.]*%?)/u).map((part, i) => (i % 2 ? <bdi key={i} dir="ltr">{part}</bdi> : part));
}
