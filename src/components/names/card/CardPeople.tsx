import Section from "@/components/names/detail/Section";
import { knownPeople } from "@/lib/names/card";
import type { NamePerson } from "@/lib/names/types";

/**
 * "אנשים מוכרים בשם הזה" (E16 FR-5a, FR-D11): a name sheet section with up to 2 rows, an initial
 * avatar, the name in bold and one line on who they are. Avatar sand on "ללא רקע" (Main.dc.html),
 * white 55% on the photos (GlassFabric.dc.html). Renders nothing when the name has no known people.
 */
export default function CardPeople({ people }: { people: readonly NamePerson[] }) {
  const rows = knownPeople(people);
  if (rows.length === 0) return null;
  return (
    <Section label="אנשים מוכרים בשם הזה">
      <ul className="flex flex-col gap-1.5">
        {rows.map((p) => (
          <li key={p.name} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex size-6.5 flex-none items-center justify-center rounded-pill bg-white-55 text-tag font-extrabold text-ink in-data-[names-bg=none]:bg-sand"
            >
              {p.initial}
            </span>
            <span className="text-person min-w-0 break-words text-ink-soft">
              <b className="font-bold text-ink">{p.name}</b> · {p.what}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
