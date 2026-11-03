import type { ReactNode } from "react";

import { Container } from "@/site/ui/container";

/**
 * The frame of the sign in, sign up and connect pages: the site's page
 * header over one narrow column, centered so a single card reads as the
 * page's one task.
 */
export function AuthShell({ eyebrow, title, lede, children }: { eyebrow: string; title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <section className="pt-16 pb-24 md:pt-24">
      <Container>
        <div className="mx-auto max-w-[480px]">
          <p className="text-sm font-medium text-neutral-500">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-[3.25rem] md:leading-[1.05]">{title}</h1>
          {lede ? <p className="mt-5 text-lg leading-relaxed text-neutral-500 text-pretty">{lede}</p> : null}
          <div className="mt-10">{children}</div>
        </div>
      </Container>
    </section>
  );
}

/** The quiet button under a form's main one, for the other ways through it. */
export const textButtonClass =
  "group rounded-md text-[14px] text-neutral-500 transition-colors hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950";

/** The line a form shows its error or notice in, read out as it changes. */
export function FormStatus({ error, notice }: { error: string | null; notice?: string | null }) {
  return (
    <p role="status" aria-live="polite" className={`min-h-5 text-[13px] ${error ? "text-red-600" : "text-neutral-500"}`}>
      {error ?? notice ?? ""}
    </p>
  );
}
