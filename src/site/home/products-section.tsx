import Image from "next/image";
import Link from "next/link";
import { products } from "@/site/content/products";
import { Container } from "@/site/ui/container";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { Reveal } from "@/site/ui/reveal";
import { SectionHeading } from "@/site/ui/section-heading";

/** The three products side by side, each a card that opens its page. */
export function ProductsSection() {
  return (
    <section className="border-t border-neutral-100 bg-neutral-50 py-28">
      <Container>
        <SectionHeading eyebrow="Products" title="One memory, for you, your team and your app" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {products.map((product, index) => (
            <Reveal key={product.slug} delay={index * 0.06}>
              <Link href={`/products/${product.slug}`} className="group flex h-full flex-col rounded-3xl bg-white p-3 ring-1 ring-neutral-200 transition-shadow hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)]">
                <div className="overflow-hidden rounded-2xl">
                  <Image src={product.image} alt={`${product.name} artwork`} width={754} height={421} unoptimized className="aspect-[754/421] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <div className="flex flex-1 flex-col px-3 pt-6 pb-4">
                  <p className="text-[13px] font-medium text-neutral-500">{product.kind}</p>
                  <h3 className="mt-1.5 text-2xl font-medium tracking-[-0.03em] text-neutral-950">{product.name}</h3>
                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-neutral-500">{product.description}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-neutral-950">
                    Explore
                    <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
