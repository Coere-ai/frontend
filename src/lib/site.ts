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
  /** Which symbol the card shows: the Chrome wheel, or code brackets. */
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
      "An app that carries your memory across every AI you use. Install it once, and a new chat in any of them picks up where the last one left off.",
  },
  {
    name: "Coere Developer",
    kind: "API, MCP and SDK",
    icon: "code",
    description:
      "Developers can read the memory layer through the API, MCP or SDK, making every user known on day one.",
  },
] as const;

export type TeamMember = {
  name: string;
  role: string;
  /** Shown as "School, Major and Major". */
  school: string;
  majors: readonly string[];
  /** Their own experience and accomplishments as short bullets, not their role at Coere. */
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
    school: "UC Berkeley",
    majors: ["Business", "Computer Science"],
    highlights: [
      "Scaled a business to 25 locations across the Bay Area",
      "Founded MyNeighborExpert, a platform connecting learners with local experts for coaching and tutoring in sports, academics and music",
      "Lectures 150+ students at Berkeley Haas on bringing 3D modeling and CAD tools into product development",
      "Interned on Sam Liccardo's campaign, working on fundraising and survey research",
      "Inspirit AI Scholar in machine learning and deep learning",
      "Competed in the 2024 Blue Ocean Student Entrepreneur Competition",
    ],
    photo: "/founders/michelle-dong.jpeg",
    // Zooms the wide-framed original in on the face so both portraits match.
    photoClassName: "scale-[2.1] origin-[51%_46%]",
  },
  {
    name: "Edison Law",
    role: "Co-founder, CTO",
    school: "UC Berkeley",
    majors: ["EECS", "Bioengineering"],
    highlights: [
      "Software engineer at Optagon Labs, owning production backend APIs, databases, authentication, billing, cloud infrastructure and security",
      "Shipped apps used by over 10,000 people, including multiple featured by Google",
      "Built ML pipelines for medical imaging and contributed to the MDAnalysis open source project",
      "Three years building secure full-stack cloud applications",
      "Regents Scholar at multiple UC campuses",
      "Walt Disney Scholar",
    ],
    photo: "/founders/edison-law.jpeg",
  },
] as const;

export const executives: readonly TeamMember[] = [
  {
    name: "Sarah Shelke",
    role: "COO and CMO",
    school: "UC Berkeley",
    majors: ["Economics", "Neuroscience"],
    highlights: [
      "Co-founded Mind4Youth at 14, now one of the largest youth-led mental health nonprofits in the world",
      "170+ chapters, 25,000+ volunteers in 71 countries, 2.5 million people reached and $519,000+ raised",
      "Partnerships with the United Nations, Google and BetterHelp",
      "Named to TIME's inaugural Visionaries list and a Forbes 30 Under 30 semifinalist",
      "Top 3 finalist for the International Children's Peace Prize and winner of the JED Foundation's Student Voice of Mental Health Award",
    ],
    photo: "/founders/sarah-shelke.jpeg",
  },
] as const;
