import Link from "next/link";
import { applications } from "@/site/content/industries";
import { productBySlug } from "@/site/content/products";
import { SOFT_CARD } from "@/site/home/look";
import { Underlined } from "@/site/ui/underlined";
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
          <Link key={app.slug} id={app.slug} href={`/products/${product.slug}`} className={`group flex scroll-mt-28 flex-col p-3 transition-transform duration-300 hover:-translate-y-1 ${SOFT_CARD}`}>
            <div className="flex aspect-[4/3] items-center rounded-[20px] bg-[#f5f6fb] p-6 dark:bg-white/[0.035] dark:ring-1 dark:ring-white/[0.06]">
              <div className="w-full">{applicationVisuals[app.slug]}</div>
            </div>
            <div className="flex flex-1 flex-col px-3 pt-6 pb-4">
              <h3 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white"><Underlined big>{app.name}</Underlined></h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-neutral-500 dark:text-white/65">{app.summary}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-neutral-950 dark:text-white">
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
