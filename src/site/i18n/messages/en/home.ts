/** The home page, top to bottom. */
export const home = {
  hero: {
    /** The owner's heading. The word in [brackets] shimmers. */
    title: "[Accelerating] Enterprise AI with Unified Context",
    /** The owner's paragraph, as he wrote it. */
    paragraph:
      "Coere accelerates enterprise AI productivity by unifying context and memory across the AI tools employees already use. Coere eliminates repetitive work, improves collaboration, and makes every AI interaction more effective.",
    extractionAlt: "Coere saving Maya's chats: 74 of 570 chats saved, about 5 minutes left, and ChatGPT at 18 of 240",
    graphAlt: "The Memory page's graph: Personal info, People, Tone and voice, Writing style and Work branching from the person",
  },
  ais: {
    title: "Transfer memory across every AI",
    line: "What you told one AI, the next one already knows.",
    loop: "The AIs Coere works with",
  },
  products: {
    title: "One memory for you, your team and your app",
    line: "Pick the Coere that fits, and see what it does.",
    kinds: { connect: "For users", solutions: "For teams", forge: "For developers" },
  },
  solves: {
    switchLabel: "Show AI without or with Coere",
    today: {
      tab: "Without Coere",
      title: "Every AI starts from zero",
      line: "Today, AI applications have fragmented memories of their users.",
      scenes: {
        switch: { title: "Switching AI to AI", line: "Every time someone switches applications, they start with zero context all over again." },
        newChat: { title: "A new chat in the same AI", line: "Even inside one app, a new chat doesn't know your projects, your preferences or your history, so you re-explain yourself every time." },
        longChat: { title: "Inside one long chat", line: "Earlier details get buried or dropped, and pasting everything back bloats the chat, so answers get worse." },
      },
      developers: { lead: "Developers have the same problem from the other side.", rest: "Every AI company builds its own isolated memory, and their apps still know nothing about a new user on day one." },
      waitlist: "Solve it for your app on the developer waitlist",
    },
    coere: {
      tab: "With Coere",
      title: "Memory that follows the person, not the app",
      line: "Coere is a universal, user-owned memory layer. It adds the context needed for each response, so the AI has what's relevant, nothing more.",
      scenes: {
        switch: { title: "In any app", line: "The next AI starts with what the last one learned, because your memory follows you." },
        newChat: { title: "In every new chat", line: "Your projects and preferences come in with your first message, so you never re-explain yourself." },
        longChat: { title: "At any point in a conversation", line: "The detail that got buried comes back when it matters, and the chat stays light." },
      },
      developers: { lead: "With user permission,", rest: "developers can integrate our API to access that context and personalize their apps from day one, instead of building their own memory systems." },
      waitlist: "Join the developer waitlist",
    },
  },
  faqTitle: "What people ask about Coere",
  blog: { title: "News from the team", read: "Read the blog" },
  closing: {
    title: "Your memory belongs to you.",
    text: "Talk to the founders about Coere for you, your team or your app.",
  },
} as const;
