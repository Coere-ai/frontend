"use client";

import { useState } from "react";
import { solves, type Side, type SideWords } from "@/site/content/solves";
import { ArrowLink } from "@/site/ui/arrow-link";
import { Container } from "@/site/ui/container";
import { PillTabs, tabId } from "@/site/ui/pill-tabs";
import { SceneRow } from "./solves/scene-row";
import { Swap } from "./solves/swap";

const { today, coere: withCoere } = solves.sides;
const SWITCH = "solves-side";

/**
 * What Coere solves, right under the film: the three ways AI loses what
 * it knows about a person, each a small drawing that plays in turn, with
 * a switch to see the same three with Coere in their place. The intro,
 * each scene's words, the developers' line and the link at the end follow
 * the switch, which starts without Coere. Coere Connect follows with its
 * own way in, so this part does not repeat it.
 */
export function SolvesSection() {
  const [side, setSide] = useState<Side>("today");
  const coere = side === "coere";
  return (
    <section id="solves" className="scroll-mt-24 border-t border-neutral-100 py-28 md:py-36">
      <Container>
        {/*
          The section's name stays put, and the two intros share one place under it, from its top, so the
          switch under them never moves. Without Coere's title is set narrower so it takes two lines, as
          With Coere's does.
        */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[15px] font-medium text-brand-500">{solves.eyebrow}</p>
          <Swap block coere={coere} className="mt-3" today={<Intro words={today} narrow />} withCoere={<Intro words={withCoere} />} />
        </div>

        <PillTabs
          label={solves.switchLabel}
          id={SWITCH}
          className="mt-10"
          picked={side}
          onPick={setSide}
          tabs={[
            { key: "today", label: today.tab },
            { key: "coere", label: withCoere.tab },
          ]}
        />

        <div id={`${SWITCH}-panel`} role="tabpanel" aria-labelledby={tabId(SWITCH, side)} className="mt-14 md:mt-16">
          <SceneRow coere={coere} />
          <p className="mx-auto mt-16 max-w-2xl text-center text-[17px] leading-relaxed text-neutral-500 text-balance md:mt-20">
            <Swap
              coere={coere}
              today={<DeveloperLine text={today.developers} />}
              withCoere={<DeveloperLine text={withCoere.developers} />}
            />
          </p>
          <div className="mt-8 flex justify-center">
            <Swap
              coere={coere}
              className="justify-items-center"
              today={<ArrowLink href="/developers/waitlist">{today.waitlist}</ArrowLink>}
              withCoere={<ArrowLink href="/developers/waitlist">{withCoere.waitlist}</ArrowLink>}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

/** A side's title and line, set as every part of the home page opens. `narrow` sets a short title on two lines from md up. */
function Intro({ words, narrow = false }: { words: SideWords; narrow?: boolean }) {
  return (
    <div>
      <h2 className={`mx-auto text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-[3.5rem] md:leading-[1.04] ${narrow ? "md:max-w-md" : ""}`}>{words.title}</h2>
      <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600 text-balance">{words.line}</p>
    </div>
  );
}

/** The developers' side in a line, its first words darker. */
function DeveloperLine({ text }: { text: { lead: string; rest: string } }) {
  return (
    <>
      <span className="text-neutral-950">{text.lead}</span> {text.rest}
    </>
  );
}
