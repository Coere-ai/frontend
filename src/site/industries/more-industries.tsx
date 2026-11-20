import Link from "@/site/i18n/link";
import { PixelPicture } from "@/site/art/pixel-picture";
import type { Industry } from "@/site/content/industries";
import { Container } from "@/site/ui/container";
import { Underlined } from "@/site/ui/underlined";

/** Three other industries as cards with their pixel pictures, so a reader can move across fields. */
export function MoreIndustries({ current, all }: { current: string; all: Industry[] }) {
  const start = all.findIndex((i) => i.slug === current);
  const others = [1, 2, 3].map((step) => all[(start + step) % all.length]);
  return (
    <section className="py-16 md:py-20">
      <Container>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">More industries</h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {others.map((industry) => (
            <li key={industry.slug}>
              <Link href={`/industries/${industry.slug}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] bg-[#0b0a12] shadow-[0_28px_70px_-34px_rgba(23,27,77,0.35)] dark:shadow-none dark:ring-1 dark:ring-white/10">
                  <PixelPicture photo={industry.photo.src} focus={industry.photo.focus} label={industry.photo.alt} cell={3} source={960} className="transition-[filter] duration-500 group-hover:brightness-125" />
                </div>
                <p className="mt-4 text-xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white"><Underlined big>{industry.name}</Underlined></p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
