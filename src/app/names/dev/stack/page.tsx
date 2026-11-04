import { notFound } from "next/navigation";
import ScreenBackground from "@/components/names/ScreenBackground";
import { staticCards } from "@/lib/names/staticCards";
import type { Background } from "@/lib/names/prefs";
import DevStack from "./DevStack";

// Dev-only check page for the card stack (US-040); removed in US-047.
// /names/dev/stack?bg=none
export default async function DevStackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const q = await searchParams;
  return (
    <ScreenBackground background={(q.bg ?? "fabric") as Background}>
      <div className="flex flex-1 flex-col px-5 pt-16 pb-7">
        <DevStack cards={staticCards()} />
      </div>
    </ScreenBackground>
  );
}
