import { openSheet } from "@/components/names/ui";

/**
 * "לדייק" opens the filters sheet straight on its "חיפוש לפי תיאור" step. The sheet reads this
 * once when it mounts (takeAiStep) and starts on the filters for every other way in.
 */
let pending = false;

export function openAiSearch(): void {
  pending = true;
  openSheet("filters");
}

export function peekAiStep(): boolean {
  return pending;
}

export function takeAiStep(): void {
  pending = false;
}
