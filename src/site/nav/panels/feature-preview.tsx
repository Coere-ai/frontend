"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Feature } from "@/site/content/features";
import { films, PREVIEW_START_SECONDS } from "@/site/content/films";

/**
 * The film beside the features list. Each feature gets its own video
 * element, keyed by slug, so switching crossfades from the old film's frame
 * to the new one. Each starts past its title card, on a still of real
 * footage, and loops back to the same point.
 */
export function FeaturePreview({ feature }: { feature: Feature }) {
  const film = films[feature.film];
  return (
    <div>
      <div className="relative aspect-[1440/900] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
        <AnimatePresence initial={false}>
          <motion.video
            key={feature.slug}
            src={`${film.src}#t=${PREVIEW_START_SECONDS}`}
            poster={film.still}
            autoPlay
            muted
            playsInline
            onEnded={(event) => {
              event.currentTarget.currentTime = PREVIEW_START_SECONDS;
              event.currentTarget.play().catch(() => {});
            }}
            preload="auto"
            aria-label={`${feature.name} in action`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>
      <p className="mt-4 text-[15px] font-medium text-neutral-950">{feature.title}</p>
      <p className="mt-1 text-[13px] leading-snug text-neutral-500">{feature.description}</p>
    </div>
  );
}
