import "server-only";

import { cookies } from "next/headers";

import { readableCookieOptions, SIGNED_IN_COOKIE } from "@/lib/supabase/cookie-options";

/**
 * The `coere_signed_in=1` hint the navbar reads to say Dashboard instead of
 * Sign in. It grants nothing; the session cookies do that. Only a Server
 * Function or a Route Handler may call these, as only they can set cookies.
 */
export async function markSignedIn(): Promise<void> {
  (await cookies()).set(SIGNED_IN_COOKIE, "1", readableCookieOptions);
}

export async function clearSignedIn(): Promise<void> {
  (await cookies()).set(SIGNED_IN_COOKIE, "", { ...readableCookieOptions, maxAge: 0 });
}
