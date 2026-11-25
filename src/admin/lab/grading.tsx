import { gradeLabWorkAction } from "@/app/(app)/admin/lab/actions";
import { Button, fieldClass, fieldStyle } from "@/admin/controls";
import type { LabAdminData } from "@/lib/admin/lab";
import { labCase } from "@/lib/lab/cases";

import { Card } from "./card";

/**
 * Grading. Each hand in shows beside its task's rubric. The condition is
 * left off on purpose, so the score is not swayed by knowing which case ran
 * with Coere; the comparison above joins them back up.
 */
export function Grading({ data, onlyUngraded }: { data: LabAdminData; onlyUngraded: boolean }) {
  const nameOf = new Map(data.people.map((p) => [p.userId, p.username]));
  const handedIn = data.work.filter((w) => w.submittedAt && (!onlyUngraded || w.score === null));
  return (
    <Card
      title={`Hand ins to grade (${data.work.filter((w) => w.submittedAt && w.score === null).length} left)`}
      line="Score 0 to 100 against the rubric. The condition is hidden here so it cannot sway the grade."
    >
      <p className="mb-3 text-[12px]">
        <a href={onlyUngraded ? "/admin/lab?show=all" : "/admin/lab"} className="underline underline-offset-2">
          {onlyUngraded ? "Show graded ones too" : "Show only ungraded"}
        </a>
      </p>
      {handedIn.length === 0 ? <p className="text-[12.5px] text-[color:var(--color-muted)]">Nothing to grade.</p> : null}
      <ul className="space-y-3">
        {handedIn.map((w) => {
          const c = labCase(w.caseId);
          const t = c?.tasks.find((x) => x.id === w.taskId);
          return (
            <li key={`${w.userId}:${w.caseId}:${w.taskId}`} className="rounded-md border p-3" style={{ borderColor: "var(--color-border)" }}>
              <p className="text-[12.5px] font-medium text-[color:var(--color-ink)]">
                {nameOf.get(w.userId) ?? "?"}, {c?.name ?? w.caseId} {w.taskId.toUpperCase()}: {t?.title ?? ""}
              </p>
              <div className="mt-2 grid gap-3 md:grid-cols-[1fr_260px]">
                <details>
                  <summary className="cursor-pointer text-[12px] text-[color:var(--color-muted)]">Answer ({(w.answer ?? "").length} characters)</summary>
                  <pre className="mt-2 max-h-[360px] overflow-auto rounded bg-[color:var(--color-canvas-soft)] p-2 text-[11.5px] whitespace-pre-wrap">{w.answer}</pre>
                </details>
                <form action={gradeLabWorkAction} className="space-y-2">
                  <input type="hidden" name="userId" value={w.userId} />
                  <input type="hidden" name="caseId" value={w.caseId} />
                  <input type="hidden" name="taskId" value={w.taskId} />
                  <ul className="list-disc space-y-0.5 pl-4 text-[11.5px] text-[color:var(--color-ink)]">
                    {t?.rubric.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <input name="score" inputMode="numeric" defaultValue={w.score ?? ""} placeholder="0 to 100" aria-label="Score" className={`${fieldClass} w-[90px]`} style={fieldStyle} />
                    <Button strong>{w.score === null ? "Grade" : "Regrade"}</Button>
                  </div>
                  <input name="notes" defaultValue={w.scoreNotes ?? ""} placeholder="What it missed" aria-label="Grading notes" maxLength={2000} className={fieldClass} style={fieldStyle} />
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
