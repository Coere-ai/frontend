"use client";

import { motion } from "motion/react";
import { LogoMark } from "@/components/logo";
import { EASE_HERO } from "./timeline";
import type { DemoClock } from "./use-demo-clock";

/** Act 5: the line, over the blurred wall of transfers. */
export function SceneOutro({ clock }: { clock: DemoClock }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <motion.div
        className="relative"
        initial={false}
        animate={{
          opacity: clock.at("outro-line") ? 1 : 0,
          scale: clock.at("outro-line") ? 1 : 0.8,
          filter: clock.at("outro-line") ? "blur(0px)" : "blur(14px)",
        }}
        transition={{ duration: 1.2, ease: EASE_HERO }}
      >
        <LogoMark className="h-[62px] w-[62px] text-brand-500" />
      </motion.div>

      <motion.h2
        className="relative mt-8 text-[46px] leading-[1.08] font-semibold tracking-[-0.04em] text-ink-900"
        initial={false}
        animate={{
          opacity: clock.at("outro-line") ? 1 : 0,
          y: clock.at("outro-line") ? 0 : 16,
          filter: clock.at("outro-line") ? "blur(0px)" : "blur(10px)",
        }}
        transition={{ duration: 1.1, ease: EASE_HERO, delay: 0.15 }}
      >
        Stop rewriting context, use Coere
      </motion.h2>
    </div>
  );
}
