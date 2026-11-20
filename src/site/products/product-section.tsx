import type { ReactNode } from "react";
import { EYEBROW, SECTION_TITLE, SECTION_Y, SOFT_FIELD } from "@/site/home/look";
import { ArrowLink } from "@/site/ui/arrow-link";
import { Container } from "@/site/ui/container";

/**
 * A product page section: a centered heading and line, an optional link,
 * then whatever it shows, in the home page's look. `tint` sets the whole
 * section on a pale rounded field, to tell it apart from its neighbors.
 */
export function ProductSection({
  title,
  eyebrow,
  line,
  link,
  children,
  tint = false,
  id,
}: {
  title: string;
  eyebrow?: string;
  line?: string;
  link?: { href: string; linkLabel: string };
  children: ReactNode;
  tint?: boolean;
  id?: string;
}) {
  const body = (
    <>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow ? <p className={`mb-5 ${EYEBROW}`}>{eyebrow}</p> : null}
        <h2 className={SECTION_TITLE}>{title}</h2>
        {line ? <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600 text-balance">{line}</p> : null}
        {link ? <ArrowLink href={link.href} className="mt-6 text-neutral-950">{link.linkLabel}</ArrowLink> : null}
      </div>
      <div className="mt-14 md:mt-16">{children}</div>
    </>
  );
  return (
    <section id={id} className={`scroll-mt-24 ${SECTION_Y}`}>
      <Container>{tint ? <div className={`${SOFT_FIELD} px-5 py-16 sm:px-8 md:px-12 md:py-20`}>{body}</div> : body}</Container>
    </section>
  );
}
