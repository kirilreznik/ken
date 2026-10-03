"use client";

import { useEffect } from "react";
import { report } from "@/lib/report";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { report(error, "render", { digest: error.digest, global: true }); }, [error]);
  return (
    <html lang="he" dir="rtl">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f5f1eb", color: "#23201c", display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center", margin: 0 }}>
        <div style={{ background: "#fff", borderRadius: 22, padding: 32, maxWidth: 380, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, margin: "0 0 8px" }}>משהו השתבש</h1>
          <p style={{ color: "#6b645b", lineHeight: 1.6, margin: "0 0 16px" }}>המידע שלכם שמור במכשיר. נסו לטעון מחדש.</p>
          <button onClick={reset} style={{ background: "#2f5d4f", color: "#fff", border: 0, borderRadius: 14, padding: "12px 20px", fontSize: 15, fontWeight: 700 }}>טעינה מחדש</button>
        </div>
      </body>
    </html>
  );
}
