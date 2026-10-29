"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Stage } from "@/site/blocks/stage";
import { backgrounds } from "@/site/content/backgrounds";
import { features, type Feature } from "@/site/content/features";
import { films } from "@/site/content/films";
import { Container } from "@/site/ui/container";
import { FilmFrame } from "@/site/ui/film-frame";

/** The address of one feature in this section, as the products menu links to it. */
const HASH = "#capability-";

/**
 * Capabilities: every feature of Coere's worker, one at a time. Pick one on
 * the left and it plays live on the right, on Coere's real code. Each has
 * its own address (#capability-<slug>), so the products menu opens the
 * page on that feature.
 */
export function Capabilities() {
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState<Feature>(features[0]);

  // Open the feature the address names, now and whenever it changes.
  useEffect(() => {
    const follow = () => {
      if (!location.hash.startsWith(HASH) && location.hash !== "#capabilities") return;
      const picked = features.find((f) => `${HASH}${f.slug}` === location.hash);
      if (picked) setActive(picked);
      // After the router's own scroll on arrival, so the section is where the page rests.
      requestAnimationFrame(() => section.current?.scrollIntoView({ block: "start" }));
    };
    follow();
    addEventListener("hashchange", follow);
    return () => removeEventListener("hashchange", follow);
  }, []);

  const pick = (feature: Feature) => {
    setActive(feature);
    history.replaceState(null, "", `${HASH}${feature.slug}`);
  };

  return (
    <section id="capabilities" ref={section} className="scroll-mt-[73px] bg-neutral-950 py-28 text-white md:py-32">
      {/* An anchor per feature, so a link from the menu lands here even before this script runs. */}
      {features.map((f) => (
        <span key={f.slug} id={`capability-${f.slug}`} aria-hidden="true" className="block scroll-mt-[73px]" />
      ))}
      <Container>
        <div className="max-w-3xl">
          <p className="text-[15px] font-medium text-white/60">Capabilities</p>
          <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-balance md:text-5xl md:leading-[1.05]">Everything one worker can do</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">Pick a capability to watch it run, live on Coere&apos;s real code.</p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] lg:gap-14">
          <ul
            role="tablist"
            aria-label="Capabilities"
            aria-orientation="vertical"
            className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0"
            onKeyDown={(e) => {
              const at = features.indexOf(active);
              if (e.key === "ArrowDown" || e.key === "ArrowRight") pick(features[(at + 1) % features.length]);
              if (e.key === "ArrowUp" || e.key === "ArrowLeft") pick(features[(at - 1 + features.length) % features.length]);
            }}
          >
            {features.map((feature, i) => {
              const on = feature.slug === active.slug;
              return (
                <li key={feature.slug} className="shrink-0 lg:border-t lg:border-white/10 lg:last:border-b">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={on}
                    tabIndex={on ? 0 : -1}
                    onClick={() => pick(feature)}
                    className={`relative block w-full rounded-full px-4 py-2 text-left transition-colors lg:rounded-none lg:px-0 lg:py-4 ${on ? "bg-white text-neutral-950 lg:bg-transparent lg:text-white" : "text-white/50 hover:text-white"}`}
                  >
                    {/* The picked one carries a rule of light along its top. */}
                    <span aria-hidden="true" className={`absolute -top-px left-0 hidden h-px bg-gradient-to-r from-brand-400 to-brand-500 transition-all duration-500 lg:block ${on ? "w-full" : "w-0"}`} />
                    <span className="flex items-baseline gap-4">
                      <span className="hidden w-6 text-[12px] text-white/35 tabular-nums lg:inline">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[15px] font-medium lg:text-[20px] lg:tracking-[-0.02em]">{feature.name}</span>
                    </span>
                    <AnimatePresence initial={false}>
                      {on ? (
                        <motion.span
                          key="more"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="hidden overflow-hidden pl-10 lg:block"
                        >
                          <span className="block pt-2 text-[15px] font-medium text-white/90">{feature.title}</span>
                          <span className="block pt-1.5 text-[14px] leading-relaxed text-white/55">{feature.description}</span>
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <Stage background={backgrounds.prism} className="aspect-[16/11]">
              <div aria-hidden="true" className="absolute inset-0 bg-neutral-950/25" />
              <AnimatePresence initial={false}>
                <motion.div
                  key={active.slug}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 grid place-items-center p-[6%]"
                >
                  <FilmFrame film={films[active.film]} preview className="rounded-xl shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] ring-1 ring-white/15" />
                </motion.div>
              </AnimatePresence>
            </Stage>
            <p className="mt-4 text-[14px] text-white/55 lg:hidden">{active.description}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
