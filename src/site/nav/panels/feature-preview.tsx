"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Feature } from "@/site/content/features";
import { films } from "@/site/content/films";
import { FilmFrame } from "@/site/ui/film-frame";

/**
 * The film beside the features list. Each feature gets its own film page,
 * keyed by slug, so switching crossfades from the old film to the new one.
 * Each starts past its title card and loops back to the same point.
 */
export function FeaturePreview({ feature }: { feature: Feature }) {
  const film = films[feature.film];
  return (
    <div>
      <div className="relative aspect-[1440/900] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
        <AnimatePresence initial={false}>
          <motion.div
            key={feature.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <FilmFrame film={film} preview className="h-full" />
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="mt-4 text-[15px] font-medium text-neutral-950">{feature.title}</p>
      <p className="mt-1 text-[13px] leading-snug text-neutral-500">{feature.description}</p>
    </div>
  );
}
