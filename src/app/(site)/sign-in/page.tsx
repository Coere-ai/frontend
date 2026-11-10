import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { safeNext } from "@/lib/auth/next-path";
import { getUser } from "@/lib/auth/user";
import { siteConfig } from "@/lib/site";
import { AuthShell } from "@/site/account/auth-shell";
import { Underlined } from "@/site/ui/underlined";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Coere account.",
  robots: { index: false, follow: false },
};

/** Sign in with a username and a password. A signed in visitor goes straight on. */
export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const query = await searchParams;
  const next = safeNext(typeof query.next === "string" ? query.next : null);
  if (await getUser()) redirect(next);
  const signUp = next === "/dashboard" ? "/sign-up" : `/sign-up?next=${encodeURIComponent(next)}`;

  return (
    <AuthShell eyebrow="Account" title="Sign in to Coere" lede="Use your username and the password you set.">
      <SignInForm next={next} />
      <p className="mt-6 text-center text-[14px] text-neutral-500">
        New to Coere?{" "}
        <Link href={signUp} className="group font-medium text-neutral-950">
          <Underlined>Create an account</Underlined>
        </Link>
      </p>
      <p className="mt-3 text-center text-[13px] text-neutral-400">
        Forgot your password?{" "}
        <a href={`mailto:${siteConfig.email}`} className="group text-neutral-500 hover:text-neutral-950">
          <Underlined>Contact us</Underlined>
        </a>
        .
      </p>
    </AuthShell>
  );
}
