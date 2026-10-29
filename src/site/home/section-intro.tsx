import { ArrowLink } from "@/site/ui/arrow-link";

/** The centered name, line and link that open each product's part of the home page. */
export function SectionIntro({ eyebrow, title, line, href, linkLabel }: { eyebrow: string; title: string; line: string; href: string; linkLabel: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-[15px] font-medium text-brand-500">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-[3.5rem] md:leading-[1.04]">{title}</h2>
      <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">{line}</p>
      <ArrowLink href={href} className="mt-6 text-neutral-950">
        {linkLabel}
      </ArrowLink>
    </div>
  );
}
