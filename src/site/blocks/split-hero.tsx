import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { UNDER_NAV } from "@/site/nav/nav-space";
import { CheckList } from "./check-list";
import { LaserShowcase } from "./laser-showcase";

export type HeroLink = { href: string; label: string };

/**
 * The opt in intro, timed as the home hero's: the heading, the line, the
 * buttons and the checks rise out of a soft blur a beat apart, then the
 * app rises in as the home tiles do. Plain CSS, so it plays from the first
 * paint; `backwards` holds the start through each delay and leaves no
 * filter behind once done, and under reduced motion nothing moves.
 */
const INTRO = {
  title: "motion-safe:animate-[coere-rise_0.8s_cubic-bezier(0.22,1,0.36,1)_50ms_backwards]",
  line: "motion-safe:animate-[coere-rise_0.8s_cubic-bezier(0.22,1,0.36,1)_180ms_backwards]",
  buttons: "motion-safe:animate-[coere-rise_0.8s_cubic-bezier(0.22,1,0.36,1)_300ms_backwards]",
  checks: "motion-safe:animate-[coere-rise_0.8s_cubic-bezier(0.22,1,0.36,1)_420ms_backwards]",
  app: "motion-safe:animate-[coere-tile-in_1.1s_cubic-bezier(0.22,1,0.36,1)_520ms_backwards]",
};

/**
 * A page's opening, in the light and airy style the redesign set: a big
 * bold heading, one line and the buttons on the left, the product on the
 * right, over a backdrop that fills the section. `laser` drops LaserFlow's
 * beam onto the app, kept for the dark heroes (Solutions and Forge). `framed` sets
 * the app in a white rounded frame; `contained` shows it as it is, for a
 * code window or cards that carry their own frame. `dark` is for a backdrop
 * on near black, with light words and buttons. `intro` plays the home
 * hero's entrance (see INTRO); other pages open still. It runs up under
 * the floating glass navbar, so the glass bends the backdrop from the start.
 */
export function SplitHero({
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
  intro = false,
}: {
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
  intro?: boolean;
}) {
  const enter = (part: keyof typeof INTRO) => (intro ? ` ${INTRO[part]}` : "");
  const dark = tone === "dark";
  const framed = appFit === "framed";
  const plainFrame = framed ? (dark ? "overflow-hidden rounded-2xl bg-white ring-1 ring-white/15 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]" : "overflow-hidden rounded-2xl bg-white shadow-[0_40px_100px_-40px_rgba(20,17,15,0.45),0_0_0_1px_rgba(20,17,15,0.06)]") : "";
  return (
    <section data-nav-tone={dark ? "dark" : undefined} className={`relative isolate overflow-hidden ${UNDER_NAV} ${dark ? "bg-[#0b0a12] text-white" : "bg-white text-neutral-950"}`}>
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {backdrop}
        {/* A dark hero's backdrop fades into the page's near black at its foot, so the next section follows with no hard edge. */}
        {dark ? <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_bottom,rgba(11,10,18,0),#0b0a12)] md:h-56" /> : null}
      </div>
      <div className="mx-auto grid min-h-[min(100svh,992px)] max-w-[1440px] items-center gap-14 px-6 pt-[128px] pb-20 md:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:pt-[152px] lg:pb-20">
        <div className="max-w-[640px]">
          <h1 className={`text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-6xl xl:text-[4.5rem]${enter("title")}`}>{title}</h1>
          <p className={`mt-6 max-w-xl text-lg leading-relaxed text-pretty md:text-[19px] ${dark ? "text-white/75" : "text-neutral-600"}${enter("line")}`}>{line}</p>
          <div className={`mt-9 flex flex-wrap items-center gap-3${enter("buttons")}`}>
            <HeroButton link={primary} kind="primary" dark={dark} />
            {secondary ? <HeroButton link={secondary} kind="secondary" dark={dark} /> : null}
          </div>
          {checks?.length ? <CheckList items={checks} tone={dark ? "light" : "dark"} className={`mt-10 max-w-xl${enter("checks")}`} /> : null}
        </div>
        {/* The app keeps its own look on a dark page: it is product, not page. */}
        <div data-theme="light" className={`min-w-0 ${laser ? "max-lg:pt-8" : ""}${enter("app")}`}>{laser ? <LaserShowcase framed={framed} tone={tone}>{app}</LaserShowcase> : <div className={plainFrame}>{app}</div>}</div>
      </div>
    </section>
  );
}

/** The hero's two buttons: Coere blue for the way in, a quiet glass one beside it. */
function HeroButton({ link, kind, dark }: { link: HeroLink; kind: "primary" | "secondary"; dark: boolean }) {
  const look =
    kind === "primary"
      ? "bg-brand-500 text-white shadow-[0_6px_14px_-8px_rgba(82,103,247,0.45)] hover:bg-brand-600 focus-visible:outline-brand-500"
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
