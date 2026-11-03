import Link from "next/link";
import { CheckList } from "@/site/blocks/check-list";
import { Stage } from "@/site/blocks/stage";
import { backgrounds } from "@/site/content/backgrounds";
import { films } from "@/site/content/films";
import { CircleArrowLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";
import { FilmFrame } from "@/site/ui/film-frame";

/**
 * Coere Forge on the home page: one panel of artwork, like Solutions, with
 * the words on the left and, on the right, a developer making a token,
 * adding Coere to their app's AI call and running it, live with its player.
 * Forge is not out yet, so its button joins the waitlist.
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
                <CircleArrowLink href="/developers/waitlist" tone="light">
                  Join the waitlist
                </CircleArrowLink>
                <Link href="/products/forge" className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-medium text-white ring-1 ring-white/40 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Explore Coere Forge
                </Link>
              </div>
              <p className="mt-4 text-[15px] text-white/70">Coere Forge is coming soon.</p>
            </div>
            <FilmFrame film={films.forgeDev} />
          </div>
        </Stage>
      </Container>
    </section>
  );
}
