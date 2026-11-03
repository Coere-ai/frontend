import type { ReactNode } from "react";
import { ButtonLink, CircleArrowLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";

/**
 * A calm, centered page for something that is not out yet: a mark, the
 * name, one line, and the ways back to the home page and the demo.
 */
export function ComingSoon({ eyebrow, title, line, mark }: { eyebrow: string; title: string; line: string; mark?: ReactNode }) {
  return (
    <section className="py-32 md:py-44">
      <Container className="text-center">
        {mark ? <div className="mx-auto mb-8 grid h-16 w-16 place-items-center rounded-full bg-neutral-50 ring-1 ring-neutral-200">{mark}</div> : null}
        <p className="text-[15px] font-medium text-brand-500">{eyebrow}</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-5xl font-medium tracking-[-0.05em] text-neutral-950 text-balance md:text-7xl">{title}</h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-neutral-500 text-balance">{line}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <CircleArrowLink href="/#demo">Watch the demo</CircleArrowLink>
          <ButtonLink href="/" variant="secondary">
            Go home
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
