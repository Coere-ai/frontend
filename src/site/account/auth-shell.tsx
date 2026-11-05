import type { ReactNode } from "react";

/**
 * The frame of the sign in, sign up and connect pages: the page's one task
 * on the white page under the navbar, with no brand panel, photo or tint
 * beside it.
 */
export function AuthShell({ eyebrow, title, lede, children }: { eyebrow: string; title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex justify-center bg-white px-4 pt-16 pb-24 sm:px-6 lg:min-h-[calc(100dvh-72px)] lg:items-center lg:py-20">
      <div className="w-full max-w-[440px]">
        <p className="text-sm font-medium text-neutral-500">{eyebrow}</p>
        <h1 className="mt-3 text-[2rem] leading-[1.1] font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-[2.5rem]">{title}</h1>
        {lede ? <p className="mt-4 text-[17px] leading-relaxed text-neutral-500 text-pretty">{lede}</p> : null}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

/** The quiet button under a form's main one, for the other ways through it. */
export const textButtonClass =
  "group rounded-md text-[14px] text-neutral-500 transition-colors hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950";

/**
 * The line a form shows its error or notice in, read out as it changes. It
 * closes up while empty, taking back the card's gap above it, and stays in
 * the page so screen readers keep listening to it.
 */
export function FormStatus({ error, notice }: { error: string | null; notice?: string | null }) {
  return (
    <p role="status" aria-live="polite" className={`min-h-5 text-[13px] empty:-mt-6 empty:min-h-0 ${error ? "text-red-600" : "text-neutral-500"}`}>
      {error ?? notice ?? ""}
    </p>
  );
}
