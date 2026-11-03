/**
 * What the proxy does with an admin path, given whether the admin cookie
 * verified. Signed out, a data route answers 404 and any page but /admin
 * itself goes home, so nothing confirms the panel is there; /admin passes
 * because signed out it is only the sign in form. `api` passes a signed in
 * data route as it is; `page` passes a page with the nonce policy. Pure, so
 * the tests pin every case.
 */
export type AdminGate = "not_found" | "home" | "api" | "page";

export function adminGate(pathname: string, signedIn: boolean): AdminGate {
  if (pathname === "/api/admin" || pathname.startsWith("/api/admin/")) return signedIn ? "api" : "not_found";
  if (pathname !== "/admin" && !signedIn) return "home";
  return "page";
}
