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

export const founders = [
  {
    name: "Michelle Dong",
    role: "Co-founder, CEO",
    affiliation: "Haas School of Business, UC Berkeley",
    photo: "/founders/michelle-dong.jpeg",
    // Zooms the wide-framed original in on the face so both portraits match.
    photoClassName: "scale-[2.1] origin-[51%_46%]",
  },
  {
    name: "Edison Law",
    role: "Co-founder, CTO",
    affiliation: "Engineering, UC Berkeley",
    photo: "/founders/edison-law.jpeg",
    photoClassName: "",
  },
] as const;
