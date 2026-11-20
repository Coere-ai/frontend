import type { ReactNode } from "react";
import { UNDER_NAV } from "@/site/nav/nav-space";
import { SoftBackdrop } from "./soft-backdrop";

/**
 * A centered page opening on the soft backdrop, for index pages with no
 * product to show beside the words: a big bold heading and one line, then
 * whatever the page puts under them. `plain` leaves the backdrop out, for a
 * page that opens on white.
 */
export function CenterHero({ title, line, plain = false, children }: { title: string; line: string; plain?: boolean; children?: ReactNode }) {
  return (
    <section className={`relative isolate overflow-hidden ${UNDER_NAV}`}>
      {plain ? null : (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <SoftBackdrop />
        </div>
      )}
      <div className="mx-auto max-w-[1440px] px-6 pt-[152px] pb-16 text-center md:px-10 md:pt-[184px] md:pb-24">
        <h1 className="mx-auto max-w-4xl text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.045em] text-neutral-950 text-balance sm:text-6xl xl:text-[4.5rem]">{title}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600 text-pretty md:text-[19px]">{line}</p>
        {children}
      </div>
    </section>
  );
}
