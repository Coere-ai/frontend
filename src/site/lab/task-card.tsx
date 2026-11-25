"use client";

import { useActionState } from "react";

import { startLabTask, submitLabTask, type LabFormState } from "@/app/[lang]/(site)/lab/actions";
import type { TaskStatus } from "@/lib/lab/progress";
import type { LabCondition, LabTask } from "@/lib/lab/types";
import { buttonClass } from "@/site/ui/button";
import { FormField, inputClass } from "@/site/ui/form-field";

const AI_NAME = { chatgpt: "ChatGPT", claude: "Claude", either: "ChatGPT or Claude" } as const;

/**
 * One task: locked until its stage opens, then a Start button (which starts
 * the clock), then the hand in form. A handed in task can be handed in
 * again; the start time stays, so the time on task is honest.
 */
export function TaskCard({ caseId, task, status, condition, answer }: { caseId: string; task: LabTask; status: TaskStatus; condition: LabCondition; answer: string | null }) {
  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[18px] font-medium text-white">
          {task.id.toUpperCase()}. {task.title}
        </h3>
        <span className="text-[13px] text-white/60">
          Part {task.part}, in {AI_NAME[task.ai]}
        </span>
      </div>
      {status === "locked" ? (
        <p className="mt-3 text-[15px] text-white/55">Opens in a later session.</p>
      ) : (
        <>
          <p className="mt-3 text-[15px] leading-relaxed text-white/80">{task.ask}</p>
          <p className="mt-2 text-[14px] text-white/60">Hand in: {task.deliverable}</p>
          {status === "ready" ? (
            <form action={startLabTask} className="mt-4">
              <input type="hidden" name="caseId" value={caseId} />
              <input type="hidden" name="taskId" value={task.id} />
              <button type="submit" className={buttonClass("secondary")}>
                Start this task
              </button>
            </form>
          ) : (
            <SubmitForm caseId={caseId} task={task} condition={condition} answer={answer} submitted={status === "submitted"} />
          )}
        </>
      )}
    </li>
  );
}

function SubmitForm({ caseId, task, condition, answer, submitted }: { caseId: string; task: LabTask; condition: LabCondition; answer: string | null; submitted: boolean }) {
  const [state, run, pending] = useActionState<LabFormState, FormData>(submitLabTask, { error: null, done: false });
  const id = `${caseId}-${task.id}`;
  return (
    <form action={run} className="mt-5 space-y-4">
      <input type="hidden" name="caseId" value={caseId} />
      <input type="hidden" name="taskId" value={task.id} />
      <FormField id={`${id}-answer`} label="Your answer" hint="Paste what the AI and you produced" error={state.error ?? undefined}>
        <textarea id={`${id}-answer`} name="answer" rows={8} defaultValue={answer ?? ""} maxLength={40000} className={`${inputClass(Boolean(state.error))} py-3 font-mono text-[13px]`} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id={`${id}-ai`} label="AI used">
          <select id={`${id}-ai`} name="ai" required defaultValue={task.ai === "either" ? "" : task.ai} className={`${inputClass(false)} h-11`}>
            <option value="" disabled>
              Pick one
            </option>
            <option value="chatgpt">ChatGPT</option>
            <option value="claude">Claude</option>
            <option value="both">Both</option>
            <option value="other">Another AI</option>
          </select>
        </FormField>
        <FormField id={`${id}-messages`} label="Messages you sent">
          <input id={`${id}-messages`} name="messages" inputMode="numeric" pattern="[0-9]*" className={`${inputClass(false)} h-11`} />
        </FormField>
        <FormField id={`${id}-reexplained`} label="Times you explained the case again" hint="0 if never">
          <input id={`${id}-reexplained`} name="reexplained" inputMode="numeric" pattern="[0-9]*" className={`${inputClass(false)} h-11`} />
        </FormField>
      </div>
      {condition === "coere" ? (
        <FormField id={`${id}-helped`} label="How much did Coere help on this task?" hint="1 not at all, 5 a lot">
          <select id={`${id}-helped`} name="helped" defaultValue="" className={`${inputClass(false)} h-11 max-w-[200px]`}>
            <option value="">Skip</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </FormField>
      ) : null}
      <FormField id={`${id}-notes`} label="Anything that got in the way?" hint="Optional">
        <input id={`${id}-notes`} name="notes" maxLength={2000} className={`${inputClass(false)} h-11`} />
      </FormField>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className={buttonClass("primary", "disabled:opacity-60")}>
          {pending ? "Handing in" : submitted ? "Hand in again" : "Hand in"}
        </button>
        {submitted || state.done ? <span className="text-[14px] text-emerald-300">Handed in</span> : null}
      </div>
    </form>
  );
}
