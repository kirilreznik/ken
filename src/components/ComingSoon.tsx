import Link from "next/link";
import { EmptyState } from "./ui";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-[34px] md:text-[40px]">{title}</h1>
      <EmptyState title="בקרוב בקן" text="המסך הזה מתוכנן לשלב הבא. בינתיים כל השאר כבר עובד." action={<Link href="/" className="btn btn-primary mt-2">למסך הבית</Link>} />
    </div>
  );
}
