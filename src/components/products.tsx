import { Container, Reveal, SectionHeading } from "@/components/ui";
import { products, type Product } from "@/lib/site";

/**
 * The Chrome wheel, drawn flat so it needs nothing behind it. The blades share
 * seams, so a one-unit underlay runs along each seam and the blade drawn next
 * covers it. That keeps a white hairline from showing between the colors.
 */
function ChromeMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
      <path
        fill="#30A24F"
        d="M13.608 30L3.215 12A24 24 0 0 0 24 48L34.392 30Z"
      />
      <path
        fill="none"
        stroke="#30A24F"
        d="M13.608 30L3.815 13.039M34.392 30L24.6 46.961"
      />
      <path
        fill="#E13A2D"
        d="M24 12L44.785 12A24 24 0 0 0 3.215 12L13.608 30Z"
      />
      <path fill="none" stroke="#E13A2D" d="M24 12L43.585 12" />
      <path
        fill="#FBBC04"
        d="M34.392 30L24 48A24 24 0 0 0 44.785 12L24 12Z"
      />
      <circle cx="24" cy="24" r="12" fill="#fff" />
      <circle cx="24" cy="24" r="9.72" fill="#1A73E8" />
    </svg>
  );
}

/** The product's symbol: the Chrome wheel, or code brackets. */
function ProductSymbol({ icon }: { icon: Product["icon"] }) {
  if (icon === "chrome") return <ChromeMark />;
  return (
    <svg
      viewBox="0 0 24 24"
      // The glyph's ink starts a few pixels into its box; pull it flush with the title.
      className="-ml-1 h-9 w-9 text-brand-600"
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
      {/* Fixed height, so both titles line up whatever each symbol's shape. */}
      <div className="flex h-10 items-center">
        <ProductSymbol icon={product.icon} />
      </div>
      <h3 className="mt-5 text-[1.6rem] leading-tight font-semibold tracking-[-0.03em] text-ink-900 sm:text-[1.85rem]">
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
