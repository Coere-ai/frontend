import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { productBySlug, products, productsIn } from "@/site/content/products";
import { productSeo } from "@/site/content/seo";
import { localizePath } from "@/site/i18n/locales";
import { getLocale, getMessages } from "@/site/i18n/server";
import { ProductPage } from "@/site/products/product-page";
import { JsonLd, productGraph } from "@/site/seo/json-ld";

/** Only the four products exist; any other slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/products/[slug]">): Promise<Metadata> {
  const product = productBySlug((await params).slug);
  if (!product) return {};
  const [locale, { productPages }] = await Promise.all([getLocale(), getMessages()]);
  return pageMetadata({ ...productSeo[product.slug], ...productPages[product.slug].seo, path: `/products/${product.slug}`, locale, translated: true });
}

export default async function Page({ params }: PageProps<"/[lang]/products/[slug]">) {
  const [locale, { catalog }] = await Promise.all([getLocale(), getMessages()]);
  const product = productBySlug((await params).slug, productsIn(catalog));
  if (!product) notFound();
  return (
    <>
      <JsonLd data={productGraph(product, localizePath(`/products/${product.slug}`, locale))} />
      <ProductPage product={product} />
    </>
  );
}
