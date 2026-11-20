/**
 * The blog's index and the cards that list posts (the home page, the
 * menus). The posts themselves are in English for now; their titles and
 * summaries are here so every list of them reads in the page's language.
 */
export const blog = {
  title: "The Coere blog",
  line: "News, launches and notes from the team building the memory layer you own.",
  readNewest: "Read the newest post",
  more: "More posts",
  filterLabel: "Filter posts by category",
  all: "All",
  categories: { Company: "Company", Product: "Product", Developers: "Developers" },
  count: { one: "{count} post", other: "{count} posts" },
  countIn: { one: "{count} post in {category}", other: "{count} posts in {category}" },
  minutes: "{minutes} min read",
  posts: {
    "coere-is-venture-backed": {
      title: "Coere is now venture backed",
      excerpt: "We raised venture funding at a $2 million valuation. Here is what the money is for, and what stays the same.",
    },
    "introducing-coere-connect": {
      title: "Introducing Coere Connect, one memory across every AI",
      excerpt: "Your chats with every AI, saved in one place and brought into each new chat.",
    },
    "coere-solutions": {
      title: "Coere Solutions: one memory for your whole team",
      excerpt: "Company knowledge and every client, remembered across the team.",
    },
    "coere-forge": {
      title: "Forge: give your app a memory on day one",
      excerpt: "The API, MCP server and SDKs for building on Coere.",
    },
    "catalyst-26": {
      title: "Catalyst 26: what we're building this year",
      excerpt: "Where Coere is headed, and why memory should belong to people.",
    },
  },
} as const;
