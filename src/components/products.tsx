import Image from "next/image";
import { Container, Reveal, SectionHeading } from "@/components/ui";
import { products, type Product } from "@/lib/site";

/** One glyph per product: a browser window for the connector, code for the developer layer. */
function ProductGlyph({ index }: { index: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {index === 0 ? (
        <>
          <rect x="3" y="4.5" width="18" height="15" rx="3" />
          <path d="M3 9.5h18M6.5 7h.01M9 7h.01" />
        </>
      ) : (
        <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
      )}
    </svg>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-ink-900/8 bg-white p-7 sm:p-9">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[11.5px] font-medium tracking-[0.12em] text-brand-600 uppercase">
          {product.phase}
          <span className="text-ink-900/30"> / </span>
          <span className="text-ink-900/50">{product.stage}</span>
        </p>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <ProductGlyph index={index} />
        </span>
      </div>

      <h3 className="mt-5 text-[1.6rem] leading-tight font-semibold tracking-[-0.03em] text-ink-900 sm:text-[1.85rem]">
        {product.name}
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-900/65">
        {product.description}
      </p>

      <div className="mt-6 rounded-2xl bg-brand-50/70 px-5 py-4">
        <p className="text-[11.5px] font-semibold tracking-[0.1em] text-ink-900/45 uppercase">
          What this phase is for
        </p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-900/75">
          {product.purpose}
        </p>
      </div>

      <ul className="mt-auto flex flex-wrap gap-2 pt-6">
        {product.tags.map((tag) => (
          <li
            key={tag}
            className="flex items-center gap-1.5 rounded-lg border border-ink-900/8 bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-ink-900/70"
          >
            {tag === "Chrome extension" ? (
              <Image
                src="/chrome_webstore.png"
                alt=""
                width={14}
                height={14}
                className="h-3.5 w-auto"
              />
            ) : null}
            {tag}
          </li>
        ))}
      </ul>
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
              <ProductCard product={product} index={index} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
