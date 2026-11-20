import Image from "next/image";
import Link from "@/site/i18n/link";
import { productBySlug, productsIn, type Product } from "@/site/content/products";
import { getMessages } from "@/site/i18n/server";
import { format } from "@/site/i18n/types";
import { Container } from "@/site/ui/container";
import { Underlined } from "@/site/ui/underlined";

/** The three ways in, left to right. Coere Agents lives on its own page. */
const choices: Exclude<Product["slug"], "agents">[] = ["connect", "solutions", "forge"];

/**
 * The products under the logo loop: Coere Connect, Coere Solutions and
 * Coere Forge side by side, each a card that goes to its page, laid out
 * like the Product menu: who it is for, its name, one line and its artwork.
 */
export async function ProductsSection() {
  const { home, catalog, chrome } = await getMessages();
  const t = home.products;
  const list = productsIn(catalog);
  const cards = choices.flatMap((slug) => {
    const product = productBySlug(slug, list);
    return product ? [{ product, kind: t.kinds[slug] }] : [];
  });
  return (
    <section id="products" aria-labelledby="products-title" className="scroll-mt-24 pb-24 md:pb-32">
      <Container>
        <h2 id="products-title" className="text-center text-[26px] font-semibold tracking-[-0.03em] text-neutral-950 text-balance md:text-[32px] dark:text-white">
          {t.title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[16px] text-neutral-500 text-balance dark:text-white/60">{t.line}</p>
        <ul className="mt-12 grid gap-6 md:mt-14 md:grid-cols-3">
          {cards.map(({ product, kind }) => (
            <li key={product.slug}>
              <Link
                href={`/products/${product.slug}`}
                className="group flex h-full flex-col rounded-[28px] border border-neutral-950/10 bg-white p-6 transition-colors hover:border-neutral-950/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 md:p-7 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/25 dark:hover:bg-white/[0.06]"
              >
                <p className="text-[13px] font-medium text-brand-500 dark:text-brand-300">{kind}</p>
                <h3 className="mt-1.5 text-[24px] font-medium tracking-[-0.03em] text-neutral-950 md:text-[26px] dark:text-white">
                  <Underlined big>{product.name}</Underlined>
                </h3>
                <p className="mt-2.5 text-[15px] leading-snug text-neutral-500 dark:text-white/60">{product.description}</p>
                <div className="mt-auto pt-6">
                  <div className="overflow-hidden rounded-2xl">
                    <Image src={product.image} alt={format(chrome.nav.artwork, { name: product.name })} width={754} height={421} unoptimized className="aspect-[754/421] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
