import type { FilmKey } from "./films";

/**
 * The films that play live, by the folder of their live demo in
 * public/preview/live (demos/films in this repo), and the part a short
 * showcase loops when a page shows the film small: chapter ids from that
 * film's script. A film missing here still plays its recording.
 */
export type LivePart = { from?: string; to?: string };

export const liveFilms: Partial<Record<FilmKey, { slug: string; showcase: LivePart }>> = {
  v2: { slug: "v2", showcase: { from: "context-as-you-type", to: "voice-mode" } },
  memory: { slug: "memory", showcase: { from: "grow" } },
  coriRewrite: { slug: "cori-rewrite", showcase: { from: "select", to: "docs" } },
  smartContext: { slug: "smart-context", showcase: { from: "type", to: "chat" } },
  extraction: { slug: "extraction", showcase: { from: "extract", to: "change" } },
  voiceMode: { slug: "voice-mode", showcase: { from: "hold", to: "cancel" } },
  actionsGmail: { slug: "actions-gmail", showcase: { from: "ask", to: "send" } },
  actionsAnywhere: { slug: "actions-anywhere", showcase: { from: "answers", to: "form" } },
  teams: { slug: "teams", showcase: { from: "graph", to: "new-client" } },
  v3: { slug: "v3", showcase: { from: "asks", to: "planner" } },
  workers: { slug: "workers", showcase: { from: "handoff", to: "stop-all" } },
  benchmarksEvals: { slug: "benchmarks-evals", showcase: { from: "estimate", to: "export" } },
  coriChat: { slug: "cori-chat", showcase: { from: "ask", to: "history" } },
  actionsCalendar: { slug: "actions-calendar", showcase: { from: "review", to: "memory" } },
};

