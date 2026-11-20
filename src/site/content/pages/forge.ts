import type { Messages } from "@/site/i18n/messages/types";
import type { FeatureIconName } from "@/site/ui/icons/feature-icons";
import type { GridItem } from "./types";

/**
 * Coere Forge's page. The facts come from the coere-v2 server and SDK code:
 * apps read memory with a token the person allowed, and nothing else. The
 * words are in the messages (productPages.forge).
 */
const gridIcons: FeatureIconName[] = ["sparkle", "graph", "chat", "people", "pen", "plug", "key", "gauge"];

export function forgeGridIn(words: Messages["productPages"]["forge"]): GridItem[] {
  return words.grid.map((item, i) => ({ ...item, icon: gridIcons[i] }));
}
