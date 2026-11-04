/**
 * The welcome screen's static זיו card (PRD 3.2.1), shaped like the landing demo's launch
 * card: glass on the photo, tilted, with the sex tag, the name and its first line.
 * Decorative: the pitch above says what it is. Replaced by the real NameCard in US-039.
 */
export default function PreviewCard() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[280px] py-2">
      <div className="names-glass-soft absolute inset-x-6 inset-y-0 rotate-3 rounded-xl" />
      <div className="names-glass relative flex -rotate-2 flex-col items-center gap-1.5 rounded-xl px-5 pt-5 pb-6 text-center">
        <span className="self-start rounded-pill bg-peach-soft px-2.5 py-1.5 text-tag text-clay-deep">מתאים לכולם</span>
        <span className="text-name">זִיו</span>
        <span className="text-card-title font-medium text-ink-soft">זיו הוא אור, זוהר וברק.</span>
      </div>
    </div>
  );
}
