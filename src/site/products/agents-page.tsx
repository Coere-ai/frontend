import { AgentCards } from "@/site/agents/agent-cards";
import { AgentsReel } from "@/site/agents/agents-reel";
import { Capabilities } from "@/site/agents/capabilities";
import { agentsReelIn } from "@/site/content/pages/agents";
import { getMessages } from "@/site/i18n/server";
import { ClosingCta } from "@/site/home/closing-cta";
import { AgentsBackdrop } from "./agents-backdrop";
import { ProductHero } from "./hero";
import { OtherProducts } from "./other-products";
import { ProductSection } from "./product-section";

/**
 * Coere Agents: one worker and everything it can do. The hero plays every
 * part of it live, one after another; Capabilities carries the page, one
 * feature at a time, and the products menu links straight into it.
 */
export async function AgentsPage() {
  const { productPages, catalog } = await getMessages();
  const t = productPages.agents;
  return (
    <>
      <ProductHero
        copy={t.hero}
        backdrop={<AgentsBackdrop />}
        tone="dark"
        intro
        app={<AgentsReel parts={agentsReelIn(t)} label={t.reelLabel} />}
        secondary={{ href: "#capabilities", label: catalog.seeAllFeatures }}
      />
      <Capabilities words={t.capabilities} />
      <ProductSection id="agents" title={t.meet.title} line={t.meet.line} tint>
        <AgentCards words={t} />
      </ProductSection>
      <OtherProducts current="agents" />
      <ClosingCta title={t.closing} />
    </>
  );
}
