import type { Together } from "@/lib/names/detail";
import Section from "./Section";

/**
 * FR-D12 (board 15, PRD 3.1.5 / 3.2.13): "ביחד" with the match badge, ink on `sand` with a small
 * heart; never green. Hidden unless the name is a match of a shared space.
 */
export default function TogetherSection({ together }: { together: Together | null }) {
  if (!together) return null;
  const [head, ...rest] = together.text.split(" · ");
  return (
    <Section label="ביחד">
      <p className="m-0 flex items-center gap-2 rounded-md bg-sand px-3.5 py-2.5 text-body text-ink">
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="flex-none fill-clay stroke-clay"
        >
          <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
        </svg>
        <span className="min-w-0 break-words">
          <b className="font-bold">{head}</b>
          {rest.length ? ` · ${rest.join(" · ")}` : null}
        </span>
      </p>
    </Section>
  );
}
