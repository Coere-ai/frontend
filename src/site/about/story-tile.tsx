"use client";

import { motion, type MotionValue } from "motion/react";
import Image from "next/image";
import { useRamp, useRampPercent } from "./ramp";
import { BEATS, ringAt, scatterAt } from "./story-data";

/**
 * One AI app on the stage. It drifts at a scattered spot, then settles onto
 * the ring around the gathered memory. Its piece of you is drawn separately
 * by StoryPiece, so the two can move apart.
 */
export function StoryTile({
  index,
  count,
  name,
  logo,
  progress,
}: {
  index: number;
  count: number;
  name: string;
  logo: string;
  progress: MotionValue<number>;
}) {
  const from = scatterAt(index);
  const to = ringAt(index, count);
  const settle = [BEATS.gather, BEATS.gather + 0.16];
  const left = useRampPercent(progress, settle, [from.x, to.x]);
  const top = useRampPercent(progress, settle, [from.y, to.y]);
  // Once the pieces have left, the logo comes back to full strength.
  const logoOpacity = useRamp(progress, [BEATS.pieces, BEATS.pieces + 0.08, BEATS.gather + 0.1, BEATS.gather + 0.16], [1, 0.25, 0.25, 1]);

  return (
    <motion.div
      style={{ left, top }}
      className="absolute w-[13%] -translate-x-1/2 -translate-y-1/2"
    >
      <div className="grid aspect-square place-items-center rounded-[22%] bg-white shadow-[0_12px_30px_-12px_rgba(8,14,36,0.25)] ring-1 ring-neutral-200">
        <motion.span style={{ opacity: logoOpacity }} className="relative block h-[48%] w-[48%]">
          <Image src={logo} alt={name} fill unoptimized className="object-contain" />
        </motion.span>
      </div>
    </motion.div>
  );
}
