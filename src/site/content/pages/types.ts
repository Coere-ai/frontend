import type { LivePart } from "../live";
import type { FeatureIconName } from "@/site/ui/icons/feature-icons";
import type { FilmKey } from "../films";

/** The opening of a product page or guide: its heading, one line and what it does. */
export type HeroCopy = { title: string; line: string; checks: string[] };

/** A use case or showcase item with the film that shows it. */
/** A use case shown by a film; `part` names the chapters of its live film to loop, when not the film's usual part. */
export type FilmCase = { key: string; label: string; title: string; text: string; checks: string[]; film: FilmKey; part?: LivePart; href?: string; linkLabel?: string };

/** One square of a feature grid. */
export type GridItem = { icon: FeatureIconName; title: string; text: string };
