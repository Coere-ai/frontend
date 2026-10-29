import { films } from "@/site/content/films";
import { Container } from "@/site/ui/container";
import { FilmShowcase } from "@/site/ui/film-showcase";

/** The full v2 demo, right under the hero, over the Connect artwork. */
export function DemoSection() {
  return (
    <section id="demo" className="scroll-mt-24 pb-28">
      <Container>
        <FilmShowcase film={films.v2} backdrop="/preview/images/connect.webp" />
        <p className="mt-5 text-center text-[14px] text-neutral-500">
          Filmed from the real extension with made up chats. Press play, or use the keyboard once the player has focus.
        </p>
      </Container>
    </section>
  );
}
