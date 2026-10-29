import Link from "next/link";
import { industries } from "@/site/content/industries";
import { hoverUnderline } from "@/site/ui/hover-underline";
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
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-neutral-100">
              <SizedPhoto
                src={industry.photo.src}
                alt={industry.photo.alt}
                fill
                sizes="(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="mt-6 flex items-center gap-3 text-neutral-950">
              <IndustryIcon name={industry.icon} size={28} />
              <h3 className={`text-2xl font-medium tracking-[-0.03em] ${hoverUnderline}`}>{industry.name}</h3>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-500">{industry.summary}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {industry.uses.map((use) => (
                <li key={use} className="rounded-full border border-neutral-200 px-3 py-1 text-[13px] text-neutral-700">
                  {use}
                </li>
              ))}
            </ul>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

/** Credit for the photos, which come from Unsplash. */
export function PhotoCredits() {
  const names = industries.map((industry) => industry.photo.by).join(", ");
  return <p className="mt-16 text-[13px] text-neutral-400">Photos on Unsplash by {names}.</p>;
}
