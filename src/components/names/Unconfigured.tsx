import Wordmark from "@/components/names/auth/Wordmark";
import { Button } from "@/components/names/ui";

/**
 * Shown by the /names layout when the deploy lacks its Supabase config. Same canvas column as the
 * offline page (wordmark, title, a line, one ink button), with a way out to the home page (NP-041).
 */
export default function Unconfigured() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-content flex-col justify-center gap-6 px-5 pt-[max(56px,env(safe-area-inset-top))] pb-[max(32px,env(safe-area-inset-bottom))] text-center">
      <Wordmark />
      <div className="flex flex-col gap-2">
        <h1 className="text-display text-balance">השירות לא זמין כרגע</h1>
        <p className="text-card-title font-medium text-pretty text-ink-soft">
          בחירת שם לא זמינה כרגע. אפשר לנסות שוב מאוחר יותר.
        </p>
      </div>
      <Button href="/">לעמוד הבית</Button>
    </main>
  );
}
