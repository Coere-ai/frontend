import { films } from "@/site/content/films";
import { Container } from "@/site/ui/container";
import { FilmShowcase } from "@/site/ui/film-showcase";

/** The full v2 demo, right under the hero. */
export function DemoSection() {
  return (
    <section id="demo" className="scroll-mt-24 pb-32">
      <Container>
        <FilmShowcase film={films.v2} />
      </Container>
    </section>
  );
}
