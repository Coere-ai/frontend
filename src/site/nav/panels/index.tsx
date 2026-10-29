import type { NavTabId } from "@/site/content/navigation";
import { AboutPanel } from "./about-panel";
import { BlogPanel } from "./blog-panel";
import { CareersPanel } from "./careers-panel";
import { IndustriesPanel } from "./industries-panel";
import { ProductsPanel } from "./products-panel";
import { ResourcesPanel } from "./resources-panel";

/** The menu body for each navbar tab. */
export function PanelFor({ id }: { id: NavTabId }) {
  switch (id) {
    case "products":
      return <ProductsPanel />;
    case "industries":
      return <IndustriesPanel />;
    case "resources":
      return <ResourcesPanel />;
    case "blog":
      return <BlogPanel />;
    case "about":
      return <AboutPanel />;
    case "careers":
      return <CareersPanel />;
  }
}
