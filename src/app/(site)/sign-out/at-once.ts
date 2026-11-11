/**
 * Whether /sign-out signs out as it loads, by the browser's
 * `Sec-Fetch-Site`: a visit the person started (typed, a bookmark, an
 * extension's own tab) or one from this site does; a visit from another
 * site, or from a browser that says nothing, waits for the button. Pure,
 * so a test pins each case.
 */
export function signsOutAtOnce(secFetchSite: string | null): boolean {
  return secFetchSite === "none" || secFetchSite === "same-origin";
}
