"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { useQuestions } from "@/lib/data";

const TILES: Array<{ href: string; label: string; icon: IconName; color: string }> = [
  { href: "/documents", label: "מסמכים", icon: "doc", color: "var(--ink-2)" },
  { href: "/prep", label: "הכנות לתינוק", icon: "baby", color: "var(--second)" },
  { href: "/calendar", label: "יומן", icon: "cal", color: "var(--st-sched)" },
  { href: "/questions", label: "שאלות לרופא", icon: "ask", color: "var(--second)" },
  { href: "/birth", label: "הכנה ללידה", icon: "bag", color: "var(--primary)" },
  { href: "/journal", label: "יומן הריון", icon: "book", color: "var(--second)" },
];

export default function More() {
  const { data: qs } = useQuestions();
  const open = (qs ?? []).filter((q) => !q.resolved).length;
  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-serif text-[32px]">עוד</h1>
      <div className="grid grid-cols-3 gap-2.5">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href} className="relative h-[104px] rounded-[20px] bg-white border border-line p-3.5 flex flex-col justify-between font-extrabold text-[15px]">
            {t.href === "/questions" && open > 0 && <span className="absolute top-3 end-3 min-w-6 h-6 px-1.5 rounded-full text-xs flex items-center justify-center" style={{ background: "var(--second-100)", color: "var(--second)" }}>{open}</span>}
            <span className="w-[38px] h-[38px] rounded-xl bg-bg flex items-center justify-center" style={{ color: t.color }}><Icon name={t.icon} /></span>{t.label}
          </Link>
        ))}
      </div>
      <Link href="/settings" className="card flex items-center gap-3 p-4 font-bold"><Icon name="set" className="text-ink-3" /><span className="flex-1">הגדרות ושיתוף</span><Icon name="chevL" className="text-ink-3" /></Link>
    </div>
  );
}
