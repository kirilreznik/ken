import Link from "next/link";
import type { ReactNode } from "react";
import { Button, linkClass } from "@/components/names/ui";
import { FEEDBACK_TEXT } from "@/lib/names/feedback";
import { CBS_ACCESSED, CBS_FILE, CBS_FILE_URL, CBS_LICENCE_URL, reportButtonLabel } from "@/lib/names/report";

// 32 px tall on the board; -my-1.5 keeps that spacing while the hit area is 44 px.
const sourceLink = `${linkClass("inline", "row")} text-person`;

function Part({ title, level, children }: { title: string; level: 2 | 3; children: ReactNode }) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <div className="flex flex-col gap-1.5">
      <Heading className="m-0 text-card-title text-balance">{title}</Heading>
      <p className="m-0 text-body text-pretty text-ink-soft">{children}</p>
    </div>
  );
}

function SourceLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={sourceLink}>
      {children}
      <span className="sr-only"> (נפתח בכרטיסייה חדשה)</span>
    </a>
  );
}

/**
 * The body of "על הנתונים" (board 7, FR-W30, E16 FR-14), shared by the sheet and /names/about:
 * what the numbers count and the 5-births threshold, the CBS attribution the licence asks for
 * (release, file, access date, links, no endorsement), the AI-written texts and Wikidata, and
 * the report button. `level`: the part headings' level (2 on the page under its h1, 3 in the sheet).
 */
export default function AboutContent({ hasName, onReport, level = 3 }: { hasName: boolean; onReport: () => void; level?: 2 | 3 }) {
  return (
    <div className="flex flex-col gap-4">
      <Part level={level} title="מספרי הלידות">
        המספרים הם תינוקות שנולדו בישראל וקיבלו את השם, לא אנשים שחיים היום. שמות שניתנו לפחות מ־5 תינוקות בשנה לא
        מתפרסמים באותה שנה.
      </Part>

      <div className="flex flex-col gap-1.5 rounded-md bg-canvas p-4">
        <span className="text-caption font-bold text-stone">מקור</span>
        <p className="m-0 text-person leading-5 text-ink">
          הלשכה המרכזית לסטטיסטיקה, הודעה לתקשורת 391/2025, שמות שניתנו ליילודים 1949–2024 (<bdi dir="ltr">{CBS_FILE}</bdi>).
          נשלף ב־{CBS_ACCESSED}.
        </p>
        <div className="flex flex-wrap gap-x-4">
          <SourceLink href={CBS_FILE_URL}>לקובץ הנתונים</SourceLink>
          <SourceLink href={CBS_LICENCE_URL}>לתנאי הרישיון</SourceLink>
        </div>
        <p className="m-0 text-caption text-stone">השימוש בנתונים לא מעיד על תמיכה של הלמ&quot;ס ב־Nest.</p>
      </div>

      <Part level={level} title="הפירושים">
        פירוש קצר, מידע כללי על מקור השם ומשמעותו, וההערה מהתנ״ך. ההסברים נכתבו בעזרת בינה מלאכותית ועשויים להכיל
        טעויות. האנשים המוכרים נבדקו מול <bdi dir="ltr">Wikidata</bdi>.
      </Part>

      {/* About sits on "ללא רקע" (page and sheet), where the secondary pill is white with a line edge. */}
      <Button variant="secondary" onClick={onReport}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="flex-none"
        >
          <path d="M5 21V4h11l-1.5 4L16 12H5" />
        </svg>
        {reportButtonLabel(hasName)}
      </Button>
      <Link href="/names/feedback?from=/names/about" className={`${linkClass("inline", "row")} self-center text-person`}>
        {FEEDBACK_TEXT.aboutLink}
      </Link>
    </div>
  );
}
