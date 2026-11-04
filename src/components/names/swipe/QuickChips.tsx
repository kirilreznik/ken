"use client";

import { Chip } from "@/components/names/ui";
import { QUICK_CHIPS } from "@/lib/names/filters";
import type { SexTag } from "@/lib/names/types";

// PRD 3.2.14: the demo's four sex chips under the header; the other groups live in the filters sheet.
export default function QuickChips({ sex, onChange }: { sex: SexTag | null; onChange: (sex: SexTag | null) => void }) {
  return (
    <div role="group" aria-label="סינון לפי מין" className="flex flex-wrap gap-2 px-5 pt-1 pb-3">
      {QUICK_CHIPS.map((chip) => (
        <Chip key={chip.label} selected={sex === chip.sex} onClick={() => onChange(chip.sex)}>
          {chip.label}
        </Chip>
      ))}
    </div>
  );
}
