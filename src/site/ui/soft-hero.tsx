import type { ReactNode } from "react";
import { Container } from "./container";

/**
 * A page's opening: a label, a big bold title and a line, over a soft wash of
 * Coere blue that fades to white, in the light look of the redesign. The
 * blog and careers open with it.
 */
export function SoftHero({
  eyebrow,
  title,
  description,
  align = "left",
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  children?: ReactNode;
}) {
  const centered = align === "center" ? "mx-auto text-center" : "";
  return (
    <section className="relative isolate overflow-hidden pt-16 pb-12 md:pt-24 md:pb-16">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_70%_at_12%_0%,#e3e8ff_0%,rgba(238,241,255,0.6)_40%,rgba(255,255,255,0)_72%),radial-gradient(40%_60%_at_92%_10%,#eef0ff_0%,rgba(255,255,255,0)_70%)]"
      />
      <Container>
        <div className={`max-w-4xl ${centered}`}>
          <p className="inline-flex rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-semibold text-brand-700 shadow-[0_1px_2px_rgba(20,17,15,0.05)] ring-1 ring-brand-100">{eyebrow}</p>
          <h1 className="mt-5 text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.05em] text-neutral-950 text-balance md:text-[4.5rem] md:leading-[0.98]">{title}</h1>
          {description ? <p className={`mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600 text-pretty md:text-xl ${align === "center" ? "mx-auto" : ""}`}>{description}</p> : null}
        </div>
        {children}
      </Container>
    </section>
  );
}
