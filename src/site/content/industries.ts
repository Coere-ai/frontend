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
  /** A photo from Unsplash, free to use under the Unsplash License, saved at 960, 1920 and 3840 wide. */
  photo: { src: string; alt: string; by: string };
};

/** Industry photos are private like the rest of the new site. */
const photo = (slug: string, alt: string, by: string) => ({ src: `/preview/images/industries/${slug}.webp`, alt, by });

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
  {
    slug: "finance",
    name: "Finance",
    icon: "chart",
    summary: "Every advisor starts from the client's full history.",
    uses: ["Client memory", "Meeting follow ups"],
    photo: photo("finance", "The New York Stock Exchange on Wall Street", "David Vives"),
  },
  {
    slug: "technology",
    name: "Technology",
    icon: "cpu",
    summary: "Engineering context that follows the work from tool to tool.",
    uses: ["Project memory", "Agent context"],
    photo: photo("technology", "San Francisco at night with the Salesforce Tower", "Chris Briggs"),
  },
  {
    slug: "commerce",
    name: "Commerce",
    icon: "globe",
    summary: "Deals, partners and promises remembered across every market.",
    uses: ["Account memory", "Partner history"],
    photo: photo("commerce", "The Hong Kong skyline across Victoria Harbour", "I P"),
  },
  {
    slug: "consumer",
    name: "Consumer",
    icon: "cart",
    summary: "Shoppers recognized on every channel, with their say over what is kept.",
    uses: ["Customer memory", "Support context"],
    photo: photo("consumer", "A grocery store aisle with stocked shelves", "Franki Chamaki"),
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    icon: "factory",
    summary: "What the line learned stays with the plant, not one shift.",
    uses: ["Line and machine notes", "Handover memory"],
    photo: photo("manufacturing", "Robot arms on a factory assembly line", "Simon Kadula"),
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    icon: "pulse",
    summary: "Care teams that start from the full picture.",
    uses: ["Care team context", "Research memory"],
    photo: photo("healthcare", "Surgeons at work in an operating room", "Rodrigo Porto"),
  },
  {
    slug: "energy",
    name: "Energy",
    icon: "bolt",
    summary: "Field knowledge that stays with the company when people move on.",
    uses: ["Site and asset notes", "Handover memory"],
    photo: photo("energy", "Wind turbines on the Livermore hills above the fog", "Zetong Li"),
  },
  {
    slug: "education",
    name: "Education",
    icon: "cap",
    summary: "Students and teachers who pick up where they left off.",
    uses: ["Course memory", "Study context"],
    photo: photo("education", "Sather Tower at UC Berkeley", "Jeremy Huang"),
  },
  {
    slug: "legal",
    name: "Legal",
    icon: "scale",
    summary: "Matters and precedents remembered across the firm.",
    uses: ["Matter memory", "Client history"],
    photo: photo("legal", "The Supreme Court of the United States", "Joshua Woods"),
  },
];
