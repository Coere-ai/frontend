"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import LaserFlow from "@/site/bits/LaserFlow";
import { MockDashboard } from "./mock-dashboard";
import { MockExtract } from "./mock-extract";
import { MockGraph } from "./mock-graph";
import { ScaleBox } from "./scale-box";

const ease = [0.22, 1, 0.36, 1] as const;

/** The stack's design size; it scales to its column. */
const W = 720;
const H = 700;
/**
 * Where the beam falls, as a share of the column's width: on the dashboard's
 * top edge, clear of the card above it. The light theme draws only a
 * colour's saturation, so the beam uses a purer cousin of Coere blue to
 * read on white.
 */
const BEAM_AT = 0.67;

/** A card rising into place in turn, then drifting a little, as Gamma's pictures do. */
function Card({ delay, drift, className, children }: { delay: number; drift?: "up" | "down"; className: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay, ease }} className={`absolute ${className}`}>
      <div className={drift === "up" ? "animate-[coere-drift_9s_ease-in-out_infinite]" : drift === "down" ? "animate-[coere-drift_11s_ease-in-out_infinite_reverse]" : ""}>{children}</div>
    </motion.div>
  );
}

/**
 * The hero's three pictures, stacked and overlapping: Extract all on top,
 * the dashboard in the middle and largest, the memory graph below. A beam of
 * Coere blue (LaserFlow) falls from above the page onto the dashboard and
 * spills along its edge. Below lg only the dashboard shows, under the text.
 */
export function HeroStack() {
  const dashboard = useRef<HTMLDivElement>(null);
  return (
    <>
      <div className="relative hidden lg:block">
        {/* The beam runs from above the hero down to the dashboard, behind the cards. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-[340px] bottom-0">
          <LaserFlow
            surfaceRef={dashboard}
            beamPosition={BEAM_AT}
            theme="light"
            color="#2a40ff"
            intensity={2.4}
            beamWidth={2.1}
            flare={2.4}
            spread={1.6}
            spill={1.8}
            fog={0.12}
            dust={0.9}
            streaks={1}
            dots={0.6}
            pulse={1}
            speed={0.9}
            mouseInteraction={false}
            intro={false}
          />
        </div>
        <ScaleBox width={W} height={H}>
          <Card delay={0.35} className="top-[165px] left-[80px] w-[600px]">
            <MockDashboard ref={dashboard} />
          </Card>
          <Card delay={0.2} drift="up" className="top-0 left-0 w-[270px]">
            <MockExtract />
          </Card>
          <Card delay={0.5} drift="down" className="top-[476px] right-0 w-[280px]">
            <MockGraph />
          </Card>
        </ScaleBox>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease }} className="lg:hidden">
        <ScaleBox width={PHONE.width} height={PHONE.height}>
          <MockDashboard compact />
        </ScaleBox>
      </motion.div>
    </>
  );
}

/** The phone's drawing of the dashboard, without its side menu, and its height at that width. */
const PHONE = { width: 460, height: 364 };
