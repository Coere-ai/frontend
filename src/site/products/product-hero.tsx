import type { Product } from "@/site/content/products";
import { contactHref } from "@/site/content/navigation";
import { ButtonLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";

/** A product page's opening: who it is for, its name, its line, and two ways in. */
export function ProductHero({ product }: { product: Product }) {
  return (
    <section className="pt-20 pb-14 md:pt-28 md:pb-16">
      <Container className="text-center">
        <p className="text-[15px] font-medium text-brand-500">{product.kind}</p>
        <h1 className="mt-4 text-[clamp(3rem,8vw,7rem)] leading-[0.95] font-medium tracking-[-0.05em] text-neutral-950">
          {product.name}
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-xl leading-relaxed text-neutral-600 text-balance md:text-[22px]">
          {product.tagline} {product.description}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href={contactHref}>Talk to Us</ButtonLink>
          <ButtonLink href="#film" variant="secondary">
            Watch it work
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
