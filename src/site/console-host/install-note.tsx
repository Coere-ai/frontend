import Link from "next/link";

import { Brand } from "@/site/ui/brand";
import { ButtonLink } from "@/site/ui/button";

/** What /dashboard says when no Coere answers in this browser: install it, or open the page where it is. */
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
          The dashboard runs inside Coere Connect, the Chrome extension. Install Coere, or open this page in the Chrome where it is installed.
        </p>
        <div className="mt-8">
          <ButtonLink href="/install">Install Coere</ButtonLink>
        </div>
      </div>
    </main>
  );
}
