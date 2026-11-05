/**
 * Where the page's document was first loaded. Chrome names the sender of
 * a message to an extension by that address, and a client side navigation
 * leaves it where it was: signing in on /sign-in and arriving at /connect
 * that way, Coere sees the message come from /sign-in and answers only
 * that it does not know it. The connect page uses this to load itself
 * once as a whole document first. Pure apart from `loadedPath`.
 */

/** The path of the address the document loaded at, from its navigation entry's name. */
export function pathOf(address: string | undefined): string | null {
  if (!address) return null;
  try {
    return new URL(address).pathname;
  } catch {
    return null;
  }
}

/** True when the document loaded at another path than the one it shows now. */
export function loadedElsewhere(loadedAt: string | undefined, shownPath: string): boolean {
  const path = pathOf(loadedAt);
  return path !== null && path !== shownPath;
}

/** The browser's own answer: the navigation entry's address, if it has one. */
export function loadedAddress(): string | undefined {
  const entry = performance.getEntriesByType("navigation")[0];
  return entry?.name;
}
