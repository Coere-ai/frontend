import type { LivePart } from "./live";

/**
 * A film of Coere, played live on Coere's real code (see demos/README.md):
 * the folder of its live demo in public/preview/live, and the chapters a
 * short showcase loops when a page shows the film small. Chapter ids come
 * from that film's script in demos/films.
 */
export type Film = { slug: string; title: string; showcase: LivePart };

export const films = {
  v2: { slug: "v2", title: "Coere v2: memory", showcase: { from: "import", to: "features" } },
  v3: { slug: "v3", title: "Coere v3: apps", showcase: { from: "asks", to: "planner" } },
  teams: { slug: "teams", title: "Coere for Teams", showcase: { from: "graph", to: "new-client" } },
  memory: { slug: "memory", title: "Memory", showcase: { from: "grow" } },
  extraction: { slug: "extraction", title: "Extraction", showcase: { from: "extract", to: "change" } },
  smartContext: { slug: "smart-context", title: "Smart context", showcase: { from: "type", to: "chat" } },
  voiceMode: { slug: "voice-mode", title: "Voice mode", showcase: { from: "hold", to: "cancel" } },
  coriChat: { slug: "cori-chat", title: "Cori chat", showcase: { from: "ask", to: "history" } },
  actionsGmail: { slug: "actions-gmail", title: "Actions in Gmail", showcase: { from: "ask", to: "send" } },
  actionsCalendar: { slug: "actions-calendar", title: "Actions in Calendar", showcase: { from: "review", to: "memory" } },
  coriRewrite: { slug: "cori-rewrite", title: "Cori Rewrite", showcase: { from: "select", to: "docs" } },
  actionsAnywhere: { slug: "actions-anywhere", title: "Actions on any site", showcase: { from: "answers", to: "form" } },
  workers: { slug: "workers", title: "Workers", showcase: { from: "handoff", to: "stop-all" } },
  forgeDev: { slug: "forge-dev", title: "Coere Forge: from a token to your AI", showcase: { from: "integrate", to: "anywhere" } },
  benchmarksEvals: { slug: "benchmarks-evals", title: "Benchmarks and Evals", showcase: { from: "estimate", to: "export" } },
} satisfies Record<string, Film>;

export type FilmKey = keyof typeof films;
