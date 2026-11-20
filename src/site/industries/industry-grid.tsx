import Link from "next/link";
import { standardNames } from "@/site/content/compliance";
import { industries } from "@/site/content/industries";
import { Underlined } from "@/site/ui/underlined";
import { IndustryIcon } from "@/site/ui/icons/industry-icons";
import { Reveal } from "@/site/ui/reveal";
import { SizedPhoto } from "@/site/ui/sized-photo";

/**
 * Every industry as a photo card that opens its page. The photos are 4K,
 * saved at smaller widths too, so each screen loads the size it needs.
 */
export function IndustryGrid() {
  return (
    <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
      {industries.map((industry, index) => (
        <Reveal key={industry.slug} delay={(index % 3) * 0.05}>
          <Link id={industry.slug} href={`/industries/${industry.slug}`} className="group block scroll-mt-28">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-neutral-100 shadow-[0_28px_70px_-34px_rgba(23,27,77,0.35)] dark:bg-white/5 dark:shadow-none dark:ring-1 dark:ring-white/10">
              <SizedPhoto
                src={industry.photo.src}
                alt={industry.photo.alt}
                fill
                sizes="(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <div className="mt-6 flex items-center gap-3 text-neutral-950 dark:text-white">
              <IndustryIcon name={industry.icon} size={28} />
              <h3 className="text-2xl font-semibold tracking-[-0.03em]"><Underlined big>{industry.name}</Underlined></h3>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-600 dark:text-white/65">{industry.summary}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {industry.uses.map((use) => (
                <li key={use} className="rounded-full bg-brand-50 px-3 py-1 text-[13px] text-brand-700 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-200 dark:ring-brand-400/25">
                  {use}
                </li>
              ))}
            </ul>
            {standardNames(industry.slug) ? (
              <p className="mt-4 text-[13px] leading-relaxed text-neutral-500 dark:text-white/55">Coere will meet {standardNames(industry.slug)}.</p>
            ) : null}
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

/** Credit for the photos, which come from Unsplash. */
export function PhotoCredits() {
  const names = industries.map((industry) => industry.photo.by).join(", ");
  return <p className="mt-16 text-[13px] text-neutral-400 dark:text-white/50">Photos on Unsplash by {names}.</p>;
}
