"use client";

import { motion, type MotionValue } from "motion/react";
import { useRamp } from "./ramp";

/**
 * One line of the story. It fades in as its beat begins and out as the next
 * one does. The first beat starts visible and the last one stays.
 */
export function StoryStep({
  index,
  total,
  title,
  text,
  progress,
}: {
  index: number;
  total: number;
  title: string;
  text: string;
  progress: MotionValue<number>;
}) {
  const span = 1 / total;
  const start = index * span;
  const end = start + span;
  const first = index === 0;
  const last = index === total - 1;
  const opacity = useRamp(progress, [start - 0.04, start + 0.02, end - 0.04, end + 0.02], [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const y = useRamp(progress, [start - 0.04, start + 0.02], [first ? 0 : 16, 0]);

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 top-1/2 -translate-y-1/2">
      <p className="text-sm font-medium text-brand-500">
        {String(index + 1).padStart(2, "0")} of {String(total).padStart(2, "0")}
      </p>
      <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-6xl md:leading-[1.02]">{title}</h2>
      <p className="mt-6 max-w-md text-lg leading-relaxed text-neutral-500">{text}</p>
    </motion.div>
  );
}
