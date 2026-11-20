import { pricing as en } from "@/site/i18n/messages/en/pricing";
import type { Messages } from "@/site/i18n/messages/types";
import { contactHref, demoHref, demoLabel, startHref, startLabel } from "./navigation";

/**
 * Coere's three plans, as the pricing cards show them. The site names no
 * prices, so only Free shows an amount; Team asks to talk and Developer
 * says how it is counted. Each feature is one the product pages, the docs
 * or the owner already claim (SSO, audit logs, unlimited transfers and
 * extraction are the owner's words).
 */
export type Plan = {
  key: "consumer" | "team" | "developer";
  name: string;
  /** Who it is for, in a few words. */
  kind: string;
  price: string;
  /** What the price means, under it. */
  priceNote: string;
  line: string;
  features: string[];
  cta: { href: string; label: string };
  /** The one card that stands out. */
  featured?: boolean;
};

/** The cards' links and which one stands out; the words come from the messages (pricing.plans). */
const base: Pick<Plan, "key" | "cta" | "featured">[] = [
  { key: "consumer", cta: { href: startHref, label: startLabel } },
  { key: "team", cta: { href: demoHref, label: demoLabel }, featured: true },
  { key: "developer", cta: { href: contactHref, label: "Join the waitlist" } },
];

/** The plans in a language: the same cards and links, each word from that language's messages. */
export function plansIn(words: Messages["pricing"]): Plan[] {
  return base.map((plan) => {
    const { cta, features, ...copy } = words.plans[plan.key];
    return { ...plan, ...copy, features: [...features], cta: { href: plan.cta.href, label: cta } };
  });
}

/** The plans in English. */
export const plans: Plan[] = plansIn(en);
