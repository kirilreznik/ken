import Link from "next/link";

export default function Offline() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6 text-center">
      <div className="flex flex-col gap-3 items-center">
        <h1 className="font-serif text-3xl">אין חיבור כרגע</h1>
        <p className="text-ink-3 max-w-xs">המסך הזה עוד לא נשמר במכשיר. חזרו למסך הבית — המידע השמור שלכם זמין שם.</p>
        <Link href="/" className="btn btn-primary">למסך הבית</Link>
      </div>
    </div>
  );
}
