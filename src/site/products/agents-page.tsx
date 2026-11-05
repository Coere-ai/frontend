import { AgentCards } from "@/site/agents/agent-cards";
import { AgentLineup } from "@/site/agents/agent-lineup";
import { Capabilities } from "@/site/agents/capabilities";
import { backgrounds } from "@/site/content/backgrounds";
import { agentsHero } from "@/site/content/pages/agents";
import { ClosingCta } from "@/site/home/closing-cta";
import { ProductHero } from "./hero";
import { OtherProducts } from "./other-products";
import { ProductSection } from "./product-section";

/**
 * Coere Agents: one worker and everything it can do. Capabilities carries the
 * page, one feature at a time, live; the products menu links straight into it.
 */
export function AgentsPage() {
  return (
    <>
      <ProductHero
        copy={agentsHero}
        background={backgrounds.blocks}
        app={<AgentLineup />}
        appFit="contained"
        secondary={{ href: "#capabilities", label: "See all features" }}
      />
      <Capabilities />
      <ProductSection id="agents" title="Meet the agents" line="The same worker, in the colors of its field. Each knows your memory and the work that field does." tint>
        <AgentCards />
      </ProductSection>
      <OtherProducts current="agents" />
      <ClosingCta title="One worker. Infinite possibilities." />
    </>
  );
}
