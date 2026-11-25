import "server-only";

import { participantFrom, readStudy, type LabStudy } from "@/lib/lab/store";
import { withConditions, type SumEvent, type SumParticipant, type SumWork } from "@/lib/lab/summary";
import { supabase } from "@/lib/supabase";

import { toCsv } from "./csv";
import { readAll } from "./read-all";

/**
 * Everything /admin/lab shows, read with the secret key behind the admin
 * session (docs/lab.md 6). The study holds 10 to 15 people, so it reads
 * every row and leaves the sums to the pure functions in lib/lab/summary.
 */

export interface LabAdminWork extends SumWork {
  answer: string | null;
  aiUsed: string | null;
  coereHelped: number | null;
  notes: string | null;
  scoreNotes: string | null;
}

export interface LabAdminPerson extends SumParticipant {
  joinIndex: number;
  launchOptIn: boolean;
  aiExperience: string;
  consentedAt: string;
}

export interface LabAdminData {
  study: LabStudy;
  people: LabAdminPerson[];
  work: LabAdminWork[];
  surveys: Array<{ userId: string; caseId: string; answers: Record<string, unknown> }>;
  events: SumEvent[];
  now: string;
}

const MAX = 50_000;

export async function loadLabAdmin(): Promise<LabAdminData> {
  const db = supabase();
  const [study, people, work, surveys] = await Promise.all([
    readStudy(),
    readAll<Record<string, unknown>>((a, b) => db.from("lab_participants").select("user_id, join_index, pair, first_case, second_case, first_condition, launch_opt_in, ai_experience, consented_at").order("join_index").range(a, b), MAX),
    readAll<Record<string, unknown>>((a, b) => db.from("lab_work").select("*").order("user_id").order("case_id").order("task_id").range(a, b), MAX),
    readAll<Record<string, unknown>>((a, b) => db.from("lab_surveys").select("user_id, case_id, answers").order("user_id").order("case_id").range(a, b), MAX),
  ]);
  const ids = people.map((p) => p.user_id as string);
  const [names, events] = ids.length
    ? await Promise.all([
        readAll<{ id: string; username: string | null }>((a, b) => db.from("profiles").select("id, username").in("id", ids).order("id").range(a, b), MAX),
        readAll<{ user_id: string; kind: string; count: number; created_at: string }>((a, b) => db.from("app_events").select("user_id, kind, count, created_at").in("user_id", ids).gte("created_at", people.map((p) => p.consented_at as string).sort()[0]!).order("id").range(a, b), MAX),
      ])
    : [[], []];
  const nameOf = new Map(names.map((n) => [n.id, n.username ?? "(no username)"]));

  return {
    study,
    people: people.map((r) => ({
      ...participantFrom(r as never),
      username: nameOf.get(r.user_id as string) ?? "(deleted)",
      aiExperience: r.ai_experience as string,
      consentedAt: r.consented_at as string,
    })),
    work: work.map((r) => ({
      userId: r.user_id as string,
      caseId: r.case_id as string,
      taskId: r.task_id as string,
      startedAt: r.started_at as string,
      submittedAt: (r.submitted_at as string | null) ?? null,
      messages: (r.messages as number | null) ?? null,
      reexplained: (r.reexplained as number | null) ?? null,
      score: (r.score as number | null) ?? null,
      answer: (r.answer as string | null) ?? null,
      aiUsed: (r.ai_used as string | null) ?? null,
      coereHelped: (r.coere_helped as number | null) ?? null,
      notes: (r.notes as string | null) ?? null,
      scoreNotes: (r.score_notes as string | null) ?? null,
    })),
    surveys: surveys.map((s) => ({ userId: s.user_id as string, caseId: s.case_id as string, answers: (s.answers ?? {}) as Record<string, unknown> })),
    events: events.map((e) => ({ userId: e.user_id, kind: e.kind, count: e.count, createdAt: e.created_at })),
    now: new Date().toISOString(),
  };
}

/**
 * One row per task, for evals and spreadsheets. Answers are left out: they
 * can be long and hold whatever a student pasted. The page shows them.
 */
export function labCsv(d: LabAdminData): string {
  const rows = withConditions(d.people, d.work) as Array<LabAdminWork & { condition: string; part: number | null }>;
  const person = new Map(d.people.map((p) => [p.userId, p]));
  return toCsv(
    ["username", "join_index", "pair", "ai_experience", "case", "slot", "condition", "task", "part", "started_at", "submitted_at", "minutes", "ai_used", "messages", "reexplained", "coere_helped", "score", "launch_opt_in"],
    rows.map((r) => {
      const p = person.get(r.userId)!;
      const minutes = r.submittedAt ? Math.round((Date.parse(r.submittedAt) - Date.parse(r.startedAt)) / 6000) / 10 : null;
      return [p.username, p.joinIndex, p.pair, p.aiExperience, r.caseId, p.cases[0] === r.caseId ? 1 : 2, r.condition, r.taskId, r.part, r.startedAt, r.submittedAt, minutes, r.aiUsed, r.messages, r.reexplained, r.coereHelped, r.score, p.launchOptIn ? "yes" : "no"];
    }),
  );
}

export async function gradeWork(userId: string, caseId: string, taskId: string, score: number | null, notes: string | null): Promise<void> {
  const { error } = await supabase()
    .from("lab_work")
    .update({ score, score_notes: notes, graded_at: score === null ? null : new Date().toISOString() })
    .eq("user_id", userId)
    .eq("case_id", caseId)
    .eq("task_id", taskId);
  if (error) throw new Error(`grade failed: ${error.code ?? "unknown"}`);
}
