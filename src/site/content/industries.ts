import type { IndustryIconName } from "@/site/ui/icons/industry-icons";
import type { Product } from "./products";

/**
 * Industries Coere serves. The copy is placeholder for now: each line says
 * plainly what memory does there, and will be replaced with real stories.
 */
export type Industry = {
  slug: string;
  name: string;
  icon: IndustryIconName;
  summary: string;
  uses: string[];
};

/** One way to use Coere, tied to the product that does it. */
export type Application = {
  slug: string;
  name: string;
  summary: string;
  product: Product["slug"];
};

export const applications: Application[] = [
  {
    slug: "personal-context",
    name: "Personal context",
    summary: "Carry what you know from one AI to the next.",
    product: "connect",
  },
  {
    slug: "crm",
    name: "CRM and company knowledge",
    summary: "Every client, promise and decision in one shared memory.",
    product: "solutions",
  },
  {
    slug: "user-retention",
    name: "User retention",
    summary: "Apps that remember their users keep them.",
    product: "forge",
  },
];

export const industries: Industry[] = [
  { slug: "ai-apps", name: "AI apps", icon: "sparkles", summary: "Give every user a memory from their first message.", uses: ["Personal onboarding", "Context across sessions"] },
  { slug: "startups", name: "Startups", icon: "rocket", summary: "Small teams that never lose what they decided.", uses: ["Shared company memory", "Investor and customer notes"] },
  { slug: "finance", name: "Finance", icon: "chart", summary: "Client history at hand for every advisor.", uses: ["Client memory", "Meeting follow ups"] },
  { slug: "technology", name: "Technology", icon: "cpu", summary: "Engineering context that follows the work.", uses: ["Project memory", "Agent context"] },
  { slug: "energy", name: "Energy", icon: "bolt", summary: "Field knowledge that stays with the company.", uses: ["Site and asset notes", "Handover memory"] },
  { slug: "healthcare", name: "Healthcare", icon: "pulse", summary: "Care teams that start from the full picture.", uses: ["Care team context", "Research memory"] },
  { slug: "education", name: "Education", icon: "cap", summary: "Students and teachers who pick up where they left off.", uses: ["Course memory", "Study context"] },
  { slug: "legal", name: "Legal", icon: "scale", summary: "Matters and precedents remembered across the firm.", uses: ["Matter memory", "Client history"] },
  { slug: "retail", name: "Retail", icon: "bag", summary: "Shoppers recognized on every channel.", uses: ["Customer memory", "Support context"] },
  { slug: "media", name: "Media", icon: "film", summary: "Stories, sources and style kept in one place.", uses: ["Newsroom memory", "Brand voice"] },
];
