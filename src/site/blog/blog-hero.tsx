import type { ReactNode } from "react";
import { UNDER_NAV } from "@/site/nav/nav-space";
import { Container } from "@/site/ui/container";

/**
 * The blog's opening: a dark band in the look of the Coere Solutions and
 * Forge heroes, with the page title, a line about the blog, and the
 * featured post under them. It marks itself dark, so the glass navbar over
 * it turns dark too.
 */
export function BlogHero({ children }: { children: ReactNode }) {
  return (
    <section data-nav-tone="dark" aria-labelledby="blog-title" className={`relative isolate overflow-hidden bg-[#05060d] pt-[136px] pb-20 text-white md:pt-[176px] md:pb-28 ${UNDER_NAV}`}>
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_18%_0%,rgba(82,103,247,0.32),rgba(82,103,247,0)_70%),radial-gradient(45%_50%_at_95%_35%,rgba(63,76,235,0.18),rgba(63,76,235,0)_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(163,176,253,0.16)_1px,transparent_1.2px)] [background-size:14px_14px] [mask-image:linear-gradient(180deg,#000,transparent_70%)]" />
      </div>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-6">
          <h1 id="blog-title" className="text-[3.25rem] leading-[0.98] font-semibold tracking-[-0.055em] md:text-[5.5rem]">
            The Coere blog
          </h1>
          <p className="max-w-md text-[17px] leading-relaxed text-white/65 text-pretty md:pb-2 md:text-lg">
            News, launches and notes from the team building the memory layer you own.
          </p>
        </div>
        <div className="mt-14 border-t border-white/10 pt-14 md:mt-20 md:pt-16">{children}</div>
      </Container>
    </section>
  );
}
