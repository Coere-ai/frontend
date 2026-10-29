/**
 * The replica pages this film opens: Claude on Sam's chat about the Ledger
 * API retry bug, a new ChatGPT chat with his sidebar, and ChatGPT again
 * with Coere for Teams' content script for the client chapter, with the
 * chats his team keeps there (scripts/industries/fields/technology.mjs).
 */
import { CLAUDE_EARLIER, RETRY_CHAT_ID, RETRY_TITLE } from "./lines.mjs";

/** Newest first, a day apart, as the sites list them. */
const dated = (titles, prefix) =>
  titles.map((title, i) => {
    const at = new Date(Date.UTC(2026, 9, 28 - i, 17)).toISOString();
    return { id: `${prefix}${i + 1}`, title, createdAt: at, updatedAt: at };
  });

const claude = [
  { id: RETRY_CHAT_ID, title: RETRY_TITLE, createdAt: "2026-10-23T17:00:00Z", updatedAt: "2026-10-29T16:00:00Z", messages: CLAUDE_EARLIER },
  ...dated(["Webhook idempotency keys", "Architecture review prep", "Migration to pgx v5", "Osprey Pay fraud rules", "NATS consumer lag", "Ledger API spec", "Go generics question", "Rate limiter design"], "cl"),
];

const gpt = dated(
  ["Ledger API retry bug", "Webhook idempotency keys", "Postgres index for invoices", "NATS consumer lag", "Fly.io deploy config", "Go generics question", "Halcyon onboarding flow", "Rate limiter design", "Sentry alert noise", "Migration to pgx v5", "Code review checklist", "On call runbook", "Interview loop questions", "Team offsite plan"],
  "g",
).slice(1);

const team = dated(
  ["Personal", "Ledger API retry bug", "Webhook idempotency keys", "Brightline routing service", "Osprey Pay fraud rules", "Postgres index for invoices", "NATS consumer lag", "Fly.io deploy config", "Rate limiter design", "Sentry alert noise", "Migration to pgx v5", "Code review checklist", "On call runbook", "Halcyon onboarding flow"],
  "t",
);

/** A paste over 800 characters becomes a file beside the box, and an upload takes a moment, as the films' fixture sets them (smart-context does the same). */
const options = { pasteFileOver: 800, uploadMs: 1800 };

export default [
  { out: "sites/claude.html", platform: "claude", chats: claude, open: RETRY_CHAT_ID },
  { out: "sites/chatgpt.html", platform: "chatgpt", chats: gpt, options },
  { out: "sites/chatgpt-team.html", platform: "chatgpt", edition: "solution", chats: team },
];
