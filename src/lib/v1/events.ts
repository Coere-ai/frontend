import { isRecord } from "./body";

/**
 * The feature counts the extension sends (docs/accounts.md 6.7, 8.9):
 * counts and token numbers, never text. `tokensSaved` rides only on a
 * context import or a transfer, the two events that save the person typing.
 */

export const APP_EVENT_KINDS = [
  "extract_chat",
  "extract_all",
  "transfer",
  "context_import",
  "memory_search",
  "cori_chat",
  "action_run",
  "rewrite",
  "voice",
  "file_upload",
  "memory_built",
  "onboarding_done",
] as const;

export type AppEventKind = (typeof APP_EVENT_KINDS)[number];

export interface AppEvent {
  kind: AppEventKind;
  count: number;
  tokensSaved?: number;
}

export const MAX_EVENTS = 50;
const KINDS: ReadonlySet<string> = new Set(APP_EVENT_KINDS);
const SAVES_TOKENS: ReadonlySet<string> = new Set(["context_import", "transfer"]);

const intIn = (v: unknown, min: number, max: number): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

/** The batch as `record_app_events` takes it, or null when any entry is off. */
export function parseEvents(body: unknown): AppEvent[] | null {
  if (!isRecord(body) || !Array.isArray(body.events)) return null;
  const list = body.events as unknown[];
  if (list.length === 0 || list.length > MAX_EVENTS) return null;
  const out: AppEvent[] = [];
  for (const e of list) {
    if (!isRecord(e) || typeof e.kind !== "string" || !KINDS.has(e.kind)) return null;
    if (!intIn(e.count, 1, 100_000)) return null;
    const event: AppEvent = { kind: e.kind as AppEventKind, count: e.count };
    if (e.tokensSaved !== undefined) {
      if (!SAVES_TOKENS.has(e.kind) || !intIn(e.tokensSaved, 0, 100_000_000)) return null;
      event.tokensSaved = e.tokensSaved;
    }
    out.push(event);
  }
  return out;
}
