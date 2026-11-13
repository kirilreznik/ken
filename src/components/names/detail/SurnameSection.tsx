import { Button } from "@/components/names/ui";
import { fullName } from "@/lib/names/card";
import { SURNAME_PATH } from "@/lib/names/routing";
import { track } from "@/lib/names/track";
import Section from "./Section";

/**
 * FR-D8 (board 15): "{name} {surname}" in large type on a peach-pale well, or a link to the
 * intro's surname field when none is saved. The surname is read from the device prefs and is
 * never sent anywhere (the event has no props).
 */
export default function SurnameSection({ name, surname }: { name: string; surname: string | null }) {
  const full = fullName(name, surname);
  if (!full) {
    return (
      <Button variant="link" size="md" href={SURNAME_PATH} onClick={() => track("detail_surname_add")} className="self-start">
        הוספת שם משפחה
      </Button>
    );
  }
  return (
    <Section label="עם שם המשפחה">
      <p className="rounded-md bg-peach-pale px-4 py-2.5 text-center text-title break-words text-ink">{full}</p>
      <p className="text-caption text-ink-soft">שם המשפחה נשמר רק במכשיר הזה.</p>
    </Section>
  );
}
