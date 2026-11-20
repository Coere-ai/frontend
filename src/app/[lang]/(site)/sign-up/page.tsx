import type { Metadata } from "next";
import Link from "@/site/i18n/link";
import { redirect } from "next/navigation";

import { safeNext } from "@/lib/auth/next-path";
import { getUser } from "@/lib/auth/user";
import { AuthShell } from "@/site/account/auth-shell";
import { Underlined } from "@/site/ui/underlined";

import { SignUpForm } from "./sign-up-form";
import { requireEnglish } from "@/site/i18n/server";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Make a Coere account with a username and a password.",
  robots: { index: false, follow: false },
};

/** Make an account with a username and a password. A signed in visitor goes straight on. */
export default async function SignUpPage({ searchParams }: PageProps<"/[lang]/sign-up">) {
  // In English only for now; /es/sign-in and the rest are a 404.
  await requireEnglish();
  const query = await searchParams;
  const next = safeNext(typeof query.next === "string" ? query.next : null);
  if (await getUser()) redirect(next);
  const signIn = next === "/dashboard" ? "/sign-in" : `/sign-in?next=${encodeURIComponent(next)}`;

  return (
    <AuthShell eyebrow="Account" title="Create your account" lede="Pick a username and a password. No email needed.">
      <SignUpForm next={next} />
      <p className="mt-6 text-center text-[14px] text-neutral-500 dark:text-white/60">
        Already have an account?{" "}
        <Link href={signIn} className="group font-medium text-neutral-950 dark:text-white">
          <Underlined>Sign in</Underlined>
        </Link>
      </p>
    </AuthShell>
  );
}
