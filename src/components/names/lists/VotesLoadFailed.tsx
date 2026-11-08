import { Button, emptyLineClass, emptyPanelClass, emptyTitleClass } from "@/components/names/ui";
import { LIST_LOAD_FAILED } from "@/lib/names/offline";

/**
 * NP-073: in place of a list's empty state when the votes couldn't be read on a device with no
 * cache, so "שמרתי" and "שמות שהסתרתי" never say there are no names. The store retries on its
 * own every 30 s; "ניסיון חוזר" reads again now. "התאמות" uses it with its own title (NP-074).
 */
export default function VotesLoadFailed({ onRetry, title = LIST_LOAD_FAILED.title }: { onRetry: () => void; title?: string }) {
  return (
    <div className={emptyPanelClass("card")}>
      <div role="status" className="contents">
        <h2 className={emptyTitleClass("card")}>{title}</h2>
        <p className={emptyLineClass()}>{LIST_LOAD_FAILED.lead}</p>
      </div>
      <Button variant="link" onClick={onRetry}>
        ניסיון חוזר
      </Button>
    </div>
  );
}
