import type { ReactNode } from "react";
import { ArrowLink } from "@/site/ui/arrow-link";

/** The centered name, line, buttons and link that open a product's part of the home page. */
export function SectionIntro({ eyebrow, title, line, href, linkLabel, actions }: { eyebrow: string; title: string; line: string; href: string; linkLabel: string; actions?: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-[15px] font-medium text-brand-500">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-[3.5rem] md:leading-[1.04]">{title}</h2>
      <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">{line}</p>
      {actions ? <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
      <ArrowLink href={href} className={`${actions ? "mt-7" : "mt-6"} text-neutral-950`}>
        {linkLabel}
      </ArrowLink>
    </div>
  );
}
