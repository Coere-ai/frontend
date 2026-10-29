"use client";

import { motion, type MotionValue } from "motion/react";
import { LogoMark } from "@/components/logo";
import { useRamp } from "./ramp";
import { BEATS, ringAt, storyApps } from "./story-data";
import { StoryPiece } from "./story-piece";
import { StoryTile } from "./story-tile";

/**
 * The animated square beside the story. Everything is placed in percent of
 * the stage, so it scales from a phone to a wide screen without new numbers.
 */
export function StoryStage({ progress }: { progress: MotionValue<number> }) {
  const count = storyApps.length;
  const markOpacity = useRamp(progress, [BEATS.gather + 0.14, BEATS.gather + 0.2], [0, 1]);
  const markScale = useRamp(progress, [BEATS.gather + 0.14, BEATS.gather + 0.2], [0.6, 1]);
  const lines = useRamp(progress, [BEATS.own, BEATS.own + 0.12], [0, 1]);
  const labelOpacity = useRamp(progress, [BEATS.own + 0.06, BEATS.own + 0.12], [0, 1]);
  const labelY = useRamp(progress, [BEATS.own + 0.06, BEATS.own + 0.12], [8, 0]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]">
      {/* Lines from you to each app: they read your memory only with permission. */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {storyApps.map((app, index) => {
          const end = ringAt(index, count);
          return (
            <motion.line
              key={app.name}
              x1={50}
              y1={50}
              x2={end.x}
              y2={end.y}
              stroke="#5267f7"
              strokeWidth={0.35}
              strokeDasharray="1 1.2"
              style={{ pathLength: lines, opacity: lines }}
            />
          );
        })}
      </svg>

      {storyApps.map((app, index) => (
        <StoryTile key={app.name} index={index} count={count} name={app.name} logo={app.logo} progress={progress} />
      ))}
      {storyApps.map((app, index) => (
        <StoryPiece key={app.name} index={index} count={count} progress={progress} />
      ))}

      <motion.div
        style={{ opacity: markOpacity, scale: markScale }}
        className="absolute top-1/2 left-1/2 grid h-[13%] w-[13%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg"
      >
        <LogoMark className="h-[60%] w-[60%] text-brand-500" />
      </motion.div>

      <motion.p
        style={{ opacity: labelOpacity, y: labelY }}
        className="absolute top-[72%] left-1/2 -translate-x-1/2 rounded-full bg-neutral-950 px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap text-white"
      >
        Owned by you
      </motion.p>
    </div>
  );
}
