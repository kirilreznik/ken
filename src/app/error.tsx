"use client";

import { useEffect } from "react";
import Link from "next/link";
import { report } from "@/lib/report";

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { report(error, "render", { digest: error.digest }); }, [error]);
  return (
    <div className="card p-8 max-w-md mx-auto mt-10 flex flex-col gap-3 text-center">
      <h1 className="text-xl font-extrabold">משהו השתבש במסך הזה</h1>
      <p className="text-ink-3 leading-relaxed">שום דבר לא נמחק — המידע שלכם שמור. אפשר לנסות שוב או לחזור למסך הבית.</p>
      <div className="flex gap-2 justify-center mt-2">
        <button className="btn btn-primary" onClick={reset}>ניסיון חוזר</button>
        <Link href="/" className="btn btn-secondary">למסך הבית</Link>
      </div>
    </div>
  );
}
