import type { FilmKey } from "../films";
import type { Product } from "../products";

/**
 * How one product serves one industry, told as an example of the work.
 * The examples are illustrations of what each product does, not customers.
 */
export type IndustryStory = { product: Product["slug"]; title: string; text: string; checks: string[]; film: FilmKey };

/** An industry page's own words: its opening line and a story per product. */
export type IndustryPage = { line: string; stories: IndustryStory[] };
