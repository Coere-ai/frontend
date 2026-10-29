import { CheckList } from "@/site/blocks/check-list";
import { Stage } from "@/site/blocks/stage";
import { backgrounds } from "@/site/content/backgrounds";
import { ForgeWalkthrough } from "@/site/products/forge-walkthrough";
import { Container } from "@/site/ui/container";

/**
 * Coere Forge on the home page: one panel of artwork, like Solutions, with
 * the words on the left and the developer's side of Coere on the right.
 */
export function ForgeSection() {
  return (
    <section id="forge" className="scroll-mt-24 pb-28 md:pb-36">
      <Container>
        <Stage background={backgrounds.blocks}>
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/50 to-neutral-950/30" />
          <div className="relative grid items-center gap-12 p-8 md:p-14 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-14 lg:p-16">
            <div className="text-white">
              <p className="text-[15px] font-medium text-white/75">Coere Forge</p>
              <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-balance md:text-5xl md:leading-[1.05]">Your app knows its users from day one</h2>
              <p className="mt-5 text-lg leading-relaxed text-white/85">Send what your user typed and get back the memories Coere would add to it, the same ones a new chat gets.</p>
              <CheckList
                tone="light"
                className="mt-7"
                items={["Permission first: a token only after the person allows it", "Only what changed: with a chat id, the next message gets what is new", "On record: each app shows what it was sent"]}
              />
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a href="/products/forge" className="inline-flex h-12 items-center rounded-full bg-white px-6 text-[16px] font-medium text-neutral-950">Explore Coere Forge</a>
                <a href="/resources" className="inline-flex h-12 items-center rounded-full px-5 text-[16px] font-medium text-white ring-1 ring-white/40">Read the docs</a>
              </div>
            </div>
            <ForgeWalkthrough />
          </div>
        </Stage>
      </Container>
    </section>
  );
}
