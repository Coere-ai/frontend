import type { ReactNode } from "react";
import { ArrowLink } from "@/site/ui/arrow-link";
import { CheckList } from "./check-list";

/**
 * A page's opening on the white page: the name, a line and what it does on
 * the left, and the app itself on the right, whole in a thin frame, both in
 * the middle of the screen's height. No photo, tint or scrim sits behind
 * it, so the page opens plain and calm. `contained` shows the app with no
 * frame, for code that must be read, and `centered` puts the words above
 * the app, both in the middle, with the app whole below them.
 */
export function PhotoHero({
  eyebrow,
  title,
  line,
  checks,
  primary,
  secondary,
  app,
  appFit = "framed",
}: {
  eyebrow?: string;
  title: string;
  line: string;
  checks: string[];
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  app: ReactNode;
  appFit?: "framed" | "contained" | "centered";
}) {
  const actions = (
    <div className={`mt-10 flex flex-wrap items-center gap-6 ${appFit === "centered" ? "justify-center" : ""}`}>
      <a href={primary.href} className="inline-flex h-12 items-center rounded-full bg-neutral-950 px-6 text-[16px] font-medium text-white transition-colors hover:bg-neutral-800">
        {primary.label}
      </a>
      {secondary ? (
        <ArrowLink href={secondary.href} className="text-neutral-950">
          {secondary.label}
        </ArrowLink>
      ) : null}
    </div>
  );

  if (appFit === "centered") {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-6 pt-16 pb-20 text-center md:px-10 md:pt-20 md:pb-24">
          {eyebrow ? <p className="text-[15px] font-medium text-neutral-500">{eyebrow}</p> : null}
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-6xl md:leading-[1.02]">{title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">{line}</p>
          <CheckList items={checks} row className="mt-7" />
          {actions}
          <div className="mx-auto mt-14 max-w-[1080px] overflow-hidden rounded-2xl text-left ring-1 ring-neutral-200">{app}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white">
      <div className="mx-auto grid min-h-[calc(100svh-73px)] max-w-[1440px] gap-12 px-6 py-20 md:px-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        {/* The words and the app both sit in the middle of the screen's height, the app whole in its frame. */}
        <div className="self-center">
          {eyebrow ? <p className="text-[15px] font-medium text-neutral-500">{eyebrow}</p> : null}
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-6xl md:leading-[1.02]">{title}</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-neutral-600">{line}</p>
          <CheckList items={checks} className="mt-7" />
          {actions}
        </div>
        {appFit === "framed" ? (
          <div className="self-center">
            <div className="overflow-hidden rounded-2xl ring-1 ring-neutral-200">{app}</div>
          </div>
        ) : (
          <div className="self-center">{app}</div>
        )}
      </div>
    </section>
  );
}
