"use client";

import { useSearchParams } from "next/navigation";
import { adoptNameLinkIn, closeNameIn, isPushedLayer, LAYER_STATE_KEY, layerSearch, layerToken, NAME_SHEET, openNameIn, type LayerParam, type SheetName } from "@/lib/names/urlLayer";

function urlWith(param: LayerParam, value: string | null): string {
  const { pathname, search, hash } = window.location;
  return `${pathname}${layerSearch(search, param, value)}${hash}`;
}

function currentValue(param: LayerParam): string | null {
  return new URLSearchParams(window.location.search).get(param);
}

// Next patches pushState/replaceState so useSearchParams follows (docs: Native History API).
function openLayer(param: LayerParam, name: string) {
  if (currentValue(param) === name) return;
  window.history.pushState({ [LAYER_STATE_KEY]: layerToken(param, name) }, "", urlWith(param, name));
}

// Back when the open pushed an entry; a direct link (no entry of ours) replaces the URL instead.
function closeLayer(param: LayerParam, name: string) {
  if (currentValue(param) !== name) return;
  if (isPushedLayer(window.history.state, param, name)) window.history.back();
  else window.history.replaceState(null, "", urlWith(param, null));
}

export const openSheet = (name: SheetName) => openLayer("sheet", name);
/** Closes ?sheet=name; the name sheet also drops `n` and every name entry it pushed. */
export const closeSheet = (name: SheetName) => (name === NAME_SHEET ? closeNameIn(window) : closeLayer("sheet", name));
/** Opens the name sheet on `name` (?sheet=name&n=…); a second name pushes another entry. */
export const openNameSheet = (name: string, options?: { replace?: boolean }) => openNameIn(window, name, options);
/** Turns a direct link to the name sheet into a pushed entry over the clean page; true when it was one. */
export const adoptNameLink = () => adoptNameLinkIn(window);
export const openDialog = (name: string) => openLayer("dialog", name);
export const closeDialog = (name: string) => closeLayer("dialog", name);

/** Whether ?param=name is in the URL. Uses useSearchParams: render it inside <Suspense>. */
export function useLayerOpen(param: LayerParam, name: string): boolean {
  return useSearchParams().get(param) === name;
}
