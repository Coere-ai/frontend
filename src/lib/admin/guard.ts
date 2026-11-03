import "server-only";

import { redirect } from "next/navigation";

import { isSignedIn } from "@/lib/auth/session";

/**
 * The admin session check every page under /admin makes for itself, even
 * though the proxy already looked. Signed out, it goes home like the proxy
 * does, so the page never confirms what it is.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isSignedIn())) redirect("/");
}
