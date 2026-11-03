import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { overLimit } from "@/lib/auth/guard";
import { markSignedIn } from "@/lib/auth/hint-cookie";
import { nextFromLink } from "@/lib/auth/next-path";
import { siteOrigins } from "@/lib/auth/origin";
import { logSecurityEvent } from "@/lib/security/events";
import { accountsConfigured, sessionClient } from "@/lib/supabase/server";

/**
 * Every link Supabase emails lands here: the sign in code's email, the sign
 * up confirmation and an invite. The link carries a token hash rather than a
 * session, so it works in any browser, not only the one that asked for it.
 * A good link signs the person in and goes on to `next`; a bad one goes back
 * to sign in, which says the link did not work.
 */

export const dynamic = "force-dynamic";

const TYPES = new Set<EmailOtpType>(["email", "signup", "magiclink", "invite"]);

const isType = (value: string | null): value is EmailOtpType => value !== null && TYPES.has(value as EmailOtpType);

export async function GET(request: NextRequest): Promise<never> {
  const { searchParams, origin, search } = request.nextUrl;
  const next = nextFromLink(search, siteOrigins(origin));
  const back = `/sign-in?error=link&next=${encodeURIComponent(next)}`;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!tokenHash || !isType(type) || !accountsConfigured()) redirect(back);
  if (await overLimit(request.headers, null)) redirect(back);

  const client = await sessionClient();
  const { data, error } = await client.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error || !data.user) {
    await logSecurityEvent("sign_in_failed", { headers: request.headers });
    redirect(back);
  }
  await markSignedIn();
  await logSecurityEvent("sign_in", { userId: data.user.id, headers: request.headers });
  redirect(next);
}
