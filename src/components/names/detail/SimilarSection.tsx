import type { SimilarName } from "@/lib/names/detail";
import { Chip } from "@/components/names/ui";
import Section from "./Section";

/**
 * FR-D16 (board 15): "שמות קרובים", one chip per similar name with its sex tag in words. Hidden
 * when there are none (after hidden names are dropped) and while the details file isn't ready;
 * the story slot above already shows the loading and offline lines. The chip's name carries the
 * sex tag too, so the visible text stays inside it (WCAG 2.5.3).
 */
export default function SimilarSection({ similar, onOpen }: { similar: readonly SimilarName[]; onOpen?: (name: string) => void }) {
  if (similar.length === 0) return null;
  return (
    <Section label="שמות קרובים" seen="similar">
      <ul className="flex flex-wrap gap-2">
        {similar.map(({ name, sexTag }) => (
          <li key={name}>
            <Chip
              aria-label={`${name}, ${sexTag}, פרטי השם`}
              className="min-h-11 gap-1.5"
              onClick={onOpen ? () => onOpen(name) : undefined}
            >
              <span className="break-words">{name}</span>
              <span className="font-normal text-ink-soft">· {sexTag}</span>
            </Chip>
          </li>
        ))}
      </ul>
    </Section>
  );
}
