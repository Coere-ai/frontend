import { labCase } from "@/lib/lab/cases";
import { conditionStats, pairedDeltas, type LabFlag } from "@/lib/lab/summary";
import type { LabCondition } from "@/lib/lab/types";

import { Card, fmt, signed, Stat } from "./card";

type Row = Parameters<typeof conditionStats>[0][number];

/**
 * With Coere against without, two ways: every hand in side by side, then the
 * same student on the same task shape, which is the number to quote. Flags
 * list the cases where Coere's own counts say the case did not run as assigned.
 */
export function Comparison({ rows, flags, nameOf }: { rows: Row[]; flags: LabFlag[]; nameOf: (id: string) => string }) {
  const paired = pairedDeltas(rows);
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {(["coere", "baseline"] as LabCondition[]).map((c) => {
        const s = conditionStats(rows, c);
        return (
          <Card key={c} title={c === "coere" ? "With Coere" : "Without Coere"} line={`${s.submitted} tasks handed in`}>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Median minutes" value={fmt(s.medianMinutes)} n={s.submitted} />
              <Stat label="Explained again" value={fmt(s.meanReexplained)} />
              <Stat label="Messages" value={fmt(s.meanMessages)} />
              <Stat label="Mean score" value={fmt(s.meanScore)} n={s.graded} />
            </div>
          </Card>
        );
      })}
      <Card title="Same student, same task" line="Coere minus without, averaged over matched tasks. Negative minutes means faster with Coere.">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Minutes" value={signed(paired.minutes)} n={paired.pairs} />
          <Stat label="Explained again" value={signed(paired.reexplained)} />
          <Stat label="Score" value={signed(paired.score)} n={paired.scorePairs} />
        </div>
        {flags.length ? (
          <ul className="mt-4 space-y-1 border-t pt-3 text-[12px] text-[color:var(--color-ink)]" style={{ borderColor: "var(--color-border)" }}>
            {flags.map((f) => (
              <li key={`${f.userId}:${f.caseId}`}>
                <span className="font-medium">{nameOf(f.userId)}</span> in {labCase(f.caseId)?.name ?? f.caseId}:{" "}
                {f.kind === "baseline_used_coere" ? `used Coere ${f.uses} times in the case without it` : "Coere never brought memory in"}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </div>
  );
}
