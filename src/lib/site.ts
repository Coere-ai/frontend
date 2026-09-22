/**
 * Single source of truth for copy + links used across the marketing site.
 */
export const siteConfig = {
  name: "Coere",
  legalName: "Coere AI",
  tagline: "Building the memory layer of the future",
  domain: "coere.ai",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://coere.ai",
  description: "Building the memory layer of the future.",
  email: "coereagent@gmail.com",
} as const;

export const navLinks = [
  { href: "#what-we-do", label: "What we do" },
  { href: "#products", label: "Products" },
  { href: "#who-we-are", label: "Who we are" },
] as const;

/** Agents that ride the orbit. Logos live in /public. */
export const agents = [
  { name: "ChatGPT", logo: "/openai.svg" },
  { name: "Claude", logo: "/claude-color.svg" },
  { name: "Gemini", logo: "/gemini-color.svg" },
  { name: "Perplexity", logo: "/perplexity-color.svg" },
  { name: "Grok", logo: "/grok.svg" },
  { name: "Copilot", logo: "/copilot-color.svg" },
  { name: "Meta AI", logo: "/meta-color.svg" },
  { name: "Kimi", logo: "/kimi.svg" },
  { name: "DeepSeek", logo: "/deepseek-color.svg" },
] as const;

export type Product = {
  name: string;
  /** What it is, in a few words: the extension, or the developer surface. */
  kind: string;
  /** Which symbol the card shows. */
  icon: "chrome" | "code";
  /** What the product does, in one breath. */
  description: string;
};

/** Two ways into the same memory layer: the extension for people, the API for apps. */
export const products: readonly Product[] = [
  {
    name: "Coere Connect",
    kind: "Chrome extension",
    icon: "chrome",
    description:
      "A Chrome extension that carries your memory across every AI you use. Install it once, and a new chat in any of them picks up where the last one left off.",
  },
  {
    name: "Coere Developer",
    kind: "API, MCP and SDK",
    icon: "code",
    description:
      "The same memory layer, opened up to apps. Plug in through the API, MCP or SDK, and when a user signs in, your product already knows them.",
  },
] as const;

export type TeamMember = {
  name: string;
  role: string;
  /** Schools and programs, one per line. */
  education: readonly string[];
  /** Experience and accomplishments, kept to short bullets. */
  highlights: readonly string[];
  /** Portrait in /public. Falls back to initials when missing. */
  photo?: string;
  /** Extra classes on the portrait, e.g. to zoom a wide crop in on the face. */
  photoClassName?: string;
};

export const founders: readonly TeamMember[] = [
  {
    name: "Michelle Dong",
    role: "Co-founder, CEO",
    education: ["Business, Berkeley Haas", "Computer Science, UC Berkeley"],
    highlights: [
      "Came up with Coere while building an AI app for gym users and re-explaining the project to every AI she switched to",
      "Owns the product side and works in the codebase with Edison",
      "Before Coere, scaled a business to 25 locations across the Bay Area",
    ],
    photo: "/founders/michelle-dong.jpeg",
    // Zooms the wide-framed original in on the face so both portraits match.
    photoClassName: "scale-[2.1] origin-[51%_46%]",
  },
  {
    name: "Edison Law",
    role: "Co-founder, CTO",
    education: ["EECS and Bioengineering, UC Berkeley", "Walt Disney Scholar"],
    highlights: [
      "Software engineer at Optagon Labs, owning production backend APIs, databases, authentication, billing, cloud infrastructure and security",
      "Three years building secure full-stack cloud applications",
      "Built ML pipelines for medical imaging and contributed to the MDAnalysis open source project",
      "Shipped apps used by over 5,000 people",
      "Leads engineering at Coere",
    ],
    photo: "/founders/edison-law.jpeg",
  },
] as const;

export const executives: readonly TeamMember[] = [
  {
    name: "Sarah Shelke",
    role: "COO and CMO",
    education: ["Economics and Neuroscience, UC Berkeley"],
    highlights: [
      "Co-founded Mind4Youth at 14, now one of the largest youth-led mental health nonprofits in the world",
      "170+ chapters, 25,000+ volunteers in 71 countries, 2.5 million people reached and $519,000+ raised",
      "Partnerships with the United Nations, Google and BetterHelp",
      "Named to TIME's inaugural Visionaries list and a Forbes 30 Under 30 semifinalist",
      "Top 3 finalist for the International Children's Peace Prize and winner of the JED Foundation's Student Voice of Mental Health Award",
      "Leads go-to-market and adoption at Coere",
    ],
    photo: "/founders/sarah-shelke.jpeg",
  },
] as const;
