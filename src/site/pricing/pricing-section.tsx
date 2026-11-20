import { plansIn } from "@/site/content/pricing";
import { getMessages } from "@/site/i18n/server";
import { SECTION_TITLE, SECTION_Y } from "@/site/home/look";
import { Container } from "@/site/ui/container";
import { PlanCard } from "./plan-card";

/**
 * The three plans side by side, Team in the middle and raised. The home
 * page shows it with its heading; the pricing page has its own hero, so
 * there it drops the heading with `bare`.
 */
export async function PricingSection({ bare = false, id = "pricing" }: { bare?: boolean; id?: string }) {
  const t = (await getMessages()).pricing;
  const plans = plansIn(t);
  return (
    <section id={id} aria-label={bare ? t.plansLabel : undefined} className={`scroll-mt-24 ${bare ? "pb-24 md:pb-32" : SECTION_Y}`}>
      <Container>
        {bare ? null : (
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={SECTION_TITLE}>{t.title}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600 text-balance dark:text-white/65">{t.line}</p>
          </div>
        )}
        <div className={`mx-auto grid max-w-[1200px] items-stretch gap-5 lg:grid-cols-3 lg:gap-6 ${bare ? "" : "mt-14 md:mt-16"}`}>
          {plans.map((plan) => (
            <PlanCard key={plan.key} plan={plan} />
          ))}
        </div>
      </Container>
    </section>
  );
}
