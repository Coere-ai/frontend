import Link from "next/link";
import type { Feature } from "@/site/content/features";
import { films, PREVIEW_START_SECONDS } from "@/site/content/films";
import type { Product } from "@/site/content/products";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { LazyVideo } from "@/site/ui/lazy-video";
import { Reveal } from "@/site/ui/reveal";

/**
 * One feature: words on one side, its film on the other. `flip` puts the
 * film first, so a list of rows alternates left and right.
 */
export function FeatureRow({ feature, product, flip }: { feature: Feature; product?: Product; flip: boolean }) {
  const film = films[feature.film];
  return (
    <div id={feature.slug} className="grid scroll-mt-28 items-center gap-10 md:grid-cols-12 md:gap-16">
      <Reveal className={`md:col-span-5 ${flip ? "md:order-2" : ""}`}>
        <p className="text-sm font-medium text-brand-500">{feature.name}</p>
        <h3 className="mt-3 text-3xl font-medium tracking-[-0.035em] text-neutral-950 text-balance md:text-[2.5rem] md:leading-[1.08]">
          {feature.title}
        </h3>
        <p className="mt-5 text-[17px] leading-relaxed text-neutral-500 text-pretty">{feature.description}</p>
        {product ? (
          <Link href={`/products/${product.slug}`} className="group mt-7 inline-flex items-center gap-1.5 text-[15px] font-medium text-neutral-950">
            In {product.name}
            <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </Reveal>
      <Reveal delay={0.08} className={`md:col-span-7 ${flip ? "md:order-1" : ""}`}>
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.25)]">
          <LazyVideo
            src={film.src}
            poster={film.still}
            label={`${feature.name} in action`}
            startAt={PREVIEW_START_SECONDS}
            className="block aspect-[1440/900] w-full object-cover"
          />
        </div>
      </Reveal>
    </div>
  );
}
