import { AccordionShowcase, type ShowcaseItem } from "@/site/blocks/accordion-showcase";
import { backgrounds } from "@/site/content/backgrounds";
import { films } from "@/site/content/films";
import { Container } from "@/site/ui/container";
import { FilmFrame } from "@/site/ui/film-frame";
import { SectionIntro } from "./section-intro";

const items: ShowcaseItem[] = [
  {
    key: "graph",
    title: "Your memory graph",
    summary: "Coere sorts what your chats say into one graph around you, so you can see everything your AIs know.",
    checks: ["Sections and folders: each part of your life in its own place", "Sources: every memory keeps the chats it came from", "Search: the best matches light up on the graph"],
    href: "/products/connect#memory",
    visual: <FilmFrame film={films.memory} preview />,
  },
  {
    key: "import",
    title: "Import every chat",
    summary: "Extract all reads your AIs and saves every chat on your computer. After that, new chats come in by themselves.",
    checks: ["Every AI: ChatGPT, Claude, Gemini and six more", "On your computer: nothing leaves it to be saved", "Always current: memory follows a chat that changes"],
    href: "/products/connect#import",
    visual: <FilmFrame film={films.extraction} preview />,
  },
  {
    key: "actions",
    title: "Coere Actions",
    summary: "Cori, the helper in Coere, acts on what your memory knows, in your words and with your say on anything that leaves.",
    checks: ["Gmail: drafts in your style, and asks before writing to anyone you didn't name", "Writing: fix or improve text in Gmail, Docs and chat boxes", "Voice: hold Right Option, talk, and hear the answer"],
    href: "/products/connect#actions",
    visual: <FilmFrame film={films.actionsGmail} preview />,
  },
];

/** Coere Connect on the home page: what the memory is, how it fills, and what it does. */
export function ConnectSection() {
  return (
    <section id="connect" className="scroll-mt-24 border-t border-neutral-100 py-28 md:py-36">
      <Container>
        <SectionIntro
          eyebrow="Coere Connect"
          title="One memory across every AI"
          line="A Chrome extension that saves your chats from every AI, builds them into a memory you own, and brings it into each new chat."
          href="/products/connect"
          linkLabel="Explore Coere Connect"
        />
        <div className="mt-20">
          <AccordionShowcase items={items} background={backgrounds.curl} />
        </div>
      </Container>
    </section>
  );
}
