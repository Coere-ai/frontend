import { industries } from "@/site/content/industries";
import { IndustryIcon } from "@/site/ui/icons/industry-icons";
import { Reveal } from "@/site/ui/reveal";

/** Every industry as a card with its own anchor, so the menu can link straight to one. */
export function IndustryGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {industries.map((industry, index) => (
        <Reveal key={industry.slug} delay={(index % 5) * 0.05}>
          <article id={industry.slug} className="h-full scroll-mt-28 rounded-3xl border border-neutral-200 p-7 transition-colors target:border-neutral-950">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-neutral-100 text-neutral-950">
              <IndustryIcon name={industry.icon} size={20} />
            </span>
            <h3 className="mt-6 text-xl font-medium tracking-[-0.02em] text-neutral-950">{industry.name}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">{industry.summary}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {industry.uses.map((use) => (
                <li key={use} className="rounded-full bg-neutral-100 px-3 py-1 text-[13px] text-neutral-700">
                  {use}
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
