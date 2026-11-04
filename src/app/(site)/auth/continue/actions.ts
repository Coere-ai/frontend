"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { linkFailedPath, readEmailLink } from "@/lib/auth/email-link";
import { overLimit } from "@/lib/auth/guard";
import { markSignedIn } from "@/lib/auth/hint-cookie";
import { safeNext } from "@/lib/auth/next-path";
import { logSecurityEvent } from "@/lib/security/events";
import { accountsConfigured, sessionClient } from "@/lib/supabase/server";

/**
 * The confirm page's one button. This is where an emailed link's token is
 * spent: only on a POST the person made, from this site (Next refuses a
 * server action whose Origin is not this host). A good token signs the
 * person in and goes on to `next`; a bad one goes back to sign in, which
 * says the link did not work.
 */
export async function confirmLink(form: FormData): Promise<never> {
  const link = readEmailLink(form.get("token_hash"), form.get("type"), form.get("next"));
  const back = linkFailedPath(link?.next ?? safeNext(String(form.get("next") ?? "")));
  if (!link || !accountsConfigured()) redirect(back);

  const head = await headers();
  if (await overLimit(head, null)) redirect(back);

  const client = await sessionClient();
  const { data, error } = await client.auth.verifyOtp({ token_hash: link.tokenHash, type: link.type });
  if (error || !data.user) {
    await logSecurityEvent("sign_in_failed", { headers: head });
    redirect(back);
  }
  await markSignedIn();
  await logSecurityEvent("sign_in", { userId: data.user.id, headers: head });
  redirect(link.next);
}
