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

export const plans: Plan[] = [
  {
    key: "consumer",
    name: "Consumer",
    kind: "For you",
    price: "Free",
    priceNote: "Coere Connect, for one person",
    line: "One memory you own, in every AI you use.",
    features: [
      "Unlimited transfers between AIs",
      "Unlimited extraction of your chats",
      "One memory across ChatGPT, Claude, Gemini and more",
      "Local first, with a backup on coere.ai",
    ],
    cta: { href: startHref, label: startLabel },
  },
  {
    key: "team",
    name: "Team",
    kind: "For companies",
    price: "Contact us",
    priceNote: "Coere Solutions, for your whole team",
    line: "One shared memory for the company, its people and its clients.",
    features: ["Enterprise security", "Single sign on (SSO)", "Audit logs", "A shared team memory", "Admin controls for invites, roles and access"],
    cta: { href: demoHref, label: demoLabel },
    featured: true,
  },
  {
    key: "developer",
    name: "Developer",
    kind: "For your app",
    price: "Per user",
    priceNote: "Coere Forge, usage based",
    line: "Give your app's users the memory they already built.",
    features: ["The memory API", "An MCP server for your agents", "TypeScript and Python SDKs", "Scoped tokens the person can revoke", "Usage based, per user"],
    cta: { href: contactHref, label: "Join the waitlist" },
  },
];

/** The plans in a language: the same cards and links, each word from that language's messages. */
export function plansIn(words: Messages["pricing"]): Plan[] {
  return plans.map((plan) => {
    const { cta, features, ...copy } = words.plans[plan.key];
    return { ...plan, ...copy, features: [...features], cta: { href: plan.cta.href, label: cta } };
  });
}
