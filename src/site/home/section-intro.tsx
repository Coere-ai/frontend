import type { ReactNode } from "react";
import { ArrowLink } from "@/site/ui/arrow-link";
import { EYEBROW, SECTION_TITLE } from "./look";

/**
 * The centered name, title and line that open each part of the home page,
 * with a product's buttons and link when it has them.
 */
export function SectionIntro({ eyebrow, title, line, href, linkLabel, actions }: { eyebrow: string; title: string; line: string; href?: string; linkLabel?: string; actions?: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className={EYEBROW}>{eyebrow}</p>
      <h2 className={`mt-5 ${SECTION_TITLE}`}>{title}</h2>
      <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600 text-balance">{line}</p>
      {actions ? <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
      {href && linkLabel ? (
        <ArrowLink href={href} className={`${actions ? "mt-7" : "mt-6"} text-neutral-950`}>
          {linkLabel}
        </ArrowLink>
      ) : null}
    </div>
  );
}
