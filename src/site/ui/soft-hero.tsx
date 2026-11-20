import type { ReactNode } from "react";
import { UNDER_NAV } from "@/site/nav/nav-space";
import { Container } from "./container";

/**
 * A page's opening: a big bold title and a line on the page's flat ground,
 * white or, in the dark page theme, near black. Careers opens with it.
 */
export function SoftHero({
  title,
  description,
  align = "left",
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  children?: ReactNode;
}) {
  const centered = align === "center" ? "mx-auto text-center" : "";
  return (
    <section className={`relative isolate overflow-hidden pt-[136px] pb-12 md:pt-[168px] md:pb-16 ${UNDER_NAV}`}>
      <Container>
        <div className={`max-w-4xl ${centered}`}>
          <h1 className="text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.05em] text-neutral-950 text-balance dark:text-white md:text-[4.5rem] md:leading-[0.98]">{title}</h1>
          {description ? <p className={`mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600 text-pretty dark:text-white/65 md:text-xl ${align === "center" ? "mx-auto" : ""}`}>{description}</p> : null}
        </div>
        {children}
      </Container>
    </section>
  );
}
