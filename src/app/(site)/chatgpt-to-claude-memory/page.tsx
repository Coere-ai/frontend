import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PhotoHero } from "@/site/blocks/photo-hero";
import { FaqSection } from "@/site/blocks/faq";
import { films } from "@/site/content/films";
import { guideBySlug, switching } from "@/site/content/guides";
import { contactHref, contactLabel } from "@/site/content/navigation";
import { RelatedSection, WaysSection, WordsTable, WorkflowSection } from "@/site/guides/guide-blocks";
import { ClosingCta } from "@/site/home/closing-cta";
import { CompareSection } from "@/site/products/compare-section";
import { guideGraph, JsonLd } from "@/site/seo/json-ld";
import { FilmFrame } from "@/site/ui/film-frame";

const guide = guideBySlug("chatgpt-to-claude-memory");
const path = `/${guide.slug}`;

export const metadata: Metadata = pageMetadata({ ...guide.seo, path });

/**
 * ChatGPT to Claude memory: the three ways to move it, what moves with
 * each, how to do it with Coere step by step, and what that saves against
 * pasting context by hand.
 */
export default function ChatgptToClaudeMemoryPage() {
  return (
    <>
      <JsonLd data={guideGraph({ path, title: guide.seo.title, description: guide.seo.description, about: ["Moving ChatGPT memory to Claude", "Importing AI chat history"], faqs: switching.faqs })} />
      <PhotoHero
        {...switching.hero}
        primary={{ href: contactHref, label: contactLabel }}
        secondary={{ href: "#how", label: "How it works" }}
        app={<FilmFrame film={films.extraction} preview />}
      />
      <WaysSection title={switching.answer.title} line={switching.answer.line} ways={switching.ways} />
      <WordsTable caption="What moves with each way" columns={switching.table.columns} rows={switching.table.rows} note={switching.table.note} />
      <WorkflowSection
        title="How to bring ChatGPT context into Claude with Coere"
        line="Four steps, once. After that every new chat on every AI starts from the same memory. The film below plays Extract all live, on Coere's own code."
        steps={switching.steps}
        film={films.extraction}
       
        link={{ href: "/products/connect#import", label: "See Import chats" }}
      />
      <CompareSection />
      <FaqSection faqs={switching.faqs} title="Moving from ChatGPT to Claude, answered" />
      <RelatedSection
        links={[
          { href: "/portable-ai-memory", kind: "What it is", name: "Portable AI memory" },
          { href: "/products/connect", kind: "Memory for people", name: "Coere Connect" },
          { href: "/industries/technology", kind: "Industries", name: "Coere for technology" },
        ]}
      />
      <ClosingCta title="Start every chat from what you already said." />
    </>
  );
}
