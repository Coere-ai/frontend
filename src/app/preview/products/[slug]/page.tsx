import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { productBySlug, products } from "@/site/content/products";
import { ProductPage } from "@/site/products/product-page";

/** Only the three products exist; any other slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/preview/products/[slug]">): Promise<Metadata> {
  const product = productBySlug((await params).slug);
  return product ? { title: product.name, description: product.description } : {};
}

export default async function Page({ params }: PageProps<"/preview/products/[slug]">) {
  const product = productBySlug((await params).slug);
  if (!product) notFound();
  return <ProductPage product={product} />;
}
