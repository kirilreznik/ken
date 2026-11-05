// Whether this page load has shown an app screen before the current one, so an in-page
// "חזרה" can go back in history (to /names?sheet=filters) instead of leaving the app.
// Module state: it survives client-side navigation and resets on a full load.

let entered = false;

/** Called by app screens that other screens link to (the swipe screen). */
export function markAppEntry(): void {
  entered = true;
}

export function hasAppEntry(): boolean {
  return entered;
}
