/**
 * Single source of truth for copy + links used across the marketing site.
 */
export const siteConfig = {
  name: "Coere",
  legalName: "Coere AI",
  tagline: "The memory layer you own, across every AI",
  domain: "coere.ai",
  /**
   * The canonical origin, with no trailing slash. The apex coere.ai redirects
   * here, so canonical links, the sitemap and structured data all use www.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.coere.ai",
  /** For search results and link previews; not shown on the page. */
  title: "Coere | Portable AI memory you own, across every AI",
  /**
   * The one line that says what Coere is, everywhere it is said: meta
   * descriptions, structured data, llms.txt and the pages themselves. Keep
   * them in step when it changes.
   */
  description:
    "Coere is a portable AI memory layer you own. It saves your chats from ChatGPT, Claude, Gemini and more, and brings the right context into every new chat.",
  /** The longer version, for structured data and llms.txt. Only what the site shows. */
  summary:
    "Coere (Coere AI) is a user-owned, portable AI memory layer. Coere Connect, a Chrome extension, saves your chats from ChatGPT, Claude, Gemini, DeepSeek, Perplexity, Grok, Copilot, Meta AI and Kimi on your computer, builds a memory graph from them, and adds the right context to each new chat as you type. Coere Solutions shares one memory across a team and its clients, Coere Forge lets apps and AI agents read a person's memory with their permission, and Coere Agents is Cori, who works from that memory.",
  /** Said plainly wherever the name might be misread. */
  notCohere: "Coere is not Cohere and is not affiliated with it. The name comes from the Latin cohaerere, to connect.",
  email: "edisonlaw@berkeley.edu",
  /** Profiles that speak for Coere, for search engines (schema.org sameAs). */
  profiles: [
    "https://www.linkedin.com/company/coere",
    "https://github.com/Coere-ai",
  ],
} as const;

/** The AIs Coere works with, and their logos in /public. `mono` marks a logo drawn in black alone, which a dark page shows white. */
export const agents = [
  { name: "ChatGPT", logo: "/openai.svg", mono: true },
  { name: "Claude", logo: "/claude-color.svg", mono: false },
  { name: "Gemini", logo: "/gemini-color.svg", mono: false },
  { name: "Perplexity", logo: "/perplexity-color.svg", mono: false },
  { name: "Grok", logo: "/grok.svg", mono: true },
  { name: "Copilot", logo: "/copilot-color.svg", mono: false },
  { name: "Meta AI", logo: "/meta-color.svg", mono: false },
  { name: "Kimi", logo: "/kimi.svg", mono: true },
  { name: "DeepSeek", logo: "/deepseek-color.svg", mono: false },
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
  /**
   * Zooms a wide portrait in on the face, so every portrait frames its face
   * alike: scaled by `zoom` around the point `x`, `y` (fractions of the
   * photo's width and height), as a CSS scale with that origin would.
   */
  photoCrop?: { zoom: number; x: number; y: number };
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
    // The original is framed wide, so it zooms in to match the other portrait.
    photoCrop: { zoom: 2.1, x: 0.51, y: 0.46 },
  },
  {
    name: "Edison Law",
    role: "Co-founder, CTO",
    school: "UC Berkeley",
    majors: ["EECS", "Bioengineering"],
    highlights: [
      "Software engineer at Optagon Labs, owning production backend APIs, databases, authentication, billing, cloud infrastructure and security",
      "Shipped apps used by over 10,000 people, including multiple featured by Google",
      "Builds robotics and automation software for a neuron-culture platform at Neurotech@Berkeley",
      "ML at Enhanced Ultrasound, building ultrasound segmentation pipelines",
      "Three years building secure full-stack cloud applications",
      "Regents' Scholar at multiple UC campuses, the UC system's most prestigious scholarship",
      "Walt Disney Scholar, issued by The Walt Disney Company",
    ],
    photo: "/founders/edison-law.jpeg",
  },
] as const;
