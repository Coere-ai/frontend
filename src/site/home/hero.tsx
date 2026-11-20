"use client";

import { motion } from "motion/react";
import { startHref } from "@/site/content/navigation";
import { useMessages } from "@/site/i18n/client";
import { UNDER_NAV } from "@/site/nav/nav-space";
import { Container } from "@/site/ui/container";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { SoftLink } from "@/site/ui/soft-button";
import { LearnMore } from "./hero/learn-more";
import { HERO_INK, HeroBackdrop } from "./hero/hero-backdrop";
import { HeroStack } from "./hero/hero-stack";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The owner's heading in the page's language, split round the word in
 * [brackets], which shimmers: "Accelerating" in English, wherever the verb
 * falls in another language.
 */
function Heading({ title }: { title: string }) {
  const [before, shimmer, after] = title.split(/\[|\]/);
  if (shimmer === undefined) return title;
  return (
    <>
      {before}
      <span className="coere-shimmer">{shimmer}</span>
      {after}
    </>
  );
}

/** Fades a piece of the hero up into place, each a beat after the last. */
function Rise({ delay, className, children }: { delay: number; className?: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay, ease }} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * The home page's opening, dark in the style of Coere Solutions and laid
 * out as Gamma's was: the heading, the paragraph and the two buttons on
 * the left, and on the right three tall tiles that run from the hero's top
 * edge to its foot (Coere saving chats, the dashboard, the memory graph).
 * It runs up under the glass navbar, which turns dark over it, on React
 * Bits MicroSlats in Coere blue. On a phone the words come first with the
 * dashboard under them.
 */
export function Hero() {
  const t = useMessages("home").hero;
  const nav = useMessages("chrome").nav;
  return (
    <section id="hero" data-nav-tone="dark" className={`relative isolate overflow-hidden text-white ${UNDER_NAV}`} style={{ background: HERO_INK }}>
      <HeroBackdrop />
      <Container className="grid min-h-[max(720px,min(100svh,980px))] gap-12 pb-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10 lg:pb-0 xl:gap-14">
        <div className="max-w-[600px] self-center pt-[120px] md:pt-[136px] lg:py-[128px]">
          <Rise delay={0.05}>
            <h1 className="text-[clamp(2.6rem,6.2vw,3.4rem)] leading-[1.02] font-bold tracking-[-0.045em] text-balance lg:text-[clamp(3.1rem,4.4vw,4.35rem)] lg:leading-[0.98]">
              <Heading title={t.title} />
            </h1>
          </Rise>
          <Rise delay={0.18}>
            <p className="mt-6 text-[16px] leading-[1.65] text-white/72 text-pretty md:text-[17px]">{t.paragraph}</p>
          </Rise>
          <Rise delay={0.3} className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <SoftLink href={startHref} size="lg" className="group">
              {nav.start}
              <ArrowRightIcon size={17} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
            </SoftLink>
            <LearnMore />
          </Rise>
        </div>
        <HeroStack />
      </Container>
    </section>
  );
}
