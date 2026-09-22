import Image from "next/image";
import { Container, Reveal, SectionHeading } from "@/components/ui";
import { products, type Product } from "@/lib/site";

/** The product's symbol: the Chrome Web Store mark, or code brackets. */
function ProductSymbol({ icon }: { icon: Product["icon"] }) {
  if (icon === "chrome") {
    return (
      <Image
        src="/chrome_webstore.png"
        alt=""
        width={28}
        height={28}
        className="h-7 w-auto"
      />
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 text-brand-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
    </svg>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-ink-900/8 bg-white p-7 sm:p-9">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50">
        <ProductSymbol icon={product.icon} />
      </span>
      <h3 className="mt-6 text-[1.6rem] leading-tight font-semibold tracking-[-0.03em] text-ink-900 sm:text-[1.85rem]">
        {product.name}
      </h3>
      <p className="mt-1.5 text-[14px] font-medium text-brand-600">
        {product.kind}
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-900/65">
        {product.description}
      </p>
    </article>
  );
}

export function Products() {
  return (
    <section id="products" className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          title="Products"
          description="Two ways into the same memory layer. People first, then apps."
        />

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2 md:gap-6">
          {products.map((product, index) => (
            <Reveal key={product.name} delay={index * 0.08}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
