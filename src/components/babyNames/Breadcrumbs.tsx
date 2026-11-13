import Link from "next/link";

/** "Nest › שמות לתינוקות › נועה": the last item is the current page and isn't a link. */
export default function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  return (
    <nav aria-label="מיקום באתר" className="pt-3">
      <ol className="m-0 flex flex-wrap items-center gap-1 p-0 text-caption text-stone" style={{ listStyle: "none" }}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="font-bold text-ink-soft">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.href} className="inline-flex min-h-11 items-center underline-offset-2 hover:underline">
                    {item.name}
                  </Link>
                  {/* Points toward the next level, so it mirrors with the reading direction. */}
                  <span aria-hidden="true">‹</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
