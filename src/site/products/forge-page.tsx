import { CodeTabs } from "@/site/blocks/code-tabs";
import { Stage } from "@/site/blocks/stage";
import { FeatureGrid } from "@/site/blocks/feature-grid";
import { backgrounds } from "@/site/content/backgrounds";
import { contextSamples, mcpSamples } from "@/site/content/code/context-api";
import { forgeGrid, forgeHero } from "@/site/content/pages/forge";
import { ClosingCta } from "@/site/home/closing-cta";
import { ArrowLink } from "@/site/ui/arrow-link";
import { Container } from "@/site/ui/container";
import { asGrid } from "./film-cases";
import { ForgeWalkthrough } from "./forge-walkthrough";
import { ProductHero } from "./hero";
import { OtherProducts } from "./other-products";
import { ProductSection } from "./product-section";

/** Coere Forge: the code first, then the demo end to end, MCP, and the whole surface. */
export function ForgePage() {
  return (
    <>
      <ProductHero copy={forgeHero} background={backgrounds.ribbons} app={<CodeTabs samples={contextSamples} />} appFit="contained" secondary={{ href: "/resources", label: "Read the docs" }} />
      <section className="py-28 md:py-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-5xl md:leading-[1.05]">From a key to context, end to end</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">Real screens from Coere, step by step. Use the arrows to move through them.</p>
          </div>
          <Stage background={backgrounds.light} className="mt-16">
            <div aria-hidden="true" className="absolute inset-0 bg-neutral-950/45" />
            <div className="relative p-6 md:p-12">
              <ForgeWalkthrough />
            </div>
          </Stage>
        </Container>
      </section>
      <section className="bg-neutral-50 py-28 md:py-32">
        <Container className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-20">
          <div>
            <h2 className="text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-5xl md:leading-[1.05]">Give your agent a memory over MCP</h2>
            <p className="mt-5 text-lg leading-relaxed text-neutral-600">The same memory and the same token, as MCP tools. Connect over HTTP at /mcp, or run coere-server mcp over stdio.</p>
            <ArrowLink href="/resources/mcp" className="mt-7 text-neutral-950">See every MCP tool</ArrowLink>
          </div>
          <CodeTabs samples={mcpSamples} />
        </Container>
      </section>
      <ProductSection title="Everything in Coere Forge">
        <FeatureGrid items={asGrid(forgeGrid)} />
      </ProductSection>
      <OtherProducts current="forge" />
      <ClosingCta title="Your app knows its users from day one." />
    </>
  );
}
