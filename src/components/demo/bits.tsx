"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { EASE } from "./timeline";

/** A number that rolls to its value whenever the value changes. */
export function Rolling({
  value,
  format,
  duration = 1.1,
  className,
}: {
  value: number;
  format: (value: number) => string;
  duration?: number;
  className?: string;
}) {
  const count = useMotionValue(value);
  const text = useTransform(count, format);

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: EASE });
    return () => controls.stop();
  }, [count, value, duration]);

  return <motion.span className={className}>{text}</motion.span>;
}

export const formatInt = (value: number) =>
  Math.round(value).toLocaleString("en-US");

export const formatCompact = (value: number) =>
  `${(Math.round(value) / 1_000_000).toFixed(2)}M`;

export function formatClock(seconds: number) {
  const total = Math.round(seconds);
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${minutes}m ${total % 60}s`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

/** The pointer the film moves around. */
export function Cursor({
  x,
  y,
  pressed,
  visible,
}: {
  x: number;
  y: number;
  pressed: boolean;
  visible: boolean;
}) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 z-40"
      initial={false}
      animate={{ x, y, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <motion.div
        animate={{ scale: pressed ? 0.86 : 1 }}
        transition={{ duration: 0.16 }}
      >
        <svg
          viewBox="0 0 20 20"
          className="h-5 w-5 drop-shadow-[0_2px_4px_rgba(8,14,36,0.35)]"
        >
          <path
            d="M4 2.5 15.5 9.2l-4.7 1.1-2.3 4.6z"
            fill="white"
            stroke="#080e24"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
      <motion.span
        className="absolute -top-1 -left-1 block h-7 w-7 rounded-full border-2 border-brand-500"
        initial={false}
        animate={
          pressed ? { scale: [0.4, 1.5], opacity: [0.7, 0] } : { opacity: 0 }
        }
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </motion.div>
  );
}

/** Caption that fades in over the stage. */
export function Caption({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.p
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 8 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="text-center text-[15px] font-medium tracking-[-0.01em] text-ink-900/60"
    >
      {children}
    </motion.p>
  );
}
