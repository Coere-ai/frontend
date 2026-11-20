/**
 * What each translated page says in search results and link previews: a
 * title of about 60 characters at most and a description of about 155.
 * The keywords stay in English in src/site/content/seo.ts.
 */
export const seo = {
  home: {
    title: "Coere | Portable AI memory you own, across every AI",
    description: "Coere is a portable AI memory layer you own. It saves your chats from ChatGPT, Claude, Gemini and more, and brings the right context into every new chat.",
  },
  pricing: {
    title: "Pricing: free for you, plans for teams and developers",
    description: "Coere is free for one person, with unlimited transfers and extraction across every AI. Teams get SSO and audit logs, and developers pay per user.",
  },
  blog: {
    title: "Blog",
    description: "The latest news, launches, and insights from Coere.",
  },
} as const;
