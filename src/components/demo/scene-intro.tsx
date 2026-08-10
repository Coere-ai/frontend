"use client";

import { motion } from "motion/react";
import { LogoMark } from "@/components/logo";
import { Orbit } from "@/components/orbit";
import { EASE, EASE_HERO } from "./timeline";
import type { DemoClock } from "./use-demo-clock";

/** Act 1: the mark, the name, and every model circling it. */
export function SceneIntro({ clock }: { clock: DemoClock }) {
  const leaving = clock.at("intro-out");

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={false}
      animate={{
        opacity: leaving ? 0 : 1,
        scale: leaving ? 1.06 : 1,
        filter: leaving ? "blur(14px)" : "blur(0px)",
      }}
      transition={{ duration: 1, ease: EASE }}
    >
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: 18, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: EASE_HERO, delay: 0.15 }}
      >
        <LogoMark className="h-[54px] w-[54px] text-brand-500" />
        <h1 className="text-[46px] leading-none font-semibold tracking-[-0.04em] text-ink-900">
          Coere
          <span className="px-3 text-ink-900">-</span>
          <span className="text-brand-600">Unified Memory for AI</span>
        </h1>
      </motion.div>

      <motion.div
        className="mt-6 w-[440px]"
        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.6, ease: EASE_HERO, delay: 0.5 }}
      >
        {/* faster than the site's, so the ring reads as moving in six seconds */}
        <Orbit duration={22} />
      </motion.div>
    </motion.div>
  );
}
