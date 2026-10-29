import type { ReactNode } from "react";
import { ArrowLink } from "@/site/ui/arrow-link";
import { Container } from "@/site/ui/container";

/** A product page section: a centered heading and line, an optional link, then whatever it shows. */
export function ProductSection({
  title,
  line,
  link,
  children,
  tint = false,
  id,
}: {
  title: string;
  line?: string;
  link?: { href: string; linkLabel: string };
  children: ReactNode;
  tint?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 py-28 md:py-32 ${tint ? "bg-neutral-50" : ""}`}>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-5xl md:leading-[1.05]">{title}</h2>
          {line ? <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">{line}</p> : null}
          {link ? <ArrowLink href={link.href} className="mt-6 text-neutral-950">{link.linkLabel}</ArrowLink> : null}
        </div>
        <div className="mt-16">{children}</div>
      </Container>
    </section>
  );
}
