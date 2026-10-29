import type { Metadata } from "next";
import { LogoMark } from "@/components/logo";
import Link from "next/link";
import { passMinutesLeft } from "@/lib/access/server";
import { AccessForm } from "./access-form";

export const metadata: Metadata = {
  title: "Private preview",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  wrong: "That user and password don't match. Try again.",
  unset: "Sign in isn't set up on this deploy yet.",
};

/**
 * The door to the new site. With a pass it says how long is left; without
 * one it shows the sign in form.
 */
export default async function AccessPage({ searchParams }: PageProps<"/access">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? ERRORS[error] : undefined;
  const minutesLeft = await passMinutesLeft();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 text-brand-500">
          <LogoMark className="h-7 w-7" />
          <span className="text-lg font-semibold tracking-[-0.02em]">Coere</span>
        </div>

        <h1 className="mt-10 text-3xl font-medium tracking-[-0.03em] text-neutral-950">
          Private preview
        </h1>

        {minutesLeft ? (
          <>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-500">
              You&apos;re in for about {minutesLeft} more{" "}
              {minutesLeft === 1 ? "minute" : "minutes"}.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex h-11 items-center rounded-full bg-neutral-950 px-6 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Open the site
              </Link>
              <form action="/access/leave" method="post">
                <button className="h-11 rounded-full px-5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-950">
                  Sign out
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-500">
              Sign in to see the new site. A sign in lasts one hour.
            </p>
            <AccessForm error={message} />
          </>
        )}
      </div>
    </main>
  );
}
