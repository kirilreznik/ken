import type { Metadata, Viewport } from "next";
import AuthProvider from "@/components/names/AuthProvider";
import Unconfigured from "@/components/names/Unconfigured";
import { InstallWatcher } from "@/components/names/pwa/Install";
import RegisterWorker from "@/components/names/pwa/RegisterWorker";
import { ToastRegion } from "@/components/names/ui";
import { canvasColor } from "@/lib/names/brand";
import { APPLE_TOUCH_ICON, MANIFEST_PATH } from "@/lib/names/manifest";
import { isConfigured } from "@/lib/names/supabase";
import "@/styles/nest-tokens.css";
import "./names.css";

export const metadata: Metadata = {
  title: { template: "%s · בחירת שם", default: "בחירת שם" },
  description: "בוחרים שם לתינוק או לתינוקת, לבד או ביחד: שמירה, דילוג והתאמות.",
  robots: { index: false, follow: false },
  manifest: MANIFEST_PATH,
  icons: { apple: [{ url: APPLE_TOUCH_ICON, sizes: "180x180", type: "image/png" }] },
  appleWebApp: { capable: true, title: "בחירת שם", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: canvasColor,
};

export default function NamesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="nest-names min-h-dvh">
      {isConfigured() ? (
        <>
          <AuthProvider>{children}</AuthProvider>
          <ToastRegion />
          <RegisterWorker />
          <InstallWatcher />
        </>
      ) : (
        <Unconfigured />
      )}
    </div>
  );
}
