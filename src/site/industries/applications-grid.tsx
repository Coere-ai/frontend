import Link from "next/link";
import { applications } from "@/site/content/industries";
import { productBySlug } from "@/site/content/products";
import { hoverUnderline } from "@/site/ui/hover-underline";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { applicationVisuals } from "./application-visuals";

/** Who Coere is for: consumer, developer and business, each with a small picture of what it gets. */
export function ApplicationsGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {applications.map((app) => {
        const product = productBySlug(app.product);
        if (!product) return null;
        return (
          <Link key={app.slug} id={app.slug} href={`/products/${product.slug}`} className="group flex scroll-mt-28 flex-col rounded-3xl bg-white p-3 ring-1 ring-neutral-200">
            <div className="flex aspect-[4/3] items-center rounded-2xl bg-neutral-50 p-6">
              <div className="w-full">{applicationVisuals[app.slug]}</div>
            </div>
            <div className="flex flex-1 flex-col px-3 pt-6 pb-4">
              <h3 className={`text-2xl font-medium tracking-[-0.03em] text-neutral-950 ${hoverUnderline}`}>{app.name}</h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-neutral-500">{app.summary}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-neutral-950">
                With {product.name}
                <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
