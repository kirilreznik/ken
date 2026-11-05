"use client";

import BackButton from "@/components/names/BackButton";
import { openSheet } from "@/components/names/ui";
import AboutContent from "./AboutContent";
import ReportSheet from "./ReportSheet";

/**
 * /names/about (FR-W30): board 7's content as a page in board 5's list look, for direct links
 * and settings. Open to everyone (it's indexable); the report asks which name it's about.
 */
export default function AboutScreen() {
  return (
    <div data-names-bg="none" className="min-h-dvh bg-canvas">
      <main className="mx-auto flex w-full max-w-[480px] flex-col gap-4 px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <header className="flex items-center gap-2">
          <BackButton />
          <h1 className="m-0 min-w-0 flex-1 text-title">על הנתונים</h1>
        </header>
        <section className="rounded-lg bg-surface p-5 shadow-card">
          <AboutContent hasName={false} onReport={() => openSheet("report")} />
        </section>
      </main>
      <ReportSheet name={null} />
    </div>
  );
}
