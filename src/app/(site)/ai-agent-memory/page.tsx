import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CheckList } from "@/site/blocks/check-list";
import { CodeTabs } from "@/site/blocks/code-tabs";
import { FaqSection } from "@/site/blocks/faq";
import { PhotoHero } from "@/site/blocks/photo-hero";
import { backgrounds } from "@/site/content/backgrounds";
import { contextSamples, mcpSamples } from "@/site/content/code/context-api";
import { films } from "@/site/content/films";
import { agentMemory, guideBySlug } from "@/site/content/guides";
import { contactHref, contactLabel } from "@/site/content/navigation";
import { AnswerSection, RelatedSection, TodaySection, WorkflowSection } from "@/site/guides/guide-blocks";
import { ClosingCta } from "@/site/home/closing-cta";
import { guideGraph, JsonLd } from "@/site/seo/json-ld";
import { ArrowLink } from "@/site/ui/arrow-link";
import { Container } from "@/site/ui/container";

const guide = guideBySlug("ai-agent-memory");
const path = `/${guide.slug}`;

export const metadata: Metadata = pageMetadata({ ...guide.seo, path });

/**
 * AI agent memory: what it is, how an agent gets a person's Coere memory
 * with their permission, the code, and exactly what the API serves today.
 */
export default function AiAgentMemoryPage() {
  return (
    <>
      <JsonLd data={guideGraph({ path, title: guide.seo.title, description: guide.seo.description, about: ["AI agent memory", "Model Context Protocol", "Memory API"], faqs: agentMemory.faqs })} />
      <PhotoHero
        photo={backgrounds.blocks.src}
        {...agentMemory.hero}
        primary={{ href: contactHref, label: contactLabel }}
        secondary={{ href: "/resources/mcp", label: "Read the MCP docs" }}
        app={<CodeTabs samples={mcpSamples} />}
        appFit="contained"
      />
      <AnswerSection
        title={agentMemory.answer.title}
        paragraphs={agentMemory.answer.paragraphs}
        aside={
          <>
            <p className="mb-6 text-[15px] font-medium text-neutral-500">What your agent can read</p>
            <CheckList items={agentMemory.answer.reads} />
          </>
        }
      />
      <WorkflowSection
        title="Connect an agent in four steps"
        line="A developer makes a token, adds Coere to their app's AI call and runs it, then points it at any AI. The film below plays it live."
        steps={agentMemory.steps}
        film={films.forgeDev}
        background={backgrounds.light}
        link={{ href: "/resources/authentication", label: "Tokens and scopes" }}
      />
      <section className="bg-neutral-50 py-28 md:py-32">
        <Container className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-20">
          <div>
            <h2 className="text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-5xl md:leading-[1.05]">The context for a message, in a few lines</h2>
            <p className="mt-5 text-lg leading-relaxed text-neutral-600">
              context.forDraft answers with a block to put in front of your prompt and each memory with why it goes. With a chat id, the next message gets only what changed.
            </p>
            <ArrowLink href="/resources/sdks" className="mt-7 text-neutral-950">
              Read the SDK docs
            </ArrowLink>
          </div>
          <CodeTabs samples={contextSamples} />
        </Container>
      </section>
      <TodaySection title="What Coere Forge supports today" items={agentMemory.today} status={agentMemory.status} />
      <FaqSection faqs={agentMemory.faqs} title="Memory for AI agents, answered" />
      <RelatedSection
        links={[
          { href: "/products/forge", kind: "Memory for developers", name: "Coere Forge" },
          { href: "/resources", kind: "Developer docs", name: "The memory API" },
          { href: "/portable-ai-memory", kind: "What it is", name: "Portable AI memory" },
        ]}
      />
      <ClosingCta title="Your agent knows its user from day one." text="Talk to the founders about building on Coere Forge." />
    </>
  );
}
