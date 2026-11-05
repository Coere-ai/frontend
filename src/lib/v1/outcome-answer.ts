import type { OrgOutcome } from "@/lib/org/outcome";

import { json, problem, refusal } from "./http";

/**
 * An organization action's outcome as the API answers it
 * (docs/accounts.md 8.11): `200 { notice }` when done, `409 refused` with
 * the rule and the line to show when the rules said no, and the usual
 * problem codes otherwise. Pure, so the tests pin each case.
 */
export function outcomeAnswer(o: OrgOutcome): Response {
  if (o.ok) return json({ notice: o.notice });
  if (o.reason === "unavailable") return problem("unavailable");
  if (o.reason === "bad_request") return problem("bad_request");
  return refusal(o.reason, o.message);
}
