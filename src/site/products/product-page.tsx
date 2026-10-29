import type { Product } from "@/site/content/products";
import { AgentsPage } from "./agents-page";
import { ConnectPage } from "./connect-page";
import { ForgePage } from "./forge-page";
import { SolutionsPage } from "./solutions-page";

/**
 * Each product has a page of its own design, so no two read alike:
 * Connect leads with use cases, Solutions with how a team shares memory,
 * Forge with code, and Agents with the agents themselves.
 */
export function ProductPage({ product }: { product: Product }) {
  if (product.slug === "connect") return <ConnectPage />;
  if (product.slug === "solutions") return <SolutionsPage />;
  if (product.slug === "agents") return <AgentsPage />;
  return <ForgePage />;
}
