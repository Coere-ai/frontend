"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { digitsOf, type TimeLeft } from "@/lib/launch/countdown";

export type CountdownSize = "lg" | "md";

const UNITS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
] as const;

const looks: Record<CountdownSize, { grid: string; tile: string; digits: string; label: string }> = {
  lg: {
    grid: "max-w-[920px] gap-2 sm:gap-4 md:gap-5",
    tile: "rounded-[20px] px-1 pt-5 pb-4 sm:rounded-[28px] sm:pt-8 sm:pb-6 md:pt-10 md:pb-7",
    digits: "text-[44px] sm:text-7xl md:text-[112px]",
    label: "mt-3 text-[12px] sm:mt-4 sm:text-[14px]",
  },
  md: {
    grid: "max-w-[520px] gap-2 sm:gap-3",
    tile: "rounded-2xl px-1 pt-4 pb-3",
    digits: "text-[34px] sm:text-[46px]",
    label: "mt-2 text-[11px] sm:text-[12px]",
  },
};

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * One digit in its own window. When it changes, only that digit rolls: the
 * old one drops away and the new one comes down from above into its place,
 * the way a countdown runs. With reduced motion it simply changes.
 */
function RollingDigit({ digit }: { digit: string }) {
  const still = useReducedMotion();
  return (
    <span className="relative inline-block overflow-hidden px-[0.02em] py-[0.1em] [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)]">
      {still ? (
        <span className="block">{digit}</span>
      ) : (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={digit}
            className="block"
            initial={{ y: "-72%", opacity: 0, filter: "blur(3px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "72%", opacity: 0, filter: "blur(3px)" }}
            transition={{ duration: 0.55, ease }}
          >
            {digit}
          </motion.span>
        </AnimatePresence>
      )}
    </span>
  );
}

/**
 * The countdown's four tiles: days, hours, minutes and seconds in big
 * tabular digits. `left` is null until the page knows the time on the
 * visitor's own clock; until then each tile holds a calm block the size of
 * its digits, so nothing moves when the numbers arrive.
 */
export function CountdownTiles({ left, size = "lg" }: { left: TimeLeft | null; size?: CountdownSize }) {
  const look = looks[size];
  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={left ? `${left.days} days, ${left.hours} hours, ${left.minutes} minutes and ${left.seconds} seconds left` : "Counting down"}
      className={`mx-auto grid grid-cols-4 ${look.grid}`}
    >
      {UNITS.map((unit) => {
        const value = left ? left[unit.key] : null;
        return (
          <div
            key={unit.key}
            className={`relative overflow-hidden border border-neutral-200/80 bg-gradient-to-b from-white to-neutral-50 text-center shadow-[0_1px_0_#fff_inset,0_30px_60px_-36px_rgba(8,14,36,0.28)] ${look.tile}`}
          >
            {/* The fold across the middle, as on a flip clock. */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[46%] h-px bg-neutral-950/[0.045]" />
            <div aria-hidden="true" className={`flex justify-center leading-none font-medium tracking-[-0.05em] text-neutral-950 tabular-nums ${look.digits}`}>
              {value === null ? (
                <span className="relative inline-block px-[0.02em] py-[0.1em]">
                  <span className="invisible">00</span>
                  <span className="absolute inset-x-[0.06em] inset-y-[0.18em] animate-pulse rounded-[0.12em] bg-neutral-100 motion-reduce:animate-none" />
                </span>
              ) : (
                digitsOf(value).map((digit, i, all) => <RollingDigit key={all.length - i} digit={digit} />)
              )}
            </div>
            <p className={`font-medium text-neutral-500 ${look.label}`}>{unit.label}</p>
          </div>
        );
      })}
    </div>
  );
}
