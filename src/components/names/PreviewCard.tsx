import NameCard from "@/components/names/card/NameCard";
import { staticCards } from "@/lib/names/staticCards";

/**
 * The welcome screen's static זיו card (PRD 3.2.1): the real NameCard on the photo, tilted,
 * with a soft card peeking behind it like the landing demo's launch card.
 * Decorative: the pitch above says what it is.
 */
export default function PreviewCard() {
  const card = staticCards().find((c) => c.stats.name === "זיו");
  if (!card) return null;
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[320px] py-2">
      <div className="names-glass-soft absolute inset-x-6 inset-y-0 rotate-3 rounded-xl" />
      <NameCard card={card} inert className="max-h-[300px] -rotate-2 overflow-hidden mask-b-from-60%" />
    </div>
  );
}
