import { CodeTabs } from "@/site/blocks/code-tabs";
import { FeatureGrid } from "@/site/blocks/feature-grid";
import { backgrounds } from "@/site/content/backgrounds";
import { contextSamples, mcpSamples } from "@/site/content/code/context-api";
import { forgeGrid, forgeHero, forgeSteps } from "@/site/content/pages/forge";
import { ClosingCta } from "@/site/home/closing-cta";
import { ArrowLink } from "@/site/ui/arrow-link";
import { Container } from "@/site/ui/container";
import { asGrid } from "./film-cases";
import { ProductHero } from "./hero";
import { OtherProducts } from "./other-products";
import { ProductSection } from "./product-section";

/** Coere Forge: the code first, then the three steps to an answer, then the whole surface. */
export function ForgePage() {
  return (
    <>
      <ProductHero copy={forgeHero} background={backgrounds.waves} app={<CodeTabs samples={contextSamples} title="Context API" />} secondary={{ href: "/resources", label: "Read the docs" }} />
      <ProductSection title="From nothing to context in three steps" line="Everything runs on the person's own computer, at http://127.0.0.1:7337.">
        <ol className="grid gap-10 md:grid-cols-3">
          {forgeSteps.map((step, index) => (
            <li key={step.title} className="border-t border-neutral-300 pt-6">
              <p className="text-[13px] font-medium text-brand-500">Step {index + 1}</p>
              <h3 className="mt-2 text-2xl font-medium tracking-[-0.025em] text-neutral-950">{step.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </ProductSection>
      <section className="bg-neutral-50 py-28 md:py-32">
        <Container className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-20">
          <div>
            <h2 className="text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-5xl md:leading-[1.05]">Give your agent a memory over MCP</h2>
            <p className="mt-5 text-lg leading-relaxed text-neutral-600">The same memory and the same token, as MCP tools. Connect over HTTP at /mcp, or run coere-server mcp over stdio.</p>
            <ArrowLink href="/resources/mcp" className="mt-7 text-neutral-950">See every MCP tool</ArrowLink>
          </div>
          <CodeTabs samples={mcpSamples} title="Connect" />
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
