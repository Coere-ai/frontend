import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { productBySlug, products } from "@/site/content/products";
import { productSeo } from "@/site/content/seo";
import { ProductPage } from "@/site/products/product-page";
import { JsonLd, productGraph } from "@/site/seo/json-ld";

/** Only the three products exist; any other slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = productBySlug((await params).slug);
  return product ? pageMetadata({ ...productSeo[product.slug], path: `/products/${product.slug}` }) : {};
}

export default async function Page({ params }: PageProps<"/products/[slug]">) {
  const product = productBySlug((await params).slug);
  if (!product) notFound();
  return (
    <>
      <JsonLd data={productGraph(product)} />
      <ProductPage product={product} />
    </>
  );
}
