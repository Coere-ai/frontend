import { ALL_FEATURES } from "@/site/content/features";
import type { Messages } from "@/site/i18n/messages/types";
import type { FeatureIconName } from "@/site/ui/icons/feature-icons";
import type { FilmCase, GridItem } from "./types";

/**
 * Coere Solutions' page, from what the Teams film shows. The words are in
 * the messages (productPages.solutions); here are the films and icons
 * they go with, in the same order.
 */
type Words = Messages["productPages"]["solutions"];

const cases: Pick<FilmCase, "key" | "film" | "part" | "href">[] = [
  { key: "company", film: "teams", part: { from: "graph", to: "chat" } },
  { key: "right-client", film: "teams", part: { from: "chat", to: "share" } },
  { key: "research", film: "workers", href: ALL_FEATURES.href },
];

/** The cases in a language; the research case links to every feature, labelled `seeAll`. */
export function solutionsCasesIn(words: Words, seeAll: string): FilmCase[] {
  return cases.map((base, i) => {
    const copy = words.cases[i];
    return { ...base, label: copy.title, ...copy, checks: [...copy.checks], ...(base.href ? { linkLabel: seeAll } : {}) };
  });
}

const gridIcons: FeatureIconName[] = ["building", "folder", "sparkle", "chat", "share", "lock", "columns", "people"];

export function solutionsGridIn(words: Words): GridItem[] {
  return words.grid.map((item, i) => ({ ...item, icon: gridIcons[i] }));
}
