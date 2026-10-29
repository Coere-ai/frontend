"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { features } from "@/site/content/features";
import { products } from "@/site/content/products";
import { FeaturePreview } from "./feature-preview";
import { PanelLabel } from "./panel-parts";
import { hoverUnderline } from "@/site/ui/hover-underline";

/**
 * Products menu: the three products left to right, then the features list,
 * then a live film of whichever feature is hovered. The film column needs
 * room, so it appears from xl screens up.
 */
export function ProductsPanel() {
  const [active, setActive] = useState(features[0]);

  return (
    <div className="grid grid-cols-[repeat(3,minmax(0,1fr))_168px] grid-rows-[auto_auto_auto_1fr] gap-x-8 xl:grid-cols-[repeat(3,minmax(0,1fr))_168px_minmax(0,300px)] 2xl:grid-cols-[repeat(3,minmax(0,1fr))_184px_340px]">
      {/* Each card spans the four shared rows, so the images line up whatever the text length. */}
      {products.map((product) => (
        <Link key={product.slug} href={`/products/${product.slug}`} className="group row-span-4 grid grid-rows-subgrid">
          <p className="text-[13px] font-medium text-neutral-500">{product.kind}</p>
          <h3 className={`mt-1.5 text-[22px] font-medium tracking-[-0.03em] text-neutral-950 2xl:text-[26px] ${hoverUnderline}`}>
            {product.name}
          </h3>
          <p className="mt-2 text-[14px] leading-snug text-neutral-500">{product.description}</p>
          <div className="mt-5 self-start overflow-hidden rounded-2xl">
            <Image
              src={product.image}
              alt={`${product.name} artwork`}
              width={754}
              height={421}
              unoptimized
              className="aspect-[754/421] w-full object-cover"
            />
          </div>
        </Link>
      ))}

      <div className="row-span-4 border-l border-neutral-200 pl-8">
        <PanelLabel>Features</PanelLabel>
        <ul className="mt-3 space-y-0.5">
          {features.map((feature) => (
            <li key={feature.slug}>
              <Link
                href={`/#${feature.slug}`}
                onMouseEnter={() => setActive(feature)}
                onFocus={() => setActive(feature)}
                className={`-mx-2.5 block rounded-lg px-2.5 py-1.5 text-[15px] transition-colors ${
                  active.slug === feature.slug ? "bg-neutral-100 text-neutral-950" : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                {feature.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="row-span-4 hidden xl:block">
        <FeaturePreview feature={active} />
      </div>
    </div>
  );
}
