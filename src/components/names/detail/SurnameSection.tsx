import Link from "next/link";
import { FADE_PRESS } from "@/components/names/ui";
import { fullName } from "@/lib/names/card";
import { SURNAME_PATH } from "@/lib/names/routing";
import { track } from "@/lib/names/track";
import Section from "./Section";

/**
 * FR-D8 (board 15): "{name} {surname}" in large type on a peach-pale well, or a link to the
 * intro's surname field when none is saved (and "שינוי" to change a saved one; guests too). The surname is read from the device prefs and is
 * never sent anywhere (the event has no props).
 */
export default function SurnameSection({ name, surname }: { name: string; surname: string | null }) {
  const full = fullName(name, surname);
  if (!full) {
    return (
      // NP-118: a small secondary link (caption, medium, ink-soft); the padding keeps the tap area ≥ 44 px.
      <Link
        href={SURNAME_PATH}
        onClick={() => track("detail_surname_add")}
        className={`-mx-2 inline-flex min-h-11 min-w-11 items-center self-start rounded-pill px-2 text-caption font-medium text-ink-soft underline underline-offset-4 ${FADE_PRESS}`}
      >
        הוספת שם משפחה
      </Link>
    );
  }
  return (
    <Section label="עם שם המשפחה">
      <p className="rounded-md bg-peach-pale px-4 py-2.5 text-center text-title break-words text-ink">{full}</p>
      <p className="flex flex-wrap items-center gap-x-2 text-caption text-ink-soft">
        שם המשפחה נשמר רק במכשיר הזה.
        <Link
          href={SURNAME_PATH}
          onClick={() => track("detail_surname_add")}
          aria-label="שינוי שם המשפחה"
          className={`-mx-2 inline-flex min-h-11 min-w-11 items-center rounded-pill px-2 font-medium underline underline-offset-4 ${FADE_PRESS}`}
        >
          שינוי
        </Link>
      </p>
    </Section>
  );
}
