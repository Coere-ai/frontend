import Image from "next/image";
import Link from "next/link";
import { products, type Product } from "@/site/content/products";
import { SOFT_CARD } from "@/site/home/look";
import { Container } from "@/site/ui/container";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { Underlined } from "@/site/ui/underlined";

/** The other products, as cards with their artwork. */
export function OtherProducts({ current }: { current: Product["slug"] }) {
  const others = products.filter((p) => p.slug !== current);
  return (
    <section className="py-16 md:py-20">
      <Container>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">More from Coere</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {others.map((product) => (
            <Link key={product.slug} href={`/products/${product.slug}`} className={`group flex flex-col gap-5 p-3 transition-transform duration-300 hover:-translate-y-1 ${SOFT_CARD}`}>
              <div className="overflow-hidden rounded-[20px]">
                <Image src={product.image} alt={`${product.name} artwork`} width={754} height={421} unoptimized className="aspect-[754/421] w-full object-cover" />
              </div>
              <div className="px-3 pb-3">
                <p className="text-[13px] font-medium text-neutral-500 dark:text-white/55">{product.kind}</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white"><Underlined big>{product.name}</Underlined></p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-neutral-950 dark:text-white">
                  Explore
                  <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
