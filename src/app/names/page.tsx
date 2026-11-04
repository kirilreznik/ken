import { RequireAuth } from "@/components/names/AuthGuard";

export default function NamesPage() {
  return (
    <RequireAuth>
      <main className="flex min-h-dvh items-center justify-center p-6">
        <h1 className="text-title">בחירת שם</h1>
      </main>
    </RequireAuth>
  );
}
