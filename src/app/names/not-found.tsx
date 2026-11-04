import Link from "next/link";

export default function NamesNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-title">העמוד לא נמצא</h1>
      <Link href="/names" className="inline-flex min-h-11 items-center px-4 text-card-title underline underline-offset-4">
        לבחירת שם
      </Link>
    </main>
  );
}
