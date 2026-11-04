import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { continuePath, linkFailedPath, readEmailLink } from "@/lib/auth/email-link";
import { nextFromLink } from "@/lib/auth/next-path";
import { siteOrigins } from "@/lib/auth/origin";

/**
 * Every link Supabase emails lands here: the sign in code's email, the sign
 * up confirmation and an invite. The link carries a token hash rather than a
 * session, so it works in any browser, not only the one that asked for it.
 *
 * Opening the link never spends it. Mail scanners fetch every link in an
 * email before the person sees it (HEAD is served by this handler too), and
 * the link's token is the same one as the code in the email, so verifying
 * here would spend both. A link someone else sent would also replace the
 * session already in this browser without a word. So this only checks the
 * link's shape and moves on to /auth/continue, whose button posts the token
 * to be verified.
 */

export const dynamic = "force-dynamic";

export function GET(request: NextRequest): never {
  const { searchParams, origin, search } = request.nextUrl;
  const next = nextFromLink(search, siteOrigins(origin));
  const link = readEmailLink(searchParams.get("token_hash"), searchParams.get("type"), next);
  redirect(link ? continuePath(link) : linkFailedPath(next));
}
