import type { LaunchSetting } from "@/site/content/launch";

/**
 * The launch moment the operator sets in /admin/launch: reading it back
 * from the database, checking what the form sends, and the quick buttons'
 * arithmetic. Pure, so the admin card, the server action and the tests
 * share it.
 */

export const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/** A full ISO moment with its zone: 2026-11-23T17:00Z, with seconds and milliseconds optional. */
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

/** No launch is set before this or after the second. A typo of a year is caught either way. */
const EARLIEST = Date.UTC(2025, 0, 1);
const LATEST = Date.UTC(2100, 0, 1);

export const MOMENT_ERRORS = {
  moment: "Pick a date and time.",
  range: "Pick a moment between 2025 and 2100.",
  show: "Choose whether the page shows the countdown.",
  past: "That moment has passed. Confirm to save it, and the page will say it is here.",
} as const;

/** The moment in its stored form (UTC, with milliseconds), or null when it is not one. */
export function parseMoment(raw: unknown): string | null {
  if (typeof raw !== "string" || !ISO.test(raw.trim())) return null;
  const ms = Date.parse(raw.trim());
  if (!Number.isFinite(ms) || ms < EARLIEST || ms >= LATEST) return null;
  return new Date(ms).toISOString();
}

/** A stored value as the pages use it, or the fallback when it is missing or malformed. */
export function readLaunchSetting(raw: unknown, fallback: LaunchSetting): LaunchSetting {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return fallback;
  const value = raw as { at?: unknown; show?: unknown };
  const at = parseMoment(value.at);
  if (!at) return fallback;
  return { at, show: typeof value.show === "boolean" ? value.show : true };
}

export type LaunchInput = { at: unknown; show: unknown; confirmPast: unknown };
export type LaunchCheck = { ok: true; setting: LaunchSetting; past: boolean } | { ok: false; error: string; needsConfirm?: true };

/**
 * What the save action accepts. A moment in the past is allowed only when
 * the operator confirmed it, since it makes the page say the product is here.
 */
export function checkLaunchInput(input: LaunchInput, now: number): LaunchCheck {
  if (typeof input.at !== "string" || !ISO.test(input.at.trim())) return { ok: false, error: MOMENT_ERRORS.moment };
  const at = parseMoment(input.at);
  if (!at) return { ok: false, error: MOMENT_ERRORS.range };
  if (typeof input.show !== "boolean") return { ok: false, error: MOMENT_ERRORS.show };
  const past = Date.parse(at) <= now;
  if (past && input.confirmPast !== true) return { ok: false, error: MOMENT_ERRORS.past, needsConfirm: true };
  return { ok: true, setting: { at, show: input.show }, past };
}

/** The quick buttons: the moment moved by whole days (negative moves it back). */
export function shiftDays(ms: number, days: number): number {
  return ms + days * DAY_MS;
}

/** "20 days from now", on the minute, since the picker shows no seconds. */
export function daysFromNow(now: number, days: number): number {
  return Math.floor(now / MINUTE_MS) * MINUTE_MS + days * DAY_MS;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** A moment as a datetime-local input shows it, in the zone this code runs in. */
export function toLocalInput(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** What a datetime-local input holds, read in the zone this code runs in, or null when it is empty or malformed. */
export function fromLocalInput(value: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number) as [number, number, number, number, number];
  const date = new Date(y, mo - 1, d, h, mi);
  // new Date rolls 31 February over into March; a value like that is not one.
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date.getTime();
}
