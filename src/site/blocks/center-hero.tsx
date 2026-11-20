import type { ReactNode } from "react";
import { UNDER_NAV } from "@/site/nav/nav-space";
import { SoftBackdrop } from "./soft-backdrop";

/**
 * A centered page opening on the soft backdrop, for index pages with no
 * product to show beside the words: a pill label, a big bold heading and
 * one line, then whatever the page puts under them.
 */
export function CenterHero({ eyebrow, title, line, children }: { eyebrow?: string; title: string; line: string; children?: ReactNode }) {
  return (
    <section className={`relative isolate overflow-hidden ${UNDER_NAV}`}>
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <SoftBackdrop />
      </div>
      <div className="mx-auto max-w-[1440px] px-6 pt-[152px] pb-16 text-center md:px-10 md:pt-[184px] md:pb-24">
        {eyebrow ? (
          <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 text-[13px] font-medium text-brand-700 ring-1 ring-brand-500/15 backdrop-blur-md">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mx-auto mt-6 max-w-4xl text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.045em] text-neutral-950 text-balance sm:text-6xl xl:text-[4.5rem]">{title}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600 text-pretty md:text-[19px]">{line}</p>
        {children}
      </div>
    </section>
  );
}
