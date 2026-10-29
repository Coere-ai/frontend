import { field } from "../../../demos/industries/fields/legal.mjs";
import type { World } from "../../stage/world";
import { FILM_NOW } from "./clock";

/**
 * Coere's Apps section (Coere Forge, console/apps) for the firm's matter
 * desk, in the shapes coere-server answers it: the v3 film's baked reads
 * (films/v3/data/apps.json) with the matter desk in place of the planner.
 * The desk asks from its own code for read access to Clients only; Nina
 * allows it; it gets a token of its own, and the terminal prints what the
 * context API sent it. The film moves the step as the terminal runs each
 * command, as the commands moved the real server.
 */
export type AppStep = "paired" | "asked" | "allowed";

const iso = (ms: number) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
const NAME = field.app.name;
export const CODE = "7KQM-2HDR";
const SCOPES = ["memory:read", "memory:evidence"];
const SECTIONS = ["Clients"];
const TOKEN = "tok_01M64C8RZ1V9KX3QWB7D2HT5NE";

const status = (apps: number, connects: number) => ({
  state: "ok",
  url: "http://127.0.0.1:36679",
  lastOkAt: iso(FILM_NOW),
  nextTryAt: null,
  pending: 0,
  shareSensitive: false,
  apps,
  suggestions: 0,
  connects,
  demoOnServer: false,
});

const READS: Record<AppStep, { status: unknown; tokens: unknown[]; connects: unknown[] }> = {
  paired: { status: status(0, 0), tokens: [], connects: [] },
  asked: {
    status: status(0, 1),
    tokens: [],
    connects: [{ id: "con_01M64C8QJ7Y2WN5FZ0TA4RB9KD", name: NAME, code: CODE, scopes: SCOPES, sections: SECTIONS, createdAt: iso(FILM_NOW), expiresAt: iso(FILM_NOW + 600_000) }],
  },
  allowed: {
    status: status(1, 0),
    tokens: [{ id: TOKEN, name: NAME, scopes: SCOPES, sections: SECTIONS, hint: "M4QD", createdAt: iso(FILM_NOW), lastUsedAt: null, expiresAt: null }],
    connects: [],
  },
};

export class Apps {
  step: AppStep = "paired";
  constructor(private readonly world: World) {}

  install(): void {
    const read = () => READS[this.step];
    this.world
      .engine("access.status", () => read().status)
      .engine("access.syncNow", () => read().status)
      .engine("access.tokens.list", () => read().tokens)
      .engine("access.contextLog", () => [])
      .engine("access.connects.list", () => read().connects)
      .engine("access.requests", () => [])
      .engine("access.suggestions.list", () => [])
      .engine("access.connects.decide", () => {
        this.go("allowed");
        return { tokenId: TOKEN };
      });
  }

  /** Moves the section to a step, and tells the pages, as the worker's access.status event does. */
  go(to: AppStep): void {
    this.step = to;
    this.world.tell({ ch: "coere", type: "engine.event", event: { name: "access.status", status: READS[to].status } });
  }
}

/** What the matter desk prints: its ask for access, then the context the API answers for its question. */
export const TERMINAL = {
  connect: { command: `uv run ${NAME} --connect`, asked: `Open Apps in Coere and allow ${NAME}. Code ${CODE}.`, allowed: `Allowed. The token is saved in ~/${NAME}/.env.` },
  ask: {
    command: `uv run ${NAME} "${field.app.ask}"`,
    out: [
      "[Context from Coere, my saved memory. Use it if it helps.]",
      ...field.app.sections.flatMap((s) => [s.path, ...s.facts.map((f) => `- ${f}`)]),
      "[End of context from Coere]",
      "",
      `From ${field.app.from} chats`,
      ...field.app.reasons.map(([path, why]) => `  ${path}: ${why}`),
    ].join("\n"),
  },
};
