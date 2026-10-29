import { CheckList } from "@/site/blocks/check-list";
import { CodeTabs } from "@/site/blocks/code-tabs";
import { contextSamples } from "@/site/content/code/context-api";
import { ButtonLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";

/** Coere Forge on the home page: the code a developer writes, and what it gets them. */
export function ForgeSection() {
  return (
    <section id="forge" className="scroll-mt-24 border-t border-neutral-100 py-28 md:py-36">
      <Container className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20">
        <CodeTabs samples={contextSamples} title="Context API" />
        <div>
          <p className="text-[15px] font-medium text-brand-500">Coere Forge</p>
          <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-5xl md:leading-[1.05]">Your app knows its users from day one</h2>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600">Send what your user typed and get back the memories Coere would add to it, the same ones a new chat gets.</p>
          <CheckList
            className="mt-7"
            items={[
              "Permission first: your app asks, the person presses Allow, and the token comes once",
              "Only what changed: with a chat id, the next message gets only what is new",
              "Every send on record: each app shows what it was sent, chat by chat",
            ]}
          />
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/products/forge">Explore Coere Forge</ButtonLink>
            <ButtonLink href="/resources" variant="secondary">Read the docs</ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
