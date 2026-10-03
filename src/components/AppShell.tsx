"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "./Icon";
import { KanMark } from "./KanMark";
import { Avatar } from "./ui";
import { useSession } from "@/lib/session";
import { usePendingSync, usePregnancy, useQuestions, useTasks } from "@/lib/data";
import { useOnline } from "@/lib/online";
import { useServiceWorker } from "@/lib/sw";
import { useUploads } from "@/lib/uploads";
import { useQuick } from "./QuickActions";
import { fmtNum } from "@/lib/format";

const BARE = ["/login", "/onboarding", "/welcome", "/visit", "/offline", "/birth/print", "/journal/book"];

const PRIMARY: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/", label: "בית", icon: "home" },
  { href: "/timeline", label: "ציר הזמן", icon: "timeline" },
  { href: "/tests", label: "בדיקות", icon: "test" },
  { href: "/documents", label: "מסמכים", icon: "doc" },
  { href: "/tasks", label: "משימות", icon: "task" },
  { href: "/prep", label: "הכנות לתינוק", icon: "baby" },
];
const SECONDARY: Array<{ href: string; label: string; icon: IconName; soon?: boolean }> = [
  { href: "/calendar", label: "יומן", icon: "cal" },
  { href: "/questions", label: "שאלות לרופא", icon: "ask" },
  { href: "/birth", label: "הכנה ללידה", icon: "bag" },
  { href: "/journal", label: "יומן הריון אישי", icon: "book" },
  { href: "/settings", label: "הגדרות", icon: "set" },
];
const TABS: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/", label: "בית", icon: "home" },
  { href: "/timeline", label: "ציר הזמן", icon: "timeline" },
  { href: "/tests", label: "בדיקות", icon: "test" },
  { href: "/tasks", label: "משימות", icon: "task" },
  { href: "/more", label: "עוד", icon: "grid" },
];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

function Guard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (status === "signedOut" && path !== "/login") router.replace("/login");
    else if (status === "noSpace" && path !== "/onboarding") router.replace("/onboarding");
    else if (status === "ready" && (path === "/login" || path === "/onboarding")) {
      let welcome = false;
      try { welcome = sessionStorage.getItem("ken-welcome") === "1"; sessionStorage.removeItem("ken-welcome"); } catch {}
      router.replace(welcome && path === "/onboarding" ? "/welcome" : "/");
    }
  }, [status, path, router]);

  if (status === "unconfigured") {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <div className="card p-8 max-w-md text-center flex flex-col gap-3">
          <h1 className="text-xl font-extrabold">חסרים פרטי חיבור ל־Supabase</h1>
          <p className="text-ink-3 leading-relaxed">הוסיפו לקובץ <code dir="ltr">.env.local</code> את <code dir="ltr">NEXT_PUBLIC_SUPABASE_URL</code> ואת <code dir="ltr">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, ואז הפעילו מחדש את השרת.</p>
        </div>
      </div>
    );
  }
  if (status === "loading" && !BARE.includes(path)) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
        <div className="w-24 h-24 rounded-[26%] bg-primary flex items-center justify-center"><KanMark size={64} /></div>
        <div className="font-serif text-3xl font-bold">קן</div>
      </div>
    );
  }
  return <>{children}</>;
}

function SyncStatus() {
  const online = useOnline();
  const pending = usePendingSync();
  const uploads = useUploads().length;
  const n = pending + uploads;
  if (!online) return <span className="flex items-center gap-2"><Icon name="cloudOff" size={16} />אופליין{n ? ` · ${n} ממתינים` : ""}</span>;
  if (n) return <span className="flex items-center gap-2" style={{ color: "var(--st-sched)" }}><Icon name="sync" size={16} className="spin" />מסנכרן {n}…</span>;
  return <span className="flex items-center gap-2"><Icon name="cloudCheck" size={16} style={{ color: "var(--primary)" }} />מסונכרן</span>;
}

function Sidebar() {
  const path = usePathname();
  const { space, members } = useSession();
  const wk = usePregnancy();
  const { data: tasks } = useTasks();
  const { data: qs } = useQuestions();
  const openTasks = (tasks ?? []).filter((t) => !t.done).length;
  const openQs = (qs ?? []).filter((q) => !q.resolved).length;
  const count: Record<string, number> = { "/tasks": openTasks, "/questions": openQs };
  const item = (n: { href: string; label: string; icon: IconName; soon?: boolean }) => (
    <Link key={n.href} href={n.href} aria-current={isActive(path, n.href) ? "page" : undefined}
      className={`flex items-center gap-3 h-11 px-3 rounded-xl text-[15px] font-semibold transition-colors ${isActive(path, n.href) ? "bg-white text-ink font-extrabold shadow-[0_1px_2px_rgba(0,0,0,.05),0_0_0_1px_#e6ded2]" : "text-[#4a443d] hover:bg-[#e9e2d7]"}`}>
      <Icon name={n.icon} style={isActive(path, n.href) ? { color: "var(--primary)" } : undefined} />
      {n.label}
      {count[n.href] ? <span className="ms-auto text-[13px] font-bold text-ink-3">{count[n.href]}</span> : n.soon ? <span className="ms-auto text-[11px] font-bold text-ink-3">בקרוב</span> : null}
    </Link>
  );
  return (
    <aside className="hidden md:flex flex-col gap-5 w-[264px] flex-none bg-bg-2 border-e border-[#e4dcd0] px-4 py-6 sticky top-0 h-dvh overflow-y-auto">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"><KanMark size={26} /></div>
        <div><div className="font-serif text-2xl font-bold leading-none">קן</div><div className="text-[13px] text-ink-3 mt-1">{members.map((m) => m.display_name).join(" ו")}</div></div>
      </div>
      {wk && space && (
        <Link href="/" className="block bg-white rounded-2xl p-3.5 shadow-[0_0_0_1px_#e6ded2]">
          <div className="flex justify-between items-baseline"><span className="font-extrabold text-[15px]">שבוע <span dir="ltr">{wk.label}</span></span><span className="text-[13px] text-ink-3">שליש {["ראשון", "שני", "שלישי"][wk.trimester - 1]}</span></div>
          <div className="h-1.5 rounded-full bg-line mt-2.5 flex"><div className="rounded-full bg-primary" style={{ width: `${wk.percent}%` }} /></div>
          <div className="text-[13px] text-ink-3 mt-2">עוד {wk.daysLeft} ימים · {fmtNum(space.due_date)}</div>
        </Link>
      )}
      <nav aria-label="ניווט ראשי" className="flex flex-col gap-0.5">{PRIMARY.map(item)}</nav>
      <nav aria-label="עוד" className="flex flex-col gap-0.5"><div className="lbl px-3 pb-1.5">עוד</div>{SECONDARY.map(item)}</nav>
      <div className="mt-auto flex items-center gap-2 px-3 text-[13px] font-semibold text-ink-3">
        <SyncStatus />
        <span className="ms-auto flex">{members.map((m, i) => <span key={m.user_id} className={i ? "-ms-2" : ""}><Avatar name={m.display_name} tone={i} /></span>)}</span>
      </div>
    </aside>
  );
}

function BottomNav() {
  const path = usePathname();
  const tabActive = (href: string) => href === "/more" ? !TABS.some((t) => t.href !== "/more" && isActive(path, t.href)) : isActive(path, href);
  return (
    <nav aria-label="ניווט ראשי" className="md:hidden fixed bottom-0 inset-x-0 z-30 flex px-2 pt-1.5 pb-safe border-t border-[#e6ded2]"
      style={{ background: "rgba(251,248,244,.94)", backdropFilter: "blur(16px)", paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}>
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} aria-current={tabActive(t.href) ? "page" : undefined}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-[58px] text-xs font-bold"
          style={{ color: tabActive(t.href) ? "var(--primary)" : "var(--ink-3)" }}>
          <Icon name={t.icon} size={24} />{t.label}
        </Link>
      ))}
    </nav>
  );
}

function QuickFab() {
  const [open, setOpen] = useState(false);
  const quick = useQuick();
  const items: Array<[IconName, string, () => void, string, string]> = [
    ["cal", "הוספת תור", () => quick({ kind: "appointment" }), "var(--st-sched-bg)", "var(--st-sched)"],
    ["up", "העלאת מסמך", () => quick({ kind: "upload" }), "var(--primary-100)", "var(--primary)"],
    ["task", "משימה חדשה", () => quick({ kind: "task" }), "var(--chip)", "var(--ink-2)"],
    ["ask", "שאלה לרופא", () => quick({ kind: "question" }), "var(--second-100)", "var(--second)"],
  ];
  return (
    <div className="md:hidden fixed z-30 start-auto end-4" style={{ bottom: "calc(84px + env(safe-area-inset-bottom))" }}>
      {open && <button aria-label="סגירה" className="fixed inset-0 bg-[rgba(35,32,28,.2)]" onClick={() => setOpen(false)} />}
      {open && (
        <div className="absolute bottom-[72px] end-0 w-64 card p-2 flex flex-col">
          {items.map(([icon, label, fn, bg, fg]) => (
            <button key={label} className="flex items-center gap-3 p-3 rounded-2xl text-[15px] font-bold hover:bg-bg text-start"
              onClick={() => { setOpen(false); fn(); }}>
              <span className="w-9 h-9 rounded-[11px] flex items-center justify-center" style={{ background: bg, color: fg }}><Icon name={icon} /></span>{label}
            </button>
          ))}
        </div>
      )}
      <button aria-label={open ? "סגירת תפריט" : "פעולה מהירה"} aria-expanded={open} onClick={() => setOpen(!open)}
        className="relative w-[60px] h-[60px] rounded-[22px] bg-ink text-white flex items-center justify-center shadow-[0_14px_28px_-10px_rgba(35,32,28,.6)]">
        <Icon name={open ? "close" : "plus"} size={26} />
      </button>
    </div>
  );
}

function Banners() {
  const online = useOnline();
  const { updateReady, applyUpdate, dismiss } = useServiceWorker();
  const pending = usePendingSync() + useUploads().length;
  const [backOnline, setBackOnline] = useState(false);
  const was = useRef(online);
  useEffect(() => {
    if (online && !was.current) { setBackOnline(true); const t = setTimeout(() => setBackOnline(false), 4000); was.current = online; return () => clearTimeout(t); }
    was.current = online;
  }, [online]);

  return (
    <>
      {!online && (
        <div role="status" className="sticky top-0 z-40 flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-[#f5efe6] pt-safe md:pt-3" style={{ background: "#3a3631" }}>
          <Icon name="cloudOff" />אין חיבור · מוצג המידע השמור במכשיר
          {pending > 0 && <span className="ms-auto font-medium text-[#cfc6ba]">{pending} שינויים ממתינים</span>}
        </div>
      )}
      {backOnline && (
        <div role="status" className="fixed top-3 inset-x-3 md:inset-x-auto md:end-6 md:w-96 z-50 card p-3.5 flex items-center gap-3" style={{ top: "max(12px, env(safe-area-inset-top))" }}>
          <span className="w-10 h-10 rounded-[13px] flex items-center justify-center" style={{ background: "var(--st-done-bg)", color: "var(--st-done)" }}><Icon name="wifi" /></span>
          <span><b className="block">החיבור חזר</b><span className="text-sm text-ink-3">{pending ? `מסנכרנים ${pending} שינויים` : "הכל מעודכן"}</span></span>
        </div>
      )}
      {updateReady && (
        <div role="status" className="fixed z-50 inset-x-3 md:inset-x-auto md:end-6 md:w-[420px] rounded-[22px] bg-ink text-[#f5efe6] p-4 flex flex-col gap-3 shadow-2xl"
          style={{ bottom: "calc(96px + env(safe-area-inset-bottom))" }}>
          <div className="flex gap-3"><Icon name="refresh" /><span><b className="block">גרסה חדשה של קן מוכנה</b><span className="text-sm text-[#cfc6ba]">שום דבר לא יימחק.</span></span></div>
          <div className="flex gap-2"><button className="btn flex-1 bg-[#f5efe6] text-ink" onClick={applyUpdate}>עדכון עכשיו</button><button className="btn text-[#f5efe6]" onClick={dismiss}>בפעם הבאה</button></div>
        </div>
      )}
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const bare = BARE.includes(path);
  return (
    <Guard>
      {bare ? children : (
        <div className="flex min-h-dvh">
          <Sidebar />
          <div className="flex-1 min-w-0 flex flex-col">
            <Banners />
            <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 md:px-10 pt-safe md:pt-8 pb-[140px] md:pb-14">{children}</main>
          </div>
          <BottomNav />
          <QuickFab />
        </div>
      )}
    </Guard>
  );
}
