"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { scrubAnalyticsEvent } from "@/lib/names/analytics";

/** Vercel Analytics + Speed Insights with private data stripped from /names URLs. */
export function SiteAnalytics() {
  return (
    <>
      <Analytics beforeSend={scrubAnalyticsEvent} />
      <SpeedInsights beforeSend={scrubAnalyticsEvent} />
    </>
  );
}
