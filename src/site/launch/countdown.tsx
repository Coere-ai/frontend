"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Fragment } from "react";

import { digitsOf, type TimeLeft } from "@/lib/launch/countdown";

export type CountdownSize = "lg" | "sm";

const UNITS = [
  { key: "days", label: "days" },
  { key: "hours", label: "hours" },
  { key: "minutes", label: "minutes" },
  { key: "seconds", label: "seconds" },
] as const;

const looks: Record<CountdownSize, { digits: string; label: string }> = {
  lg: { digits: "text-[56px] sm:text-[96px] md:text-[112px]", label: "mt-2 text-[12px] sm:text-[13px]" },
  sm: { digits: "text-[30px]", label: "mt-1 text-[10.5px]" },
};

// Each digit's window. The padding gives the roll room so no glyph is cut.
const cell = "relative inline-block overflow-hidden px-[0.01em] py-[0.08em]";

/**
 * One digit. When it changes only that digit rolls: the old one drops out
 * and the new one comes down into its place. With reduced motion it simply
 * changes.
 */
function RollingDigit({ digit }: { digit: string }) {
  const still = useReducedMotion();
  if (still) return <span className={cell}>{digit}</span>;
  return (
    <span className={`${cell} [mask-image:linear-gradient(to_bottom,transparent,#000_18%,#000_82%,transparent)]`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          className="block"
          initial={{ y: "-80%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "80%", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * The countdown as one line of tabular digits, 19:16:00:09, with a quiet
 * word under each part. `left` is null until the page knows the time on the
 * visitor's own clock. Until then the line is drawn at its full size but
 * hidden, so nothing moves when the numbers arrive. It takes its colour
 * from the page around it.
 */
export function Countdown({ left, size = "lg" }: { left: TimeLeft | null; size?: CountdownSize }) {
  const look = looks[size];
  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={left ? `${left.days} days, ${left.hours} hours, ${left.minutes} minutes and ${left.seconds} seconds left` : "Counting down"}
      className={`inline-flex items-start leading-none font-medium tracking-[-0.04em] tabular-nums ${left ? "" : "invisible"}`}
    >
      {UNITS.map((unit, i) => (
        <Fragment key={unit.key}>
          {i > 0 ? (
            <span aria-hidden="true" className={`${cell} ${look.digits}`}>
              :
            </span>
          ) : null}
          <span aria-hidden="true" className="flex flex-col items-center">
            <span className={`flex ${look.digits}`}>
              {digitsOf(left ? left[unit.key] : 0).map((digit, d, all) => (
                <RollingDigit key={all.length - d} digit={digit} />
              ))}
            </span>
            <span className={`font-normal tracking-normal opacity-50 ${look.label}`}>{unit.label}</span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}
