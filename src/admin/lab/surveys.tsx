import type { LabAdminData } from "@/lib/admin/lab";
import { conditionOf } from "@/lib/lab/assign";
import { labCase } from "@/lib/lab/cases";
import { nps } from "@/lib/lab/summary";
import type { LabCondition } from "@/lib/lab/types";

import { Card, fmt, Stat } from "./card";

function avg(xs: unknown[]): number | null {
  const n = xs.filter((x): x is number => typeof x === "number");
  return n.length ? Math.round((n.reduce((s, x) => s + x, 0) / n.length) * 10) / 10 : null;
}

/** The surveys: the two shared questions by condition, Coere's own questions, and every comment. */
export function Surveys({ data }: { data: LabAdminData }) {
  const person = new Map(data.people.map((p) => [p.userId, p]));
  const tagged = data.surveys.flatMap((s) => {
    const p = person.get(s.userId);
    const condition = p ? conditionOf(p, s.caseId) : null;
    return condition ? [{ ...s, condition, username: p!.username }] : [];
  });
  const of = (c: LabCondition) => tagged.filter((s) => s.condition === c);
  const coere = of("coere");
  const recommend = coere.map((s) => s.answers.recommend).filter((x): x is number => typeof x === "number");
  const comments = tagged.filter((s) => typeof s.answers.friction === "string");
  return (
    <Card title={`Surveys (${tagged.length})`} line="1 to 5 scales. Recommend is a net promoter score from the Coere case only.">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        <Stat label="Context, with" value={fmt(avg(coere.map((s) => s.answers.context)))} n={coere.length} />
        <Stat label="Context, without" value={fmt(avg(of("baseline").map((s) => s.answers.context)))} n={of("baseline").length} />
        <Stat label="Switching, with" value={fmt(avg(coere.map((s) => s.answers.switching)))} />
        <Stat label="Switching, without" value={fmt(avg(of("baseline").map((s) => s.answers.switching)))} />
        <Stat label="Trust in Coere" value={fmt(avg(coere.map((s) => s.answers.trust)))} />
        <Stat label="Recommend (NPS)" value={fmt(nps(recommend))} n={recommend.length} />
      </div>
      <p className="mt-3 text-[12px] text-[color:var(--color-ink)]">{coere.filter((s) => s.answers.wrongContext === true).length} said Coere brought something wrong or unwanted into a chat.</p>
      {comments.length ? (
        <ul className="mt-3 space-y-1.5 border-t pt-3 text-[12.5px] text-[color:var(--color-ink)]" style={{ borderColor: "var(--color-border)" }}>
          {comments.map((s) => (
            <li key={`${s.userId}:${s.caseId}`}>
              <span className="text-[color:var(--color-muted)]">
                {s.username}, {labCase(s.caseId)?.name}, {s.condition === "coere" ? "with Coere" : "without"}:
              </span>{" "}
              {String(s.answers.friction)}
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
