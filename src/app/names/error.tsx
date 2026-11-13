"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/names/ui";
import { reportClientLog } from "@/lib/names/clientLog";
import { ERROR_LEAD, ERROR_RETRY, ERROR_TITLE, renderErrorReport } from "@/lib/names/errorReport";

/** FR-W33: a render error under /names. Reports to client-log once per error; "ניסיון חוזר" re-renders the segment. */
export default function NamesError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    void reportClientLog(renderErrorReport(error));
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      {/* Error boundaries are client components, so no metadata export (Next 16 docs). */}
      <title>{`${ERROR_TITLE} · בחירת שם`}</title>
      <h1 className="text-title" role="alert">
        {ERROR_TITLE}
      </h1>
      <p className="text-body text-ink-soft">{ERROR_LEAD}</p>
      <Button variant="primary" size="lg" onClick={() => retry()}>
        {ERROR_RETRY}
      </Button>
      <Link href="/names" data-control className="inline-flex min-h-11 items-center px-4 text-card-title underline underline-offset-4">
        לבחירת שמות
      </Link>
    </main>
  );
}
