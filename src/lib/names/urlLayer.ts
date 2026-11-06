// Sheets and dialogs live in the URL (PRD 3.2.11): ?sheet=filters, ?dialog=delete-account.
// Opening pushes a history entry marked in history.state, so Back closes the layer; a layer
// reached by a direct link has no marked entry and closes by replacing the URL instead.

export type LayerParam = "sheet" | "dialog";

export const SHEETS = ["filters", "background", "about", "match", "report", "install", "add-name", "decision", "survey"] as const;
export type SheetName = (typeof SHEETS)[number];

/** The history.state key that marks an entry pushed by opening a layer. */
export const LAYER_STATE_KEY = "nestLayer";

/** `search` with `param` set to `value` (or removed when null), as "?…" or "" when empty. */
export function layerSearch(search: string, param: LayerParam, value: string | null): string {
  const params = new URLSearchParams(search);
  if (value === null) params.delete(param);
  else params.set(param, value);
  const next = params.toString();
  return next ? `?${next}` : "";
}

/** The layer token stored in history.state for an entry pushed by opening `param=value`. */
export function layerToken(param: LayerParam, value: string): string {
  return `${param}:${value}`;
}

/** Whether `state` (history.state) is the entry pushed by opening `param=value`. */
export function isPushedLayer(state: unknown, param: LayerParam, value: string): boolean {
  if (!state || typeof state !== "object") return false;
  return (state as Record<string, unknown>)[LAYER_STATE_KEY] === layerToken(param, value);
}
