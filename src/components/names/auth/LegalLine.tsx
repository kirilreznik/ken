import Link from "next/link";
import { linkClass } from "../ui/classes";

const LINK = linkClass("inline");

/**
 * The line under the welcome and join panels that points to the terms and privacy before
 * sign-in: ink text on a strong glass pill (≥ 4.5:1 over the photo's darkest fold), and
 * links whose tap area is 44 px tall without growing the pill.
 */
export default function LegalLine() {
  return (
    <p className="names-glass mx-auto w-fit rounded-lg px-4 py-1 text-center text-caption text-ink">
      בהמשך מאשרים את{" "}
      <Link href="/names/terms" className={LINK}>
        תנאי השימוש
      </Link>{" "}
      {/* The "ו" stays with its link when the line wraps (320 px). */}
      <span className="whitespace-nowrap">
        ו
        <Link href="/names/privacy" className={LINK}>
          מדיניות הפרטיות
        </Link>
      </span>
    </p>
  );
}
