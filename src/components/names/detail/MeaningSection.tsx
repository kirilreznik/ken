import type { DetailsState } from "@/components/names/useNameDetails";
import DetailsPending from "./DetailsPending";
import Section from "./Section";

/**
 * FR-D9 (boards 13, 15): "מה השם אומר", the card's intro, then the story from the details file.
 * A name whose story is null (or has no entry) shows the intro alone, with no placeholder.
 */
export default function MeaningSection({ intro, story, state }: { intro: string; story: string | null; state: DetailsState }) {
  const text = intro.trim();
  const pending = state !== "ready";
  if (!text && !story && !pending) return null;
  return (
    <Section label="מה השם אומר">
      <div className="flex flex-col gap-2" aria-busy={state === "loading" || state === "idle" || undefined}>
        {text ? <p className="text-intro break-words text-ink">{text}</p> : null}
        {pending ? <DetailsPending state={state} /> : story ? <p className="text-body break-words text-ink">{story}</p> : null}
      </div>
    </Section>
  );
}
