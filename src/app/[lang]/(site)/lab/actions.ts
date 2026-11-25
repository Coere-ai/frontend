"use server";

import { revalidatePath } from "next/cache";

import { getUser } from "@/lib/auth/user";
import { conditionOf, taskOpen } from "@/lib/lab/assign";
import { labCase } from "@/lib/lab/cases";
import { readJoin, readSubmit, readSurvey } from "@/lib/lab/form";
import { joinStudy, readParticipant, readStudy, saveSurvey, setLaunchOptIn, startTask, submitTask, type LabParticipant } from "@/lib/lab/store";
import type { LabCase, LabTask } from "@/lib/lab/types";
import { supabaseConfigured } from "@/lib/supabase";

/**
 * The writes of /lab (docs/lab.md 2). Each checks the session again, then
 * that the case is the student's own and the task's stage is open, so a
 * hand built form can never write to a case or stage they were not given.
 */

export interface LabFormState {
  error: string | null;
  done: boolean;
}

const UNAVAILABLE = "That did not work. Try again in a minute.";
const SIGNED_OUT = "You were signed out. Reload the page to sign in again.";
const CLOSED = "This task is not open yet. Wait for the person running the session.";
const fail = (error: string): LabFormState => ({ error, done: false });

export async function joinLab(_prev: LabFormState, form: FormData): Promise<LabFormState> {
  const user = await getUser();
  if (!user || !supabaseConfigured()) return fail(SIGNED_OUT);
  try {
    const study = await readStudy();
    const read = readJoin(form, study.code);
    if (!read.ok) return fail(read.error);
    await joinStudy(user.id, read.value);
  } catch (err) {
    console.error("[lab] join failed:", err instanceof Error ? err.message : "unknown");
    return fail(UNAVAILABLE);
  }
  revalidatePath("/lab");
  return { error: null, done: true };
}

/** The student, their case and the task, when the task is theirs and open. */
async function ownTask(form: FormData): Promise<{ me: LabParticipant; c: LabCase; t: LabTask } | string> {
  const user = await getUser();
  if (!user || !supabaseConfigured()) return SIGNED_OUT;
  const c = labCase(String(form.get("caseId") ?? ""));
  const t = c?.tasks.find((x) => x.id === form.get("taskId"));
  const [me, study] = await Promise.all([readParticipant(user.id), readStudy()]);
  if (!me || !c || !t || !taskOpen(me, c.id, t, study.stage)) return CLOSED;
  return { me, c, t };
}

export async function startLabTask(form: FormData): Promise<void> {
  try {
    const own = await ownTask(form);
    if (typeof own === "string") return;
    await startTask(own.me.userId, own.c.id, own.t.id);
    revalidatePath(`/lab/${own.c.id}`);
  } catch (err) {
    console.error("[lab] start failed:", err instanceof Error ? err.message : "unknown");
  }
}

export async function submitLabTask(_prev: LabFormState, form: FormData): Promise<LabFormState> {
  try {
    const own = await ownTask(form);
    if (typeof own === "string") return fail(own);
    const condition = conditionOf(own.me, own.c.id) ?? "baseline";
    const read = readSubmit(form, condition);
    if (!read.ok) return fail(read.error);
    await submitTask(own.me.userId, own.c.id, own.t.id, read.value);
    revalidatePath(`/lab/${own.c.id}`);
    return { error: null, done: true };
  } catch (err) {
    console.error("[lab] submit failed:", err instanceof Error ? err.message : "unknown");
    return fail(UNAVAILABLE);
  }
}

export async function saveLabSurvey(_prev: LabFormState, form: FormData): Promise<LabFormState> {
  const user = await getUser();
  if (!user || !supabaseConfigured()) return fail(SIGNED_OUT);
  try {
    const c = labCase(String(form.get("caseId") ?? ""));
    const me = await readParticipant(user.id);
    const condition = me && c ? conditionOf(me, c.id) : null;
    if (!me || !c || !condition) return fail(CLOSED);
    await saveSurvey(me.userId, c.id, readSurvey(form, condition));
  } catch (err) {
    console.error("[lab] survey failed:", err instanceof Error ? err.message : "unknown");
    return fail(UNAVAILABLE);
  }
  revalidatePath(`/lab`);
  return { error: null, done: true };
}

export async function setLabOptIn(form: FormData): Promise<void> {
  const user = await getUser();
  if (!user || !supabaseConfigured()) return;
  await setLaunchOptIn(user.id, form.get("on") === "on").catch(() => undefined);
  revalidatePath("/lab");
}
