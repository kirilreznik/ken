import NameCard from "@/components/names/card/NameCard";
import { staticCards } from "@/lib/names/staticCards";

/**
 * The welcome screen's static זיו card (PRD 3.2.1): the real NameCard on the photo, tilted,
 * with a soft card peeking behind it like the landing demo's launch card.
 * Decorative: the pitch above says what it is.
 * A direct child of AuthLayout's column, it only takes the height the panel leaves (up to
 * its full 300 px), so the sign-in buttons stay in the first screen on short phones; when
 * less than 8rem is left it hides (a size container, so it never pushes the panel down).
 */
export default function PreviewCard() {
  const card = staticCards().find((c) => c.stats.name === "זיו");
  if (!card) return null;
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto flex max-h-[316px] min-h-0 w-full max-w-[320px] flex-1 basis-0 flex-col py-2 @container-size"
    >
      <div className="names-glass-soft absolute inset-x-6 inset-y-0 rotate-3 rounded-xl [@container(max-height:8rem)]:hidden" />
      <NameCard
        card={card}
        inert
        className="max-h-[300px] min-h-0 -rotate-2 overflow-hidden mask-b-from-60% [&>*]:shrink-0 [@container(max-height:8rem)]:hidden"
      />
    </div>
  );
}
