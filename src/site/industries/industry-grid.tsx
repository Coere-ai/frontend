import Link from "@/site/i18n/link";
import { PixelPicture } from "@/site/art/pixel-picture";
import { standardNames } from "@/site/content/compliance";
import { industriesIn } from "@/site/content/industries";
import { getMessages } from "@/site/i18n/server";
import { format } from "@/site/i18n/types";
import { Underlined } from "@/site/ui/underlined";
import { IndustryIcon } from "@/site/ui/icons/industry-icons";
import { Reveal } from "@/site/ui/reveal";

/**
 * Every industry as a card that opens its page, its photo drawn as the
 * same pixel picture the page opens on, still and small.
 */
export async function IndustryGrid() {
  const { catalog, industryPages } = await getMessages();
  const industries = industriesIn(catalog);
  return (
    <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
      {industries.map((industry, index) => (
        <Reveal key={industry.slug} delay={(index % 3) * 0.05}>
          <Link id={industry.slug} href={`/industries/${industry.slug}`} className="group block scroll-mt-28">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-[#0b0a12] shadow-[0_28px_70px_-34px_rgba(23,27,77,0.35)] dark:shadow-none dark:ring-1 dark:ring-white/10">
              <PixelPicture photo={industry.photo.src} focus={industry.photo.focus} label={industry.photo.alt} cell={3} source={960} className="transition-[filter] duration-500 group-hover:brightness-125" />
            </div>
            <div className="mt-6 flex items-center gap-3 text-neutral-950 dark:text-white">
              <IndustryIcon name={industry.icon} size={28} />
              <h3 className="text-2xl font-semibold tracking-[-0.03em]"><Underlined big>{industry.name}</Underlined></h3>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-600 dark:text-white/65">{industry.summary}</p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
              {industry.uses.map((use) => (
                <li key={use} className="text-[13px] font-medium text-brand-600 dark:text-brand-300">
                  {use}
                </li>
              ))}
            </ul>
            {standardNames(industry.slug) ? (
              <p className="mt-4 text-[13px] leading-relaxed text-neutral-500 dark:text-white/55">{format(industryPages.index.willMeet, { standards: standardNames(industry.slug) ?? "" })}</p>
            ) : null}
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

/** Credit for the photos, which come from Unsplash. */
export async function PhotoCredits() {
  const { catalog, industryPages } = await getMessages();
  const names = industriesIn(catalog).map((industry) => industry.photo.by).join(", ");
  return <p className="mt-16 text-[13px] text-neutral-400 dark:text-white/50">{format(industryPages.index.credits, { names })}</p>;
}
