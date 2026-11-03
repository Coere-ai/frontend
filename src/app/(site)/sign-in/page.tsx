import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { safeNext } from "@/lib/auth/next-path";
import { getUser } from "@/lib/auth/user";
import { AuthShell } from "@/site/account/auth-shell";
import { Underlined } from "@/site/ui/underlined";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Coere account.",
  robots: { index: false, follow: false },
};

/** Why /auth/confirm sent the person back here, in words. */
const LINK_ERRORS: Record<string, string> = {
  link: "That link has expired or was already used. Ask for a new code below.",
};

/** Sign in, by an emailed code first and a password second. A signed in visitor goes straight on. */
export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const query = await searchParams;
  const next = safeNext(typeof query.next === "string" ? query.next : null);
  if (await getUser()) redirect(next);
  const error = typeof query.error === "string" ? (LINK_ERRORS[query.error] ?? null) : null;
  const signUp = next === "/dashboard" ? "/sign-up" : `/sign-up?next=${encodeURIComponent(next)}`;

  return (
    <AuthShell eyebrow="Account" title="Sign in to Coere" lede="We'll email you a code. No password needed.">
      <SignInForm next={next} error={error} />
      <p className="mt-6 text-center text-[14px] text-neutral-500">
        New to Coere?{" "}
        <Link href={signUp} className="group font-medium text-neutral-950">
          <Underlined>Create an account</Underlined>
        </Link>
      </p>
    </AuthShell>
  );
}
