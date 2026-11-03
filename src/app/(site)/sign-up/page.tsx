import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { safeNext } from "@/lib/auth/next-path";
import { getUser } from "@/lib/auth/user";
import { AuthShell } from "@/site/account/auth-shell";
import { Underlined } from "@/site/ui/underlined";

import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Make a Coere account with a password.",
  robots: { index: false, follow: false },
};

/** Make an account with a password. Most people never need this page: the emailed code makes one too. */
export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const query = await searchParams;
  const next = safeNext(typeof query.next === "string" ? query.next : null);
  if (await getUser()) redirect(next);
  const signIn = next === "/dashboard" ? "/sign-in" : `/sign-in?next=${encodeURIComponent(next)}`;

  return (
    <AuthShell eyebrow="Account" title="Create your account" lede="Use a password, or skip this and sign in with a code we email you.">
      <SignUpForm next={next} />
      <p className="mt-6 text-center text-[14px] text-neutral-500">
        Already have an account?{" "}
        <Link href={signIn} className="group font-medium text-neutral-950">
          <Underlined>Sign in</Underlined>
        </Link>
      </p>
    </AuthShell>
  );
}
