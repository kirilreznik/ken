import { bibleNote } from "@/lib/names/card";
import type { NameContent } from "@/lib/names/types";

/**
 * "מהתנ״ך" (E16 FR-5a): the verse or figure and its reference on a peach-pale well with a
 * book icon. Solid peach-pale on "ללא רקע" (Main.dc.html), 60% on the photos (GlassFabric.dc.html).
 * Renders nothing when the name has no Bible note.
 */
export default function CardBible({ bible }: { bible: NameContent["bible"] }) {
  const note = bibleNote(bible);
  if (!note) return null;
  return (
    <section
      className="flex items-start gap-2.5 rounded-md bg-(--nest-peach-pale-60) px-3 py-2.5 in-data-[names-bg=none]:bg-peach-pale"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="mt-0.5 flex-none text-clay-deep"
      >
        <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
        <path d="M4 19V5" />
      </svg>
      <div className="flex min-w-0 flex-col gap-0.5">
        <h3 className="text-tag text-clay-deep">מהתנ״ך</h3>
        <p className="text-quote break-words text-ink">{note.text}</p>
        {note.ref && <p className="text-ref text-ink-soft">{note.ref}</p>}
      </div>
    </section>
  );
}
