"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Feature } from "@/site/content/features";
import { films } from "@/site/content/films";
import { FilmFrame } from "@/site/ui/film-frame";
import { PanelMore } from "./panel-parts";

/**
 * The film beside the features list, live on Coere's real code. Each
 * feature gets its own, keyed by slug, so switching crossfades from the old
 * one to the new one, each looping the part that shows the feature.
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
      <div className="mt-3">
        <PanelMore href={feature.href}>See it</PanelMore>
      </div>
    </div>
  );
}
