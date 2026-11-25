import "server-only";

import { supabase } from "@/lib/supabase";

import { assignFor, readStage } from "./assign";
import { CONSENT_VERSION, type JoinFields, type SubmitFields } from "./form";
import type { LabAssignment, LabCondition, LabPair } from "./types";

/**
 * The Lab's reads and writes, always with the secret key after the caller
 * has checked the session (docs/lab.md 2). Nothing here trusts a user id it
 * was not handed by requireUser.
 */

export interface LabStudy {
  stage: number;
  code: string;
}

export interface LabParticipant extends LabAssignment {
  userId: string;
  joinIndex: number;
  launchOptIn: boolean;
}

export interface LabWorkRow {
  caseId: string;
  taskId: string;
  startedAt: string;
  submittedAt: string | null;
  answer: string | null;
  score: number | null;
}

export async function readStudy(): Promise<LabStudy> {
  const { data, error } = await supabase().from("site_settings").select("value").eq("key", "lab.study").maybeSingle();
  if (error) throw new Error(`lab.study read failed: ${error.code ?? "unknown"}`);
  const value = (data?.value ?? null) as { code?: unknown } | null;
  return { stage: readStage(value), code: typeof value?.code === "string" ? value.code : "" };
}

export async function saveStudy(study: LabStudy): Promise<void> {
  const { error } = await supabase()
    .from("site_settings")
    .upsert({ key: "lab.study", value: { stage: study.stage, code: study.code }, updated_at: new Date().toISOString() });
  if (error) throw new Error(`lab.study save failed: ${error.code ?? "unknown"}`);
}

type ParticipantRow = { user_id: string; join_index: number; pair: LabPair; first_case: string; second_case: string; first_condition: LabCondition; launch_opt_in: boolean };

export function participantFrom(r: ParticipantRow): LabParticipant {
  return { userId: r.user_id, joinIndex: r.join_index, pair: r.pair, cases: [r.first_case, r.second_case], firstCondition: r.first_condition, launchOptIn: r.launch_opt_in };
}

export async function readParticipant(userId: string): Promise<LabParticipant | null> {
  const { data, error } = await supabase()
    .from("lab_participants")
    .select("user_id, join_index, pair, first_case, second_case, first_condition, launch_opt_in")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`participant read failed: ${error.code ?? "unknown"}`);
  return data ? participantFrom(data as ParticipantRow) : null;
}

/** Joins the study: takes the next join index, so the crossover stays balanced, then stores the assignment. */
export async function joinStudy(userId: string, fields: JoinFields): Promise<void> {
  const next = await supabase().rpc("lab_next_join_index");
  if (next.error || typeof next.data !== "number") throw new Error(`join index failed: ${next.error?.code ?? "unknown"}`);
  const a = assignFor(next.data);
  const { error } = await supabase().from("lab_participants").insert({
    user_id: userId,
    join_index: next.data,
    pair: a.pair,
    first_case: a.cases[0],
    second_case: a.cases[1],
    first_condition: a.firstCondition,
    consent_version: CONSENT_VERSION,
    ai_experience: fields.aiExperience,
    launch_opt_in: fields.launchOptIn,
  });
  // 23505: they joined already, from another tab. Their first assignment stands.
  if (error && error.code !== "23505") throw new Error(`join failed: ${error.code ?? "unknown"}`);
}

export async function setLaunchOptIn(userId: string, on: boolean): Promise<void> {
  const { error } = await supabase().from("lab_participants").update({ launch_opt_in: on }).eq("user_id", userId);
  if (error) throw new Error(`opt in failed: ${error.code ?? "unknown"}`);
}

export async function readWork(userId: string): Promise<LabWorkRow[]> {
  const { data, error } = await supabase().from("lab_work").select("case_id, task_id, started_at, submitted_at, answer, score").eq("user_id", userId);
  if (error) throw new Error(`work read failed: ${error.code ?? "unknown"}`);
  return (data ?? []).map((r) => ({ caseId: r.case_id, taskId: r.task_id, startedAt: r.started_at, submittedAt: r.submitted_at, answer: r.answer, score: r.score }));
}

/** Starting twice keeps the first start, so reopening a task never resets its clock. */
export async function startTask(userId: string, caseId: string, taskId: string): Promise<void> {
  const { error } = await supabase().from("lab_work").upsert({ user_id: userId, case_id: caseId, task_id: taskId }, { onConflict: "user_id,case_id,task_id", ignoreDuplicates: true });
  if (error) throw new Error(`start failed: ${error.code ?? "unknown"}`);
}

/** Handing in again replaces the answer and moves the hand in time, but keeps the start. */
export async function submitTask(userId: string, caseId: string, taskId: string, f: SubmitFields): Promise<void> {
  await startTask(userId, caseId, taskId);
  const { error } = await supabase()
    .from("lab_work")
    .update({ submitted_at: new Date().toISOString(), answer: f.answer, ai_used: f.aiUsed, messages: f.messages, reexplained: f.reexplained, coere_helped: f.coereHelped, notes: f.notes })
    .eq("user_id", userId)
    .eq("case_id", caseId)
    .eq("task_id", taskId);
  if (error) throw new Error(`submit failed: ${error.code ?? "unknown"}`);
}

export async function readSurveyDone(userId: string): Promise<string[]> {
  const { data, error } = await supabase().from("lab_surveys").select("case_id").eq("user_id", userId);
  if (error) throw new Error(`survey read failed: ${error.code ?? "unknown"}`);
  return (data ?? []).map((r) => r.case_id as string);
}

export async function saveSurvey(userId: string, caseId: string, answers: Record<string, unknown>): Promise<void> {
  const { error } = await supabase().from("lab_surveys").upsert({ user_id: userId, case_id: caseId, answers, created_at: new Date().toISOString() });
  if (error) throw new Error(`survey save failed: ${error.code ?? "unknown"}`);
}
