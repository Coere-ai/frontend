import type { Product } from "../products";

/**
 * The four demos every industry page plays, each built from the real app
 * screens with that field's own made up content (scripts/industries):
 * context added to a new chat, the client graph and one client's sheet,
 * one client per send with Cori's answer, and the field's own app reading
 * memory through the API.
 */
export type DemoKey = "context" | "graph" | "confidential" | "app";

/**
 * How one product serves one industry, told as an example of the work.
 * The examples illustrate what each product does; they are not customers.
 */
export type IndustryStory = { product: Product["slug"]; demo: DemoKey; title: string; text: string; checks: string[] };

/** An industry page's own words: its opening line and a story per demo. */
export type IndustryPage = { line: string; stories: IndustryStory[] };
