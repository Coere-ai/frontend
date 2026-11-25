import type { LabCondition } from "./types";

/**
 * Reading the Lab's forms. Pure, so every refusal is tested without a
 * database. Each reader answers the clean values or one error to show.
 */

/** Bump when the consent words change, so the export says who agreed to which. */
export const CONSENT_VERSION = "v1";

export const LAB_ERRORS = {
  code: "That join code is not right. Ask the person running the session.",
  consent: "Tick the box to agree before you join.",
  experience: "Pick how often you already code with an AI.",
  answer: "Paste your answer before you hand it in.",
  long: "That answer is too long. Keep it under 40,000 characters.",
  ai: "Pick the AI you used.",
  number: "Use a whole number.",
} as const;

type Read<T> = { ok: true; value: T } | { ok: false; error: string };

function text(v: FormDataEntryValue | null | undefined): string {
  return typeof v === "string" ? v.trim() : "";
}

/** A whole number from lo to hi, or null when the box was left empty. */
export function readCount(v: FormDataEntryValue | null | undefined, lo: number, hi: number): number | null | undefined {
  const s = text(v);
  if (s === "") return null;
  if (!/^\d{1,4}$/.test(s)) return undefined;
  const n = Number(s);
  return n >= lo && n <= hi ? n : undefined;
}

/** Codes are compared without case or spaces, since they are read out loud in a room. */
export function codeMatches(typed: string, expected: string): boolean {
  const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();
  return norm(expected) !== "" && norm(typed) === norm(expected);
}

export interface JoinFields {
  aiExperience: "none" | "weekly" | "daily";
  launchOptIn: boolean;
}

export function readJoin(f: FormData, expectedCode: string): Read<JoinFields> {
  if (!codeMatches(text(f.get("code")), expectedCode)) return { ok: false, error: LAB_ERRORS.code };
  if (f.get("consent") !== "on") return { ok: false, error: LAB_ERRORS.consent };
  const exp = text(f.get("experience"));
  if (exp !== "none" && exp !== "weekly" && exp !== "daily") return { ok: false, error: LAB_ERRORS.experience };
  return { ok: true, value: { aiExperience: exp, launchOptIn: f.get("launch") === "on" } };
}

export interface SubmitFields {
  answer: string;
  aiUsed: "chatgpt" | "claude" | "both" | "other";
  messages: number | null;
  reexplained: number | null;
  coereHelped: number | null;
  notes: string | null;
}

/** The hand in form. "How much did Coere help" is only read when the case ran with Coere. */
export function readSubmit(f: FormData, condition: LabCondition): Read<SubmitFields> {
  const answer = text(f.get("answer"));
  if (answer === "") return { ok: false, error: LAB_ERRORS.answer };
  if (answer.length > 40000) return { ok: false, error: LAB_ERRORS.long };
  const ai = text(f.get("ai"));
  if (ai !== "chatgpt" && ai !== "claude" && ai !== "both" && ai !== "other") return { ok: false, error: LAB_ERRORS.ai };
  const messages = readCount(f.get("messages"), 0, 500);
  const reexplained = readCount(f.get("reexplained"), 0, 50);
  const helped = condition === "coere" ? readCount(f.get("helped"), 1, 5) : null;
  if (messages === undefined || reexplained === undefined || helped === undefined) return { ok: false, error: LAB_ERRORS.number };
  const notes = text(f.get("notes")).slice(0, 2000);
  return { ok: true, value: { answer, aiUsed: ai, messages, reexplained, coereHelped: helped, notes: notes || null } };
}

/** The survey after a case. Questions about Coere itself are only kept for its Coere case. */
export const SURVEY_SCALES = [
  { key: "context", label: "How easy was it to keep the AI up to date on the case?", coereOnly: false },
  { key: "switching", label: "How smooth was moving between ChatGPT and Claude?", coereOnly: false },
  { key: "trust", label: "How much did you trust what Coere brought into your chats?", coereOnly: true },
] as const;

export function readSurvey(f: FormData, condition: LabCondition): Record<string, number | string | boolean> {
  const out: Record<string, number | string | boolean> = {};
  for (const s of SURVEY_SCALES) {
    if (s.coereOnly && condition !== "coere") continue;
    const n = readCount(f.get(s.key), 1, 5);
    if (typeof n === "number") out[s.key] = n;
  }
  if (condition === "coere") {
    const nps = readCount(f.get("recommend"), 0, 10);
    if (typeof nps === "number") out.recommend = nps;
    out.wrongContext = f.get("wrong") === "on";
  }
  const friction = text(f.get("friction")).slice(0, 2000);
  if (friction) out.friction = friction;
  return out;
}
