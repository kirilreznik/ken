import { skeletonClass } from "@/components/names/ui";

const bar = `rounded-pill ${skeletonClass()}`;

/**
 * The list card while its rows load (saved, matches, hidden): three rows of a real row's height
 * and padding, each with a bar for the name and a shorter one for the meta line, so the card
 * reads as the list it turns into. Static, so nothing changes under reduced motion.
 */
export function ListSkeleton() {
  return (
    <div aria-busy="true" className="rounded-lg bg-surface shadow-card">
      <span className="sr-only">בטעינה</span>
      {[0, 1, 2].map((i) => (
        <div key={i} aria-hidden="true" className="flex items-center gap-3 border-b border-line py-3.5 ps-4 pe-2 last:border-b-0">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className={`h-5 w-1/3 ${bar}`} />
            <div className={`h-3 w-1/4 ${bar}`} />
          </div>
          <div className="size-11 flex-none" />
        </div>
      ))}
    </div>
  );
}

/** The duel while its list loads: the two name cards with the "או" disc between them. */
export function DuelSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-3">
      <span className="sr-only">בטעינה</span>
      <div aria-hidden="true" className="flex min-h-[180px] items-center justify-center rounded-xl bg-surface shadow-hero">
        <div className={`h-10 w-2/5 ${bar}`} />
      </div>
      <div aria-hidden="true" className="z-1 -my-8 flex size-11.5 items-center justify-center self-center rounded-pill border-3 border-canvas bg-ink text-caption font-extrabold text-surface">
        או
      </div>
      <div aria-hidden="true" className="flex min-h-[180px] items-center justify-center rounded-xl bg-surface shadow-hero">
        <div className={`h-10 w-2/5 ${bar}`} />
      </div>
    </div>
  );
}
