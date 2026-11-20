/** The three plans, on the home page and the pricing page. */
export const pricing = {
  title: "A plan for you, your team or your app",
  line: "Coere is free for one person. Teams and developers talk to us.",
  plansLabel: "Plans",
  plans: {
    consumer: {
      name: "Consumer",
      kind: "For you",
      price: "Free",
      priceNote: "Coere Connect, for one person",
      line: "One memory you own, in every AI you use.",
      features: ["Unlimited transfers between AIs", "Unlimited extraction of your chats", "One memory across ChatGPT, Claude, Gemini and more", "Local first, with a backup on coere.ai"],
      cta: "Start for free",
    },
    team: {
      name: "Team",
      kind: "For companies",
      price: "Contact us",
      priceNote: "Coere Solutions, for your whole team",
      line: "One shared memory for the company, its people and its clients.",
      features: ["Enterprise security", "Single sign on (SSO)", "Audit logs", "A shared team memory", "Admin controls for invites, roles and access"],
      cta: "Book a demo",
    },
    developer: {
      name: "Developer",
      kind: "For your app",
      price: "Per user",
      priceNote: "Coere Forge, usage based",
      line: "Give your app's users the memory they already built.",
      features: ["The memory API", "An MCP server for your agents", "TypeScript and Python SDKs", "Scoped tokens the person can revoke", "Usage based, per user"],
      cta: "Join the waitlist",
    },
  },
  closing: { title: "Not sure which plan fits?", text: "Talk to the founders about Coere for you, your team or your app." },
} as const;
