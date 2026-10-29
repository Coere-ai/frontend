"use client";

import { motion, type MotionValue } from "motion/react";
import { useRamp, useRampPercent } from "./ramp";
import { BEATS, PIECE_COLORS, scatterAt } from "./story-data";

/** The gathered circle's diameter, in percent of the stage. */
const CIRCLE = 34;
/** How small a piece is while it sits inside its app. */
const SMALL = 0.3;

/** An SVG path for one slice of the circle, in a -1 to 1 box. */
function slicePath(index: number, count: number): string {
  const step = (Math.PI * 2) / count;
  const a0 = index * step - Math.PI / 2;
  const a1 = a0 + step;
  const point = (a: number) => `${(Math.cos(a) * 0.98).toFixed(4)} ${(Math.sin(a) * 0.98).toFixed(4)}`;
  return `M0 0 L${point(a0)} A0.98 0.98 0 0 1 ${point(a1)} Z`;
}

/**
 * One piece of "you". It first appears small inside its app, then flies to
 * the middle and locks into place as one slice of the whole circle. The
 * slice's tip is the circle's center, so scaling it about the center while
 * moving it lands every piece exactly where it belongs.
 */
export function StoryPiece({ index, count, progress }: { index: number; count: number; progress: MotionValue<number> }) {
  const start = scatterAt(index);
  // Moves are written in percent of this element's own size, which is CIRCLE percent of the stage.
  const fromX = ((start.x - 50) / CIRCLE) * 100;
  const fromY = ((start.y - 50) / CIRCLE) * 100;
  const gather = [BEATS.gather, BEATS.gather + 0.16];

  const opacity = useRamp(progress, [BEATS.pieces, BEATS.pieces + 0.08], [0, 1]);
  const x = useRampPercent(progress, gather, [fromX, 0]);
  const y = useRampPercent(progress, gather, [fromY, 0]);
  const scale = useRamp(progress, gather, [SMALL, 1]);

  return (
    <motion.svg
      viewBox="-1 -1 2 2"
      aria-hidden="true"
      style={{ opacity, x, y, scale, width: `${CIRCLE}%`, left: `${50 - CIRCLE / 2}%`, top: `${50 - CIRCLE / 2}%` }}
      className="absolute aspect-square overflow-visible"
    >
      <path d={slicePath(index, count)} fill={PIECE_COLORS[index % PIECE_COLORS.length]} />
    </motion.svg>
  );
}
