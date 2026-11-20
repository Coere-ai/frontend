import Image from "next/image";
import Link from "next/link";
import { features } from "@/site/content/features";
import { products } from "@/site/content/products";
import { Underlined } from "@/site/ui/underlined";
import { PanelLabel } from "./panel-parts";

/**
 * Products menu: the four products left to right, large, then the features
 * as plain links, each opening that feature in Capabilities on the Agents
 * page, where it plays live, and Pricing under them.
 */
export function ProductsPanel() {
  return (
    <div className="grid grid-cols-[repeat(4,minmax(0,1fr))_168px] grid-rows-[auto_auto_auto_1fr] gap-x-7 2xl:grid-cols-[repeat(4,minmax(0,1fr))_184px] 2xl:gap-x-9">
      {/* Each card spans the four shared rows, so the images line up whatever the text length. */}
      {products.map((product) => (
        <Link key={product.slug} href={`/products/${product.slug}`} className="group row-span-4 grid grid-rows-subgrid">
          <p className="text-[13px] font-medium text-white/60">{product.kind}</p>
          <h3 className="mt-1.5 text-[24px] font-medium tracking-[-0.03em] text-white 2xl:text-[28px]">
            <Underlined big>{product.name}</Underlined>
          </h3>
          <p className="mt-2.5 text-[15px] leading-snug text-white/60">{product.description}</p>
          <div className="mt-6 self-start overflow-hidden rounded-2xl">
            <Image src={product.image} alt={`${product.name} artwork`} width={754} height={421} unoptimized className="aspect-[754/421] w-full object-cover" />
          </div>
        </Link>
      ))}

      <div className="row-span-4 pl-7">
        <PanelLabel>Features</PanelLabel>
        <ul className="mt-3 space-y-0.5">
          {features.filter((feature) => feature.menu !== false).map((feature) => (
            <li key={feature.slug}>
              <Link href={feature.href} className="group block py-1.5 text-[15px] text-white/70 transition-colors hover:text-white">
                <Underlined>{feature.name}</Underlined>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/pricing" className="group mt-5 block border-t border-white/10 pt-4 text-[15px] font-medium text-white">
          <Underlined>Pricing</Underlined>
        </Link>
      </div>
    </div>
  );
}
