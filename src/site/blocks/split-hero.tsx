import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { CheckList } from "./check-list";
import { LaserShowcase } from "./laser-showcase";

export type HeroLink = { href: string; label: string };

/**
 * A page's opening, in the light and airy style the redesign set: a big
 * bold heading, one line and the buttons on the left, the product on the
 * right, over a backdrop that fills the section. `laser` drops LaserFlow's
 * beam onto the app, for the heroes that show the dashboard. `framed` sets
 * the app in a white rounded frame; `contained` shows it as it is, for a
 * code window or cards that carry their own frame. `dark` is for a backdrop
 * on near black, with light words and buttons.
 */
export function SplitHero({
  eyebrow,
  title,
  line,
  checks,
  primary,
  secondary,
  app,
  appFit = "framed",
  backdrop,
  laser = false,
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  line: string;
  checks?: string[];
  primary: HeroLink;
  secondary?: HeroLink;
  app: ReactNode;
  appFit?: "framed" | "contained";
  backdrop?: ReactNode;
  laser?: boolean;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const framed = appFit === "framed";
  const plainFrame = framed ? (dark ? "overflow-hidden rounded-2xl bg-white ring-1 ring-white/15 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]" : "overflow-hidden rounded-2xl bg-white shadow-[0_40px_100px_-40px_rgba(20,17,15,0.45),0_0_0_1px_rgba(20,17,15,0.06)]") : "";
  return (
    <section className={`relative isolate overflow-hidden ${dark ? "bg-[#0b0a12] text-white" : "bg-white text-neutral-950"}`}>
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {backdrop}
      </div>
      <div className="mx-auto grid min-h-[min(calc(100svh-73px),920px)] max-w-[1440px] items-center gap-14 px-6 pt-14 pb-20 md:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-20">
        <div className="max-w-[640px]">
          {eyebrow ? (
            <p className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium ring-1 backdrop-blur-md ${dark ? "bg-white/10 text-white ring-white/15" : "bg-white/70 text-brand-700 ring-brand-500/15"}`}>
              <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-brand-300" : "bg-brand-500"}`} />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-6 text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-6xl xl:text-[4.5rem]">{title}</h1>
          <p className={`mt-6 max-w-xl text-lg leading-relaxed text-pretty md:text-[19px] ${dark ? "text-white/75" : "text-neutral-600"}`}>{line}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <HeroButton link={primary} kind="primary" dark={dark} />
            {secondary ? <HeroButton link={secondary} kind="secondary" dark={dark} /> : null}
          </div>
          {checks?.length ? <CheckList items={checks} tone={dark ? "light" : "dark"} className="mt-10 max-w-xl" /> : null}
        </div>
        <div className={`min-w-0 ${laser ? "max-lg:pt-8" : ""}`}>{laser ? <LaserShowcase framed={framed} tone={tone}>{app}</LaserShowcase> : <div className={plainFrame}>{app}</div>}</div>
      </div>
    </section>
  );
}

/** The hero's two buttons: Coere blue for the way in, a quiet glass one beside it. */
function HeroButton({ link, kind, dark }: { link: HeroLink; kind: "primary" | "secondary"; dark: boolean }) {
  const look =
    kind === "primary"
      ? "bg-brand-500 text-white shadow-[0_12px_30px_-12px_rgba(82,103,247,0.9)] hover:bg-brand-600 focus-visible:outline-brand-500"
      : dark
        ? "bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md hover:bg-white/15 focus-visible:outline-white"
        : "bg-white/75 text-neutral-950 ring-1 ring-neutral-950/10 backdrop-blur-md hover:bg-white focus-visible:outline-neutral-950";
  const className = `group inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${look}`;
  const inside = (
    <>
      {link.label}
      {kind === "secondary" ? <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" /> : null}
    </>
  );
  // Internal paths and anchors use Next's Link; mailto and outside addresses a plain anchor.
  return link.href.startsWith("/") || link.href.startsWith("#") ? (
    <Link href={link.href} className={className}>
      {inside}
    </Link>
  ) : (
    <a href={link.href} className={className}>
      {inside}
    </a>
  );
}
