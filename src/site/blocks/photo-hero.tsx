import type { ReactNode } from "react";
import { ArrowLink } from "@/site/ui/arrow-link";
import { SizedPhoto } from "@/site/ui/sized-photo";
import { CheckList } from "./check-list";

/**
 * A page opening on a full photo: the name, a line and what it does over
 * the photo on the left, and the app itself on the right, running off the
 * edge of the screen as if the window were set down on the scene.
 * `contained` keeps the app whole instead, for code that must be read, and
 * `centered` puts the words above the app, both in the middle, with the
 * app whole below them.
 */
export function PhotoHero({
  photo,
  alt = "",
  eyebrow,
  title,
  line,
  checks,
  primary,
  secondary,
  app,
  appFit = "bleed",
}: {
  photo: string;
  alt?: string;
  eyebrow?: string;
  title: string;
  line: string;
  checks: string[];
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  app: ReactNode;
  appFit?: "bleed" | "contained" | "centered";
}) {
  const actions = (
    <div className={`mt-10 flex flex-wrap items-center gap-6 ${appFit === "centered" ? "justify-center" : ""}`}>
      <a href={primary.href} className="inline-flex h-12 items-center rounded-full bg-white px-6 text-[16px] font-medium text-neutral-950">
        {primary.label}
      </a>
      {secondary ? (
        <ArrowLink href={secondary.href} className="text-white">
          {secondary.label}
        </ArrowLink>
      ) : null}
    </div>
  );

  if (appFit === "centered") {
    return (
      <section className="relative isolate overflow-hidden bg-neutral-950">
        <SizedPhoto src={photo} alt={alt} fill priority sizes="100vw" className="-z-20 object-cover" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-950/75 via-neutral-950/45 to-neutral-950/25" />
        <div className="mx-auto max-w-[1200px] px-6 pt-16 pb-20 text-center text-white md:px-10 md:pt-20 md:pb-24">
          {eyebrow ? <p className="text-[15px] font-medium text-white/80">{eyebrow}</p> : null}
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-balance md:text-6xl md:leading-[1.02]">{title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/90">{line}</p>
          <CheckList items={checks} tone="light" row className="mt-7" />
          {actions}
          <div className="mx-auto mt-14 max-w-[1080px] overflow-hidden rounded-2xl text-left shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/15">{app}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden bg-neutral-950">
      <SizedPhoto src={photo} alt={alt} fill priority sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-neutral-950/75 via-neutral-950/35 to-neutral-950/10" />
      <div className={`mx-auto grid min-h-[calc(100svh-73px)] max-w-[1440px] gap-12 px-6 md:px-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] ${appFit === "bleed" ? "pt-20" : "py-20"}`}>
        {/* The words always sit in the middle of the screen's height; a bleeding app still rests on the bottom edge. */}
        <div className="self-center text-white">
          {eyebrow ? <p className="text-[15px] font-medium text-white/80">{eyebrow}</p> : null}
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-balance md:text-6xl md:leading-[1.02]">{title}</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/90">{line}</p>
          <CheckList items={checks} tone="light" className="mt-7" />
          {actions}
        </div>
        {appFit === "bleed" ? (
          <div className="self-end lg:-mr-[12vw] lg:translate-y-6 lg:pt-20">
            <div className="overflow-hidden rounded-t-2xl shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/15">{app}</div>
          </div>
        ) : (
          <div className="self-center">{app}</div>
        )}
      </div>
    </section>
  );
}
