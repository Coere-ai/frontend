import type { LabCase } from "./types";

/**
 * The starter chat: the whole packet as one message a student pastes into
 * ChatGPT or Claude. With Coere on, Connect saves that chat and builds memory
 * from it, so later chats on any AI start with the case already known. With
 * Coere paused, the student has whatever they choose to paste again, which is
 * the baseline the study measures against.
 *
 * Plain text only: it lands in a chat box, where Markdown tables render
 * unevenly across AIs.
 */
export function starterPrompt(c: LabCase): string {
  const lines: string[] = [
    `I'm working on a case study about ${c.name} (${c.tagline}). Here is the full brief. Read it and confirm you have it. I'll give you tasks one at a time.`,
    "",
    ...c.brief,
    "",
    "Facts:",
    ...c.facts.map((f) => `${f.label}: ${f.value}`),
  ];
  if (c.table) {
    lines.push("", `${c.table.caption}:`, c.table.columns.join(" | "), ...c.table.rows.map((r) => r.join(" | ")));
  }
  lines.push(
    "",
    "People:",
    ...c.people.map((p) => `${p.name}, ${p.role}: ${p.note}`),
    "",
    "Rules and limits:",
    ...c.constraints.map((x) => `${x}`),
    "",
    "Goals:",
    ...c.goals.map((g) => `${g}`),
  );
  return lines.join("\n");
}
