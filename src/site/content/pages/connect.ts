import type { Slide } from "@/site/blocks/slant-card";
import { ALL_FEATURES } from "@/site/content/features";
import type { Messages } from "@/site/i18n/messages/types";
import type { FeatureIconName } from "@/site/ui/icons/feature-icons";
import type { FilmCase, GridItem } from "./types";

/**
 * Coere Connect's page. Every claim on it is shown in one of the films. The
 * words are in the messages (productPages.connect); here are the films,
 * links and icons they go with, in the same order.
 */
type Words = Messages["productPages"]["connect"];

const slideFilms: Slide["live"][] = [
  { film: "extraction", from: "extract", to: "new" },
  { film: "smart-context", from: "type", to: "enter" },
  { film: "memory", from: "build", to: "memory" },
];

export function connectSlidesIn(words: Words): Slide[] {
  return words.slides.map((slide, i) => ({ ...slide, live: slideFilms[i] }));
}

/** Keys double as anchors, so the home page can link straight to a case. */
const cases: Pick<FilmCase, "key" | "film" | "href">[] = [
  { key: "import", film: "extraction", href: "/chatgpt-to-claude-memory" },
  { key: "memory", film: "memory" },
  { key: "quizzes", film: "actionsAnywhere", href: ALL_FEATURES.href },
  { key: "writing", film: "coriRewrite", href: ALL_FEATURES.href },
  { key: "actions", film: "actionsGmail", href: ALL_FEATURES.href },
];

/** The use cases in a language. A case with no link of its own points at every feature, labelled `seeAll`. */
export function connectCasesIn(words: Words, seeAll: string): FilmCase[] {
  return cases.map((base, i) => {
    const { link, ...copy } = { link: undefined, ...words.cases[i] };
    return { ...base, ...copy, checks: [...copy.checks], ...(base.href ? { linkLabel: link ?? seeAll } : {}) };
  });
}

const gridIcons: FeatureIconName[] = ["graph", "download", "sparkle", "mic", "chat", "mail", "pen", "columns"];

export function connectGridIn(words: Words): GridItem[] {
  return words.grid.map((item, i) => ({ ...item, icon: gridIcons[i] }));
}
