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

/**
 * What one request may add, per kind once its entries are summed. The
 * extension sends every 10 minutes, and these sit far above what it sends:
 * a busy build extracts some hundreds of chats in that time, so a whole
 * backfill of chats gets the most room. Above the cap a batch is clamped,
 * not refused, since the extension keeps a refused batch and sends it again.
 */
const PER_REQUEST_COUNT: Partial<Record<AppEventKind, number>> = { extract_chat: 5_000 };
const PER_REQUEST_DEFAULT = 1_000;

export function perRequestCount(kind: AppEventKind): number {
  return PER_REQUEST_COUNT[kind] ?? PER_REQUEST_DEFAULT;
}

/** The most one import or transfer can save: a whole context window of a million tokens. */
export const SAVED_PER_USE = 1_000_000;

/**
 * What one device may add in a UTC day, per kind and in tokens saved, which
 * record_app_events_capped holds it to. One device token at the event
 * lane's rate could otherwise add billions a minute to the organization's
 * rankings and the launch numbers.
 */
export const DAY_COUNT_PER_KIND = 20_000;
export const DAY_SAVED = 200_000_000;

/**
 * The batch as `record_app_events` takes it, or null when any entry is off.
 * Entries of one kind are summed into one, the count clamped to the kind's
 * cap and tokens saved to SAVED_PER_USE for each use counted.
 */
export function parseEvents(body: unknown): AppEvent[] | null {
  if (!isRecord(body) || !Array.isArray(body.events)) return null;
  const list = body.events as unknown[];
  if (list.length === 0 || list.length > MAX_EVENTS) return null;
  const byKind = new Map<AppEventKind, AppEvent>();
  for (const e of list) {
    if (!isRecord(e) || typeof e.kind !== "string" || !KINDS.has(e.kind)) return null;
    if (!intIn(e.count, 1, 100_000)) return null;
    const kind = e.kind as AppEventKind;
    const event = byKind.get(kind) ?? { kind, count: 0 };
    event.count += e.count;
    if (e.tokensSaved !== undefined) {
      if (!SAVES_TOKENS.has(e.kind) || !intIn(e.tokensSaved, 0, 100_000_000)) return null;
      event.tokensSaved = (event.tokensSaved ?? 0) + e.tokensSaved;
    }
    byKind.set(kind, event);
  }
  return [...byKind.values()].map((event) => {
    const count = Math.min(event.count, perRequestCount(event.kind));
    // A stored row holds at most 100,000,000 tokens saved, as one entry may.
    const saved = event.tokensSaved === undefined ? undefined : Math.min(event.tokensSaved, count * SAVED_PER_USE, 100_000_000);
    return saved === undefined ? { kind: event.kind, count } : { kind: event.kind, count, tokensSaved: saved };
  });
}

/** The arguments of record_app_events_capped, which also holds the device to the day's bounds. */
export function dailyCapArgs(userId: string, deviceId: string, events: AppEvent[]) {
  return { p_user: userId, p_device: deviceId, p_events: events, p_day_count: DAY_COUNT_PER_KIND, p_day_saved: DAY_SAVED };
}
