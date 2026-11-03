import { CircleArrowLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";

/**
 * The page behind every button for something not out yet (Install, Try it
 * free). The owner asked for it plain: two words and the demo.
 */
export function ComingSoon() {
  return (
    <section className="py-40 md:py-56">
      <Container className="text-center">
        <h1 className="text-5xl font-medium tracking-[-0.05em] text-neutral-950 md:text-7xl">Coming soon</h1>
        <div className="mt-10 flex justify-center">
          <CircleArrowLink href="/#demo">Watch the demo</CircleArrowLink>
        </div>
      </Container>
    </section>
  );
}
