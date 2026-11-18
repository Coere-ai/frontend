/**
 * Which paths the site's own numbers count (docs/accounts.md 3.3). The admin
 * panel is not the site, and counting our own visits to it would put the
 * operator in their own numbers. The account pages are private, and the
 * contract says the tracker does not run on them, even the ones that sit
 * inside the site's layout (/account, /sign-out). The tracker checks this
 * before it sends, and the beacon checks it again, so a tab opened before a
 * change still stays out. Pure.
 */
const PRIVATE = /^\/(admin|statistics|sign-in|sign-up|sign-out|auth|connect|account|dashboard|join|welcome)(\/|$)/;

export function isTrackedPath(path: string): boolean {
  return !PRIVATE.test(path);
}
