import type { ShowcaseItem } from "@/site/blocks/accordion-showcase";
import type { UseCase } from "@/site/blocks/use-case-tabs";
import { films } from "@/site/content/films";
import type { FilmCase, GridItem } from "@/site/content/pages/types";
import type { GridFeature } from "@/site/blocks/feature-grid";
import { FilmFrame } from "@/site/ui/film-frame";
import { FeatureIcon } from "@/site/ui/icons/feature-icons";

/** Content cases as use case tabs, each with its film looping silently. */
export function asUseCases(cases: FilmCase[]): UseCase[] {
  return cases.map((c) => ({ ...c, visual: <FilmFrame film={films[c.film]} preview /> }));
}

/** Content cases as accordion items, each with its film looping silently. */
export function asShowcase(cases: FilmCase[]): ShowcaseItem[] {
  return cases.map((c) => ({ key: c.key, title: c.title, summary: c.text, checks: c.checks, visual: <FilmFrame film={films[c.film]} preview /> }));
}

/** Content grid items with their drawn icons. */
export function asGrid(items: GridItem[]): GridFeature[] {
  return items.map((item) => ({ ...item, icon: <FeatureIcon name={item.icon} size={28} /> }));
}
