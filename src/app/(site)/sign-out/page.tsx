import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUser } from "@/lib/auth/user";
import { AuthShell } from "@/site/account/auth-shell";
import { SignOutForm } from "@/site/account/sign-out-form";
import { buttonClass } from "@/site/ui/button";

import { signsOutAtOnce } from "./at-once";

/** It reads the session and the request on every visit; drawn once at build it would only ever redirect. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign out",
  description: "Sign out of Coere in this browser.",
  robots: { index: false, follow: false },
};

/**
 * Where Coere's Console, open in its own tab, sends the person after its
 * Sign out has disconnected the extension (docs/accounts.md 6.9). /sign-in
 * sent a signed in visitor straight on, so the site stayed signed in over
 * a disconnected Coere (the review of 2026-11-11). Here the sign out form
 * submits itself when the visit did not come from another site, and
 * otherwise waits for its button, so a link elsewhere cannot sign the
 * person out. A visitor already signed out goes to /sign-in.
 */
export default async function SignOutPage() {
  if (!(await getUser())) redirect("/sign-in");
  const auto = signsOutAtOnce((await headers()).get("sec-fetch-site"));
  return (
    <AuthShell eyebrow="Account" title="Sign out of Coere" lede="Sign out of coere.ai in this browser. Coere here signs out too.">
      <SignOutForm next="/sign-in" auto={auto}>
        <button type="submit" className={buttonClass("primary", "w-full")}>
          Sign out
        </button>
      </SignOutForm>
    </AuthShell>
  );
}
