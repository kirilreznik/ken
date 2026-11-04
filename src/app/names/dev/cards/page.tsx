import { notFound } from "next/navigation";
import NameCard from "@/components/names/card/NameCard";
import ScreenBackground from "@/components/names/ScreenBackground";
import { staticCards } from "@/lib/names/staticCards";
import type { Background } from "@/lib/names/prefs";

// Dev-only check page for the card (US-039); removed in US-047.
// /names/dev/cards?name=זיו&bg=none&surname=לוי&stamp=keep
export default async function DevCardsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const q = await searchParams;
  const cards = staticCards();
  const index = Math.max(0, cards.findIndex((c) => c.stats.name === q.name));
  const card = cards[index];
  const stamp = q.stamp ? ({ [`--${q.stamp}`]: 1 } as React.CSSProperties) : undefined;
  return (
    <ScreenBackground background={(q.bg ?? "fabric") as Background}>
      <div className="flex flex-1 flex-col px-5 pt-16 pb-7">
        <NameCard card={card} position={index + 1} total={cards.length} surname={q.surname} className="min-h-[520px]" style={stamp} />
      </div>
    </ScreenBackground>
  );
}
