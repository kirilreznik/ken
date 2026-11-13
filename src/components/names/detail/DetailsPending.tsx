import { OfflineMark } from "@/components/names/auth/PanelNote";
import { skeletonClass } from "@/components/names/ui";
import type { DetailsState } from "@/components/names/useNameDetails";

/** PRD 3.2.7: shown in place of the story and similar names when the details can't load. */
export const DETAILS_OFFLINE = "אין חיבור לאינטרנט. הפרטים יופיעו כשהחיבור יחזור.";

/**
 * What the story and similar-name slots show while the details file isn't ready: a quiet sand
 * line while it loads, the offline line when it failed. Nothing once it is ready.
 */
export default function DetailsPending({ state }: { state: DetailsState }) {
  if (state === "ready") return null;
  if (state === "error")
    return (
      <p className="text-caption text-ink-soft">
        <OfflineMark />
        {DETAILS_OFFLINE}
      </p>
    );
  return (
    <div data-details-loading aria-hidden="true" className="flex flex-col gap-2 py-1">
      <div className={`h-3 w-full rounded-pill ${skeletonClass()}`} />
      <div className={`h-3 w-3/5 rounded-pill ${skeletonClass()}`} />
    </div>
  );
}
