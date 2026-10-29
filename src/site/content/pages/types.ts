import type { FeatureIconName } from "@/site/ui/icons/feature-icons";
import type { FilmKey } from "../films";

/** The opening of a product or industry page, over a full photo. */
export type HeroCopy = { eyebrow: string; title: string; line: string; checks: string[] };

/** A use case or showcase item with the film that shows it. */
export type FilmCase = { key: string; label: string; title: string; text: string; checks: string[]; film: FilmKey };

/** One square of a feature grid. */
export type GridItem = { icon: FeatureIconName; title: string; text: string };
