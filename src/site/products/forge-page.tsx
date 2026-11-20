import { CodeTabs } from "@/site/blocks/code-tabs";
import { Stage } from "@/site/blocks/stage";
import { FeatureGrid } from "@/site/blocks/feature-grid";
import { backgrounds } from "@/site/content/backgrounds";
import { contextSamples, mcpSamples } from "@/site/content/code/context-api";
import { forgeGrid, forgeHero } from "@/site/content/pages/forge";
import { ClosingCta } from "@/site/home/closing-cta";
import { SECTION_TITLE, SECTION_Y, SOFT_FIELD } from "@/site/home/look";
import { ArrowLink } from "@/site/ui/arrow-link";
import { Container } from "@/site/ui/container";
import { ForgeBackdrop } from "./backdrops";
import { asGrid } from "./film-cases";
import { films } from "@/site/content/films";
import { FilmFrame } from "@/site/ui/film-frame";
import { ProductHero } from "./hero";
import { OtherProducts } from "./other-products";
import { ProductSection } from "./product-section";

/** Coere Forge: the code first, then the demo end to end, MCP, and the whole surface. */
export function ForgePage() {
  return (
    <>
      <ProductHero copy={forgeHero} backdrop={<ForgeBackdrop />} tone="dark" app={<CodeTabs samples={contextSamples} />} appFit="contained" secondary={{ href: "/resources", label: "Read the docs" }} />
      <section className={SECTION_Y}>
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={SECTION_TITLE}>From a key to context, end to end</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">A developer makes a token, adds Coere to their app&apos;s AI call and runs it, then points it at any AI.</p>
          </div>
          <Stage background={backgrounds.prism} className="mt-14 shadow-[0_40px_100px_-40px_rgba(23,27,77,0.45)] md:mt-16">
            <div aria-hidden="true" className="absolute inset-0 bg-neutral-950/45" />
            <div className="relative p-6 md:p-12">
              <FilmFrame film={films.forgeDev} />
            </div>
          </Stage>
        </Container>
      </section>
      <section className={SECTION_Y}>
        <Container>
          <div className={`${SOFT_FIELD} grid items-center gap-12 px-6 py-14 md:px-12 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16`}>
            <div>
              <h2 className={SECTION_TITLE}>Give your agent a memory over MCP</h2>
              <p className="mt-5 text-lg leading-relaxed text-neutral-600">The same memory and the same token, as MCP tools. Connect over HTTP at /mcp, or run coere-server mcp over stdio.</p>
              <ArrowLink href="/resources/mcp" className="mt-7 text-neutral-950">See every MCP tool</ArrowLink>
            </div>
            <CodeTabs samples={mcpSamples} />
          </div>
        </Container>
      </section>
      <ProductSection title="Everything in Coere Forge" link={{ href: "/ai-agent-memory", linkLabel: "Memory for AI agents" }}>
        <FeatureGrid items={asGrid(forgeGrid)} />
      </ProductSection>
      <OtherProducts current="forge" />
      <ClosingCta title="Your app knows its users from day one." />
    </>
  );
}
