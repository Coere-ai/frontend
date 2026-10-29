import { partOne } from "./part-one";
import { partTwo } from "./part-two";
import type { IndustryPage } from "./types";

export type { IndustryPage, IndustryStory } from "./types";

const pages: Record<string, IndustryPage> = { ...partOne, ...partTwo };

/** The page content for an industry slug, if it has one. */
export function industryPage(slug: string): IndustryPage | undefined {
  return pages[slug];
}
