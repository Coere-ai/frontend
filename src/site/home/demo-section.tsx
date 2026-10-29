import { backgrounds } from "@/site/content/backgrounds";
import { films } from "@/site/content/films";
import { Container } from "@/site/ui/container";
import { FilmShowcase } from "@/site/ui/film-showcase";

/** The full v2 demo, right under the hero. */
export function DemoSection() {
  return (
    <section id="demo" className="scroll-mt-24 pb-32">
      <Container>
        <FilmShowcase film={films.v2} backdrop={backgrounds.ribbons} />
        <p className="mt-5 text-center text-[14px] text-neutral-500">Filmed from the real extension with made up chats.</p>
      </Container>
    </section>
  );
}
