import type { Product } from "@/site/content/products";
import { Container } from "@/site/ui/container";
import { Reveal } from "@/site/ui/reveal";

/** Three short reasons, side by side, each under a thin rule. */
export function ProductHighlights({ product }: { product: Product }) {
  return (
    <section className="py-24">
      <Container>
        <div className="grid gap-10 md:grid-cols-3 md:gap-12">
          {product.highlights.map((highlight, index) => (
            <Reveal key={highlight.title} delay={index * 0.06} className="border-t border-neutral-950 pt-6">
              <h2 className="text-xl font-medium tracking-[-0.02em] text-neutral-950">{highlight.title}</h2>
              <p className="mt-3 text-[16px] leading-relaxed text-neutral-500">{highlight.text}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
