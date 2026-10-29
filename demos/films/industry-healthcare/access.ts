import { field } from "../../../scripts/industries/fields/healthcare.mjs";
import type { World } from "../../stage/world";

/**
 * Coere Forge for Lakeshore: the dashboard's Apps section paired with the
 * team's coere-server, as the engine worker's access layer answers it
 * (engine/access, packages/api), in the shapes the v3 film baked from a
 * real server (demos/films/v3/data/apps.json). The site monitoring app
 * asks from its own code to read memory in Clients only, with no
 * sensitive memory and no right to write; Allow gives it its token.
 */

export const CODE = "7KQ2-M4PD";
const APP = field.app.name;

type Step = "paired" | "asked" | "allowed";

export class Access {
  step: Step = "paired";

  constructor(
    private readonly world: World,
    private readonly now: () => number,
  ) {}

  private iso(offsetMs = 0): string {
    return new Date(this.now() + offsetMs).toISOString().replace(/\.\d+Z$/, "Z");
  }

  status() {
    return {
      state: "ok",
      url: "http://127.0.0.1:41873",
      lastOkAt: this.iso(-60_000),
      nextTryAt: null,
      pending: 0,
      shareSensitive: false,
      apps: this.step === "allowed" ? 1 : 0,
      suggestions: 0,
      connects: this.step === "asked" ? 1 : 0,
      demoOnServer: false,
    };
  }

  private asked = { at: "" };

  connects() {
    if (this.step !== "asked") return [];
    return [{ id: "con_01M6HC7ZQ2M4PDK8R3T5V9W1XA", name: APP, code: CODE, scopes: ["memory:read"], sections: ["clients"], createdAt: this.asked.at, expiresAt: new Date(Date.parse(this.asked.at) + 600_000).toISOString().replace(/\.\d+Z$/, "Z") }];
  }

  tokens() {
    if (this.step !== "allowed") return [];
    return [{ id: "tok_01M6HC81B7N2Q4S6U8W0Y2A4C6", name: APP, scopes: ["memory:read"], sections: ["clients"], hint: "L7QE", createdAt: this.asked.at, lastUsedAt: null, expiresAt: null }];
  }

  /** Moves the Apps section to a step, and tells the pages, as the worker's access.status event does. */
  go(to: Step): void {
    if (to === "asked") this.asked.at = this.iso();
    this.step = to;
    this.world.tell({ ch: "coere", type: "engine.event", event: { name: "access.status", status: this.status() } });
  }

  install(): void {
    this.world
      .engine("access.status", () => this.status())
      .engine("access.syncNow", () => this.status())
      .engine("access.tokens.list", () => this.tokens())
      .engine("access.contextLog", () => [])
      .engine("access.connects.list", () => this.connects())
      .engine("access.requests", () => [])
      .engine("access.suggestions.list", () => [])
      .engine("access.connects.decide", () => {
        this.go("allowed");
        return { tokenId: this.tokens()[0]!.id };
      });
  }
}
