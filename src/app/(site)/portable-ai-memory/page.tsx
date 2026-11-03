import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PhotoHero } from "@/site/blocks/photo-hero";
import { FaqSection } from "@/site/blocks/faq";
import { backgrounds } from "@/site/content/backgrounds";
import { films } from "@/site/content/films";
import { guideBySlug, portable } from "@/site/content/guides";
import { contactHref, contactLabel } from "@/site/content/navigation";
import { AnswerSection, RelatedSection, TodaySection, WorkflowSection } from "@/site/guides/guide-blocks";
import { ClosingCta } from "@/site/home/closing-cta";
import { CompareTable } from "@/site/home/compare-table";
import { AiTiles } from "@/site/products/ai-tiles";
import { guideGraph, JsonLd } from "@/site/seo/json-ld";
import { FilmFrame } from "@/site/ui/film-frame";

const guide = guideBySlug("portable-ai-memory");
const path = `/${guide.slug}`;

export const metadata: Metadata = pageMetadata({ ...guide.seo, path });

/**
 * Portable AI memory: what it is, how Coere makes your memory portable,
 * how that compares with each AI's own memory, and what works today.
 */
export default function PortableAiMemoryPage() {
  return (
    <>
      <JsonLd data={guideGraph({ path, title: guide.seo.title, description: guide.seo.description, about: ["Portable AI memory", "AI memory layer"], faqs: portable.faqs })} />
      <PhotoHero
        photo={backgrounds.flow.src}
        {...portable.hero}
        primary={{ href: contactHref, label: contactLabel }}
        secondary={{ href: "#how", label: "How it works" }}
        app={<FilmFrame film={films.smartContext} preview />}
      />
      <AnswerSection
        title={portable.answer.title}
        paragraphs={portable.answer.paragraphs}
        aside={
          <>
            <p className="mb-8 text-[15px] font-medium text-neutral-500">One memory, fed by every AI you use</p>
            <AiTiles />
          </>
        }
      />
      <WorkflowSection
        title="How Coere makes your memory portable"
        line="Four steps in your browser. The film below plays them live, on Coere's own code."
        steps={portable.steps}
        film={films.v2}
        background={backgrounds.ribbons}
        link={{ href: "/products/connect", label: "Explore Coere Connect" }}
      />
      <CompareTable />
      <TodaySection title="What Coere supports today" items={portable.today} status="Coere is in pre-launch, and the waitlist is open. Here is what Coere Connect does now, as the films on this site show it." />
      <FaqSection faqs={portable.faqs} title="Portable AI memory, answered" />
      <RelatedSection
        links={[
          { href: "/chatgpt-to-claude-memory", kind: "Switching AIs", name: "ChatGPT to Claude memory" },
          { href: "/ai-agent-memory", kind: "For developers", name: "AI agent memory" },
          { href: "/products/solutions", kind: "Memory for teams", name: "Coere Solutions" },
        ]}
      />
      <ClosingCta title="Your memory, across every AI." />
    </>
  );
}
