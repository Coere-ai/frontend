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

/** Coere Agents: the agents, how workers split a big task, and what every agent can do. */
export function AgentsPage() {
  const workers = workerParts.map((part) => ({
    key: part.key,
    title: part.title,
    summary: part.text,
    checks: part.checks,
    visual: <FilmFrame film={films.workers} preview from={part.from} to={part.to} />,
  }));
  return (
    <>
      <ProductHero copy={agentsHero} background={backgrounds.curl} app={<AgentLineup />} appFit="contained" secondary={{ href: "#agents", label: "Meet the agents" }} />
      <ProductSection id="agents" title="Meet the agents" line="The same Cori, in the colors of its field. Each knows your memory and the work that field does.">
        <AgentCards />
      </ProductSection>
      <ProductSection id="workers" title="Workers: one task, many tabs" line="When a task needs many pages read, an agent splits it across workers and merges what they find." tint>
        <AccordionShowcase items={workers} background={backgrounds.glass} />
      </ProductSection>
      <ProductSection title="What every agent can do">
        <FeatureGrid items={asGrid(agentsGrid)} />
      </ProductSection>
      <OtherProducts current="agents" />
      <ClosingCta title="An agent for every field." />
    </>
  );
}
