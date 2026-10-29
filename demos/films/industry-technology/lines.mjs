/**
 * The words of the chats this film shows, shared by the replica pages
 * (sites.mjs) and the film: Sam's Claude chat on the Ledger API retry bug,
 * what he asks Claude now and its reply with the backoff in Go, and what
 * ChatGPT answers once Coere has carried the stack and the decisions over.
 * Made up.
 */

export const RETRY_CHAT_ID = "c-ledger-retry";
export const RETRY_TITLE = "Ledger API retry bug";

/** The chat as it stood before today. */
export const CLAUDE_EARLIER = [
  {
    role: "user",
    text: "The Ledger API invoice webhook sometimes fires twice after a NATS timeout. Go 1.23, pgx v5, a JetStream consumer. Where should the retry live?",
  },
  {
    role: "assistant",
    text: [
      "Keep the retry in the consumer, not in the handler. JetStream already redelivers a message that is not acked in time, so a retry loop in the handler doubles the work.",
      "",
      "The safe rule is to make the webhook handler idempotent on the event id. A second delivery then finds the event done and only acks it.",
    ].join("\n"),
  },
  { role: "user", text: "Agreed. Webhook handlers will be idempotent on the event id." },
  { role: "assistant", text: "Good. Write the event id in the same transaction as the invoice update, and ack only after the commit." },
];

/** What he types into Claude today. */
export const CLAUDE_ASK = "Now write the redelivery backoff: 2, 8 and 30 seconds, then the dead letter queue.";

export const CLAUDE_REPLY = [
  "Here it is. The attempt comes from the message metadata, so it survives a restart.",
  "",
  "```go",
  "var backoff = []time.Duration{2 * time.Second, 8 * time.Second, 30 * time.Second}",
  "",
  "func (h *Handler) redeliver(msg jetstream.Msg) error {",
  "\tmeta, err := msg.Metadata()",
  "\tif err != nil {",
  "\t\treturn err",
  "\t}",
  "\ttry := int(meta.NumDelivered) - 1",
  "\tif try >= len(backoff) {",
  "\t\treturn h.deadLetter(msg)",
  "\t}",
  "\treturn msg.NakWithDelay(backoff[try])",
  "}",
  "```",
  "",
  "After the third try the event goes to the dead letter queue.",
].join("\n");

/** What he asks ChatGPT, in a new chat (field.context.draft). */
export const GPT_DRAFT = "Why does the invoice webhook fire twice after a timeout?";

/** ChatGPT's answer, code first, then why, as Sam likes his answers (field.context.answer). */
export const GPT_REPLY = [
  "```go",
  "tag, err := tx.Exec(ctx, insertProcessed, evt.ID) // ON CONFLICT DO NOTHING",
  "if err != nil {",
  "\treturn err",
  "}",
  "if tag.RowsAffected() == 0 {",
  "\treturn msg.Ack() // seen before, skip the invoice update",
  "}",
  "```",
  "",
  "With at least once delivery in JetStream, a timeout means the message is redelivered while your first handler still runs.",
  "",
  "1. Store the event id in a processed_events table with a unique index.\n2. Insert it in the same Postgres transaction as the invoice update, with ON CONFLICT DO NOTHING.\n3. Ack only after commit, and raise AckWait above your slowest handler.",
  "",
  "Want the handler rewritten with pgx v5 and a test for the double delivery?",
].join("\n");

/** The update to Halcyon he starts in the confidential chapter (field.clientLine.draft). */
export const CLIENT_DRAFT = "Write Maya a short update on the webhook fix and when it hits staging.";

/** What he asks Cori (field.cori.question). */
export const CORI_ASK = "what do you know about the Ledger API stack?";
