import { AccordionShowcase, type ShowcaseItem } from "@/site/blocks/accordion-showcase";
import { backgrounds } from "@/site/content/backgrounds";
import { films } from "@/site/content/films";
import { Container } from "@/site/ui/container";
import { FilmFrame } from "@/site/ui/film-frame";
import { ActionsReel } from "./actions-reel";
import { SectionIntro } from "./section-intro";

const items: ShowcaseItem[] = [
  {
    key: "context",
    title: "Context, added as you type",
    summary: "Start a new chat on any AI and Coere brings what it needs from your memory: who you are, the chat that holds your work, and what you know about the topic.",
    checks: ["The line: a blue line says what goes and which AIs it came from", "One Enter: it goes in front of your message and sends", "No repeats: a follow up in the same chat sends nothing twice"],
    href: "/products/connect",
    visual: <FilmFrame film={films.smartContext} preview />,
  },
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
    summary: "Cori, the helper in Coere, does the work from what your memory knows, and asks before anything leaves.",
    checks: [
      "Email: drafts in your style, in its own Gmail tab",
      "Calendar: adds the event with the guests and time zone you said",
      "Writing: fix or improve text in Gmail, Docs and chat boxes",
      "Forms and quizzes: answers from memory, and asks before it submits",
    ],
    href: "/products/connect#actions",
    visual: <ActionsReel />,
  },
];

/** Coere Connect on the home page: context as you type, the memory, how it fills, and what Cori does with it. */
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
          <AccordionShowcase items={items} background={backgrounds.dune} />
        </div>
      </Container>
    </section>
  );
}
