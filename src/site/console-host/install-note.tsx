import Link from "next/link";

import { Brand } from "@/site/ui/brand";
import { ButtonLink } from "@/site/ui/button";
import { ChromeMark } from "@/site/ui/icons/chrome-mark";

/**
 * What /dashboard says when no Coere answers in this browser: get it from
 * /install (a countdown until it is in the Chrome Web Store), or open the
 * page where it is. A person here without Coere may have lost the browser
 * it was in, so the page also points to /account, which signs browsers out
 * with no Coere needed.
 */
export function InstallNote() {
  return (
    <main className="flex min-h-screen flex-col bg-white px-6">
      <div className="pt-8">
        <Link href="/" aria-label="Coere home" className="inline-block">
          <Brand />
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pb-24">
        <h1 className="text-[28px] font-medium tracking-[-0.02em] text-neutral-950">Your dashboard is in Coere</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-500">
          The dashboard runs inside Coere Connect, the Chrome extension. Get Coere, or open this page in the Chrome where it is installed.
        </p>
        <div className="mt-8">
          <ButtonLink href="/install">
            <ChromeMark className="h-[18px] w-[18px]" />
            Get Coere for Chrome
          </ButtonLink>
        </div>
        <p className="mt-10 text-[14px] leading-relaxed text-neutral-500">
          Lost a browser Coere was in?{" "}
          <Link href="/account" className="text-neutral-950 underline underline-offset-4">
            Sign it out from your account
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
