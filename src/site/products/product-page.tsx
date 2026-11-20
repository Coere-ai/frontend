import type { Product } from "@/site/content/products";
import { DarkPage } from "@/site/ui/page-theme";
import { AgentsPage } from "./agents-page";
import { ConnectPage } from "./connect-page";
import { ForgePage } from "./forge-page";
import { SolutionsPage } from "./solutions-page";

/**
 * Each product has a page of its own design, so no two read alike:
 * Connect leads with use cases, Solutions with how a team shares memory,
 * Forge with code, and Agents with the agents themselves. Connect opens
 * light and stays light; the other three open on a dark hero, so the whole
 * page is dark.
 */
export function ProductPage({ product }: { product: Product }) {
  if (product.slug === "connect") return <ConnectPage />;
  return <DarkPage>{product.slug === "solutions" ? <SolutionsPage /> : product.slug === "agents" ? <AgentsPage /> : <ForgePage />}</DarkPage>;
}
