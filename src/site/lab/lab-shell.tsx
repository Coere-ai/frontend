import type { ReactNode } from "react";

import { Container } from "@/site/ui/container";
import { DarkPage } from "@/site/ui/page-theme";

/** The Lab's page frame: dark like /account, one column, a title and one line. */
export function LabShell({ title, line, wide = false, children }: { title: string; line: string; wide?: boolean; children?: ReactNode }) {
  return (
    <DarkPage>
      <section className="pt-16 pb-28 md:pt-24 md:pb-36">
        <Container>
          <div className={`mx-auto ${wide ? "max-w-[880px]" : "max-w-[720px]"}`}>
            <p className="text-[13px] font-medium tracking-wide text-brand-400 uppercase">Coere Lab</p>
            <h1 className="mt-2 text-[2rem] leading-[1.1] font-medium tracking-[-0.04em] text-white md:text-[2.5rem]">{title}</h1>
            <p className="mt-4 text-[17px] leading-relaxed text-white/65">{line}</p>
            <div className="mt-10">{children}</div>
          </div>
        </Container>
      </section>
    </DarkPage>
  );
}
