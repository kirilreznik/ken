// Sheets and dialogs live in the URL (PRD 3.2.11): ?sheet=filters, ?dialog=delete-account.
// Opening pushes a history entry marked in history.state, so Back closes the layer; a layer
// reached by a direct link has no marked entry and closes by replacing the URL instead.

export type LayerParam = "sheet" | "dialog";

export const SHEETS = ["filters", "background", "about", "match", "report", "install", "add-name", "decision", "survey", "name"] as const;
export type SheetName = (typeof SHEETS)[number];

/** The history.state key that marks an entry pushed by opening a layer. */
export const LAYER_STATE_KEY = "nestLayer";

/** `search` with `param` set to `value` (or removed when null), as "?…" or "" when empty. */
export function layerSearch(search: string, param: LayerParam, value: string | null): string {
  const params = new URLSearchParams(search);
  if (value === null) params.delete(param);
  else params.set(param, value);
  // `n` belongs to the name sheet, and to the about and report sheets opened from it (FR-D17).
  if (param === "sheet" && !(value !== null && NAME_KEEPING_SHEETS.includes(value))) params.delete(NAME_PARAM);
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

// The name sheet (?sheet=name&n=<name>). Each name opened pushes an entry, so Back walks back
// through the names; the entry's state keeps how many name entries were pushed in a row, so
// closing goes back past all of them at once.

export const NAME_SHEET = "name" satisfies SheetName;
/** Sheets that keep `n` when they open over the name sheet: Back comes back to that name, and the report is about it. */
const NAME_KEEPING_SHEETS: readonly string[] = [NAME_SHEET, "about", "report"];
/** The query param holding the name shown in the name sheet. */
export const NAME_PARAM = "n";
/** The history.state key counting the name entries pushed in a row, up to this one. */
export const NAME_DEPTH_KEY = "nestNameDepth";
/** The history.state key set when the first pushed name entry sits on a direct-link entry. */
export const NAME_LINK_KEY = "nestNameOverLink";

/** `search` with the name sheet open on `name` (or closed when null), as "?…" or "". */
export function nameSearch(search: string, name: string | null): string {
  const params = new URLSearchParams(search);
  if (name === null) {
    if (params.get("sheet") === NAME_SHEET) params.delete("sheet");
    params.delete(NAME_PARAM);
  } else {
    params.set("sheet", NAME_SHEET);
    params.set(NAME_PARAM, name);
  }
  const next = params.toString();
  return next ? `?${next}` : "";
}

/** The name in `search` when the name sheet is open on one, else null. */
export function readName(search: string): string | null {
  const params = new URLSearchParams(search);
  if (params.get("sheet") !== NAME_SHEET) return null;
  const name = params.get(NAME_PARAM)?.trim();
  return name ? name : null;
}

/** Whether another sheet or a dialog is open in `search`: the name sheet never opens over it (PRD 3.3.3). */
export function otherLayerOpen(search: string): boolean {
  const params = new URLSearchParams(search);
  const sheet = params.get("sheet");
  return (sheet !== null && sheet !== NAME_SHEET) || params.has("dialog");
}

/** The slice of `window` the name sheet's history logic uses (a fake in tests). */
export interface LayerWindow {
  location: { pathname: string; search: string; hash: string };
  history: { state: unknown; pushState(state: unknown, unused: string, url: string): void; replaceState(state: unknown, unused: string, url: string): void; go(delta: number): void };
  addEventListener(type: "popstate", listener: () => void, options: { once: true }): void;
}

function nameStack(state: unknown): { depth: number; overLink: boolean } {
  if (!isPushedLayer(state, "sheet", NAME_SHEET)) return { depth: 0, overLink: false };
  const record = state as Record<string, unknown>;
  const depth = record[NAME_DEPTH_KEY];
  return { depth: typeof depth === "number" && depth > 0 ? depth : 1, overLink: record[NAME_LINK_KEY] === true };
}

function nameUrl(w: LayerWindow, name: string | null): string {
  const { pathname, search, hash } = w.location;
  return `${pathname}${nameSearch(search, name)}${hash}`;
}

/** Opens the name sheet on `name`: pushes a marked entry, or replaces the current one; nothing over another layer. */
export function openNameIn(w: LayerWindow, name: string, options: { replace?: boolean } = {}): void {
  const current = readName(w.location.search);
  if (current === name || otherLayerOpen(w.location.search)) return;
  const { depth, overLink } = nameStack(w.history.state);
  const marker = { [LAYER_STATE_KEY]: layerToken("sheet", NAME_SHEET) };
  if (options.replace) {
    // Same place in the stack: the entry keeps its depth (an unpushed entry stays unpushed).
    const state = depth > 0 ? { ...marker, [NAME_DEPTH_KEY]: depth, [NAME_LINK_KEY]: overLink } : null;
    w.history.replaceState(state, "", nameUrl(w, name));
    return;
  }
  // Over a direct link to the sheet (open, no entry of ours), closing must also clean that entry.
  const linkBelow = depth === 0 && current !== null;
  const state = { ...marker, [NAME_DEPTH_KEY]: depth + 1, [NAME_LINK_KEY]: depth > 0 ? overLink : linkBelow };
  w.history.pushState(state, "", nameUrl(w, name));
}

/** Closes the name sheet: back past every name entry pushed in a row, else replaces the URL. */
export function closeNameIn(w: LayerWindow): void {
  if (new URLSearchParams(w.location.search).get("sheet") !== NAME_SHEET) return;
  const { depth, overLink } = nameStack(w.history.state);
  if (depth === 0) {
    w.history.replaceState(null, "", nameUrl(w, null));
    return;
  }
  if (overLink) w.addEventListener("popstate", () => w.history.replaceState(null, "", nameUrl(w, null)), { once: true });
  w.history.go(-depth);
}
