import Link from "next/link";
import type { Industry } from "@/site/content/industries";
import { Container } from "@/site/ui/container";
import { hoverUnderline } from "@/site/ui/hover-underline";
import { SizedPhoto } from "@/site/ui/sized-photo";

/** Three other industries as photo cards, so a reader can move across fields. */
export function MoreIndustries({ current, all }: { current: string; all: Industry[] }) {
  const start = all.findIndex((i) => i.slug === current);
  const others = [1, 2, 3].map((step) => all[(start + step) % all.length]);
  return (
    <section className="border-t border-neutral-100 bg-neutral-50 py-24">
      <Container>
        <p className="text-sm font-medium text-neutral-500">More industries</p>
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {others.map((industry) => (
            <li key={industry.slug}>
              <Link href={`/industries/${industry.slug}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-neutral-200">
                  <SizedPhoto src={industry.photo.src} alt={industry.photo.alt} fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover" />
                </div>
                <p className={`mt-4 text-xl font-medium tracking-[-0.02em] text-neutral-950 ${hoverUnderline}`}>{industry.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
