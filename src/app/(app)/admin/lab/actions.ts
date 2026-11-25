"use server";

import { revalidatePath } from "next/cache";

import { adminAction, done, refused } from "@/lib/admin/action";
import { gradeWork } from "@/lib/admin/lab";
import { LAB_STAGES } from "@/lib/lab/assign";
import { labCase } from "@/lib/lab/cases";
import { readCount } from "@/lib/lab/form";
import { readStudy, saveStudy } from "@/lib/lab/store";
import { isUuid } from "@/lib/uuid";

/**
 * The operator's writes on /admin/lab: open the next stage, set the join
 * code, and grade a hand in. Each runs through adminAction, which checks the
 * admin session, since a server action is a public endpoint.
 */

export async function saveLabStudyAction(form: FormData): Promise<void> {
  await adminAction("saveLabStudy", async () => {
    const stage = readCount(form.get("stage"), 0, LAB_STAGES);
    if (typeof stage !== "number") return refused("Pick a stage.");
    const code = String(form.get("code") ?? "").trim().slice(0, 32);
    const now = await readStudy();
    await saveStudy({ stage, code: form.has("code") ? code : now.code });
    return done("Saved");
  });
  revalidatePath("/admin/lab");
  revalidatePath("/lab");
}

export async function gradeLabWorkAction(form: FormData): Promise<void> {
  await adminAction("gradeLabWork", async () => {
    const userId = form.get("userId");
    const c = labCase(String(form.get("caseId") ?? ""));
    const taskId = String(form.get("taskId") ?? "");
    if (!isUuid(userId) || !c || !c.tasks.some((t) => t.id === taskId)) return refused("That hand in does not exist.");
    const score = readCount(form.get("score"), 0, 100);
    if (score === undefined) return refused("A score is 0 to 100.");
    const notes = String(form.get("notes") ?? "").trim().slice(0, 2000) || null;
    await gradeWork(userId, c.id, taskId, score, notes);
    return done("Graded");
  });
  revalidatePath("/admin/lab");
}
