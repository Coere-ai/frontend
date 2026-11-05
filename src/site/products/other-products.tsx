import Link from "next/link";
import { products, type Product } from "@/site/content/products";
import { Container } from "@/site/ui/container";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { Underlined } from "@/site/ui/underlined";

/** The other products, as plain links on the white page. */
export function OtherProducts({ current }: { current: Product["slug"] }) {
  const others = products.filter((p) => p.slug !== current);
  return (
    <section className="py-24">
      <Container>
        <p className="text-sm font-medium text-neutral-500">More from Coere</p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {others.map((product) => (
            <Link key={product.slug} href={`/products/${product.slug}`} className="group flex flex-col border-t border-neutral-200 pt-5">
              <p className="text-[13px] font-medium text-neutral-500">{product.kind}</p>
              <p className="mt-1 text-2xl font-medium tracking-[-0.03em] text-neutral-950"><Underlined big>{product.name}</Underlined></p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-neutral-950">
                Explore
                <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
