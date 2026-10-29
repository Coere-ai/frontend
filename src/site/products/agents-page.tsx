import { AccordionShowcase } from "@/site/blocks/accordion-showcase";
import { FeatureGrid } from "@/site/blocks/feature-grid";
import { AgentCards } from "@/site/agents/agent-cards";
import { AgentLineup } from "@/site/agents/agent-lineup";
import { backgrounds } from "@/site/content/backgrounds";
import { films } from "@/site/content/films";
import { agentsGrid, agentsHero, workerParts } from "@/site/content/pages/agents";
import { ClosingCta } from "@/site/home/closing-cta";
import { FilmFrame } from "@/site/ui/film-frame";
import { asGrid } from "./film-cases";
import { ProductHero } from "./hero";
import { OtherProducts } from "./other-products";
import { ProductSection } from "./product-section";

/** Coere Agents: one worker that becomes as many as a task needs, the field agents, and everything it can do. */
export function AgentsPage() {
  const workers = workerParts.map((part) => ({
    key: part.key,
    title: part.title,
    summary: part.text,
    checks: part.checks,
    visual: <FilmFrame film={films.workers} preview part={part.part} />,
  }));
  return (
    <>
      <ProductHero copy={agentsHero} background={backgrounds.blocks} app={<AgentLineup />} appFit="contained" secondary={{ href: "#agents", label: "Meet the agents" }} />
      <ProductSection id="workers" title="One task, as many workers as it takes" line="When a job needs many pages read, Cori splits it across workers that run at once, then merges what they find.">
        <AccordionShowcase items={workers} background={backgrounds.flow} />
      </ProductSection>
      <ProductSection id="agents" title="Meet the agents" line="The same worker, in the colors of its field. Each knows your memory and the work that field does." tint>
        <AgentCards />
      </ProductSection>
      <ProductSection title="Infinite possibilities" line="Everything a worker can do, in any tab, from your memory.">
        <FeatureGrid items={asGrid(agentsGrid)} />
      </ProductSection>
      <OtherProducts current="agents" />
      <ClosingCta title="One worker. Infinite possibilities." />
    </>
  );
}
