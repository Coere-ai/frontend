import type { PlatformId } from "@coere/core";

/**
 * Northbeam Labs, the technology field's made up firm, and Sam Whitaker, a
 * backend engineer there (scripts/industries/fields/technology.mjs): his
 * chats on Claude, ChatGPT and Gemini, and the days they were had. Every
 * date is counted from today, so a promise due tomorrow is due tomorrow
 * whenever the demo plays.
 */

export const SAM = { name: "Sam Whitaker", first: "Sam", initials: "SW" };
export const FIRM = "Northbeam Labs";
export const ZONE = "America/Los_Angeles";

const DAY = 86_400_000;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Today at its start, in UTC. */
export const today = (): number => Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);

/** A moment `n` days from today, in the afternoon, so no time zone moves it to another day. */
export const dayAt = (n: number, hour = 17): number => today() + n * DAY + hour * 3_600_000;
export const iso = (ms: number): string => new Date(ms).toISOString();
/** "October 27". */
export const monthDay = (ms: number): string => `${MONTHS[new Date(ms).getUTCMonth()]} ${new Date(ms).getUTCDate()}`;
/** "Oct 27, 2026", as Coere writes a source's day in a context block. */
export const shortDay = (ms: number): string => new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const AI: Record<string, string> = { chatgpt: "ChatGPT", claude: "Claude", gemini: "Gemini" };
export const aiName = (p: string): string => AI[p] ?? p;

export type SourceChat = { key: string; title: string; platform: PlatformId; ago: number };

/** The chats his memory was built from: the title, the AI and how many days ago. */
export const CHATS: SourceChat[] = [
  { key: "retry", title: "Ledger API retry bug", platform: "claude", ago: 6 },
  { key: "idem", title: "Webhook idempotency keys", platform: "claude", ago: 8 },
  { key: "review", title: "Architecture review prep", platform: "claude", ago: 9 },
  { key: "index", title: "Postgres index for invoices", platform: "chatgpt", ago: 12 },
  { key: "offsite", title: "Team offsite plan", platform: "gemini", ago: 15 },
  { key: "routing", title: "Brightline routing service", platform: "chatgpt", ago: 18 },
  { key: "pgx", title: "Migration to pgx v5", platform: "claude", ago: 20 },
  { key: "fraud", title: "Osprey Pay fraud rules", platform: "claude", ago: 22 },
  { key: "nats", title: "NATS consumer lag", platform: "claude", ago: 27 },
  { key: "sentry", title: "Sentry alert noise", platform: "chatgpt", ago: 27 },
  { key: "spec", title: "Ledger API spec", platform: "claude", ago: 29 },
  { key: "loop", title: "Interview loop questions", platform: "chatgpt", ago: 30 },
  { key: "limiter", title: "Rate limiter design", platform: "gemini", ago: 38 },
  { key: "generics", title: "Go generics question", platform: "gemini", ago: 40 },
  { key: "oncall", title: "On call runbook", platform: "gemini", ago: 45 },
  { key: "checklist", title: "Code review checklist", platform: "chatgpt", ago: 50 },
  { key: "flyio", title: "Fly.io deploy config", platform: "chatgpt", ago: 76 },
  { key: "onboard", title: "Halcyon onboarding flow", platform: "chatgpt", ago: 84 },
  { key: "retainer", title: "Halcyon retainer", platform: "gemini", ago: 148 },
];

export const chatOf = (key: string): SourceChat => {
  const c = CHATS.find((x) => x.key === key);
  if (!c) throw new Error(`no chat ${key}`);
  return c;
};

/** "(Claude, Sep 30, 2026)", the source a context block names after a line. */
export const cite = (key: string): string => {
  const c = chatOf(key);
  return `(${aiName(c.platform)}, ${shortDay(dayAt(-c.ago))})`;
};
