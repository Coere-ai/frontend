/**
 * Single source of truth for copy + links used across the marketing site.
 * Swap `chromeStoreUrl` for the real listing once the extension is published.
 */
export const siteConfig = {
  name: "Coere",
  legalName: "Coere AI",
  tagline: "Unified memory for AI",
  domain: "coere.ai",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://coere.ai",
  description:
    "Never explain your project twice. Coere carries your context across every AI you use, so any chat picks up right where you left off.",
  extensionName: "Coere, Continue Conversations across AI Agents",
  email: "coereagent@gmail.com",
  // TODO: replace with the Chrome Web Store listing URL at launch.
  chromeStoreUrl: "",
} as const;

export const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#why", label: "Why Coere" },
  { href: "#costs", label: "What it saves" },
  { href: "#team", label: "Our team" },
] as const;

/** Agents Coere runs inside. Logos live in /public. */
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

/** The chats that feed the example capsule. */
export const capsuleSources = [
  { name: "ChatGPT", logo: "/openai.svg", title: "Extension architecture" },
  {
    name: "Claude",
    logo: "/claude-color.svg",
    title: "Supabase schema and RLS",
  },
  {
    name: "Perplexity",
    logo: "/perplexity-color.svg",
    title: "Embedding models compared",
  },
  { name: "Meta AI", logo: "/meta-color.svg", title: "Onboarding copy pass" },
] as const;

/** Illustrative cost of one hand-off, used across the comparison sections. */
export const costs = {
  manualTokens: 10400,
  manualSeconds: 252,
  coereTokens: 240,
  coereSeconds: 5,
} as const;

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
