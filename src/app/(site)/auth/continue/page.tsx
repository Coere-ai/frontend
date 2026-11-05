import type { EmailOtpType } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { linkFailedPath, readEmailLink } from "@/lib/auth/email-link";
import { getUser } from "@/lib/auth/user";
import { AuthShell, authCardClass } from "@/site/account/auth-shell";
import { buttonClass } from "@/site/ui/button";

import { confirmLink } from "./actions";

export const metadata: Metadata = {
  title: "Continue",
  description: "Finish signing in to your Coere account.",
  robots: { index: false, follow: false },
};

/** What the page says for each kind of emailed link. */
const COPY: Record<EmailOtpType, { title: string; button: string }> = {
  email: { title: "Continue signing in", button: "Sign in" },
  magiclink: { title: "Continue signing in", button: "Sign in" },
  signup: { title: "Confirm your email", button: "Confirm and sign in" },
  invite: { title: "Accept your invite", button: "Accept and sign in" },
  recovery: { title: "Continue signing in", button: "Sign in" },
  email_change: { title: "Continue signing in", button: "Sign in" },
};

/**
 * Where /auth/confirm sends an emailed link. Loading this page changes
 * nothing, so a mail scanner that opens the link leaves the code and the link
 * working. The person presses the button to spend the token. When someone is
 * already signed in here, the page says so first, so a link another person
 * sent cannot quietly swap this browser onto their account.
 */
export default async function ContinuePage({ searchParams }: PageProps<"/auth/continue">) {
  const query = await searchParams;
  const pick = (key: string) => (typeof query[key] === "string" ? query[key] : null);
  const link = readEmailLink(pick("token_hash"), pick("type"), pick("next"));
  if (!link) redirect(linkFailedPath("/dashboard"));

  const user = await getUser();
  const copy = COPY[link.type];
  const lede = user
    ? `You are signed in as ${user.email}. Continuing signs this browser in with the account this link belongs to instead.`
    : "Press the button to finish. The link works once.";

  return (
    <AuthShell eyebrow="Account" title={copy.title} lede={lede}>
      <form action={confirmLink} className={authCardClass}>
        <input type="hidden" name="token_hash" value={link.tokenHash} />
        <input type="hidden" name="type" value={link.type} />
        <input type="hidden" name="next" value={link.next} />
        <button type="submit" className={buttonClass("primary", "w-full")}>
          {copy.button}
        </button>
      </form>
    </AuthShell>
  );
}
